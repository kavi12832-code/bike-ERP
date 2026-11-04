import { BOOKING_STATUSES } from '../bookings/config';
import { runHoldExpiryCheck, calculateCancellationRefund, canConfirmBooking, getTokenSummary, isValidVin, getMinimumTokenPaise } from '../bookings/engine';
import { QUOTATION_STATUSES } from '../quotations/config';
import { runExpiryCheck, getSimulatedNow } from '../quotations/engine';
import { approvalsApi } from '../approvals/api';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createAuditEntry } from './auditMiddleware';
import { ROLE_PRESETS } from '../config/roles';
import { backend, syncToBackend } from '../services/api/backend';
import { createSyncEngine } from './sync';
import { setTaxRulesProvider } from '../lib/tax';
import {
  CATALOG_KEYS,
  COLLECTION_SLICES,
  OBJECT_RECORD_ID,
  OBJECT_SLICES,
  REST_SLICES,
  catalogCollection,
} from './syncConfig';


function nextBookingSequence(bookings) {
  return (
    bookings.reduce((max, b) => {
      const n = Number(String(b.bookingNumber || '').split('/').pop());
      return Number.isFinite(n) && n > max ? n : max;
    }, 0) + 1
  );
}

// Highest numeric suffix of VI/2627/NNNNN so new numbers never collide with existing ones.
function nextInvoiceSequence(invoices) {
  return (
    invoices.reduce((max, inv) => {
      const n = Number(String(inv.invoiceNumber || '').split('/').pop());
      return Number.isFinite(n) && n > max ? n : max;
    }, 0) + 1
  );
}

const replaceById = (list, item) => list.map((x) => (x.id === item.id ? { ...x, ...item } : x));

// JCYYYYMMDD-NNN, continuing today's sequence (the server issues the authoritative number).
function nextJobCardNumber(jobCards, now = new Date()) {
  const day = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const prefix = `JC${day}-`;
  const used = jobCards
    .map((jc) => jc.jobCardNumber || '')
    .filter((n) => n.startsWith(prefix))
    .map((n) => Number(n.slice(prefix.length)) || 0);
  return `${prefix}${String(Math.max(0, ...used) + 1).padStart(3, '0')}`;
}

/**
 * The app starts empty; everything is loaded from the API after login (hydrateFromBackend).
 * Demo data lives in the backend database (seed_demo), not in the browser bundle.
 */
export function emptyDataState() {
  const state = {
    dealership: {},
    activeBranchId: null,
    currentUser: null,
    catalogs: Object.fromEntries(CATALOG_KEYS.map((k) => [k, []])),
    bays: [],
    auditLogs: [],
    collections: {},
  };
  for (const slice of Object.keys(REST_SLICES)) state[slice] = [];
  for (const slice of Object.keys(COLLECTION_SLICES)) state[slice] = [];
  for (const slice of Object.keys(OBJECT_SLICES)) state[slice] = slice === 'dealership' ? {} : {};
  return state;
}

// Loads the demo seed only where there is no backend (unit tests / offline tooling).
async function loadSeed() {
  const { getInitialSeedData } = await import('../data/seed');
  return getInitialSeedData();
}

