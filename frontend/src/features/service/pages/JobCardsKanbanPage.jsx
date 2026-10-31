import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../store';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Drawer } from '../../../components/ui/Drawer';
import { Modal } from '../../../components/ui/Modal';
import { formatMoney, formatPhone, formatDate } from '../../../lib/format';
import { PageHeader } from '../../../components/ui/PageHeader';
import { KpiCard } from '../../../components/ui/KpiCard';
import {
  ClipboardList,
  PlusCircle,
  Wrench,
  Clock,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  Printer,
  ArrowRight,
  UserCheck,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';

const STAGES = [
  { id: 'BOOKED', label: 'Booked' },
  { id: 'CHECKED_IN', label: 'Checked In' },
  { id: 'ESTIMATE_SENT', label: 'Estimate Sent' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'QUALITY_CHECK', label: 'Quality Check' },
  { id: 'READY', label: 'Ready for Pickup' },
];

export function JobCardsKanbanPage() {
  const navigate = useNavigate();
  const state = useAppStore();
  const jobCards = state.jobCards || [];
  const drafts = jobCards.filter((jc) => jc.stage === 'DRAFT');
  const currentUser = state.currentUser;
  const updateJobCardStage = state.updateJobCardStage;

  const [selectedCard, setSelectedCard] = useState(null);
  const [qcModalOpen, setQcModalOpen] = useState(false);
  const [gatePassOpen, setGatePassOpen] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);

  const handleStageAdvance = (card) => {
    const currentIdx = STAGES.findIndex((s) => s.id === card.stage);
    if (currentIdx < STAGES.length - 1) {
      const nextStage = STAGES[currentIdx + 1].id;
      updateJobCardStage(card.id, nextStage);
      toast.success(`Job Card ${card.jobCardNumber} advanced to ${nextStage.replace(/_/g, ' ')}`);
    }
  };

  const handleSignQualityCheck = () => {
    if (!selectedCard) return;

    // Strict Rule: QC must be signed by a different user than the assigned technician!
    if (selectedCard.technicianId === currentUser?.id) {
      toast.error('Quality Check Sign-off Violation: QC must be signed by a supervisor/manager, not the working technician!');
      return;
    }

    updateJobCardStage(selectedCard.id, 'READY', {
      qcSignedBy: currentUser?.name || 'Service Supervisor',
    });
    setQcModalOpen(false);
    toast.success(`Quality Check certified by ${currentUser?.name}! Job Card is Ready for Delivery.`);
  };

  const handleSimulateCustomerApproval = () => {
    if (!selectedCard) return;
    updateJobCardStage(selectedCard.id, 'IN_PROGRESS', {
      customerApprovedAt: new Date().toISOString(),
      customerApprovedChannel: 'WHATSAPP_LINK_OTP',
    });
    setApprovalModalOpen(false);
    toast.success('Customer OTP approval recorded via WhatsApp Link! Authorized to begin work.');
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Workshop & Service', path: '/service/bays' },
          { label: 'Job Cards Kanban', path: '/service/jobs' },
        ]}
        title="Workshop Job Cards & Repair Execution"
        subtitle="Realtime kanban, customer digital OTP estimate authorizations and dual-control QC sign-offs."
        actions={
          <Button variant="primary" size="sm" icon={PlusCircle} onClick={() => navigate('/service/jobs/new')} className="bg-primary hover:bg-primary-hover text-white">
            Create Job Card
          </Button>
        }
      />

      {/* 2. Plain KPI Cards per Section 0.5 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          label="Total Active Job Cards"
          value={`${jobCards.length} Cards`}
          helperText="All workflow stages"
          icon={<ClipboardList className="w-5 h-5 text-primary" />}
        />
        <KpiCard
          label="Work In Progress (WIP)"
          value={`${jobCards.filter((jc) => jc.stage === 'IN_PROGRESS').length} Active`}
          helperText="Vehicles currently in bays"
          icon={<Wrench className="w-5 h-5 text-blue-500" />}
        />
        <KpiCard
          label="Awaiting Estimate / QC"
          value={`${jobCards.filter((jc) => jc.stage === 'ESTIMATE_SENT' || jc.stage === 'QUALITY_CHECK').length} Pending`}
          helperText="Customer OTP or QC gate"
          icon={<Clock className="w-5 h-5 text-amber-500" />}
        />
        <KpiCard
          label="Ready for Delivery"
          value={`${jobCards.filter((jc) => jc.stage === 'READY').length} Cleared`}
          helperText="Washing & QC approved"
          icon={<CheckCircle className="w-5 h-5 text-emerald-500" />}
        />
      </div>

      {/* Saved drafts from the Create Job Card form */}
      {drafts.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap p-3 rounded-card border border-dashed border-border bg-surface">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mr-1">
            Drafts ({drafts.length})
          </span>
          {drafts.map((d) => (
            <button
              key={d.id}
              onClick={() => navigate(`/service/jobs/new?draft=${d.id}`)}
              className="text-xs px-2.5 py-1 rounded-full border border-border bg-surface-subtle hover:border-primary/50 hover:text-primary"
            >
              <span className="font-mono font-semibold">{d.jobCardNumber}</span>
              {' · '}
              {d.customerName || d.registrationNumber || 'Untitled'}
            </button>
          ))}
        </div>
      )}

      {/* Kanban Board Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4 min-w-full">
        {STAGES.map((stage) => {
          const cardsInStage = jobCards.filter((jc) => jc.stage === stage.id);

          return (
            <div
              key={stage.id}
              className="w-72 shrink-0 bg-surface-subtle/80 rounded-card border border-border p-3 flex flex-col"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-border">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      stage.id === 'READY'
                        ? 'bg-emerald-500'
                        : stage.id === 'IN_PROGRESS'
                        ? 'bg-blue-500'
                        : stage.id === 'QUALITY_CHECK'
                        ? 'bg-purple-500'
                        : 'bg-slate-400'
                    }`}
                  />
                  <span className="text-xs font-bold text-text-main truncate">{stage.label}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface text-text-muted border border-border tabular-nums shrink-0">
                  {cardsInStage.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-340px)]">
                {cardsInStage.length === 0 ? (
                  <div className="py-8 text-center text-[11px] text-text-muted italic">
                    No cards in {stage.label}
                  </div>
                ) : (
                  cardsInStage.map((card) => (
                    <Card
                      key={card.id}
                      hover
                      onClick={() => setSelectedCard(card)}
                      className="p-3 bg-surface border-border hover:border-primary/50 transition-all text-xs shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="font-mono font-bold text-primary">{card.jobCardNumber}</span>
                        {card.bayNumber && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-status-blue">
                            Bay #{card.bayNumber}
                          </span>
                        )}
                      </div>

                      <div className="font-bold text-text-main truncate">{card.customerName}</div>
                      <div className="font-mono text-[11px] font-semibold text-text-muted mt-0.5">
                        {card.registrationNumber}
                      </div>
                      <div className="text-[10px] text-text-muted truncate mt-0.5">
                        {card.modelName}
                      </div>

                      <div className="mt-2 pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
                        <span className="tabular-nums font-bold text-text-main">
                          {formatMoney(card.grandTotalPaise)}
                        </span>
                        <div className="flex items-center gap-1">
                          {stage.id === 'ESTIMATE_SENT' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCard(card);
                                setApprovalModalOpen(true);
                              }}
                              className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]"
                            >
                              Approve OTP
                            </button>
                          ) : stage.id === 'QUALITY_CHECK' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCard(card);
                                setQcModalOpen(true);
                              }}
                              className="px-2 py-0.5 rounded bg-primary text-white font-bold text-[10px]"
                            >
                              Sign QC
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStageAdvance(card);
                              }}
                              className="p-1 rounded bg-surface-muted hover:bg-primary hover:text-white transition-colors"
                              title="Advance Job Card"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Job Card Detail Drawer */}
      <Drawer
        isOpen={Boolean(selectedCard && !qcModalOpen && !gatePassOpen && !approvalModalOpen)}
        onClose={() => setSelectedCard(null)}
        title={selectedCard ? `Job Card: ${selectedCard.jobCardNumber}` : ''}
        size="lg"
      >
        {selectedCard && (
          <div className="space-y-6 text-xs">
            {/* Banner */}
            <div className="p-4 rounded-card bg-surface-subtle border border-border flex items-start justify-between">
              <div>
                <div className="font-mono font-bold text-primary text-sm">{selectedCard.jobCardNumber}</div>
                <div className="text-sm font-bold text-text-main mt-0.5">{selectedCard.customerName}</div>
                <div className="text-text-muted mt-0.5 font-mono">
                  Reg: {selectedCard.registrationNumber} • {selectedCard.modelName}
                </div>
              </div>
              <StatusBadge status={selectedCard.stage} />
            </div>

            {/* Check-in Inspection Data */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded bg-surface-subtle border border-border">
                <span className="text-[10px] text-text-muted uppercase font-semibold block">Odometer</span>
                <span className="font-bold text-sm text-text-main tabular-nums">{selectedCard.odometerKm} KM</span>
              </div>
              <div className="p-3 rounded bg-surface-subtle border border-border">
                <span className="text-[10px] text-text-muted uppercase font-semibold block">Fuel / SOC</span>
                <span className="font-bold text-sm text-text-main tabular-nums">{selectedCard.fuelLevelPercent}%</span>
              </div>
              <div className="p-3 rounded bg-surface-subtle border border-border">
                <span className="text-[10px] text-text-muted uppercase font-semibold block">Assigned Bay</span>
                <span className="font-bold text-sm text-primary">
                  {selectedCard.bayNumber ? `Bay #${selectedCard.bayNumber}` : 'Unassigned'}
                </span>
              </div>
              <div className="p-3 rounded bg-surface-subtle border border-border">
                <span className="text-[10px] text-text-muted uppercase font-semibold block">Technician</span>
                <span className="font-bold text-sm text-text-main">
                  {selectedCard.technicianName || 'Unassigned'}
                </span>
              </div>
            </div>

            {/* Customer Complaints List */}
            <Card className="p-4">
              <h4 className="font-semibold text-text-main mb-2">Customer Voice & Stated Complaints</h4>
              <ul className="space-y-1.5 list-disc pl-5 text-text-main">
                {selectedCard.customerComplaints?.map((comp, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {comp}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Financial Estimate Breakdown */}
            <Card className="p-4 space-y-2">
              <h4 className="font-semibold text-text-main mb-2">Cost Estimate & Statutory Taxes</h4>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-text-muted">Labour Service Charges (SAC 9987):</span>
                <span className="tabular-nums font-semibold">{formatMoney(selectedCard.labourChargesPaise)}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-text-muted">Genuine OEM Spare Parts & Oils:</span>
                <span className="tabular-nums font-semibold">{formatMoney(selectedCard.partsChargesPaise)}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-text-muted">Goods & Services Tax (GST 18%):</span>
                <span className="tabular-nums font-semibold">{formatMoney(selectedCard.taxPaise)}</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-bold text-text-main">
                <span>Total Estimated Cost:</span>
                <span className="text-primary tabular-nums">{formatMoney(selectedCard.grandTotalPaise)}</span>
              </div>
            </Card>

            {/* QC Sign Status */}
            <div className="p-3 rounded bg-surface-subtle border border-border flex items-center justify-between">
              <div>
                <span className="font-semibold text-text-main block">Quality Assurance Sign-off</span>
                <span className="text-[11px] text-text-muted">
                  {selectedCard.qcSignedBy
                    ? `Certified by Supervisor: ${selectedCard.qcSignedBy}`
                    : 'Pending supervisory inspection sign-off'}
                </span>
              </div>
              {selectedCard.qcSignedBy ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 text-status-green">
                  QC Passed
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-status-amber">
                  Awaiting Sign
                </span>
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-border flex flex-wrap gap-2">
              {selectedCard.stage === 'READY' && (
                <Button
                  variant="primary"
                  icon={Printer}
                  onClick={() => setGatePassOpen(true)}
                >
                  Generate Workshop Gate Pass
                </Button>
              )}
              {selectedCard.stage === 'ESTIMATE_SENT' && (
                <Button
                  variant="primary"
                  onClick={() => setApprovalModalOpen(true)}
                >
                  Simulate WhatsApp OTP Approval
                </Button>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* QC Sign-off Dual-Control Modal */}
      <Modal
        isOpen={qcModalOpen}
        onClose={() => setQcModalOpen(false)}
        title={selectedCard ? `Quality Control Certification: ${selectedCard.jobCardNumber}` : ''}
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-text-muted leading-relaxed">
            Dual-control audit policy: Quality sign-off must be performed by a service supervisor / manager to prevent conflict of interest.
          </p>

          <div className="p-3 rounded bg-surface-subtle border border-border space-y-1">
            <div>
              <span className="text-text-muted">Working Technician:</span>{' '}
              <strong>{selectedCard?.technicianName || 'Manoj Kumar'}</strong>
            </div>
            <div>
              <span className="text-text-muted">Current Logged-in User:</span>{' '}
              <strong className="text-primary">{currentUser?.name}</strong> ({currentUser?.role})
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setQcModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSignQualityCheck}>
              Certify & Release to Customer
            </Button>
          </div>
        </div>
      </Modal>

      {/* Customer Approval Modal */}
      <Modal
        isOpen={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        title="Customer Estimate Digital Approval Simulation"
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-text-muted leading-relaxed">
            Simulates customer clicking WhatsApp estimate authorization link and confirming with OTP:
          </p>
          <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
            Estimate Total: {formatMoney(selectedCard?.grandTotalPaise)} (Labour + Parts + GST)
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setApprovalModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSimulateCustomerApproval}>
              Confirm Customer OTP Approval
            </Button>
          </div>
        </div>
      </Modal>

      {/* Workshop Exit Gate Pass Modal */}
      <Modal
        isOpen={gatePassOpen}
        onClose={() => setGatePassOpen(false)}
        title={selectedCard ? `Service Gate Pass: ${selectedCard.registrationNumber}` : ''}
        size="md"
      >
        {selectedCard && (
          <div className="p-6 bg-white text-slate-900 border border-border rounded-card space-y-4 text-xs font-sans">
            <div className="text-center border-b pb-3">
              <h3 className="font-bold text-base text-navy-900">{state.dealership.name}</h3>
              <p className="text-[11px] text-slate-500">Workshop Exit Gate Pass</p>
            </div>

            <div className="flex justify-between bg-slate-50 p-2.5 rounded font-mono">
              <div>
                <span className="text-[10px] text-slate-500 block">Job Card Ref:</span>
                <span className="font-bold text-primary">{selectedCard.jobCardNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">Date & Time:</span>
                <span className="font-bold">{formatDate(new Date())}</span>
              </div>
            </div>

            <div className="space-y-2 py-1">
              <div className="flex justify-between">
                <span className="text-slate-600">Vehicle Registration:</span>
                <span className="font-mono font-bold">{selectedCard.registrationNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Customer:</span>
                <span className="font-bold">{selectedCard.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">QC Signed By:</span>
                <span className="font-medium text-emerald-700">{selectedCard.qcSignedBy || 'Karthik Raja'}</span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>All repairs completed • Work certified by supervisor • Vehicle cleared for exit</span>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button variant="secondary" onClick={() => window.print()}>
                Print Gate Pass
              </Button>
              <Button variant="primary" onClick={() => setGatePassOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
