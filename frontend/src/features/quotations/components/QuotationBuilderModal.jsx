import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2, ShieldAlert, Calculator, Sparkles } from 'lucide-react';
import { calculateOnRoadPrice } from '../../../lib/onRoadPrice';
import { calculateEmi } from '../../../lib/emi';
import { QUOTATION_STATUSES } from '../../../quotations/config';
import { toast } from 'sonner';

export function QuotationBuilderModal({
  isOpen,
  onClose,
  initialData = null,
  leadPrefill = null,
  bikes = [],
  branches = [],
  currentUser = {},
  onSave,
}) {
  if (!isOpen) return null;

  const activeBranchId = currentUser?.branchId || branches[0]?.id || 'br-blr-central';

  // Customer Form State
  const [customerName, setCustomerName] = useState(
    initialData?.customerName || leadPrefill?.name || 'Sanjay Reddy'
  );
  const [customerPhone, setCustomerPhone] = useState(
    initialData?.phone || leadPrefill?.phone || '+91 99450 67124'
  );
  const [customerEmail, setCustomerEmail] = useState(
    initialData?.email || leadPrefill?.email || 'sanjay.reddy@gmail.com'
  );
  const [branchId, setBranchId] = useState(initialData?.branchId || activeBranchId);

  // Vehicle Selection
  const defaultBike = bikes.find((b) => b.id === initialData?.modelId) || bikes[0] || {};
  const [selectedBikeId, setSelectedBikeId] = useState(defaultBike.id || '');
  const selectedBike = bikes.find((b) => b.id === selectedBikeId) || defaultBike;

  const defaultVariant =
    selectedBike.variants?.find((v) => v.id === initialData?.variantId) ||
    selectedBike.variants?.[0] ||
    {};
  const [selectedVariantId, setSelectedVariantId] = useState(defaultVariant.id || '');
  const selectedVariant =
    selectedBike.variants?.find((v) => v.id === selectedVariantId) || defaultVariant;

  const defaultColor =
    selectedBike.colors?.find((c) => c.name === initialData?.colorName) ||
    selectedBike.colors?.[0] ||
    { name: 'Default', hex: '#64748b' };
  const [selectedColor, setSelectedColor] = useState(defaultColor.name);

  // Accessories Checklist
  const availableAccessories = [
    { id: 'acc-1', name: 'Engine Crash Guard', pricePaise: 385000 },
    { id: 'acc-2', name: 'Touring Seat with Gel Cushion', pricePaise: 450000 },
    { id: 'acc-3', name: 'All-Weather Bike Body Cover', pricePaise: 185000 },
    { id: 'acc-4', name: 'Machined Bar-End Mirrors', pricePaise: 520000 },
  ];
  const [selectedAccIds, setSelectedAccIds] = useState(
    initialData?.accessories?.map((a) => a.id) || ['acc-1']
  );

  // Discount & Schemes
  const [discountRupees, setDiscountRupees] = useState(
    initialData ? Math.round((initialData.discountPaise || 0) / 100) : 5000
  );
  const [discountReason, setDiscountReason] = useState(
    initialData?.discountReason || 'Customer comparing with competing showroom'
  );

  // EMI state
  const [emiDownPaymentRupees, setEmiDownPaymentRupees] = useState(40000);
  const [emiTenureMonths, setEmiTenureMonths] = useState(36);
  const [emiRate, setEmiRate] = useState(10.5);

  const selectedAccessories = availableAccessories.filter((a) => selectedAccIds.includes(a.id));
  const accessoriesTotalPaise = selectedAccessories.reduce((sum, a) => sum + a.pricePaise, 0);

  // Dynamic on-road calculation
  const pricing = useMemo(() => {
    const baseExShowroom = (selectedBike.exShowroomPaise || 16990000) + (selectedVariant?.priceDiffPaise || 0);
    const discountPaise = Number(discountRupees || 0) * 100;

    return calculateOnRoadPrice({
      exShowroomPaise: baseExShowroom,
      displacementCc: selectedBike.displacementCc || 350,
      fuelType: selectedBike.fuelType || 'PETROL',
      selectedAccessories,
      applicableOffers: [],
      approvedDiscountPaise: discountPaise,
    });
  }, [selectedBike, selectedVariant, selectedAccessories, discountRupees]);

  const roadTaxPaise = pricing.roadTaxPaise ?? pricing.taxBreakdown?.roadTaxPaise ?? 0;
  const rtoFeePaise = pricing.rtoFeePaise ?? pricing.taxBreakdown?.registrationFeePaise ?? 0;
  const insurancePaise = pricing.insurancePaise ?? pricing.insuranceBreakdown?.totalPaise ?? 0;
  const handlingPaise = pricing.handlingPaise ?? pricing.otherCharges?.handlingFeePaise ?? 0;
  const statutoryPaise = pricing.statutoryTotalPaise ?? (roadTaxPaise + rtoFeePaise + insurancePaise + handlingPaise);
  const grossShowroomPaise = pricing.grossTotalPaise ?? ((selectedBike.exShowroomPaise || 16990000) + (selectedVariant?.priceDiffPaise || 0) + accessoriesTotalPaise);

  // EMI computation
  const loanPrincipalPaise = Math.max(0, pricing.netOnRoadPricePaise - Number(emiDownPaymentRupees) * 100);
  const emiDetails = calculateEmi({
    principalPaise: loanPrincipalPaise,
    annualInterestRatePercent: Number(emiRate),
    tenureMonths: Number(emiTenureMonths),
  });

  // Dual-control threshold check: Executive limit is ₹ 2,000 (200000 paise)
  const isExecutive = currentUser?.role === 'Sales Executive';
  const requiresDualControl = Number(discountRupees) > 2000;

  const toggleAccessory = (accId) => {
    setSelectedAccIds((prev) =>
      prev.includes(accId) ? prev.filter((id) => id !== accId) : [...prev, accId]
    );
  };

  const handleFormSubmit = (statusIntent) => {
    if (!customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }
    if (!customerPhone.trim()) {
      toast.error('Customer phone is required');
      return;
    }

    const selectedColorObj = selectedBike.colors?.find((c) => c.name === selectedColor) || defaultColor;
    const branchObj = branches.find((b) => b.id === branchId) || branches[0] || {};

    let finalStatus = statusIntent;
    if (requiresDualControl && statusIntent !== QUOTATION_STATUSES.DRAFT) {
      finalStatus = QUOTATION_STATUSES.PENDING_APPROVAL;
    }

    const quotationPayload = {
      id: initialData?.id || `qt-${Date.now()}`,
      quotationNumber: initialData?.quotationNumber || `QT/2627/${String(Math.floor(Math.random() * 90000) + 10000)}`,
      leadId: initialData?.leadId || leadPrefill?.id || null,
      customerId: initialData?.customerId || `cust-${Date.now()}`,
      customerName,
      phone: customerPhone,
      email: customerEmail,
      branchId: branchObj.id,
      branchName: branchObj.name,
      salespersonId: currentUser?.id || 'usr-007',
      salespersonName: currentUser?.name || 'Deepak Rao',
      createdBy: initialData?.createdBy || currentUser?.name || 'Deepak Rao',
      createdAt: initialData?.createdAt || new Date().toISOString(),
      validUntil: initialData?.validUntil || new Date(Date.now() + 7 * 86400000).toISOString(),
      status: finalStatus,
      modelId: selectedBike.id,
      modelName: selectedBike.brand ? `${selectedBike.brand} ${selectedBike.model || selectedBike.name}` : selectedBike.name,
      variantId: selectedVariant.id,
      variantName: selectedVariant.name,
      colorName: selectedColorObj.name,
      colorHex: selectedColorObj.hex,
      exShowroomPaise: (selectedBike.exShowroomPaise || 16990000) + (selectedVariant?.priceDiffPaise || 0),
      accessoriesPaise: accessoriesTotalPaise,
      accessories: selectedAccessories,
      amountPaise: (selectedBike.exShowroomPaise || 16990000) + (selectedVariant?.priceDiffPaise || 0) + accessoriesTotalPaise,
      roadTaxPaise,
      rtoFeePaise,
      insurancePaise,
      handlingPaise,
      taxesAndStatutoryPaise: statutoryPaise,
      discountPaise: Number(discountRupees || 0) * 100,
      discountPercent: grossShowroomPaise > 0 ? Math.round(((Number(discountRupees || 0) * 100) / grossShowroomPaise) * 1000) / 10 : 0,
      discountStatus: requiresDualControl ? 'PENDING_APPROVAL' : 'APPROVED',
      discountReason: discountReason || 'Showroom seasonal incentive',
      approvalRequestId: requiresDualControl ? `APR-2026-${String(Math.floor(Math.random() * 9000) + 1000)}` : null,
      netAmountPaise: pricing.netOnRoadPricePaise,
      netOnRoadPricePaise: pricing.netOnRoadPricePaise,
      bookingId: initialData?.bookingId || null,
      revision: initialData?.revision || 1,
      history: [
        ...(initialData?.history || []),
        {
          timestamp: new Date().toISOString(),
          action: initialData ? 'QUOTATION_EDITED' : 'QUOTATION_CREATED',
          performedBy: currentUser?.name || 'Deepak Rao',
          notes: requiresDualControl
            ? `Special discount of ₹ ${Number(discountRupees).toLocaleString('en-IN')} submitted for Dual-Control approval`
            : `Quotation finalized with On-Road price ₹ ${Math.round(pricing.netOnRoadPricePaise / 100).toLocaleString('en-IN')}`,
        },
      ],
    };

    onSave(quotationPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {initialData ? `Edit Quotation ${initialData.quotationNumber}` : 'New Vehicle Quotation Builder'}
            </h2>
            <p className="text-xs text-slate-500">
              Dynamic Karnataka statutory pricing, accessory fitments & dual-control validation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Section 1: Customer & Branch */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b border-slate-100 pb-1">
              1. Customer Information & Branch Scope
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Customer Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Mobile Phone *</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Showroom Branch</label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Bike Model, Variant & Color */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b border-slate-100 pb-1">
              2. Vehicle Selection
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Bike Model</label>
                <select
                  value={selectedBikeId}
                  onChange={(e) => {
                    setSelectedBikeId(e.target.value);
                    const b = bikes.find((bike) => bike.id === e.target.value);
                    if (b?.variants?.[0]) setSelectedVariantId(b.variants[0].id);
                    if (b?.colors?.[0]) setSelectedColor(b.colors[0].name);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white"
                >
                  {bikes.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.brand ? `${b.brand} ${b.model || b.name}` : b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Trim / Variant</label>
                <select
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white"
                >
                  {(selectedBike.variants || []).map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} {v.priceDiffPaise ? `(+₹ ${(v.priceDiffPaise / 100).toLocaleString('en-IN')})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Color Shade</label>
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white"
                >
                  {(selectedBike.colors || []).map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Accessories Checklist */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b border-slate-100 pb-1">
              3. Genuine Accessories Fitment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableAccessories.map((acc) => {
                const checked = selectedAccIds.includes(acc.id);
                return (
                  <label
                    key={acc.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      checked ? 'bg-blue-50/70 border-blue-300 text-blue-900' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAccessory(acc.id)}
                        className="rounded text-blue-600 border-slate-300 w-4 h-4"
                      />
                      <span className="font-medium">{acc.name}</span>
                    </div>
                    <span className="font-bold font-mono">₹ {(acc.pricePaise / 100).toLocaleString('en-IN')}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 4: Discount & Schemes */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b border-slate-100 pb-1">
              4. Commercial Discounts & Dual-Control Rule
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Approved Discount / Manager Scheme (₹)
                </label>
                <input
                  type="number"
                  step="500"
                  min="0"
                  value={discountRupees}
                  onChange={(e) => setDiscountRupees(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Justification Reason</label>
                <input
                  type="text"
                  value={discountReason}
                  onChange={(e) => setDiscountReason(e.target.value)}
                  placeholder="e.g. Price match vs competitor, corporate scheme"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white"
                />
              </div>
            </div>

            {requiresDualControl && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-bold">Dual-Control Approval Notice: </span>
                  Special discount ₹ {Number(discountRupees).toLocaleString('en-IN')} exceeds the Sales Executive self-approval threshold (₹ 2,000). Upon submission, this quotation will be locked in{' '}
                  <span className="font-semibold text-amber-950">Pending Approval</span> status until authorized by a Sales Manager or Branch Manager.
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Live Pricing Summary & EMI */}
          <div className="bg-slate-900 text-white p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-xs uppercase tracking-wider text-blue-300">
                Live Dynamic Calculation
              </span>
              <span className="text-[11px] text-slate-400">18% KA LTT + IRDAI Ins. + RTO</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Gross Showroom</span>
                <span className="font-bold">₹ {Math.round(grossShowroomPaise / 100).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Total Discount</span>
                <span className="font-bold text-emerald-400">- ₹ {Number(discountRupees).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Statutory & RTO</span>
                <span className="font-bold">₹ {Math.round(statutoryPaise / 100).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-blue-300 block text-[10px] font-bold">Net On-Road Price</span>
                <span className="text-sm font-extrabold text-blue-400">₹ {Math.round(pricing.netOnRoadPricePaise / 100).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Quick EMI strip */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-blue-400" />
                <span>Est. EMI (@ 10.5% for 36 mos, ₹ 40k down):</span>
              </div>
              <span className="font-extrabold text-white text-xs">
                ₹ {Math.round(emiDetails.monthlyEmiPaise / 100).toLocaleString('en-IN')} / month
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => handleFormSubmit(QUOTATION_STATUSES.DRAFT)}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs"
          >
            Save as Draft
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-200 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              onClick={() => handleFormSubmit(QUOTATION_STATUSES.APPROVED)}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{requiresDualControl ? 'Submit for Approval' : 'Finalize & Create Quotation'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

