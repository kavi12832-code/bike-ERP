// src/features/approvals/components/DelegateModal.jsx
import React, { useState } from 'react';
import { useAppStore } from '../../../store';
import { Button } from '../../../components/ui/Button';
import { X, UserCheck, Calendar, Shield } from 'lucide-react';
import { toast } from 'sonner';

export function DelegateModal({ isOpen, request, onClose }) {
  const users = useAppStore((state) => state.users || []);
  const currentUser = useAppStore((state) => state.currentUser);
  const delegateApproval = useAppStore((state) => state.delegateApproval);

  // Eligible delegates: same branch and equal or higher role, excluding self
  const eligibleDelegates = users.filter((u) => u.id !== currentUser?.id && u.status === 'Active');

  const [toUserId, setToUserId] = useState(eligibleDelegates[0]?.id || '');
  const [validUntil, setValidUntil] = useState('2026-11-05');
  const [reason, setReason] = useState('On official dealership management conference / leave.');

  if (!isOpen || !request) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const delegateUser = users.find((u) => u.id === toUserId);
    if (!delegateUser) {
      toast.error('Please select an eligible colleague.');
      return;
    }

    try {
      delegateApproval(request.id, {
        toUserId: delegateUser.id,
        toUserName: delegateUser.name || delegateUser.fullName,
        validUntil: new Date(`${validUntil}T23:59:59Z`).toISOString(),
        reason,
      });
      toast.success(`Approval authority for ${request.id} delegated to ${delegateUser.name}.`);
      onClose();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">Delegate Approval Authority</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Select Authorized Delegate</label>
            <select
              value={toUserId}
              onChange={(e) => setToUserId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-medium"
            >
              {eligibleDelegates.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name || u.fullName} — {u.role} ({u.primaryBranchName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Delegation Valid Until</label>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Delegation Justification</label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
              Confirm Delegation
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DelegateModal;

