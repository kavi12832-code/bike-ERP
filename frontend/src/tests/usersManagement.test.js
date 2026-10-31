import { describe, it, expect } from 'vitest';
import {
  SHOW_KPI_TRENDS,
  COMPANY_DOMAIN,
  PRIVILEGED_ROLES,
  validateLegalName,
  validateEmployeeCode,
  validateOfficialEmail,
  validateIndianMobile,
  formatIndianMobile,
  isPrivilegedRole,
  canAssignRole,
  ROLE_CAPABILITIES,
} from '../config/usersConfig.js';
import {
  generateTemporaryPassword,
  hashPasswordPbkdf2,
  generateDemoStaff,
} from '../features/admin/utils/cryptoDemo.js';
import { computeSecurityOverview } from '../features/admin/utils/securityOverview.js';
import { SEEDED_USERS } from '../data/usersSeed.js';

describe('Users Management & Security Configuration', () => {
  describe('Configuration Flags & Policy', () => {
    it('enforces SHOW_KPI_TRENDS = false to satisfy explicit no-graph/trend requirement', () => {
      expect(SHOW_KPI_TRENDS).toBe(false);
    });

    it('enforces official company email domain @akashbajaj.com', () => {
      expect(COMPANY_DOMAIN).toBe('@akashbajaj.com');
    });

    it('identifies privileged administrative roles correctly', () => {
      expect(PRIVILEGED_ROLES).toContain('Super Admin');
      expect(PRIVILEGED_ROLES).toContain('Branch Manager');
      expect(PRIVILEGED_ROLES).toContain('Sales Manager');
      expect(PRIVILEGED_ROLES).toContain('Service Manager');
      expect(PRIVILEGED_ROLES).toContain('Accountant');
      expect(isPrivilegedRole('Super Admin')).toBe(true);
      expect(isPrivilegedRole('Technician')).toBe(false);
      expect(isPrivilegedRole('Sales Executive')).toBe(false);
    });
  });

  describe('Field Validators', () => {
    it('validates legal full names correctly (returns null when valid, string when invalid)', () => {
      expect(validateLegalName('Rajesh Varma')).toBeNull();
      expect(validateLegalName('A')).toBe('Name must be at least 2 characters.');
      expect(validateLegalName('')).toBe('Full legal name is required.');
      expect(validateLegalName('John123')).toBe('Name contains invalid characters.');
    });

    it('validates employee codes correctly', () => {
      expect(validateEmployeeCode('EMP-2026-0001')).toBeNull();
      expect(validateEmployeeCode('EMP-2026')).toBeNull();
      expect(validateEmployeeCode('AB')).toBe('Format should be EMP-YYYY-XXXX (e.g. EMP-2026-0043).');
      expect(validateEmployeeCode('')).toBe('Employee code is required.');

      // Duplicate check
      const users = [{ id: 'u1', employeeCode: 'EMP-2026-0001', name: 'Rajesh' }];
      expect(validateEmployeeCode('EMP-2026-0001', users)).toContain('already assigned');
      expect(validateEmployeeCode('EMP-2026-0001', users, 'u1')).toBeNull(); // Self edit
    });

    it('validates official company emails strictly', () => {
      expect(validateOfficialEmail('rajesh.varma@akashbajaj.com')).toBeNull();
      expect(validateOfficialEmail('invalid-email')).toBe('Please enter a valid email address.');
      expect(validateOfficialEmail('john.doe@gmail.com')).toContain('Email must use company domain');

      // Duplicate check
      const users = [{ id: 'u1', email: 'rajesh.varma@akashbajaj.com', name: 'Rajesh' }];
      expect(validateOfficialEmail('rajesh.varma@akashbajaj.com', users)).toContain('already registered');
      expect(validateOfficialEmail('rajesh.varma@akashbajaj.com', users, 'u1')).toBeNull();
    });

    it('validates and formats Indian mobile numbers', () => {
      expect(validateIndianMobile('+91 98450 11001')).toBeNull();
      expect(validateIndianMobile('9845011001')).toBeNull();
      expect(validateIndianMobile('5845011001')).toBe('Enter a valid 10-digit Indian mobile starting with 6-9.');
      expect(validateIndianMobile('12345')).toBe('Enter a valid 10-digit Indian mobile starting with 6-9.');

      expect(formatIndianMobile('9845011001')).toBe('+91 98450 11001');
      expect(formatIndianMobile('+919845011001')).toBe('+91 98450 11001');
    });
  });

  describe('Role Hierarchy & Privilege Delegation', () => {
    it('allows Super Admin to assign any role', () => {
      expect(canAssignRole('Super Admin', 'Super Admin')).toBe(true);
      expect(canAssignRole('Super Admin', 'Branch Manager')).toBe(true);
      expect(canAssignRole('Super Admin', 'Sales Executive')).toBe(true);
    });

    it('restricts Branch Manager from assigning Super Admin', () => {
      expect(canAssignRole('Branch Manager', 'Super Admin')).toBe(false);
      expect(canAssignRole('Branch Manager', 'Sales Manager')).toBe(true);
      expect(canAssignRole('Branch Manager', 'Technician')).toBe(true);
    });

    it('prevents non-supervisors from assigning roles', () => {
      expect(canAssignRole('Technician', 'Technician')).toBe(false);
      expect(canAssignRole('Sales Executive', 'Sales Executive')).toBe(false);
    });

    it('provides role capabilities (canDo vs cannotSee) for each role', () => {
      expect(ROLE_CAPABILITIES['Super Admin'].canDo.length).toBeGreaterThan(0);
      expect(ROLE_CAPABILITIES['Super Admin'].cannotSee.length).toBe(0);
      expect(ROLE_CAPABILITIES['Technician'].canDo.length).toBeGreaterThan(0);
      expect(ROLE_CAPABILITIES['Technician'].cannotSee.length).toBeGreaterThan(0);
    });
  });

  describe('Crypto & Demo Authentication Utilities', () => {
    it('generates secure temporary passwords with required complexity', () => {
      const tempPass = generateTemporaryPassword();
      expect(tempPass.length).toBe(12);
      expect(/[A-Z]/.test(tempPass)).toBe(true);
      expect(/[a-z]/.test(tempPass)).toBe(true);
      expect(/[0-9]/.test(tempPass)).toBe(true);
      expect(/[@#$%&*!]/.test(tempPass)).toBe(true);
    });

    it('hashes passwords using PBKDF2 simulated demo format', async () => {
      const hash = await hashPasswordPbkdf2('SecurePass123!');
      expect(hash.startsWith('pbkdf2_sha256$10000$')).toBe(true);
      expect(hash.includes('demo')).toBe(true);
      expect(hash.endsWith('(demo authentication only)')).toBe(true);
    });

    it('generates unique realistic Indian demo staff profiles', () => {
      const existingUsers = [{ email: 'rajesh.varma@akashbajaj.com', phone: '+91 98450 11001' }];
      const demo = generateDemoStaff(existingUsers);
      expect(demo.name).toBeDefined();
      expect(demo.email.endsWith('@akashbajaj.com')).toBe(true);
      expect(demo.email).not.toBe('rajesh.varma@akashbajaj.com');
      expect(demo.phone.startsWith('+91 ')).toBe(true);
      expect(demo.department).toBeDefined();
    });
  });

  describe('Security Overview Computation', () => {
    it('evaluates security warnings on seeded users dataset', () => {
      const overview = computeSecurityOverview(SEEDED_USERS);
      expect(overview.findings.length).toBeGreaterThan(0);
      expect(['Needs attention', 'At risk']).toContain(overview.overallState);

      // Verify privileged without 2FA rule triggered
      const privFinding = overview.findings.find((f) => f.id === 'priv_no_2fa');
      expect(privFinding).toBeDefined();
      expect(privFinding.severity).toBe('high');
      expect(privFinding.count).toBe(2); // Suresh G. and Vikram Sethi

      // Verify locked accounts rule triggered
      const lockedFinding = overview.findings.find((f) => f.id === 'locked_accounts');
      expect(lockedFinding).toBeDefined();
      expect(lockedFinding.count).toBe(2); // Karthik Raja and Vikram Malhotra
    });

    it('derives System Secure state ONLY when findings count is 0', () => {
      const idealUsers = [
        {
          id: 'u1',
          name: 'Super Admin 1',
          role: 'Super Admin',
          status: 'Active',
          twoFactor: { enabled: true, required: true },
          mustChangePassword: false,
          lastActiveAt: new Date().toISOString(),
        },
        {
          id: 'u2',
          name: 'Super Admin 2',
          role: 'Super Admin',
          status: 'Active',
          twoFactor: { enabled: true, required: true },
          mustChangePassword: false,
          lastActiveAt: new Date().toISOString(),
        },
        {
          id: 'u3',
          name: 'Technician 1',
          role: 'Technician',
          status: 'Active',
          twoFactor: { enabled: false, required: false },
          mustChangePassword: false,
          lastActiveAt: new Date().toISOString(),
        },
      ];

      const overview = computeSecurityOverview(idealUsers);
      expect(overview.findings.length).toBe(0);
      expect(overview.overallState).toBe('Secure');
    });
  });
});
