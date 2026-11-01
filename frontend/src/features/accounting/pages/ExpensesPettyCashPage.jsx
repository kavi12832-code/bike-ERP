import React, { useState } from 'react';
import { 
  Wallet, 
  Receipt, 
  Plus, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  DollarSign, 
  Filter, 
  Search, 
  ShieldCheck, 
  FileText,
  X,
  Pencil,
  Trash2,
} from 'lucide-react';
import { formatMoney } from '../../../lib/format';
import { toast } from 'sonner';

const SAMPLE_VOUCHERS = [
  {
    id: 'vch-001',
    voucherNo: 'PV/2627/0081',
    category: 'Shop Floor Consumables',
    payee: 'Sri Balaji Hardware & Tools',
    amountPaise: 185000, // ₹1,850 (<₹2,000 -> Auto approved)
    approvalTier: 'AUTO_APPROVED',
    status: 'PAID',
    hasGstInvoice: true,
    vendorGstin: '29ABCDE1234F1Z5',
    sacCode: '9987',
    cgstPaise: 14100,
    sgstPaise: 14100,
    paidFromFloat: true,
    date: '2026-10-24',
    receiptAttached: true,
  },
  {
    id: 'vch-002',
    voucherNo: 'PV/2627/0082',
    category: 'Refreshments & Pantry',
    payee: 'Udupi Upahar Tea Stall',
    amountPaise: 120000, // ₹1,200 (Auto approved)
    approvalTier: 'AUTO_APPROVED',
    status: 'PAID',
    hasGstInvoice: false,
    paidFromFloat: true,
    date: '2026-10-23',
    receiptAttached: true,
  },
  {
    id: 'vch-003',
    voucherNo: 'EV/2627/0045',
    category: 'Fuel & Demo Bikes Petrol',
    payee: 'Indian Oil Retail Outlet #491',
    amountPaise: 650000, // ₹6,500 (Branch Manager tier)
    approvalTier: 'BRANCH_MANAGER',
    status: 'APPROVED',
    hasGstInvoice: true,
    vendorGstin: '29AAACI1681G1Z1',
    paidFromFloat: false,
    date: '2026-10-22',
    receiptAttached: true,
  },
  {
    id: 'vch-004',
    voucherNo: 'EV/2627/0046',
    category: 'Legal & CA Retainer',
    payee: 'R. K. Swamy & Associates Chartered Accountants',
    amountPaise: 1500000, // ₹15,000 (>₹10,000 -> Dealer Principal tier)
    approvalTier: 'DEALER_PRINCIPAL',
    status: 'PENDING_APPROVAL',
    hasGstInvoice: true,
    vendorGstin: '29AABCS8891H1Z9',
    sacCode: '9982',
    cgstPaise: 114400,
    sgstPaise: 114400,
    paidFromFloat: false,
    date: '2026-10-24',
    receiptAttached: true,
  }
];

