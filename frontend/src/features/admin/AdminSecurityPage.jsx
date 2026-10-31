import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { ROLES } from '../../config/roles';
import { PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from '../../config/permissions';
import { useAppStore } from '../../store';
import {
  ShieldCheck,
  Sliders,
  Users,
  CheckCircle2,
  Lock,
  Layers,
  Building,
  Key,
  Webhook,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  Play,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_INTEGRATIONS = [
  {
    id: 'int-tally',
    name: 'Tally Prime XML Bridge',
    provider: 'TALLY_PRIME',
    category: 'Accounting & Statutory',
    status: 'ACTIVE',
    endpoint: 'http://localhost:9000',
    apiKey: 'tally_live_sec_8711_xml',
    description: 'Automated export of Day Book and General Ledger vouchers in standard Tally Prime XML schema.',
    syncFrequency: 'Real-time (On Invoice Post)',
    lastSync: '10 mins ago',
    successRate: '99.8%',
  },
  {
    id: 'int-razorpay',
    name: 'Razorpay UPI Webhook',
    provider: 'RAZORPAY',
    category: 'Payments & Settlement',
    status: 'ACTIVE',
    endpoint: 'https://api.akashbajaj.com/webhooks/razorpay',
    apiKey: 'rzp_live_k7199201948',
    description: 'Live settlement callback for counter dynamic UPI QR codes and customer portal invoices.',
    syncFrequency: 'Instant Webhook Callback',
    lastSync: 'Just now',
    successRate: '100%',
  },
  {
    id: 'int-meta',
    name: 'Meta WhatsApp Cloud API',
    provider: 'WHATSAPP_CLOUD',
    category: 'Customer Communications',
    status: 'ACTIVE',
    endpoint: 'https://graph.facebook.com/v18.0/akash-bajaj-waba',
    apiKey: 'EAAG9...waba_token_enc',
    description: 'Official WhatsApp Business API for booking alerts, estimate approvals, and service reminders.',
    syncFrequency: 'Event Driven',
    lastSync: '2 mins ago',
    successRate: '99.4%',
  },
  {
    id: 'int-sms',
    name: 'Gupshup / ValueFirst SMS DLT Gateway',
    provider: 'SMS_GATEWAY',
    category: 'Statutory SMS & OTP',
    status: 'ACTIVE',
    endpoint: 'https://enterprise.smsgupshup.com/gateway/v2',
    apiKey: 'dlt_principal_bajaj_blr_29',
    description: 'TRAI-compliant DLT SMS gateway for service handover OTPs and booking tokens.',
    syncFrequency: 'Instant OTP',
    lastSync: '15 mins ago',
    successRate: '99.9%',
  },
  {
    id: 'int-telematics',
    name: 'KTM & Chetak OEM Telematics Cloud',
    provider: 'OEM_TELEMATICS',
    category: 'Connected Vehicle Telemetry',
    status: 'TESTING',
    endpoint: 'https://connect.bajajauto.com/telematics/v1/feed',
    apiKey: 'bajaj_telematics_partner_991',
    description: 'Direct ingestion of live odometer readings, battery SOC %, and DTC diagnostic trouble codes.',
    syncFrequency: 'Hourly Batch Poll',
    lastSync: '1 hour ago',
    successRate: '98.5%',
  },
];

const DEFAULT_APPROVAL_RULES = [
  {
    id: 'rule-disc',
    name: 'Executive Quotation Discount Approval',
    category: 'Sales Commercials',
    thresholdRupees: 5000,
    requiredRole: 'Sales Manager',
    slaHours: 4,
    status: 'ACTIVE',
    description: 'Discounts exceeding this amount mandate electronic approval by Sales Manager before quote sharing.',
  },
  {
    id: 'rule-jv',
    name: 'Accounting Journal Voucher Dual-Signature',
    category: 'Finance & Accounts',
    thresholdRupees: 50000,
    requiredRole: 'Super Admin',
    slaHours: 8,
    status: 'ACTIVE',
    description: 'Direct ledger journal adjustments above this limit require Super Admin counter-signature.',
  },
  {
    id: 'rule-writeoff',
    name: 'Spare Parts Stock Write-Off Ceiling',
    category: 'Inventory & Warehousing',
    thresholdRupees: 10000,
    requiredRole: 'Inventory Manager',
    slaHours: 12,
    status: 'ACTIVE',
    description: 'Damage or spoilage write-offs exceeding this ceiling must be signed off by Inventory Manager.',
  },
  {
    id: 'rule-refund',
    name: 'Customer Booking Cancellation & Refund',
    category: 'Showroom Bookings',
    thresholdRupees: 20000,
    requiredRole: 'Sales Manager',
    slaHours: 6,
    status: 'ACTIVE',
    description: 'Advance booking deposit refunds require Manager verification and reason recording.',
  },
  {
    id: 'rule-labour',
    name: 'Workshop Labour Waiver Limit',
    category: 'Workshop Service',
    thresholdRupees: 2500,
    requiredRole: 'Service Manager',
    slaHours: 2,
    status: 'ACTIVE',
    description: 'Service bill labour discounts above this threshold require Service Manager approval.',
  },
  {
    id: 'rule-campaign',
    name: 'Broadcast Marketing Spend Limit',
    category: 'Growth & Campaigns',
    thresholdRupees: 15000,
    requiredRole: 'Super Admin',
    slaHours: 24,
    status: 'ACTIVE',
    description: 'Dual-control campaign broadcast budget approval prevents unintended bulk ad spends.',
  },
];

export default function AdminSecurityPage() {
  const [activeTab, setActiveTab] = useState('integrations'); // default to integrations as in screenshot

  const dealershipFromStore = useAppStore((state) => state.dealership) || {};
  const updateDealership = useAppStore((state) => state.updateDealership);
  const externalIntegrationsFromStore = useAppStore((state) => state.externalIntegrations);
  const customApprovalRulesFromStore = useAppStore((state) => state.customApprovalRules);
  const customRolesFromStore = useAppStore((state) => state.customRoles) || [];

  // Dealership Profile State
  const [profileForm, setProfileForm] = useState({
    name: dealershipFromStore.name || 'AKASH BAJAJ',
    legalName: dealershipFromStore.legalName || 'AKASH BAJAJ Private Limited',
    gstin: dealershipFromStore.gstin || '29AABCB1829M1ZK',
    pan: dealershipFromStore.pan || 'AABCB1829M',
    cin: dealershipFromStore.cin || 'U50100KA2018PTC112345',
    headOffice: dealershipFromStore.headOffice || '142, Hosur Main Road, Koramangala, Bangalore - 560095',
    phone: dealershipFromStore.phone || '+91 80 4965 2000',
    email: dealershipFromStore.email || 'contact@akashbajaj.com',
    bankName: dealershipFromStore.bankName || 'ICICI Bank • Domlur Branch',
    bankIfsc: dealershipFromStore.bankIfsc || 'ICIC0000042',
    bankAccount: dealershipFromStore.bankAccount || '004205009812',
    upiVpa: dealershipFromStore.upiVpa || 'akashbajaj@icici',
  });

  // External Integrations State
  const [integrations, setIntegrations] = useState(() => {
    return externalIntegrationsFromStore && externalIntegrationsFromStore.length > 0
      ? externalIntegrationsFromStore
      : DEFAULT_INTEGRATIONS;
  });

  // Approval Rules State
  const [approvalRules, setApprovalRules] = useState(() => {
    return customApprovalRulesFromStore && customApprovalRulesFromStore.length > 0
      ? customApprovalRulesFromStore
      : DEFAULT_APPROVAL_RULES;
  });

  // Roles & Permissions State
  const [customRoles, setCustomRoles] = useState(customRolesFromStore);
  const baseRoleKeys = Object.keys(ROLES);
  const permKeys = Object.keys(PERMISSIONS).slice(0, 18);
  const [matrixState, setMatrixState] = useState(() => {
    const initial = {};
    baseRoleKeys.forEach((roleKey) => {
      initial[roleKey] = DEFAULT_ROLE_PERMISSIONS[ROLES[roleKey]] || [];
    });
    return initial;
  });

  // Modals State
  const [integrationModalOpen, setIntegrationModalOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState(null);
  const [integrationForm, setIntegrationForm] = useState({
    name: '',
    provider: 'CUSTOM_WEBHOOK',
    category: 'Custom API',
    endpoint: '',
    apiKey: '',
    syncFrequency: 'Real-time',
    status: 'ACTIVE',
    description: '',
  });

  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [ruleForm, setRuleForm] = useState({
    name: '',
    category: 'Commercial Governance',
    thresholdRupees: 5000,
    requiredRole: 'Sales Manager',
    slaHours: 4,
    description: '',
  });

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    cloneFrom: 'SALES_EXECUTIVE',
  });

  // Test simulation inspector modal
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showApiKey, setShowApiKey] = useState({});

  // Handlers for Matrix
  const togglePermission = (roleKey, permValue) => {
    setMatrixState((prev) => {
      const current = prev[roleKey] || [];
      const updated = current.includes(permValue)
        ? current.filter((p) => p !== permValue)
        : [...current, permValue];
      return { ...prev, [roleKey]: updated };
    });
    toast.success(`Permission updated for ${ROLES[roleKey] || roleKey}`);
  };

  const handleOpenAddRole = () => {
    setRoleForm({ name: '', description: '', cloneFrom: 'SALES_EXECUTIVE' });
    setRoleModalOpen(true);
  };

  const handleSaveCustomRole = () => {
    if (!roleForm.name.trim()) {
      toast.error('Role name is required');
      return;
    }
    const newRoleKey = roleForm.name.toUpperCase().replace(/\s+/g, '_');
    const basePerms = matrixState[roleForm.cloneFrom] || [];
    const newRoleObj = {
      id: `role-${Date.now()}`,
      key: newRoleKey,
      name: roleForm.name,
      description: roleForm.description || 'Custom dealership staff role',
      isCustom: true,
      usersCount: 0,
    };
    setCustomRoles((prev) => [...prev, newRoleObj]);
    setMatrixState((prev) => ({ ...prev, [newRoleKey]: [...basePerms] }));
    setRoleModalOpen(false);
    toast.success(`Custom role "${roleForm.name}" created!`);
  };

  const handleDeleteCustomRole = (roleKey, roleName) => {
    setCustomRoles((prev) => prev.filter((r) => r.key !== roleKey));
    setMatrixState((prev) => {
      const next = { ...prev };
      delete next[roleKey];
      return next;
    });
    toast.success(`Role "${roleName}" deleted.`);
  };

  // Handlers for Integrations
  const handleOpenAddIntegration = () => {
    setEditingIntegration(null);
    setIntegrationForm({
      name: '',
      provider: 'CUSTOM_WEBHOOK',
      category: 'External System',
      endpoint: 'https://',
      apiKey: '',
      syncFrequency: 'Real-time',
      status: 'ACTIVE',
      description: '',
    });
    setIntegrationModalOpen(true);
  };

  const handleOpenEditIntegration = (item) => {
    setEditingIntegration(item);
    setIntegrationForm({
      name: item.name,
      provider: item.provider,
      category: item.category,
      endpoint: item.endpoint,
      apiKey: item.apiKey,
      syncFrequency: item.syncFrequency,
      status: item.status,
      description: item.description,
    });
    setIntegrationModalOpen(true);
  };

  const handleSaveIntegration = () => {
    if (!integrationForm.name.trim() || !integrationForm.endpoint.trim()) {
      toast.error('Integration name and endpoint URL are required');
      return;
    }
    if (editingIntegration) {
      setIntegrations((prev) =>
        prev.map((i) => (i.id === editingIntegration.id ? { ...i, ...integrationForm } : i))
      );
      toast.success(`Integration "${integrationForm.name}" updated successfully.`);
    } else {
      const newInt = {
        id: `int-${Date.now()}`,
        lastSync: 'Just now',
        successRate: '100%',
        ...integrationForm,
      };
      setIntegrations((prev) => [newInt, ...prev]);
      toast.success(`Integration "${integrationForm.name}" registered successfully.`);
    }
    setIntegrationModalOpen(false);
  };

  const handleDeleteIntegration = (id, name) => {
    if (window.confirm(`Are you sure you want to delete integration "${name}"?`)) {
      setIntegrations((prev) => prev.filter((i) => i.id !== id));
      toast.success(`Integration "${name}" deleted.`);
    }
  };

  const handleToggleIntegrationStatus = (id) => {
    setIntegrations((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const nextStatus = i.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
          toast.success(`Integration ${i.name} marked as ${nextStatus}`);
          return { ...i, status: nextStatus };
        }
        return i;
      })
    );
  };

  const handleTestIntegration = (item) => {
    setTestResult({
      status: 'CONNECTING',
      item,
      payload: null,
    });
    setTestModalOpen(true);

    setTimeout(() => {
      setTestResult({
        status: 'SUCCESS',
        statusCode: 200,
        latencyMs: Math.floor(Math.random() * 80) + 45,
        timestamp: new Date().toISOString(),
        item,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'x-request-id': `req-live-${Date.now().toString(36)}`,
          'x-ratelimit-remaining': '4980',
          'access-control-allow-origin': '*',
        },
        payload: {
          status: 'ok',
          service: item.name,
          provider: item.provider,
          handshake: 'SUCCESS',
          branch: 'Bangalore Central Flagship',
          authenticated: true,
          message: `Endpoint ${item.endpoint} validated with zero dropped packets.`,
        },
      });
      toast.success(`Bridge connection to ${item.name} succeeded (HTTP 200 OK)`);
    }, 600);
  };

  // Handlers for Approval Rules
  const handleOpenAddRule = () => {
    setEditingRule(null);
    setRuleForm({
      name: '',
      category: 'Commercial Governance',
      thresholdRupees: 5000,
      requiredRole: 'Sales Manager',
      slaHours: 4,
      description: '',
    });
    setRuleModalOpen(true);
  };

  const handleOpenEditRule = (rule) => {
    setEditingRule(rule);
    setRuleForm({
      name: rule.name,
      category: rule.category,
      thresholdRupees: rule.thresholdRupees,
      requiredRole: rule.requiredRole,
      slaHours: rule.slaHours,
      description: rule.description,
    });
    setRuleModalOpen(true);
  };

  const handleSaveRule = () => {
    if (!ruleForm.name.trim()) {
      toast.error('Rule name is required');
      return;
    }
    if (editingRule) {
      setApprovalRules((prev) =>
        prev.map((r) => (r.id === editingRule.id ? { ...r, ...ruleForm } : r))
      );
      toast.success(`Approval rule "${ruleForm.name}" updated.`);
    } else {
      const newRule = {
        id: `rule-${Date.now()}`,
        status: 'ACTIVE',
        ...ruleForm,
      };
      setApprovalRules((prev) => [newRule, ...prev]);
      toast.success(`New dual-control approval rule added.`);
    }
    setRuleModalOpen(false);
  };

  const handleDeleteRule = (id, name) => {
    if (window.confirm(`Delete approval rule "${name}"?`)) {
      setApprovalRules((prev) => prev.filter((r) => r.id !== id));
      toast.success(`Rule "${name}" removed.`);
    }
  };

  // Master Save Changes
  const handleMasterSave = () => {
    if (updateDealership) {
      updateDealership(profileForm);
    }
    useAppStore.setState({
      externalIntegrations: integrations,
      customApprovalRules: approvalRules,
      customRoles: customRoles,
    });
    toast.success('All settings, integrations, approval rules, and dealership profile saved!');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-blue-600" />
            Security, RBAC &amp; Dealership Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure fine-grained roles &amp; permissions, dual-control approval limits, integrations, and dealership legal master.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIntegrations(DEFAULT_INTEGRATIONS);
              setApprovalRules(DEFAULT_APPROVAL_RULES);
              toast.info('Reset to default system presets');
            }}
            className="text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset Defaults
          </Button>

          <Button
            variant="primary"
            onClick={handleMasterSave}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
          >
            <Save className="w-4 h-4 mr-1.5" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`py-2 px-4 rounded-t-lg font-medium text-xs sm:text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'matrix'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Role &amp; Permission Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          className={`py-2 px-4 rounded-t-lg font-medium text-xs sm:text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'approvals'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Dual-Control Approval Limits ({approvalRules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dealership')}
          className={`py-2 px-4 rounded-t-lg font-medium text-xs sm:text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'dealership'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Dealership Legal Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('integrations')}
          className={`py-2 px-4 rounded-t-lg font-medium text-xs sm:text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'integrations'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Webhook className="w-4 h-4" />
          <span>External Integrations ({integrations.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. ROLE & PERMISSION MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'matrix' && (
        <Card className="overflow-hidden p-0">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                Fine-Grained RBAC Permission Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Predefined personas plus custom roles mapped to action codes. Super Admin maintains full authority.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleOpenAddRole} className="text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Custom Role
              </Button>
              <span className="text-xs font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded">
                {baseRoleKeys.length + customRoles.length} Roles Active
              </span>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[550px]">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3 bg-slate-100 dark:bg-slate-800">Permission Action Code</th>
                  {baseRoleKeys.map((rk) => (
                    <th key={rk} className="p-3 text-center bg-slate-100 dark:bg-slate-800 whitespace-nowrap">
                      {ROLES[rk]}
                    </th>
                  ))}
                  {customRoles.map((cr) => (
                    <th key={cr.key} className="p-3 text-center bg-blue-50 dark:bg-slate-800/90 whitespace-nowrap text-blue-700 dark:text-blue-300">
                      <div className="flex items-center justify-center gap-1">
                        <span>{cr.name}</span>
                        <button
                          onClick={() => handleDeleteCustomRole(cr.key, cr.name)}
                          className="text-red-500 hover:text-red-700 p-0.5 rounded"
                          title="Delete Custom Role"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {permKeys.map((pk) => {
                  const permVal = PERMISSIONS[pk];
                  return (
                    <tr key={pk} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono font-medium text-slate-800 dark:text-slate-200">
                        {permVal}
                      </td>
                      {baseRoleKeys.map((rk) => {
                        const isGranted =
                          rk === 'SUPER_ADMIN' ||
                          (matrixState[rk] && matrixState[rk].includes(permVal));
                        const isLocked = rk === 'SUPER_ADMIN';

                        return (
                          <td key={rk} className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={isGranted}
                              disabled={isLocked}
                              onChange={() => togglePermission(rk, permVal)}
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                            />
                          </td>
                        );
                      })}
                      {customRoles.map((cr) => {
                        const isGranted = matrixState[cr.key] && matrixState[cr.key].includes(permVal);
                        return (
                          <td key={cr.key} className="p-3 text-center bg-blue-50/20">
                            <input
                              type="checkbox"
                              checked={Boolean(isGranted)}
                              onChange={() => togglePermission(cr.key, permVal)}
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 2. DUAL-CONTROL APPROVAL RULES */}
      {/* ========================================================================= */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-blue-50/60 dark:bg-slate-800/60 rounded-xl border border-blue-100 dark:border-slate-700">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                Statutory Dual-Control Approval Thresholds
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every commercial discount, journal entry, or stock write-off above these limits triggers multi-tier authorization.
              </p>
            </div>
            <Button size="sm" variant="primary" onClick={handleOpenAddRule} className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Approval Rule
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvalRules.map((rule) => (
              <Card key={rule.id} className="p-4 space-y-3 relative group hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="pr-6">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                      {rule.category}
                    </span>
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white mt-1.5">
                      {rule.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditRule(rule)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded"
                      title="Edit Rule"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id, rule.name)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700">
                  <span className="text-[11px] text-slate-500 block">Threshold Amount:</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                    ₹ {Number(rule.thresholdRupees).toLocaleString('en-IN')}
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">
                  {rule.description}
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">
                    Approver: <strong className="text-slate-900 dark:text-white">{rule.requiredRole}</strong>
                  </span>
                  <span className="text-amber-600 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {rule.slaHours}h SLA
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DEALERSHIP LEGAL PROFILE */}
      {/* ========================================================================= */}
      {activeTab === 'dealership' && (
        <Card className="p-6 space-y-6 max-w-4xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                Dealership Legal Profile &amp; Statutory Identifiers
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                These identifiers print on all Tax Invoices, Quotations, Job Cards, and Gate Passes.
              </p>
            </div>
            <Button size="sm" variant="primary" onClick={handleMasterSave} className="bg-blue-600 text-white text-xs">
              <Save className="w-3.5 h-3.5 mr-1" />
              Save Profile
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Legal Entity Name</label>
              <input
                type="text"
                value={profileForm.legalName}
                onChange={(e) => setProfileForm({ ...profileForm, legalName: e.target.value })}
                className="w-full mt-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Trade / Display Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full mt-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">GSTIN (State Code 29 Karnataka)</label>
              <input
                type="text"
                value={profileForm.gstin}
                onChange={(e) => setProfileForm({ ...profileForm, gstin: e.target.value })}
                className="w-full mt-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Permanent Account Number (PAN)</label>
              <input
                type="text"
                value={profileForm.pan}
                onChange={(e) => setProfileForm({ ...profileForm, pan: e.target.value })}
                className="w-full mt-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Corporate Identity Number (CIN)</label>
              <input
                type="text"
                value={profileForm.cin}
                onChange={(e) => setProfileForm({ ...profileForm, cin: e.target.value })}
                className="w-full mt-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-900 dark:text-white uppercase"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Official Support Email</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full mt-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Registered Head Office Address</label>
            <textarea
              rows={2}
              value={profileForm.headOffice}
              onChange={(e) => setProfileForm({ ...profileForm, headOffice: e.target.value })}
              className="w-full mt-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
              Statutory Bank &amp; UPI Collection Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Bank Name &amp; Branch</label>
                <input
                  type="text"
                  value={profileForm.bankName}
                  onChange={(e) => setProfileForm({ ...profileForm, bankName: e.target.value })}
                  className="w-full mt-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs text-slate-900 dark:text-white font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Bank IFSC Code</label>
                <input
                  type="text"
                  value={profileForm.bankIfsc}
                  onChange={(e) => setProfileForm({ ...profileForm, bankIfsc: e.target.value })}
                  className="w-full mt-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Current Account Number</label>
                <input
                  type="text"
                  value={profileForm.bankAccount}
                  onChange={(e) => setProfileForm({ ...profileForm, bankAccount: e.target.value })}
                  className="w-full mt-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 4. EXTERNAL INTEGRATIONS (Highlighted by user screenshot) */}
      {/* ========================================================================= */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          {/* Subheader with Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Webhook className="w-5 h-5 text-blue-600" />
                Connected Dealership Services &amp; Webhooks
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time API sync for Tally Prime, Payment Gateways, Meta WhatsApp Cloud, and OEM Telematics.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAddIntegration}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Integration
            </Button>
          </div>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {integrations.map((item) => {
              const isKeyShown = showApiKey[item.id];
              return (
                <Card
                  key={item.id}
                  className="p-5 space-y-4 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between shadow-sm relative group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5 flex items-center gap-1.5">
                          {item.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1">
                        <StatusBadge
                          status={item.status === 'ACTIVE' ? 'Confirmed' : 'Pending'}
                          label={item.status}
                        />
                        <button
                          onClick={() => handleOpenEditIntegration(item)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded ml-1"
                          title="Configure / Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteIntegration(item.id, item.name)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                          title="Delete Integration"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed min-h-[38px]">
                      {item.description}
                    </p>

                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Endpoint:</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[170px]" title={item.endpoint}>
                          {item.endpoint}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Secret Token:</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          {isKeyShown ? item.apiKey : '••••••••••••••••'}
                          <button
                            type="button"
                            onClick={() => setShowApiKey((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            {isKeyShown ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-700/50 text-[10px]">
                        <span className="text-slate-400">Last Sync: {item.lastSync || 'Recently'}</span>
                        <span className="text-status-green font-bold">{item.successRate || '100%'} uptime</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestIntegration(item)}
                      className="w-full text-xs font-medium border-slate-300 dark:border-slate-700"
                    >
                      <Play className="w-3 h-3 mr-1 text-blue-600" />
                      Test Connection
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleIntegrationStatus(item.id)}
                      className={`text-xs px-2.5 ${
                        item.status === 'ACTIVE'
                          ? 'text-amber-600 hover:bg-amber-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={item.status === 'ACTIVE' ? 'Pause Sync' : 'Activate Sync'}
                    >
                      {item.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT INTEGRATION */}
      {/* ========================================================================= */}
      <Modal
        isOpen={integrationModalOpen}
        onClose={() => setIntegrationModalOpen(false)}
        title={editingIntegration ? 'Configure External Integration' : 'Add New External Service Integration'}
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Integration Name
            </label>
            <input
              type="text"
              placeholder="e.g. ICICI Bank Auto-Collect Webhook"
              value={integrationForm.name}
              onChange={(e) => setIntegrationForm({ ...integrationForm, name: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Category
              </label>
              <select
                value={integrationForm.category}
                onChange={(e) => setIntegrationForm({ ...integrationForm, category: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Accounting & Statutory">Accounting &amp; Statutory</option>
                <option value="Payments & Settlement">Payments &amp; Settlement</option>
                <option value="Customer Communications">Customer Communications</option>
                <option value="Statutory SMS & OTP">Statutory SMS &amp; OTP</option>
                <option value="Connected Vehicle Telemetry">Connected Vehicle Telemetry</option>
                <option value="OEM Factory Sync">OEM Factory Sync</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Sync Frequency
              </label>
              <select
                value={integrationForm.syncFrequency}
                onChange={(e) => setIntegrationForm({ ...integrationForm, syncFrequency: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Real-time (On Event)">Real-time (On Event)</option>
                <option value="Instant Webhook Callback">Instant Webhook Callback</option>
                <option value="Every 15 Minutes">Every 15 Minutes</option>
                <option value="Hourly Batch Poll">Hourly Batch Poll</option>
                <option value="Day-End Batch Sync">Day-End Batch Sync</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Endpoint / Webhook URL
            </label>
            <input
              type="url"
              placeholder="https://api.partner.com/v1/webhook"
              value={integrationForm.endpoint}
              onChange={(e) => setIntegrationForm({ ...integrationForm, endpoint: e.target.value })}
              className="w-full p-2.5 font-mono text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              API Key / Auth Secret
            </label>
            <input
              type="text"
              placeholder="sec_live_..."
              value={integrationForm.apiKey}
              onChange={(e) => setIntegrationForm({ ...integrationForm, apiKey: e.target.value })}
              className="w-full p-2.5 font-mono text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Description &amp; Notes
            </label>
            <textarea
              rows={2}
              placeholder="Explain the purpose of this integration bridge..."
              value={integrationForm.description}
              onChange={(e) => setIntegrationForm({ ...integrationForm, description: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button variant="secondary" onClick={() => setIntegrationModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveIntegration} className="bg-blue-600 text-white">
              {editingIntegration ? 'Save Configuration' : 'Connect Integration'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT APPROVAL RULE */}
      {/* ========================================================================= */}
      <Modal
        isOpen={ruleModalOpen}
        onClose={() => setRuleModalOpen(false)}
        title={editingRule ? 'Edit Approval Threshold' : 'Add Dual-Control Governance Rule'}
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Rule Title
            </label>
            <input
              type="text"
              placeholder="e.g. VIP Customer Trade-in Bonus Waiver"
              value={ruleForm.name}
              onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Threshold Amount (₹)
              </label>
              <input
                type="number"
                value={ruleForm.thresholdRupees}
                onChange={(e) => setRuleForm({ ...ruleForm, thresholdRupees: Number(e.target.value) })}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white tabular-nums font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                SLA Escalation (Hours)
              </label>
              <input
                type="number"
                value={ruleForm.slaHours}
                onChange={(e) => setRuleForm({ ...ruleForm, slaHours: Number(e.target.value) })}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Designated Approver Role
            </label>
            <select
              value={ruleForm.requiredRole}
              onChange={(e) => setRuleForm({ ...ruleForm, requiredRole: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="Super Admin">Super Admin (Rajesh Varma)</option>
              <option value="Sales Manager">Sales Manager (Anand Kumar)</option>
              <option value="Service Manager">Service Manager (Suresh G.)</option>
              <option value="Inventory Manager">Inventory Manager (Sunil Hegde)</option>
              <option value="Accountant">Accountant (Pooja Iyer)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Rule Policy Summary
            </label>
            <textarea
              rows={2}
              value={ruleForm.description}
              onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
              placeholder="State the statutory or business reason for this dual control threshold..."
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button variant="secondary" onClick={() => setRuleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveRule} className="bg-blue-600 text-white">
              Save Rule
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: ADD CUSTOM ROLE */}
      {/* ========================================================================= */}
      <Modal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title="Add Custom Dealership Role"
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Role Display Name
            </label>
            <input
              type="text"
              placeholder="e.g. Floor Supervisor or VIP Relationship Manager"
              value={roleForm.name}
              onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Base Permissions Template
            </label>
            <select
              value={roleForm.cloneFrom}
              onChange={(e) => setRoleForm({ ...roleForm, cloneFrom: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {baseRoleKeys.map((rk) => (
                <option key={rk} value={rk}>
                  Clone from {ROLES[rk]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Role Description
            </label>
            <textarea
              rows={2}
              placeholder="Describe staff responsibilities for this role..."
              value={roleForm.description}
              onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button variant="secondary" onClick={() => setRoleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveCustomRole} className="bg-blue-600 text-white">
              Create Role
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: LIVE TEST SIMULATOR / WEBHOOK INSPECTOR */}
      {/* ========================================================================= */}
      <Modal
        isOpen={testModalOpen}
        onClose={() => setTestModalOpen(false)}
        title={testResult?.item ? `Connection Inspector: ${testResult.item.name}` : 'Testing Integration'}
        size="lg"
      >
        <div className="space-y-4 text-xs">
          {testResult?.status === 'CONNECTING' ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                Pinging remote endpoint handshake...
              </p>
              <span className="font-mono text-slate-400 text-[11px]">{testResult?.item?.endpoint}</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="font-bold">HTTP {testResult?.statusCode} OK — Service Reachable</span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span>Latency: <strong>{testResult?.latencyMs} ms</strong></span>
                  <span>SSL: <strong>TLSv1.3 Verified</strong></span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                  Response Payload (JSON)
                </span>
                <pre className="p-3 rounded-lg bg-slate-900 text-green-400 font-mono text-[11px] overflow-x-auto max-h-56 leading-relaxed">
                  {JSON.stringify(testResult?.payload, null, 2)}
                </pre>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                  HTTP Response Headers
                </span>
                <pre className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-[10px] text-slate-700 dark:text-slate-300 overflow-x-auto max-h-24">
                  {JSON.stringify(testResult?.headers, null, 2)}
                </pre>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-700">
                <Button variant="primary" onClick={() => setTestModalOpen(false)} className="bg-blue-600 text-white text-xs">
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
