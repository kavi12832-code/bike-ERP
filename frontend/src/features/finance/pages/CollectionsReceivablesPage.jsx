import React, { useState } from 'react';
import { 
  CircleDollarSign, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  QrCode, 
  MessageSquare, 
  Calendar, 
  Send, 
  Search, 
  Phone, 
  DollarSign, 
  FileText,
  ChevronRight,
  X
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatMoney } from '../../../lib/format';
import { toast } from 'sonner';

import { useCollection } from '../../../hooks/useCollection';
// SAMPLE_RECEIVABLES: loaded from the database (collection "finance.collectionsReceivables.receivables")

export function CollectionsReceivablesPage() {
  const [receivables, setReceivables] = useCollection('finance.collectionsReceivables.receivables');
  const [selectedBucket, setSelectedBucket] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [reminderTemplate, setReminderTemplate] = useState('POLITE'); // 'POLITE', 'FIRM', 'LEGAL'
  const [showQrModal, setShowQrModal] = useState(false);

  // Totals by bucket
  const totalOutstandingPaise = receivables.reduce((sum, r) => sum + r.outstandingPaise, 0);
  const bucket0_30 = receivables.filter(r => r.ageingBucket === '0_30').reduce((s, r) => s + r.outstandingPaise, 0);
  const bucket31_60 = receivables.filter(r => r.ageingBucket === '31_60').reduce((s, r) => s + r.outstandingPaise, 0);
  const bucket61_90 = receivables.filter(r => r.ageingBucket === '61_90').reduce((s, r) => s + r.outstandingPaise, 0);
  const bucket90_plus = receivables.filter(r => r.ageingBucket === '90_PLUS').reduce((s, r) => s + r.outstandingPaise, 0);

  const filtered = receivables.filter(r => {
    const matchesBucket = selectedBucket === 'ALL' || r.ageingBucket === selectedBucket;
    const matchesSearch = 
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search);
    return matchesBucket && matchesSearch;
  });

  const getReminderMessage = (rec, template) => {
    const amt = formatMoney(rec.outstandingPaise);
    if (template === 'POLITE') {
      return `Dear ${rec.customerName}, gentle reminder that your pending balance of ${amt} on invoice ${rec.invoiceNo} is due. Please pay via UPI QR: https://akashbajaj.com/pay/${rec.invoiceNo}. Thank you! - AKASH Bajaj`;
    }
    if (template === 'FIRM') {
      return `Dear ${rec.customerName}, payment of ${amt} for ${rec.invoiceNo} is overdue by ${rec.daysOverdue} days. Kindly settle immediately to avoid late interest charges and credit rating impact. - AKASH Bajaj Finance Desk`;
    }
    return `FORMAL NOTICE: Outstanding sum of ${amt} on ${rec.invoiceNo} remains unpaid for ${rec.daysOverdue} days. Failure to remit within 48 hours will compel our legal counsel to initiate Section 138 / recovery proceedings under applicable law. - AKASH Bajaj Dealership Management`;
  };

  const handleSendWhatsAppReminder = (rec) => {
    const msg = getReminderMessage(rec, reminderTemplate);
    toast.success(`WhatsApp Payment Notice (${reminderTemplate}) dispatched to ${rec.phone}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CircleDollarSign className="w-6 h-6 text-blue-600" />
            Credit Collections &amp; Receivables Ageing Desk
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            0-30, 31-60, 61-90, 90+ day ageing buckets, Promise-to-Pay (PTP) tracker &amp; instant UPI payment link generation.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Total Overdue Collections</span>
          <span className="text-2xl font-black text-red-600 font-mono">
            {formatMoney(totalOutstandingPaise)}
          </span>
        </div>
      </div>

      {/* Ageing Distribution Bucket Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => setSelectedBucket('0_30')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            selectedBucket === '0_30'
              ? 'bg-blue-50 border-blue-500 dark:bg-blue-950/40'
              : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">Current (0-30 Days)</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800">Normal</span>
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-white font-mono mt-1">
            {formatMoney(bucket0_30)}
          </div>
          <span className="text-[11px] text-slate-400">Regular credit cycle</span>
        </div>

        <div 
          onClick={() => setSelectedBucket('31_60')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            selectedBucket === '31_60'
              ? 'bg-amber-50 border-amber-500 dark:bg-amber-950/40'
              : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">31 - 60 Days</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800">Follow-up</span>
          </div>
          <div className="text-lg font-black text-amber-600 font-mono mt-1">
            {formatMoney(bucket31_60)}
          </div>
          <span className="text-[11px] text-slate-400">Firm reminder required</span>
        </div>

        <div 
          onClick={() => setSelectedBucket('61_90')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            selectedBucket === '61_90'
              ? 'bg-orange-50 border-orange-500 dark:bg-orange-950/40'
              : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">61 - 90 Days</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-orange-100 text-orange-800">At Risk</span>
          </div>
          <div className="text-lg font-black text-orange-600 font-mono mt-1">
            {formatMoney(bucket61_90)}
          </div>
          <span className="text-[11px] text-slate-400">Escalate to Accountant</span>
        </div>

        <div 
          onClick={() => setSelectedBucket('90_PLUS')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            selectedBucket === '90_PLUS'
              ? 'bg-red-50 border-red-500 dark:bg-red-950/40'
              : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">90+ Days Overdue</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-100 text-red-800">Doubtful</span>
          </div>
          <div className="text-lg font-black text-red-600 font-mono mt-1">
            {formatMoney(bucket90_plus)}
          </div>
          <span className="text-[11px] text-slate-400">Legal recovery stage</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {['ALL', '0_30', '31_60', '61_90', '90_PLUS'].map(b => (
            <button
              key={b}
              onClick={() => setSelectedBucket(b)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                selectedBucket === b
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {b === 'ALL' ? 'All Buckets' : b.replace('_', '-')}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer, invoice, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg"
          />
        </div>
      </div>

      {/* Receivables Table */}
      <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 font-semibold text-slate-500 uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Customer &amp; Mobile</th>
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Total Amount</th>
                <th className="p-3.5">Outstanding Balance</th>
                <th className="p-3.5">Days Overdue</th>
                <th className="p-3.5">Promise to Pay (PTP)</th>
                <th className="p-3.5 text-right">Collections Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(rec => (
                <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900 dark:text-white">{rec.customerName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{rec.phone}</div>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-blue-600">
                    {rec.invoiceNo}
                  </td>
                  <td className="p-3.5 font-mono">{formatMoney(rec.totalInvoicePaise)}</td>
                  <td className="p-3.5 font-mono font-black text-red-600 text-sm">
                    {formatMoney(rec.outstandingPaise)}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rec.daysOverdue > 60 ? 'bg-red-100 text-red-800' :
                      rec.daysOverdue > 30 ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {rec.daysOverdue} Days
                    </span>
                  </td>
                  <td className="p-3.5">
                    {rec.ptpDate ? (
                      <div>
                        <span className="font-mono text-slate-800 dark:text-slate-200">{rec.ptpDate}</span>
                        <div className={`text-[10px] font-bold ${
                          rec.ptpStatus === 'CONFIRMED' ? 'text-emerald-600' : 'text-red-500'
                        }`}>
                          {rec.ptpStatus}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">No PTP Set</span>
                    )}
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      onClick={() => {
                        setSelectedRecord(rec);
                        setShowQrModal(true);
                      }}
                      className="p-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                      title="Generate Instant UPI Payment QR"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleSendWhatsAppReminder(rec)}
                      className="p-1.5 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      title="Send WhatsApp Payment Notice"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* UPI QR Payment Modal */}
      {showQrModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4 text-slate-900">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-sm">Instant UPI Payment QR</h3>
              <button onClick={() => setShowQrModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl inline-block border">
              <QRCodeSVG 
                value={`upi://pay?pa=akashbajaj@icici&pn=AKASHBajaj&am=${selectedRecord.outstandingPaise / 100}&cu=INR&tn=Invoice_${selectedRecord.invoiceNo}`}
                size={160}
              />
            </div>

            <div className="text-xs space-y-1">
              <p className="font-bold">{selectedRecord.customerName}</p>
              <p className="text-slate-500">Invoice: {selectedRecord.invoiceNo}</p>
              <p className="text-lg font-black text-blue-600 font-mono">
                {formatMoney(selectedRecord.outstandingPaise)}
              </p>
            </div>

            <p className="text-[11px] text-slate-400">
              Scan with GPay, PhonePe, Paytm or any BHIM UPI app to settle directly into AKASH Bajaj Current Account.
            </p>

            <button
              onClick={() => {
                setShowQrModal(false);
                toast.success('Payment receipt recorded via UPI gateway webhook simulation!');
              }}
              className="w-full py-2 bg-emerald-600 text-white font-bold rounded-lg text-xs"
            >
              Record Payment Received
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CollectionsReceivablesPage;
