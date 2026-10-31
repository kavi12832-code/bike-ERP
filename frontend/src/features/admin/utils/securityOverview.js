// src/features/admin/utils/securityOverview.js
/**
 * Dynamic Security Checklist & Risk Scoring Engine.
 * Explicit Requirement: "Security Overview: a computed checklist, not a hardcoded message...
 * 'System Secure' must only appear when there are zero findings."
 */

import { PRIVILEGED_ROLES } from '../../../config/usersConfig';

export function computeSecurityOverview(users = []) {
  const findings = [];
  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const fortyEightHoursMs = 48 * 60 * 60 * 1000;

  // 1. Privileged accounts without 2FA
  const privWithout2FA = users.filter(
    (u) =>
      PRIVILEGED_ROLES.includes(u.role) &&
      !u.twoFactor?.enabled &&
      u.status !== 'Inactive' &&
      u.status !== 'Locked'
  );
  if (privWithout2FA.length > 0) {
    findings.push({
      id: 'priv_no_2fa',
      severity: 'high',
      title: `${privWithout2FA.length} privileged account${privWithout2FA.length > 1 ? 's' : ''} without 2FA`,
      description: 'Super Admins, Managers and Accountants must enforce 2-Factor Authentication.',
      filter: { role: 'privileged', twoFactor: 'disabled' },
      count: privWithout2FA.length,
    });
  }

  // 2. Locked accounts requiring review
  const lockedAccounts = users.filter((u) => u.status === 'Locked');
  if (lockedAccounts.length > 0) {
    findings.push({
      id: 'locked_accounts',
      severity: 'medium',
      title: `${lockedAccounts.length} locked account${lockedAccounts.length > 1 ? 's' : ''} require security review`,
      description: 'Accounts locked due to repeated authentication failures.',
      filter: { status: 'Locked' },
      count: lockedAccounts.length,
    });
  }

  // 3. Accounts inactive for 30+ days
  const inactive30Days = users.filter((u) => {
    if (u.status !== 'Active') return false;
    const lastActive = u.lastActiveAt ? new Date(u.lastActiveAt).getTime() : 0;
    return lastActive > 0 && now - lastActive > thirtyDaysMs;
  });
  if (inactive30Days.length > 0) {
    findings.push({
      id: 'inactive_30_days',
      severity: 'medium',
      title: `${inactive30Days.length} active account${inactive30Days.length > 1 ? 's' : ''} inactive for 30+ days`,
      description: 'Stale credentials increase vulnerability surface area; deactivation recommended.',
      filter: { status: 'Active', inactive30Days: 'true' },
      count: inactive30Days.length,
    });
  }

  // 4. Users still on a temporary password
  const tempPasswordUsers = users.filter((u) => u.mustChangePassword && u.status === 'Active');
  if (tempPasswordUsers.length > 0) {
    findings.push({
      id: 'temp_password',
      severity: 'medium',
      title: `${tempPasswordUsers.length} user${tempPasswordUsers.length > 1 ? 's' : ''} still on temporary password`,
      description: 'Users have not set their permanent password after account creation.',
      filter: { mustChangePassword: 'true' },
      count: tempPasswordUsers.length,
    });
  }

  // 5. Pending invites older than 48 hours
  const expiredInvites = users.filter((u) => {
    if (u.status !== 'Invited') return false;
    const sentTime = u.invite?.sentAt ? new Date(u.invite.sentAt).getTime() : 0;
    return sentTime > 0 && now - sentTime > fortyEightHoursMs;
  });
  if (expiredInvites.length > 0) {
    findings.push({
      id: 'expired_invites',
      severity: 'low',
      title: `${expiredInvites.length} pending invite${expiredInvites.length > 1 ? 's' : ''} older than 48 hours`,
      description: 'Onboarding invitation tokens expired. Resend invite required.',
      filter: { status: 'Invited' },
      count: expiredInvites.length,
    });
  }

  // 6. Super Admin count audit
  const activeSuperAdmins = users.filter((u) => u.role === 'Super Admin' && u.status === 'Active');
  if (activeSuperAdmins.length === 1) {
    findings.push({
      id: 'single_super_admin',
      severity: 'medium',
      title: 'Only 1 active Super Admin configured',
      description: 'At least 2 Super Admins recommended to prevent single point of lockout.',
      filter: { role: 'Super Admin' },
      count: 1,
    });
  } else if (activeSuperAdmins.length > 3) {
    findings.push({
      id: 'too_many_super_admins',
      severity: 'medium',
      title: `${activeSuperAdmins.length} Super Admins active (exceeds recommended limit of 3)`,
      description: 'High number of full-privilege root accounts increases insider risk.',
      filter: { role: 'Super Admin' },
      count: activeSuperAdmins.length,
    });
  }

  // Overall State Calculation
  const hasHigh = findings.some((f) => f.severity === 'high');
  const hasMedium = findings.some((f) => f.severity === 'medium');

  let overallState = 'Secure';
  if (hasHigh) {
    overallState = 'At risk';
  } else if (hasMedium || findings.length > 0) {
    overallState = 'Needs attention';
  }

  return {
    findings,
    overallState, // 'Secure' | 'Needs attention' | 'At risk'
    count: findings.length,
    privilegedWithout2FACount: privWithout2FA.length,
  };
}

