import { parseISO, isValid, differenceInCalendarDays, isAfter, startOfDay, endOfDay, format } from 'date-fns';
import { QUOTATION_STATUSES } from './config';

// Simulated clock offset for dev testing
let simulatedClockOffsetMs = 0;

export function getSimulatedNow() {
  return new Date(Date.now() + simulatedClockOffsetMs);
}

export function advanceSimulatedClock(days = 1) {
  simulatedClockOffsetMs += days * 86400000;
  return getSimulatedNow();
}

export function resetSimulatedClock() {
  simulatedClockOffsetMs = 0;
  return new Date();
}

export function getSimulatedClockOffsetDays() {
  return Math.round(simulatedClockOffsetMs / 86400000);
}

/**
 * Checks if a quotation is expired relative to simulated IST reference time.
 * A quotation is valid through the END of its validUntil date (23:59:59.999).
 */
export function isQuotationExpired(q, referenceDate = getSimulatedNow()) {
  if (!q?.validUntil) return false;
  const validUntilDate = typeof q.validUntil === 'string' ? parseISO(q.validUntil) : new Date(q.validUntil);
  if (!isValid(validUntilDate)) return false;

  const validUntilEnd = endOfDay(validUntilDate);
  return isAfter(referenceDate, validUntilEnd);
}

/**
 * Computes human-friendly expiry metadata:
 * - 'Expired N days ago'
 * - 'Expires in N days' (amber chip within 3 days)
 * - Formatted date string
 */
export function getExpiryStatus(q, referenceDate = getSimulatedNow()) {
  if (!q?.validUntil) return { label: '—', isExpired: false, isExpiringSoon: false };

  const validUntilDate = typeof q.validUntil === 'string' ? parseISO(q.validUntil) : new Date(q.validUntil);
  if (!isValid(validUntilDate)) return { label: '—', isExpired: false, isExpiringSoon: false };

  const validUntilEnd = endOfDay(validUntilDate);
  const now = referenceDate;
  const isExpired = isAfter(now, validUntilEnd);

  const formattedDate = format(validUntilDate, 'dd MMM yyyy');

  if (isExpired) {
    const daysAgo = Math.max(1, differenceInCalendarDays(now, validUntilEnd));
    return {
      isExpired: true,
      isExpiringSoon: false,
      daysAgo,
      badgeText: `Expired ${daysAgo} ${daysAgo === 1 ? 'day' : 'days'} ago`,
      badgeClass: 'text-rose-700 bg-rose-100 font-semibold',
      formattedDate,
    };
  }

  // Check if expiring within 3 days
  const daysLeft = differenceInCalendarDays(validUntilEnd, now);
  if (daysLeft <= 3 && daysLeft >= 0) {
    const text = daysLeft === 0 ? 'Expires today' : `Expires in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}`;
    return {
      isExpired: false,
      isExpiringSoon: true,
      daysLeft,
      badgeText: text,
      badgeClass: 'text-amber-800 bg-amber-100 font-semibold',
      formattedDate,
    };
  }

  return {
    isExpired: false,
    isExpiringSoon: false,
    badgeText: null,
    formattedDate,
  };
}

/**
 * Idempotent batch expiry evaluation.
 * Automatically marks open quotations (Draft, Approved, Sent, Pending Approval)
 * past validity as EXPIRED. Terminal statuses (Converted, Cancelled) are preserved.
 */
export function runExpiryCheck(quotations = [], referenceDate = getSimulatedNow()) {
  let hasChanges = false;
  const updated = quotations.map((q) => {
    // Terminal statuses cannot expire
    if (q.status === QUOTATION_STATUSES.CONVERTED || q.status === QUOTATION_STATUSES.CANCELLED) {
      return q;
    }

    if (isQuotationExpired(q, referenceDate) && q.status !== QUOTATION_STATUSES.EXPIRED) {
      hasChanges = true;
      return {
        ...q,
        status: QUOTATION_STATUSES.EXPIRED,
        expiredAt: referenceDate.toISOString(),
      };
    }

    return q;
  });

  return { updated, hasChanges };
}

/**
 * Permission & State Guard: Can the quotation be edited?
 */
export function canEditQuotation(q, currentUser) {
  if (!q) return { canEdit: false, reason: 'Quotation not found' };

  if (q.status === QUOTATION_STATUSES.PENDING_APPROVAL) {
    return { canEdit: false, reason: 'Locked awaiting Manager Dual-Control Approval' };
  }
  if (q.status === QUOTATION_STATUSES.CONVERTED) {
    return { canEdit: false, reason: 'Locked: Converted to Customer Booking' };
  }
  if (q.status === QUOTATION_STATUSES.CANCELLED) {
    return { canEdit: false, reason: 'Locked: Quotation was cancelled' };
  }
  if (q.status === QUOTATION_STATUSES.EXPIRED) {
    return { canEdit: false, reason: 'Expired: Use Renew action to create a new revision' };
  }

  return { canEdit: true, reason: null };
}

/**
 * State Guard: Can the quotation be converted to Booking?
 */
export function canConvertQuotation(q, referenceDate = getSimulatedNow()) {
  if (!q) return { canConvert: false, reason: 'Quotation not found' };

  if (q.status === QUOTATION_STATUSES.CONVERTED) {
    return { canConvert: false, reason: 'Already converted to booking' };
  }
  if (q.status === QUOTATION_STATUSES.CANCELLED) {
    return { canConvert: false, reason: 'Quotation has been cancelled' };
  }
  if (isQuotationExpired(q, referenceDate) || q.status === QUOTATION_STATUSES.EXPIRED) {
    return { canConvert: false, reason: 'Quotation validity expired. Renew to re-lock pricing.' };
  }
  if (q.status === QUOTATION_STATUSES.PENDING_APPROVAL) {
    return { canConvert: false, reason: 'Discount requires dual-control approval before booking' };
  }
  if (q.status === QUOTATION_STATUSES.REJECTED) {
    return { canConvert: false, reason: 'Discount request was rejected. Update proposal to convert.' };
  }

  // Allowed only for Approved or Sent
  if (q.status !== QUOTATION_STATUSES.APPROVED && q.status !== QUOTATION_STATUSES.SENT) {
    return { canConvert: false, reason: 'Quotation must be Approved or Sent to convert' };
  }

  return { canConvert: true, reason: null };
}
