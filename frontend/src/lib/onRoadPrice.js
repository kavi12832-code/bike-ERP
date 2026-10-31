/**
 * On-Road Price Computation Engine
 * Every breakdown line carries the explicit statutory/dealership rule reference.
 */

export function calculateOnRoadPrice({
  exShowroomPaise,
  displacementCc = 349,
  fuelType = 'PETROL',
  selectedAccessories = [],
  applicableOffers = [],
  approvedDiscountPaise = 0,
  rtoState = 'KA',
}) {
  if (exShowroomPaise == null || isNaN(exShowroomPaise)) {
    throw new Error('Ex-showroom price must be specified');
  }

  const lines = [];

  // 1. Ex-showroom base (includes GST)
  lines.push({
    code: 'EX_SHOWROOM',
    label: 'Ex-Showroom Price (Incl. GST)',
    amountPaise: exShowroomPaise,
    ruleUsed: 'OEM Master Price List FY 2026-27 (Effective Oct 2026)',
    isDeduction: false,
  });

  // 2. Road Tax / Life Time Tax (LTT)
  let roadTaxPercent = 0;
  let roadTaxRule = '';
  if (fuelType === 'EV') {
    roadTaxPercent = 0;
    roadTaxRule = 'Karnataka EV Policy: 100% Road Tax Exemption';
  } else if (exShowroomPaise <= 10000000) {
    // Up to 1 Lakh ex-showroom
    roadTaxPercent = 12.0;
    roadTaxRule = 'Karnataka Motor Vehicles Taxation Act: 12% LTT for <= ₹1,00,000';
  } else {
    // Above 1 Lakh ex-showroom
    roadTaxPercent = 18.0;
    roadTaxRule = 'Karnataka Motor Vehicles Taxation Act: 18% LTT for > ₹1,00,000';
  }

  const roadTaxPaise = Math.round((exShowroomPaise * roadTaxPercent) / 100);
  lines.push({
    code: 'ROAD_TAX',
    label: `Road Tax (LTT ${roadTaxPercent}%)`,
    amountPaise: roadTaxPaise,
    ruleUsed: roadTaxRule,
    isDeduction: false,
  });

  // 3. RTO Registration & Smart Card & Postal fee
  const rtoFeePaise = 145000; // ₹1,450
  lines.push({
    code: 'RTO_REGISTRATION',
    label: 'RTO Registration, Smart Card & HSRP',
    amountPaise: rtoFeePaise,
    ruleUsed: 'Central Motor Vehicles Rules 1989 & KA Transport Dept Tariff',
    isDeduction: false,
  });

  // 4. Comprehensive Insurance (1-Yr OD + 5-Yr Mandatory Third Party)
  let insurancePaise = 750000;
  let insuranceRule = 'IRDAI Tariff: 1-Yr Own Damage + 5-Yr Third Party Cover';
  if (fuelType === 'EV') {
    insurancePaise = 520000; // ₹5,200
    insuranceRule = 'IRDAI EV Concessional Tier: 1-Yr OD + 5-Yr TP';
  } else if (displacementCc <= 150) {
    insurancePaise = 680000; // ₹6,800
    insuranceRule = 'IRDAI Tier 1 (< 150cc): 1-Yr OD + 5-Yr TP';
  } else if (displacementCc <= 350) {
    insurancePaise = 980000; // ₹9,800
    insuranceRule = 'IRDAI Tier 2 (151cc - 350cc): 1-Yr OD + 5-Yr TP';
  } else {
    insurancePaise = 1550000; // ₹15,500
    insuranceRule = 'IRDAI Tier 3 (> 350cc Superbike): 1-Yr OD + 5-Yr TP';
  }

  lines.push({
    code: 'INSURANCE',
    label: 'Insurance (1-Yr OD + 5-Yr TP)',
    amountPaise: insurancePaise,
    ruleUsed: insuranceRule,
    isDeduction: false,
  });

  // 5. Handling & Logistics (PDI, Transport to Showroom)
  const handlingPaise = 150000; // ₹1,500
  lines.push({
    code: 'HANDLING',
    label: 'Showroom Handling, PDI & Transit Facilitation',
    amountPaise: handlingPaise,
    ruleUsed: 'Dealership Operations Standard Schedule',
    isDeduction: false,
  });

  // 6. Accessories fitted
  const accessoriesTotalPaise = selectedAccessories.reduce((sum, item) => sum + (item.pricePaise || 0), 0);
  if (accessoriesTotalPaise > 0) {
    lines.push({
      code: 'ACCESSORIES',
      label: `Genuine Accessories (${selectedAccessories.length} items)`,
      amountPaise: accessoriesTotalPaise,
      ruleUsed: 'OEM Accessory Catalog & Labour tariff',
      isDeduction: false,
      items: selectedAccessories,
    });
  }

  // 7. Deductions: Automatic Promotional Offers
  let totalOffersPaise = 0;
  applicableOffers.forEach((offer) => {
    const offerPaise = offer.discountPaise || 0;
    totalOffersPaise += offerPaise;
    lines.push({
      code: `OFFER_${offer.id}`,
      label: `Offer: ${offer.title}`,
      amountPaise: offerPaise,
      ruleUsed: `Campaign #${offer.code}: ${offer.ruleDesc || 'Dealer Scheme'}`,
      isDeduction: true,
    });
  });

  // 8. Deductions: Approved Discount
  if (approvedDiscountPaise > 0) {
    lines.push({
      code: 'APPROVED_DISCOUNT',
      label: 'Special Dealership Discount (Approved)',
      amountPaise: approvedDiscountPaise,
      ruleUsed: 'Authorized Management Concession (Level-2 Gate)',
      isDeduction: true,
    });
  }

  // Calculate Net On-Road
  const totalAdditions = lines
    .filter((l) => !l.isDeduction)
    .reduce((sum, l) => sum + l.amountPaise, 0);

  const totalDeductions = lines
    .filter((l) => l.isDeduction)
    .reduce((sum, l) => sum + l.amountPaise, 0);

  const netOnRoadPricePaise = Math.max(0, totalAdditions - totalDeductions);
  const grossTotalPaise = (exShowroomPaise || 0) + (accessoriesTotalPaise || 0);
  const statutoryTotalPaise =
    (roadTaxPaise || 0) + (rtoFeePaise || 0) + (insurancePaise || 0) + (handlingPaise || 0);

  return {
    lines,
    exShowroomPaise,
    roadTaxPaise,
    rtoFeePaise,
    insurancePaise,
    handlingPaise,
    accessoriesTotalPaise,
    totalOffersPaise,
    approvedDiscountPaise,
    totalAdditionsPaise: totalAdditions,
    totalDeductionsPaise: totalDeductions,
    netOnRoadPricePaise,
    grossTotalPaise,
    statutoryTotalPaise,
    taxBreakdown: {
      roadTaxPaise,
      registrationFeePaise: rtoFeePaise,
      rtoFeePaise,
    },
    insuranceBreakdown: {
      totalPaise: insurancePaise,
    },
    otherCharges: {
      handlingFeePaise: handlingPaise,
    },
  };
}
