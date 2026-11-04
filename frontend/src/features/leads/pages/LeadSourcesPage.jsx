import React, { useState } from 'react';
import { 
  Target, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Shuffle, 
  Sliders, 
  CheckCircle2, 
  ArrowUpRight, 
  Settings, 
  Layers
} from 'lucide-react';
import { formatMoney } from '../../../lib/format';
import { toast } from 'sonner';

import { useCollection } from '../../../hooks/useCollection';
// SAMPLE_SOURCES: loaded from the database (collection "leads.leadSources.sources")

export function LeadSourcesPage() {
  const [sources, setSources] = useCollection('leads.leadSources.sources');
  const [routingRule, setRoutingRule] = useState('ROUND_ROBIN'); // 'ROUND_ROBIN', 'BRANCH', 'LANGUAGE'

  const handleSaveRouting = () => {
    toast.success(`Lead auto-assignment rule updated to ${routingRule}`);
  };

  const totalLeads = sources.reduce((sum, s) => sum + s.leadsCount, 0);
  const totalBookings = sources.reduce((sum, s) => sum + s.bookingsCount, 0);
  const overallConversion = ((totalBookings / totalLeads) * 100).toFixed(1);
  const totalAdSpendPaise = sources.reduce((sum, s) => sum + s.monthlySpendPaise, 0);
  const overallCplPaise = Math.round(totalAdSpendPaise / totalLeads);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main flex items-center gap-2">
            <Target className="w-5 h-5 text-primary shrink-0" />
            Lead Sources Hub &amp; Attribution Analytics
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Track multi-channel inquiry inflow, cost per lead (CPL), ROI conversion rates &amp; configure auto-assignment policies.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 bg-surface border border-border rounded-button text-xs flex items-center gap-2 whitespace-nowrap shrink-0 shadow-xs">
            <span className="text-text-muted">Active Rule:</span>
            <strong className="text-primary font-bold">{routingRule.replace('_', ' ')}</strong>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-4 rounded-card border border-border shadow-soft">
          <div className="text-xs text-text-muted">Monthly Inflow Volume</div>
          <div className="text-2xl font-bold text-text-main mt-1 tabular-nums">{totalLeads} Leads</div>
          <div className="text-[11px] text-text-muted mt-0.5">Across 7 marketing channels</div>
        </div>

        <div className="bg-surface p-4 rounded-card border border-border shadow-soft">
          <div className="text-xs text-text-muted">Converted Bookings</div>
          <div className="text-2xl font-bold text-status-green mt-1 tabular-nums">{totalBookings} Bookings</div>
          <div className="text-[11px] text-status-green font-semibold mt-0.5 tabular-nums">{overallConversion}% Overall Conversion</div>
        </div>

        <div className="bg-surface p-4 rounded-card border border-border shadow-soft">
          <div className="text-xs text-text-muted">Blended Cost Per Lead (CPL)</div>
          <div className="text-2xl font-bold text-primary tabular-nums mt-1">{formatMoney(overallCplPaise)}</div>
          <div className="text-[11px] text-text-muted mt-0.5">Includes paid ad spend</div>
        </div>

        <div className="bg-surface p-4 rounded-card border border-border shadow-soft">
          <div className="text-xs text-text-muted">Digital Ad Budget Spend</div>
          <div className="text-2xl font-bold text-indigo-600 tabular-nums mt-1">{formatMoney(totalAdSpendPaise)}</div>
          <div className="text-[11px] text-text-muted mt-0.5">Meta, Google &amp; Aggregators</div>
        </div>
      </div>

      {/* Auto-Assignment Policy Switcher */}
      <div className="bg-surface p-5 rounded-card border border-border shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-text-main flex items-center gap-2">
            <Shuffle className="w-4 h-4 text-primary shrink-0" />
            Automated Inbound Lead Dispatch Policy
          </h2>
          <button
            onClick={handleSaveRouting}
            className="px-3 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-button shadow-xs transition-colors shrink-0"
          >
            Apply Policy
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {[
            { id: 'ROUND_ROBIN', label: 'Fair Round-Robin', desc: 'Evenly cycles incoming leads sequentially to available sales executives' },
            { id: 'BRANCH', label: 'Pincode / Branch-Based', desc: 'Directs customer to closest showroom (Central, South, Whitefield)' },
            { id: 'LANGUAGE', label: 'Language & Skill Match', desc: 'Matches Kannada, Tamil, Hindi preference from IVR or WhatsApp intro' },
          ].map(opt => (
            <div
              key={opt.id}
              onClick={() => setRoutingRule(opt.id)}
              className={`p-3.5 rounded-card border cursor-pointer transition space-y-1 ${
                routingRule === opt.id
                  ? 'bg-primary-light border-primary text-text-main shadow-xs'
                  : 'bg-surface-subtle border-border hover:bg-surface-muted text-text-muted'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-main">{opt.label}</span>
                {routingRule === opt.id && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
              </div>
              <p className="text-[11px] text-text-muted">{opt.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sources Performance Breakdown Table */}
      <div className="bg-surface rounded-card border border-border shadow-soft overflow-hidden">
        <div className="p-4 bg-surface-subtle border-b border-border font-bold text-xs text-text-muted uppercase tracking-wider">
          Channel Volume &amp; Acquisition Efficiency
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-subtle border-b border-border font-semibold text-text-muted uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Source Channel</th>
                <th className="p-3.5">Leads Captured</th>
                <th className="p-3.5">Bookings Closed</th>
                <th className="p-3.5">Conversion %</th>
                <th className="p-3.5">Monthly Ad Spend</th>
                <th className="p-3.5">Cost Per Lead (CPL)</th>
                <th className="p-3.5 text-right">Lead Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sources.map(src => (
                <tr key={src.id} className="hover:bg-surface-subtle transition-colors">
                  <td className="p-3.5 font-bold text-text-main">
                    {src.name}
                  </td>
                  <td className="p-3.5 font-bold font-mono text-text-main">{src.leadsCount}</td>
                  <td className="p-3.5 font-bold font-mono text-status-green">{src.bookingsCount}</td>
                  <td className="p-3.5">
                    <span className="font-mono font-bold text-primary">{src.conversionRate}%</span>
                  </td>
                  <td className="p-3.5 font-mono text-text-main">{formatMoney(src.monthlySpendPaise)}</td>
                  <td className="p-3.5 font-mono font-bold text-text-main">
                    {src.cplPaise > 0 ? formatMoney(src.cplPaise) : 'Free / Organic'}
                  </td>
                  <td className="p-3.5 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      src.qualityRating === 'EXCELLENT' ? 'bg-status-green-bg text-status-green border border-status-green-border' :
                      src.qualityRating === 'GOOD' ? 'bg-status-blue-bg text-status-blue border border-status-blue-border' :
                      'bg-surface-subtle text-text-muted border border-border'
                    }`}>
                      {src.qualityRating}
                    </span>
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

export default LeadSourcesPage;
