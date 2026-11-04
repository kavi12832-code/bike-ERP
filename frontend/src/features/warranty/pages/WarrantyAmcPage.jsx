import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../../store';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { PageHeader } from '../../../components/ui/PageHeader';
import { KpiCard } from '../../../components/ui/KpiCard';
import { formatMoney, formatDate } from '../../../lib/format';
import {
  Award,
  PlusCircle,
  ShieldCheck,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  XCircle,
  Layers,
  Search,
  X,
  Pencil,
  Trash2,
  DollarSign,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

import { useCollection } from '../../../hooks/useCollection';
// INITIAL_WARRANTY_CLAIMS: loaded from the database (collection "warranty.warrantyAmc.warrantyClaims")

// INITIAL_AMC_PLANS: loaded from the database (collection "warranty.warrantyAmc.amcPlans")

export function WarrantyAmcPage() {
  const [activeTab, setActiveTab] = useState('CLAIMS'); // 'CLAIMS', 'AMC_PLANS'
  const [warrantyClaims, setWarrantyClaims] = useCollection('warranty.warrantyAmc.warrantyClaims');
  const [amcPlans, setAmcPlans] = useCollection('warranty.warrantyAmc.amcPlans');
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [showFileClaimModal, setShowFileClaimModal] = useState(false);
  const [showEditClaimModal, setShowEditClaimModal] = useState(false);
  const [editingClaim, setEditingClaim] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [claimToDelete, setClaimToDelete] = useState(null);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [settlingClaim, setSettlingClaim] = useState(null);
  const [creditNoteInput, setCreditNoteInput] = useState('');

  const [claimForm, setClaimForm] = useState({
    customerName: '',
    registrationNumber: '',
    modelName: 'Royal Enfield Hunter 350',
    failedPart: '',
    failureReason: '',
    claimAmountRupees: 3500,
    oemName: 'Royal Enfield',
    status: 'FILED',
  });

  // Dynamic KPIs (Section 0.5: plain numbers, NO charts)
  const kpiStats = useMemo(() => {
    const pendingPaise = warrantyClaims
      .filter(c => c.status === 'SUBMITTED' || c.status === 'APPROVED' || c.status === 'FILED')
      .reduce((sum, c) => sum + (c.claimAmountPaise || 0), 0);

    const reimbursedPaise = warrantyClaims
      .filter(c => c.status === 'REIMBURSED')
      .reduce((sum, c) => sum + (c.claimAmountPaise || 0), 0);

    const activeAmcSubscribers = amcPlans.reduce((sum, p) => sum + (p.activeSubscribers || 0), 0);

    return {
      pendingPaise,
      reimbursedPaise,
      activeClaimsCount: warrantyClaims.filter(c => c.status !== 'REIMBURSED' && c.status !== 'REJECTED').length,
      activeAmcSubscribers,
    };
  }, [warrantyClaims, amcPlans]);

  const handleOpenFileClaim = () => {
    setClaimForm({
      customerName: '',
      registrationNumber: '',
      modelName: 'Royal Enfield Hunter 350',
      failedPart: '',
      failureReason: '',
      claimAmountRupees: 3500,
      oemName: 'Royal Enfield',
      status: 'FILED',
    });
    setShowFileClaimModal(true);
  };

  const handleSaveNewClaim = (e) => {
    e.preventDefault();
    if (!claimForm.customerName.trim() || !claimForm.failedPart.trim()) {
      toast.error('Customer Name and Failed Part are required.');
      return;
    }

    const claimNumber = `WCL/2627/000${15 + warrantyClaims.length}`;
    const newClaim = {
      id: `wcl-${Date.now().toString(36)}`,
      claimNumber,
      customerName: claimForm.customerName.trim(),
      registrationNumber: claimForm.registrationNumber.trim() || 'KA-01-REG-PEND',
      modelName: claimForm.modelName,
      failedPart: claimForm.failedPart.trim(),
      failureReason: claimForm.failureReason.trim() || 'Component defect during factory warranty period',
      claimAmountPaise: Number(claimForm.claimAmountRupees) * 100 || 350000,
      oemName: claimForm.oemName,
      status: claimForm.status,
      filedDate: new Date().toISOString(),
      ageingDays: 1,
      creditNoteNo: null,
    };

    setWarrantyClaims(prev => [newClaim, ...prev]);
    toast.success(`Warranty claim ${claimNumber} filed with ${claimForm.oemName}!`);
    setShowFileClaimModal(false);
  };

  const handleOpenEditClaim = (claim) => {
    setEditingClaim(claim);
    setClaimForm({
      customerName: claim.customerName,
      registrationNumber: claim.registrationNumber,
      modelName: claim.modelName,
      failedPart: claim.failedPart,
      failureReason: claim.failureReason,
      claimAmountRupees: Math.round(claim.claimAmountPaise / 100),
      oemName: claim.oemName,
      status: claim.status,
    });
    setShowEditClaimModal(true);
  };

  const handleSaveEditClaim = (e) => {
    e.preventDefault();
    if (!claimForm.customerName.trim() || !claimForm.failedPart.trim()) {
      toast.error('Customer name and failed part are required.');
      return;
    }

    setWarrantyClaims(prev => prev.map(c => {
      if (c.id !== editingClaim.id) return c;
      return {
        ...c,
        customerName: claimForm.customerName.trim(),
        registrationNumber: claimForm.registrationNumber.trim(),
        modelName: claimForm.modelName,
        failedPart: claimForm.failedPart.trim(),
        failureReason: claimForm.failureReason.trim(),
        claimAmountPaise: Number(claimForm.claimAmountRupees) * 100,
        oemName: claimForm.oemName,
        status: claimForm.status,
      };
    }));

    toast.success(`Claim ${editingClaim.claimNumber} updated.`);
    setShowEditClaimModal(false);
  };

  const promptDeleteClaim = (claim) => {
    setClaimToDelete(claim);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (claimToDelete) {
      setWarrantyClaims(prev => prev.filter(c => c.id !== claimToDelete.id));
      toast.success(`Claim ${claimToDelete.claimNumber} deleted.`);
    }
    setDeleteConfirmOpen(false);
    setClaimToDelete(null);
  };

  const handleOpenSettle = (claim) => {
    setSettlingClaim(claim);
    setCreditNoteInput(`CN/${claim.oemName.slice(0, 4).toUpperCase()}/${Math.floor(1000 + Math.random() * 9000)}`);
    setShowSettleModal(true);
  };

  const handleConfirmSettle = (e) => {
    e.preventDefault();
    if (!creditNoteInput.trim()) {
      toast.error('OEM Credit Note number is required.');
      return;
    }

    setWarrantyClaims(prev => prev.map(c => {
      if (c.id !== settlingClaim.id) return c;
      return {
        ...c,
        status: 'REIMBURSED',
        creditNoteNo: creditNoteInput.trim(),
      };
    }));

    toast.success(`Claim ${settlingClaim.claimNumber} marked as REIMBURSED via ${creditNoteInput}!`);
    setShowSettleModal(false);
    setSettlingClaim(null);
  };

  const filteredClaims = warrantyClaims.filter(c => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.claimNumber.toLowerCase().includes(q) ||
        c.customerName.toLowerCase().includes(q) ||
        c.registrationNumber.toLowerCase().includes(q) ||
        c.failedPart.toLowerCase().includes(q) ||
        c.oemName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Customer Care', path: '/customers' },
          { label: 'Warranty & OEM Claims', path: '/warranty' },
        ]}
        title="Warranty, AMC & OEM Reimbursement Claims"
        subtitle="Manufacturer reimbursement claims, warranty tenure verification, and customer recurring AMC maintenance packages."
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={PlusCircle}
            onClick={handleOpenFileClaim}
            className="bg-primary hover:bg-primary-hover text-white"
          >
            File OEM Warranty Claim
          </Button>
        }
      />

      {/* 2. Plain KPI Cards Row (Section 0.5: NO charts, sparklines, or trend arrows) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          label="Pending OEM Recovery"
          value={formatMoney(kpiStats.pendingPaise)}
          helperText={`${kpiStats.activeClaimsCount} active claims awaiting OEM credit`}
          icon={<Clock className="w-5 h-5 text-amber-500" />}
        />
        <KpiCard
          label="Reimbursed This FY"
          value={formatMoney(kpiStats.reimbursedPaise)}
          helperText="Settled via manufacturer credit notes"
          icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
        />
        <KpiCard
          label="Average Credit TAT"
          value="18 Days"
          helperText="Submission to credit note clearance"
          icon={<Award className="w-5 h-5 text-primary" />}
        />
        <KpiCard
          label="Active AMC Subscriptions"
          value={`${kpiStats.activeAmcSubscribers} Contracts`}
          helperText="Annual service maintenance packages"
          icon={<ShieldCheck className="w-5 h-5 text-indigo-600" />}
        />
      </div>

      {/* 3. View Switcher Tabs */}
      <div className="flex border-b border-border space-x-2">
        <button
          type="button"
          onClick={() => setActiveTab('CLAIMS')}
          className={`px-4 py-2 font-semibold text-xs border-b-2 transition-colors cursor-pointer ${
            activeTab === 'CLAIMS'
              ? 'border-primary text-primary bg-primary/5 rounded-t'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          OEM Claims Lifecycle ({warrantyClaims.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('AMC_PLANS')}
          className={`px-4 py-2 font-semibold text-xs border-b-2 transition-colors cursor-pointer ${
            activeTab === 'AMC_PLANS'
              ? 'border-primary text-primary bg-primary/5 rounded-t'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          AMC Maintenance Packages ({amcPlans.length})
        </button>
      </div>

      {/* 4. Tab 1: OEM Claims Lifecycle */}
      {activeTab === 'CLAIMS' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <Card className="p-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search by claim number, customer, vehicle or defective part..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-input border border-border bg-surface text-text-main focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-input border border-border bg-surface text-text-main"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="FILED">FILED</option>
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REIMBURSED">REIMBURSED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>

                {(search || statusFilter !== 'ALL') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={X}
                    onClick={() => {
                      setSearch('');
                      setStatusFilter('ALL');
                    }}
                    className="text-text-muted hover:text-text-main"
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Claims Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-subtle border-b border-border text-text-muted font-semibold uppercase text-[11px]">
                    <th className="p-3.5">Claim #</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Vehicle &amp; Reg #</th>
                    <th className="p-3.5">Defective OEM Part</th>
                    <th className="p-3.5">Manufacturer</th>
                    <th className="p-3.5">Claim Amount</th>
                    <th className="p-3.5">Ageing</th>
                    <th className="p-3.5">OEM Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredClaims.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-text-muted italic">
                        No warranty claims match the active filters.
                      </td>
                    </tr>
                  ) : (
                    filteredClaims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-surface-subtle/70 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-primary">{claim.claimNumber}</td>
                        <td className="p-3.5 font-bold text-text-main">{claim.customerName}</td>
                        <td className="p-3.5">
                          <div className="font-semibold text-text-main">{claim.modelName}</div>
                          <div className="font-mono text-[10px] text-text-muted">{claim.registrationNumber}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-medium text-text-main">{claim.failedPart}</div>
                          <div className="text-[10px] text-text-muted leading-relaxed">{claim.failureReason}</div>
                        </td>
                        <td className="p-3.5 text-text-muted">{claim.oemName}</td>
                        <td className="p-3.5 tabular-nums font-bold text-text-main">
                          {formatMoney(claim.claimAmountPaise)}
                        </td>
                        <td className="p-3.5 text-text-muted">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                              claim.ageingDays > 30 ? 'bg-rose-100 text-rose-700' : 'bg-surface-subtle text-text-muted border border-border'
                            }`}
                          >
                            {claim.ageingDays}d
                          </span>
                        </td>
                        <td className="p-3.5">
                          <StatusBadge status={claim.status} />
                          {claim.rejectionReason && (
                            <div className="text-[10px] text-rose-600 mt-0.5">{claim.rejectionReason}</div>
                          )}
                          {claim.creditNoteNo && (
                            <div className="text-[10px] font-mono text-emerald-600 mt-0.5">{claim.creditNoteNo}</div>
                          )}
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {claim.status !== 'REIMBURSED' && claim.status !== 'REJECTED' && (
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => handleOpenSettle(claim)}
                                className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                              >
                                Record Credit Note
                              </Button>
                            )}
                            <Button
                              size="xs"
                              variant="ghost"
                              icon={Pencil}
                              onClick={() => handleOpenEditClaim(claim)}
                              title="Edit Claim Details"
                            />
                            <Button
                              size="xs"
                              variant="ghost"
                              icon={Trash2}
                              onClick={() => promptDeleteClaim(claim)}
                              className="text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                              title="Delete Claim"
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* 5. Tab 2: AMC Maintenance Packages */}
      {activeTab === 'AMC_PLANS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {amcPlans.map((plan) => (
            <Card key={plan.id} className="p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                      plan.tier === 'PLATINUM'
                        ? 'bg-purple-100 text-purple-700 border border-purple-300'
                        : plan.tier === 'GOLD'
                        ? 'bg-amber-100 text-amber-700 border border-amber-300'
                        : 'bg-slate-100 text-slate-700 border border-slate-300'
                    }`}
                  >
                    {plan.tier} Care
                  </span>
                  <span className="text-xs font-semibold text-text-muted">
                    {plan.activeSubscribers} Active Subscribers
                  </span>
                </div>

                <h3 className="text-base font-bold text-text-main mt-3">{plan.title}</h3>
                <div className="text-2xl font-black text-primary mt-1 font-mono">
                  {formatMoney(plan.pricePaise)}
                  <span className="text-xs text-text-muted font-normal ml-1">/ year</span>
                </div>

                <div className="mt-4 pt-3 border-t border-border space-y-2 text-xs">
                  <div>
                    <span className="text-text-muted block text-[11px]">Included Benefits:</span>
                    <span className="font-medium text-text-main">{plan.servicesIncluded}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[11px]">Service Redemptions:</span>
                    <span className="font-semibold text-text-main">{plan.redemptions}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[11px]">Contract Validity:</span>
                    <span className="font-semibold text-text-main">{plan.coverageDays} Days (Annual)</span>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => toast.success(`Enrolled customer into ${plan.title}!`)}
                className="w-full bg-primary hover:bg-primary-hover text-white"
              >
                Enroll Customer into Plan
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* 6. File OEM Claim Modal */}
      <Modal
        isOpen={showFileClaimModal}
        onClose={() => setShowFileClaimModal(false)}
        title="File New OEM Warranty Reimbursement Claim"
        size="md"
      >
        <form onSubmit={handleSaveNewClaim} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Customer Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Ramesh Hegde"
                value={claimForm.customerName}
                onChange={(e) => setClaimForm({ ...claimForm, customerName: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Vehicle Registration #</label>
              <input
                type="text"
                placeholder="KA-01-AB-1234"
                value={claimForm.registrationNumber}
                onChange={(e) => setClaimForm({ ...claimForm, registrationNumber: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Bike Model</label>
              <input
                type="text"
                value={claimForm.modelName}
                onChange={(e) => setClaimForm({ ...claimForm, modelName: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Manufacturer OEM</label>
              <select
                value={claimForm.oemName}
                onChange={(e) => setClaimForm({ ...claimForm, oemName: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              >
                <option value="Royal Enfield">Royal Enfield</option>
                <option value="Honda Motorcycle & Scooter India (HMSI)">Honda Motorcycle & Scooter India (HMSI)</option>
                <option value="TVS Motor Company">TVS Motor Company</option>
                <option value="Ather Energy Ltd">Ather Energy Ltd</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Defective OEM Part *</label>
              <input
                type="text"
                placeholder="e.g. Fuel Pump Assembly"
                value={claimForm.failedPart}
                onChange={(e) => setClaimForm({ ...claimForm, failedPart: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Claim Recovery Value (₹)</label>
              <input
                type="number"
                value={claimForm.claimAmountRupees}
                onChange={(e) => setClaimForm({ ...claimForm, claimAmountRupees: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-text-main block mb-1">Technical Failure Description</label>
            <textarea
              rows={2}
              placeholder="Observation, symptoms, and failure cause under factory warranty..."
              value={claimForm.failureReason}
              onChange={(e) => setClaimForm({ ...claimForm, failureReason: e.target.value })}
              className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setShowFileClaimModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="bg-primary hover:bg-primary-hover text-white">
              Submit Claim to OEM
            </Button>
          </div>
        </form>
      </Modal>

      {/* 7. Edit Claim Modal */}
      <Modal
        isOpen={showEditClaimModal}
        onClose={() => setShowEditClaimModal(false)}
        title={`Edit Warranty Claim ${editingClaim?.claimNumber}`}
        size="md"
      >
        <form onSubmit={handleSaveEditClaim} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Customer Name</label>
              <input
                type="text"
                value={claimForm.customerName}
                onChange={(e) => setClaimForm({ ...claimForm, customerName: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Registration #</label>
              <input
                type="text"
                value={claimForm.registrationNumber}
                onChange={(e) => setClaimForm({ ...claimForm, registrationNumber: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Failed Part</label>
              <input
                type="text"
                value={claimForm.failedPart}
                onChange={(e) => setClaimForm({ ...claimForm, failedPart: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Claim Status</label>
              <select
                value={claimForm.status}
                onChange={(e) => setClaimForm({ ...claimForm, status: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-semibold"
              >
                <option value="FILED">FILED</option>
                <option value="SUBMITTED">SUBMITTED</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REIMBURSED">REIMBURSED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setShowEditClaimModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="bg-primary hover:bg-primary-hover text-white">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* 8. Record OEM Credit Note / Reimbursement Modal */}
      <Modal
        isOpen={showSettleModal}
        onClose={() => setShowSettleModal(false)}
        title={`Record OEM Credit Note — ${settlingClaim?.claimNumber}`}
        size="sm"
      >
        <form onSubmit={handleConfirmSettle} className="space-y-4 text-xs">
          <div className="p-3 bg-surface-subtle border border-border rounded-lg space-y-1">
            <div className="text-text-muted">Settlement Amount:</div>
            <div className="text-lg font-bold text-emerald-600 font-mono">
              {formatMoney(settlingClaim?.claimAmountPaise || 0)}
            </div>
            <div className="text-[11px] text-text-muted">OEM: {settlingClaim?.oemName}</div>
          </div>

          <div>
            <label className="font-semibold text-text-main block mb-1">OEM Credit Note Reference Number *</label>
            <input
              type="text"
              value={creditNoteInput}
              onChange={(e) => setCreditNoteInput(e.target.value)}
              className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-mono"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setShowSettleModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Confirm Reimbursement
            </Button>
          </div>
        </form>
      </Modal>

      {/* 9. Delete Confirmation */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirm Warranty Claim Deletion"
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-text-muted leading-relaxed">
            Are you sure you want to permanently delete claim <strong className="text-text-main">{claimToDelete?.claimNumber}</strong> for{' '}
            <strong className="text-text-main">{claimToDelete?.customerName}</strong>?
          </p>
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Delete Claim
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default WarrantyAmcPage;
