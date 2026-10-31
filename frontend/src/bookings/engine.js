import { parseISO, isValid, differenceInCalendarDays, isAfter, isBefore, startOfDay, endOfDay, format } from 'date-fns';
import {
  BOOKING_STATUSES,
  VIN_REGEX,
  MODEL_MINIMUM_TOKEN_PAISE,
  DEFAULT_MINIMUM_TOKEN_PAISE,
  DEFAULT_HOLD_HOURS,
  CANCELLATION_REFUND_POLICIES,
} from './config';

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
 * Validates a Vehicle Identification Number (VIN) strictly:
 * Exactly 17 uppercase alphanumeric characters excluding I, O, Q
 */
export function isValidVin(vin) {
  if (!vin || typeof vin !== 'string') return false;
  return VIN_REGEX.test(vin.trim().toUpperCase());
}

/**
 * Returns minimum token required for a bike model (in Paise)
 */
export function getMinimumTokenPaise(modelId) {
  return MODEL_MINIMUM_TOKEN_PAISE[modelId] || DEFAULT_MINIMUM_TOKEN_PAISE;
}

/**
 * Calculates token receipts sum and clearance status
 */
export function getTokenSummary(booking = {}) {
  const modelId = booking.modelId || booking.vehicle?.modelId;
  const tokenRequiredPaise = booking.tokenRequiredPaise || getMinimumTokenPaise(modelId);

  const payments = Array.isArray(booking.tokenPayments) ? booking.tokenPayments : [];
  
  // If booking has legacy flat tokenAmountPaise and no tokenPayments array, construct one
  let allPayments = [...payments];
  if (allPayments.length === 0 && (booking.tokenAmountPaise || booking.tokenAmountRupees)) {
    allPayments = [
      {
        receiptNo: `RCP-${booking.bookingNumber?.slice(-5) || '00001'}`,
        amountPaise: booking.tokenAmountPaise || Number(booking.tokenAmountRupees) * 100,
        mode: booking.paymentMode || 'UPI',
        reference: booking.paymentRef || 'REF-INIT',
        date: booking.bookingDate || booking.createdAt || new Date().toISOString(),
        status: 'CLEARED',
      },
    ];
  }

  const clearedPaise = allPayments
    .filter((p) => p.status === 'CLEARED' || !p.status)
    .reduce((sum, p) => sum + (p.amountPaise || 0), 0);

  const pendingPaise = allPayments
    .filter((p) => p.status === 'PENDING')
    .reduce((sum, p) => sum + (p.amountPaise || 0), 0);

  const clearedRupees = Math.round(clearedPaise / 100);
  const requiredRupees = Math.round(tokenRequiredPaise / 100);
  const isSatisfied = clearedPaise >= tokenRequiredPaise;

  const isPartial = clearedPaise > 0 && clearedPaise < tokenRequiredPaise;

  let displayLabel = `₹ ${clearedRupees.toLocaleString('en-IN')}`;
  if (isPartial) {
    displayLabel = `₹ ${clearedRupees.toLocaleString('en-IN')} of ₹ ${requiredRupees.toLocaleString('en-IN')}`;
  } else if (clearedPaise === 0) {
    displayLabel = `₹ 0 of ₹ ${requiredRupees.toLocaleString('en-IN')}`;
  }

  return {
    clearedPaise,
    clearedRupees,
    tokenRequiredPaise,
    requiredRupees,
    isSatisfied,
    isPartial,
    displayLabel,
    payments: allPayments,
  };
}

/**
 * Evaluates delivery schedule status and flags for a booking.
 * Note: Overdue is a FLAG on open bookings, NOT a status.
 */
