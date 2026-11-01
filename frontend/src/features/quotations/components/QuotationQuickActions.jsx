import React from 'react';
import { FilePlus, ListFilter, FileSpreadsheet } from 'lucide-react';

export function QuotationQuickActions({ onCreateQuotation, onResetFilters, onOpenExportReport }) {
  const actions = [
    {
      id: 'create',
      title: 'Create Quotation',
      subtitle: 'New proposal builder',
      icon: FilePlus,
      iconBg: 'bg-blue-100 text-blue-700',
      borderHover: 'hover:border-blue-400',
      onClick: onCreateQuotation,
    },
    {
      id: 'view_all',
      title: 'View All Quotations',
      subtitle: 'Clear all active filters',
      icon: ListFilter,
      iconBg: 'bg-emerald-100 text-emerald-700',
      borderHover: 'hover:border-emerald-400',
      onClick: onResetFilters,
    },
    {
      id: 'export',
      title: 'Export Report',
      subtitle: 'PDF, Excel & CSV',
      icon: FileSpreadsheet,
      iconBg: 'bg-purple-100 text-purple-700',
      borderHover: 'hover:border-purple-400',
      onClick: onOpenExportReport,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 flex flex-col justify-between">
      <div>
        <div className="pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">Quick Actions</h2>
          <p className="text-[11px] text-slate-400">Common proposal workflows</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2.5 mt-3">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={act.onClick}
                className={`w-full p-3 rounded-lg border border-slate-200/70 bg-slate-50/50 hover:bg-white ${act.borderHover} transition-all duration-150 flex items-center gap-3 text-left group`}
              >
                <div className={`p-2.5 rounded-lg ${act.iconBg} shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{act.title}</p>
                  <p className="text-[11px] text-slate-400">{act.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 mt-3 text-[11px] text-slate-400 text-center">
        Akash Bajaj ERP & Service Hub
      </div>
    </div>
  );
}

