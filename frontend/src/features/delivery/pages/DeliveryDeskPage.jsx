import React, { useState, useRef, useMemo } from 'react';
import { 
  Truck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  FileCheck, 
  Camera, 
  PenTool, 
  Printer, 
  QrCode, 
  Search, 
  ChevronRight,
  ShieldCheck,
  User,
  Key,
  FileText,
  X
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAppStore } from '../../../store';
import { formatDate } from '../../../lib/format';
import { toast } from 'sonner';

const STAGES = [
  { id: 'PDI_PENDING', label: 'PDI Pending', color: 'border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950/40' },
  { id: 'PDI_IN_PROGRESS', label: 'PDI In Progress', color: 'border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-950/40' },
  { id: 'PDI_PASSED', label: 'PDI Passed', color: 'border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40' },
  { id: 'READY_HANDOVER', label: 'Ready for Handover', color: 'border-purple-500 text-purple-700 bg-purple-50 dark:bg-purple-950/40' },
  { id: 'DELIVERED', label: 'Delivered', color: 'border-slate-500 text-slate-700 bg-slate-50 dark:bg-slate-800' },
];

const PDI_CHECKLIST_CATEGORIES = [
  {
    category: 'Engine & Powertrain',
    items: [
      'Engine oil level and grade verification',
      'Coolant level & radiator inspection (if liquid cooled)',
      'Fuel line routing & zero leakage check',
      'Exhaust note & emission check',
      'Clutch lever free play (10-15mm)'
    ]
  },
  {
    category: 'Electricals & Instrumentation',
    items: [
      'Battery terminal tightness & open circuit voltage (>=12.8V)',
      'Headlight high/low beam & daytime running lights (DRL)',
      'Front and rear turn indicators & hazard flasher',
      'Brake light actuation from both levers',
      'Digital instrument cluster self-test & tell-tale LEDs'
    ]
  },
  {
    category: 'Brakes & Suspension',
    items: [
      'Front & rear disc brake fluid reservoir levels (DOT 4)',
      'Brake pad wear & disc rotor true run-out',
      'ABS warning lamp self-check sequence',
      'Front telescopic fork dust seals & oil leakage check',
      'Rear monoshock preload adjustment & bounce damping'
    ]
  },
  {
    category: 'Body, Wheels & Chassis',
    items: [
      'Front tyre cold pressure (28-32 PSI) & bead seating',
      'Rear tyre cold pressure (32-36 PSI) & rotation direction',
      'Wheel spoke tension / alloy rim surface condition',
      'Paint finish, tank decals & clear coat inspection',
      'Side stand sensor & engine cut-off functionality'
    ]
  },
  {
    category: 'Controls & Accessories',
    items: [
      'Steering head bearing play & lock-to-lock smoothness',
      'Drive chain slackness (20-25mm) & lubrication',
      'Rearview mirrors adjustment & vibration check',
      'Horn sound level & tone clarity',
      'Tool kit, first aid kit & spare fuse placement'
    ]
  }
];

const MANDATORY_DOCS = [
  { id: 'FORM_20', label: 'Form 20 (RTO Application for Registration)' },
  { id: 'FORM_21', label: 'Form 21 (Statutory Sale Certificate)' },
  { id: 'TAX_INVOICE', label: 'Original Vehicle GST Tax Invoice' },
  { id: 'INSURANCE_POLICY', label: '5-Year Comprehensive Insurance Policy' },
  { id: 'RC_DOC', label: 'Temporary / Permanent Registration Certificate' },
  { id: 'ROAD_TAX', label: 'Karnataka Road Tax (KMVT) Official Receipt' },
  { id: 'OWNER_MANUAL', label: 'Vehicle Owner’s Service & Warranty Manual' },
  { id: 'TOOL_KIT', label: 'OEM Emergency Tool Kit & First Aid Pouch' },
  { id: 'KEYS', label: '2 Sets of Original Factory Encrypted Keys' },
  { id: 'HELMET', label: 'ISI / BIS Certified Showroom Delivery Helmet' },
];

