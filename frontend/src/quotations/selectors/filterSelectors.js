import { QUOTATION_STATUSES } from '../config';
import { parseISO, isValid, isWithinInterval, startOfDay, endOfDay, differenceInCalendarDays } from 'date-fns';
import { getSimulatedNow, isQuotationExpired } from '../engine';
import { calculateQuotationTotals } from '../math';

/**
 * Filters quotations list according to active search, status, branch, date range,
 * advanced filter criteria, open quotations toggle, and user role permissions.
 */
export function filterQuotations(
  quotations = [],
  filters = {},
  currentUser = {},
  dateRange = {},
  referenceDate = getSimulatedNow()
) {
  const {
    search = '',
    status = 'ALL',
    branchId = 'br-blr-central',
    includeOpenQuotations = true,
    salespersonId = '',
    modelId = '',
    minAmount = '',
    maxAmount = '',
    minDiscountPct = '',
    maxDiscountPct = '',
    expiringWithinDays = '',
    hasApprovalRequest = false,
  } = filters;

  const { startDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1), endDate = referenceDate } = dateRange;
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  const query = search.trim().toLowerCase();

  return quotations.filter((q) => {
    // 1. RBAC Permission Filtering
    // Super Admin / Branch Manager / Sales Manager see branch quotations
    // Sales Executive sees only their own quotations
    if (currentUser?.role === 'Sales Executive') {
      const isOwner =
        q.salespersonId === currentUser.id ||
        q.salespersonName === currentUser.name ||
        q.createdBy === currentUser.name;
      if (!isOwner) return false;
    }

    // 2. Branch Filter (single source of truth)
    if (branchId && branchId !== 'all') {
      if (q.branchId && q.branchId !== branchId) return false;
    }

    // 3. Status Filter
    if (status && status !== 'ALL') {
      if (q.status !== status) return false;
    }

    // 4. Date Range Filter with "Include Open Quotations" toggle
    const isOpen =
      q.status === QUOTATION_STATUSES.DRAFT ||
      q.status === QUOTATION_STATUSES.PENDING_APPROVAL ||
      q.status === QUOTATION_STATUSES.APPROVED ||
      q.status === QUOTATION_STATUSES.SENT;

    let passesDate = false;
    if (includeOpenQuotations && isOpen) {
      passesDate = true;
    } else {
      if (q.createdAt) {
        const created = typeof q.createdAt === 'string' ? parseISO(q.createdAt) : new Date(q.createdAt);
        if (isValid(created)) {
          passesDate = isWithinInterval(created, { start, end });
        }
      }
    }
    if (!passesDate) return false;

    // 5. Text Search (Quotation #, Customer Name, Phone, Bike Model, Variant)
    if (query) {
      const numMatch = q.quotationNumber?.toLowerCase().includes(query);
      const custMatch = q.customerName?.toLowerCase().includes(query);
      const phoneMatch = q.phone?.includes(query);
      const modelMatch = q.modelName?.toLowerCase().includes(query);
      const variantMatch = q.variantName?.toLowerCase().includes(query);

      if (!numMatch && !custMatch && !phoneMatch && !modelMatch && !variantMatch) {
        return false;
      }
    }

    // 6. Advanced Filters
    if (salespersonId) {
      if (q.salespersonId !== salespersonId && q.createdBy !== salespersonId) return false;
    }

    if (modelId) {
      if (q.modelId !== modelId && !q.modelName?.toLowerCase().includes(modelId.toLowerCase())) return false;
    }

    const totals = calculateQuotationTotals(q);

    if (minAmount !== '' && !isNaN(Number(minAmount))) {
      if (totals.netAmountRupees < Number(minAmount)) return false;
    }

    if (maxAmount !== '' && !isNaN(Number(maxAmount))) {
      if (totals.netAmountRupees > Number(maxAmount)) return false;
    }

    if (minDiscountPct !== '' && !isNaN(Number(minDiscountPct))) {
      if (totals.discountPercent < Number(minDiscountPct)) return false;
    }

    if (maxDiscountPct !== '' && !isNaN(Number(maxDiscountPct))) {
      if (totals.discountPercent > Number(maxDiscountPct)) return false;
    }

    if (expiringWithinDays !== '' && !isNaN(Number(expiringWithinDays))) {
      if (!q.validUntil) return false;
      const vDate = typeof q.validUntil === 'string' ? parseISO(q.validUntil) : new Date(q.validUntil);
      if (!isValid(vDate)) return false;
      const daysLeft = differenceInCalendarDays(endOfDay(vDate), referenceDate);
      if (daysLeft < 0 || daysLeft > Number(expiringWithinDays)) return false;
    }

    if (hasApprovalRequest) {
      if (!q.approvalRequestId && q.status !== QUOTATION_STATUSES.PENDING_APPROVAL) return false;
    }

    return true;
  });
}

/**
 * Sorts filtered quotations
 * Default: newest created first
 */
export function sortQuotations(quotations = [], sortKey = 'createdAt', sortOrder = 'desc') {
  return [...quotations].sort((a, b) => {
    let valA = a[sortKey];
    let valB = b[sortKey];

    if (sortKey === 'netAmount') {
      valA = calculateQuotationTotals(a).netAmountPaise;
      valB = calculateQuotationTotals(b).netAmountPaise;
    } else if (sortKey === 'amount') {
      valA = calculateQuotationTotals(a).amountPaise;
      valB = calculateQuotationTotals(b).amountPaise;
    } else if (sortKey === 'discount') {
      valA = calculateQuotationTotals(a).discountPaise;
      valB = calculateQuotationTotals(b).discountPaise;
    } else if (sortKey === 'validUntil' || sortKey === 'createdAt') {
      valA = new Date(valA || 0).getTime();
      valB = new Date(valB || 0).getTime();
    } else if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = (valB || '').toLowerCase();
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
}
