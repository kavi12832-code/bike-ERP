import React, { useState } from 'react';
import { X, MessageSquare, Send, Check } from 'lucide-react';
import { calculateQuotationTotals } from '../../../quotations/math';
import { toast } from 'sonner';

export function WhatsAppShareModal({ isOpen, onClose, quotation, onSend }) {
  if (!isOpen || !quotation) return null;

  const totals = calculateQuotationTotals(quotation);
  const [includePdfLink, setIncludePdfLink] = useState(true);

  const messageText = `Namaste *${quotation.customerName}*! 🙏

Greetings from *Akash Bajaj — Bangalore Central Flagship*.

Thank you for visiting us. Here is your official On-Road Price Quotation:

🏍️ *Vehicle:* ${quotation.modelName} (${quotation.variantName || 'Standard'})
🎨 *Colour:* ${quotation.colorName}
💰 *Ex-Showroom:* ₹ ${totals.breakdown.exShowroomRupees.toLocaleString('en-IN')}
${totals.discountRupees > 0 ? `🎁 *Special Festival Discount:* - ₹ ${totals.discountRupees.toLocaleString('en-IN')}\n` : ''}🏛️ *Road Tax & RTO:* ₹ ${(totals.breakdown.roadTaxRupees + totals.breakdown.rtoFeeRupees).toLocaleString('en-IN')}
🛡️ *Comprehensive 5-Yr Insurance:* ₹ ${totals.breakdown.insuranceRupees.toLocaleString('en-IN')}
-------------------------------------
✨ *Total On-Road Price:* *₹ ${totals.netAmountRupees.toLocaleString('en-IN')}*

⏳ *Price Lock Validity:* Through ${new Date(quotation.validUntil).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
${includePdfLink ? `\n📄 *Download Digital PDF:* https://akashbajaj.erp/q/${quotation.quotationNumber}\n` : ''}
To book your bike or schedule a doorstep test ride, simply reply to this message!

Warm regards,
*${quotation.salespersonName || 'Akash Bajaj Team'}*
📞 +91 80 4912 8800`;

  const handleSend = () => {
    onSend(quotation.id, messageText);
    toast.success(`Quotation ${quotation.quotationNumber} sent to ${quotation.customerName} via WhatsApp`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden text-xs text-slate-700">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-emerald-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <span>Share Quotation via WhatsApp</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-400 block text-[10px]">Recipient</span>
              <span className="font-bold text-slate-900">{quotation.customerName}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">WhatsApp Number</span>
              <span className="font-mono font-bold text-emerald-700">{quotation.phone}</span>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Message Preview</label>
            <div className="p-3 bg-emerald-50/40 border border-emerald-200 rounded-xl font-mono text-[11px] leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto text-slate-800">
              {messageText}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
            <input
              type="checkbox"
              checked={includePdfLink}
              onChange={(e) => setIncludePdfLink(e.target.checked)}
              className="rounded text-emerald-600 border-slate-300"
            />
            <span>Include secure download link for official signed PDF quotation</span>
          </label>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-200 font-medium text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow"
          >
            <Send className="w-4 h-4" />
            <span>Send to Customer</span>
          </button>
        </div>
      </div>
    </div>
  );
}

