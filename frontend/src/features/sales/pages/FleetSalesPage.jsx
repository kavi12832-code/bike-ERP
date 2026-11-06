import React, { useState } from 'react';
import { 
  Briefcase, 
  Building2, 
  Truck, 
  FileSpreadsheet, 
  Percent, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  Layers, 
  ShieldCheck, 
  Clock,
  ArrowRight
} from 'lucide-react';
import { formatMoney } from '../../../lib/format';
import { PageHeader } from '../../../components/ui/PageHeader';
import { KpiCard } from '../../../components/ui/KpiCard';
import { toast } from 'sonner';

const SAMPLE_FLEET_ACCOUNTS = [
  {
    id: 'flt-001',
    companyName: 'Bundl Technologies Pvt Ltd (Swiggy Instamart)',
    corporateGstin: '29AAGCB1820M1ZO',
    contactPerson: 'Vikram Merchant (Fleet VP)',
    phone: '+91 99001 88442',
    totalFleetSize: 45,
    activeDeals: [
      {
        dealId: 'FD-2627-01',
        model: 'TVS iQube Electric (Custom Cargo Rack)',
        unitsCount: 25,
        discountPercent: 5, // 11-25 slab
        unitPricePaise: 11500000, // ₹1,15,000
        totalDealValuePaise: 273125000, // After 5% discount
        invoicingMode: 'CONSOLIDATED', // CONSOLIDATED or PER_VEHICLE
        rcmApplicable: false,
        bulkAmcActive: true,
        batches: [
          { batchNo: 1, units: 10, deliveryDate: '2026-11-05', status: 'DELIVERED' },
          { batchNo: 2, units: 15, deliveryDate: '2026-11-20', status: 'IN_PDI' },
        ]
      }
    ]
  },
  {
    id: 'flt-002',
    companyName: 'SmartShift Logistics Solutions (Porter)',
    corporateGstin: '29AACCP8940P1Z8',
    contactPerson: 'Naveen Jindal (Procurement)',
    phone: '+91 98450 77112',
    totalFleetSize: 60,
    activeDeals: [
      {
        dealId: 'FD-2627-02',
        model: 'Honda SP125 (Commercial Courier Spec)',
        unitsCount: 30,
        discountPercent: 7, // 26+ slab
        unitPricePaise: 9200000, // ₹92,000
        totalDealValuePaise: 256680000,
        invoicingMode: 'PER_VEHICLE',
        rcmApplicable: false,
        bulkAmcActive: true,
        batches: [
          { batchNo: 1, units: 15, deliveryDate: '2026-11-15', status: 'PENDING_ALLOCATION' },
          { batchNo: 2, units: 15, deliveryDate: '2026-12-01', status: 'SCHEDULED' },
        ]
      }
    ]
  },
  {
    id: 'flt-003',
    companyName: 'Karnataka State Police (Traffic Division)',
    corporateGstin: '29BLRP00122G1Z1',
    contactPerson: 'ACP S. K. Patil',
    phone: '+91 080 22942222',
    totalFleetSize: 12,
    activeDeals: [
      {
        dealId: 'FD-2627-03',
        model: 'Royal Enfield Classic 350 (White / Siren Kit)',
        unitsCount: 10,
        discountPercent: 3, // 5-10 slab
        unitPricePaise: 19800000,
        totalDealValuePaise: 192060000,
        invoicingMode: 'CONSOLIDATED',
        rcmApplicable: true,
        bulkAmcActive: true,
        batches: [
          { batchNo: 1, units: 10, deliveryDate: '2026-10-30', status: 'DELIVERED' }
        ]
      }
    ]
  }
];

