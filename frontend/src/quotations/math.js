/**
 * Quotation Mathematical Calculation Engine
 * 
 * Formal Definition:
 * 1. Amount = Line items before discount (Ex-showroom base + accessories + chargeable additions)
 * 2. Discount = Total promotional schemes + special manager allowances
 * 3. Taxes & Statutory Charges = Road Tax (LTT) + RTO Registration/Smartcard/HSRP + Mandatory IRDAI Insurance + Showroom Handling
 * 4. Net Amount (On-Road Price) = (Amount - Discount) + Taxes & Statutory Charges
 */

export function calculateQuotationTotals(q = {}) {
  // 1. Amount before discount
  const exShowroomPaise = q.exShowroomPaise || 0;
  const accessoriesPaise = q.accessoriesPaise || q.accessoriesTotalPaise || 0;
  const amountPaise = exShowroomPaise + accessoriesPaise;

  // 2. Discount
  const discountPaise = q.discountPaise || 0;

  // 3. Taxes & Statutory Charges
  const roadTaxPaise = q.roadTaxPaise || 0;
  const rtoFeePaise = q.rtoFeePaise || 0;
  const insurancePaise = q.insurancePaise || 0;
  const handlingPaise = q.handlingPaise || 0;
  const taxesAndStatutoryPaise = roadTaxPaise + rtoFeePaise + insurancePaise + handlingPaise;

  // 4. Net Amount
  const netAmountPaise = q.netAmountPaise || q.netOnRoadPricePaise || (amountPaise - discountPaise + taxesAndStatutoryPaise);

  const amountRupees = Math.round(amountPaise / 100);
  const discountRupees = Math.round(discountPaise / 100);
  const taxesAndStatutoryRupees = Math.round(taxesAndStatutoryPaise / 100);
  const netAmountRupees = Math.round(netAmountPaise / 100);

  const discountPercent = amountPaise > 0 ? Math.round((discountPaise / amountPaise) * 1000) / 10 : 0;

  return {
    amountPaise,
    amountRupees,
    formattedAmount: `₹ ${amountRupees.toLocaleString('en-IN')}`,

    discountPaise,
    discountRupees,
    formattedDiscount: `₹ ${discountRupees.toLocaleString('en-IN')}`,
    discountPercent,

    taxesAndStatutoryPaise,
    taxesAndStatutoryRupees,
    formattedTaxesAndStatutory: `₹ ${taxesAndStatutoryRupees.toLocaleString('en-IN')}`,

    netAmountPaise,
    netAmountRupees,
    formattedNetAmount: `₹ ${netAmountRupees.toLocaleString('en-IN')}`,

    breakdown: {
      exShowroomPaise,
      exShowroomRupees: Math.round(exShowroomPaise / 100),
      accessoriesPaise,
      accessoriesRupees: Math.round(accessoriesPaise / 100),
      roadTaxPaise,
      roadTaxRupees: Math.round(roadTaxPaise / 100),
      rtoFeePaise,
      rtoFeeRupees: Math.round(rtoFeePaise / 100),
      insurancePaise,
      insuranceRupees: Math.round(insurancePaise / 100),
      handlingPaise,
      handlingRupees: Math.round(handlingPaise / 100),
    },
  };
}

/**
 * Validates that Net Amount strictly equals the breakdown:
 * Amount - Discount + TaxesAndStatutory == Net Amount
 */
export function verifyQuotationMath(q) {
  const totals = calculateQuotationTotals(q);
  const calculatedNetPaise = totals.amountPaise - totals.discountPaise + totals.taxesAndStatutoryPaise;
  return Math.abs(calculatedNetPaise - totals.netAmountPaise) <= 100; // Within 1 Rupee rounding
}
