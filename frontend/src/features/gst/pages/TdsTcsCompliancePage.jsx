import React, { useState } from 'react';
import { 
  FileText, 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  DollarSign, 
  Download, 
  ShieldCheck, 
  Building2,
  Search
} from 'lucide-react';
import { formatMoney } from '../../../lib/format';
import { toast } from 'sonner';

import { useCollection } from '../../../hooks/useCollection';
// SAMPLE_TDS_RECORDS: loaded from the database (collection "gst.tdsTcsCompliance.tdsRecords")

const SAMPLE_TCS_RECORDS = [
  {
    id: 'tcs-01',
    section: '206C(1F)',
    title: 'High-Value Motor Vehicle Sale exceeding ₹10 Lakhs',
    invoiceNo: 'VI/2627/00004',
    customerName: 'Bundl Technologies Pvt Ltd',
    vehicleModel: 'Bulk Fleet Consignment (Batch 1)',
    saleValuePaise: 115000000, // ₹11.5 Lakhs (>₹10 Lakhs threshold)
    tcsRatePercent: 1.0, // 1% TCS under Section 206C(1F) (CONFIRM WITH CA)
    tcsCollectedPaise: 1150000, // ₹11,500
    status: 'COLLECTED',
  }
];

export function TdsTcsCompliancePage() {
  const [activeTab, setActiveTab] = useState('TDS'); // 'TDS' or 'TCS'
  const [tdsRecords, setTdsRecords] = useCollection('gst.tdsTcsCompliance.tdsRecords');
  const [tcsRecords, setTcsRecords] = useState(SAMPLE_TCS_RECORDS);

  const totalTdsDuePaise = tdsRecords
    .filter(r => r.status === 'PAYMENT_DUE')
    .reduce((sum, r) => sum + r.tdsDeductedPaise, 0);

  const totalTcsCollectedPaise = tcsRecords.reduce((sum, r) => sum + r.tcsCollectedPaise, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              TDS &amp; TCS Statutory Compliance Desk
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
              CONFIRM WITH CA
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Section 194C/J/I withholding tax ledger, Section 206C(1F) high-value vehicle TCS &amp; Form 26Q quarterly prep.
          </p>
        </div>

        <button
          onClick={() => toast.success('Form 26Q TDS Return Summary generated for CA review.')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border rounded-lg shadow-sm hover:bg-slate-50"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Export Form 26Q / 27Q Summary
        </button>
      </div>

      {/* Statutory CA Notice */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 dark:text-amber-200">
          <p className="font-bold">Statutory Assumptions Under Income Tax Act 1961 (CONFIRM WITH CA)</p>
          <p className="mt-0.5">
            TDS rates: 194C (1% individual / 2% co), 194J (10% professional), 194I (10% building rent). TCS under 206C(1F) applies strictly on vehicle sales where consideration exceeds ₹10,00,000.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500">TDS Liability Due on 7th</div>
          <div className="text-2xl font-black text-red-600 font-mono mt-1">
            {formatMoney(totalTdsDuePaise)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Deposit via Challan ITNS 281</div>
        </div>

        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500">TCS Collected on Luxury/Fleet Bikes</div>
          <div className="text-2xl font-black text-emerald-600 font-mono mt-1">
            {formatMoney(totalTcsCollectedPaise)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Section 206C(1F) consideration &gt; ₹10L</div>
        </div>

        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500">Form 26Q Quarterly Filing Status</div>
          <div className="text-2xl font-black text-blue-600 mt-1">Q2 Ready</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Quarter ended Sept 2026 reconciled</div>
        </div>
      </div>

      {/* Toggle View Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 space-x-2">
        <button
          onClick={() => setActiveTab('TDS')}
          className={`px-4 py-2 font-semibold text-xs border-b-2 transition ${
            activeTab === 'TDS'
              ? 'border-blue-600 text-blue-600 bg-blue-50/20'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          TDS Withholding Ledger ({tdsRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('TCS')}
          className={`px-4 py-2 font-semibold text-xs border-b-2 transition ${
            activeTab === 'TCS'
              ? 'border-blue-600 text-blue-600 bg-blue-50/20'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Section 206C(1F) Vehicle TCS ({tcsRecords.length})
        </button>
      </div>

      {activeTab === 'TDS' ? (
        <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 font-semibold text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Section &amp; Nature</th>
                  <th className="p-3.5">Deductee &amp; PAN</th>
                  <th className="p-3.5">Gross Base Value</th>
                  <th className="p-3.5">TDS Rate</th>
                  <th className="p-3.5">TDS Deducted</th>
                  <th className="p-3.5">Challan / BSR Mapping</th>
                  <th className="p-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tdsRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3.5">
                      <span className="font-mono font-bold text-blue-600 block">{rec.section}</span>
                      <span className="text-[11px] text-slate-500">{rec.sectionTitle}</span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white">{rec.deducteeName}</div>
                      <div className="font-mono text-[10px] text-slate-400">PAN: {rec.deducteePan}</div>
                    </td>
                    <td className="p-3.5 font-mono">{formatMoney(rec.grossAmountPaise)}</td>
                    <td className="p-3.5 font-mono font-bold">{rec.tdsRatePercent}%</td>
                    <td className="p-3.5 font-mono font-black text-red-600">
                      {formatMoney(rec.tdsDeductedPaise)}
                    </td>
                    <td className="p-3.5 font-mono text-[11px]">
                      {rec.challanNo ? (
                        <div>
                          <span className="text-emerald-600 font-bold">{rec.challanNo}</span>
                          <div className="text-[10px] text-slate-400">BSR: {rec.bsrCode} • {rec.depositDate}</div>
                        </div>
                      ) : (
                        <span className="text-amber-600 font-bold">Unpaid Challan</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rec.status === 'DEPOSITED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {rec.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 font-semibold text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Customer &amp; Vehicle</th>
                  <th className="p-3.5">Sale Value (&gt;₹10L)</th>
                  <th className="p-3.5">TCS Rate (206C(1F))</th>
                  <th className="p-3.5">TCS Collected</th>
                  <th className="p-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tcsRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3.5 font-mono font-bold text-blue-600">{rec.invoiceNo}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white">{rec.customerName}</div>
                      <div className="text-[10px] text-slate-400">{rec.vehicleModel}</div>
                    </td>
                    <td className="p-3.5 font-mono font-bold">{formatMoney(rec.saleValuePaise)}</td>
                    <td className="p-3.5 font-mono font-bold">{rec.tcsRatePercent}%</td>
                    <td className="p-3.5 font-mono font-black text-emerald-600">
                      {formatMoney(rec.tcsCollectedPaise)}
                    </td>
                    <td className="p-3.5 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default TdsTcsCompliancePage;