export function getDeliveryFlag(booking = {}, referenceDate = getSimulatedNow()) {
  const status = booking.status;

  // For Delivered rows:
  if (status === BOOKING_STATUSES.DELIVERED) {
    const deliveredDate = booking.deliveredAt || booking.tentativeDeliveryDate || booking.estDelivery;
    let formattedDelivered = 'Delivered';
    try {
      const d = typeof deliveredDate === 'string' ? parseISO(deliveredDate) : new Date(deliveredDate);
      if (isValid(d)) formattedDelivered = `Delivered on ${format(d, 'dd MMM yyyy')}`;
    } catch {}

    return {
      isDelivered: true,
      isOverdue: false,
      isDueSoon: false,
      flagText: null,
      deliveredLabel: formattedDelivered,
    };
  }

  // Cancelled bookings don't carry active delivery flags
  if (status === BOOKING_STATUSES.CANCELLED) {
    return { isDelivered: false, isOverdue: false, isDueSoon: false, flagText: null };
  }

  // Open bookings (Pending / Confirmed)
  const estDateInput = booking.estDelivery || booking.tentativeDeliveryDate;
  if (!estDateInput) return { isDelivered: false, isOverdue: false, isDueSoon: false, flagText: null };

  const estDate = typeof estDateInput === 'string' ? parseISO(estDateInput) : new Date(estDateInput);
  if (!isValid(estDate)) return { isDelivered: false, isOverdue: false, isDueSoon: false, flagText: null };

  const nowStart = startOfDay(referenceDate);
  const estStart = startOfDay(estDate);

  // Overdue check
  if (isBefore(estStart, nowStart)) {
    const overdueDays = Math.max(1, differenceInCalendarDays(nowStart, estStart));
    return {
      isDelivered: false,
      isOverdue: true,
      isDueSoon: false,
      overdueDays,
      flagText: `Overdue by ${overdueDays} ${overdueDays === 1 ? 'day' : 'days'}`,
      flagClass: 'bg-rose-100 text-rose-800 border border-rose-300 font-semibold',
      formattedDate: format(estDate, 'dd MMM yyyy'),
    };
  }

  // Due in <= 2 days
  const daysUntil = differenceInCalendarDays(estStart, nowStart);
  if (daysUntil <= 2 && daysUntil >= 0) {
    const text = daysUntil === 0 ? 'Due today' : `Due in ${daysUntil} ${daysUntil === 1 ? 'day' : 'days'}`;
    return {
      isDelivered: false,
      isOverdue: false,
      isDueSoon: true,
      daysUntil,
      flagText: text,
      flagClass: 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold',
      formattedDate: format(estDate, 'dd MMM yyyy'),
    };
  }

  return {
    isDelivered: false,
    isOverdue: false,
    isDueSoon: false,
    flagText: null,
    formattedDate: format(estDate, 'dd MMM yyyy'),
  };
}

/**
 * Checks if a temporary chassis hold on a Pending booking has expired
 */
export function isHoldExpired(allocation = {}, referenceDate = getSimulatedNow()) {
  if (allocation.status !== 'Held' || !allocation.holdUntil) return false;
  const holdUntil = typeof allocation.holdUntil === 'string' ? parseISO(allocation.holdUntil) : new Date(allocation.holdUntil);
  if (!isValid(holdUntil)) return false;
  return isAfter(referenceDate, holdUntil);
}

/**
 * Confirmation Gate Validator:
 * Confirmed requires:
 * 1. Token paid >= minimum token requirement
 * 2. All required dual-control approvals satisfied (none Pending)
 * 3. Chassis allocated (not expired hold)
 */
export function canConfirmBooking(booking = {}) {
  const reasons = [];

  // 1. Token Check
  const token = getTokenSummary(booking);
  if (!token.isSatisfied) {
    reasons.push(
      `Token deposit of ₹ ${token.clearedRupees.toLocaleString('en-IN')} is below the minimum required ₹ ${token.requiredRupees.toLocaleString('en-IN')}`
    );
  }

  // 2. Approval Check
  if (booking.approvalRequestId && booking.approvalStatus === 'PENDING') {
    reasons.push(`Dual-control approval request ${booking.approvalRequestId} is still pending authorization`);
  }

  // 3. Chassis Allocation Check
  const allocation = booking.allocation || {};
  const hasVin = Boolean(allocation.vin || booking.allocatedChassisNumber);
  if (!hasVin) {
    reasons.push('Chassis (VIN) has not been allocated to this reservation');
  } else if (allocation.status === 'Held' && isHoldExpired(allocation)) {
    reasons.push('Temporary 48h chassis hold has expired; allocate an available VIN');
  }

  return {
    canConfirm: reasons.length === 0,
    reasons,
  };
}

