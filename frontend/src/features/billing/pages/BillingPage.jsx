import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, cardEntranceVariants } from '../../../lib/motion';
import { useAppStore } from '../../../store';
import { computeLineTax, computeInvoiceTaxTotals } from '../../../lib/tax';
import { isValidGstin } from '../../../lib/gst';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { KpiCard } from '../../../components/ui/KpiCard';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { formatMoney, formatDate, amountInWords } from '../../../lib/format';
import { QRCodeSVG } from 'qrcode.react';
import {
  Receipt,
  PlusCircle,
  FileText,
  Printer,
  CreditCard,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  CheckCircle,
  Download,
  IndianRupee,
  Layers,
  Banknote,
  FileCheck
} from 'lucide-react';
import { toast } from 'sonner';

export function BillingPage() {
  const state = useAppStore();
  const invoices = state.invoices || [];
  const taxRules = state.catalogs?.taxRules || [];
  const bikeCatalog = state.catalogs?.bikes || [];
  const postInvoice = state.postInvoice;
  const currentUser = state.currentUser;

  const [activeInvoice, setActiveInvoice] = useState(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [thermalModalOpen, setThermalModalOpen] = useState(false);
  const [newInvoiceModalOpen, setNewInvoiceModalOpen] = useState(false);
  const [creditNoteModalOpen, setCreditNoteModalOpen] = useState(false);

  // New Invoice Form
  const [invType, setInvType] = useState('VEHICLE_SALE'); // 'VEHICLE_SALE', 'SERVICE', 'PARTS_COUNTER'
  const [customerName, setCustomerName] = useState('Anand Murthy');
  const [phone, setPhone] = useState('+91 98451 90214');
  const [address, setAddress] = useState('108, Koramangala 4th Block, Bangalore');
  const [buyerStateCode, setBuyerStateCode] = useState('29'); // 29 = Karnataka
  const [gstin, setGstin] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI'); // CASH, UPI, POS, NEFT, FINANCE_DISBURSEMENT
  const [cashAmountRupees, setCashAmountRupees] = useState(0);

  // Vehicle Sale specific
  const [selectedBikeId, setSelectedBikeId] = useState(bikeCatalog[0]?.id || '');

  // Calculate live taxes for new invoice
  const selectedBike = bikeCatalog.find((b) => b.id === selectedBikeId) || bikeCatalog[0];
  const taxRule = taxRules.find((r) => r.category === 'VEHICLE' && r.fuelType === selectedBike.fuelType) || taxRules[0];

  const calculatedTax = computeLineTax({
    taxableAmountPaise: Math.round(selectedBike.exShowroomPaise / 1.18), // Back-calculate taxable
    taxRule,
    buyerStateCode,
    sellerStateCode: '29',
  });

  const isCashAboveLimit = paymentMode === 'CASH' && Number(cashAmountRupees) >= 200000;

  const handlePostInvoice = (e) => {
    e.preventDefault();

    if (isCashAboveLimit) {
      toast.error('Cash limit violation (Sec 269ST): Cash acceptance >= ₹2,00,000 per person per day is prohibited!');
      return;
    }

    if (gstin && !isValidGstin(gstin)) {
      toast.error('Invalid GSTIN format entered. Please verify 15-character statutory format.');
      return;
    }

    const newInv = postInvoice({
      type: invType,
      date: new Date().toISOString(),
      customerId: `cust-gen-${Date.now()}`,
      customerName,
      customerPhone: phone,
      customerAddress: address,
      buyerStateCode,
      sellerStateCode: '29',
      gstin: gstin || null,
      items: [
        {
          description: `${selectedBike.brand} ${selectedBike.model} (HSN: ${selectedBike.hsn})`,
          hsn: selectedBike.hsn,
          qty: 1,
          taxableAmountPaise: calculatedTax.taxableAmountPaise,
          gstRatePercent: calculatedTax.gstRatePercent,
          cgstRatePercent: calculatedTax.cgstRatePercent,
          sgstRatePercent: calculatedTax.sgstRatePercent,
          igstRatePercent: calculatedTax.igstRatePercent,
          cgstPaise: calculatedTax.cgstPaise,
          sgstPaise: calculatedTax.sgstPaise,
          igstPaise: calculatedTax.igstPaise,
          lineTotalPaise: calculatedTax.grossAmountPaise,
        },
      ],
      taxableAmountPaise: calculatedTax.taxableAmountPaise,
      cgstPaise: calculatedTax.cgstPaise,
      sgstPaise: calculatedTax.sgstPaise,
      igstPaise: calculatedTax.igstPaise,
      totalTaxPaise: calculatedTax.totalTaxPaise,
      roundOffPaise: 0,
      grandTotalPaise: calculatedTax.grossAmountPaise,
      paidAmountPaise: calculatedTax.grossAmountPaise,
      balanceDuePaise: 0,
      paymentStatus: 'PAID',
      paymentMode,
      paymentRef: `${paymentMode}-TXN-${Date.now().toString().slice(-6)}`,
      irn: null,
      qrCodeString: `upi://pay?pa=akashbajaj@hdfcbank&pn=AKASHBajaj&am=${(
        calculatedTax.grossAmountPaise / 100
      ).toFixed(2)}`,
      branchId: state.activeBranchId,
    });

    setNewInvoiceModalOpen(false);
    toast.success(`Tax Invoice ${newInv.invoiceNumber} posted & ledger entries synchronized!`);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0b1b2b]">Billing, GST Invoices &amp; Settlements</h1>
          <p className="text-xs sm:text-sm text-[#0b1b2b]/65 font-medium mt-0.5">
            Immutable invoice series, CGST/SGST/IGST tax splits, Section 269ST cash warnings and UPI receipts
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <motion.button
            whileHover={{ y: -1, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setNewInvoiceModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-[#0b1220] hover:bg-[#162033] text-white font-semibold text-xs inline-flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span>Create Tax Invoice</span>
          </motion.button>
        </div>
      </div>

      {/* KPI Cards */}
      <motion.div variants={cardEntranceVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Layers}
          label="Total Invoices Posted"
          value={invoices.length}
          subtitle="All finalized series"
        />
        <KpiCard
          icon={IndianRupee}
          label="Total Collections"
          value={formatMoney(invoices.reduce((s, i) => s + i.grandTotalPaise, 0))}
          subtitle="Gross ledger value"
        />
        <KpiCard
          icon={Banknote}
          label="GST Output Collected"
          value={formatMoney(invoices.reduce((s, i) => s + i.totalTaxPaise, 0))}
          subtitle="CGST, SGST & IGST"
        />
        <KpiCard
          icon={FileCheck}
          label="Credit Notes Issued"
          value="0 Notes"
          subtitle="Statutory reversals"
        />
      </motion.div>

      {/* Invoices Master Table */}
      <motion.div variants={cardEntranceVariants} className="glass-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white/20 border-b border-white/20 text-[#0b1b2b]/70 font-semibold uppercase text-[11px]">
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Taxable Value</th>
                <th className="p-3.5">CGST / SGST</th>
                <th className="p-3.5">Grand Total</th>
                <th className="p-3.5">Payment Mode</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Print Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/15">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/25 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-blue-800">{inv.invoiceNumber}</td>
                  <td className="p-3.5">
                    <div className="font-bold text-[#0b1b2b]">{inv.customerName}</div>
                    <div className="text-[10px] text-[#0b1b2b]/60">{inv.customerPhone}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="font-semibold text-[#0b1b2b]/70 uppercase text-[10px]">
                      {inv.type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-3.5 text-[#0b1b2b]/65">{formatDate(inv.date)}</td>
                  <td className="p-3.5 tabular-nums text-[#0b1b2b]/70 font-medium">
                    {formatMoney(inv.taxableAmountPaise)}
                  </td>
                  <td className="p-3.5 tabular-nums text-[#0b1b2b]/70">
                    {inv.cgstPaise > 0
                      ? `C: ${formatMoney(inv.cgstPaise)} | S: ${formatMoney(inv.sgstPaise)}`
                      : `IGST: ${formatMoney(inv.igstPaise)}`}
                  </td>
                  <td className="p-3.5 tabular-nums font-bold text-[#0b1b2b]">
                    {formatMoney(inv.grandTotalPaise)}
                  </td>
                  <td className="p-3.5">
                    <span className="font-semibold text-[#0b1b2b]/70 text-[10px] uppercase">
                      {inv.paymentMode}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <StatusBadge status={inv.paymentStatus} />
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setActiveInvoice(inv);
                          setPrintModalOpen(true);
                        }}
                        className="px-3 py-1 text-xs font-semibold rounded-full bg-white/40 hover:bg-white/60 text-[#0b1b2b] border border-white/40 inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#0b1b2b]/70" />
                        <span>A4 PDF</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setActiveInvoice(inv);
                          setThermalModalOpen(true);
                        }}
                        className="px-3 py-1 text-xs font-semibold rounded-full bg-white/20 hover:bg-white/40 text-[#0b1b2b] border border-white/30 inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#0b1b2b]/70" />
                        <span>Thermal</span>
                      </motion.button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* New Invoice Generator Modal */}
      <Modal
        isOpen={newInvoiceModalOpen}
        onClose={() => setNewInvoiceModalOpen(false)}
        title="Generate Statutory Tax Invoice (Immutable Series)"
        size="lg"
      >
        <form onSubmit={handlePostInvoice} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-text-main mb-1">Invoice Category</label>
              <select
                value={invType}
                onChange={(e) => setInvType(e.target.value)}
                className="w-full p-2.5 rounded-input border border-border bg-surface-subtle text-text-main"
              >
                <option value="VEHICLE_SALE">New Vehicle Sale Invoice</option>
                <option value="SERVICE">Workshop Service Repair Invoice</option>
                <option value="PARTS_COUNTER">Over-the-Counter Spare Parts Invoice</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-text-main mb-1">Selected Vehicle Model</label>
              <select
                value={selectedBikeId}
                onChange={(e) => setSelectedBikeId(e.target.value)}
                className="w-full p-2.5 rounded-input border border-border bg-surface-subtle text-text-main"
              >
                {bikeCatalog.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.brand} {b.model} ({formatMoney(b.exShowroomPaise)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-text-main mb-1">Customer Name</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-2.5 rounded-input border border-border bg-surface-subtle text-text-main"
              />
            </div>
            <div>
              <label className="block font-semibold text-text-main mb-1">Mobile Phone (+91)</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-input border border-border bg-surface-subtle text-text-main"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-text-main mb-1">Place of Supply (Buyer State Code)</label>
              <select
                value={buyerStateCode}
                onChange={(e) => setBuyerStateCode(e.target.value)}
                className="w-full p-2.5 rounded-input border border-border bg-surface-subtle text-text-main"
              >
                <option value="29">29 - Karnataka (Intra-State CGST+SGST)</option>
                <option value="33">33 - Tamil Nadu (Inter-State IGST)</option>
                <option value="36">36 - Telangana (Inter-State IGST)</option>
                <option value="27">27 - Maharashtra (Inter-State IGST)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-text-main mb-1">B2B GSTIN (Optional)</label>
              <input
                type="text"
                placeholder="29AABCB1829M1ZK"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                className="w-full p-2.5 font-mono uppercase rounded-input border border-border bg-surface-subtle text-text-main"
              />
            </div>
          </div>

          {/* Payment Method & Cash Limit Warning */}
          <div className="p-3 bg-surface-subtle rounded-card border border-border space-y-3">
            <h4 className="font-semibold text-text-main">Payment Settlement & Mode</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-text-muted block mb-1">Settlement Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full p-2 rounded-input border border-border bg-surface text-text-main"
                >
                  <option value="UPI">UPI Digital Payment</option>
                  <option value="POS">Credit / Debit Card POS</option>
                  <option value="NEFT">Bank NEFT / RTGS</option>
                  <option value="FINANCE_DISBURSEMENT">Auto Finance Loan Disbursement</option>
                  <option value="CASH">Cash Counter Payment</option>
                </select>
              </div>

              {paymentMode === 'CASH' && (
                <div>
                  <label className="text-[11px] text-text-muted block mb-1">Cash Tendered (₹)</label>
                  <input
                    type="number"
                    value={cashAmountRupees}
                    onChange={(e) => setCashAmountRupees(e.target.value)}
                    className="w-full p-2 rounded-input border border-border bg-surface text-text-main font-bold"
                  />
                </div>
              )}
            </div>

            {isCashAboveLimit && (
              <div className="p-2.5 rounded bg-red-100 border border-red-300 text-status-red flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>
                  <strong>STATUTORY SECTION 269ST VIOLATION:</strong> Cash transaction of ₹2,00,000 or more in a single day is strictly prohibited by Income Tax law. (CONFIRM WITH CA).
                </span>
              </div>
            )}
          </div>

          {/* Tax Split Summary */}
          <div className="p-3 bg-surface-subtle rounded-card border border-border flex justify-between items-center">
            <div>
              <span className="text-[11px] text-text-muted block">GST Rate Applied:</span>
              <span className="font-bold text-text-main">
                {calculatedTax.gstRatePercent}% ({calculatedTax.isIntraState ? 'CGST 50% + SGST 50%' : 'IGST 100%'})
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-text-muted block">Payable Grand Total:</span>
              <span className="text-base font-bold text-primary tabular-nums">
                {formatMoney(calculatedTax.grossAmountPaise)}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setNewInvoiceModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isCashAboveLimit}>
              Post Immutable Invoice
            </Button>
          </div>
        </form>
      </Modal>

      {/* A4 Tax Invoice Printable Modal */}
      <Modal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        title={activeInvoice ? `Statutory Tax Invoice: ${activeInvoice.invoiceNumber}` : ''}
        size="lg"
      >
        {activeInvoice && (
          <div className="p-6 bg-white text-slate-900 border border-border rounded-card space-y-4 text-xs font-sans">
            {/* Letterhead */}
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h2 className="text-lg font-bold text-navy-900">{state.dealership.name}</h2>
                <p className="text-xs text-slate-500">{state.dealership.headOffice}</p>
                <div className="text-xs text-slate-600 font-mono mt-0.5">
                  GSTIN: {state.dealership.gstin} | State: Karnataka (29)
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold uppercase text-slate-400">Tax Invoice</div>
                <div className="text-base font-mono font-bold text-primary">{activeInvoice.invoiceNumber}</div>
                <div className="text-xs text-slate-500">Date: {formatDate(activeInvoice.date)}</div>
              </div>
            </div>

            {/* Bill to */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Billed To (Customer):</span>
                <span className="font-bold text-slate-900">{activeInvoice.customerName}</span>
                <div className="text-slate-600">{activeInvoice.customerPhone}</div>
                <div className="text-slate-500">{activeInvoice.customerAddress}</div>
                {activeInvoice.gstin && (
                  <div className="font-mono text-primary font-bold mt-1">GSTIN: {activeInvoice.gstin}</div>
                )}
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Place of Supply:</span>
                <span className="font-bold text-slate-800">State Code {activeInvoice.buyerStateCode}</span>
                <div className="text-slate-600 mt-1">Payment Mode: {activeInvoice.paymentMode}</div>
                <div className="font-mono text-slate-500 text-[10px]">Ref: {activeInvoice.paymentRef}</div>
              </div>
            </div>

            {/* Line Items Table */}
            <table className="w-full text-xs text-left border-collapse border border-slate-200">
              <thead className="bg-slate-100 font-semibold text-slate-700">
                <tr>
                  <th className="p-2 border border-slate-200">#</th>
                  <th className="p-2 border border-slate-200">Item Description</th>
                  <th className="p-2 border border-slate-200">HSN/SAC</th>
                  <th className="p-2 border border-slate-200 text-right">Qty</th>
                  <th className="p-2 border border-slate-200 text-right">Taxable (₹)</th>
                  <th className="p-2 border border-slate-200 text-right">GST %</th>
                  <th className="p-2 border border-slate-200 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {activeInvoice.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2 border border-slate-200">{idx + 1}</td>
                    <td className="p-2 border border-slate-200 font-semibold">{item.description}</td>
                    <td className="p-2 border border-slate-200 font-mono">{item.hsn || item.sac}</td>
                    <td className="p-2 border border-slate-200 text-right">{item.qty}</td>
                    <td className="p-2 border border-slate-200 text-right tabular-nums">
                      {formatMoney(item.taxableAmountPaise)}
                    </td>
                    <td className="p-2 border border-slate-200 text-right tabular-nums">
                      {item.gstRatePercent}%
                    </td>
                    <td className="p-2 border border-slate-200 text-right font-bold tabular-nums">
                      {formatMoney(item.lineTotalPaise)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Tax Split & UPI QR Code */}
            <div className="flex justify-between items-end pt-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 border rounded inline-block">
                  <QRCodeSVG
                    value={activeInvoice.qrCodeString || 'upi://pay?pa=akashbajaj@hdfcbank'}
                    size={80}
                  />
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-[11px] block">Scan UPI QR to Pay</span>
                  <span className="text-[10px] text-slate-500">Instant NEFT / UPI settlement</span>
                </div>
              </div>

              <div className="w-64 space-y-1 text-right text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Taxable Value:</span>
                  <span className="tabular-nums font-semibold">{formatMoney(activeInvoice.taxableAmountPaise)}</span>
                </div>
                {activeInvoice.cgstPaise > 0 ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-500">CGST (Central Tax):</span>
                      <span className="tabular-nums">{formatMoney(activeInvoice.cgstPaise)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">SGST (State Tax):</span>
                      <span className="tabular-nums">{formatMoney(activeInvoice.sgstPaise)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-slate-500">IGST (Integrated Tax):</span>
                    <span className="tabular-nums">{formatMoney(activeInvoice.igstPaise)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-1 font-bold text-sm text-navy-900">
                  <span>Grand Total (Incl. GST):</span>
                  <span className="tabular-nums text-primary">{formatMoney(activeInvoice.grandTotalPaise)}</span>
                </div>
              </div>
            </div>

            {/* Amount in words */}
            <div className="bg-slate-50 p-2.5 rounded text-[11px] text-slate-700 italic border">
              <strong>Amount in Words:</strong> {amountInWords(activeInvoice.grandTotalPaise)}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button variant="secondary" onClick={() => window.print()}>
                Print Official Invoice
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  toast.success(`Invoice copy dispatched to ${activeInvoice.customerPhone} on WhatsApp`);
                  setPrintModalOpen(false);
                }}
              >
                Send via WhatsApp
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 80mm POS Thermal Receipt Modal */}
      <Modal
        isOpen={thermalModalOpen}
        onClose={() => setThermalModalOpen(false)}
        title={activeInvoice ? `80mm POS Receipt: ${activeInvoice.invoiceNumber}` : ''}
        size="sm"
      >
        {activeInvoice && (
          <div className="p-4 bg-white text-slate-900 border rounded font-mono text-[11px] space-y-2 max-w-[280px] mx-auto shadow-sm">
            <div className="text-center border-b pb-2">
              <div className="font-bold text-xs">{state.dealership.name}</div>
              <div className="text-[10px]">Hosur Main Rd, Koramangala</div>
              <div className="text-[9px]">GSTIN: {state.dealership.gstin}</div>
            </div>

            <div className="text-[10px] space-y-0.5">
              <div>INV: {activeInvoice.invoiceNumber}</div>
              <div>DATE: {formatDate(activeInvoice.date)}</div>
              <div>CUST: {activeInvoice.customerName}</div>
            </div>

            <div className="border-t border-b py-1.5 my-1 space-y-1">
              {activeInvoice.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-[10px]">
                  <span className="truncate max-w-[160px]">{item.description.slice(0, 22)}</span>
                  <span className="tabular-nums">{formatMoney(item.lineTotalPaise)}</span>
                </div>
              ))}
            </div>

            <div className="text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span>TAXABLE:</span>
                <span>{formatMoney(activeInvoice.taxableAmountPaise)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST:</span>
                <span>{formatMoney(activeInvoice.totalTaxPaise)}</span>
              </div>
              <div className="flex justify-between font-bold text-xs pt-1 border-t">
                <span>NET TOTAL:</span>
                <span>{formatMoney(activeInvoice.grandTotalPaise)}</span>
              </div>
            </div>

            <div className="text-center pt-2 border-t text-[9px] text-slate-500">
              <div>THANK YOU FOR VISITING!</div>
              <div>RIDE SAFE • WEAR HELMET</div>
            </div>

            <div className="flex justify-center pt-2">
              <Button size="sm" variant="secondary" onClick={() => window.print()}>
                Print 80mm Slip
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
