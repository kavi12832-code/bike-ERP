import React from 'react';
import { useAppStore } from '../../../store';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { formatDate } from '../../../lib/format';
import { Scale, AlertTriangle, ShieldCheck } from 'lucide-react';

export function TaxRulesPage() {
  const taxRules = useAppStore((state) => state.catalogs?.taxRules || []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main">Effective-Dated GST & Statutory Tax Rules</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Centralized tax engine rates by vehicle category, displacement CC, fuel type and labour SAC
          </p>
        </div>

        <div className="flex items-center gap-2 p-2 rounded bg-amber-50 border border-amber-200 text-status-amber text-xs font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Statutory Compliance Notice: Every rule marked "CONFIRM WITH CA"</span>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-subtle border-b border-border text-text-muted font-semibold uppercase text-[11px]">
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Fuel / Subtype</th>
                <th className="p-3.5">Displacement (CC)</th>
                <th className="p-3.5">HSN / SAC</th>
                <th className="p-3.5">Total GST %</th>
                <th className="p-3.5">Effective Date</th>
                <th className="p-3.5">CA Compliance Flag</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {taxRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-surface-subtle/70 transition-colors">
                  <td className="p-3.5 font-bold text-text-main">{rule.category}</td>
                  <td className="p-3.5 font-semibold text-primary">{rule.fuelType}</td>
                  <td className="p-3.5 tabular-nums text-text-main">
                    {rule.minCc != null && rule.maxCc != null
                      ? `${rule.minCc} - ${rule.maxCc === 9999 ? 'Above' : rule.maxCc} cc`
                      : 'N/A'}
                  </td>
                  <td className="p-3.5 font-mono font-semibold">{rule.hsn || rule.sac}</td>
                  <td className="p-3.5">
                    <span className="font-bold text-sm text-text-main tabular-nums">
                      {rule.gstRatePercent}%
                    </span>
                  </td>
                  <td className="p-3.5 text-text-muted">{formatDate(rule.effectiveFrom)}</td>
                  <td className="p-3.5">
                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                      {rule.complianceNote}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <StatusBadge status={rule.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