/**
 * Delivery Gate Validator
 */
export function canDeliverBooking(booking = {}) {
  const reasons = [];
  if (booking.status !== BOOKING_STATUSES.CONFIRMED) {
    reasons.push('Only Confirmed bookings can be marked as Delivered');
  }
  const hasVin = Boolean(booking.allocation?.vin || booking.allocatedChassisNumber);
  if (!hasVin) {
    reasons.push('Chassis (VIN) must be allocated before delivery');
  }
  return {
    canDeliver: reasons.length === 0,
    reasons,
  };
}

/**
 * Calculates token refund upon cancellation
 */
export function calculateCancellationRefund(booking = {}) {
  const token = getTokenSummary(booking);
  const totalPaidPaise = token.clearedPaise;
  if (totalPaidPaise === 0) {
    return {
      refundPaise: 0,
      refundRupees: 0,
      deductionPaise: 0,
      deductionRupees: 0,
      policy: CANCELLATION_REFUND_POLICIES.PRE_ALLOCATION,
    };
  }

  const hasAllocation = Boolean(booking.allocation?.vin || booking.allocatedChassisNumber);
  if (!hasAllocation) {
    // 100% full refund
    return {
      refundPaise: totalPaidPaise,
      refundRupees: Math.round(totalPaidPaise / 100),
      deductionPaise: 0,
      deductionRupees: 0,
      policy: CANCELLATION_REFUND_POLICIES.PRE_ALLOCATION,
    };
  }

  // Post allocation: ₹ 1,000 deduction
  const deductionPaise = Math.min(totalPaidPaise, CANCELLATION_REFUND_POLICIES.POST_ALLOCATION.deductionPaise);
  const refundPaise = totalPaidPaise - deductionPaise;

  return {
    refundPaise,
    refundRupees: Math.round(refundPaise / 100),
    deductionPaise,
    deductionRupees: Math.round(deductionPaise / 100),
    policy: CANCELLATION_REFUND_POLICIES.POST_ALLOCATION,
  };
}

/**
 * Idempotent hold expiry catch-up across vehicle stock and bookings
 */
export function runHoldExpiryCheck(bookings = [], vehicleStock = [], referenceDate = getSimulatedNow()) {
  let stockChanged = false;
  let bookingsChanged = false;

  const updatedBookings = bookings.map((b) => {
    if (b.status === BOOKING_STATUSES.PENDING && b.allocation?.status === 'Held') {
      if (isHoldExpired(b.allocation, referenceDate)) {
        bookingsChanged = true;
        return {
          ...b,
          allocation: {
            ...b.allocation,
            status: 'Hold_Expired',
            releasedAt: referenceDate.toISOString(),
          },
          history: [
            ...(b.history || []),
            {
              timestamp: referenceDate.toISOString(),
              action: 'CHASSIS_HOLD_EXPIRED',
              performedBy: 'System Automation',
              notes: `48h chassis hold on ${b.allocation.vin} expired and was released back to inventory`,
            },
          ],
        };
      }
    }
    return b;
  });

  const heldExpiredVins = updatedBookings
    .filter((b) => b.allocation?.status === 'Hold_Expired')
    .map((b) => b.allocation?.vin);

  const updatedStock = vehicleStock.map((unit) => {
    const vin = unit.vin || unit.chassisNumber;
    if (heldExpiredVins.includes(vin) && unit.status === 'HELD') {
      stockChanged = true;
      return {
        ...unit,
        status: 'IN_STOCK',
        allocatedBookingId: null,
        holdUntil: null,
      };
    }
    return unit;
  });

  return {
    updatedBookings,
    updatedStock,
    hasChanges: stockChanged || bookingsChanged,
  };
}

