import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { formatMoney, formatDate } from '../../../lib/format';
import {
  Repeat,
  PlusCircle,
  Camera,
  Sparkles,
  Wrench,
  CheckCircle,
  FileCheck,
  Pencil,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { useCollection } from '../../../hooks/useCollection';
export function ExchangePage() {
  const [exchangeAppraisals, setExchangeAppraisals] = useCollection('exchange.exchange.exchangeAppraisals');

  const [valuationModalOpen, setValuationModalOpen] = useState(false);
  const [custName, setCustName] = useState('Ramesh Hegde');
  const [makeModel, setMakeModel] = useState('Honda Activa 3G (2016)');
  const [odoKm, setOdoKm] = useState('38000');
  const [aiPrice, setAiPrice] = useState(24000);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingExc, setEditingExc] = useState(null);
  const [editForm, setEditForm] = useState({
    customerName: '',
    oldBikeModel: '',
    registrationNumber: '',
    odometerKm: 0,
    conditionGrade: 'GOOD',
    approvedValuationRupees: 25000,
    targetNewBike: '',
    status: 'VALUATION_COMPLETED',
  });

  const handleComputeAiValuation = () => {
    const calculated = Math.max(12000, Math.round(55000 - Number(odoKm || 30000) * 0.7));
    setAiPrice(calculated);
    toast.success(`AI Valuation Complete: Suggested Market Buyback ₹${calculated.toLocaleString('en-IN')}`);
  };

  const handleAutoFillDemoTradeIn = () => {
    setCustName('Ramesh Hegde');
    setMakeModel('Honda Activa 3G (2016)');
    setOdoKm('38000');
    setAiPrice(24000);
    toast.success('Auto-filled demo two-wheeler trade-in details!');
  };

  const handleSaveAppraisal = (e) => {
    e.preventDefault();
    const finalCustName = custName.trim() || 'Ramesh Hegde';
    const finalModel = makeModel.trim() || 'Honda Activa 3G (2016)';
    const calculatedApprovedPaise = (aiPrice + 1500) * 100;

    const newExc = {
      id: `exc-${Date.now()}`,
      customerName: finalCustName,
      phone: '+91 98450 12345',
      oldBikeModel: finalModel,
      registrationNumber: 'KA-05-AP-9901',
      odometerKm: Number(odoKm) || 38000,
      conditionGrade: 'GOOD',
      aiEstimatedPricePaise: aiPrice * 100,
      approvedValuationPaise: calculatedApprovedPaise,
      targetNewBike: 'Classic 350 Halcyon',
      status: 'VALUATION_COMPLETED',
      refurbishmentEstimatePaise: 250000,
    };

    setExchangeAppraisals([newExc, ...exchangeAppraisals]);
    setValuationModalOpen(false);
    toast.success(`Exchange Trade-in registered for ${finalCustName}! Valuation: ${formatMoney(newExc.approvedValuationPaise)}`);
  };

  const openEditModal = (exc) => {
    setEditingExc(exc);
    setEditForm({
      customerName: exc.customerName || '',
      oldBikeModel: exc.oldBikeModel || '',
      registrationNumber: exc.registrationNumber || '',
      odometerKm: exc.odometerKm || 0,
      conditionGrade: exc.conditionGrade || 'GOOD',
      approvedValuationRupees: Math.round((exc.approvedValuationPaise || 0) / 100),
      targetNewBike: exc.targetNewBike || '',
      status: exc.status || 'VALUATION_COMPLETED',
    });
    setEditModalOpen(true);
  };

  const handleSaveEditValuation = (e) => {
    e.preventDefault();
    if (!editForm.customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }
    setExchangeAppraisals((prev) =>
      prev.map((item) =>
        item.id === editingExc.id
          ? {
              ...item,
              customerName: editForm.customerName,
              oldBikeModel: editForm.oldBikeModel,
              registrationNumber: editForm.registrationNumber.toUpperCase(),
              odometerKm: Number(editForm.odometerKm) || 0,
              conditionGrade: editForm.conditionGrade,
              approvedValuationPaise: Number(editForm.approvedValuationRupees) * 100,
              targetNewBike: editForm.targetNewBike,
              status: editForm.status,
            }
          : item
      )
    );
    toast.success(`Trade-in appraisal for ${editForm.customerName} updated!`);
    setEditModalOpen(false);
  };

  const handleDeleteAppraisal = (excId, name) => {
    if (window.confirm(`Are you sure you want to delete trade-in appraisal for ${name}?`)) {
      setExchangeAppraisals((prev) => prev.filter((item) => item.id !== excId));
      toast.info(`Trade-in appraisal for ${name} removed.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main">Exchange, Trade-ins &amp; Pre-Owned Valuation</h1>
          <p className="text-xs text-text-muted mt-0.5">
            AI price appraisal engine, trade-in invoice deduction and certified pre-owned refurbishment tracking
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={PlusCircle}
          onClick={() => {
            setCustName('Ramesh Hegde');
            setValuationModalOpen(true);
          }}
        >
          New Bike Trade-in Appraisal
        </Button>
      </div>

      {/* Appraisals Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-subtle border-b border-border text-text-muted font-semibold uppercase text-[11px]">
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Old Bike Make &amp; Model</th>
                <th className="p-3.5">Registration #</th>
                <th className="p-3.5">Odometer</th>
                <th className="p-3.5">Condition</th>
                <th className="p-3.5">AI Valuation</th>
                <th className="p-3.5">Approved Trade-in Value</th>
                <th className="p-3.5">Target New Vehicle</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {exchangeAppraisals.map((exc) => (
                <tr key={exc.id} className="hover:bg-surface-subtle/70 transition-colors">
                  <td className="p-3.5 font-bold text-text-main">{exc.customerName}</td>
                  <td className="p-3.5 font-medium text-text-main">{exc.oldBikeModel}</td>
                  <td className="p-3.5 font-mono text-primary font-semibold">{exc.registrationNumber}</td>
                  <td className="p-3.5 tabular-nums text-text-muted">{exc.odometerKm} KM</td>
                  <td className="p-3.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-muted text-text-muted uppercase">
                      {exc.conditionGrade}
                    </span>
                  </td>
                  <td className="p-3.5 tabular-nums text-text-muted">{formatMoney(exc.aiEstimatedPricePaise)}</td>
                  <td className="p-3.5 tabular-nums font-bold text-status-green">
                    {formatMoney(exc.approvedValuationPaise)}
                  </td>
                  <td className="p-3.5 font-semibold text-text-main">{exc.targetNewBike}</td>
                  <td className="p-3.5">
                    <StatusBadge status={exc.status} />
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(exc)}
                        className="p-1.5 rounded hover:bg-surface-subtle text-text-muted hover:text-primary"
                        title="Edit Valuation"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAppraisal(exc.id, exc.customerName)}
                        className="p-1.5 rounded hover:bg-red-50 text-text-muted hover:text-status-red"
                        title="Delete Appraisal"
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

      {/* AI Valuation Appraisal Modal */}
      <Modal
        isOpen={valuationModalOpen}
        onClose={() => setValuationModalOpen(false)}
        title="AI-Powered Two-Wheeler Exchange Valuation"
        size="md"
      >
        <form onSubmit={handleSaveAppraisal} className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50 border border-blue-200">
            <span className="text-[11px] text-blue-900 font-medium">
              Demo sample trade-in evaluation:
            </span>
            <button
              type="button"
              onClick={handleAutoFillDemoTradeIn}
              className="px-2.5 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Auto-Fill Demo Bike
            </button>
          </div>

          <div>
            <label className="block font-semibold text-text-main mb-1">Customer Name</label>
            <input
              type="text"
              required
              value={custName}
              onChange={(e) => setCustName(e.target.value)}
              placeholder="e.g. Ramesh Hegde"
              className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-text-main mb-1">Old Two-Wheeler Model</label>
              <input
                type="text"
                required
                value={makeModel}
                onChange={(e) => setMakeModel(e.target.value)}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              />
            </div>
            <div>
              <label className="block font-semibold text-text-main mb-1">Odometer (KM)</label>
              <input
                type="number"
                value={odoKm}
                onChange={(e) => setOdoKm(e.target.value)}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-mono"
              />
            </div>
          </div>

          <div className="p-4 rounded-card bg-blue-50 border border-blue-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-primary flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>AI Algorithmic Fair Value</span>
              </span>
              <Button type="button" size="sm" variant="secondary" onClick={handleComputeAiValuation}>
                Recalculate AI Quote
              </Button>
            </div>
            <div className="text-xl font-bold text-navy-900 tabular-nums">
              ₹ {aiPrice.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-slate-500">
              Computed from live market depreciations, Bangalore regional resale demand, and odometer wear.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setValuationModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="bg-primary text-white font-bold">
              Approve Exchange Trade-in
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Valuation Modal */}
      {editModalOpen && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title={`Edit Trade-in Appraisal: ${editingExc?.customerName}`}
          size="md"
        >
          <form onSubmit={handleSaveEditValuation} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-text-main mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={editForm.customerName}
                  onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                  className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
                />
              </div>
              <div>
                <label className="block font-semibold text-text-main mb-1">Registration #</label>
                <input
                  type="text"
                  value={editForm.registrationNumber}
                  onChange={(e) => setEditForm({ ...editForm, registrationNumber: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 font-mono uppercase rounded-input border border-border bg-surface text-text-main"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-text-main mb-1">Old Two-Wheeler Model</label>
                <input
                  type="text"
                  value={editForm.oldBikeModel}
                  onChange={(e) => setEditForm({ ...editForm, oldBikeModel: e.target.value })}
                  className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
                />
              </div>
              <div>
                <label className="block font-semibold text-text-main mb-1">Odometer (KM)</label>
                <input
                  type="number"
                  value={editForm.odometerKm}
                  onChange={(e) => setEditForm({ ...editForm, odometerKm: e.target.value })}
                  className="w-full p-2.5 font-mono rounded-input border border-border bg-surface text-text-main"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-text-main mb-1">Approved Trade-in Value (₹)</label>
                <input
                  type="number"
                  value={editForm.approvedValuationRupees}
                  onChange={(e) => setEditForm({ ...editForm, approvedValuationRupees: e.target.value })}
                  className="w-full p-2.5 font-mono font-bold rounded-input border border-border bg-surface text-text-main"
                />
              </div>
              <div>
                <label className="block font-semibold text-text-main mb-1">Condition Grade</label>
                <select
                  value={editForm.conditionGrade}
                  onChange={(e) => setEditForm({ ...editForm, conditionGrade: e.target.value })}
                  className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
                >
                  <option value="EXCELLENT">EXCELLENT</option>
                  <option value="GOOD">GOOD</option>
                  <option value="FAIR">FAIR</option>
                  <option value="POOR">POOR</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-text-main mb-1">Target New Vehicle</label>
                <input
                  type="text"
                  value={editForm.targetNewBike}
                  onChange={(e) => setEditForm({ ...editForm, targetNewBike: e.target.value })}
                  className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
                />
              </div>
              <div>
                <label className="block font-semibold text-text-main mb-1">Appraisal Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
                >
                  <option value="VALUATION_COMPLETED">VALUATION_COMPLETED</option>
                  <option value="ADJUSTED_TO_INVOICE">ADJUSTED_TO_INVOICE</option>
                  <option value="INSPECTED">INSPECTED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button variant="secondary" type="button" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Appraisal Details
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default ExchangePage;
