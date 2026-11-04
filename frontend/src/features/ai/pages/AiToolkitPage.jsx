import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Wrench, 
  Kanban, 
  Camera, 
  PhoneCall, 
  Mic, 
  MicOff, 
  Image as ImageIcon, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Download, 
  Clock, 
  Send, 
  User, 
  DollarSign, 
  Layers
} from 'lucide-react';
import { useAppStore } from '../../../store';
import { formatMoney } from '../../../lib/format';
import { BikeThumb } from '../../../components/domain/BikeThumb';
import { toast } from 'sonner';

import { useCollection } from '../../../hooks/useCollection';
export function AiToolkitPage() {
  const [activeTool, setActiveTool] = useState('UPSELL'); // UPSELL, BAY_OPT, DAMAGE, CALL_SUMMARY, VOICE, POSTER, OWNER_DIGEST
  const bays = useAppStore(state => state.bays || []);
  const jobCards = useAppStore(state => state.jobCards || []);

  // E1: Upsell suggestions state
  const [upsells, setUpsells] = useCollection('ai.aiToolkit.upsells');

  // E2: Bay scheduling optimizer state
  const [optimizedSchedule, setOptimizedSchedule] = useState(null);

  // E3: Computer vision damage detection state
  const [analyzedPhoto, setAnalyzedPhoto] = useState(false);

  // E4: Sales call transcript summarizer state
  const [transcript, setTranscript] = useState(
    "Sales Exec: Hello Priya, Deepak here from AKASH Bajaj Bangalore Central. Customer: Hi Deepak, I took a look at the Himalayan 450 yesterday. It's great, but my budget is strictly ₹3.5 Lakhs on-road. Plus my spouse wants delivery on Dhanteras next month. Sales Exec: Absolutely, Priya! With our exchange valuation for your old Activa and HDFC loan, your down payment is just ₹40,000. Let's reserve Kamet White today."
  );
  const [summary, setSummary] = useState(null);

  // E5: Voice Assistant state
  const [isListening, setIsListening] = useState(false);
  const [voiceQuery, setVoiceQuery] = useState('');
  const [voiceAnswer, setVoiceAnswer] = useState('');

  // E6: Poster generator state
  const [posterLang, setPosterLang] = useState('EN'); // EN, TA, HI
  const posterCanvasRef = useRef(null);

  // E8: Daily Owner Summary state
  const [scheduledWhatsApp, setScheduledWhatsApp] = useState(true);

  // E1 Action
  const handleAddUpsell = (id) => {
    setUpsells(prev => prev.map(u => u.id === id ? { ...u, added: true } : u));
    toast.success('Supplementary service add-on added to active Job Card estimate!');
  };

  // E2 Action
  const handleRunBayOptimization = () => {
    setOptimizedSchedule({
      idleTimeSavedMins: 75,
      throughputGain: '+2 Vehicles Today',
      plan: [
        { bay: 'Bay 1 (Quick Lube)', assigned: 'KA-01-MJ-4050 (Oil & General Check)', tech: 'Manoj Kumar', duration: '35m' },
        { bay: 'Bay 2 (Two-Post Lift)', assigned: 'KA-03-NJ-1122 (Brake Rotor Overhaul)', tech: 'Karthik R.', duration: '60m' },
        { bay: 'Bay 3 (EV Fast Charge)', assigned: 'KA-03-EV-8840 (BMS Telematics Sync)', tech: 'Suresh G.', duration: '45m' },
      ]
    });
    toast.success('AI Scheduling completed: Bay bottlenecks reduced by 75 mins!');
  };

  // E4 Action
  const handleSummarizeCall = () => {
    setSummary({
      customerName: 'Priya Singh',
      preferredModel: 'Royal Enfield Himalayan 450 (Kamet White)',
      budgetLimit: '₹3,50,000 On-Road',
      deliveryTarget: 'Dhanteras Festival (Next Month)',
      objection: 'Budget ceiling & spouse signoff',
      sentimentScore: '8.5 / 10 (High Purchase Intent)',
      nextAction: 'Collect booking advance & inspect exchange Activa on Saturday',
      assignedExecutive: 'Deepak Rao',
    });
    toast.success('Sales call transcript analyzed and CRM task dispatched!');
  };

  // E5 Voice Assistant handler
  const handleVoiceToggle = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      // Fallback
      setVoiceQuery("which bays are free");
      setVoiceAnswer("Currently 9 out of 12 service bays are available. Bay #01 and Bay #04 are occupied.");
      toast.info('Web Speech API simulated on this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = posterLang === 'TA' ? 'ta-IN' : posterLang === 'HI' ? 'hi-IN' : 'en-IN';

    if (!isListening) {
      recognition.start();
      setIsListening(true);
      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setVoiceQuery(text);
        setIsListening(false);
        // Process natural query
        if (text.toLowerCase().includes('sale') || text.toLowerCase().includes('gross')) {
          setVoiceAnswer("Gross sales today stand at ₹24,18,500 across 5 vehicle deliveries and 10 service bills.");
        } else if (text.toLowerCase().includes('bay') || text.toLowerCase().includes('free')) {
          setVoiceAnswer("9 bays are available right now. 3 bays are currently occupied with active jobs.");
        } else {
          setVoiceAnswer(`Navigating to relevant records for: "${text}"`);
        }
      };
      recognition.onerror = () => setIsListening(false);
    } else {
      recognition.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tool Selector Bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2 overflow-x-auto pb-2">
        {[
          { id: 'UPSELL', label: 'E1. Advisor Upsell', icon: Wrench },
          { id: 'BAY_OPT', label: 'E2. Bay Optimiser', icon: Kanban },
          { id: 'DAMAGE', label: 'E3. Damage CV', icon: Camera },
          { id: 'CALL_SUMMARY', label: 'E4. Call Summariser', icon: PhoneCall },
          { id: 'VOICE', label: 'E5. Voice Assistant', icon: Mic },
          { id: 'POSTER', label: 'E6. Poster Generator', icon: ImageIcon },
          { id: 'OWNER_DIGEST', label: 'E8. Owner EOD Digest', icon: FileText },
        ].map(tool => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                activeTool === tool.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* E1: Upsell Advisor */}
      {activeTool === 'UPSELL' && (
        <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Service Advisor Predictive Upsell Recommendations
            </h2>
            <p className="text-xs text-slate-500">
              Generated for <strong>Royal Enfield Classic 350 (KA-01-MJ-4050)</strong> at 14,820 KM check-in.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {upsells.map(up => (
              <div key={up.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">{up.title}</h3>
                    <span className="text-xs font-mono font-bold text-blue-600">{formatMoney(up.costPaise)}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-2">
                    {up.pitch}
                  </p>
                </div>

                <button
                  onClick={() => handleAddUpsell(up.id)}
                  disabled={up.added}
                  className={`w-full py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    up.added
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                  }`}
                >
                  {up.added ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Added to Estimate
                    </>
                  ) : (
                    'Add to Job Card'
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* E2: Bay Optimiser */}
      {activeTool === 'BAY_OPT' && (
        <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Kanban className="w-5 h-5 text-blue-600" />
                Bay Scheduling &amp; Technician Route Optimiser
              </h2>
              <p className="text-xs text-slate-500">
                Balances lift equipment, EV charging bays &amp; technician certifications to minimize idle bottlenecks.
              </p>
            </div>
            <button
              onClick={handleRunBayOptimization}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shadow-sm"
            >
              Run AI Optimization
            </button>
          </div>

          {optimizedSchedule && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-emerald-900 dark:text-emerald-200">
                <span>Optimised Plan: {optimizedSchedule.throughputGain}</span>
                <span>Saved: {optimizedSchedule.idleTimeSavedMins} Mins Idle Time</span>
              </div>

              <div className="space-y-2">
                {optimizedSchedule.plan.map((slot, idx) => (
                  <div key={idx} className="p-3 bg-white dark:bg-slate-900 rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <strong className="text-blue-600">{slot.bay}</strong>: {slot.assigned}
                      <div className="text-[11px] text-slate-400">Tech: {slot.tech} • Duration: {slot.duration}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      Auto-Slotted
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* E3: Photo Damage Detection */}
      {activeTool === 'DAMAGE' && (
        <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-600" />
                Computer Vision Exterior Damage &amp; Dent Scanner
              </h2>
              <p className="text-xs text-slate-500">
                Simulated edge AI detection analyzing check-in photos with bounding box overlays.
              </p>
            </div>
            <button
              onClick={() => {
                setAnalyzedPhoto(true);
                toast.success('CV Scan finished: 2 surface defects flagged with 94% confidence.');
              }}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700"
            >
              Analyze Check-In Photo
            </button>
          </div>

          <div className="relative border-2 border-dashed rounded-xl p-8 bg-slate-50 dark:bg-slate-900 text-center flex flex-col items-center justify-center min-h-[220px]">
            <BikeThumb bodyType="adventure" color="#3B82F6" className="w-64 h-36 opacity-80" />

            {analyzedPhoto && (
              <>
                {/* Bounding Box 1 */}
                <div className="absolute left-[38%] top-[45%] border-2 border-red-500 bg-red-500/20 px-2 py-1 rounded text-[10px] font-bold text-white shadow-lg animate-pulse">
                  Scratch (94% Conf.)
                </div>
                {/* Bounding Box 2 */}
                <div className="absolute left-[58%] top-[55%] border-2 border-amber-500 bg-amber-500/20 px-2 py-1 rounded text-[10px] font-bold text-white shadow-lg">
                  Dent (88% Conf.)
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* E4: Sales Call Summariser */}
      {activeTool === 'CALL_SUMMARY' && (
        <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-blue-600" />
              Sales Call Audio / Transcript NLP Summariser
            </h2>
            <p className="text-xs text-slate-500">
              Extracts customer budget, timeline, objections and creates an actionable CRM follow-up task.
            </p>
          </div>

          <textarea
            rows={4}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl"
          />

          <button
            onClick={handleSummarizeCall}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shadow-sm"
          >
            Extract Customer Intelligence
          </button>

          {summary && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                <p><strong>Customer:</strong> {summary.customerName}</p>
                <p><strong>Model:</strong> {summary.preferredModel}</p>
                <p><strong>Budget:</strong> {summary.budgetLimit}</p>
                <p><strong>Timeline:</strong> {summary.deliveryTarget}</p>
                <p><strong>Sentiment:</strong> <span className="text-emerald-600 font-bold">{summary.sentimentScore}</span></p>
                <p><strong>Assigned Owner:</strong> {summary.assignedExecutive}</p>
              </div>
              <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
                <strong className="text-blue-800 dark:text-blue-300">Auto CRM Task:</strong> {summary.nextAction}
              </div>
            </div>
          )}
        </div>
      )}

      {/* E5: Multilingual Voice Assistant */}
      {activeTool === 'VOICE' && (
        <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-center">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
            <Mic className="w-5 h-5 text-purple-600" />
            Multilingual Showroom Voice Assistant (EN / TA / HI)
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Hands-free voice queries using Web Speech API: "Which bays are free?", "Show today's sales", "Find customer Rahul".
          </p>

          <div className="flex justify-center gap-2 py-2">
            {['EN', 'TA', 'HI'].map(lang => (
              <button
                key={lang}
                onClick={() => setPosterLang(lang)}
                className={`px-3 py-1 rounded text-xs font-bold ${
                  posterLang === lang ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {lang === 'EN' ? 'English' : lang === 'TA' ? 'தமிழ் (Tamil)' : 'हिन्दी (Hindi)'}
              </button>
            ))}
          </div>

          <div className="py-4">
            <button
              onClick={handleVoiceToggle}
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto transition shadow-lg ${
                isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
            <span className="text-xs text-slate-400 block mt-2">
              {isListening ? 'Listening in IST...' : 'Click to Speak'}
            </span>
          </div>

          {voiceQuery && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs max-w-lg mx-auto space-y-1">
              <p className="text-slate-500 font-mono">You asked: "{voiceQuery}"</p>
              <p className="font-bold text-slate-900 dark:text-white">{voiceAnswer}</p>
            </div>
          )}
        </div>
      )}

      {/* E6: Poster & WhatsApp Copy Generator */}
      {activeTool === 'POSTER' && (
        <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              Multilingual Festival Offer Poster &amp; WhatsApp Copy Generator
            </h2>
            <p className="text-xs text-slate-500">
              Instant creative synthesis in English, Tamil, and Hindi with high-res SVG bike poster export.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Visual Poster Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-950 text-white text-center space-y-3 shadow-xl">
              <span className="text-[10px] font-bold tracking-widest uppercase opacity-75">
                AKASH Bajaj Dealership Special Offer
              </span>
              <h3 className="text-xl font-black">DIWALI DHANTERAS DHAMAKA</h3>
              <p className="text-xs opacity-90">Himalayan 450 &amp; Hunter 350 • Zero Down Payment</p>
              <div className="py-2 flex justify-center">
                <BikeThumb bodyType="adventure" color="#F59E0B" className="w-48 h-28" />
              </div>
              <div className="text-xs font-mono font-bold text-amber-400">
                EMI Starts ₹3,499/mo • Free 3-Yr RSA &amp; Helmet
              </div>
              <button
                onClick={() => toast.success('Poster canvas downloaded as PNG for Instagram / WhatsApp!')}
                className="px-4 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-bold hover:bg-slate-100 shadow"
              >
                Download Poster PNG
              </button>
            </div>

            {/* 3 WhatsApp Copy Variations */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Generated WhatsApp Broadcast Variations
              </h4>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border text-xs space-y-1">
                <span className="font-bold text-blue-600">Option A (Festival / Emotional):</span>
                <p className="text-slate-600 dark:text-slate-300 italic">
                  "Celebrate Dhanteras with AKASH Bajaj! Ride home your Royal Enfield Himalayan with ₹0 down payment &amp; guaranteed festival delivery. Reply 1 to claim your gift voucher."
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border text-xs space-y-1">
                <span className="font-bold text-emerald-600">Option B (Financial / EMI Focus):</span>
                <p className="text-slate-600 dark:text-slate-300 italic">
                  "Best-in-class interest rates starting 7.99%! Own the Hunter 350 for just ₹3,499/month. Limited stock allocation for Bangalore Central. Call now: 080-41234567."
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border text-xs space-y-1">
                <span className="font-bold text-purple-600">Option C (Urgency / Stock Scarcity):</span>
                <p className="text-slate-600 dark:text-slate-300 italic">
                  "Only 4 units left of Himalayan Kamet White at pre-revision price! Book before midnight to save ₹8,500 on accessories. Link: akashbajaj.com/book"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* E8: Daily Owner Summary */}
      {activeTool === 'OWNER_DIGEST' && (
        <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Executive Intelligence</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                Dealer Principal End-of-Day Summary (Rajesh Varma)
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Auto 8 PM WhatsApp Dispatch:</span>
              <button
                onClick={() => {
                  setScheduledWhatsApp(!scheduledWhatsApp);
                  toast.success(scheduledWhatsApp ? '8 PM WhatsApp schedule paused' : '8 PM WhatsApp digest active');
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  scheduledWhatsApp ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {scheduledWhatsApp ? '✓ Scheduled 8 PM' : 'Paused'}
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            <p className="font-bold text-slate-900 dark:text-white">
              AKASH Bajaj Dealership Group — Executive Digest (Bangalore Central)
            </p>
            <p>
              • <strong>Revenue &amp; Retails:</strong> 5 new vehicles delivered today (Gross Revenue ₹24.18 Lakhs). Retail run-rate is currently at 93% of the monthly target of 45 units.
            </p>
            <p>
              • <strong>Workshop Operations:</strong> 10 service job cards closed. Bay utilisation averaged 82%. Zero unresolved customer complaints today.
            </p>
            <p>
              • <strong>Cash &amp; Working Capital:</strong> Till closed with ₹35,500 physical cash counted with ₹0 reconciliation variance. ₹3.89 Lakhs collected against credit receivables.
            </p>
            <p>
              • <strong>Strategic Watch Item:</strong> RTO Trade Certificate renewal due in 9 days. CA has been notified.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AiToolkitPage;
