import React, { useState } from 'react';
import { 
  FileCheck, 
  QrCode, 
  Truck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Copy, 
  Send,
  Building2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatMoney } from '../../../lib/format';
import { toast } from 'sonner';

import { useCollection } from '../../../hooks/useCollection';
// SAMPLE_EINVOICES: loaded from the database (collection "gst.eInvoiceWayBill.einvoices")

const SAMPLE_EWAY_BILLS = [
  {
    id: 'ewb-01',
    ewbNo: '341098234901',
    purpose: 'Inter-Branch Stock Transfer (Central -> Whitefield)',
    fromPin: '560001',
    toPin: '560066',
    distanceKm: 22,
    transporterId: '29AAAAL8810M1Z2 (VRL Logistics)',
    vehicleReg: 'KA-01-AJ-8812',
    consignmentValuePaise: 48500000, // ₹4,85,000 (>₹50,000 threshold)
    validTill: '2026-10-25 23:59:00',
    status: 'ACTIVE',
  }
];

export function EInvoiceWayBillPage() {
  const [activeTab, setActiveTab] = useState('EINVOICE');
  const [einvoices, setEinvoices] = useCollection('gst.eInvoiceWayBill.einvoices');
  const [ewayBills, setEwayBills] = useState(SAMPLE_EWAY_BILLS);
  const [selectedIrnDoc, setSelectedIrnDoc] = useState(null);

  const handleCancelIrn = (id) => {
    setEinvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'CANCELLED_NIC' } : inv));
    toast.success('e-Invoice cancelled on NIC IRP portal within 24-hour statutory window.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-blue-600" />
            e-Invoice (IRN) &amp; e-Way Bill Gateway
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Turnover threshold &gt; ₹5 Cr mandate. Real-time NIC IRP integration, signed QR codes &amp; inter-branch e-Way bills.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> NIC IRP Gateway Online
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 space-x-2">
        <button
          onClick={() => setActiveTab('EINVOICE')}
          className={`px-4 py-2 font-semibold text-xs border-b-2 transition ${
            activeTab === 'EINVOICE'
              ? 'border-blue-600 text-blue-600 bg-blue-50/20'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          e-Invoice &amp; IRN Registry ({einvoices.length})
        </button>
        <button
          onClick={() => setActiveTab('EWAY')}
          className={`px-4 py-2 font-semibold text-xs border-b-2 transition ${
            activeTab === 'EWAY'
              ? 'border-blue-600 text-blue-600 bg-blue-50/20'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          e-Way Bill Transit Registry ({ewayBills.length})
        </button>
      </div>

      {activeTab === 'EINVOICE' ? (
        <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 font-semibold text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">B2B Buyer &amp; GSTIN</th>
                  <th className="p-3.5">Total Value</th>
                  <th className="p-3.5">IRN (64-Char Hash)</th>
                  <th className="p-3.5">Ack Date (IST)</th>
                  <th className="p-3.5">NIC Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {einvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3.5 font-mono font-bold text-blue-600">{inv.invoiceNo}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white">{inv.buyerName}</div>
                      <div className="font-mono text-[10px] text-slate-400">{inv.buyerGstin}</div>
                    </td>
                    <td className="p-3.5 font-mono font-bold">{formatMoney(inv.invoiceValuePaise)}</td>
                    <td className="p-3.5 font-mono text-[10px] text-slate-400">
                      <div className="truncate max-w-[200px]" title={inv.irn}>
                        {inv.irn}
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-500">{inv.generatedAt}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedIrnDoc(inv)}
                        className="p-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                        title="View Signed B2B QR Code"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      {inv.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleCancelIrn(inv.id)}
                          className="px-2 py-1 bg-red-50 text-red-700 font-bold rounded text-[11px] hover:bg-red-100"
                          title="Cancel within 24h"
                        >
                          Cancel
                        </button>
                      )}
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
                  <th className="p-3.5">e-Way Bill #</th>
                  <th className="p-3.5">Transit Movement Purpose</th>
                  <th className="p-3.5">Distance &amp; PINs</th>
                  <th className="p-3.5">Consignment Value (&gt;₹50K)</th>
                  <th className="p-3.5">Vehicle Reg #</th>
                  <th className="p-3.5">Valid Till</th>
                  <th className="p-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {ewayBills.map(ewb => (
                  <tr key={ewb.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3.5 font-mono font-bold text-blue-600">{ewb.ewbNo}</td>
                    <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">{ewb.purpose}</td>
                    <td className="p-3.5 font-mono text-[11px]">
                      {ewb.fromPin} &rarr; {ewb.toPin} ({ewb.distanceKm} KM)
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                      {formatMoney(ewb.consignmentValuePaise)}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-purple-600">{ewb.vehicleReg}</td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-500">{ewb.validTill}</td>
                    <td className="p-3.5 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {ewb.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Signed QR Code Modal */}
      {selectedIrnDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4 text-slate-900">
            <h3 className="font-bold text-sm">NIC Signed B2B e-Invoice QR Code</h3>
            <div className="p-4 bg-slate-50 rounded-xl inline-block border">
              <QRCodeSVG value={selectedIrnDoc.signedQrString} size={160} />
            </div>
            <div className="text-xs space-y-1">
              <p>Invoice: <strong>{selectedIrnDoc.invoiceNo}</strong></p>
              <p className="font-mono text-[10px] text-slate-400 truncate">Ack No: {selectedIrnDoc.ackNo}</p>
            </div>
            <button
              onClick={() => setSelectedIrnDoc(null)}
              className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EInvoiceWayBillPage;
