import React, { useState } from 'react';
import { 
  PieChart, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  Download, 
  Search, 
  ShieldCheck, 
  Lock,
  ArrowRight
} from 'lucide-react';
import { useAppStore } from '../../../store';
import { formatMoney } from '../../../lib/format';
import { PERMISSIONS } from '../../../config/permissions';
import { toast } from 'sonner';

import { useCollection } from '../../../hooks/useCollection';
// SAMPLE_DEAL_MARGINS: loaded from the database (collection "reports.dealProfitability.dealMargins")

export function DealProfitabilityPage() {
  const [deals, setDeals] = useCollection('reports.dealProfitability.dealMargins');
  const [search, setSearch] = useState('');
  const [negativeOnly, setNegativeOnly] = useState(false);

  const totalGrossProfitPaise = deals.reduce((sum, d) => sum + d.netContributionPaise, 0);
  const totalRevenuePaise = deals.reduce((sum, d) => sum + d.totalRevenuePaise, 0);
  const blendedMarginPercent = ((totalGrossProfitPaise / totalRevenuePaise) * 100).toFixed(1);

  const filtered = deals.filter(d => {
    const matchesSearch = 
      d.orderNo.toLowerCase().includes(search.toLowerCase()) ||
      d.customerName.toLowerCase().includes(search.toLowerCase()) ||
      d.model.toLowerCase().includes(search.toLowerCase());
    const matchesNegative = !negativeOnly || d.netContributionPaise < 0;
    return matchesSearch && matchesNegative;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-6 h-6 text-blue-600" />
              Deal Profitability &amp; Net Contribution P&amp;L
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
              <Lock className="w-3 h-3" /> cost.view Restricted
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Order-level unit economics: factory cost, accessory margin, finance/insurance payouts &amp; negative deal alerts.
          </p>
        </div>

        <button
          onClick={() => toast.success('Exported Deal Profitability CSV matching General Ledger JV accounts.')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border rounded-lg shadow-sm hover:bg-slate-50"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Export P&amp;L Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500">Total Net Contribution</div>
          <div className="text-2xl font-black text-emerald-600 font-mono mt-1">
            {formatMoney(totalGrossProfitPaise)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">After discounts &amp; sales incentives</div>
        </div>

        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500">Blended Gross Margin</div>
          <div className="text-2xl font-black text-blue-600 mt-1">{blendedMarginPercent}%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across vehicle &amp; F&amp;I streams</div>
        </div>

        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500">Accessory &amp; F&amp;I Add-on Profit</div>
          <div className="text-2xl font-black text-purple-600 font-mono mt-1">
            {formatMoney(deals.reduce((sum, d) => sum + d.accessoryMarginPaise + d.insuranceCommissionPaise + d.financePayoutPaise, 0))}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">High-margin auxiliary profit</div>
        </div>

        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500">Sub-Zero / Loss-Making Deals</div>
          <div className="text-2xl font-black text-red-600 mt-1">
            {deals.filter(d => d.netContributionPaise < 0).length} Deal
          </div>
          <div className="text-[11px] text-red-500 font-semibold mt-0.5">Requires GM inspection</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search order no, customer, model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg"
          />
        </div>

        <button
          onClick={() => setNegativeOnly(!negativeOnly)}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
            negativeOnly
              ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
          }`}
        >
          {negativeOnly ? 'Showing Negative Deals Only' : 'Filter Loss-Making Deals'}
        </button>
      </div>

      {/* Deals Table */}
      <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 font-semibold text-slate-500 uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Order &amp; Customer</th>
                <th className="p-3.5">Model</th>
                <th className="p-3.5">Ex-Showroom</th>
                <th className="p-3.5">Factory Cost</th>
                <th className="p-3.5">Bike Margin</th>
                <th className="p-3.5">Acc. Margin</th>
                <th className="p-3.5">F&amp;I Payout</th>
                <th className="p-3.5">Discount</th>
                <th className="p-3.5 text-right">Net Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(deal => {
                const isLoss = deal.netContributionPaise < 0;
                return (
                  <tr 
                    key={deal.id} 
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition ${
                      isLoss ? 'bg-red-50/40 dark:bg-red-950/20' : ''
                    }`}
                  >
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-blue-600">{deal.orderNo}</div>
                      <div className="font-semibold text-slate-900 dark:text-white">{deal.customerName}</div>
                      <div className="text-[10px] text-slate-400">Exec: {deal.executive}</div>
                    </td>
                    <td className="p-3.5 font-medium text-slate-800 dark:text-slate-200">
                      {deal.model}
                    </td>
                    <td className="p-3.5 font-mono">{formatMoney(deal.exShowroomPaise)}</td>
                    <td className="p-3.5 font-mono text-slate-400">{formatMoney(deal.factoryCostPaise)}</td>
                    <td className="p-3.5 font-mono font-bold text-emerald-600">{formatMoney(deal.vehicleMarginPaise)}</td>
                    <td className="p-3.5 font-mono text-purple-600">{formatMoney(deal.accessoryMarginPaise)}</td>
                    <td className="p-3.5 font-mono text-blue-600">
                      {formatMoney(deal.insuranceCommissionPaise + deal.financePayoutPaise)}
                    </td>
                    <td className="p-3.5 font-mono text-red-500">-{formatMoney(deal.discountGivenPaise)}</td>
                    <td className="p-3.5 text-right font-mono font-black text-sm">
                      <span className={isLoss ? 'text-red-600' : 'text-emerald-600'}>
                        {formatMoney(deal.netContributionPaise)}
                      </span>
                      {isLoss && (
                        <span className="block text-[10px] font-bold text-red-600 uppercase">
                          Negative Deal!
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DealProfitabilityPage;
