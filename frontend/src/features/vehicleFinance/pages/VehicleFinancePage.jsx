import React, { useState } from 'react';
import { useAppStore } from '../../../store';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { formatMoney, formatDate } from '../../../lib/format';
import { calculateEmi } from '../../../lib/emi';
import {
  Landmark,
  PlusCircle,
  Clock,
  CheckCircle,
  FileText,
  DollarSign,
  TrendingUp,
  Pencil,
  Trash2,
  Sparkles,
  Printer,
  Download,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';

import { useCollection } from '../../../hooks/useCollection';
export function VehicleFinancePage() {
  const financiers = useAppStore((state) => state.catalogs?.financiers || [
    { id: 'fin-hdfc', code: 'HDFC', name: 'HDFC Bank Auto Loans', interestRatePercent: 9.75, tatHours: 4, maxTenureMonths: 48, processingFeePaise: 99900 },
    { id: 'fin-icici', code: 'ICICI', name: 'ICICI Bank Two Wheeler Loan', interestRatePercent: 10.25, tatHours: 2, maxTenureMonths: 36, processingFeePaise: 125000 },
    { id: 'fin-bajaj', code: 'BAJAJ', name: 'Bajaj Auto Finance / Finserv', interestRatePercent: 11.5, tatHours: 1, maxTenureMonths: 36, processingFeePaise: 75000 },
    { id: 'fin-tata', code: 'TATA', name: 'Tata Capital Financial Services', interestRatePercent: 10.99, tatHours: 6, maxTenureMonths: 48, processingFeePaise: 89900 },
    { id: 'fin-idfc', code: 'IDFC', name: 'IDFC First Bank Two-Wheeler', interestRatePercent: 9.99, tatHours: 3, maxTenureMonths: 36, processingFeePaise: 99900 },
  ]);

  const [loanApplications, setLoanApplications] = useCollection('finance.vehicleFinance.loanApplications');

  // Create Application Modal State
  const [newLoanModalOpen, setNewLoanModalOpen] = useState(false);
  const [newForm, setNewForm] = useState({
    customerName: 'Anand Murthy',
    vehicleModel: 'Pulsar NS200 Dual ABS',
    financierName: 'HDFC Bank Auto Loans',
    loanAmountRupees: 140000,
    tenureMonths: 36,
    interestRatePercent: 9.75,
  });

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [editForm, setEditForm] = useState({
    customerName: '',
    vehicleModel: '',
    financierName: '',
    loanAmountRupees: 0,
    tenureMonths: 36,
    interestRatePercent: 9.75,
    stage: 'SANCTIONED',
    disbursementRef: '',
  });

  // Sanction Letter Modal State
  const [letterModalOpen, setLetterModalOpen] = useState(false);
  const [activeLetterLoan, setActiveLetterLoan] = useState(null);

  const handleAutoFillDemoLoan = () => {
    setNewForm({
      customerName: 'Anand Murthy',
      vehicleModel: 'Pulsar NS200 Dual ABS',
      financierName: 'HDFC Bank Auto Loans',
      loanAmountRupees: 140000,
      tenureMonths: 36,
      interestRatePercent: 9.75,
    });
    toast.success('Auto-filled demo loan application details!');
  };

  const handleCreateLoanApplication = (e) => {
    e.preventDefault();
    const finalCust = newForm.customerName.trim() || 'Anand Murthy';
    const finalModel = newForm.vehicleModel.trim() || 'Pulsar NS200 Dual ABS';
    const amountPaise = Number(newForm.loanAmountRupees || 140000) * 100;

    const newApp = {
      id: `loan-${Date.now()}`,
      appNumber: `LN/2627/000${44 + loanApplications.length}`,
      customerName: finalCust,
      vehicleModel: finalModel,
      financierName: newForm.financierName,
      loanAmountPaise: amountPaise,
      tenureMonths: Number(newForm.tenureMonths) || 36,
      interestRatePercent: Number(newForm.interestRatePercent) || 9.75,
      stage: 'SANCTIONED',
      disbursementRef: null,
      appliedDate: new Date().toISOString(),
    };

    setLoanApplications([newApp, ...loanApplications]);
    setNewLoanModalOpen(false);
    toast.success(`Loan Application ${newApp.appNumber} created and in-principle Sanctioned by ${newForm.financierName}!`);
  };

  const openEditModal = (loan) => {
    setEditingLoan(loan);
    setEditForm({
      customerName: loan.customerName || '',
      vehicleModel: loan.vehicleModel || '',
      financierName: loan.financierName || '',
      loanAmountRupees: Math.round((loan.loanAmountPaise || 0) / 100),
      tenureMonths: loan.tenureMonths || 36,
      interestRatePercent: loan.interestRatePercent || 9.75,
      stage: loan.stage || 'SANCTIONED',
      disbursementRef: loan.disbursementRef || '',
    });
    setEditModalOpen(true);
  };

  const handleSaveEditLoan = (e) => {
    e.preventDefault();
    if (!editForm.customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }

    setLoanApplications((prev) =>
      prev.map((item) =>
        item.id === editingLoan.id
          ? {
              ...item,
              customerName: editForm.customerName,
              vehicleModel: editForm.vehicleModel,
              financierName: editForm.financierName,
              loanAmountPaise: Number(editForm.loanAmountRupees) * 100,
              tenureMonths: Number(editForm.tenureMonths),
              interestRatePercent: Number(editForm.interestRatePercent),
              stage: editForm.stage,
              disbursementRef: editForm.disbursementRef.trim() || null,
            }
          : item
      )
    );
    toast.success(`Loan Application ${editingLoan.appNumber} updated successfully!`);
    setEditModalOpen(false);
  };

  const handleDeleteLoan = (loanId, appNumber) => {
    if (window.confirm(`Are you sure you want to cancel & delete loan application ${appNumber}?`)) {
      setLoanApplications((prev) => prev.filter((item) => item.id !== loanId));
      toast.info(`Loan application ${appNumber} deleted.`);
    }
  };

  const handleOpenSanctionLetter = (loan) => {
    setActiveLetterLoan(loan);
    setLetterModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main flex items-center gap-2">
            <Landmark className="w-6 h-6 text-primary" />
            Vehicle Retail Financing &amp; Bank Tie-ups
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Financier integrations (HDFC, ICICI, Bajaj, Tata), loan sanction tracking and instant disbursement receipts
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={PlusCircle}
          onClick={() => {
            setNewForm({
              customerName: 'Anand Murthy',
              vehicleModel: 'Pulsar NS200 Dual ABS',
              financierName: 'HDFC Bank Auto Loans',
              loanAmountRupees: 140000,
              tenureMonths: 36,
              interestRatePercent: 9.75,
            });
            setNewLoanModalOpen(true);
          }}
          className="bg-primary text-white font-bold"
        >
          New Finance Application
        </Button>
      </div>

      {/* Financier Partners Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {financiers.map((fin) => (
          <Card key={fin.id} className="p-4 flex flex-col justify-between hover:border-primary transition">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-primary">{fin.code}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-status-green">
                  {fin.tatHours}h Approval TAT
                </span>
              </div>
              <h4 className="font-bold text-xs text-text-main mt-1.5">{fin.name}</h4>
              <p className="text-[11px] text-text-muted mt-1">
                Interest starting from <strong>{fin.interestRatePercent}% p.a.</strong>
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-border text-[11px] text-text-muted flex justify-between">
              <span>Max: {fin.maxTenureMonths} Mos</span>
              <span>Fee: {formatMoney(fin.processingFeePaise)}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Loan Applications Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Active Two-Wheeler Loan Applications</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-subtle border-b border-border text-text-muted font-semibold uppercase text-[11px]">
                <th className="p-3.5">Application #</th>
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Vehicle Model</th>
                <th className="p-3.5">Financing Bank</th>
                <th className="p-3.5">Loan Principal</th>
                <th className="p-3.5">Tenure &amp; Rate</th>
                <th className="p-3.5">Disbursement Ref</th>
                <th className="p-3.5">Sanction Stage</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loanApplications.map((loan) => (
                <tr key={loan.id} className="hover:bg-surface-subtle/70 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-primary">{loan.appNumber}</td>
                  <td className="p-3.5 font-bold text-text-main">{loan.customerName}</td>
                  <td className="p-3.5 font-medium text-text-main">{loan.vehicleModel}</td>
                  <td className="p-3.5 font-semibold text-text-muted">{loan.financierName}</td>
                  <td className="p-3.5 tabular-nums font-bold text-text-main">
                    {formatMoney(loan.loanAmountPaise)}
                  </td>
                  <td className="p-3.5 text-text-muted">
                    {loan.tenureMonths} Mos @ {loan.interestRatePercent}%
                  </td>
                  <td className="p-3.5 font-mono text-text-muted">
                    {loan.disbursementRef || 'Pending Release'}
                  </td>
                  <td className="p-3.5">
                    <StatusBadge status={loan.stage} />
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenSanctionLetter(loan)}
                        className="text-xs font-semibold text-primary"
                      >
                        Sanction Letter
                      </Button>
                      <button
                        onClick={() => openEditModal(loan)}
                        className="p-1.5 rounded hover:bg-surface-subtle text-text-muted hover:text-primary"
                        title="Edit Loan Stage"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteLoan(loan.id, loan.appNumber)}
                        className="p-1.5 rounded hover:bg-red-50 text-text-muted hover:text-status-red"
                        title="Delete Application"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* New Loan Application Modal */}
      {newLoanModalOpen && (
        <Modal
          isOpen={newLoanModalOpen}
          onClose={() => setNewLoanModalOpen(false)}
          title="New Retail Vehicle Loan Application"
          size="md"
        >
          <form onSubmit={handleCreateLoanApplication} className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50 border border-blue-200">
              <span className="text-[11px] text-blue-900 font-medium">
                Demo sample loan application:
              </span>
              <button
                type="button"
                onClick={handleAutoFillDemoLoan}
                className="px-2.5 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Auto-Fill Demo Loan
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-text-main mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={newForm.customerName}
                  onChange={(e) => setNewForm({ ...newForm, customerName: e.target.value })}
                  placeholder="e.g. Anand Murthy"
                  className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
                />
              </div>
              <div>
                <label className="block font-semibold text-text-main mb-1">Vehicle Model</label>
                <input
                  type="text"
                  required
                  value={newForm.vehicleModel}
                  onChange={(e) => setNewForm({ ...newForm, vehicleModel: e.target.value })}
                  placeholder="e.g. Pulsar NS200 Dual ABS"
                  className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-text-main mb-1">Financing Bank</label>
                <select
                  value={newForm.financierName}
                  onChange={(e) => {
                    const selFin = financiers.find((f) => f.name === e.target.value);
                    setNewForm({
                      ...newForm,
                      financierName: e.target.value,
                      interestRatePercent: selFin ? selFin.interestRatePercent : newForm.interestRatePercent,
                    });
                  }}
                  className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
                >
                  {financiers.map((f) => (
                    <option key={f.id} value={f.name}>
                      {f.name} ({f.interestRatePercent}%)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-text-main mb-1">Loan Principal (₹)</label>
                <input
                  type="number"
                  required
                  value={newForm.loanAmountRupees}
                  onChange={(e) => setNewForm({ ...newForm, loanAmountRupees: Number(e.target.value) })}
                  className="w-full p-2.5 font-mono font-bold rounded-input border border-border bg-surface text-text-main"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-text-main mb-1">Tenure (Months)</label>
                <select
                  value={newForm.tenureMonths}
                  onChange={(e) => setNewForm({ ...newForm, tenureMonths: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
                >
                  <option value={12}>12 Months (1 Year)</option>
                  <option value={24}>24 Months (2 Years)</option>
                  <option value={36}>36 Months (3 Years)</option>
                  <option value={48}>48 Months (4 Years)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-text-main mb-1">Interest Rate (% p.a.)</label>
                <input
                  type="number"
                  step="0.05"
                  value={newForm.interestRatePercent}
                  onChange={(e) => setNewForm({ ...newForm, interestRatePercent: parseFloat(e.target.value) || 9.75 })}
                  className="w-full p-2.5 font-mono rounded-input border border-border bg-surface text-text-main"
                />
              </div>
            </div>

            {/* Live EMI calculation */}
            <div className="p-3 bg-surface-subtle border border-border rounded-lg flex items-center justify-between">
              <div>
                <span className="text-text-muted block text-[11px]">Estimated Monthly EMI:</span>
                <strong className="text-primary text-base font-mono">
                  {formatMoney(
                    calculateEmi(
                      (Number(newForm.loanAmountRupees) || 140000) * 100,
                      newForm.interestRatePercent,
                      newForm.tenureMonths
                    )
                  )} / mo
                </strong>
              </div>
              <span className="text-[10px] text-status-green bg-green-50 border border-green-200 px-2 py-1 rounded font-bold">
                Instant In-Principle Sanction
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button variant="secondary" type="button" onClick={() => setNewLoanModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="bg-primary text-white font-bold">
                Submit &amp; Sanction Loan
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Loan Application Modal */}
      {editModalOpen && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title={`Edit Loan: ${editingLoan?.appNumber}`}
          size="md"
        >
          <form onSubmit={handleSaveEditLoan} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-text-main mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.customerName}
                  onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                  className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
                />
              </div>
              <div>
                <label className="block font-semibold text-text-main mb-1">Vehicle Model</label>
                <input
                  type="text"
                  required
                  value={editForm.vehicleModel}
                  onChange={(e) => setEditForm({ ...editForm, vehicleModel: e.target.value })}
                  className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-text-main mb-1">Financing Bank</label>
                <input
                  type="text"
                  value={editForm.financierName}
                  onChange={(e) => setEditForm({ ...editForm, financierName: e.target.value })}
                  className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
                />
              </div>
              <div>
                <label className="block font-semibold text-text-main mb-1">Loan Principal (₹)</label>
                <input
                  type="number"
                  value={editForm.loanAmountRupees}
                  onChange={(e) => setEditForm({ ...editForm, loanAmountRupees: Number(e.target.value) })}
                  className="w-full p-2.5 font-mono font-bold rounded-input border border-border bg-surface text-text-main"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-text-main mb-1">Sanction Stage</label>
                <select
                  value={editForm.stage}
                  onChange={(e) => setEditForm({ ...editForm, stage: e.target.value })}
                  className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-semibold"
                >
                  <option value="APPLIED">APPLIED</option>
                  <option value="DOCUMENTS_VERIFIED">DOCUMENTS_VERIFIED</option>
                  <option value="SANCTIONED">SANCTIONED</option>
                  <option value="DISBURSED">DISBURSED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-text-main mb-1">Disbursement Ref Number</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC-DISB-99120"
                  value={editForm.disbursementRef}
                  onChange={(e) => setEditForm({ ...editForm, disbursementRef: e.target.value })}
                  className="w-full p-2.5 font-mono uppercase rounded-input border border-border bg-surface text-text-main"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button variant="secondary" type="button" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Loan Details
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Sanction Letter View Modal */}
      {letterModalOpen && activeLetterLoan && (
        <Modal
          isOpen={letterModalOpen}
          onClose={() => setLetterModalOpen(false)}
          title={`Bank Sanction Letter - ${activeLetterLoan.appNumber}`}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-6 bg-surface-subtle border border-border rounded-xl space-y-4 print:p-0">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="font-bold text-sm text-text-main">{activeLetterLoan.financierName}</h3>
                    <p className="text-[10px] text-text-muted">Retail Auto Loan Division • Bengaluru Hub</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-mono font-bold text-primary block">
                    {activeLetterLoan.appNumber}
                  </span>
                  <span className="text-[10px] text-text-muted">
                    Date: {new Date().toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-status-green flex items-center justify-between">
                <div>
                  <strong className="block text-xs">IN-PRINCIPLE LOAN SANCTION APPROVAL</strong>
                  <span className="text-[11px]">Subject to physical vehicle delivery &amp; RTO hypothecation endorsement</span>
                </div>
                <span className="text-xs font-mono font-bold bg-white px-2 py-1 rounded shadow-xs">
                  APPROVED
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <span className="text-text-muted block text-[11px]">Applicant Name:</span>
                  <strong className="text-text-main text-sm">{activeLetterLoan.customerName}</strong>
                </div>
                <div className="space-y-1">
                  <span className="text-text-muted block text-[11px]">Hypothecated Vehicle:</span>
                  <strong className="text-text-main text-sm">{activeLetterLoan.vehicleModel}</strong>
                </div>
                <div className="space-y-1">
                  <span className="text-text-muted block text-[11px]">Sanctioned Loan Principal:</span>
                  <strong className="text-primary text-base font-mono">
                    {formatMoney(activeLetterLoan.loanAmountPaise)}
                  </strong>
                </div>
                <div className="space-y-1">
                  <span className="text-text-muted block text-[11px]">Repayment EMI &amp; Tenure:</span>
                  <strong className="text-text-main text-sm font-mono">
                    {formatMoney(
                      calculateEmi(
                        activeLetterLoan.loanAmountPaise,
                        activeLetterLoan.interestRatePercent,
                        activeLetterLoan.tenureMonths
                      )
                    )} / mo for {activeLetterLoan.tenureMonths} Months
                  </strong>
                </div>
              </div>

              <div className="pt-4 border-t border-border text-[11px] text-text-muted space-y-1">
                <p><strong>Dealership:</strong> AKASH Bajaj (Authorized Dealer, Bangalore Central Flagship)</p>
                <p><strong>Disbursement Mode:</strong> Direct RTGS to Dealership Escrow upon Delivery Challan sign-off.</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                icon={Printer}
                onClick={() => {
                  window.print();
                  toast.success('Triggered system print preview for Sanction Letter.');
                }}
              >
                Print Sanction Letter
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setLetterModalOpen(false);
                  toast.success(`Sanction Letter verified for ${activeLetterLoan.customerName}`);
                }}
              >
                Close Letter
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default VehicleFinancePage;
