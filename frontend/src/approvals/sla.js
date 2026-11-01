// src/approvals/sla.js
/**
 * Business-hours SLA calculation engine.
 * Hours: Mon-Sat 09:30 - 19:00 IST (570 business minutes/day). Sunday off.
 * Explicit Rule: Closed requests NEVER show SLA remaining or overdue.
 * Includes dev-only simulated clock control.
 */

import { BUSINESS_HOURS, APPROVAL_STATUS } from './config';

const DEV_CLOCK_KEY = 'approvals_dev_clock_offset_ms';

export function getSimulatedNow() {
  const offset = parseInt(sessionStorage.getItem(DEV_CLOCK_KEY) || '0', 10);
  return new Date(Date.now() + offset);
}

export function advanceDevClock(minutes) {
  const currentOffset = parseInt(sessionStorage.getItem(DEV_CLOCK_KEY) || '0', 10);
  const newOffset = currentOffset + minutes * 60 * 1000;
  sessionStorage.setItem(DEV_CLOCK_KEY, String(newOffset));
  return new Date(Date.now() + newOffset);
}

export function resetDevClock() {
  sessionStorage.removeItem(DEV_CLOCK_KEY);
  return new Date();
}

/**
 * Check if a given Date is within business hours (Mon-Sat 09:30 - 19:00 IST)
 */
export function isWithinBusinessHours(date) {
  const day = date.getDay(); // 0 is Sunday
  if (!BUSINESS_HOURS.WORKING_DAYS.includes(day)) return false;

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  const startMinutes = BUSINESS_HOURS.START_HOUR * 60 + BUSINESS_HOURS.START_MINUTE; // 570
  const endMinutes = BUSINESS_HOURS.END_HOUR * 60 + BUSINESS_HOURS.END_MINUTE;       // 1140

  return timeInMinutes >= startMinutes && timeInMinutes < endMinutes;
}

/**
 * Add business hours to a start date to calculate dueAt
 */
export function addBusinessHours(startDate, businessHours) {
  let targetMinutes = Math.round(businessHours * 60);
  let cursor = new Date(startDate.getTime());

  // If start is before business hours on a work day, fast forward to 09:30
  // If start is after business hours or on Sunday, fast forward to next work day 09:30
  while (targetMinutes > 0) {
    const day = cursor.getDay();
    if (!BUSINESS_HOURS.WORKING_DAYS.includes(day)) {
      // Advance to next day 09:30
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(BUSINESS_HOURS.START_HOUR, BUSINESS_HOURS.START_MINUTE, 0, 0);
      continue;
    }

    const currentMinutes = cursor.getHours() * 60 + cursor.getMinutes();
    const dayStartMinutes = BUSINESS_HOURS.START_HOUR * 60 + BUSINESS_HOURS.START_MINUTE;
    const dayEndMinutes = BUSINESS_HOURS.END_HOUR * 60 + BUSINESS_HOURS.END_MINUTE;

    if (currentMinutes < dayStartMinutes) {
      cursor.setHours(BUSINESS_HOURS.START_HOUR, BUSINESS_HOURS.START_MINUTE, 0, 0);
      continue;
    }

    if (currentMinutes >= dayEndMinutes) {
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(BUSINESS_HOURS.START_HOUR, BUSINESS_HOURS.START_MINUTE, 0, 0);
      continue;
    }

    // Minutes remaining in today's business window
    const availableToday = dayEndMinutes - currentMinutes;
    if (targetMinutes <= availableToday) {
      cursor.setMinutes(cursor.getMinutes() + targetMinutes);
      targetMinutes = 0;
    } else {
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(BUSINESS_HOURS.START_HOUR, BUSINESS_HOURS.START_MINUTE, 0, 0);
      targetMinutes -= availableToday;
    }
  }

  return cursor;
}

/**
 * Calculate elapsed business minutes between two dates
 */
