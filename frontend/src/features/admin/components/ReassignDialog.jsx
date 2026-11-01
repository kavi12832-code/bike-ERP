// src/features/admin/components/ReassignDialog.jsx
import React, { useState } from 'react';
import { AlertTriangle, UserCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';

export function ReassignDialog({
  isOpen,
  onClose,
  userToDeactivate,
  availableStaff = [],
  onConfirmDeactivate,
}) {
  if (!isOpen || !userToDeactivate) return null;

  const [reassigneeId, setReassigneeId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simulated open operational dependencies
  const openItems = [
    { type: 'Active Leads & Inquiries', count: 4, label: 'Uncontacted vehicle inquiries in queue' },
    { type: 'Pending Job Cards', count: userToDeactivate.role.includes('Technician') ? 2 : 0, label: 'Bays assigned for inspection' },
    { type: 'Open Compliance Tasks', count: 1, label: 'Quarterly documentation follow-up' },
  ].filter((item) => item.count > 0);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirmDeactivate(userToDeactivate.id, {
        reassigneeId,
        reassigneeName: availableStaff.find((s) => s.id === reassigneeId)?.name || 'Unassigned Queue',
        notes,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Deactivate Staff Account: ${userToDeactivate.fullName || userToDeactivate.name}`}
      size="md"
    >
      <div className="space-y-4 text-xs">
        {/* Warning Header */}
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <div className="font-bold">Operational Handover &amp; Deactivation</div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Deactivating <strong>{userToDeactivate.fullName || userToDeactivate.name}</strong> will terminate all active login sessions and revoke showroom terminal access. History and immutable audit trails are preserved.
            </p>
          </div>
        </div>

        {/* Open Dependencies to Reassign */}
        {openItems.length > 0 && (
          <div className="space-y-2">
            <span className="font-bold text-text-main text-[11px]">Open Operational Items Requiring Reassignment:</span>
            <div className="border border-border rounded-xl divide-y divide-border overflow-hidden">
              {openItems.map((item, idx) => (
                <div key={idx} className="p-2.5 bg-surface-subtle flex items-center justify-between text-[11px]">
                  <div>
                    <span className="font-bold text-text-main">{item.type}</span>
                    <div className="text-[10px] text-text-muted">{item.label}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 text-[10px]">
                    {item.count} open
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Select Reassignment Colleague */}
        <div>
          <label className="font-bold text-text-main block mb-1">
            Reassign Open Pipeline &amp; Workload To:
          </label>
          <select
            value={reassigneeId}
            onChange={(e) => setReassigneeId(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-border bg-surface text-xs text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Select Colleague (or Hold in Branch Queue)...</option>
            {availableStaff
              .filter((s) => s.id !== userToDeactivate.id && s.status === 'Active')
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName || s.name} ({s.role} - {s.primaryBranchName || 'Flagship'})
                </option>
              ))}
          </select>
        </div>

        {/* Handover Notes */}
        <div>
          <label className="font-bold text-text-main block mb-1">Deactivation Reason / Handover Notes</label>
          <input
            type="text"
            placeholder="e.g. Resignation accepted; pending exit clearance"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2 rounded-lg border border-border bg-surface text-xs text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? 'Deactivating...' : 'Confirm Deactivation'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ReassignDialog;