export const useAppStore = create(
  persist(
    (set, get) => ({
      ...emptyDataState(),
      backendStatus: backend.enabled() ? 'disconnected' : 'offline', // offline | disconnected | syncing | live | error
      lastSyncedAt: null,

      // Theme & UI state
      theme: 'light', // 'light' or 'dark'
      sidebarCollapsed: false,
      commandPaletteOpen: false,

      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      updateSettings: (patch) => set((state) => ({ settings: { ...(state.settings || {}), ...patch } })),
      // Re-reads everything from the server (data lives in the database, not the browser).
      resetDemoData: async () => {
        try {
          localStorage.removeItem('bikeerp_collapsed_nav_groups');
          localStorage.removeItem('bikeerp_pinned_nav_items');
        } catch {
          // storage unavailable
        }
        await get().refreshFromBackend();
      },
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

      // Auth & Branch Switcher
      // Offline/test only: with the backend, the role always comes from the signed-in account.
      loginAsRole: (rolePresetId) => {
        if (backend.enabled()) return;
        const found = ROLE_PRESETS.find((r) => r.id === rolePresetId) || ROLE_PRESETS[0];
        set({ currentUser: found });
      },
      setActiveBranch: (branchId) => {
        set({ activeBranchId: branchId });
      },

      // Backend (Django) session
      hydrateFromBackend: (data) => {
        const collections = { ...(data.collections || {}) };
        const take = (name) => {
          const items = collections[name] || [];
          delete collections[name];
          return items;
        };
        const patch = {};
        for (const slice of [...Object.keys(REST_SLICES), 'bays', 'auditLogs']) {
          if (Array.isArray(data[slice])) patch[slice] = data[slice];
        }
        for (const [slice, name] of Object.entries(COLLECTION_SLICES)) patch[slice] = take(name);
        for (const [slice, name] of Object.entries(OBJECT_SLICES)) {
          const record = take(name).find((r) => r.id === OBJECT_RECORD_ID);
          patch[slice] = record ? record.value : emptyDataState()[slice];
        }
        patch.catalogs = Object.fromEntries(CATALOG_KEYS.map((k) => [k, take(catalogCollection(k))]));
        patch.collections = collections; // page-level collections (useCollection)
        if (data.tenant) patch.dealership = { ...patch.dealership, name: patch.dealership?.name || data.tenant.name };

        const branches = patch.branches || get().branches;
        set({
          ...patch,
          ...(data.currentUser ? { currentUser: data.currentUser } : {}),
          activeBranchId: branches.some((b) => b.id === get().activeBranchId)
            ? get().activeBranchId
            : data.activeBranchId || branches[0]?.id || null,
          backendStatus: 'live',
          lastSyncedAt: new Date().toISOString(),
        });
        // What we just received is what the server has: start syncing local changes from here.
        syncEngine.start(get());
      },
      refreshFromBackend: async () => {
        if (!backend.enabled() || !backend.isLoggedIn()) return false;
        set({ backendStatus: 'syncing' });
        try {
          // Save pending local edits first so a refresh never overwrites them.
          if (syncEngine.isActive()) await syncEngine.flush();
          get().hydrateFromBackend(await backend.bootstrap());
          return true;
        } catch {
          set({ backendStatus: backend.isLoggedIn() ? 'error' : 'disconnected' });
          return false;
        }
      },
      logout: async () => {
        await syncEngine.flush();
        syncEngine.stop();
        await backend.logout();
        set({
          ...emptyDataState(),
          backendStatus: backend.enabled() ? 'disconnected' : 'offline',
          lastSyncedAt: null,
        });
      },
      // Page-level module data (see hooks/useCollection.js).
      setCollection: (name, items) =>
        set((state) => ({ collections: { ...state.collections, [name]: items } })),

      // Audit Logging Action
      logAudit: (action, entityType, entityId, oldValue, newValue) => {
        const user = get().currentUser;
        const entry = createAuditEntry({
          userId: user?.id || 'system',
          userName: user?.name || 'System',
          userRole: user?.role || 'System',
          action,
          entityType,
          entityId,
          oldValue,
          newValue,
        });
        set((state) => ({ auditLogs: [entry, ...state.auditLogs] }));
      },

      // Leads Actions
      addLead: (leadData) => {
        const newLead = {
          id: `lead-${Date.now()}`,
          createdAt: new Date().toISOString(),
          stage: 'ENQUIRY',
          ...leadData,
        };
        set((state) => ({ leads: [newLead, ...state.leads] }));
        get().logAudit('LEAD_CREATED', 'LEAD', newLead.id, null, newLead);
        return newLead;
      },
      updateLeadStage: (leadId, newStage) => {
        const state = get();
        const oldLead = state.leads.find((l) => l.id === leadId);
        if (!oldLead) return;

        set({
          leads: state.leads.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l)),
        });
        get().logAudit('LEAD_STAGE_UPDATED', 'LEAD', leadId, { stage: oldLead.stage }, { stage: newStage });
      },

      // Quotations Actions
      addQuotation: (quotation) => {
        set((state) => ({ quotations: [quotation, ...state.quotations] }));
        get().logAudit('QUOTATION_CREATED', 'QUOTATION', quotation.id, null, quotation);
      },
      updateQuotation: (quotationId, patch) => {
        const state = get();
        const old = state.quotations.find((q) => q.id === quotationId);
        if (!old) return;
        const updated = { ...old, ...patch, updatedAt: new Date().toISOString() };
        set({
          quotations: state.quotations.map((q) => (q.id === quotationId ? updated : q)),
        });
        get().logAudit('QUOTATION_UPDATED', 'QUOTATION', quotationId, old, updated);
      },
      renewQuotation: (quotationId) => {
        const state = get();
        const old = state.quotations.find((q) => q.id === quotationId);
        if (!old) return null;
        const rev = (old.revision || 1) + 1;
        const newValidity = new Date(Date.now() + 7 * 86400000).toISOString();
        const newQuotation = {
          ...old,
          id: `qt-${Date.now()}`,
          quotationNumber: `${old.quotationNumber.split('-R')[0]}-R${rev}`,
          revision: rev,
          status: QUOTATION_STATUSES.APPROVED,
          validUntil: newValidity,
          createdAt: new Date().toISOString(),
          history: [
            ...(old.history || []),
            {
              timestamp: new Date().toISOString(),
              action: 'QUOTATION_RENEWED',
              performedBy: state.currentUser?.name || 'Staff',
              notes: `Renewed from ${old.quotationNumber} with new 7-day validity`,
            },
          ],
        };
        set((s) => ({ quotations: [newQuotation, ...s.quotations] }));
        get().logAudit('QUOTATION_RENEWED', 'QUOTATION', newQuotation.id, { from: old.id }, newQuotation);
        return newQuotation;
      },
      cancelQuotation: (quotationId, reason = 'Cancelled by customer') => {
        const state = get();
        const old = state.quotations.find((q) => q.id === quotationId);
        if (!old) return;
        const updated = {
          ...old,
          status: QUOTATION_STATUSES.CANCELLED,
          cancelReason: reason,
          cancelledAt: new Date().toISOString(),
          history: [
            ...(old.history || []),
            {
              timestamp: new Date().toISOString(),
              action: 'QUOTATION_CANCELLED',
              performedBy: state.currentUser?.name || 'Staff',
              notes: reason,
            },
          ],
        };
        set({
          quotations: state.quotations.map((q) => (q.id === quotationId ? updated : q)),
        });
        get().logAudit('QUOTATION_CANCELLED', 'QUOTATION', quotationId, { status: old.status }, { status: QUOTATION_STATUSES.CANCELLED, reason });
      },
      convertQuotationToBooking: (quotationId, bookingOverrides = {}) => {
        const state = get();
        const q = state.quotations.find((item) => item.id === quotationId);
        if (!q) throw new Error('Quotation not found');

        const bookingCount = state.bookings.length + 1;
        const bookingId = `bk-2627-${String(bookingCount).padStart(3, '0')}`;
        const bookingNumber = `BK/2627/${String(bookingCount).padStart(5, '0')}`;

        const newBooking = {
          id: bookingId,
          bookingNumber,
          quotationId: q.id,
          customerId: q.customerId || `cust-${Date.now()}`,
          customerName: q.customerName,
          phone: q.phone,
          email: q.email,
          branchId: q.branchId || state.activeBranchId,
          modelId: q.modelId,
          modelName: q.modelName,
          variantName: q.variantName,
          colorName: q.colorName,
          tokenAmountPaise: bookingOverrides.tokenAmountPaise || 1500000,
          paymentMode: bookingOverrides.paymentMode || 'UPI',
          paymentRef: bookingOverrides.paymentRef || `UPI-${Date.now().toString().slice(-8)}`,
          allocatedUnitId: null,
          allocatedChassisNumber: null,
          allocatedEngineNumber: null,
          totalOnRoadPaise: q.netAmountPaise || q.netOnRoadPricePaise,
          status: 'CONFIRMED',
          bookingDate: new Date().toISOString(),
          tentativeDeliveryDate: new Date(Date.now() + 5 * 86400000).toISOString(),
          salesExecutive: q.salespersonName || state.currentUser?.name || 'Deepak Rao',
        };

        const updatedQuotation = {
          ...q,
          status: QUOTATION_STATUSES.CONVERTED,
          bookingId,
          history: [
            ...(q.history || []),
            {
              timestamp: new Date().toISOString(),
              action: 'CONVERTED_TO_BOOKING',
              performedBy: state.currentUser?.name || 'Staff',
              notes: `Converted to Booking ${bookingNumber}`,
            },
          ],
        };

        set({
          quotations: state.quotations.map((item) => (item.id === quotationId ? updatedQuotation : item)),
          bookings: [newBooking, ...state.bookings],
        });

        get().logAudit('QUOTATION_CONVERTED', 'QUOTATION', quotationId, null, { bookingId, bookingNumber });
        get().logAudit('BOOKING_CREATED', 'BOOKING', bookingId, null, newBooking);

        return { booking: newBooking, quotation: updatedQuotation };
      },
      expireQuotationsCatchup: () => {
        const state = get();
        const { updated, hasChanges } = runExpiryCheck(state.quotations, getSimulatedNow());
        if (hasChanges) {
          set({ quotations: updated });
        }
      },
      updateDiscountStatus: (quotationId, status, approverName) => {
        const state = get();
        const old = state.quotations.find((q) => q.id === quotationId);
        set({
          quotations: state.quotations.map((q) =>
            q.id === quotationId ? { ...q, discountStatus: status, approvedBy: approverName } : q
          ),
        });
        get().logAudit('DISCOUNT_APPROVAL_STATUS', 'QUOTATION', quotationId, { status: old?.discountStatus }, { status });
      },

      // Bookings & Allocation Actions (Single-unit rule, atomic allocation)
      addBooking: (bookingData) => {
        const state = get();
        const nextSeq = nextBookingSequence(state.bookings);
        const bookingNumber = `BK/2627/${String(nextSeq).padStart(5, '0')}`;
        const bookingId = `bk-2627-${String(nextSeq).padStart(3, '0')}`;

        // The booking form sends customerPhone / colour / variant / tokenPaidPaise; older callers send
        // phone / colorName / variantName / tokenAmountPaise. Accept both.
        const branch =
          state.branches.find((b) => b.id === bookingData.branchId) ||
          state.branches.find((b) => b.name === bookingData.branchName) ||
          state.branches.find((b) => b.id === state.activeBranchId);
        const tokenPaidPaise = Number(bookingData.tokenAmountPaise ?? bookingData.tokenPaidPaise ?? 0);
        const catalogBike = (state.catalogs?.bikes || []).find(
          (bike) => bike.id === bookingData.modelId || `${bike.brand} ${bike.model}` === bookingData.modelName || bike.model === bookingData.modelName
        );
        const now = new Date().toISOString();
        const newBooking = {
          id: bookingId,
          bookingNumber,
          customerId: bookingData.customerId || `cust-${Date.now()}`,
          customerName: bookingData.customerName,
          phone: bookingData.phone || bookingData.customerPhone || '',
          email: bookingData.email || bookingData.customerEmail || '',
          deliveryAddress: bookingData.deliveryAddress || '',
          branchId: branch?.id || state.activeBranchId,
          branchName: branch?.name || bookingData.branchName || '',
          salespersonId: bookingData.salespersonId || state.currentUser?.id || null,
          salespersonName: bookingData.salespersonName || state.currentUser?.name || '',
          salesExecutive: bookingData.salesExecutive || state.currentUser?.name || '',
          quotationId: bookingData.quotationId || null,
          leadId: bookingData.leadId || null,
          modelId: bookingData.modelId,
          modelName: bookingData.modelName,
          variantName: bookingData.variantName || bookingData.variant || '',
          colorName: bookingData.colorName || bookingData.colour || '',
          tokenRequiredPaise: bookingData.tokenRequiredPaise || getMinimumTokenPaise(bookingData.modelName),
          tokenAmountPaise: tokenPaidPaise,
          tokenPayments:
            bookingData.tokenPayments ||
            (tokenPaidPaise > 0
              ? [{
                  receiptNo: `RCP-${String(nextSeq).padStart(5, '0')}-1`,
                  amountPaise: tokenPaidPaise,
                  mode: bookingData.paymentMode || 'UPI',
                  reference: bookingData.paymentRef || '',
                  date: now,
                  status: 'CLEARED',
                }]
              : []),
          allocatedChassisNumber: null,
          allocation: null,
          totalOnRoadPaise: bookingData.totalOnRoadPaise || catalogBike?.exShowroomPaise || 0,
          status: bookingData.status || BOOKING_STATUSES.PENDING,
          bookingDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          tentativeDeliveryDate: bookingData.tentativeDeliveryDate || new Date(Date.now() + 5 * 86400000).toISOString(),
          estDelivery: bookingData.estDelivery || bookingData.tentativeDeliveryDate || new Date(Date.now() + 5 * 86400000).toISOString(),
          deliveredAt: null,
          cancellation: null,
          history: [
            {
              timestamp: new Date().toISOString(),
              action: 'BOOKING_CREATED',
              performedBy: state.currentUser?.name || 'Staff',
              notes: `Created reservation ${bookingNumber} for ${bookingData.customerName}`,
            },
          ],
        };

        // Create synced delivery calendar event
        const deliveryEvent = {
          id: `task-del-${bookingId}`,
          title: `Delivery - ${bookingNumber}`,
          dueDate: newBooking.estDelivery,
          category: 'Delivery',
          status: 'PENDING',
          assignedTo: newBooking.salesExecutive,
          bookingId,
          notes: `Customer handover: ${newBooking.customerName} (${newBooking.modelName})`,
        };

        set((s) => ({
          bookings: [newBooking, ...s.bookings],
          tasks: [deliveryEvent, ...(s.tasks || [])],
        }));

        get().logAudit('BOOKING_CREATED', 'BOOKING', bookingId, null, newBooking);
        if (bookingData.allocatedVin) {
          get().allocateChassisToBooking(bookingId, bookingData.allocatedVin);
        }
        return get().bookings.find((b) => b.id === bookingId) || newBooking;
      },

      updateBooking: (bookingId, patch) => {
        const state = get();
        const old = state.bookings.find((b) => b.id === bookingId);
        if (!old) return;
        const updated = {
          ...old,
          ...patch,
          history: [
            ...(old.history || []),
            {
              timestamp: new Date().toISOString(),
              action: 'BOOKING_UPDATED',
              performedBy: state.currentUser?.name || 'Staff',
              notes: 'Booking details updated',
            },
          ],
        };

        // Keep delivery calendar task in sync
        const newDeliveryDate = patch.estDelivery || patch.tentativeDeliveryDate;
        let updatedTasks = state.tasks || [];
        if (newDeliveryDate) {
          updatedTasks = updatedTasks.map((t) =>
            t.bookingId === bookingId ? { ...t, dueDate: newDeliveryDate } : t
          );
        }

        set({
          bookings: state.bookings.map((b) => (b.id === bookingId ? updated : b)),
          tasks: updatedTasks,
        });

        get().logAudit('BOOKING_UPDATED', 'BOOKING', bookingId, old, updated);
      },

      recordTokenPayment: (bookingId, paymentData) => {
        const state = get();
        const b = state.bookings.find((item) => item.id === bookingId);
        if (!b) throw new Error('Booking not found');

        const receiptNo = `RCP-${b.bookingNumber?.slice(-5) || '00001'}-${(b.tokenPayments || []).length + 1}`;
        const newPayment = {
          receiptNo,
          amountPaise: paymentData.amountPaise || Number(paymentData.amountRupees) * 100,
          mode: paymentData.mode || 'UPI',
          reference: paymentData.reference || `UPI-${Date.now().toString().slice(-8)}`,
          date: new Date().toISOString(),
          status: 'CLEARED',
        };

        const updatedPayments = [...(b.tokenPayments || []), newPayment];
        const totalClearedPaise = updatedPayments.reduce((sum, p) => sum + (p.amountPaise || 0), 0);

        const updatedBooking = {
          ...b,
          tokenAmountPaise: totalClearedPaise,
          tokenPayments: updatedPayments,
          history: [
            ...(b.history || []),
            {
              timestamp: new Date().toISOString(),
              action: 'TOKEN_PAYMENT_RECORDED',
              performedBy: state.currentUser?.name || 'Staff',
              notes: `Recorded token payment receipt ${receiptNo} of ₹ ${Math.round(newPayment.amountPaise / 100).toLocaleString('en-IN')}`,
            },
          ],
        };

        set({
          bookings: state.bookings.map((item) => (item.id === bookingId ? updatedBooking : item)),
        });

        get().logAudit('TOKEN_PAYMENT_RECORDED', 'BOOKING', bookingId, null, newPayment);
        return { booking: updatedBooking, receipt: newPayment };
      },

      allocateChassisToBooking: (arg1, arg2, { isHold = false, holdHours = 48, reason = '' } = {}) => {
        let bookingId = arg1;
        let vinInput = arg2;
        if (typeof arg1 === 'string' && arg1.length === 17 && typeof arg2 === 'string' && (arg2.startsWith('bk-') || arg2.startsWith('BK-'))) {
          vinInput = arg1;
          bookingId = arg2;
        }
        const state = get();
        const vin = (vinInput || '').trim().toUpperCase();

        if (!isValidVin(vin)) {
          throw new Error(`VIN ${vin} is invalid. A valid VIN must be exactly 17 characters (excluding I, O, Q).`);
        }

        // 1. Verify unit exists in stock
        const unit = state.vehicleStock.find((v) => (v.vin || v.chassisNumber) === vin);
        if (!unit) {
          throw new Error(`Chassis ${vin} was not found in vehicle inventory.`);
        }

        // 2. Strict Single-Unit Rule: Block double-allocation
        if (unit.allocatedBookingId && unit.allocatedBookingId !== bookingId) {
          throw new Error(
            `Chassis ${vin} is already allocated to Active Booking ${unit.allocatedBookingId}. Single-unit rule prevents double allocation.`
          );
        }

        const booking = state.bookings.find((b) => b.id === bookingId);
        if (!booking) throw new Error('Booking not found');

        const previousVin = booking.allocatedChassisNumber || booking.allocation?.vin;
        const now = new Date();
        const holdUntil = isHold ? new Date(now.getTime() + holdHours * 3600000).toISOString() : null;

        const newStockStatus = isHold ? 'HELD' : 'ALLOCATED';

        const updatedUnit = {
          ...unit,
          status: newStockStatus,
          allocatedBookingId: bookingId,
          holdUntil,
        };

        const updatedAllocation = {
          vin,
          status: isHold ? 'Held' : 'Allocated',
          allocatedAt: now.toISOString(),
          allocatedBy: state.currentUser?.name || 'Staff',
          holdUntil,
          reason,
        };

        const updatedBooking = {
          ...booking,
          allocatedChassisNumber: isHold ? null : vin,
          allocation: updatedAllocation,
          history: [
            ...(booking.history || []),
            {
              timestamp: now.toISOString(),
              action: isHold ? 'CHASSIS_HELD' : 'CHASSIS_ALLOCATED',
              performedBy: state.currentUser?.name || 'Staff',
              notes: isHold
                ? `48-hour temporary hold placed on chassis ${vin}`
                : (previousVin ? `Reallocated chassis from ${previousVin} to ${vin}. Reason: ${reason || 'Customer model/colour preference'}` : `Chassis ${vin} allocated`),
            },
          ],
        };

        set({
          vehicleStock: state.vehicleStock.map((v) => {
            const vVin = v.vin || v.chassisNumber;
            if (vVin === vin) return updatedUnit;
            if (previousVin && vVin === previousVin) {
              return { ...v, status: 'IN_STOCK', allocatedBookingId: null, holdUntil: null };
            }
            return v;
          }),
          bookings: state.bookings.map((b) => (b.id === bookingId ? updatedBooking : b)),
        });

        get().logAudit(isHold ? 'CHASSIS_HELD' : 'CHASSIS_ALLOCATED', 'BOOKING', bookingId, { previousVin }, updatedAllocation);
        return { booking: updatedBooking, unit: updatedUnit };
      },

      deallocateChassis: (bookingId) => {
        const state = get();
        const booking = state.bookings.find((b) => b.id === bookingId);
        if (!booking) return;

        const vin = booking.allocatedChassisNumber || booking.allocation?.vin;
        if (!vin) return;

        set({
          vehicleStock: state.vehicleStock.map((v) => {
            const vVin = v.vin || v.chassisNumber;
            if (vVin === vin) return { ...v, status: 'IN_STOCK', allocatedBookingId: null, holdUntil: null };
            return v;
          }),
          bookings: state.bookings.map((b) =>
            b.id === bookingId
              ? {
                  ...b,
                  allocatedChassisNumber: null,
                  allocation: null,
                  history: [
                    ...(b.history || []),
                    {
                      timestamp: new Date().toISOString(),
                      action: 'CHASSIS_RELEASED',
                      performedBy: state.currentUser?.name || 'Staff',
                      notes: `Released chassis ${vin} back to stock inventory`,
                    },
                  ],
                }
              : b
          ),
        });

        get().logAudit('CHASSIS_RELEASED', 'BOOKING', bookingId, { vin }, null);
      },

      confirmBooking: (bookingId) => {
        const state = get();
        const b = state.bookings.find((item) => item.id === bookingId);
        if (!b) throw new Error('Booking not found');

        const check = canConfirmBooking(b);
        if (!check.canConfirm) {
          throw new Error(check.reasons.join('; '));
        }

        const vin = b.allocation?.vin || b.allocatedChassisNumber;
        const now = new Date();

        // Promote held allocation to final Confirmed allocation
        const updatedAllocation = {
          ...(b.allocation || {}),
          vin,
          status: 'Allocated',
          holdUntil: null,
          confirmedAt: now.toISOString(),
        };

        const updatedBooking = {
          ...b,
          status: BOOKING_STATUSES.CONFIRMED,
          allocatedChassisNumber: vin,
          allocation: updatedAllocation,
          history: [
            ...(b.history || []),
            {
              timestamp: now.toISOString(),
              action: 'BOOKING_CONFIRMED',
              performedBy: state.currentUser?.name || 'Staff',
              notes: 'Booking confirmed with cleared token deposit and chassis allocation',
            },
          ],
        };

        set({
          bookings: state.bookings.map((item) => (item.id === bookingId ? updatedBooking : item)),
          vehicleStock: state.vehicleStock.map((v) => {
            const vVin = v.vin || v.chassisNumber;
            if (vVin === vin) return { ...v, status: 'ALLOCATED', allocatedBookingId: bookingId, holdUntil: null };
            return v;
          }),
        });

        get().logAudit('BOOKING_CONFIRMED', 'BOOKING', bookingId, { status: b.status }, { status: BOOKING_STATUSES.CONFIRMED });
        return updatedBooking;
      },

      deliverBooking: (bookingId, { remarks = '' } = {}) => {
        const state = get();
        const b = state.bookings.find((item) => item.id === bookingId);
        if (!b) throw new Error('Booking not found');

        const vin = b.allocatedChassisNumber || b.allocation?.vin;
        const now = new Date();

        const updatedBooking = {
          ...b,
          status: BOOKING_STATUSES.DELIVERED,
          deliveredAt: now.toISOString(),
          history: [
            ...(b.history || []),
            {
              timestamp: now.toISOString(),
              action: 'VEHICLE_DELIVERED',
              performedBy: state.currentUser?.name || 'Delivery Desk',
              notes: remarks || 'Customer delivery and handover completed with full statutory clearance',
            },
          ],
        };

        set({
          bookings: state.bookings.map((item) => (item.id === bookingId ? updatedBooking : item)),
          vehicleStock: state.vehicleStock.map((v) => {
            const vVin = v.vin || v.chassisNumber;
            if (vVin === vin) return { ...v, status: 'DELIVERED', allocatedBookingId: bookingId };
            return v;
          }),
          // Mark delivery task as COMPLETED
          tasks: (state.tasks || []).map((t) =>
            t.bookingId === bookingId ? { ...t, status: 'COMPLETED' } : t
          ),
        });

        get().logAudit('VEHICLE_DELIVERED', 'BOOKING', bookingId, null, { deliveredAt: now.toISOString() });
        return updatedBooking;
      },

      /** Deletes a booking (not delivered ones) and releases any chassis it held. */
      deleteBooking: (bookingId) => {
        const state = get();
        const booking = state.bookings.find((b) => b.id === bookingId);
        if (!booking) throw new Error('Booking not found');
        if (String(booking.status).toUpperCase() === 'DELIVERED') {
          throw new Error('A delivered booking cannot be deleted; it is part of the sales record.');
        }
        set({
          bookings: state.bookings.filter((b) => b.id !== bookingId),
          vehicleStock: state.vehicleStock.map((u) =>
            u.allocatedBookingId === bookingId ? { ...u, status: 'IN_STOCK', allocatedBookingId: null } : u
          ),
        });
        get().logAudit('BOOKING_DELETED', 'BOOKING', bookingId, booking, null);
      },
      cancelBooking: (bookingId, reason = 'Customer request') => {
        const state = get();
        const b = state.bookings.find((item) => item.id === bookingId);
        if (!b) throw new Error('Booking not found');

        const vin = b.allocatedChassisNumber || b.allocation?.vin;
        const refundCalc = calculateCancellationRefund(b);
        const now = new Date();

        const cancellation = {
          reason,
          cancelledAt: now.toISOString(),
          refundPaise: refundCalc.refundPaise,
          refundStatus: refundCalc.refundPaise > 0 ? 'PROCESSED' : 'NONE',
          deductionPaise: refundCalc.deductionPaise,
        };

        const updatedBooking = {
          ...b,
          status: BOOKING_STATUSES.CANCELLED,
          cancellation,
          history: [
            ...(b.history || []),
            {
              timestamp: now.toISOString(),
              action: 'BOOKING_CANCELLED',
              performedBy: state.currentUser?.name || 'Staff',
              notes: `Reservation cancelled. Reason: ${reason}. Refund ₹ ${refundCalc.refundRupees.toLocaleString('en-IN')}`,
            },
          ],
        };

        set({
          bookings: state.bookings.map((item) => (item.id === bookingId ? updatedBooking : item)),
          vehicleStock: state.vehicleStock.map((v) => {
            const vVin = v.vin || v.chassisNumber;
            if (vVin === vin) {
              return { ...v, status: 'IN_STOCK', allocatedBookingId: null, holdUntil: null };
            }
            return v;
          }),
          tasks: (state.tasks || []).map((t) =>
            t.bookingId === bookingId ? { ...t, status: 'CANCELLED' } : t
          ),
        });

        get().logAudit('BOOKING_CANCELLED', 'BOOKING', bookingId, { status: b.status }, cancellation);
        return { booking: updatedBooking, refund: refundCalc };
      },

      expireHoldsCatchup: () => {
        const state = get();
        const { updatedBookings, updatedStock, hasChanges } = runHoldExpiryCheck(
          state.bookings,
          state.vehicleStock,
          getSimulatedNow()
        );
        if (hasChanges) {
          set({ bookings: updatedBookings, vehicleStock: updatedStock });
        }
      },
      addCustomer: (customerData) => {
        const id = 'cust-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
        const newCustomer = {
          id,
          name: '',
          phone: '',
          email: '',
          address: '',
          city: 'Bangalore',
          state: 'Karnataka',
          stateCode: '29',
          pincode: '560001',
          gstin: null,
          loyaltyTier: 'Silver',
          loyaltyPoints: 0,
          ltvPaise: 0,
          csatScore: 5,
          churnRisk: 'LOW',
          consent: {
            marketingWhatsapp: true,
            serviceReminders: true,
            promotionalSms: false,
            updatedAt: new Date().toISOString(),
          },
          documents: [],
          vehicles: [],
          createdAt: new Date().toISOString(),
          ...customerData,
        };
        set((state) => ({ customers: [newCustomer, ...(state.customers || [])] }));
        get().logAudit('CUSTOMER_CREATED', 'CUSTOMER', id, null, newCustomer);
        return newCustomer;
      },
      updateCustomer: (customerId, patch) => {
        const old = (get().customers || []).find((c) => c.id === customerId);
        set((state) => ({
          customers: (state.customers || []).map((c) => (c.id === customerId ? { ...c, ...patch } : c)),
        }));
        get().logAudit('CUSTOMER_UPDATED', 'CUSTOMER', customerId, old, patch);
      },
      deleteCustomer: (customerId) => {
        const old = (get().customers || []).find((c) => c.id === customerId);
        set((state) => ({
          customers: (state.customers || []).filter((c) => c.id !== customerId),
        }));
        get().logAudit('CUSTOMER_DELETED', 'CUSTOMER', customerId, old, null);
      },
      updateAppointment: (appointmentId, patch) => {
        const old = (get().appointments || []).find((a) => a.id === appointmentId);
        set((state) => ({
          appointments: (state.appointments || []).map((a) =>
            a.id === appointmentId ? { ...a, ...patch } : a
          ),
        }));
        get().logAudit('APPOINTMENT_UPDATED', 'APPOINTMENT', appointmentId, old, patch);
      },
      addBranch: (branch) => {
        const newBranch = {
          id: `br-${Date.now().toString(36)}`,
          stateCode: '29',
          isHeadquarters: false,
          ...branch,
        };
        set((state) => ({ branches: [...state.branches, newBranch] }));
        get().logAudit('BRANCH_ADDED', 'BRANCH', newBranch.id, null, newBranch);
        return newBranch;
      },
      updateBranch: (branchId, patch) => {
        const old = get().branches.find((b) => b.id === branchId);
        set((state) => ({
          branches: state.branches.map((b) => (b.id === branchId ? { ...b, ...patch } : b)),
        }));
        get().logAudit('BRANCH_UPDATED', 'BRANCH', branchId, old, patch);
      },
      deleteBranch: (branchId) => {
        const old = get().branches.find((b) => b.id === branchId);
        set((state) => ({
          branches: state.branches.filter((b) => b.id !== branchId),
        }));
        get().logAudit('BRANCH_DELETED', 'BRANCH', branchId, old, null);
      },

      // Service appointments & job card form
      /** Books a workshop slot. With the backend connected it waits for the server (slot capacity, Sunday rule). */
      bookAppointment: async (appointment) => {
        let newApt = { id: `apt-${Date.now()}`, status: 'CONFIRMED', jobCardId: null, ...appointment };
        if (backend.enabled() && backend.isLoggedIn()) {
          newApt = await backend.createAppointment(newApt);
        }
        set((state) => ({ appointments: [...(state.appointments || []), newApt] }));
        syncEngine.markRecordClean('appointments', newApt); // already saved by the call above
        get().logAudit('APPOINTMENT_BOOKED', 'APPOINTMENT', newApt.id, null, newApt);
        return newApt;
      },
      /** Deletes an appointment that has not become a job card yet. */
      deleteAppointment: (appointmentId) => {
        const apt = (get().appointments || []).find((a) => a.id === appointmentId);
        if (!apt) return;
        if (apt.jobCardId && get().jobCards.some((jc) => jc.id === apt.jobCardId)) {
          throw new Error(`Checked in on job card ${apt.jobCardId}. Delete or edit the job card instead.`);
        }
        set((state) => ({ appointments: state.appointments.filter((a) => a.id !== appointmentId) }));
        get().logAudit('APPOINTMENT_DELETED', 'APPOINTMENT', appointmentId, apt, null);
      },
      /** Deletes a job card, frees its bay and reopens the appointment it came from. */
      deleteJobCard: (jobCardId) => {
        const state = get();
        const card = state.jobCards.find((jc) => jc.id === jobCardId);
        if (!card) return;
        if (['READY', 'DELIVERED'].includes(card.stage) && card.grandTotalPaise) {
          throw new Error('A completed, billed job card cannot be deleted.');
        }
        set({
          jobCards: state.jobCards.filter((jc) => jc.id !== jobCardId),
          bays: state.bays.map((bay) =>
            bay.activeJobCardId === jobCardId
              ? { ...bay, status: 'FREE', activeJobCardId: null, vehicleRegistration: null, modelName: null,
                  technicianId: null, technicianName: null, startedAt: null, slaStatus: 'NORMAL' }
              : bay
          ),
          appointments: (state.appointments || []).map((a) =>
            a.jobCardId === jobCardId ? { ...a, status: 'CONFIRMED', jobCardId: null } : a
          ),
        });
        get().logAudit('JOBCARD_DELETED', 'JOB_CARD', jobCardId, card, null);
      },
      cancelAppointment: (appointmentId) => {
        const apt = (get().appointments || []).find((a) => a.id === appointmentId);
        if (!apt) return;
        if (apt.status === 'CHECKED_IN') throw new Error('A checked-in appointment cannot be cancelled');
        set((state) => ({
          appointments: state.appointments.map((a) => (a.id === appointmentId ? { ...a, status: 'CANCELLED' } : a)),
        }));
        get().logAudit('APPOINTMENT_CANCELLED', 'APPOINTMENT', appointmentId, { status: apt.status }, { status: 'CANCELLED' });
      },
      /**
       * Saves the Create Job Card form. `stage: 'DRAFT'` keeps it as a draft; any other stage creates the card and
       * checks its appointment (if any) in. With the backend connected this waits for the server so field errors
       * (ApiError.body) reach the form; offline it saves locally. Resolves to the saved card.
       */
      saveJobCard: async (form, existingId = null) => {
        const state = get();
        const now = new Date().toISOString();
        const existing = existingId ? state.jobCards.find((jc) => jc.id === existingId) : null;
        const isDraft = form.stage === 'DRAFT';
        let card = {
          ...existing,
          ...form,
          id: existing?.id || `jc-${Date.now()}`,
          jobCardNumber: existing?.jobCardNumber || nextJobCardNumber(state.jobCards),
          branchId: existing?.branchId || state.activeBranchId,
          createdAt: existing?.createdAt || now,
          inAt: form.inAt || (isDraft ? null : now),
        };

        if (backend.enabled() && backend.isLoggedIn()) {
          const { id, jobCardNumber, createdAt, ...payload } = card;
          card = existing ? await backend.updateJobCard(id, payload) : await backend.createJobCard({ id, ...payload });
        }

        const linkAppointment = !isDraft && card.appointmentId;
        set((s) => ({
          jobCards: existing ? s.jobCards.map((jc) => (jc.id === card.id ? card : jc)) : [card, ...s.jobCards],
          ...(linkAppointment
            ? {
                appointments: (s.appointments || []).map((a) =>
                  a.id === card.appointmentId ? { ...a, status: 'CHECKED_IN', jobCardId: card.id } : a
                ),
              }
            : {}),
        }));
        // The server already has this card (and linked the appointment) via the calls above.
        syncEngine.markRecordClean('jobCards', card);
        if (linkAppointment) {
          const apt = get().appointments.find((a) => a.id === card.appointmentId);
          if (apt) syncEngine.markRecordClean('appointments', apt);
        }
        get().logAudit(isDraft ? 'JOBCARD_DRAFT_SAVED' : 'JOBCARD_CREATED', 'JOB_CARD', card.id,
          existing ? { stage: existing.stage } : null, { jobCardNumber: card.jobCardNumber, stage: card.stage });
        return card;
      },

      // Job Cards & Service Bay Actions
      updateJobCardStage: (jobCardId, stage, additional = {}) => {
        const state = get();
        const oldCard = state.jobCards.find((jc) => jc.id === jobCardId);
        if (!oldCard) return;

        const updatedCard = { ...oldCard, stage, ...additional };
        set({
          jobCards: state.jobCards.map((jc) => (jc.id === jobCardId ? updatedCard : jc)),
        });
        get().logAudit('JOBCARD_STAGE_UPDATED', 'JOB_CARD', jobCardId, { stage: oldCard.stage }, { stage });
      },

      assignBayToJobCard: (bayNumber, jobCardId) => {
        const state = get();
        const card = state.jobCards.find((jc) => jc.id === jobCardId);
        if (!card) throw new Error(`Job card ${jobCardId} not found`);
        const branchId = state.activeBranchId;
        const inBranch = (bay) => !bay.branchId || bay.branchId === branchId;
        const target = state.bays.find((bay) => bay.bayNumber === bayNumber && inBranch(bay));
        if (!target) throw new Error(`Bay #${bayNumber} not found`);
        if (target.status === 'MAINTENANCE') throw new Error(`Bay #${bayNumber} is under maintenance`);
        if (target.activeJobCardId && target.activeJobCardId !== jobCardId) {
          throw new Error(`Bay #${bayNumber} is already occupied by another job card`);
        }
        const freedBay = {
          status: 'FREE',
          activeJobCardId: null,
          vehicleRegistration: null,
          modelName: null,
          technicianId: null,
          technicianName: null,
          startedAt: null,
          slaStatus: 'NORMAL',
        };

        set({
          bays: state.bays.map((bay) =>
            !inBranch(bay)
              ? bay
              : bay.activeJobCardId === jobCardId && bay.bayNumber !== bayNumber
              ? { ...bay, ...freedBay }
              : bay.bayNumber === bayNumber
              ? {
                  ...bay,
                  status: 'OCCUPIED',
                  activeJobCardId: jobCardId,
                  vehicleRegistration: card.registrationNumber,
                  modelName: card.modelName,
                  technicianId: card.technicianId || null,
                  technicianName: card.technicianName || null,
                  startedAt: new Date().toISOString(),
                  slaStatus: 'NORMAL',
                }
              : bay
          ),
          jobCards: state.jobCards.map((jc) => (jc.id === jobCardId ? { ...jc, bayNumber } : jc)),
        });
        get().logAudit('BAY_ALLOCATED', 'SERVICE_BAY', `bay-${bayNumber}`, null, { bayNumber, jobCardId });
        syncToBackend('Bay allocation', () => backend.assignBay(bayNumber, jobCardId, branchId));
      },

      releaseBay: (bayNumber) => {
        const branchId = get().activeBranchId;
        const inBranch = (bay) => !bay.branchId || bay.branchId === branchId;
        const released = get().bays.find((bay) => bay.bayNumber === bayNumber && inBranch(bay));
        set((state) => ({
          jobCards: state.jobCards.map((jc) =>
            released?.activeJobCardId && jc.id === released.activeJobCardId ? { ...jc, bayNumber: null } : jc
          ),
          bays: state.bays.map((bay) =>
            bay.bayNumber === bayNumber && inBranch(bay)
              ? {
                  ...bay,
                  status: 'FREE',
                  activeJobCardId: null,
                  vehicleRegistration: null,
                  modelName: null,
                  technicianId: null,
                  technicianName: null,
                  startedAt: null,
                  slaStatus: 'NORMAL',
                }
              : bay
          ),
        }));
        get().logAudit('BAY_RELEASED', 'SERVICE_BAY', `bay-${bayNumber}`, null, { bayNumber });
        syncToBackend('Bay release', () => backend.releaseBay(bayNumber, branchId));
      },

      // Invoices Actions
      postInvoice: (invoiceData) => {
        const state = get();
        const nextSequence = nextInvoiceSequence(state.invoices);
        const fyCode = '2627';
        const invoiceNumber = `VI/${fyCode}/${String(nextSequence).padStart(5, '0')}`;

        const now = new Date().toISOString();
        const postedInvoice = {
          date: now,
          ...invoiceData,
          id: `inv-${Date.now()}`,
          invoiceNumber,
          status: 'POSTED',
          postedAt: now,
          postedBy: state.currentUser?.name || 'Accountant',
        };

        set({
          invoices: [postedInvoice, ...state.invoices],
        });

        get().logAudit('INVOICE_POSTED', 'INVOICE', postedInvoice.id, null, postedInvoice);
        // The server assigns the authoritative gap-free number; adopt it when it differs.
        syncToBackend('Invoice', () => backend.postInvoice(postedInvoice), (saved) => {
          set((s) => ({ invoices: s.invoices.map((inv) => (inv.id === postedInvoice.id ? saved : inv)) }));
          syncEngine.markRecordClean('invoices', saved);
        });
        return postedInvoice;
      },


      // --- Dual-Control Approvals Actions ---
      createApproval: (requestData) => {
        return approvalsApi.createRequest(requestData);
      },
      decideApproval: (id, decision, options) => {
        return approvalsApi.decideRequest(id, decision, options);
      },
      resubmitApproval: (id, note) => {
        return approvalsApi.resubmitRequest(id, note);
      },
      cancelApproval: (id, reason) => {
        return approvalsApi.cancelRequest(id, reason);
      },
      emergencyOverrideApproval: (id, reason) => {
        return approvalsApi.emergencyOverride(id, reason);
      },
      addApprovalComment: (id, text) => {
        return approvalsApi.addComment(id, text);
      },
      delegateApproval: (id, data) => {
        return approvalsApi.delegateApproval(id, data);
      },
      bulkDecideApprovals: (ids, decision, note) => {
        const state = get();
        const results = [];
        ids.forEach((id) => {
          try {
            const res = approvalsApi.decideRequest(id, decision, { note });
            results.push({ id, success: true, request: res });
          } catch (err) {
            results.push({ id, success: false, error: err.message });
          }
        });
        return results;
      },
      updateApprovalPolicy: (id, patch, authorizer = null) => {
        const state = get();
        const currentPolicies = state.approvalPolicies || [];
        const policy = currentPolicies.find((p) => p.id === id);
        if (!policy) return null;

        // Maker-Checker: Rule changes require approval by different Super Admin
        const currentUser = state.currentUser;
        const isCheckerSuperAdmin = authorizer && authorizer.id !== currentUser?.id && (authorizer.role === 'Super Admin' || authorizer.role === 'SUPER_ADMIN');
        
        const newVersion = (parseFloat(policy.version || '1.0') + 0.1).toFixed(1);
        const updated = {
          ...policy,
          ...patch,
          version: newVersion,
          lastModifiedBy: currentUser?.name || 'Super Admin',
          lastModifiedAt: new Date().toISOString(),
          checkerSignOff: isCheckerSuperAdmin ? authorizer.name : null,
        };

        const updatedPolicies = currentPolicies.map((p) => (p.id === id ? updated : p));
        set({ approvalPolicies: updatedPolicies });
        if (state.logAudit) {
          state.logAudit('APPROVAL_POLICY_UPDATED', 'GOVERNANCE', id, policy, updated);
        }
        return updated;
      },
      createApprovalPolicy: (newPolicyData) => {
        const state = get();
        const currentPolicies = state.approvalPolicies || [];
        const newPolicy = {
          id: `pol-${Date.now()}`,
          version: '1.0',
          enabled: true,
          effectiveFrom: new Date().toISOString(),
          ...newPolicyData,
        };
        set({ approvalPolicies: [...currentPolicies, newPolicy] });
        if (state.logAudit) {
          state.logAudit('APPROVAL_POLICY_CREATED', 'GOVERNANCE', newPolicy.id, null, newPolicy);
        }
        return newPolicy;
      },

      // Reset to Fresh Seed State
      updateDealership: (patch) => {
        const updated = { ...get().dealership, ...patch };
        set({ dealership: updated });
        get().logAudit('DEALERSHIP_PROFILE_UPDATED', 'SETTINGS', 'dealership-master', null, patch);
      },

      // Vehicle Stock CRUD
      addVehicleStock: (vehicle) => {
        const newVehicle = {
          id: `veh-${Date.now()}`,
          status: 'IN_STOCK',
          daysInStock: 0,
          allocatedBookingId: null,
          ...vehicle,
        };
        set((state) => ({ vehicleStock: [newVehicle, ...state.vehicleStock] }));
        get().logAudit('VEHICLE_ADDED', 'VEHICLE_STOCK', newVehicle.id, null, newVehicle);
        return newVehicle;
      },
      updateVehicleStock: (id, patch) => {
        set((state) => ({
          vehicleStock: state.vehicleStock.map((v) => (v.id === id ? { ...v, ...patch } : v)),
        }));
        get().logAudit('VEHICLE_UPDATED', 'VEHICLE_STOCK', id, null, patch);
      },
      deleteVehicleStock: (id) => {
        const old = get().vehicleStock.find((v) => v.id === id);
        set((state) => ({
          vehicleStock: state.vehicleStock.filter((v) => v.id !== id),
        }));
        get().logAudit('VEHICLE_DELETED', 'VEHICLE_STOCK', id, old, null);
      },

      // Spare Parts Stock CRUD
      addPartStock: (part) => {
        const newPart = {
          id: `part-${Date.now()}`,
          currentStock: Number(part.currentStock) || 0,
          reorderLevel: Number(part.reorderLevel) || 5,
          unitPricePaise: Number(part.unitPricePaise) || 0,
          ...part,
        };
        set((state) => ({ partsStock: [newPart, ...state.partsStock] }));
        get().logAudit('PART_ADDED', 'PARTS_STOCK', newPart.id, null, newPart);
        return newPart;
      },
      updatePartStock: (id, patch) => {
        set((state) => ({
          partsStock: state.partsStock.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        }));
        get().logAudit('PART_UPDATED', 'PARTS_STOCK', id, null, patch);
      },
      deletePartStock: (id) => {
        const old = get().partsStock.find((p) => p.id === id);
        set((state) => ({
          partsStock: state.partsStock.filter((p) => p.id !== id),
        }));
        get().logAudit('PART_DELETED', 'PARTS_STOCK', id, old, null);
      },

      // Leads CRUD
      updateLead: (leadId, patch) => {
        const old = get().leads.find((l) => l.id === leadId);
        set((state) => ({
          leads: state.leads.map((l) => (l.id === leadId ? { ...l, ...patch } : l)),
        }));
        get().logAudit('LEAD_UPDATED', 'LEAD', leadId, old, patch);
      },
      deleteLead: (leadId) => {
        const old = get().leads.find((l) => l.id === leadId);
        set((state) => ({
          leads: state.leads.filter((l) => l.id !== leadId),
        }));
        get().logAudit('LEAD_DELETED', 'LEAD', leadId, old, null);
      },

      // External Integrations Management
      addExternalIntegration: (integration) => {
        const newIntegration = {
          id: `int-${Date.now()}`,
          status: 'ACTIVE',
          lastSync: 'Just configured',
          successRate: '100%',
          ...integration,
        };
        set((state) => ({
          externalIntegrations: [newIntegration, ...(state.externalIntegrations || [])],
        }));
        get().logAudit('INTEGRATION_ADDED', 'INTEGRATION', newIntegration.id, null, newIntegration);
        return newIntegration;
      },
      updateExternalIntegration: (id, patch) => {
        set((state) => ({
          externalIntegrations: (state.externalIntegrations || []).map((i) =>
            i.id === id ? { ...i, ...patch } : i
          ),
        }));
        get().logAudit('INTEGRATION_UPDATED', 'INTEGRATION', id, null, patch);
      },
      deleteExternalIntegration: (id) => {
        const old = (get().externalIntegrations || []).find((i) => i.id === id);
        set((state) => ({
          externalIntegrations: (state.externalIntegrations || []).filter((i) => i.id !== id),
        }));
        get().logAudit('INTEGRATION_DELETED', 'INTEGRATION', id, old, null);
      },

      // Approval Limits & Rules Management
      addApprovalRule: (rule) => {
        const newRule = {
          id: `rule-${Date.now()}`,
          status: 'ACTIVE',
          ...rule,
        };
        set((state) => ({
          customApprovalRules: [newRule, ...(state.customApprovalRules || [])],
        }));
        get().logAudit('APPROVAL_RULE_ADDED', 'APPROVAL_RULE', newRule.id, null, newRule);
        return newRule;
      },
      updateApprovalRule: (id, patch) => {
        set((state) => ({
          customApprovalRules: (state.customApprovalRules || []).map((r) =>
            r.id === id ? { ...r, ...patch } : r
          ),
        }));
        get().logAudit('APPROVAL_RULE_UPDATED', 'APPROVAL_RULE', id, null, patch);
      },
      deleteApprovalRule: (id) => {
        const old = (get().customApprovalRules || []).find((r) => r.id === id);
        set((state) => ({
          customApprovalRules: (state.customApprovalRules || []).filter((r) => r.id !== id),
        }));
        get().logAudit('APPROVAL_RULE_DELETED', 'APPROVAL_RULE', id, old, null);
      },

      // Custom Roles Management
      addCustomRole: (role) => {
        const newRole = {
          id: `role-${Date.now()}`,
          isCustom: true,
          usersCount: 0,
          ...role,
        };
        set((state) => ({
          customRoles: [newRole, ...(state.customRoles || [])],
        }));
        get().logAudit('CUSTOM_ROLE_CREATED', 'ROLE', newRole.id, null, newRole);
        return newRole;
      },
      deleteCustomRole: (id) => {
        const old = (get().customRoles || []).find((r) => r.id === id);
        set((state) => ({
          customRoles: (state.customRoles || []).filter((r) => r.id !== id),
        }));
        get().logAudit('CUSTOM_ROLE_DELETED', 'ROLE', id, old, null);
      },

      
      // Data Exchange (Import & Export Center) Actions
      commitImport: ({ moduleId, validRows, duplicateStrategy = 'UPDATE', mappingSnapshot = {}, fileName = '', fileSize = '', fileHash = '', duration = '1.2s' }) => {
        const state = get();
        const now = new Date();
        const displayTime = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' +
                            now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        // Map moduleId to store key and unique key
        const storeKeyMap = {
          customers: { key: 'customers', uniqueField: 'phone' },
          vehicles: { key: 'vehicleStock', uniqueField: 'chassisNumber' },
          leads: { key: 'leads', uniqueField: 'phone' },
          parts: { key: 'partsStock', uniqueField: 'partNumber' },
          models: { key: 'bikeModels', uniqueField: 'modelCode' },
          staff: { key: 'staffUsers', uniqueField: 'email' },
        };

        const targetConfig = storeKeyMap[moduleId] || { key: moduleId, uniqueField: 'id' };
        const currentList = Array.isArray(state[targetConfig.key]) ? [...state[targetConfig.key]] : [];
        const uniqueField = targetConfig.uniqueField;

        const createdIds = [];
        const updatedRecords = [];
        let importedCount = 0;
        let updatedCount = 0;
        let skippedCount = 0;

        validRows.forEach((row, idx) => {
          const rowKeyVal = String(row[uniqueField] || '').trim().toLowerCase();
          const existingIdx = currentList.findIndex((item) => {
            const itemKeyVal = String(item[uniqueField] || item.id || '').trim().toLowerCase();
            return itemKeyVal && itemKeyVal === rowKeyVal;
          });

          if (existingIdx !== -1) {
            if (duplicateStrategy === 'SKIP') {
              skippedCount++;
            } else if (duplicateStrategy === 'UPDATE') {
              const previousRecord = { ...currentList[existingIdx] };
              if (updatedRecords.length < 2000) {
                updatedRecords.push(previousRecord);
              }
              currentList[existingIdx] = {
                ...previousRecord,
                ...row,
                updatedAt: now.toISOString(),
              };
              updatedCount++;
            } else {
              // CREATE anyway
              const newId = `${moduleId}-${Date.now()}-${idx}`;
              const newRec = { ...row, id: newId, createdAt: now.toISOString() };
              currentList.push(newRec);
              if (createdIds.length < 2000) createdIds.push(newId);
              importedCount++;
            }
          } else {
            // New Record
            const newId = `${moduleId}-${Date.now()}-${idx}`;
            const newRec = { ...row, id: newId, createdAt: now.toISOString() };
            currentList.push(newRec);
            if (createdIds.length < 2000) createdIds.push(newId);
            importedCount++;
          }
        });

        // Compute import sequence id
        const history = state.importHistory || [];
        const nextNum = history.length + 1;
        const importId = `IMP-2026-${String(nextNum).padStart(4, '0')}`;

        const newImportEntry = {
          id: importId,
          timestamp: now.toISOString(),
          displayTime,
          module: moduleId.charAt(0).toUpperCase() + moduleId.slice(1),
          moduleId,
          fileName: fileName || `${moduleId}_Import.csv`,
          fileSize: fileSize || '120 KB',
          fileHash,
          totalRecords: validRows.length,
          validRecords: validRows.length,
          importedRecords: importedCount,
          updatedRecords: updatedCount,
          skippedRecords: skippedCount,
          warningCount: 0,
          errorCount: 0,
          status: 'Completed',
          user: state.currentUser?.name || 'Super Admin',
          role: state.currentUser?.role || 'Super Admin',
          branch: 'Bangalore Central Flagship',
          branchId: state.activeBranchId || 'blr-main',
          duplicateStrategy,
          duration,
          undoAvailable: true,
          undoSnapshot: {
            targetStoreKey: targetConfig.key,
            createdIds,
            updatedRecords,
            timestamp: now.toISOString(),
          },
          mappingSnapshot,
          sampleErrors: [],
        };

        const updatedMappings = { ...(state.lastImportMappings || {}), [moduleId]: mappingSnapshot };

        set((s) => ({
          [targetConfig.key]: currentList,
          importHistory: [newImportEntry, ...(s.importHistory || [])],
          lastImportMappings: updatedMappings,
        }));

        state.logAudit('DATA_IMPORT_COMMITTED', 'IMPORT', importId, null, {
          module: moduleId,
          imported: importedCount,
          updated: updatedCount,
          skipped: skippedCount,
        });

        return newImportEntry;
      },

      undoImport: (importId) => {
        const state = get();
        const history = state.importHistory || [];
        const target = history.find((h) => h.id === importId);
        if (!target) throw new Error(`Import ${importId} not found.`);

        if (!target.undoAvailable || !target.undoSnapshot) {
          throw new Error('Undo is no longer available for this import run.');
        }

        // Check 24 hours validity
        const importTime = new Date(target.timestamp).getTime();
        const now = Date.now();
        if (now - importTime > 24 * 60 * 60 * 1000) {
          throw new Error('Undo window has expired (imports can only be undone within 24 hours).');
        }

        const { targetStoreKey, createdIds = [], updatedRecords = [] } = target.undoSnapshot;
        let list = Array.isArray(state[targetStoreKey]) ? [...state[targetStoreKey]] : [];

        // Remove created records
        if (createdIds.length > 0) {
          const createdSet = new Set(createdIds);
          list = list.filter((item) => !createdSet.has(item.id));
        }

        // Restore updated records
        if (updatedRecords.length > 0) {
          const restoreMap = new Map(updatedRecords.map((r) => [r.id, r]));
          list = list.map((item) => (restoreMap.has(item.id) ? restoreMap.get(item.id) : item));
        }

        const updatedHistory = history.map((h) =>
          h.id === importId ? { ...h, status: 'Undone', undoAvailable: false } : h
        );

        set({
          [targetStoreKey]: list,
          importHistory: updatedHistory,
        });

        state.logAudit('DATA_IMPORT_UNDONE', 'IMPORT', importId, { status: target.status }, { status: 'Undone' });
        return true;
      },

      addExportHistory: (record) => {
        const now = new Date();
        const displayTime = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' +
                            now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        const exportId = `EXP-2026-${String((get().exportHistory || []).length + 1).padStart(4, '0')}`;

        const newRecord = {
          id: exportId,
          timestamp: now.toISOString(),
          displayTime,
          ...record,
        };

        set((s) => ({
          exportHistory: [newRecord, ...(s.exportHistory || [])],
        }));

        get().logAudit('DATA_EXPORT_GENERATED', 'EXPORT', exportId, null, newRecord);
        return newRecord;
      },

      requestExportApproval: ({ module, recordCount, unmasked, reason }) => {
        const state = get();
        const currentUser = state.currentUser;
        const approvalId = `appr-exp-${Date.now()}`;

        const newApproval = {
          id: approvalId,
          type: 'EXPORT',
          entityId: approvalId,
          title: `Export Approval Request: ${module} (${recordCount.toLocaleString()} rows)`,
          requestedBy: currentUser?.name || 'Deepak Rao',
          requestedById: currentUser?.id || 'sales-exec',
          requestedAt: new Date().toISOString(),
          status: 'PENDING',
          rule: unmasked ? 'Unmasked PII export' : 'Bulk customer export > 1,000',
          reason: reason || (unmasked ? 'Unmasked PII export requested under DPDP approval workflow.' : 'Bulk customer export exceeding 1,000 records threshold.'),
          details: { module, recordCount, unmasked },
          reviewedBy: null,
          reviewedAt: null,
        };

        set((s) => ({
          approvals: [newApproval, ...(s.approvals || [])],
        }));

        state.logAudit('EXPORT_APPROVAL_REQUESTED', 'APPROVAL', approvalId, null, newApproval);
        return newApproval;
      },

      addScheduledJob: (job) => {
        const newJob = {
          id: `job-${Date.now()}`,
          status: 'Active',
          lastRun: 'Never',
          lastStatus: 'PENDING',
          ...job,
        };
        set((s) => ({
          scheduledJobs: [...(s.scheduledJobs || []), newJob],
        }));
        get().logAudit('SCHEDULED_JOB_CREATED', 'JOB', newJob.id, null, newJob);
        return newJob;
      },

      updateScheduledJob: (id, updates) => {
        const state = get();
        const jobs = state.scheduledJobs || [];
        const old = jobs.find((j) => j.id === id);
        const updated = jobs.map((j) => (j.id === id ? { ...j, ...updates } : j));
        set({ scheduledJobs: updated });
        state.logAudit('SCHEDULED_JOB_UPDATED', 'JOB', id, old, updates);
      },

      deleteScheduledJob: (id) => {
        const state = get();
        const jobs = state.scheduledJobs || [];
        const old = jobs.find((j) => j.id === id);
        set({ scheduledJobs: jobs.filter((j) => j.id !== id) });
        state.logAudit('SCHEDULED_JOB_DELETED', 'JOB', id, old, null);
      },

      toggleScheduledJob: (id) => {
        const state = get();
        const jobs = state.scheduledJobs || [];
        const target = jobs.find((j) => j.id === id);
        if (!target) return;
        const newStatus = target.status === 'Active' ? 'Paused' : 'Active';
        set({
          scheduledJobs: jobs.map((j) => (j.id === id ? { ...j, status: newStatus } : j)),
        });
        state.logAudit('SCHEDULED_JOB_STATUS_TOGGLED', 'JOB', id, { status: target.status }, { status: newStatus });
      },

      triggerSyncIntegration: (integrationId) => {
        const state = get();
        const list = state.syncIntegrations || [];
        const target = list.find((item) => item.id === integrationId);
        if (!target) return;

        const updated = list.map((item) => {
          if (item.id === integrationId) {
            return {
              ...item,
              status: 'Connected',
              lastSync: 'Just now',
              recordsSynced: item.recordsSynced + Math.floor(Math.random() * 25) + 5,
              failedItems: 0,
            };
          }
          return item;
        });

        set({ syncIntegrations: updated });
        state.logAudit('SYNC_INTEGRATION_TRIGGERED', 'INTEGRATION', integrationId, null, { status: 'Connected' });
      },

      
      updateStaffAttendance: (staffId, day, status, reason = '') => {
        const state = get();
        const hrAttendance = { ...(state.hrAttendance || {}) };
        const staffAtt = hrAttendance[staffId] ? { ...hrAttendance[staffId] } : { staffId, month: '2026-10', days: {}, summary: {} };
        const oldDay = staffAtt.days?.[day] || {};
        
        staffAtt.days = {
          ...staffAtt.days,
          [day]: {
            ...oldDay,
            status,
            reason: reason || oldDay.reason || '',
            date: `2026-10-${String(day).padStart(2, '0')}`,
            editedAt: new Date().toISOString(),
            editedBy: state.currentUser?.name || 'Authorized Admin',
          },
        };

        let presentDays = 0;
        let absentDays = 0;
        let leaveDays = 0;
        Object.values(staffAtt.days).forEach((d) => {
          if (d.status === 'P') presentDays++;
          else if (d.status === 'A') absentDays++;
          else if (d.status === 'L') leaveDays++;
        });

        staffAtt.summary = {
          present: presentDays,
          absent: absentDays,
          leaves: leaveDays,
          holidays: 2,
          weeklyOffs: 4,
        };
        hrAttendance[staffId] = staffAtt;

        const hrStaff = (state.hrStaff || []).map((s) =>
          s.id === staffId ? { ...s, attendanceDays: presentDays } : s
        );

        set({ hrAttendance, hrStaff });
        state.logAudit('ATTENDANCE_OVERRIDE', 'STAFF', staffId, { day, oldStatus: oldDay.status }, { day, newStatus: status, reason });
      },

      updateStaffTarget: (staffId, targetQuota) => {
        const state = get();
        const hrStaff = (state.hrStaff || []).map((s) =>
          s.id === staffId ? { ...s, targetQuota: Number(targetQuota) || 0 } : s
        );
        set({ hrStaff });
        state.logAudit('STAFF_TARGET_UPDATED', 'STAFF', staffId, null, { targetQuota });
      },

      updateIncentiveRule: (ruleId, updates) => {
        const state = get();
        const rules = (state.hrIncentiveRules || []).map((r) =>
          r.id === ruleId ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
        );
        set({ hrIncentiveRules: rules });
        state.logAudit('INCENTIVE_RULE_UPDATED', 'RULE', ruleId, null, updates);
      },

      calculateMonthlyPayroll: (month = '2026-10') => {
        const state = get();
        const runs = (state.hrPayrollRuns || []).map((r) =>
          r.month === month ? { ...r, status: 'Calculated', calculatedAt: new Date().toISOString() } : r
        );
        set({ hrPayrollRuns: runs });
        state.logAudit('PAYROLL_CALCULATED', 'PAYROLL', month, null, { month });
      },

      submitPayrollForApproval: (runId) => {
        const state = get();
        const runs = state.hrPayrollRuns || [];
        const run = runs.find((r) => r.id === runId);
        if (!run) return;

        const updatedRuns = runs.map((r) =>
          r.id === runId
            ? {
                ...r,
                status: 'Under Review',
                submittedBy: state.currentUser?.name || 'Suresh Iyer (Accountant)',
                submittedAt: new Date().toISOString(),
              }
            : r
        );

        const approvalId = `appr-pay-${Date.now()}`;
        const newApproval = {
          id: approvalId,
          type: 'PAYROLL',
          title: `Payroll & Incentives Run - ${run.monthLabel || run.month}`,
          description: `Disbursal request for ${run.staffCount} staff members across ${run.branch}. Total Net Payout: ₹${(run.totalNetPayout / 100000).toFixed(2)}L.`,
          status: 'PENDING',
          requestedBy: state.currentUser?.name || 'Suresh Iyer',
          requestedByRole: state.currentUser?.role || 'Accountant',
          requestedAt: new Date().toISOString(),
          referenceId: run.id,
          amountPaise: (run.totalNetPayout || 0) * 100,
          requiresDualControl: true,
        };

        set((s) => ({
          hrPayrollRuns: updatedRuns,
          approvals: [newApproval, ...(s.approvals || [])],
        }));

        state.logAudit('PAYROLL_APPROVAL_REQUESTED', 'PAYROLL', runId, null, newApproval);
        return newApproval;
      },

      approvePayrollRun: (runId, reviewerName) => {
        const state = get();
        const runs = state.hrPayrollRuns || [];
        const run = runs.find((r) => r.id === runId);
        if (!run) return;

        if (run.submittedBy && reviewerName && run.submittedBy.includes(reviewerName)) {
          throw new Error('Dual-control violation: Submitter cannot approve their own payroll disbursal.');
        }

        const updatedRuns = runs.map((r) =>
          r.id === runId
            ? {
                ...r,
                status: 'Approved',
                reviewedBy: reviewerName || state.currentUser?.name || 'Rajesh Varma (Super Admin)',
                reviewedAt: new Date().toISOString(),
              }
            : r
        );

        const updatedApprovals = (state.approvals || []).map((a) =>
          a.referenceId === runId ? { ...a, status: 'APPROVED', approvedBy: reviewerName, approvedAt: new Date().toISOString() } : a
        );

        set({ hrPayrollRuns: updatedRuns, approvals: updatedApprovals });
        state.logAudit('PAYROLL_APPROVED', 'PAYROLL', runId, null, { reviewer: reviewerName });
      },

      markPayrollPaid: (runId, bankRef) => {
        const state = get();
        const runs = (state.hrPayrollRuns || []).map((r) =>
          r.id === runId
            ? {
                ...r,
                status: 'Paid',
                paidAt: new Date().toISOString(),
                bankRef: bankRef || `HDFC-NEFT-${Math.floor(100000000 + Math.random() * 900000000)}`,
              }
            : r
        );
        const staff = (state.hrStaff || []).map((s) => ({ ...s, status: 'Paid' }));
        set({ hrPayrollRuns: runs, hrStaff: staff });
        state.logAudit('PAYROLL_DISBURSED', 'PAYROLL', runId, null, { bankRef });
      },

      raiseStaffDispute: (staffId, month, comment) => {
        const state = get();
        const staff = (state.hrStaff || []).map((s) =>
          s.id === staffId
            ? {
                ...s,
                status: 'Disputed',
                dispute: {
                  month,
                  comment,
                  raisedAt: new Date().toISOString(),
                  raisedBy: state.currentUser?.name || s.name,
                },
              }
            : s
        );
        set({ hrStaff: staff });
        state.logAudit('INCENTIVE_DISPUTE_RAISED', 'STAFF', staffId, null, { month, comment });
      },

      addStaffAdjustment: (staffId, amount, type, reason) => {
        const state = get();
        const staff = (state.hrStaff || []).map((s) => {
          if (s.id === staffId) {
            const adj = (s.approvedAdjustments || 0) + (type === 'DEDUCTION' ? -Math.abs(amount) : Math.abs(amount));
            return {
              ...s,
              approvedAdjustments: adj,
              events: [
                ...(s.events || []),
                {
                  id: `adj-${Date.now()}`,
                  type: type === 'DEDUCTION' ? 'penalty_deduction' : 'manual_adjustment',
                  date: new Date().toISOString().slice(0, 10),
                  commission: type === 'DEDUCTION' ? -Math.abs(amount) : Math.abs(amount),
                  label: reason || (type === 'DEDUCTION' ? 'Approved Deduction' : 'Special Performance Bonus'),
                },
              ],
            };
          }
          return s;
        });
        set({ hrStaff: staff });
        state.logAudit('STAFF_ADJUSTMENT_ADDED', 'STAFF', staffId, null, { amount, type, reason });
      },

      
      // --- Users & Staff Account Administration Actions ---
      createUser: (userData) => {
        const state = get();
        const users = state.users || [];
        const isPrivileged = ['Super Admin', 'Branch Manager', 'Sales Manager', 'Service Manager', 'Accountant'].includes(userData.role);
        
        const newId = `usr-${Date.now().toString().slice(-4)}`;
        const newUser = {
          id: newId,
          employeeCode: userData.employeeCode || `EMP-2026-${String(users.length + 1).padStart(4, '0')}`,
          fullName: userData.fullName || userData.name,
          name: userData.fullName || userData.name,
          email: userData.email,
          phone: userData.phone,
          avatarUrl: userData.avatarUrl || null,
          role: userData.role,
          department: userData.department || 'Operations',
          designation: userData.designation || userData.role,
          reportsToId: userData.reportsToId || null,
          primaryBranchId: userData.primaryBranchId || state.activeBranchId,
          primaryBranchName: (state.branches || []).find((b) => b.id === (userData.primaryBranchId || state.activeBranchId))?.name || 'Bangalore Central Flagship',
          additionalBranchIds: userData.additionalBranchIds || [],
          employmentType: userData.employmentType || 'Full-time',
          shift: userData.shift || 'General (09:30 - 18:30)',
          status: isPrivileged ? 'Pending approval' : (userData.inviteMethod === 'INVITE' ? 'Invited' : 'Active'),
          lockReason: null,
          failedAttempts: 0,
          lockedAt: null,
          twoFactor: {
            required: Boolean(userData.twoFactorRequired),
            enabled: Boolean(userData.twoFactorEnabled),
            method: userData.twoFactorMethod || 'TOTP',
            enrolledAt: userData.twoFactorEnabled ? new Date().toISOString() : null,
          },
          passwordHash: userData.passwordHash || 'pbkdf2_sha256$10000$demo$default (demo authentication only)',
          passwordChangedAt: userData.passwordHash ? new Date().toISOString() : null,
          mustChangePassword: Boolean(userData.mustChangePassword),
          invite: {
            status: userData.inviteMethod === 'INVITE' ? 'Sent' : 'Accepted',
            sentAt: userData.inviteMethod === 'INVITE' ? new Date().toISOString() : null,
            expiresAt: userData.inviteMethod === 'INVITE' ? new Date(Date.now() + 48 * 3600 * 1000).toISOString() : null,
            channel: userData.inviteChannel || 'EMAIL',
          },
          permissionOverrides: userData.permissionOverrides || { add: [], remove: [] },
          limits: {
            discountLimit: Number(userData.discountLimit) || 0,
            approvalLimit: Number(userData.approvalLimit) || 0,
          },
          dataScope: userData.dataScope || (isPrivileged ? 'Branch' : 'Own records'),
          createdBy: state.currentUser?.name || 'Super Admin',
          createdAt: new Date().toISOString(),
          lastActiveAt: null,
          lastLogin: 'Never',
          hrProfileId: null,
        };

        // If privileged role, submit dual-control approval request to Approvals Center
        let approvalItem = null;
        if (isPrivileged) {
          const apprId = `appr-user-${Date.now()}`;
          approvalItem = {
            id: apprId,
            type: 'USER_ACCESS',
            title: `Privileged Role Creation: ${newUser.name} (${newUser.role})`,
            description: `User enrolled with privileged permissions at ${newUser.primaryBranchName}. Requires dual-control sign-off.`,
            status: 'PENDING',
            requestedBy: state.currentUser?.name || 'Administrator',
            requestedByRole: state.currentUser?.role || 'Manager',
            requestedAt: new Date().toISOString(),
            referenceId: newId,
            requiresDualControl: true,
          };
        }

        // If createHrProfile is toggled, create initial profile in hrStaff
        let updatedHrStaff = state.hrStaff || [];
        if (userData.createHrProfile) {
          const hrId = `staff-${Date.now().toString().slice(-4)}`;
          newUser.hrProfileId = hrId;
          const hrEntry = {
            id: hrId,
            userId: newId,
            employeeCode: newUser.employeeCode,
            name: newUser.name,
            role: newUser.role,
            department: newUser.department,
            branch: newUser.primaryBranchName,
            branchId: newUser.primaryBranchId,
            joiningDate: new Date().toISOString().slice(0, 10),
            attendanceDays: 26,
            workingDays: 26,
            targetQuota: newUser.role.includes('Sales') ? 10 : 50,
            achieved: 0,
            baseSalary: 30000,
            baselineSalesIncentive: 0,
            baselineServiceIncentive: 0,
            baselinePerformanceBonus: 0,
            baselineOemIncentive: 0,
            approvedAdjustments: 0,
            bankMasked: '•••• 0000',
            status: 'Pending',
            employmentStatus: 'ACTIVE',
            qualityScore: 95,
            events: [],
          };
          updatedHrStaff = [...updatedHrStaff, hrEntry];
        }

        set((s) => ({
          users: [newUser, ...(s.users || [])],
          hrStaff: updatedHrStaff,
          approvals: approvalItem ? [approvalItem, ...(s.approvals || [])] : s.approvals,
        }));

        state.logAudit('USER_CREATED', 'USER', newId, null, {
          name: newUser.name,
          role: newUser.role,
          branch: newUser.primaryBranchName,
          status: newUser.status,
        });

        return newUser;
      },

      updateUser: (userId, updates) => {
        const state = get();
        const users = state.users || [];
        const oldUser = users.find((u) => u.id === userId);
        if (!oldUser) return;

        // Safety check: Cannot demote or deactivate the last Super Admin
        if (oldUser.role === 'Super Admin' && updates.role && updates.role !== 'Super Admin') {
          const remainingSuperAdmins = users.filter((u) => u.id !== userId && u.role === 'Super Admin' && u.status === 'Active');
          if (remainingSuperAdmins.length === 0) {
            throw new Error('Safety violation: Cannot demote the last active Super Admin in the system.');
          }
        }

        const updatedUser = {
          ...oldUser,
          ...updates,
          name: updates.fullName || updates.name || oldUser.name,
          fullName: updates.fullName || updates.name || oldUser.fullName,
          updatedAt: new Date().toISOString(),
        };

        const newUsers = users.map((u) => (u.id === userId ? updatedUser : u));
        set({ users: newUsers });

        state.logAudit('USER_UPDATED', 'USER', userId, oldUser, updates);
        return updatedUser;
      },

      lockUser: (userId, reason = 'Administrative security lockout') => {
        const state = get();
        if (state.currentUser?.id === userId) {
          throw new Error('Safety violation: You cannot lock out your own active account.');
        }

        const users = state.users || [];
        const user = users.find((u) => u.id === userId);
        if (user?.role === 'Super Admin') {
          const activeSAs = users.filter((u) => u.id !== userId && u.role === 'Super Admin' && u.status === 'Active');
          if (activeSAs.length === 0) {
            throw new Error('Safety violation: Cannot lock the only active Super Admin.');
          }
        }

        const newUsers = users.map((u) =>
          u.id === userId
            ? {
                ...u,
                status: 'Locked',
                lockReason: reason,
                lockedAt: new Date().toISOString(),
              }
            : u
        );
        set({ users: newUsers });
        state.logAudit('USER_LOCKED', 'USER', userId, null, { reason });
      },

      unlockUser: (userId) => {
        const state = get();
        const newUsers = (state.users || []).map((u) =>
          u.id === userId
            ? {
                ...u,
                status: 'Active',
                lockReason: null,
                lockedAt: null,
                failedAttempts: 0,
              }
            : u
        );
        set({ users: newUsers });
        state.logAudit('USER_UNLOCKED', 'USER', userId, null, { action: 'Account unlocked by admin' });
      },

      toggleUser2FA: (userId, enabled, method = 'TOTP') => {
        const state = get();
        const newUsers = (state.users || []).map((u) => {
          if (u.id === userId) {
            const current2Fa = u.twoFactor || {};
            return {
              ...u,
              twoFactor: {
                ...current2Fa,
                enabled,
                method: method || current2Fa.method || 'TOTP',
                enrolledAt: enabled ? (current2Fa.enrolledAt || new Date().toISOString()) : null,
              },
            };
          }
          return u;
        });
        set({ users: newUsers });
        state.logAudit('USER_2FA_UPDATED', 'USER', userId, null, { enabled, method });
      },

      deactivateUser: (userId, reassignmentNotes = '') => {
        const state = get();
        if (state.currentUser?.id === userId) {
          throw new Error('Safety violation: You cannot deactivate your own account.');
        }

        const users = state.users || [];
        const user = users.find((u) => u.id === userId);
        if (user?.role === 'Super Admin') {
          const activeSAs = users.filter((u) => u.id !== userId && u.role === 'Super Admin' && u.status === 'Active');
          if (activeSAs.length === 0) {
            throw new Error('Safety violation: Cannot deactivate the last active Super Admin.');
          }
        }

        const newUsers = users.map((u) =>
          u.id === userId
            ? {
                ...u,
                status: 'Inactive',
                deactivatedAt: new Date().toISOString(),
                deactivationNotes: reassignmentNotes,
              }
            : u
        );
        set({ users: newUsers });
        state.logAudit('USER_DEACTIVATED', 'USER', userId, null, { reassignmentNotes });
      },

      reactivateUser: (userId) => {
        const state = get();
        const newUsers = (state.users || []).map((u) =>
          u.id === userId
            ? {
                ...u,
                status: 'Active',
                deactivatedAt: null,
                deactivationNotes: null,
              }
            : u
        );
        set({ users: newUsers });
        state.logAudit('USER_REACTIVATED', 'USER', userId, null, { action: 'Reactivated' });
      },

      resetUserPassword: (userId) => {
        const state = get();
        const users = state.users || [];
        const user = users.find((u) => u.id === userId);
        if (!user) return;

        // If privileged user, request approval
        const isPrivileged = ['Super Admin', 'Branch Manager', 'Sales Manager', 'Service Manager', 'Accountant'].includes(user.role);
        if (isPrivileged && state.currentUser?.role !== 'Super Admin') {
          const apprId = `appr-pwd-${Date.now()}`;
          const approvalItem = {
            id: apprId,
            type: 'PASSWORD_RESET',
            title: `Privileged Password Reset: ${user.name}`,
            description: `Password reset requested for privileged role ${user.role}. Requires Super Admin review.`,
            status: 'PENDING',
            requestedBy: state.currentUser?.name || 'Administrator',
            requestedAt: new Date().toISOString(),
            referenceId: userId,
          };
          set((s) => ({ approvals: [approvalItem, ...(s.approvals || [])] }));
          state.logAudit('PASSWORD_RESET_REQUESTED', 'USER', userId, null, { approvalId: apprId });
          return { requiresApproval: true };
        }

        const newUsers = users.map((u) =>
          u.id === userId
            ? {
                ...u,
                mustChangePassword: true,
                passwordChangedAt: new Date().toISOString(),
                passwordHash: 'pbkdf2_sha256$10000$demo$temp_pw_reset (demo authentication only)',
              }
            : u
        );
        set({ users: newUsers });
        state.logAudit('PASSWORD_RESET', 'USER', userId, null, { mustChangePassword: true });
        return { requiresApproval: false };
      },

      forceLogoutUser: (userId) => {
        const state = get();
        state.logAudit('USER_FORCE_LOGOUT', 'USER', userId, null, { action: 'All active sessions invalidated' });
      },

      resendUserInvite: (userId) => {
        const state = get();
        const newUsers = (state.users || []).map((u) =>
          u.id === userId
            ? {
                ...u,
                status: 'Invited',
                invite: {
                  ...u.invite,
                  status: 'Sent',
                  sentAt: new Date().toISOString(),
                  expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
                },
              }
            : u
        );
        set({ users: newUsers });
        state.logAudit('INVITE_RESENT', 'USER', userId, null, { expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString() });
      },

      bulkUpdateUsers: (userIds, action, payload = {}) => {
        const state = get();
        const users = state.users || [];
        const affected = [];
        const skipped = [];

        userIds.forEach((id) => {
          const u = users.find((x) => x.id === id);
          if (!u) return;

          // Self check
          if (id === state.currentUser?.id && ['LOCK', 'DEACTIVATE'].includes(action)) {
            skipped.push({ id, name: u.name, reason: 'Cannot perform action on currently logged in user' });
            return;
          }

          // Last Super Admin check
          if (u.role === 'Super Admin' && ['LOCK', 'DEACTIVATE'].includes(action)) {
            const otherActiveSAs = users.filter((x) => x.id !== id && x.role === 'Super Admin' && x.status === 'Active');
            if (otherActiveSAs.length === 0) {
              skipped.push({ id, name: u.name, reason: 'Cannot lock or deactivate the last active Super Admin' });
              return;
            }
          }

          affected.push(id);
        });

        let updatedUsers = users.map((u) => {
          if (!affected.includes(u.id)) return u;

          if (action === 'LOCK') {
            return { ...u, status: 'Locked', lockReason: payload.reason || 'Bulk administrative lockout', lockedAt: new Date().toISOString() };
          }
          if (action === 'UNLOCK') {
            return { ...u, status: 'Active', lockReason: null, lockedAt: null, failedAttempts: 0 };
          }
          if (action === 'ENABLE_2FA') {
            return { ...u, twoFactor: { ...(u.twoFactor || {}), enabled: true, enrolledAt: new Date().toISOString() } };
          }
          if (action === 'RESET_PASSWORD') {
            return { ...u, mustChangePassword: true, passwordChangedAt: new Date().toISOString() };
          }
          return u;
        });

        set({ users: updatedUsers });
        state.logAudit('BULK_USERS_UPDATED', 'USER', 'bulk', null, { action, affectedCount: affected.length, skippedCount: skipped.length });

        return { affectedCount: affected.length, skippedCount: skipped.length, skipped };
      },

      saveUserDraft: (draftData) => {
        const state = get();
        const drafts = state.userDrafts || [];
        const draftId = draftData.id || `draft-${Date.now()}`;
        const updatedDraft = {
          ...draftData,
          id: draftId,
          updatedAt: new Date().toISOString(),
        };
        const newDrafts = drafts.filter((d) => d.id !== draftId);
        newDrafts.unshift(updatedDraft);
        set({ userDrafts: newDrafts });
        return updatedDraft;
      },

      deleteUserDraft: (draftId) => {
        const state = get();
        const drafts = (state.userDrafts || []).filter((d) => d.id !== draftId);
        set({ userDrafts: drafts });
      },

      resetToDefaultSeed: async () => {
        if (backend.enabled()) {
          await get().refreshFromBackend();
          return;
        }
        set(await loadSeed());
      },
    }),
    {
      name: 'bikeerp-preferences-v1',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        activeBranchId: state.activeBranchId,
      }),
    }
  )
);

// Old builds cached every slice (customer data included) in localStorage; remove it.
try {
  localStorage.removeItem('bikeerp-storage-v1');
  localStorage.removeItem('bikeerp-store-v2');
} catch {
  // storage unavailable
}

setTaxRulesProvider(() => useAppStore.getState().catalogs?.taxRules);

/** Pushes local changes to the API; started by hydrateFromBackend after login. */
export const syncEngine = createSyncEngine(useAppStore);

export const useStore = useAppStore;
