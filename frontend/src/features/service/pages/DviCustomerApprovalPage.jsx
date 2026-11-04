import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Bike, 
  PenTool, 
  Send, 
  Check, 
  Sparkles,
  PhoneCall,
  Camera
} from 'lucide-react';
import { formatMoney } from '../../../lib/format';
import { toast } from 'sonner';

import { useCollection } from '../../../hooks/useCollection';
// SAMPLE_CUSTOMER_ITEMS: loaded from the database (collection "service.dviCustomerApproval.customerItems")

export function DviCustomerApprovalPage() {
  const { token } = useParams();
  const [items, setItems] = useCollection('service.dviCustomerApproval.customerItems');
  const [decisions, setDecisions] = useState({
    'dvi-tyre-rear': true,
    'dvi-brake-front': true,
    'dvi-battery': false,
  });
  const [signed, setSigned] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const toggleDecision = (id) => {
    setDecisions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const approvedTotalPaise = items
    .filter(i => decisions[i.id])
    .reduce((sum, i) => sum + i.costPaise, 0);

  // Drawing
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
      setSigned(true);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSigned(false);
  };

  const handleSubmitApproval = (e) => {
    e.preventDefault();
    if (!signed) {
      toast.error('Please sign on the signature box to authorize selected repairs.');
      return;
    }

    setSubmitted(true);
    toast.success('Your supplementary repair authorization has been received! Job card updated.');
  };

  if (submitted) {
    return (
      <div className="h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Thank You, Rahul Dravid!
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            We have recorded your authorization for supplementary service items worth{' '}
            <strong className="text-blue-600">{formatMoney(approvedTotalPaise)}</strong>.
          </p>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-left space-y-1.5 text-slate-600 dark:text-slate-300">
            <p><strong>Vehicle:</strong> Royal Enfield Classic 350 (KA-01-MJ-4050)</p>
            <p><strong>Service Advisor:</strong> Ananya Sharma (+91 98450 12345)</p>
            <p><strong>Promised Ready Time:</strong> Today at 05:30 PM IST</p>
          </div>
          <div className="pt-2">
            <a 
              href="tel:08041234567"
              className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:underline"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Call Workshop Service Desk
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Dealership Branding Banner */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
            <ShieldCheck className="w-3.5 h-3.5" /> Official DVI Inspection
          </div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white">
            AKASH Bajaj &amp; Service Workshop
          </h1>
          <p className="text-xs text-slate-500">
            Live Digital Inspection Findings for <strong>KA-01-MJ-4050</strong>
          </p>
        </div>

        {/* Technician Findings Summary */}
        <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs text-slate-400 block">Customer</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">Rahul Dravid</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Inspection Date</span>
              <span className="text-sm font-mono font-semibold text-slate-700 dark:text-slate-300">Today</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            During our 25-point safety check, our technician Manoj Kumar noticed the following critical wear items. Please review the photos and authorize replacements below:
          </p>

          {/* Items with checkboxes */}
          <div className="space-y-4 pt-1">
            {items.map((item) => {
              const isApproved = !!decisions[item.id];
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition space-y-3 ${
                    isApproved
                      ? 'bg-blue-50/40 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900'
                      : 'bg-slate-50/50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {item.priority === 'RED' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">
                            Urgent Safety
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                            Recommended
                          </span>
                        )}
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {item.label}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {item.reason}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold font-mono text-slate-900 dark:text-white block">
                        {formatMoney(item.costPaise)}
                      </span>
                      <span className="text-[10px] text-slate-400">inc. GST</span>
                    </div>
                  </div>

                  {/* Photo Evidence Box */}
                  <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="font-semibold flex items-center gap-1.5">
                      📷 Photo: {item.photoUrl}
                    </span>
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                      Verified by Manoj
                    </span>
                  </div>

                  {/* Action Toggle */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-semibold text-slate-500">
                      Customer Decision:
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleDecision(item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        isApproved
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {isApproved ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Approve Replacement
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" /> Defer / Reject
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Running Total Bar */}
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-between">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Approved Supplementary Total:
            </span>
            <span className="text-lg font-black text-blue-600 font-mono">
              {formatMoney(approvedTotalPaise)}
            </span>
          </div>
        </div>

        {/* Pre-service 360 Exterior Inspection Walkaround */}
        <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-600" />
              Pre-existing Exterior Body &amp; Dent Pin-Map
            </h3>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              5 Angles Documented
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Tagged scratches, chips and dents recorded by advisor upon vehicle drop-off before workshop intake.
          </p>
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-inner">
            <img
              src="/bike-dent-map.png"
              alt="Pre-existing Exterior Body & Dent Pin-Map"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* Digital Signature & Authorization */}
        <form onSubmit={handleSubmitApproval} className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PenTool className="w-4 h-4 text-blue-600" />
              Customer Sign-Off Box
            </h3>
            {signed && (
              <button
                type="button"
                onClick={clearSignature}
                className="text-xs text-red-500 hover:underline"
              >
                Clear Sign
              </button>
            )}
          </div>

          <div className="border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900">
            <canvas
              ref={canvasRef}
              width={340}
              height={120}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="w-full h-32 cursor-crosshair touch-none"
            />
          </div>

          <div className="text-[11px] text-slate-500">
            By signing, you authorize AKASH Bajaj to fit approved genuine spare parts at the prices indicated above.
          </div>

          <button
            type="submit"
            className="w-full py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Submit Authorization ({formatMoney(approvedTotalPaise)})
          </button>
        </form>
      </div>
    </div>
  );
}

export default DviCustomerApprovalPage;
