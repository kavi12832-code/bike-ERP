import React, { useState } from 'react';
import { 
  CheckSquare, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Camera, 
  Share2, 
  Smartphone, 
  Send, 
  Eye, 
  Plus, 
  Trash2,
  DollarSign,
  Maximize2,
  ZoomIn,
  X
} from 'lucide-react';
import { useAppStore } from '../../../store';
import { formatMoney } from '../../../lib/format';
import { toast } from 'sonner';

import { useCollection } from '../../../hooks/useCollection';
import { PageHeader } from '../../../components/ui/PageHeader';
import { KpiCard } from '../../../components/ui/KpiCard';
const DENT_MAP_PINS = [
  { pin: 1, label: 'Headlight – Scratch', color: 'bg-red-500', view: 'Front View' },
  { pin: 2, label: 'Fairing – Dent', color: 'bg-blue-500', view: 'Front / Side' },
  { pin: 4, label: 'Fender – Dent', color: 'bg-amber-500', view: 'Front View' },
  { pin: 6, label: 'Seat – Tear', color: 'bg-orange-500', view: 'Left Side' },
  { pin: 10, label: 'Tail Light – Scratch', color: 'bg-blue-600', view: 'Rear View' },
  { pin: 12, label: 'Indicator – Scratch', color: 'bg-emerald-600', view: 'Rear View' },
  { pin: 15, label: 'Fuel Tank – Dent', color: 'bg-amber-600', view: 'Right Side' },
  { pin: 18, label: 'Exhaust Cover – Scratch', color: 'bg-emerald-500', view: 'Right Side' },
  { pin: 20, label: 'Seat – Tear', color: 'bg-purple-600', view: 'Top View' },
  { pin: 21, label: 'Grab Rail – Dent', color: 'bg-cyan-600', view: 'Top View' },
];

// SAMPLE_INSPECTION_ITEMS: loaded from the database (collection "service.dvi.inspectionItems")

