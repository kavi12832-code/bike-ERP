import React, { useState } from 'react';
import { useAppStore } from '../../../store';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { PageHeader } from '../../../components/ui/PageHeader';
import { KpiCard } from '../../../components/ui/KpiCard';
import { formatMoney } from '../../../lib/format';
import {
  Smartphone,
  Wrench,
  Clock,
  CheckCircle,
  Package,
  AlertTriangle,
  Play,
  Pause,
} from 'lucide-react';
import { toast } from 'sonner';

export function TechnicianMyJobsPage() {
  const state = useAppStore();
  const jobCards = state.jobCards || [];
  const partsStock = state.partsStock || [];
  const currentUser = state.currentUser;
  const updateJobCardStage = state.updateJobCardStage;

  // Filter jobs for technician (or show all in demo if admin)
  const myJobs = jobCards.filter((jc) => {
    if (currentUser?.role === 'Technician') {
      return jc.technicianId === currentUser.id;
    }
    return true; // Show active workshop jobs for demo
  });

  const [partsModalOpen, setPartsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedPartId, setSelectedPartId] = useState(partsStock[0]?.id || '');
  const [partQty, setPartQty] = useState(1);

  const handleRequestParts = (e) => {
    e.preventDefault();
    const part = partsStock.find((p) => p.id === selectedPartId);
    setPartsModalOpen(false);
    toast.success(`Parts issue slip logged for ${part?.name} (Qty: ${partQty}) on ${selectedJob?.jobCardNumber}`);
  };

  const handleSendToQc = (job) => {
    updateJobCardStage(job.id, 'QUALITY_CHECK');
    toast.success(`Job Card ${job.jobCardNumber} submitted for Supervisor Quality Inspection!`);
  };

  return (
    <div className="space-y-5">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Workshop & Service', path: '/service/bays' },
          { label: 'Technician My Jobs', path: '/service/my-jobs' },
        ]}
        title={`My Active Service Jobs (${currentUser?.name || 'Technician'})`}
        subtitle="Realtime workshop job cards, spare parts issue requisitions and supervisor QC submissions."
        actions={
          <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
            {myJobs.length} Assigned Jobs
          </span>
        }
      />

      {/* 2. Plain KPI Cards per Section 0.5 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          label="Assigned Jobs"
          value={`${myJobs.length} Cards`}
          helperText="Under technician care"
          icon={<Wrench className="w-5 h-5 text-primary" />}
        />
        <KpiCard
          label="In Progress (WIP)"
          value={`${myJobs.filter((j) => j.stage === 'IN_PROGRESS').length} Active`}
          helperText="Currently on bay bench"
          icon={<Play className="w-5 h-5 text-blue-500" />}
        />
        <KpiCard
          label="In Quality Check"
          value={`${myJobs.filter((j) => j.stage === 'QUALITY_CHECK').length} In QC`}
          helperText="Awaiting supervisor sign-off"
          icon={<Clock className="w-5 h-5 text-amber-500" />}
        />
        <KpiCard
          label="Ready for Delivery"
          value={`${myJobs.filter((j) => j.stage === 'READY').length} Cleared`}
          helperText="QC approved & washed"
          icon={<CheckCircle className="w-5 h-5 text-emerald-500" />}
        />
      </div>

      {/* Jobs Grid (Responsive multi-column on desktop/tablet) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {myJobs.map((job) => (
          <Card key={job.id} className="p-4 space-y-3.5 border-l-4 border-l-primary shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-primary">{job.jobCardNumber}</span>
                  <h3 className="font-bold text-sm text-text-main mt-0.5">{job.modelName}</h3>
                  <div className="inline-block font-mono text-[11px] font-semibold text-text-muted bg-surface-subtle px-1.5 py-0.5 rounded border border-border/60 mt-1">
                    {job.registrationNumber}
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1">
                  <StatusBadge status={job.stage} />
                  {job.bayNumber && (
                    <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                      Bay #{job.bayNumber}
                    </span>
                  )}
                </div>
              </div>

              {/* Complaints */}
              <div className="bg-surface-subtle p-3 rounded-card text-xs space-y-1.5 border border-border mt-3">
                <span className="font-semibold text-text-muted uppercase text-[10px] block">Customer Service Tasks:</span>
                <ul className="list-disc pl-4 space-y-1 text-text-main text-[11px]">
                  {job.customerComplaints?.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Large Tap Action Buttons for Technicians */}
            <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-border">
              <button
                onClick={() => {
                  setSelectedJob(job);
                  setPartsModalOpen(true);
                }}
                className="min-h-[42px] flex items-center justify-center gap-1.5 rounded-button bg-surface-subtle border border-border hover:bg-surface-muted font-bold text-xs text-text-main active:bg-surface-muted transition-colors"
              >
                <Package className="w-4 h-4 text-text-muted" />
                <span>Request Parts</span>
              </button>

              {job.stage !== 'QUALITY_CHECK' && job.stage !== 'READY' ? (
                <button
                  onClick={() => handleSendToQc(job)}
                  className="min-h-[42px] flex items-center justify-center gap-1.5 rounded-button bg-primary text-white font-bold text-xs hover:bg-primary-hover active:bg-primary-hover shadow-soft transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Submit QC</span>
                </button>
              ) : (
                <div className="min-h-[42px] flex items-center justify-center gap-1.5 rounded-button bg-green-50 text-status-green font-bold text-xs border border-green-200">
                  <CheckCircle className="w-4 h-4" />
                  <span>QC Passed</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Parts Request Modal */}
      <Modal
        isOpen={partsModalOpen}
        onClose={() => setPartsModalOpen(false)}
        title={selectedJob ? `Request Spares: ${selectedJob.jobCardNumber}` : ''}
        size="sm"
      >
        <form onSubmit={handleRequestParts} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-text-main mb-1">Select Spare Part SKU</label>
            <select
              value={selectedPartId}
              onChange={(e) => setSelectedPartId(e.target.value)}
              className="w-full p-2.5 rounded-input border border-border bg-surface-subtle text-text-main"
            >
              {partsStock.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.rackBin}) - Stock: {p.stockQty}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-text-main mb-1">Quantity Needed</label>
            <input
              type="number"
              min="1"
              value={partQty}
              onChange={(e) => setPartQty(Number(e.target.value))}
              className="w-full p-2.5 rounded-input border border-border bg-surface-subtle text-text-main font-bold"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setPartsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Dispatch Issue Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