export function getBusinessMinutesBetween(start, end) {
  if (end <= start) return 0;
  let totalMinutes = 0;
  let cursor = new Date(start.getTime());

  while (cursor < end) {
    const day = cursor.getDay();
    if (!BUSINESS_HOURS.WORKING_DAYS.includes(day)) {
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(BUSINESS_HOURS.START_HOUR, BUSINESS_HOURS.START_MINUTE, 0, 0);
      continue;
    }

    const currentMins = cursor.getHours() * 60 + cursor.getMinutes();
    const dayStartMins = BUSINESS_HOURS.START_HOUR * 60 + BUSINESS_HOURS.START_MINUTE;
    const dayEndMins = BUSINESS_HOURS.END_HOUR * 60 + BUSINESS_HOURS.END_MINUTE;

    if (currentMins < dayStartMins) {
      cursor.setHours(BUSINESS_HOURS.START_HOUR, BUSINESS_HOURS.START_MINUTE, 0, 0);
      continue;
    }

    if (currentMins >= dayEndMins) {
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(BUSINESS_HOURS.START_HOUR, BUSINESS_HOURS.START_MINUTE, 0, 0);
      continue;
    }

    // Next boundary is either end or day's close
    const nextDayClose = new Date(cursor.getTime());
    nextDayClose.setHours(BUSINESS_HOURS.END_HOUR, BUSINESS_HOURS.END_MINUTE, 0, 0);

    const stepTarget = end < nextDayClose ? end : nextDayClose;
    const chunkMs = stepTarget.getTime() - cursor.getTime();
    const chunkMins = Math.floor(chunkMs / 60000);

    totalMinutes += chunkMins;
    cursor = new Date(stepTarget.getTime());

    if (cursor.getTime() === nextDayClose.getTime()) {
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(BUSINESS_HOURS.START_HOUR, BUSINESS_HOURS.START_MINUTE, 0, 0);
    }
  }

  return totalMinutes;
}

/**
 * Format minutes into readable business duration string (e.g. "3h 12m", "45m")
 */
export function formatDuration(minutes) {
  const m = Math.max(0, Math.round(minutes));
  const hrs = Math.floor(m / 60);
  const mins = m % 60;
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

/**
 * Derive full SLA State object for a given request.
 */
export function computeRequestSla(request, referenceNow = getSimulatedNow()) {
  const isClosed = [
    APPROVAL_STATUS.APPROVED,
    APPROVAL_STATUS.REJECTED,
    APPROVAL_STATUS.CANCELLED,
    APPROVAL_STATUS.EXPIRED,
  ].includes(request.status);

  const createdAt = new Date(request.createdAt);
  const dueAt = request.sla?.dueAt ? new Date(request.sla.dueAt) : addBusinessHours(createdAt, 6);
  const totalBusinessMinutes = request.sla?.businessMinutes || 360; // 6h default

  // CASE 1: Closed Request -> NEVER show SLA remaining or overdue
  if (isClosed) {
    const decidedAt = request.decidedAt ? new Date(request.decidedAt) : referenceNow;
    const turnaroundMinutes = getBusinessMinutesBetween(createdAt, decidedAt);
    const wasWithinSla = decidedAt <= dueAt;

    return {
      isClosed: true,
      turnaroundMinutes,
      turnaroundText: formatDuration(turnaroundMinutes),
      wasWithinSla,
      statusLabel: wasWithinSla ? 'Within SLA' : 'Exceeded SLA',
      statusColor: wasWithinSla ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 bg-slate-100',
    };
  }

  // CASE 2: Clock Paused (Returned for changes)
  if (request.status === APPROVAL_STATUS.RETURNED) {
    return {
      isClosed: false,
      isPaused: true,
      label: 'Clock paused',
      subText: 'Waiting for requester resubmission',
      pillColor: 'bg-blue-50 text-blue-700 border-blue-200',
      escalationText: request.sla?.escalationTarget
        ? `Escalates to ${request.sla.escalationTarget} on resume`
        : 'SLA paused',
    };
  }

  // CASE 3: Open Request (Pending / Escalated)
  const remainingMinutes = getBusinessMinutesBetween(referenceNow, dueAt);
  const isOverdue = referenceNow > dueAt;

  if (isOverdue) {
    const overdueMinutes = getBusinessMinutesBetween(dueAt, referenceNow);
    return {
      isClosed: false,
      isOverdue: true,
      isDueSoon: false,
      remainingMinutes: 0,
      overdueMinutes,
      label: `Overdue by ${formatDuration(overdueMinutes)}`,
      pillColor: 'bg-red-50 text-red-700 border-red-200',
      escalationText: request.sla?.escalationTarget
        ? `Escalates to ${request.sla.escalationTarget} at ${formatDuration(totalBusinessMinutes)}`
        : 'Action required immediately',
    };
  }

  // Check if under 25% remaining (Due Soon)
  const isDueSoon = remainingMinutes <= totalBusinessMinutes * 0.25;

  return {
    isClosed: false,
    isOverdue: false,
    isDueSoon,
    remainingMinutes,
    label: isDueSoon ? `Due soon (${formatDuration(remainingMinutes)} left)` : `${formatDuration(remainingMinutes)} left`,
    pillColor: isDueSoon
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200',
    escalationText: request.sla?.escalationTarget
      ? `Escalates to ${request.sla.escalationTarget} at ${formatDuration(totalBusinessMinutes)}`
      : 'Within scheduled SLA',
  };
}

