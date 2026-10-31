import { parseISO, isValid, isWithinInterval, startOfDay, endOfDay, isBefore } from 'date-fns';
import { BOOKING_STATUSES } from '../config.js';
import { getSimulatedNow, getTokenSummary } from '../engine.js';

/**
 * Pure Selector for Bookings Filtering
 */
export function filterBookings(
  bookings = [],
  filters = {},
  currentUser = {},
  dateRange = {},
  referenceDate = getSimulatedNow()
) {
  const {
    search = '',
    status = 'ALL',
    branchId = 'br-blr-central',
    includeOpenBookings = true,
    salespersonId = '',
    modelId = '',
    colour = '',
    minToken = '',
    maxToken = '',
    deliveryOverdueOnly = false,
    chassisAllocated = '', // 'yes' | 'no' | ''
  } = filters;

  const { startDate = new Date(2026, 9, 1), endDate = referenceDate } = dateRange;
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  const query = search.trim().toLowerCase();

  return bookings.filter((b) => {
    // 1. RBAC Permission Filtering
    // Sales Executive sees only their own bookings
    if (currentUser?.role === 'Sales Executive') {
      const isOwner =
        b.salespersonId === currentUser.id ||
        b.salesExecutive === currentUser.name ||
        b.salespersonName === currentUser.name;
      if (!isOwner) return false;
    }

    // 2. Branch Filter
    if (branchId && branchId !== 'all') {
      if (b.branchId && b.branchId !== branchId) return false;
    }

    // 3. Status Tab / Filter
    if (status && status !== 'ALL') {
      if (b.status !== status) return false;
    }

    // 4. Date Range Filter with "Include all open bookings regardless of date" toggle
    const isOpen = b.status === BOOKING_STATUSES.PENDING || b.status === BOOKING_STATUSES.CONFIRMED;
    if (!(includeOpenBookings && isOpen)) {
      const createdStr = b.createdAt || b.bookingDate;
      if (createdStr) {
        const createdDate = typeof createdStr === 'string' ? parseISO(createdStr) : new Date(createdStr);
        if (isValid(createdDate) && !isWithinInterval(createdDate, { start, end })) {
          return false;
        }
      }
    }

    // 5. Search Text Query (Booking #, Customer Name, Phone, VIN, Model)
    if (query) {
      const numMatch = (b.bookingNumber || '').toLowerCase().includes(query);
      const nameMatch = (b.customerName || '').toLowerCase().includes(query);
      const phoneMatch = (b.phone || '').toLowerCase().includes(query);
      const vinMatch = (b.allocatedChassisNumber || b.allocation?.vin || '').toLowerCase().includes(query);
      const modelMatch = (b.modelName || '').toLowerCase().includes(query);

      if (!numMatch && !nameMatch && !phoneMatch && !vinMatch && !modelMatch) {
        return false;
      }
    }

    // 6. Advanced Filters
    if (salespersonId) {
      if (b.salespersonId !== salespersonId && b.salespersonName !== salespersonId) return false;
    }

    if (modelId) {
      if (b.modelId !== modelId) return false;
    }

    if (colour) {
      if (b.colorName !== colour) return false;
    }

    const token = getTokenSummary(b);
    if (minToken && token.clearedRupees < Number(minToken)) return false;
    if (maxToken && token.clearedRupees > Number(maxToken)) return false;

    if (chassisAllocated === 'yes') {
      if (!b.allocatedChassisNumber && !b.allocation?.vin) return false;
    } else if (chassisAllocated === 'no') {
      if (b.allocatedChassisNumber || b.allocation?.vin) return false;
    }

    if (deliveryOverdueOnly) {
      const estDateInput = b.estDelivery || b.tentativeDeliveryDate;
      if (!estDateInput || !isOpen) return false;
      const estDate = typeof estDateInput === 'string' ? parseISO(estDateInput) : new Date(estDateInput);
      if (!isValid(estDate) || !isBefore(startOfDay(estDate), startOfDay(referenceDate))) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sorts bookings
 * Default: newest created first
 */
export function sortBookings(bookings = [], sortKey = 'createdAt', sortOrder = 'desc') {
  return [...bookings].sort((a, b) => {
    let valA = a[sortKey];
    let valB = b[sortKey];

    if (sortKey === 'tokenPaid') {
      valA = getTokenSummary(a).clearedPaise;
      valB = getTokenSummary(b).clearedPaise;
    } else if (sortKey === 'estDelivery') {
      valA = new Date(a.estDelivery || a.tentativeDeliveryDate || 0).getTime();
      valB = new Date(b.estDelivery || b.tentativeDeliveryDate || 0).getTime();
    } else if (sortKey === 'createdAt' || sortKey === 'bookingDate') {
      valA = new Date(valA || a.bookingDate || 0).getTime();
      valB = new Date(valB || b.bookingDate || 0).getTime();
    } else if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = (valB || '').toLowerCase();
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
}