export function ExpensesPettyCashPage() {
  const [vouchers, setVouchers] = useState(SAMPLE_VOUCHERS);
  const [openingFloatPaise, setOpeningFloatPaise] = useState(1500000); // ₹15,000
  const [showAddModal, setShowAddModal] = useState(false);

  // New voucher form
  const [category, setCategory] = useState('Fuel');
  const [payee, setPayee] = useState('');
  const [amountRupees, setAmountRupees] = useState('');
  const [vendorGstin, setVendorGstin] = useState('');
  const [isGstInvoice, setIsGstInvoice] = useState(false);

  // Edit voucher modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [editForm, setEditForm] = useState({
    category: '',
    payee: '',
    amountRupees: '',
    status: 'PENDING_APPROVAL',
    approvalTier: 'AUTO_APPROVED',
    hasGstInvoice: false,
    vendorGstin: '',
  });

  const totalDisbursedFromFloatPaise = vouchers
    .filter(v => v.paidFromFloat && v.status === 'PAID')
    .reduce((sum, v) => sum + v.amountPaise, 0);

  const currentFloatBalancePaise = openingFloatPaise - totalDisbursedFromFloatPaise;

  const totalInputGstClaimablePaise = vouchers
    .filter(v => v.hasGstInvoice && v.status !== 'REJECTED')
    .reduce((sum, v) => sum + (v.cgstPaise || 0) + (v.sgstPaise || 0), 0);

  const handleCreateVoucher = (e) => {
    e.preventDefault();
    const paise = Math.round(Number(amountRupees) * 100);
    if (!paise || paise <= 0) return;

    let tier = 'AUTO_APPROVED';
    let status = 'PAID';

    if (paise > 1000000) {
      tier = 'DEALER_PRINCIPAL';
      status = 'PENDING_APPROVAL';
    } else if (paise > 200000) {
      tier = 'BRANCH_MANAGER';
      status = 'PENDING_APPROVAL';
    }

    const newVch = {
      id: `vch-${Date.now()}`,
      voucherNo: `EV/2627/${String(vouchers.length + 80).padStart(4, '0')}`,
      category,
      payee,
      amountPaise: paise,
      approvalTier: tier,
      status,
      hasGstInvoice: isGstInvoice,
      vendorGstin: isGstInvoice ? vendorGstin : null,
      paidFromFloat: paise <= 500000,
      date: new Date().toISOString().slice(0, 10),
      receiptAttached: true,
    };

    setVouchers(prev => [newVch, ...prev]);
    setShowAddModal(false);
    toast.success(`Expense voucher ${newVch.voucherNo} created with approval tier: ${tier}`);
  };

  const openEditModal = (v) => {
    setEditingVoucher(v);
    setEditForm({
      category: v.category || 'Fuel',
      payee: v.payee || '',
      amountRupees: Math.round(v.amountPaise / 100).toString(),
      status: v.status || 'PENDING_APPROVAL',
      approvalTier: v.approvalTier || 'AUTO_APPROVED',
      hasGstInvoice: Boolean(v.hasGstInvoice),
      vendorGstin: v.vendorGstin || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEditVoucher = (e) => {
    e.preventDefault();
    const paise = Math.round(Number(editForm.amountRupees) * 100);
    if (!paise || paise <= 0) {
      toast.error('Valid expense amount is required');
      return;
    }

    setVouchers(prev => prev.map(v => {
      if (v.id !== editingVoucher.id) return v;
      return {
        ...v,
        category: editForm.category,
        payee: editForm.payee,
        amountPaise: paise,
        status: editForm.status,
        approvalTier: editForm.approvalTier,
        hasGstInvoice: editForm.hasGstInvoice,
        vendorGstin: editForm.hasGstInvoice ? editForm.vendorGstin : null,
      };
    }));

    toast.success(`Voucher ${editingVoucher.voucherNo} updated successfully!`);
    setShowEditModal(false);
  };

  const handleDeleteVoucher = (id, voucherNo) => {
    if (window.confirm(`Are you sure you want to delete expense voucher ${voucherNo}?`)) {
      setVouchers(prev => prev.filter(v => v.id !== id));
      toast.info(`Voucher ${voucherNo} removed from ledger.`);
    }
  };

  const handleReplenishFloat = () => {
    setOpeningFloatPaise(prev => prev + 1000000);
    toast.success('Petty cash float replenishment of ₹10,000 authorized against voucher batch!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-blue-600" />
            Expenses, Petty Cash &amp; Input GST Tracker
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Voucher approval tiers (&le;₹2K Auto, &le;₹10K Branch Mgr, &gt;₹10K Principal), petty cash float management &amp; ITC recovery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReplenishFloat}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border rounded-lg hover:bg-slate-50 shadow-sm"
          >
            Replenish Cash Float
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Record Expense Voucher
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500">Petty Cash In Hand</div>
          <div className="text-2xl font-black text-emerald-600 font-mono mt-1">
            {formatMoney(currentFloatBalancePaise)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Opening float ₹15,000</div>
        </div>

        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500">Disbursed This Month</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
            {formatMoney(totalDisbursedFromFloatPaise)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Small petty cash disbursements</div>
        </div>

        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500">ITC Input Tax Credit</div>
          <div className="text-2xl font-black text-blue-600 font-mono mt-1">
            {formatMoney(totalInputGstClaimablePaise)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Claimable on GST portal (GSTR-2B)</div>
        </div>

        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500">Dual Control Threshold</div>
          <div className="text-xl font-black text-amber-600 font-mono mt-1">
            &gt; ₹10,000
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Requires Dealer Principal sign-off</div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-500 uppercase tracking-wider">
          Expense Vouchers Ledger ({vouchers.length})
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 font-semibold text-slate-500 uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Voucher # &amp; Date</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Payee / Vendor</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Approval Tier</th>
                <th className="p-3.5">GST / ITC Status</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {vouchers.map(v => (
                <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                  <td className="p-3.5">
                    <div className="font-mono font-bold text-blue-600">{v.voucherNo}</div>
                    <div className="text-[10px] text-slate-400">{v.date}</div>
                  </td>
                  <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                    {v.category}
                  </td>
                  <td className="p-3.5 text-slate-700 dark:text-slate-300">
                    <div>{v.payee}</div>
                    {v.vendorGstin && (
                      <div className="text-[10px] font-mono text-slate-400">GST: {v.vendorGstin}</div>
                    )}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                    {formatMoney(v.amountPaise)}
                  </td>
                  <td className="p-3.5 font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                      {v.approvalTier.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3.5">
                    {v.hasGstInvoice ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ITC Valid
                      </span>
                    ) : (
                      <span className="text-slate-400">Cash Bill (No GST)</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      v.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                      v.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                      v.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {v.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(v)}
                        className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600"
                        title="Edit Expense Voucher"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteVoucher(v.id, v.voucherNo)}
                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-500 hover:text-red-600"
                        title="Delete Voucher"
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
      </div>

      {/* Add Voucher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-850 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              Record Expense Voucher
            </h3>

            <form onSubmit={handleCreateVoucher} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Expense Category</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                >
                  <option value="Fuel">Fuel &amp; Demo Bikes Petrol</option>
                  <option value="Refreshments">Refreshments &amp; Pantry</option>
                  <option value="Shop Floor Consumables">Shop Floor Consumables (Cotton waste, degreaser)</option>
                  <option value="Stationery">Stationery &amp; Printing Paper</option>
                  <option value="Travel">Staff Travel &amp; RTO Transit</option>
                  <option value="Utilities">Electricity &amp; Internet Utilities</option>
                  <option value="Legal/CA">Legal, CA &amp; Statutory Retainer</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Payee / Vendor Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Indian Oil Corporation"
                  value={payee}
                  onChange={(e) => setPayee(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 1500"
                  value={amountRupees}
                  onChange={(e) => setAmountRupees(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono font-bold"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Vendor Provided GST Invoice (Claim ITC)</span>
                  <input
                    type="checkbox"
                    checked={isGstInvoice}
                    onChange={(e) => setIsGstInvoice(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </div>
                {isGstInvoice && (
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Vendor GSTIN</label>
                    <input
                      type="text"
                      placeholder="e.g. 29ABCDE1234F1Z5"
                      value={vendorGstin}
                      onChange={(e) => setVendorGstin(e.target.value)}
                      className="w-full p-1.5 bg-white dark:bg-slate-900 border rounded text-xs font-mono uppercase"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg border hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                >
                  Commit Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Voucher Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-850 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Pencil className="w-5 h-5 text-blue-600" />
                Edit Voucher: {editingVoucher?.voucherNo}
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditVoucher} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Expense Category</label>
                <select 
                  value={editForm.category} 
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                >
                  <option value="Fuel">Fuel &amp; Demo Bikes Petrol</option>
                  <option value="Refreshments">Refreshments &amp; Pantry</option>
                  <option value="Shop Floor Consumables">Shop Floor Consumables</option>
                  <option value="Stationery">Stationery &amp; Printing Paper</option>
                  <option value="Travel">Staff Travel &amp; RTO Transit</option>
                  <option value="Utilities">Electricity &amp; Internet Utilities</option>
                  <option value="Legal/CA">Legal, CA &amp; Statutory Retainer</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Payee / Vendor Name</label>
                <input
                  type="text"
                  required
                  value={editForm.payee}
                  onChange={(e) => setEditForm({ ...editForm, payee: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={editForm.amountRupees}
                  onChange={(e) => setEditForm({ ...editForm, amountRupees: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Status</label>
                  <select 
                    value={editForm.status} 
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  >
                    <option value="PENDING_APPROVAL">Pending Approval</option>
                    <option value="APPROVED">Approved</option>
                    <option value="PAID">Paid</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Approval Tier</label>
                  <select 
                    value={editForm.approvalTier} 
                    onChange={(e) => setEditForm({ ...editForm, approvalTier: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  >
                    <option value="AUTO_APPROVED">Auto Approved (&le;₹2K)</option>
                    <option value="BRANCH_MANAGER">Branch Manager (&le;₹10K)</option>
                    <option value="DEALER_PRINCIPAL">Dealer Principal (&gt;₹10K)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Vendor GST Invoice (Claim ITC)</span>
                  <input
                    type="checkbox"
                    checked={editForm.hasGstInvoice}
                    onChange={(e) => setEditForm({ ...editForm, hasGstInvoice: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </div>
                {editForm.hasGstInvoice && (
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Vendor GSTIN</label>
                    <input
                      type="text"
                      placeholder="e.g. 29ABCDE1234F1Z5"
                      value={editForm.vendorGstin}
                      onChange={(e) => setEditForm({ ...editForm, vendorGstin: e.target.value })}
                      className="w-full p-1.5 bg-white dark:bg-slate-900 border rounded text-xs font-mono uppercase"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-3 py-1.5 rounded-lg border hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                >
                  Save Voucher Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExpensesPettyCashPage;