export function DeliveryDeskPage() {
  const salesOrders = useAppStore((state) => state.salesOrders || []);
  const [selectedOrder, setSelectedOrder] = useState(salesOrders[0] || null);
  const [activeTab, setActiveTab] = useState('board'); // 'board' or 'details'
  const [checklistAnswers, setChecklistAnswers] = useState({});
  const [verifiedDocs, setVerifiedDocs] = useState({});
  const [customerSigned, setCustomerSigned] = useState(false);
  const [deliveryPhotoUploaded, setDeliveryPhotoUploaded] = useState(false);
  const [showGatePass, setShowGatePass] = useState(false);

  // Plain KPI calculations per Section 0.5
  const kpis = useMemo(() => {
    const total = salesOrders.length;
    const pdiPending = salesOrders.filter((_, idx) => idx === 0 || idx === 1).length;
    const readyHandover = salesOrders.filter((_, idx) => idx === 2 || idx === 3).length;
    const delivered = salesOrders.filter((_, idx) => idx >= 4).length;
    return { total, pdiPending, readyHandover, delivered };
  }, [salesOrders]);

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize PDI checklist answers
  const getPdiStatus = (item) => checklistAnswers[item] || 'PASS';

  const setPdiStatus = (item, status) => {
    setChecklistAnswers((prev) => ({ ...prev, [item]: status }));
  };

  const hasUnresolvedFails = () => {
    return Object.values(checklistAnswers).some((status) => status === 'FAIL');
  };

  // Canvas drawing for customer signoff
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0F172A';
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setCustomerSigned(true);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCustomerSigned(false);
  };

  const toggleDoc = (docId) => {
    setVerifiedDocs((prev) => ({ ...prev, [docId]: !prev[docId] }));
  };

  const handleCompleteHandover = () => {
    if (hasUnresolvedFails()) {
      toast.error('Cannot complete delivery: PDI has unresolved FAIL items! Every issue must be PASS or RECTIFIED.');
      return;
    }

    const missingDocs = MANDATORY_DOCS.filter(d => !verifiedDocs[d.id]);
    if (missingDocs.length > 0) {
      toast.error(`Missing mandatory handover items: ${missingDocs.map(d => d.label).join(', ')}`);
      return;
    }

    if (!customerSigned) {
      toast.error('Customer digital signature is required before vehicle dispatch.');
      return;
    }

    setShowGatePass(true);
    toast.success('PDI & Handover signed off successfully! Gate pass generated.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-5 rounded-card border border-border shadow-soft">
        <div>
          <h1 className="text-xl font-bold text-text-main flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            <span>Delivery &amp; PDI Operations Desk</span>
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            25-point pre-delivery inspection, statutory document checklist, digital handover signature &amp; gate pass generation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('board')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-button border transition ${
              activeTab === 'board'
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-surface text-text-main border-border hover:bg-surface-subtle'
            }`}
          >
            Delivery Queue Board
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-button border transition ${
              activeTab === 'details'
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-surface text-text-main border-border hover:bg-surface-subtle'
            }`}
          >
            PDI &amp; Handover Desk
          </button>
        </div>
      </div>

      {activeTab === 'board' ? (
        /* Queue Board Across 5 Stages */
        <div className="flex gap-4 overflow-x-auto pb-4 min-w-full">
          {STAGES.map((stage) => {
            const ordersInStage = salesOrders.filter((_, idx) => {
              if (stage.id === 'PDI_PENDING') return idx === 0;
              if (stage.id === 'PDI_IN_PROGRESS') return idx === 1;
              if (stage.id === 'PDI_PASSED') return idx === 2;
              if (stage.id === 'READY_HANDOVER') return idx === 3;
              return idx >= 4;
            });

            return (
              <div 
                key={stage.id} 
                className="w-72 shrink-0 bg-surface rounded-card border border-border shadow-soft flex flex-col min-h-[520px]"
              >
                <div className={`p-3.5 border-b font-bold text-xs flex items-center justify-between rounded-t-card ${stage.color}`}>
                  <span className="truncate pr-2">{stage.label}</span>
                  <span className="px-2 py-0.5 rounded-full bg-surface text-text-main text-[11px] font-mono shrink-0 shadow-xs border border-border/50">
                    {ordersInStage.length}
                  </span>
                </div>

                <div className="p-3 overflow-y-auto space-y-3 flex-1 bg-surface-subtle/40">
                  {ordersInStage.length === 0 ? (
                    <div className="py-14 flex flex-col items-center justify-center text-center text-xs text-text-muted">
                      <Truck className="w-8 h-8 text-text-muted/40 mb-1.5" />
                      <span>No units in queue</span>
                    </div>
                  ) : (
                    ordersInStage.map((order) => (
                      <div
                        key={order.id}
                        onClick={() => {
                          setSelectedOrder(order);
                          setActiveTab('details');
                        }}
                        className="p-3 bg-surface rounded-card border border-border hover:border-primary/50 hover:shadow-md transition cursor-pointer space-y-2 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-text-main">
                            {order.customerName}
                          </span>
                          <span className="text-[10px] font-mono font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                            {order.orderNumber}
                          </span>
                        </div>

                        <div className="text-xs text-text-muted font-medium truncate">
                          {order.modelName}{order.color ? ` • ${order.color}` : ''}
                        </div>

                        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-text-muted">
                          <span className="font-mono text-[10px] bg-surface-subtle px-1.5 py-0.5 rounded border border-border/60">
                            {order.chassisNumber || 'CH-2627-RE450'}
                          </span>
                          <span>Today</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed PDI and Handover Workflow */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left 2 Cols: PDI Checklist + Document Verification */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selected Vehicle Dossier */}
            <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Active Handover Dossier</span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedOrder?.customerName || 'Arjun Das'} — {selectedOrder?.modelName || 'Royal Enfield Hunter 350'}
                </h2>
                <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                  <span>Order: <strong>{selectedOrder?.orderNumber || 'SO-2627-001'}</strong></span>
                  <span>Chassis: <strong className="font-mono">{selectedOrder?.chassisNumber || 'ME3J350C7P1049281'}</strong></span>
                  <span>Engine: <strong className="font-mono">J350E1049281</strong></span>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  Ready for Inspection
                </span>
              </div>
            </div>

            {/* 25-Point PDI Checklist */}
            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    25-Point Technical PDI Checklist
                  </h3>
                  <p className="text-xs text-slate-500">Every safety point must be validated by workshop supervisor</p>
                </div>

                {hasUnresolvedFails() && (
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Unresolved Failures Present
                  </span>
                )}
              </div>

              <div className="p-4 space-y-6">
                {PDI_CHECKLIST_CATEGORIES.map((cat) => (
                  <div key={cat.category} className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{cat.category}</h4>
                    <div className="space-y-2">
                      {cat.items.map((item) => {
                        const status = getPdiStatus(item);
                        return (
                          <div
                            key={item}
                            className="p-3 bg-slate-50/70 dark:bg-slate-800/40 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {item}
                            </span>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => setPdiStatus(item, 'PASS')}
                                className={`px-2.5 py-1 rounded font-bold transition flex items-center gap-1 ${
                                  status === 'PASS'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
                                }`}
                              >
                                <CheckCircle2 className="w-3 h-3" /> Pass
                              </button>
                              <button
                                type="button"
                                onClick={() => setPdiStatus(item, 'RECTIFIED')}
                                className={`px-2.5 py-1 rounded font-bold transition flex items-center gap-1 ${
                                  status === 'RECTIFIED'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
                                }`}
                              >
                                Rectified
                              </button>
                              <button
                                type="button"
                                onClick={() => setPdiStatus(item, 'FAIL')}
                                className={`px-2.5 py-1 rounded font-bold transition flex items-center gap-1 ${
                                  status === 'FAIL'
                                    ? 'bg-red-600 text-white shadow-sm'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
                                }`}
                              >
                                <XCircle className="w-3 h-3" /> Fail
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Statutory Document Handover Checklist */}
            <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-purple-600" />
                Statutory Document &amp; Item Verification
              </h3>
              <p className="text-xs text-slate-500">
                Confirm all mandatory RTO registration certificates, insurance, keys, and accessories are physically verified.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {MANDATORY_DOCS.map((doc) => {
                  const isChecked = !!verifiedDocs[doc.id];
                  return (
                    <div
                      key={doc.id}
                      onClick={() => toggleDoc(doc.id)}
                      className={`p-3 rounded-lg border text-xs font-semibold flex items-center justify-between cursor-pointer transition ${
                        isChecked
                          ? 'bg-purple-50 text-purple-900 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800'
                          : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                      }`}
                    >
                      <span>{doc.label}</span>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                        isChecked ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-400'
                      }`}>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Col: Customer Signature, Photo & Gate Pass Trigger */}
          <div className="space-y-6">
            {/* Customer Digital Signature Pad */}
            <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-blue-600" />
                  Customer Acceptance Signature
                </h3>
                {customerSigned && (
                  <button
                    onClick={clearSignature}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Customer signs acknowledging receipt in pristine defect-free condition.
              </p>

              <div className="border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900">
                <canvas
                  ref={canvasRef}
                  width={340}
                  height={140}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="w-full h-36 cursor-crosshair touch-none"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Sign within the boundary above</span>
                {customerSigned ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Captured
                  </span>
                ) : (
                  <span className="text-amber-600 font-semibold">Signature Required</span>
                )}
              </div>
            </div>

            {/* Delivery Ceremony Photo Upload */}
            <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-600" />
                Delivery Ceremony Photo
              </h3>
              <p className="text-xs text-slate-500">
                Capture the handover moment with key presentation for warranty records.
              </p>

              <div className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-center bg-slate-50 dark:bg-slate-900">
                {deliveryPhotoUploaded ? (
                  <div className="space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-emerald-600 block">Ceremony Photo Verified</span>
                    <button
                      onClick={() => setDeliveryPhotoUploaded(false)}
                      className="text-[11px] text-slate-500 hover:underline"
                    >
                      Re-take Photo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Camera className="w-8 h-8 mx-auto text-slate-400" />
                    <button
                      type="button"
                      onClick={() => setDeliveryPhotoUploaded(true)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-50"
                    >
                      Capture Photo from Camera / File
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Complete Handover Button */}
            <button
              onClick={handleCompleteHandover}
              className="w-full py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Sign Off &amp; Print Gate Pass
            </button>
          </div>
        </div>
      )}

      {/* Printable A5 Gate Pass Modal */}
      {showGatePass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600" />
                Official Vehicle Delivery Gate Pass
              </h3>
              <button
                onClick={() => setShowGatePass(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Area */}
            <div className="p-6 border-2 border-slate-900 dark:border-slate-200 rounded-lg space-y-4 bg-white text-slate-900">
              <div className="text-center pb-3 border-b-2 border-slate-900">
                <h2 className="text-lg font-black tracking-wider uppercase">AKASH Bajaj</h2>
                <p className="text-xs font-semibold">Bangalore Central Flagship • GSTIN: 29AABCB1829M1ZK</p>
                <div className="inline-block mt-2 px-3 py-1 bg-slate-900 text-white text-xs font-black tracking-widest uppercase">
                  SECURITY GATE PASS (FORM GP-1)
                </div>
              </div>

              <div className="flex justify-between items-start text-xs pt-1">
                <div>
                  <p><strong>Gate Pass No:</strong> GP/2627/00481</p>
                  <p><strong>Issue Date &amp; Time:</strong> {formatDate(new Date(), 'dd/MM/yyyy HH:mm')} IST</p>
                  <p><strong>Customer:</strong> {selectedOrder?.customerName || 'Arjun Das'}</p>
                  <p><strong>Tax Invoice Ref:</strong> VI/2627/00001</p>
                </div>
                <div className="p-1 bg-white border border-slate-300 rounded">
                  <QRCodeSVG 
                    value={`GATEPASS|GP/2627/00481|CHASSIS:${selectedOrder?.chassisNumber || 'ME3J350C7P1049281'}|VERIFIED`}
                    size={80}
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-100 rounded text-xs space-y-1">
                <p><strong>Vehicle Model:</strong> {selectedOrder?.modelName || 'Royal Enfield Hunter 350'} ({selectedOrder?.color || 'Dapper White'})</p>
                <p><strong>Chassis / VIN:</strong> <span className="font-mono font-bold">{selectedOrder?.chassisNumber || 'ME3J350C7P1049281'}</span></p>
                <p><strong>Engine Number:</strong> <span className="font-mono font-bold">J350E1049281</span></p>
                <p><strong>Odometer Reading:</strong> 4.2 km (Pre-delivery test completed)</p>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-6 text-center text-xs">
                <div className="border-t border-slate-900 pt-1">
                  <p className="font-bold">Customer Signature</p>
                  <p className="text-[10px] text-slate-600">Vehicle Received with 2 Keys &amp; Documents</p>
                </div>
                <div className="border-t border-slate-900 pt-1">
                  <p className="font-bold">Security Officer Stamp &amp; Sign</p>
                  <p className="text-[10px] text-slate-600">Verified Chassis &amp; Physical Exit</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowGatePass(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                  toast.success('Printing Gate Pass...');
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
              >
                Print Gate Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeliveryDeskPage;
