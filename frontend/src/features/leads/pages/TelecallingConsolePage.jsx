import React, { useState } from 'react';
import { 
  Headphones, 
  Phone, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  ChevronRight, 
  Plus, 
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { useAppStore } from '../../../store';
import { toast } from 'sonner';

import { useCollection, useCollectionItems } from '../../../hooks/useCollection';
// SAMPLE_CALL_QUEUE: loaded from the database (collection "leads.telecallingConsole.callQueue")

const OBJECTION_SCRIPTS = [
  {
    objection: 'Price is too expensive / out of budget',
    response: '"I completely understand, Sir. With our zero-down-payment tie-up with HDFC Bank, the monthly EMI works out to just ₹3,890/month. Plus, we are offering complimentary 3-year RSA and free helmet this week. May I book a quick test ride?"'
  },
  {
    objection: 'Waiting for Diwali / festival discount',
    response: '"Sir, OEM price revisions happen after festival quotas. Booking now guarantees price protection and delivery on Dhanteras without waiting lists. Even if prices rise, your booking rate is locked."'
  },
  {
    objection: 'Comparing with Triumph Scrambler 400X',
    response: '"The Triumph is an exciting bike, Sir. However, Royal Enfield offers 3,000+ service touchpoints across India, substantially lower parts replacement costs, and proven Himalayan high-altitude reliability. Experience our 450 chassis today!"'
  }
];

export function TelecallingConsolePage() {
  const SAMPLE_CALL_QUEUE = useCollectionItems('leads.telecallingConsole.callQueue');
  const [queue, setQueue] = useCollection('leads.telecallingConsole.callQueue');
  const [selectedCall, setSelectedCall] = useState(SAMPLE_CALL_QUEUE[0]);
  const [disposition, setDisposition] = useState('CONNECTED');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('2026-10-26');

  const handleLogDisposition = (e) => {
    e.preventDefault();
    setQueue(prev => prev.map(c => c.id === selectedCall.id ? { ...c, status: disposition } : c));
    toast.success(`Call disposition "${disposition}" recorded for ${selectedCall.customerName}!`);
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Headphones className="w-6 h-6 text-blue-600" />
            Telecalling Calling Console &amp; Objection Scripts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Agent rapid call queue, click-to-call dialing, objection handler talk tracks &amp; calendar follow-up sync.
          </p>
        </div>

        <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>Queue Remaining: <strong>{queue.filter(q => q.status === 'PENDING').length} Calls</strong></span>
        </div>
      </div>

      {/* Main Grid: Call Queue + Active Dialing & Script Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Telecaller Queue List */}
        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Today's Telecall List ({queue.length})
          </h2>

          <div className="space-y-2">
            {queue.map(item => {
              const isSelected = item.id === selectedCall.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedCall(item)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition space-y-2 ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 dark:bg-blue-950/40 dark:border-blue-700 shadow-sm'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.customerName}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.status === 'CONNECTED' ? 'bg-emerald-100 text-emerald-800' :
                      item.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="text-xs text-blue-600 font-semibold">
                    {item.modelInterest}
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span>{item.language}</span>
                    <span className="font-mono">{item.phone}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Active Call Console + Objection Handlers */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Call Card */}
          <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Active Calling Screen</span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  {selectedCall.customerName}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Interested in: <strong>{selectedCall.modelInterest}</strong> • Source: <strong>{selectedCall.source}</strong>
                </p>
              </div>

              {/* Click-to-Call Primary Button */}
              <a
                href={`tel:${selectedCall.phone}`}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition text-sm"
              >
                <Phone className="w-4 h-4 animate-bounce" />
                <span>Dial {selectedCall.phone}</span>
              </a>
            </div>

            {/* Disposition Logger Form */}
            <form onSubmit={handleLogDisposition} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Call Disposition Outcome
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'CONNECTED', 
                    'BUSY', 
                    'SWITCH_OFF', 
                    'NOT_INTERESTED', 
                    'CALLBACK', 
                    'TEST_RIDE_BOOKED'
                  ].map(disp => (
                    <button
                      key={disp}
                      type="button"
                      onClick={() => setDisposition(disp)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                        disposition === disp
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {disp.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Call Conversation Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Customer queries on exchange price, preferred delivery date..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Follow-Up Date &amp; Calendar Sync
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Auto-schedules task reminder in staff calendar for selected date.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition"
                >
                  Save Call Disposition &amp; Next
                </button>
              </div>
            </form>
          </div>

          {/* Objection Handling Scripts */}
          <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              Live Sales Objection Handling Scripts
            </h3>
            <p className="text-xs text-slate-500">
              Tested pitch rebuttals for customer price and competitive hesitation during telecalls.
            </p>

            <div className="space-y-3 pt-1">
              {OBJECTION_SCRIPTS.map((script, idx) => (
                <div 
                  key={idx}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs"
                >
                  <span className="font-bold text-red-600 dark:text-red-400 block">
                    Customer Objection: "{script.objection}"
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 italic">
                    {script.response}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TelecallingConsolePage;