export function FleetSalesPage() {
  const [fleetAccounts, setFleetAccounts] = useState(SAMPLE_FLEET_ACCOUNTS);
  const [selectedAccount, setSelectedAccount] = useState(SAMPLE_FLEET_ACCOUNTS[0]);
  const [showNewDealModal, setShowNewDealModal] = useState(false);

  // New deal form state
  const [newUnitsCount, setNewUnitsCount] = useState(15);
  const [invoicingType, setInvoicingType] = useState('CONSOLIDATED');
  const [rcmToggle, setRcmToggle] = useState(false);
  const [bulkAmcToggle, setBulkAmcToggle] = useState(true);

  // Calculate discount slab
  const getDiscountPercent = (count) => {
    if (count >= 26) return 7;
    if (count >= 11) return 5;
    if (count >= 5) return 3;
    return 0;
  };

  const handleCreateDeal = (e) => {
    e.preventDefault();
    const discount = getDiscountPercent(newUnitsCount);
    toast.success(`Fleet Proposal generated for ${selectedAccount.companyName} with ${discount}% Corporate Slab discount!`);
    setShowNewDealModal(false);
  };

  const totalB2bPipelinePaise = (fleetAccounts || []).reduce((sum, acc) => 
    sum + ((acc?.activeDeals || []).reduce((dSum, d) => dSum + (d?.totalDealValuePaise || 0), 0)), 0
  );

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Operations', path: '/dashboard' },
          { label: 'Fleet & B2B Sales', path: '/sales/fleet' },
        ]}
        title="Corporate & Fleet Commercial Sales"
        subtitle="Bulk institutional sales for delivery fleets, corporate clients, automated volume discount slabs & phased delivery schedules."
        actions={
          <button
            onClick={() => setShowNewDealModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Create Corporate Fleet Deal
          </button>
        }
      />

      {/* 2. Plain KPI Cards per Section 0.5 */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard
          label="Institutional Pipeline"
          value={formatMoney(totalB2bPipelinePaise)}
          helperText={`${fleetAccounts.length} corporate accounts`}
          icon={<Briefcase className="w-5 h-5 text-primary" />}
        />
        <KpiCard
          label="Units in Order"
          value="65 Units"
          helperText="EV Cargo & 125cc fleets"
          icon={<Truck className="w-5 h-5 text-blue-500" />}
        />
        <KpiCard
          label="Volume Discount"
          value="Up to 7%"
          helperText="5-10: 3% | 11-25: 5% | 26+: 7%"
          icon={<Percent className="w-5 h-5 text-emerald-500" />}
        />
        <KpiCard
          label="Fleet SLA Priority"
          value="Bay #12 Dedicated"
          helperText="Turnaround commercial AMC"
          icon={<ShieldCheck className="w-5 h-5 text-purple-500" />}
        />
      </div>

      {/* Accounts & Deals Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Accounts List */}
        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Key Corporate Accounts ({fleetAccounts.length})
          </h2>

          <div className="space-y-2">
            {fleetAccounts.map(acc => {
              const isSelected = acc.id === selectedAccount.id;
              return (
                <div
                  key={acc.id}
                  onClick={() => setSelectedAccount(acc)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition space-y-2 ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 dark:bg-blue-950/40 dark:border-blue-700 shadow-sm'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      GST: {acc.corporateGstin}
                    </span>
                    <span className="text-xs font-bold text-blue-600">
                      {acc.totalFleetSize} Bikes
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {acc.companyName}
                  </h3>

                  <div className="text-[11px] text-slate-500">
                    Contact: {acc.contactPerson} ({acc.phone})
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Active Deal & Delivery Batches */}
        <div className="lg:col-span-2 space-y-6">
          {selectedAccount.activeDeals.map(deal => (
            <div key={deal.dealId} className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded">
                      {deal.dealId}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {deal.model}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Volume: <strong>{deal.unitsCount} Units</strong> • Corporate Discount Applied:{' '}
                    <strong className="text-emerald-600">{deal.discountPercent}% Slab</strong>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-blue-600 font-mono block">
                    {formatMoney(deal.totalDealValuePaise)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Mode: {deal.invoicingMode} {deal.rcmApplicable ? '(RCM)' : ''}
                  </span>
                </div>
              </div>

              {/* Delivery Batches Timeline */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Phased Handover Schedule
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {deal.batches.map(batch => (
                    <div 
                      key={batch.batchNo}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-xs space-y-1"
                    >
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-slate-900 dark:text-white">Batch #{batch.batchNo} ({batch.units} Units)</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          batch.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                          batch.status === 'IN_PDI' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {batch.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-slate-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Handover: {batch.deliveryDate}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fleet Maintenance Add-on */}
              {deal.bulkAmcActive && (
                <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-lg text-xs flex items-center justify-between text-purple-900 dark:text-purple-300">
                  <span className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    Fleet Maintenance Contract (AMC) Active
                  </span>
                  <span>Priority Workshop Bay Allocated</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* New Fleet Deal Modal */}
      {showNewDealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-850 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Configure Institutional Fleet Proposal
            </h3>

            <form onSubmit={handleCreateDeal} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Corporate Client</label>
                <select className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg">
                  {fleetAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.companyName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Order Volume (Units)</label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={newUnitsCount}
                    onChange={(e) => setNewUnitsCount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Auto Slab Discount</label>
                  <div className="p-2 bg-emerald-50 text-emerald-800 font-bold rounded-lg text-center">
                    {getDiscountPercent(newUnitsCount)}% Corporate Slab
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Invoicing Format</label>
                  <select 
                    value={invoicingType} 
                    onChange={(e) => setInvoicingType(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  >
                    <option value="CONSOLIDATED">Single Consolidated Invoice</option>
                    <option value="PER_VEHICLE">Individual RC Invoices</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Reverse Charge (RCM)</label>
                  <select 
                    value={rcmToggle ? 'YES' : 'NO'} 
                    onChange={(e) => setRcmToggle(e.target.value === 'YES')}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  >
                    <option value="NO">Standard Forward Charge</option>
                    <option value="YES">Reverse Charge (RCM Applicable)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-between">
                <span>Include Fleet Bulk AMC Maintenance Package</span>
                <input
                  type="checkbox"
                  checked={bulkAmcToggle}
                  onChange={(e) => setBulkAmcToggle(e.target.checked)}
                  className="rounded text-blue-600 w-4 h-4"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewDealModal(false)}
                  className="px-3 py-1.5 rounded-lg border hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                >
                  Generate Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FleetSalesPage;

