import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Warehouse, CheckCircle2, Clock, Key, ArrowRight, ShieldCheck } from 'lucide-react';
import { getStockAvailability } from '../../../bookings/selectors/stockSelectors';

export function CheckAvailabilityDialog({
  isOpen,
  onClose,
  vehicleStock = [],
  models = [],
  branches = [],
  onSelectVinForBooking,
}) {
  const [selectedModel, setSelectedModel] = useState('ALL');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [searchVin, setSearchVin] = useState('');

  if (!isOpen) return null;

  const stockSummary = getStockAvailability(vehicleStock, {
    modelName: selectedModel,
    branchName: selectedBranch,
  });

  const matchingUnits = (vehicleStock || []).filter((u) => {
    if (selectedModel !== 'ALL' && u.modelName !== selectedModel) return false;
    if (selectedBranch !== 'ALL' && u.branchName !== selectedBranch) return false;
    if (searchVin && !u.vin?.toLowerCase().includes(searchVin.toLowerCase())) return false;
    return true;
  });

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] relative z-10">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <Warehouse className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Chassis Stock & Real-Time Availability
              </h2>
              <p className="text-xs text-slate-500">
                Single-unit allocation gate: Live inventory inspection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls & Metrics */}
        <div className="p-5 border-b border-slate-200 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Filter Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="ALL">All Models</option>
                {models.map((m) => (
                  <option key={m.id || m.name || m} value={m.name || m}>
                    {m.name || m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Filter Branch
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="ALL">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id || b.name} value={b.name || b}>
                    {b.name || b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Search VIN
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter last 6 or full VIN..."
                  value={searchVin}
                  onChange={(e) => setSearchVin(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="bg-blue-50/70 p-2.5 rounded-xl border border-blue-200">
              <span className="text-[10px] font-semibold uppercase text-blue-700 block">
                Total Stock
              </span>
              <span className="text-xl font-bold text-blue-900">{stockSummary.totalUnits}</span>
            </div>

            <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
              <span className="text-[10px] font-semibold uppercase text-emerald-700 block">
                Available to Allocate
              </span>
              <span className="text-xl font-bold text-emerald-900">
                {stockSummary.availableUnits}
              </span>
            </div>

            <div className="bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-200">
              <span className="text-[10px] font-semibold uppercase text-indigo-700 block">
                Allocated (Locked)
              </span>
              <span className="text-xl font-bold text-indigo-900">
                {stockSummary.allocatedUnits}
              </span>
            </div>

            <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200">
              <span className="text-[10px] font-semibold uppercase text-amber-700 block">
                48h Temporary Holds
              </span>
              <span className="text-xl font-bold text-amber-900">{stockSummary.heldUnits}</span>
            </div>
          </div>
        </div>

        {/* Chassis Units Table */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase">
                  <th className="py-2.5 px-3">Chassis # (17-Char VIN)</th>
                  <th className="py-2.5 px-3">Model & Colour</th>
                  <th className="py-2.5 px-3">Branch Location</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {matchingUnits.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No chassis units found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  matchingUnits.map((u) => {
                    const isAvailable = u.status === 'IN_STOCK' && !u.allocatedBookingId;
                    return (
                      <tr key={u.id || u.vin} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-medium text-slate-900">
                          {u.vin}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-slate-900">{u.modelName}</span>
                          <span className="text-slate-500 ml-1.5">· {u.colour}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{u.branchName}</td>
                        <td className="py-2.5 px-3 text-center">
                          {isAvailable ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                              Available
                            </span>
                          ) : u.status === 'HELD' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                              48h Hold
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-800">
                              Allocated
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {isAvailable ? (
                            <button
                              type="button"
                              onClick={() => {
                                onSelectVinForBooking(u);
                                onClose();
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                            >
                              <span>Reserve Unit</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Locked</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Strict 17-character ISO VIN standard enforced</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

