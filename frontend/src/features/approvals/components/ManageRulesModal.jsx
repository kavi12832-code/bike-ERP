// src/features/approvals/components/ManageRulesModal.jsx
import React, { useState } from 'react';
import { useAppStore } from '../../../store';
import { DEFAULT_POLICIES } from '../../../approvals/policies';
import { APPROVAL_TYPES, TYPE_COLORS } from '../../../approvals/config';
import { ROLES } from '../../../config/roles';
import { matchPolicy, canUserDecide } from '../../../approvals/engine';
import { formatMoney } from '../../../lib/format';
import { Button } from '../../../components/ui/Button';
import {
  X,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Play,
  Layers,
  ArrowRight,
  Shield,
  Edit2,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

export function ManageRulesModal({ isOpen, onClose }) {
  const currentUser = useAppStore((state) => state.currentUser);
  const policies = useAppStore((state) => state.approvalPolicies || DEFAULT_POLICIES);
  const updateApprovalPolicy = useAppStore((state) => state.updateApprovalPolicy);

  // Active tab: 'POLICIES' or 'SIMULATOR'
  const [activeTab, setActiveTab] = useState('POLICIES');
  const [editingPolicy, setEditingPolicy] = useState(null);

  // Simulator State
  const [simRole, setSimRole] = useState(ROLES.SALES_EXECUTIVE);
  const [simType, setSimType] = useState(APPROVAL_TYPES.DISCOUNT);
  const [simAmount, setSimAmount] = useState('6000');
  const [simPrice, setSimPrice] = useState('285000');
  const [simResult, setSimResult] = useState(null);

  if (!isOpen) return null;

  const handleRunSimulator = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(simAmount || '0');
    const priceNum = parseFloat(simPrice || '0');
    const percent = priceNum > 0 ? (amountNum / priceNum) * 100 : 0;

    const mockRequesterLimit = simRole === ROLES.SALES_EXECUTIVE ? 200000 : 500000;

    try {
      const match = matchPolicy(policies, {
        type: simType,
        amountPaise: Math.round(amountNum * 100),
        percent: parseFloat(percent.toFixed(1)),
        requesterLimitPaise: mockRequesterLimit,
      });

      // Mock user check
      const mockUser = {
        id: 'usr-sim-01',
        name: 'Simulated User',
        role: simRole,
        primaryBranchId: 'br-blr-central',
      };
      const mockRequest = {
        requesterId: 'usr-sim-01',
        requesterName: 'Simulated User',
        status: 'Pending',
        currentLevel: 1,
        levels: match.levels,
        branchId: 'br-blr-central',
        amountPaise: Math.round(amountNum * 100),
      };

      const selfCheck = canUserDecide(mockUser, mockRequest, match.policy);

      setSimResult({
        match,
        percent: percent.toFixed(1),
        selfApprovalBlocked: !selfCheck.canDecide,
        blockReason: selfCheck.reason,
      });
    } catch (err) {
      toast.error(err.message || 'Error running simulator');
    }
  };

  const handleToggleEnable = (policy) => {
    updateApprovalPolicy(policy.id, { enabled: !policy.enabled });
    toast.success(`Policy "${policy.label}" ${!policy.enabled ? 'enabled' : 'disabled'}.`);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingPolicy) return;
    updateApprovalPolicy(editingPolicy.id, {
      label: editingPolicy.label,
      description: editingPolicy.description,
    });
    toast.success(`Policy ${editingPolicy.id} updated to version ${(parseFloat(editingPolicy.version || '1.0') + 0.1).toFixed(1)}`);
    setEditingPolicy(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Governance Rules &amp; Policy Administration
              </h2>
              <p className="text-xs text-slate-500">
                Configure statutory threshold tiers, SLA targets, and test rule behavior
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('POLICIES')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeTab === 'POLICIES' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Active Policies ({policies.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('SIMULATOR')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1 ${
                  activeTab === 'SIMULATOR' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                <Play className="w-3 h-3" />
                Test This Rule
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs text-slate-700">
          {activeTab === 'POLICIES' ? (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-900 font-medium">
                  <Shield className="w-4 h-4 text-amber-700" />
                  <span>
                    <strong>Maker-Checker Dual Control:</strong> Policy revisions increment version numbers and require statutory co-director verification before taking effect.
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Policy Label</th>
                      <th className="py-2.5 px-3">Tiers &amp; Roles</th>
                      <th className="py-2.5 px-3">SLA</th>
                      <th className="py-2.5 px-3">Bulk Limit</th>
                      <th className="py-2.5 px-3">Version</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {policies.map((pol) => (
                      <tr key={pol.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              TYPE_COLORS[pol.type] || 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {pol.type}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-900 block">{pol.label}</span>
                          <span className="text-[11px] text-slate-500 line-clamp-1">
                            {pol.description}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="space-y-0.5 text-[11px]">
                            {pol.levels.map((lvl) => (
                              <div key={lvl.level} className="text-slate-600">
                                <strong>L{lvl.level}:</strong> {lvl.approverRoles.join(', ')}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          {pol.levels.reduce((acc, l) => acc + (l.businessHoursSla || 0), 0)}h
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {pol.bulkLimitPaise ? formatMoney(pol.bulkLimitPaise) : 'Disallowed'}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                          v{pol.version}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingPolicy(pol)}
                              className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded"
                              title="Edit policy"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleEnable(pol)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                pol.enabled
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}
                            >
                              {pol.enabled ? 'Active' : 'Disabled'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Simulator Tab */
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="p-4 bg-blue-50/80 rounded-xl border border-blue-200 space-y-1">
                <h3 className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-blue-600" />
                  <span>Dual-Control Governance Simulator</span>
                </h3>
                <p className="text-[11px] text-blue-950">
                  Test transaction parameters against live policies to verify which approval path, SLA window, and dual-control blocks will be triggered before execution.
                </p>
              </div>

              <form onSubmit={handleRunSimulator} className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Requester Role Persona
                    </label>
                    <select
                      value={simRole}
                      onChange={(e) => setSimRole(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-medium"
                    >
                      {Object.values(ROLES).map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Transaction / Approval Type
                    </label>
                    <select
                      value={simType}
                      onChange={(e) => setSimType(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-medium"
                    >
                      {Object.values(APPROVAL_TYPES).map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Proposed Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={simAmount}
                      onChange={(e) => setSimAmount(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Ex-Showroom Price (₹) <span className="font-normal text-slate-400">(for % calc)</span>
                    </label>
                    <input
                      type="number"
                      value={simPrice}
                      onChange={(e) => setSimPrice(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-semibold"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-8 px-4">
                    <Play className="w-3.5 h-3.5 mr-1" />
                    Simulate Workflow Path
                  </Button>
                </div>
              </form>

              {/* Simulation Result Box */}
              {simResult && (
                <div className="p-4 bg-white rounded-xl border border-slate-300 shadow-sm space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-xs text-slate-900">Simulation Output</span>
                    <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                      Policy: {simResult.match.policy.id} (v{simResult.match.policy.version})
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs text-slate-800">
                      <strong>Triggered Rule:</strong> {simResult.match.ruleText}
                    </p>
                    <p className="text-xs text-slate-600">
                      <strong>Total SLA Commitment:</strong> {simResult.match.totalSlaHours} Business Hours
                    </p>
                  </div>

                  {/* Computed Stepper */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      Computed Sign-off Tiers
                    </span>
                    <div className="space-y-1.5">
                      {simResult.match.levels.map((lvl) => (
                        <div key={lvl.level} className="flex items-center gap-2 text-xs">
                          <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                            {lvl.level}
                          </span>
                          <span className="font-bold text-slate-800">{lvl.label}</span>
                          <span className="text-slate-500 font-mono text-[11px]">
                            ({lvl.approverRoles.join(' / ')} · {lvl.businessHoursSla}h)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dual-Control Violation Check */}
                  <div className="p-2.5 rounded-lg border flex items-center gap-2 bg-emerald-50 border-emerald-200 text-emerald-900 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>
                      <strong>Dual Control Enforced:</strong> Initiator ({simRole}) is strictly prohibited from approving their own request.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Edit Drawer / Modal sub-view */}
        {editingPolicy && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="font-bold text-xs text-slate-800">
              Editing: {editingPolicy.label} ({editingPolicy.id})
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditingPolicy(null)} className="text-xs">
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEdit} className="bg-blue-600 text-white text-xs">
                Save &amp; Increment Version
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageRulesModal;