export function DviPage() {
  const jobCards = useAppStore((state) => state.jobCards || []);
  const [selectedJcId, setSelectedJcId] = useState(jobCards[0]?.id || 'jc-2627-001');
  const [items, setItems] = useCollection('service.dvi.inspectionItems');
  const [selectedPin, setSelectedPin] = useState(null);
  const [showFullMapModal, setShowFullMapModal] = useState(false);

  const selectedJobCard = jobCards.find(jc => jc.id === selectedJcId) || jobCards[0];
  const totalAdditionalCostPaise = items.filter(i => i.status !== 'GREEN').reduce((sum, i) => sum + (i.costPaise || 0), 0);

  const updateItemStatus = (id, newStatus) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      return { ...item, status: newStatus };
    }));
  };

  const handleSendApprovalLink = () => {
    const token = 'dvi-token-94821';
    const link = `${window.location.origin}/dvi/${token}`;
    navigator.clipboard?.writeText(link);
    toast.success(`Public DVI link generated and copied! WhatsApp notification triggered to ${selectedJobCard?.customerPhone || 'Customer'}.`);
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Workshop & Service', path: '/service/bays' },
          { label: 'Digital Inspection (DVI)', path: '/service/dvi' },
        ]}
        title="Digital Vehicle Inspection (DVI)"
        subtitle="Multimedia technician inspection with Green/Amber/Red indicators, damage markings and instant WhatsApp customer sign-off."
        actions={
          <button
            onClick={handleSendApprovalLink}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
          >
            <Send className="w-4 h-4" />
            Send Customer WhatsApp Approval
          </button>
        }
      />

      {/* 2. Plain KPI Cards per Section 0.5 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          label="Critical Failures (Red)"
          value={`${items.filter((i) => i.status === 'RED').length} Critical`}
          helperText="Immediate safety hazard"
          icon={<XCircle className="w-5 h-5 text-rose-500" />}
        />
        <KpiCard
          label="Advisory Items (Amber)"
          value={`${items.filter((i) => i.status === 'AMBER').length} Advisory`}
          helperText="Recommended maintenance"
          icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
        />
        <KpiCard
          label="Passed Checks (Green)"
          value={`${items.filter((i) => i.status === 'GREEN').length} Passed`}
          helperText="Components within tolerance"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
        />
        <KpiCard
          label="Additional Repair Est."
          value={formatMoney(totalAdditionalCostPaise)}
          helperText="Awaiting customer approval"
          icon={<DollarSign className="w-5 h-5 text-primary" />}
        />
      </div>

      {/* Vehicle Context Bar */}
      <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
            JC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white">
                {selectedJobCard?.registrationNumber || 'KA-01-MJ-4050'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">
                {selectedJobCard?.modelName || 'Royal Enfield Classic 350'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Customer: {selectedJobCard?.customerName || 'Rahul Dravid'} • Odometer: 14,820 km
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Inspection Status:</span>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            Awaiting Customer Sign-off
          </span>
        </div>
      </div>

      {/* Main Grid: Damage Marking Silhouette & Inspection Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Bike Silhouette & Exterior Damage Map */}
        <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-600" />
              Exterior Body &amp; Dent Pin-Map
            </h2>
            <button
              onClick={() => setShowFullMapModal(true)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
              title="Expand full-size 360 inspection image"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full View</span>
            </button>
          </div>

          <p className="text-xs text-slate-500">
            360° photographic walkaround schematic with pre-existing scratches, dents &amp; defects tagged across all 5 vehicle angles.
          </p>

          {/* 360 Photo Damage Pin-Map with Click-to-Zoom */}
          <div
            onClick={() => setShowFullMapModal(true)}
            className="group relative border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 cursor-pointer shadow-inner"
          >
            <img
              src="/bike-dent-map.png"
              alt="Exterior Body & Dent Pin-Map 360 Walkaround"
              className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-medium text-xs backdrop-blur-[2px]">
              <ZoomIn className="w-4 h-4" />
              <span>Click to Enlarge 360° Damage Map</span>
            </div>
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono">
              5 Angles • 10 Points Logged
            </div>
          </div>

          {/* Logged Defect Points List */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-1">
              <span>Tagged Exterior Flaws</span>
              <span className="text-[10px] text-slate-400">10 Points Documented</span>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1 text-xs">
              {DENT_MAP_PINS.map((item) => (
                <div
                  key={item.pin}
                  onClick={() => {
                    setSelectedPin(item.label);
                    setShowFullMapModal(true);
                  }}
                  className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded-full ${item.color} text-white text-[10px] font-bold flex items-center justify-center shrink-0`}>
                      {item.pin}
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{item.label}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{item.view}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Inspection Points Table & Estimates */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Technical Inspection Items ({items.length})
                </h3>
                <p className="text-xs text-slate-500">Green = OK, Amber = Monitor next service, Red = Urgent replacement</p>
              </div>

              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Supplementary Estimate: <span className="text-blue-600 font-bold">{formatMoney(items.filter(i => i.status !== 'GREEN').reduce((sum, i) => sum + i.costPaise, 0))}</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item) => (
                <div key={item.id} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {item.label}
                        </span>
                        <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {item.value}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">{item.category}</span>
                    </div>

                    {/* Status Pill Selector */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => updateItemStatus(item.id, 'GREEN')}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                          item.status === 'GREEN'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        Green (OK)
                      </button>
                      <button
                        onClick={() => updateItemStatus(item.id, 'AMBER')}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                          item.status === 'AMBER'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        Amber (Monitor)
                      </button>
                      <button
                        onClick={() => updateItemStatus(item.id, 'RED')}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                          item.status === 'RED'
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        Red (Urgent)
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {item.notes}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center gap-3 text-slate-500">
                      {item.photo && (
                        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold cursor-pointer hover:underline">
                          <Eye className="w-3.5 h-3.5" /> 1 Photo Attached
                        </span>
                      )}
                    </div>

                    {item.costPaise > 0 && (
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Est: <span className="font-mono">{formatMoney(item.costPaise)}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen 360 Damage Pin-Map Modal */}
      {showFullMapModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-600" />
                  360° Exterior Body &amp; Dent Pin-Map (High Resolution)
                </h3>
                <p className="text-xs text-slate-500">
                  Pre-service physical walkaround audit for {selectedJobCard?.modelName || 'Motorcycle'} • Job Card #{selectedJobCard?.jobNumber || 'JC-2627-001'}
                </p>
              </div>
              <button
                onClick={() => setShowFullMapModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-950/20">
              <img
                src="/bike-dent-map.png"
                alt="360 Exterior Inspection Schematic"
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-lg border border-slate-200 dark:border-slate-800"
              />
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Front, Rear, Left/Right Sides &amp; Top Angles verified by technician with close-up defect captures.</span>
              </div>
              <button
                onClick={() => setShowFullMapModal(false)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition"
              >
                Done Inspecting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DviPage;
