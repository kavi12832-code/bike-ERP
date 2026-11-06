import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Search, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Send, 
  Check, 
  Plus, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useAppStore } from '../../../store';
import { PageHeader } from '../../../components/ui/PageHeader';
import { KpiCard } from '../../../components/ui/KpiCard';
import { formatDate } from '../../../lib/format';
import { toast } from 'sonner';

const SAMPLE_BULLETINS = [
  {
    id: 'rc-001',
    oemCircularNo: 'RE-SB-2026-041',
    title: 'Himalayan 450 Throttle Body Sensor Seal Inspection & Clamp Retrofit',
    model: 'Royal Enfield Himalayan 450',
    affectedRange: 'ME3J450*P100001 to ME3J450*P104999',
    partKit: 'Retrofit Kit #RE-TK-450-S',
    labourSac: '9987 (FOC OEM Compensated)',
    validTill: '2027-03-31',
    matchedUnits: [
      { id: 'u1', vin: 'ME3J450AP100234', customer: 'Rohit Chandran', phone: '+91 98860 99441', status: 'COMPLETED' },
      { id: 'u2', vin: 'ME3J450BP100412', customer: 'Deepak Kumar', phone: '+91 98451 22334', status: 'APPOINTMENT_BOOKED' },
      { id: 'u3', vin: 'ME3J450CP101890', customer: 'Vinod Nair', phone: '+91 97401 55667', status: 'NOTIFIED' },
      { id: 'u4', vin: 'ME3J450DP102551', customer: 'Kiran Rao', phone: '+91 98440 77889', status: 'PENDING' },
    ]
  },
  {
    id: 'rc-002',
    oemCircularNo: 'HMSI-RC-2026-12',
    title: 'SP125 / Shine Front Brake Disc Bolt Torque Verification',
    model: 'Honda SP125',
    affectedRange: 'ME4JC84*R200001 to ME4JC84*R208000',
    partKit: 'Flange Bolt Set M8x25 (x4)',
    labourSac: '9987 (FOC)',
    validTill: '2026-12-31',
    matchedUnits: [
      { id: 'u5', vin: 'ME4JC84AR201102', customer: 'Sunil Hegde', phone: '+91 98450 11223', status: 'COMPLETED' },
      { id: 'u6', vin: 'ME4JC84BR203490', customer: 'Mohammed Ali', phone: '+91 99001 44556', status: 'PENDING' },
    ]
  }
];

export function RecallsPage() {
  const [bulletins, setBulletins] = useState(SAMPLE_BULLETINS);
  const [selectedBulletin, setSelectedBulletin] = useState(SAMPLE_BULLETINS[0]);
  const [showNewModal, setShowNewModal] = useState(false);

  const calculateCompletion = (units) => {
    if (!units || units.length === 0) return 0;
    const completed = units.filter(u => u.status === 'COMPLETED').length;
    return Math.round((completed / units.length) * 100);
  };

  const handleSendWhatsAppNotice = (unit) => {
    toast.success(`WhatsApp Recall Advisory sent to ${unit.customer} (${unit.phone}) for VIN ${unit.vin}`);
    setBulletins(prev => prev.map(b => {
      if (b.id !== selectedBulletin.id) return b;
      return {
        ...b,
        matchedUnits: b.matchedUnits.map(u => u.id === unit.id ? { ...u, status: 'NOTIFIED' } : u)
      };
    }));
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Workshop & Service', path: '/service/bays' },
          { label: 'Recalls & Bulletins', path: '/service/recalls' },
        ]}
        title="OEM Safety Recalls & Service Bulletins"
        subtitle="Track manufacturer safety campaigns, match sold & stock chassis numbers, and trigger automated WhatsApp advisories."
        actions={
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Add OEM Circular
          </button>
        }
      />

      {/* 2. Plain KPI Cards per Section 0.5 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          label="Active Bulletins"
          value={`${bulletins.length} Circulars`}
          helperText="OEM service advisories"
          icon={<ShieldAlert className="w-5 h-5 text-amber-500" />}
        />
        <KpiCard
          label="Matched Chassis Units"
          value={`${bulletins.reduce((sum, b) => sum + (b.matchedUnits?.length || 0), 0)} Units`}
          helperText="Chassis in affected ranges"
          icon={<FileText className="w-5 h-5 text-primary" />}
        />
        <KpiCard
          label="Retrofits Completed"
          value={`${bulletins.reduce((sum, b) => sum + (b.matchedUnits?.filter((u) => u.status === 'COMPLETED').length || 0), 0)} Completed`}
          helperText="Repaired & verified"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
        />
        <KpiCard
          label="OEM Reimbursement"
          value="100% FOC"
          helperText="Factory paid parts & labour"
          icon={<Clock className="w-5 h-5 text-blue-500" />}
        />
      </div>

      {/* Main Grid: Circulars list + Active Bulletin Matching Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Bulletins List */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Bulletins ({bulletins.length})
            </h2>

            <div className="space-y-2">
              {bulletins.map(b => {
                const isSelected = b.id === selectedBulletin.id;
                const completion = calculateCompletion(b.matchedUnits);
                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBulletin(b)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition space-y-2 ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 dark:bg-blue-950/40 dark:border-blue-700 shadow-sm'
                        : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded">
                        {b.oemCircularNo}
                      </span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {completion}% Completed
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                      {b.title}
                    </h3>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Matched VINs & WhatsApp Broadcast */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Circular Details</span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedBulletin.title}
                </h2>
                <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-4">
                  <span>Model: <strong>{selectedBulletin.model}</strong></span>
                  <span>Part: <strong>{selectedBulletin.partKit}</strong></span>
                  <span>Labour SAC: <strong className="font-mono">{selectedBulletin.labourSac}</strong></span>
                </div>
              </div>

              <div className="text-right">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  Valid till {selectedBulletin.validTill}
                </span>
              </div>
            </div>

            {/* Matched VINs Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Matched Customer VINs ({selectedBulletin.matchedUnits.length})
                </h3>
                <span className="text-xs text-slate-500">
                  Target Range: <strong className="font-mono">{selectedBulletin.affectedRange}</strong>
                </span>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-800 font-semibold text-slate-500 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">VIN / Chassis</th>
                      <th className="p-3">Customer &amp; Mobile</th>
                      <th className="p-3">Campaign Status</th>
                      <th className="p-3 text-right">Advisory Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedBulletin.matchedUnits.map(unit => (
                      <tr key={unit.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                          {unit.vin}
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{unit.customer}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{unit.phone}</div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            unit.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                            unit.status === 'APPOINTMENT_BOOKED' ? 'bg-blue-100 text-blue-800' :
                            unit.status === 'NOTIFIED' ? 'bg-purple-100 text-purple-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {unit.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {unit.status !== 'COMPLETED' && (
                            <button
                              onClick={() => handleSendWhatsAppNotice(unit)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 rounded hover:bg-emerald-100 transition"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              WhatsApp Advisory
                            </button>
                          )}
                          {unit.status === 'COMPLETED' && (
                            <span className="text-emerald-600 font-bold flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Retrofitted
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* WhatsApp Advisory Template Preview */}
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                Verified OEM WhatsApp Template (Free Replacement)
              </span>
              <p className="text-xs text-emerald-950 dark:text-emerald-200 italic">
                "Dear Customer, AKASH Bajaj in partnership with {selectedBulletin.model} OEM is conducting a complimentary preventive inspection ({selectedBulletin.oemCircularNo}) for your vehicle. Part replacement is 100% Free of Cost (FOC). Reply 1 to schedule priority workshop check-in."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecallsPage;
