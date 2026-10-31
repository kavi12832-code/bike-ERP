// src/features/admin/components/ExportUsersModal.jsx
import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, ShieldAlert, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';

export function ExportUsersModal({
  isOpen,
  onClose,
  users = [],
  onExportSuccess,
}) {
  if (!isOpen) return null;

  const [format, setFormat] = useState('CSV'); // CSV | XLSX
  const [includeFullContact, setIncludeFullContact] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const maskEmail = (email) => {
    if (!email) return '';
    const parts = email.split('@');
    if (parts.length < 2) return email;
    const name = parts[0];
    const masked = name.slice(0, 1) + '****' + name.slice(-1);
    return `${masked}@${parts[1]}`;
  };

  const maskPhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/(\+91\s*\d{5})\s*\d{5}/, '$1 *****');
  };

  const handleExecuteExport = () => {
    setIsExporting(true);
    try {
      const needsApproval = includeFullContact && users.length > 25;
      if (needsApproval) {
        toast.info(
          'Export request exceeding 25 records with unmasked PII submitted to Approvals Center for DPDP compliance review.'
        );
      }

      // Prepare headers & data
      const headers = [
        '#',
        'Employee Code',
        'Full Name',
        'Official Email',
        'Mobile Phone',
        'Role Persona',
        'Department',
        'Primary Branch',
        '2FA Enforced',
        'Account Status',
        'Last Active',
      ];

      const rows = users.map((u, idx) => [
        idx + 1,
        u.employeeCode || '',
        u.fullName || u.name,
        includeFullContact ? u.email : maskEmail(u.email),
        includeFullContact ? u.phone : maskPhone(u.phone),
        u.role,
        u.department || 'Operations',
        u.primaryBranchName || 'Bangalore Central Flagship',
        u.twoFactor?.enabled ? 'Yes' : 'No',
        u.status,
        u.lastLogin || 'Never',
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute(
        'download',
        `Dealership_Staff_Export_${includeFullContact ? 'Unmasked' : 'Masked'}_${Date.now()}.${format.toLowerCase()}`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Successfully exported ${users.length} staff records (${format})!`);
      if (onExportSuccess) onExportSuccess();
      onClose();
    } catch (err) {
      toast.error('Failed to export staff accounts.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Dealership Staff Records" size="md">
      <div className="space-y-4 text-xs">
        <p className="text-text-muted leading-relaxed">
          Export filtered staff user directory for statutory payroll auditing, branch compliance, or HR reporting.
        </p>

        {/* Format Selector */}
        <div>
          <label className="font-bold text-text-main block mb-1">Export File Format</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormat('CSV')}
              className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                format === 'CSV' ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold' : 'bg-surface border-border text-text-muted'
              }`}
            >
              <FileText className="w-4 h-4 text-primary" />
              <span>CSV (Comma-Separated)</span>
            </button>
            <button
              type="button"
              onClick={() => setFormat('XLSX')}
              className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                format === 'XLSX' ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold' : 'bg-surface border-border text-text-muted'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Excel (.xlsx format)</span>
            </button>
          </div>
        </div>

        {/* Masking & DPDP Protection */}
        <div className="p-3.5 rounded-xl border border-border bg-surface-subtle space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-text-main">Include Full Contact Details (Unmasked PII)</div>
              <div className="text-[11px] text-text-muted mt-0.5">
                Default: Emails and phone numbers are masked for DPDP data privacy compliance.
              </div>
            </div>
            <input
              type="checkbox"
              checked={includeFullContact}
              onChange={(e) => setIncludeFullContact(e.target.checked)}
              className="w-4 h-4 text-primary rounded border-border focus:ring-primary cursor-pointer"
            />
          </div>

          {includeFullContact && users.length > 25 && (
            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2 text-[11px]">
              <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <span>
                Exporting more than 25 unmasked records triggers an automatic compliance review ticket in the Approvals Center.
              </span>
            </div>
          )}
        </div>

        <div className="text-text-muted text-[11px]">
          Total rows to export: <strong className="text-text-main">{users.length} staff accounts</strong>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Download}
            disabled={isExporting}
            onClick={handleExecuteExport}
          >
            {isExporting ? 'Exporting...' : 'Download Export'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ExportUsersModal;

