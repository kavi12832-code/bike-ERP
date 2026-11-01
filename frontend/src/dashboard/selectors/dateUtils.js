import {
  parseISO,
  isValid,
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  differenceInCalendarDays,
  format,
} from 'date-fns';

/**
 * Parses date inputs safely into a valid JavaScript Date
 */
export function parseDateSafe(input) {
  if (!input) return null;
  if (input instanceof Date) return isValid(input) ? input : null;
  try {
    const parsed = typeof input === 'string' ? parseISO(input) : new Date(input);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Returns Start of Day (00:00:00.000) for date
 */
export function getDayStart(dateInput = new Date()) {
  const d = parseDateSafe(dateInput) || new Date();
  return startOfDay(d);
}

/**
 * Returns End of Day (23:59:59.999) for date
 */
export function getDayEnd(dateInput = new Date()) {
  const d = parseDateSafe(dateInput) || new Date();
  return endOfDay(d);
}

/**
 * Checks if two dates fall on the exact same calendar day
 */
export function isSameCalendarDay(d1, d2) {
  const date1 = parseDateSafe(d1);
  const date2 = parseDateSafe(d2);
  if (!date1 || !date2) return false;

  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Checks if a date falls inside the inclusive range [start, end]
 */
export function isWithinRange(targetDate, startInput, endInput) {
  const target = parseDateSafe(targetDate);
  const start = getDayStart(startInput);
  const end = getDayEnd(endInput);
  if (!target || !start || !end) return false;

  const tTime = target.getTime();
  return tTime >= start.getTime() && tTime <= end.getTime();
}

/**
 * Standard Date Range Presets for the Dashboard:
 * - 'today'
 * - 'this_week' (Monday to Sunday)
 * - 'this_month' (1st of month to end of month)
 * - 'last_month' (1st to end of previous month)
 */
export function getDateRangePreset(presetKey = 'this_month', referenceDate = new Date()) {
  const ref = parseDateSafe(referenceDate) || new Date();

  switch (presetKey) {
    case 'today':
      return {
        key: 'today',
        label: 'Today',
        startDate: startOfDay(ref),
        endDate: endOfDay(ref),
        displayLabel: format(ref, 'dd MMM yyyy'),
      };

    case 'this_week': {
      // Monday to Sunday (weekStartsOn: 1)
      const start = startOfWeek(ref, { weekStartsOn: 1 });
      const end = endOfWeek(ref, { weekStartsOn: 1 });
      return {
        key: 'this_week',
        label: 'This Week',
        startDate: start,
        endDate: end,
        displayLabel: `${format(start, 'dd MMM')} – ${format(end, 'dd MMM yyyy')}`,
      };
    }

    case 'last_month': {
      const prevMonthRef = subMonths(ref, 1);
      const start = startOfMonth(prevMonthRef);
      const end = endOfMonth(prevMonthRef);
      return {
        key: 'last_month',
        label: 'Last Month',
        startDate: start,
        endDate: end,
        displayLabel: `${format(start, 'dd MMM')} – ${format(end, 'dd MMM yyyy')}`,
      };
    }

    case 'this_month':
    default: {
      const start = startOfMonth(ref);
      const end = endOfMonth(ref);
      return {
        key: 'this_month',
        label: 'This Month',
        startDate: start,
        endDate: end,
        displayLabel: `${format(start, 'dd MMM')} – ${format(end, 'dd MMM yyyy')}`,
      };
    }
  }
}

/**
 * Calculates the immediately preceding period of identical duration.
 * e.g. If current period is 30 days, returns the 30 days immediately before startDate.
 */
export function getPreviousPeriodRange(startDate, endDate) {
  const start = getDayStart(startDate);
  const end = getDayEnd(endDate);
  const days = Math.max(1, differenceInCalendarDays(end, start) + 1);

  const prevEnd = endOfDay(subDays(start, 1));
  const prevStart = startOfDay(subDays(prevEnd, days - 1));

  return {
    startDate: prevStart,
    endDate: prevEnd,
    days,
  };
}

/**
 * Calculates percentage change between current and previous values.
 * Returns null if previous value is undefined, null, or <= 0.
 * Eliminates repeated/hardcoded 12%.
 */
export function calculatePercentChange(current, previous) {
  if (previous == null || isNaN(previous) || previous <= 0) {
    return null;
  }
  if (current == null || isNaN(current)) {
    return null;
  }
  const diff = current - previous;
  const pct = (diff / previous) * 100;
  return Math.round(pct * 10) / 10; // one decimal place e.g. 12.5 or -5.0
}

/**
 * Formats Indian Currency in compact representation for chart axes & badges:
 * ₹5L, ₹10L, ₹1.5Cr, ₹45K, ₹850
 */
export function formatIndianCompact(rupees) {
  if (rupees == null || isNaN(rupees)) return '₹0';
  const val = Number(rupees);
  const isNeg = val < 0;
  const abs = Math.abs(val);

  let formatted = '';
  if (abs >= 10000000) {
    const cr = abs / 10000000;
    formatted = `${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(1)}Cr`;
  } else if (abs >= 100000) {
    const l = abs / 100000;
    formatted = `${l % 1 === 0 ? l.toFixed(0) : l.toFixed(1)}L`;
  } else if (abs >= 1000) {
    const k = abs / 1000;
    formatted = `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  } else {
    formatted = `${Math.round(abs)}`;
  }

  return `${isNeg ? '-' : ''}₹${formatted}`;
}

