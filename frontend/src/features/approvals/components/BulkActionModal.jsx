// src/features/approvals/components/BulkActionModal.jsx
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../../store';
import { APPROVAL_STATUS } from '../../../approvals/config';
import { formatMoney } from '../../../lib/format';
import { Button } from '../../../components/ui/Button';
import {
  X,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';

export function BulkActionModal({ isOpen, actionType, selectedIds, onClose, onConfirm }) {
  const approvals = useAppStore((state) => state.approvals || []);
  const policies = useAppStore((state) => state.approvalPolicies || []);
  const [note, setNote] = useState('');

  const selectedRequests = useMemo(() => {
    return approvals.filter((r) => selectedIds.includes(r.id));
  }, [approvals, selectedIds]);

  // Evaluate bulk eligibility
  const { eligibleRequests, skippedRequests, validationError } = useMemo(() => {
    if (selectedRequests.length === 0) {
      return { eligibleRequests: [], skippedRequests: [], validationError: 'No requests selected' };
    }

    if (actionType === 'APPROVE') {
      // Check 1: Must all be of the same type
      const firstType = selectedRequests[0].type;
      const hasMixedTypes = selectedRequests.some((r) => r.type !== firstType);

      const policy = policies.find((p) => p.type === firstType);
      const bulkLimit = policy?.bulkLimitPaise || 0;

      const eligible = [];
      const skipped = [];

      selectedRequests.forEach((req) => {
        if (req.type !== firstType) {
          skipped.push({
            request: req,
            reason: `Mixed type (${req.type} != ${firstType}). Bulk approval requires homogeneous requests.`,
          });
          return;
        }

        if (bulkLimit === 0) {
          skipped.push({
            request: req,
            reason: `Policy for ${req.type} prohibits bulk approval (statutory individual review required).`,
          });
          return;
        }

        if (req.amountPaise > bulkLimit) {
          skipped.push({
            request: req,
            reason: `Amount (${formatMoney(req.amountPaise)}) exceeds bulk limit of ${formatMoney(bulkLimit)}.`,
          });
          return;
        }

        eligible.push(req);
      });

      return {
        eligibleRequests: eligible,
        skippedRequests: skipped,
        validationError: hasMixedTypes
          ? 'Selected requests have mixed types. Please select only one approval type for bulk actions.'
          : null,
      };
    }

    // Reject and Return can be applied to any open pending requests
    return {
      eligibleRequests: selectedRequests.filter((r) =>
        [APPROVAL_STATUS.PENDING, APPROVAL_STATUS.ESCALATED].includes(r.status)
      ),
      skippedRequests: selectedRequests.filter(
        (r) => ![APPROVAL_STATUS.PENDING, APPROVAL_STATUS.ESCALATED].includes(r.status)
      ).map((r) => ({ request: r, reason: `Request is already ${r.status}.` })),
      validationError: null,
    };
  }, [selectedRequests, actionType, policies]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((actionType === 'REJECT' || actionType === 'RETURN') && !note.trim()) {
      toast.error(`A justification note is required to bulk ${actionType.toLowerCase()} requests.`);
      return;
    }

    if (eligibleRequests.length === 0) {
      toast.error('No eligible requests to process.');
      return;
    }

    onConfirm(actionType, eligibleRequests.map((r) => r.id), note);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {actionType === 'APPROVE' ? (
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            ) : actionType === 'REJECT' ? (
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
                <XCircle className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                <RotateCcw className="w-4 h-4" />
              </div>
            )}
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Bulk {actionType === 'APPROVE' ? 'Approval' : actionType === 'REJECT' ? 'Rejection' : 'Revision Return'}
              </h3>
              <p className="text-xs text-slate-500">
                {eligibleRequests.length} eligible of {selectedRequests.length} selected items
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-900">
              <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Bulk Governance Restriction</span>
                <p className="text-[11px] text-red-800">{validationError}</p>
              </div>
            </div>
          )}

          {/* Skipped Items Notice */}
          {skippedRequests.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1.5 text-amber-900">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>{skippedRequests.length} Item(s) will be skipped:</span>
              </div>
              <div className="max-h-24 overflow-y-auto space-y-1 text-[11px] text-amber-800">
                {skippedRequests.map((skip, i) => (
                  <div key={i} className="flex items-start justify-between gap-2 border-b border-amber-200/50 pb-1">
                    <span className="font-mono font-bold">{skip.request.id}</span>
                    <span className="text-right text-[10px] text-amber-700">{skip.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Eligible List Summary */}
          {eligibleRequests.length > 0 && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Items to be {actionType.toLowerCase()}d:
              </label>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 max-h-32 overflow-y-auto space-y-1 text-[11px]">
                {eligibleRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between py-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-semibold text-slate-800">{req.id}</span>
                      <span className="text-slate-500 truncate max-w-[180px]">{req.title}</span>
                    </div>
                    <span className="font-bold text-slate-900">
                      {req.amountPaise ? formatMoney(req.amountPaise) : 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Note Input */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Statutory Justification Note{' '}
              {actionType !== 'APPROVE' && <span className="text-red-500">* (Mandatory)</span>}
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                actionType === 'APPROVE'
                  ? 'Optional batch approval remark...'
                  : 'Mandatory reason for bulk rejection or revision...'
              }
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={eligibleRequests.length === 0}
              className={`text-xs font-bold text-white shadow-sm ${
                actionType === 'APPROVE'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : actionType === 'REJECT'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Confirm Bulk {actionType === 'APPROVE' ? 'Approve' : actionType === 'REJECT' ? 'Reject' : 'Return'} ({eligibleRequests.length})
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BulkActionModal;

