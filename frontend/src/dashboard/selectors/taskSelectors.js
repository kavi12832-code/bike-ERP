import { parseDateSafe, isSameCalendarDay, getDayStart } from './dateUtils';
import { matchesBranch } from './kpiSelectors';
import { format } from 'date-fns';

/**
 * Upcoming Tasks Selector
 * Retrieves the next 3 uncompleted tasks for the current user & branch relative to today.
 */
export function getUpcomingTasks(
  tasks = [],
  currentUser = {},
  branchId = 'br-blr-central',
  referenceDate = new Date()
) {
  const ref = parseDateSafe(referenceDate) || new Date();
  const refStart = getDayStart(ref);

  // Filter tasks in scope
  const activeTasks = tasks.filter((t) => {
    if (t.completed) return false;
    if (!matchesBranch(t, branchId)) return false;

    // User scope: Super admin / managers see all, staff see own assigned tasks
    if (currentUser?.role !== 'Super Admin' && currentUser?.role !== 'Branch Manager') {
      const isAssigned =
        t.isMyTask ||
        t.assigneeId === currentUser?.id ||
        t.assignee === currentUser?.name ||
        t.assigneeRole === currentUser?.role;
      if (!isAssigned) return false;
    }

    return true;
  });

  // Sort by dueDate closest to reference date
  activeTasks.sort((a, b) => {
    const da = parseDateSafe(a.dueDate || a.date) || new Date(9999, 1, 1);
    const db = parseDateSafe(b.dueDate || b.date) || new Date(9999, 1, 1);
    return da.getTime() - db.getTime();
  });

  const next3 = activeTasks.slice(0, 3).map((task) => {
    const d = parseDateSafe(task.dueDate || task.date) || ref;
    const isToday = isSameCalendarDay(d, ref);

    return {
      id: task.id,
      title: task.title,
      module: task.module || 'TASK',
      priority: task.priority || 'MEDIUM',
      time: task.time || '10:00 AM',
      assignee: task.assignee || currentUser?.name || 'Staff',
      isToday,
      dateBadge: {
        day: format(d, 'dd'),
        month: format(d, 'MMM').toUpperCase(),
        dayName: format(d, 'EEE'),
      },
      entityLink: task.entityLink || '/tasks',
    };
  });

  return next3;
}

