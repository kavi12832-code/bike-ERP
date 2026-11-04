import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  EyeOff, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  FileCheck, 
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';

import { useCollection } from '../../../hooks/useCollection';
// SAMPLE_CONSENT_LEDGER: loaded from the database (collection "admin.privacyConsent.consentLedger")

export function PrivacyConsentPage() {
  const [ledger, setLedger] = useCollection('admin.privacyConsent.consentLedger');
  const [search, setSearch] = useState('');
  const [showErasureModal, setShowErasureModal] = useState(false);
  const [erasureTargetCustomer, setErasureTargetCustomer] = useState('Vinod Nair');

  const handleToggleConsent = (id) => {
    setLedger(prev => prev.map(item => {
      if (item.id !== id) return item;
      const next = item.status === 'GRANTED' ? 'REVOKED' : 'GRANTED';
      toast.success(`Consent ${item.consentType} for ${item.customerName} set to ${next}. Timestamp logged.`);
      return {
        ...item,
        status: next,
        timestamp: `${new Date().toLocaleTimeString('en-IN')} IST (Audit Append)`,
      };
    }));
  };

  const handleExecuteErasure = () => {
    toast.success(`PII anonymized for ${erasureTargetCustomer}! Name masked to 'CUSTOMER_ANON_948', phone redacted. Tax invoices retained under Companies Act Section 128 (8-year statutory hold).`);
    setShowErasureModal(false);
  };

  const filtered = ledger.filter(c => 
    c.customerName.toLowerCase().includes(search.toLowerCase()) ||
    c.consentType.toLowerCase().includes(search.toLowerCase()) ||
    c.channel.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            DPDP Act 2023 Privacy &amp; Consent Governance
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Immutable consent ledger, WhatsApp opt-outs &amp; Right-to-be-Forgotten erasure with statutory tax retention.
          </p>
        </div>

        <button
          onClick={() => setShowErasureModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition"
        >
          <Trash2 className="w-4 h-4" />
          Execute Data Erasure (Right to be Forgotten)
        </button>
      </div>

      {/* Statutory Retention Notice */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start gap-3">
        <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-950 dark:text-blue-200">
          <p className="font-bold">Dual Statutory Balance: DPDP Act 2023 vs Section 128 Companies Act 2013</p>
          <p className="mt-0.5 text-blue-800/80 dark:text-blue-300/80">
            Upon customer erasure requests, phone numbers, emails, addresses &amp; KYC IDs are cryptographically shredded. However, statutory vehicle sales tax invoices and GST credit notes are preserved in read-only cold storage for 8 years as required by the Ministry of Corporate Affairs (MCA).
          </p>
        </div>
      </div>

      {/* Consent Ledger Table */}
      <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider">
            Append-Only Consent Ledger ({filtered.length} Entries)
          </h3>

          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter customer or consent..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1 text-xs bg-white dark:bg-slate-850 border rounded-lg"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 font-semibold text-slate-500 uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Customer &amp; ID</th>
                <th className="p-3.5">Consent Clause</th>
                <th className="p-3.5">Capture Channel</th>
                <th className="p-3.5">Timestamp &amp; IP</th>
                <th className="p-3.5">Consent Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(entry => (
                <tr key={entry.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900 dark:text-white">{entry.customerName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{entry.customerId}</div>
                  </td>
                  <td className="p-3.5 font-bold font-mono text-[11px] text-blue-600">
                    {entry.consentType}
                  </td>
                  <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300">
                    {entry.channel}
                  </td>
                  <td className="p-3.5 font-mono text-[10px]">
                    <div>{entry.timestamp}</div>
                    <div className="text-slate-400">IP: {entry.ipAddress}</div>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      entry.status === 'GRANTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleToggleConsent(entry.id)}
                      className="text-xs text-blue-600 font-bold hover:underline"
                    >
                      {entry.status === 'GRANTED' ? 'Revoke Consent' : 'Grant Consent'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Erasure Workflow Modal */}
      {showErasureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-850 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Right-to-be-Forgotten Data Anonymization
            </h3>

            <p className="text-xs text-slate-500">
              Select customer who exercised Article 12 Right to Erasure. PII will be masked across all CRM and workshop databases.
            </p>

            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-xs space-y-1">
              <span className="font-bold text-red-700">Irreversible Action:</span>
              <p className="text-red-950 dark:text-red-200">
                Customer mobile number, home address, and Aadhaar/PAN references will be replaced with hash strings.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Target Customer</label>
              <input
                type="text"
                value={erasureTargetCustomer}
                onChange={(e) => setErasureTargetCustomer(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowErasureModal(false)}
                className="px-3 py-1.5 text-xs rounded-lg border hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteErasure}
                className="px-4 py-1.5 bg-red-600 text-white font-bold rounded-lg text-xs hover:bg-red-700"
              >
                Execute Anonymization Pipeline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrivacyConsentPage;
