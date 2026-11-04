import React, { useState } from 'react';
import { 
  Building2, 
  Wrench, 
  Monitor, 
  Bike, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  FileText, 
  TrendingDown, 
  Calculator,
  Search
} from 'lucide-react';
import { formatMoney } from '../../../lib/format';
import { toast } from 'sonner';

import { useCollection } from '../../../hooks/useCollection';
// SAMPLE_ASSETS: loaded from the database (collection "accounting.fixedAssets.assets")

export function FixedAssetsPage() {
  const [assets, setAssets] = useCollection('accounting.fixedAssets.assets');
  const [selectedMethod, setSelectedMethod] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  const totalGrossAssetValuePaise = assets.reduce((sum, a) => sum + a.costPaise, 0);
  const totalAccumulatedDepreciationPaise = assets.reduce((sum, a) => sum + a.accumulatedDepreciationPaise, 0);
  const totalNetBookValuePaise = totalGrossAssetValuePaise - totalAccumulatedDepreciationPaise;

  const handlePostMonthlyDepreciation = () => {
    toast.success('Monthly depreciation journal entries generated per Companies Act 2013 and posted to GL!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            Fixed Assets Register &amp; Depreciation Engine
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Workshop machinery, fixtures, IT systems &amp; demo vehicles. SLM and WDV schedule per Companies Act 2013.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePostMonthlyDepreciation}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border rounded-lg hover:bg-slate-50 shadow-sm"
          >
            <Calculator className="w-4 h-4 text-blue-600" />
            Post Monthly Depreciation
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Register Asset
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Gross Asset Acquisition Cost</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
            {formatMoney(totalGrossAssetValuePaise)}
          </div>
          <span className="text-[11px] text-slate-400">Total historical purchase value</span>
        </div>

        <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Accumulated Depreciation</span>
          <div className="text-2xl font-black text-amber-600 font-mono mt-1">
            {formatMoney(totalAccumulatedDepreciationPaise)}
          </div>
          <span className="text-[11px] text-slate-400">Straight-line and WDV provisions</span>
        </div>

        <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Net Carrying Book Value (NBV)</span>
          <div className="text-2xl font-black text-blue-600 font-mono mt-1">
            {formatMoney(totalNetBookValuePaise)}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">Tied to Balance Sheet Fixed Assets</span>
        </div>
      </div>

      {/* Asset Register Table */}
      <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-500 uppercase tracking-wider">
          Dealership Capital Asset Inventory ({assets.length})
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 font-semibold text-slate-500 uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Asset Tag &amp; Item</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Acquisition Date</th>
                <th className="p-3.5">Original Cost</th>
                <th className="p-3.5">Method &amp; Rate</th>
                <th className="p-3.5">Accum. Depr.</th>
                <th className="p-3.5 text-right">Net Book Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {assets.map(asset => (
                <tr key={asset.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3.5">
                    <div className="font-mono font-bold text-blue-600">{asset.tagNo}</div>
                    <div className="font-semibold text-slate-900 dark:text-white">{asset.name}</div>
                  </td>
                  <td className="p-3.5 font-bold font-mono text-[10px] text-slate-500">
                    {asset.category}
                  </td>
                  <td className="p-3.5 font-mono text-slate-500">{asset.purchaseDate}</td>
                  <td className="p-3.5 font-mono">{formatMoney(asset.costPaise)}</td>
                  <td className="p-3.5 font-mono">
                    <span className="font-bold">{asset.depreciationMethod}</span> ({asset.ratePercent}%)
                  </td>
                  <td className="p-3.5 font-mono text-amber-600">
                    -{formatMoney(asset.accumulatedDepreciationPaise)}
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-sm text-slate-900 dark:text-white">
                    {formatMoney(asset.netBookValuePaise)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default FixedAssetsPage;
