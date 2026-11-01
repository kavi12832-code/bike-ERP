// src/features/approvals/components/PolicyGuideDrawer.jsx
import React, { useEffect } from 'react';
import { useAppStore } from '../../../store';
import { DEFAULT_POLICIES } from '../../../approvals/policies';
import { TYPE_COLORS } from '../../../approvals/config';
import { formatMoney } from '../../../lib/format';
import {
  X,
  Shield,
  BookOpen,
  UserCheck,
  Clock,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export function PolicyGuideDrawer({ isOpen, onClose }) {
  const currentUser = useAppStore((state) => state.currentUser);
  const policies = useAppStore((state) => state.approvalPolicies || DEFAULT_POLICIES);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Compute personal limits
  const personalDiscountLimit = currentUser?.limits?.discountLimit || 0;
  const personalApprovalLimit = currentUser?.limits?.approvalLimit || 0;
  const isSuperAdmin = currentUser?.role === 'Super Admin' || currentUser?.role === 'SUPER_ADMIN';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-[2px] flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Dual-Control Policy Guide</h2>
              <p className="text-xs text-slate-500">
                Statutory threshold matrix, approval levels &amp; SLA benchmarks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          {/* Personalized Limits Card */}
          <div className="p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-xl border border-blue-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-700" />
                <h3 className="font-bold text-blue-900 text-xs uppercase tracking-wider">
                  Your Operational Authority Scope
                </h3>
              </div>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                {currentUser?.role || 'Staff Member'}
              </span>
            </div>

            <p className="text-xs text-blue-950 font-medium">
              Logged in as <strong className="text-slate-900">{currentUser?.name}</strong> at{' '}
              <strong>{currentUser?.primaryBranchName || 'Bangalore Central Flagship'}</strong>.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-white/90 p-2.5 rounded-lg border border-blue-100">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                  Self-Approved Discount Limit
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {personalDiscountLimit > 0 ? `₹${personalDiscountLimit.toLocaleString('en-IN')}` : '₹0 (Approval Required)'}
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Above this, request is dispatched to Sales Manager.
                </p>
              </div>

              <div className="bg-white/90 p-2.5 rounded-lg border border-blue-100">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                  Authority Approval Ceiling
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {isSuperAdmin
                    ? 'Statutory Unlimited'
                    : personalApprovalLimit > 0
                    ? `₹${personalApprovalLimit.toLocaleString('en-IN')}`
                    : 'Role Standard Limits'}
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  High-value transactions trigger secondary dual-control.
                </p>
              </div>
            </div>
          </div>

          {/* Active Policies List */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Standard Governance Policies ({policies.length})</span>
            </h3>

            {policies.map((pol) => {
              const typeColor = TYPE_COLORS[pol.type] || 'bg-slate-100 text-slate-700';

              return (
                <div
                  key={pol.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${typeColor}`}>
                          {pol.type}
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs">{pol.label}</h4>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {pol.description}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 whitespace-nowrap">
                      v{pol.version}
                    </span>
                  </div>

                  {/* Levels Stepper & SLA Summary */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1.5 text-[11px]">
                    <div className="flex items-center gap-2 flex-wrap text-slate-700">
                      <span className="font-semibold text-slate-800">Tiers:</span>
                      {pol.levels.map((lvl, idx) => (
                        <span key={lvl.level} className="flex items-center gap-1">
                          {idx > 0 && <ArrowRight className="w-3 h-3 text-slate-400" />}
                          <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
                            L{lvl.level}: {lvl.approverRoles.join('/')} ({lvl.businessHoursSla}h SLA)
                          </span>
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-slate-500 pt-1 border-t border-slate-200/60 text-[10px]">
                      <span>
                        SLA Window:{' '}
                        <strong className="text-slate-700">
                          {pol.levels.reduce((acc, l) => acc + (l.businessHoursSla || 0), 0)} Business Hours
                        </strong>
                      </span>
                      <span>
                        Bulk Limit:{' '}
                        <strong className="text-slate-700">
                          {pol.bulkLimitPaise ? formatMoney(pol.bulkLimitPaise) : 'Disallowed'}
                        </strong>
                      </span>
                      <span>
                        Validity:{' '}
                        <strong className="text-slate-700">
                          {pol.approvalValidityHours || 24} Hours
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            <span>SLA hours calculated Mon-Sat 09:30 - 19:00 IST</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-700 font-semibold"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}

export default PolicyGuideDrawer;

