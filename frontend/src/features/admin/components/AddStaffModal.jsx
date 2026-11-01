// src/features/admin/components/AddStaffModal.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  User,
  Shield,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Save,
  ChevronRight,
  ChevronLeft,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  HelpCircle,
  FileCheck,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/Button';
import { ROLES } from '../../../config/roles';
import { BRANCHES } from '../../../config/constants';
import {
  COMPANY_DOMAIN,
  ROLE_HIERARCHY,
  PRIVILEGED_ROLES,
  canAssignRole,
  isPrivilegedRole,
  getRoleCapabilities,
  validateLegalName,
  validateEmployeeCode,
  validateOfficialEmail,
  validateIndianMobile,
  formatIndianMobile,
  generateNextEmployeeCode,
} from '../../../config/usersConfig';
import {
  generateTemporaryPassword,
  hashPasswordPbkdf2,
  generateDemoStaff,
} from '../utils/cryptoDemo';

export function AddStaffModal({
  isOpen,
  onClose,
  onSaveUser,
  existingUsers = [],
  currentUser,
  editUser = null,
  onSaveDraft,
}) {
  if (!isOpen) return null;

  const isEdit = Boolean(editUser);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [saveAndAddAnother, setSaveAndAddAnother] = useState(false);

  // Form State
  const [fullName, setFullName] = useState(editUser?.fullName || editUser?.name || '');
  const [employeeCode, setEmployeeCode] = useState(
    editUser?.employeeCode || generateNextEmployeeCode(existingUsers)
  );
  const [email, setEmail] = useState(editUser?.email || '');
  const [phone, setPhone] = useState(editUser?.phone || '+91 ');
  const [joiningDate, setJoiningDate] = useState(
    editUser?.createdAt ? editUser.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [department, setDepartment] = useState(editUser?.department || 'Sales');
  const [designation, setDesignation] = useState(editUser?.designation || 'Sales Consultant');
  const [reportsToId, setReportsToId] = useState(editUser?.reportsToId || '');

  // Step 2: Role & Access
  const [role, setRole] = useState(editUser?.role || 'Sales Executive');
  const [discountLimit, setDiscountLimit] = useState(editUser?.limits?.discountLimit || 5000);
  const [approvalLimit, setApprovalLimit] = useState(editUser?.limits?.approvalLimit || 0);
  const [dataScope, setDataScope] = useState(editUser?.dataScope || 'Own records');
  const [showAdvancedOverrides, setShowAdvancedOverrides] = useState(false);
  const [permissionOverrides, setPermissionOverrides] = useState(
    editUser?.permissionOverrides || { add: [], remove: [] }
  );

  // Step 3: Branch & Security
  const [primaryBranchId, setPrimaryBranchId] = useState(
    editUser?.primaryBranchId || 'br-blr-central'
  );
  const [additionalBranchIds, setAdditionalBranchIds] = useState(
    editUser?.additionalBranchIds || []
  );
  const [employmentType, setEmploymentType] = useState(editUser?.employmentType || 'Full-time');
  const [shift, setShift] = useState(editUser?.shift || 'General (09:30 - 18:30)');
  const [twoFactorRequired, setTwoFactorRequired] = useState(
    editUser ? editUser.twoFactor?.required : true
  );
  const [twoFactorMethod, setTwoFactorMethod] = useState(
    editUser ? editUser.twoFactor?.method : 'TOTP'
  );
  const [twoFactorOffReason, setTwoFactorOffReason] = useState('');
  const [accountSetupMethod, setAccountSetupMethod] = useState('INVITE'); // INVITE | TEMP_PASSWORD
  const [tempPassword, setTempPassword] = useState('');
  const [copiedTempPassword, setCopiedTempPassword] = useState(false);
  const [createHrProfile, setCreateHrProfile] = useState(!editUser);
  const [welcomeChannel, setWelcomeChannel] = useState('EMAIL'); // EMAIL | WHATSAPP | BOTH

  // Form Errors
  const [errors, setErrors] = useState({});

  // Helper Initials
  const getInitials = (n) => {
    if (!n) return '??';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  // Determine if chosen role is privileged
  const isPrivileged = useMemo(() => isPrivilegedRole(role), [role]);

  // Lock 2FA to ON if privileged
  useEffect(() => {
    if (isPrivileged) {
      setTwoFactorRequired(true);
    }
  }, [isPrivileged]);

  // Generate temporary password if method chosen
  useEffect(() => {
    if (accountSetupMethod === 'TEMP_PASSWORD' && !tempPassword) {
      setTempPassword(generateTemporaryPassword());
    }
  }, [accountSetupMethod, tempPassword]);

  // Track unsaved changes
  const markDirty = () => setHasUnsavedChanges(true);

  // Keyboard navigation & Focus trap
  const modalRef = useRef(null);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (hasUnsavedChanges) {
          setShowCloseConfirm(true);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasUnsavedChanges, onClose]);

  // Step 1 Validation
  const validateStep1 = () => {
    const newErrors = {};
    const nameErr = validateLegalName(fullName);
    if (nameErr) newErrors.fullName = nameErr;

    const codeErr = validateEmployeeCode(employeeCode, existingUsers, editUser?.id);
    if (codeErr) newErrors.employeeCode = codeErr;

    const emailErr = validateOfficialEmail(email, existingUsers, editUser?.id);
    if (emailErr) newErrors.email = emailErr;

    const phoneErr = validateIndianMobile(phone, existingUsers, editUser?.id);
    if (phoneErr) newErrors.phone = phoneErr;

    if (!department) newErrors.department = 'Department is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    const newErrors = {};
    if (!role) newErrors.role = 'Role selection is required.';

    // Check privilege hierarchy
    const canAssign = canAssignRole(currentUser?.role || 'Super Admin', role);
    if (!canAssign) {
      newErrors.role = `Your persona (${currentUser?.role}) cannot assign the ${role} role (hierarchy restriction).`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 3 Validation
  const validateStep3 = () => {
    const newErrors = {};
    if (!primaryBranchId) newErrors.primaryBranchId = 'Primary branch is required.';
    if (!twoFactorRequired && !isPrivileged && !twoFactorOffReason.trim()) {
      newErrors.twoFactorOffReason = 'A recorded justification is required to disable 2FA.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    setCurrentStep((s) => Math.min(4, s + 1));
  };

  const handleBack = () => {
    setCurrentStep((s) => Math.max(1, s - 1));
  };

  // Auto-Fill Demo Staff handler
  const handleAutoFill = () => {
    const demo = generateDemoStaff(existingUsers);
    setFullName(demo.fullName);
    setEmail(demo.email);
    setPhone(demo.phone);
    setDepartment(demo.department);
    setDesignation(demo.designation);
    setRole(demo.role);
    setPrimaryBranchId(demo.primaryBranchId);
    markDirty();
    toast.success('Auto-filled demo staff details with non-colliding credentials!');
  };

  // Save as draft
  const handleSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft({
        fullName,
        employeeCode,
        email,
        phone,
        department,
        designation,
        role,
        primaryBranchId,
        additionalBranchIds,
        twoFactorRequired,
        accountSetupMethod,
        createHrProfile,
      });
      setHasUnsavedChanges(false);
      toast.info('Staff account saved as draft locally.');
      onClose();
    }
  };

  // Submit Final
  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      toast.error('Please resolve validation errors before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      let pwHash = null;
      if (accountSetupMethod === 'TEMP_PASSWORD') {
        pwHash = await hashPasswordPbkdf2(tempPassword);
      }

      const userData = {
        fullName: fullName.trim(),
        name: fullName.trim(),
        employeeCode: employeeCode.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        department,
        designation,
        reportsToId: reportsToId || null,
        role,
        discountLimit: Number(discountLimit) || 0,
        approvalLimit: Number(approvalLimit) || 0,
        dataScope,
        permissionOverrides,
        primaryBranchId,
        additionalBranchIds,
        employmentType,
        shift,
        twoFactorRequired,
        twoFactorEnabled: accountSetupMethod === 'TEMP_PASSWORD' ? false : false,
        twoFactorMethod,
        inviteMethod: accountSetupMethod,
        passwordHash: pwHash,
        mustChangePassword: accountSetupMethod === 'TEMP_PASSWORD',
        inviteChannel: welcomeChannel,
        createHrProfile,
      };

      await onSaveUser(userData, editUser?.id);
      setHasUnsavedChanges(false);

      if (saveAndAddAnother && !isEdit) {
        // Reset form for next entry
        setFullName('');
        setEmail('');
        setPhone('+91 ');
        setEmployeeCode(generateNextEmployeeCode([...existingUsers, { employeeCode }]));
        setCurrentStep(1);
        toast.success(`Account for ${userData.fullName} registered! Ready for next staff user.`);
      } else {
        onClose();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save staff user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Active role capabilities
  const roleCaps = useMemo(() => getRoleCapabilities(role), [role]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        ref={modalRef}
        className="w-full max-w-3xl bg-surface border border-border rounded-2xl shadow-dialog overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border bg-surface-subtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-main">
                {isEdit ? `Edit Staff: ${editUser.fullName || editUser.name}` : 'Enroll New Showroom Staff'}
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                {isEdit
                  ? 'Update staff credentials, branch permissions, and access controls.'
                  : '4-step onboarding wizard with role hierarchy enforcement and dual-control approvals.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEdit && (
              <button
                type="button"
                onClick={handleAutoFill}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors shadow-2xs"
                title="Generates non-colliding sample Indian staff data"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Auto-Fill Demo Staff</span>
                <span className="text-[9px] uppercase px-1 rounded bg-blue-200 font-extrabold">Demo only</span>
              </button>
            )}

            <button
              onClick={() => (hasUnsavedChanges ? setShowCloseConfirm(true) : onClose())}
              className="p-1.5 text-text-muted hover:text-text-main rounded-lg hover:bg-surface-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4-Step Stepper Progress Bar */}
        <div className="px-6 py-3 bg-surface border-b border-border/70 flex items-center justify-between text-xs font-semibold">
          {[
            { step: 1, label: 'Basic Details', icon: User },
            { step: 2, label: 'Role & Access', icon: Shield },
            { step: 3, label: 'Branch & Security', icon: Building2 },
            { step: 4, label: 'Review & Confirm', icon: FileCheck },
          ].map((item, idx) => {
            const Icon = item.icon;
            const isCompleted = currentStep > item.step;
            const isActive = currentStep === item.step;

            return (
              <React.Fragment key={item.step}>
                <div
                  onClick={() => {
                    if (isCompleted) setCurrentStep(item.step);
                  }}
                  className={`flex items-center gap-2 ${
                    isCompleted ? 'cursor-pointer text-primary' : isActive ? 'text-blue-600' : 'text-text-muted'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-surface-subtle border border-border text-text-muted'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : item.step}
                  </div>
                  <span className="hidden md:inline">{item.label}</span>
                </div>
                {idx < 3 && <ChevronRight className="w-4 h-4 text-border" />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Modal Body Container */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {/* STEP 1: BASIC DETAILS */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                {/* Avatar Preview */}
                <div className="sm:col-span-3 flex flex-col items-center justify-center p-4 border border-dashed border-border rounded-xl bg-surface-subtle text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 font-extrabold text-lg flex items-center justify-center shadow-xs">
                    {getInitials(fullName)}
                  </div>
                  <span className="text-[11px] font-medium text-text-muted mt-2">
                    Initials Avatar
                  </span>
                  <span className="text-[10px] text-text-muted/70">1 MB max photo upload</span>
                </div>

                {/* Name & Employee Code */}
                <div className="sm:col-span-9 space-y-3">
                  <div>
                    <label className="font-bold text-text-main block mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Babu"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        markDirty();
                      }}
                      className={`w-full p-2.5 rounded-lg border bg-surface text-text-main focus:outline-none focus:ring-1 ${
                        errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'
                      }`}
                    />
                    {errors.fullName && <p className="text-[11px] text-red-500 mt-1">{errors.fullName}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-text-main block mb-1">
                        Employee Code *
                        {currentUser?.role !== 'Super Admin' && (
                          <span className="text-[10px] text-text-muted font-normal ml-1">(auto-generated)</span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={employeeCode}
                        disabled={currentUser?.role !== 'Super Admin'}
                        onChange={(e) => {
                          setEmployeeCode(e.target.value);
                          markDirty();
                        }}
                        className="w-full p-2.5 rounded-lg border border-border bg-surface-subtle text-text-main font-mono disabled:opacity-75 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      {errors.employeeCode && (
                        <p className="text-[11px] text-red-500 mt-1">{errors.employeeCode}</p>
                      )}
                    </div>

                    <div>
                      <label className="font-bold text-text-main block mb-1">Date of Joining</label>
                      <input
                        type="date"
                        value={joiningDate}
                        onChange={(e) => {
                          setJoiningDate(e.target.value);
                          markDirty();
                        }}
                        className="w-full p-2.5 rounded-lg border border-border bg-surface text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Official Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-text-main block mb-1">
                    Official Email * <span className="text-text-muted font-normal">({COMPANY_DOMAIN})</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                    <input
                      type="email"
                      placeholder={`username${COMPANY_DOMAIN}`}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        markDirty();
                      }}
                      className={`w-full pl-9 pr-3 py-2.5 rounded-lg border bg-surface text-text-main focus:outline-none focus:ring-1 ${
                        errors.email ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="font-bold text-text-main block mb-1">
                    Mobile Phone * <span className="text-text-muted font-normal">(+91 10-digits)</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="+91 98450 77112"
                      value={phone}
                      onChange={(e) => {
                        setPhone(formatIndianMobile(e.target.value));
                        markDirty();
                      }}
                      className={`w-full pl-9 pr-3 py-2.5 rounded-lg border bg-surface text-text-main font-mono focus:outline-none focus:ring-1 ${
                        errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
                </div>
              </div>

              {/* Department, Designation & Reports To */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-text-main block mb-1">Department *</label>
                  <select
                    value={department}
                    onChange={(e) => {
                      setDepartment(e.target.value);
                      markDirty();
                    }}
                    className="w-full p-2.5 rounded-lg border border-border bg-surface text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Sales">Sales</option>
                    <option value="Service">Service</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Parts & Spares">Parts & Spares</option>
                    <option value="Accounts">Accounts</option>
                    <option value="Customer Care">Customer Care</option>
                    <option value="Management">Management</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-text-main block mb-1">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    placeholder="e.g. Senior Technician"
                    onChange={(e) => {
                      setDesignation(e.target.value);
                      markDirty();
                    }}
                    className="w-full p-2.5 rounded-lg border border-border bg-surface text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="font-bold text-text-main block mb-1">Reports To</label>
                  <select
                    value={reportsToId}
                    onChange={(e) => {
                      setReportsToId(e.target.value);
                      markDirty();
                    }}
                    className="w-full p-2.5 rounded-lg border border-border bg-surface text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select Reporting Manager...</option>
                    {existingUsers
                      .filter((u) => ['Super Admin', 'Branch Manager', 'Sales Manager', 'Service Manager'].includes(u.role))
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.fullName || u.name} ({u.role})
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ROLE & ACCESS */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {/* Role Persona Dropdown */}
              <div>
                <label className="font-bold text-text-main block mb-1">Role Persona *</label>
                <select
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    markDirty();
                  }}
                  className="w-full p-2.5 rounded-lg border border-border bg-surface text-text-main text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {Object.values(ROLES).map((r) => (
                    <option key={r} value={r}>
                      {r} {isPrivilegedRole(r) ? '★ (Privileged Role - Dual Control)' : ''}
                    </option>
                  ))}
                </select>
                {errors.role && <p className="text-[11px] text-red-500 mt-1">{errors.role}</p>}
              </div>

              {/* Privileged Role Warning Alert */}
              {isPrivileged && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div className="space-y-0.5">
                    <div className="font-bold text-[11px]">Privileged Role: Dual-Control Approval Required</div>
                    <div className="text-[11px] text-amber-800 leading-relaxed">
                      Creating or assigning this role ({role}) places the account in <strong>Pending approval</strong> status.
                      An authorization request will be dispatched to the Approvals Center. The account becomes active/invited only upon sign-off by a secondary administrator.
                    </div>
                  </div>
                </div>
              )}

              {/* Live "Can Do" & "Cannot See" Panels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Can Do */}
                <div className="p-3.5 rounded-xl border border-border bg-surface-subtle space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>What this role can do:</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-text-main">
                    {roleCaps.canDo.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cannot See */}
                <div className="p-3.5 rounded-xl border border-border bg-surface-subtle space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <X className="w-4 h-4 text-slate-500" />
                    <span>What this role cannot see:</span>
                  </div>
                  {roleCaps.cannotSee.length === 0 ? (
                    <p className="text-[11px] text-text-muted italic">Full access; no system boundaries restricted.</p>
                  ) : (
                    <ul className="space-y-1.5 text-[11px] text-text-muted">
                      {roleCaps.cannotSee.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-slate-400 font-bold">✕</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Limits and Data Scope */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="font-bold text-text-main block mb-1">
                    Discount Limit (INR)
                  </label>
                  <input
                    type="number"
                    value={discountLimit}
                    onChange={(e) => {
                      setDiscountLimit(e.target.value);
                      markDirty();
                    }}
                    placeholder="e.g. 5000"
                    className="w-full p-2.5 rounded-lg border border-border bg-surface text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="text-[10px] text-text-muted">Max retail concession allowed without approval</span>
                </div>

                <div>
                  <label className="font-bold text-text-main block mb-1">
                    Approval Limit (INR)
                  </label>
                  <input
                    type="number"
                    value={approvalLimit}
                    onChange={(e) => {
                      setApprovalLimit(e.target.value);
                      markDirty();
                    }}
                    placeholder="e.g. 100000"
                    className="w-full p-2.5 rounded-lg border border-border bg-surface text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="text-[10px] text-text-muted">Max financial transaction approval authority</span>
                </div>

                <div>
                  <label className="font-bold text-text-main block mb-1">Data Scope</label>
                  <select
                    value={dataScope}
                    onChange={(e) => {
                      setDataScope(e.target.value);
                      markDirty();
                    }}
                    className="w-full p-2.5 rounded-lg border border-border bg-surface text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Own records">Own records</option>
                    <option value="Branch">Assigned Branch</option>
                    <option value="All branches">All branches (Network-wide)</option>
                  </select>
                  <span className="text-[10px] text-text-muted">Scope of customer PII and records visible</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: BRANCH & SECURITY */}
          {currentStep === 3 && (
            <div className="space-y-4">
              {/* Branch Allocations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-text-main block mb-1">Primary Branch Hub *</label>
                  <select
                    value={primaryBranchId}
                    onChange={(e) => {
                      setPrimaryBranchId(e.target.value);
                      markDirty();
                    }}
                    className="w-full p-2.5 rounded-lg border border-border bg-surface text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {BRANCHES.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-text-main block mb-1">
                    Additional Branches <span className="text-text-muted font-normal">(Managers only)</span>
                  </label>
                  <div className="space-y-1.5 p-2 rounded-lg border border-border bg-surface max-h-24 overflow-y-auto">
                    {BRANCHES.filter((b) => b.id !== primaryBranchId).map((b) => (
                      <label key={b.id} className="flex items-center gap-2 cursor-pointer hover:bg-surface-subtle p-1 rounded">
                        <input
                          type="checkbox"
                          checked={additionalBranchIds.includes(b.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAdditionalBranchIds((prev) => [...prev, b.id]);
                            } else {
                              setAdditionalBranchIds((prev) => prev.filter((id) => id !== b.id));
                            }
                            markDirty();
                          }}
                          className="rounded text-primary focus:ring-primary"
                        />
                        <span className="text-text-main">{b.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2FA Enforcement */}
              <div className="p-4 rounded-xl border border-border bg-surface-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-text-main flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <span>Require Two-Factor Authentication (2FA)</span>
                      {isPrivileged && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          Mandatory for Privileged Roles
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-text-muted mt-0.5">
                      User will be required to configure their 2FA authenticator upon first login.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={twoFactorRequired}
                    disabled={isPrivileged}
                    onChange={(e) => {
                      setTwoFactorRequired(e.target.checked);
                      markDirty();
                    }}
                    className="w-4 h-4 text-primary rounded border-border focus:ring-primary cursor-pointer disabled:opacity-60"
                  />
                </div>

                {twoFactorRequired && (
                  <div className="flex items-center gap-4 pt-2 border-t border-border/60">
                    <span className="font-semibold text-text-main text-[11px]">Enforcement Method:</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="twofa_method"
                        checked={twoFactorMethod === 'TOTP'}
                        onChange={() => setTwoFactorMethod('TOTP')}
                        className="text-primary focus:ring-primary"
                      />
                      <span>Authenticator App (TOTP - Google/Microsoft)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="twofa_method"
                        checked={twoFactorMethod === 'SMS'}
                        onChange={() => setTwoFactorMethod('SMS')}
                        className="text-primary focus:ring-primary"
                      />
                      <span>SMS OTP</span>
                    </label>
                  </div>
                )}

                {!twoFactorRequired && !isPrivileged && (
                  <div>
                    <label className="font-bold text-red-600 block mb-1">
                      Reason for Disabling 2FA * (Audited)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Temporary contractor shared kiosk account"
                      value={twoFactorOffReason}
                      onChange={(e) => setTwoFactorOffReason(e.target.value)}
                      className="w-full p-2 rounded-lg border border-red-300 bg-surface text-text-main focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                    {errors.twoFactorOffReason && (
                      <p className="text-[11px] text-red-500 mt-1">{errors.twoFactorOffReason}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Account Setup Method: Invite Link vs Temporary Password */}
              <div className="p-4 rounded-xl border border-border bg-surface space-y-3">
                <div className="font-bold text-text-main">Account Credential Provisioning</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setAccountSetupMethod('INVITE')}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      accountSetupMethod === 'INVITE'
                        ? 'bg-blue-50/70 border-blue-400 ring-1 ring-blue-400'
                        : 'bg-surface-subtle border-border hover:bg-surface-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-text-main">
                      <input
                        type="radio"
                        checked={accountSetupMethod === 'INVITE'}
                        onChange={() => setAccountSetupMethod('INVITE')}
                        className="text-primary"
                      />
                      <span>Send Secure Invite Link (Recommended)</span>
                    </div>
                    <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                      Generates a cryptographically signed onboarding link valid for 48 hours. Staff sets their own password.
                    </p>
                  </div>

                  <div
                    onClick={() => setAccountSetupMethod('TEMP_PASSWORD')}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      accountSetupMethod === 'TEMP_PASSWORD'
                        ? 'bg-blue-50/70 border-blue-400 ring-1 ring-blue-400'
                        : 'bg-surface-subtle border-border hover:bg-surface-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-text-main">
                      <input
                        type="radio"
                        checked={accountSetupMethod === 'TEMP_PASSWORD'}
                        onChange={() => setAccountSetupMethod('TEMP_PASSWORD')}
                        className="text-primary"
                      />
                      <span>Generate Temporary Password</span>
                    </div>
                    <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                      Displayed once for manual onboarding. Forces password reset immediately on first login.
                    </p>
                  </div>
                </div>

                {accountSetupMethod === 'TEMP_PASSWORD' && (
                  <div className="p-3 rounded-lg bg-surface-subtle border border-border flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-text-muted uppercase">Generated Temporary Password</span>
                      <div className="font-mono font-bold text-sm text-text-main mt-0.5">{tempPassword}</div>
                      <span className="text-[10px] text-text-muted">Salted PBKDF2 hash stored (demo authentication only)</span>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={copiedTempPassword ? Check : Copy}
                      onClick={() => {
                        navigator.clipboard.writeText(tempPassword);
                        setCopiedTempPassword(true);
                        toast.success('Temporary password copied to clipboard!');
                        setTimeout(() => setCopiedTempPassword(false), 2000);
                      }}
                    >
                      {copiedTempPassword ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Create HR Profile Toggle */}
              <div className="p-3.5 rounded-xl border border-border bg-surface-subtle flex items-center justify-between">
                <div>
                  <div className="font-bold text-text-main">Create Linked HR &amp; Incentives Profile</div>
                  <div className="text-[11px] text-text-muted mt-0.5">
                    Automatically initializes attendance card and monthly sales/service quota tracking. Base salary remains confidential in HR.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={createHrProfile}
                  onChange={(e) => setCreateHrProfile(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-border focus:ring-primary cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & CONFIRM */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-surface-subtle border border-border space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                      {getInitials(fullName)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-text-main">{fullName}</h4>
                      <p className="text-[11px] text-text-muted">{email} • {phone}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                    {role}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                  <div>
                    <span className="text-text-muted">Employee Code:</span>
                    <div className="font-mono font-bold text-text-main">{employeeCode}</div>
                  </div>
                  <div>
                    <span className="text-text-muted">Department:</span>
                    <div className="font-bold text-text-main">{department}</div>
                  </div>
                  <div>
                    <span className="text-text-muted">Branch Hub:</span>
                    <div className="font-bold text-text-main">
                      {BRANCHES.find((b) => b.id === primaryBranchId)?.name || 'Bangalore Central'}
                    </div>
                  </div>
                  <div>
                    <span className="text-text-muted">2FA Policy:</span>
                    <div className="font-bold text-emerald-600">
                      {twoFactorRequired ? `Enforced (${twoFactorMethod})` : 'Disabled'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Approvals Preview */}
              {isPrivileged ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1.5">
                  <div className="font-bold flex items-center gap-2 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Action Summary: Submitting for Dual-Control Review</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    This account will be created with status <strong>Pending approval</strong>. A dual-control ticket (rule: "Privileged role creation")
                    will be created in the Approvals Center. As the creator, you cannot approve your own request.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1.5">
                  <div className="font-bold flex items-center gap-2 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Action Summary: Direct Provisioning Ready</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    {accountSetupMethod === 'INVITE'
                      ? 'A secure invitation token will be dispatched. Account status will be Active/Invited.'
                      : 'Temporary password created. User will be mandated to change password on initial sign-in.'}
                  </p>
                </div>
              )}

              {/* Save & add another checkbox */}
              {!isEdit && (
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="addAnother"
                    checked={saveAndAddAnother}
                    onChange={(e) => setSaveAndAddAnother(e.target.checked)}
                    className="w-4 h-4 text-primary rounded border-border focus:ring-primary cursor-pointer"
                  />
                  <label htmlFor="addAnother" className="text-xs text-text-main font-medium cursor-pointer">
                    Save &amp; add another staff member after submitting
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-border bg-surface-subtle flex items-center justify-between">
          <div>
            {!isEdit && (
              <button
                type="button"
                onClick={handleSaveDraft}
                className="text-xs font-semibold text-text-muted hover:text-text-main flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save as draft</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <Button variant="secondary" size="sm" icon={ChevronLeft} onClick={handleBack}>
                Back
              </Button>
            )}

            {currentStep < 4 ? (
              <Button variant="primary" size="sm" onClick={handleNext}>
                <span>Next</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting
                  ? 'Processing...'
                  : isPrivileged
                  ? 'Submit for Approval'
                  : accountSetupMethod === 'INVITE'
                  ? 'Send Invite'
                  : 'Create Account'}
              </Button>
            )}
          </div>
        </div>

        {/* Confirmation modal on closing with unsaved changes */}
        {showCloseConfirm && (
          <div className="absolute inset-0 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-surface border border-border rounded-xl p-5 max-w-sm w-full space-y-3 shadow-dialog">
              <h4 className="font-bold text-text-main text-sm">Discard Unsaved Changes?</h4>
              <p className="text-xs text-text-muted">
                You have started enrolling a staff user. Are you sure you want to exit without saving?
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" size="sm" onClick={() => setShowCloseConfirm(false)}>
                  Continue Editing
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setShowCloseConfirm(false);
                    onClose();
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Discard
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddStaffModal;

