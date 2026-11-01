import { DEFAULT_ROLE_PERMISSIONS, PERMISSIONS } from '../config/permissions';
import { ROLES } from '../config/roles';

export function hasPermission(user, permissionCode, context = {}) {
  if (!user) return false;
  if (user.role === ROLES.SUPER_ADMIN || user.role === 'Super Admin') return true;

  const userPerms = user.permissions || DEFAULT_ROLE_PERMISSIONS[user.role] || [];
  if (userPerms.includes(permissionCode)) {
    // Check specific fine-grained ownership rules if applicable
    if (permissionCode === PERMISSIONS.LEAD_VIEW_OWN && context.ownerId) {
      return context.ownerId === user.id;
    }
    if (permissionCode === PERMISSIONS.JOBCARD_VIEW_OWN && context.technicianId) {
      return context.technicianId === user.id;
    }
    if (permissionCode === PERMISSIONS.QUOTATIONS_VIEW_OWN && context.salespersonId) {
      return context.salespersonId === user.id;
    }
    if (permissionCode === PERMISSIONS.QUOTATIONS_EDIT_OWN && context.salespersonId) {
      return context.salespersonId === user.id;
    }
    if (permissionCode === PERMISSIONS.BOOKINGS_VIEW_OWN && context.salespersonId) {
      return context.salespersonId === user.id;
    }
    return true;
  }

  // Approvals hierarchy
  if (userPerms.includes(PERMISSIONS.APPROVALS_MANAGE) && permissionCode.startsWith('approvals.')) {
    return true;
  }
  if (permissionCode === PERMISSIONS.APPROVALS_VIEW_OWN && (userPerms.includes(PERMISSIONS.APPROVALS_VIEW_ALL) || userPerms.includes(PERMISSIONS.APPROVALS_VIEW_BRANCH))) {
    return true;
  }
  if (permissionCode === PERMISSIONS.APPROVALS_VIEW_BRANCH && userPerms.includes(PERMISSIONS.APPROVALS_VIEW_ALL)) {
    return true;
  }

  // Quotations hierarchy
  if (permissionCode === PERMISSIONS.QUOTATIONS_VIEW_OWN && (userPerms.includes(PERMISSIONS.QUOTATIONS_VIEW_ALL) || userPerms.includes(PERMISSIONS.QUOTATIONS_VIEW_BRANCH))) {
    return true;
  }
  if (permissionCode === PERMISSIONS.QUOTATIONS_VIEW_BRANCH && userPerms.includes(PERMISSIONS.QUOTATIONS_VIEW_ALL)) {
    return true;
  }
  if (permissionCode === PERMISSIONS.QUOTATIONS_EDIT_OWN && userPerms.includes(PERMISSIONS.QUOTATIONS_EDIT_ANY)) {
    return true;
  }

  // Bookings hierarchy
  if (permissionCode === PERMISSIONS.BOOKINGS_VIEW_OWN && (userPerms.includes(PERMISSIONS.BOOKINGS_VIEW_ALL) || userPerms.includes(PERMISSIONS.BOOKINGS_VIEW_BRANCH))) {
    return true;
  }
  if (permissionCode === PERMISSIONS.BOOKINGS_VIEW_BRANCH && userPerms.includes(PERMISSIONS.BOOKINGS_VIEW_ALL)) {
    return true;
  }
  if (permissionCode === PERMISSIONS.BOOKINGS_EDIT && (userPerms.includes(PERMISSIONS.BOOKINGS_VIEW_ALL) || userPerms.includes(PERMISSIONS.BOOKINGS_VIEW_BRANCH))) {
    return true;
  }

  // If user has view_all, they satisfy view_own
  if (permissionCode === PERMISSIONS.LEAD_VIEW_OWN && userPerms.includes(PERMISSIONS.LEAD_VIEW_ALL)) {
    return true;
  }
  if (permissionCode === PERMISSIONS.JOBCARD_VIEW_OWN && userPerms.includes(PERMISSIONS.JOBCARD_VIEW_ALL)) {
    return true;
  }

  return false;
}

export const can = hasPermission;

export function canViewCost(user) {
  return hasPermission(user, PERMISSIONS.COST_VIEW);
}

export function canViewFullPhone(user) {
  return (
    hasPermission(user, PERMISSIONS.CUSTOMER_PHONE_VIEW_FULL) ||
    hasPermission(user, PERMISSIONS.QUOTATIONS_VIEW_CUSTOMER_PHONE) ||
    hasPermission(user, PERMISSIONS.BOOKINGS_VIEW_CUSTOMER_PHONE)
  );
}

export function maskPhone(phone) {
  if (!phone) return '—';
  const clean = String(phone).trim();
  if (clean.length < 5) return '•••••';
  if (clean.startsWith('+91')) {
    const digits = clean.replace(/\D/g, '').slice(2);
    return `+91 ${digits.slice(0, 5)} XXXXX`;
  }
  const digits = clean.replace(/\D/g, '');
  if (digits.length >= 10) {
    return `+91 ${digits.slice(0, 5)} XXXXX`;
  }
  return clean.slice(0, 3) + '••••' + clean.slice(-2);
}
