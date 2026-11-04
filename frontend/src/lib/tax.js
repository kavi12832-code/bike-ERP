// Tax rules are effective-dated reference data maintained in the database (catalog.taxRules).
// The store registers a provider at start-up so this module stays free of store imports.
let taxRulesProvider = () => [];
export function setTaxRulesProvider(provider) {
  taxRulesProvider = provider;
}
import { TAX_CONSTANTS } from '../config/constants';

/**
 * Finds applicable tax rule from effective-dated rules catalog
 * Throws explicit calculation error if missing rule
 */
export function findTaxRule({
  category,
  fuelType = 'PETROL',
  displacementCc = 0,
  hsn = null,
  sac = null,
  effectiveDate = new Date(),
  customRules = null,
}) {
  const rules = customRules || taxRulesProvider() || [];
  const dateStr = effectiveDate instanceof Date ? effectiveDate.toISOString().slice(0, 10) : String(effectiveDate).slice(0, 10);

  const matched = rules.find((rule) => {
    // Check active date window
    if (rule.effectiveFrom && rule.effectiveFrom > dateStr) return false;
    if (rule.effectiveTo && rule.effectiveTo < dateStr) return false;

    if (rule.category !== category) return false;

    if (category === 'VEHICLE') {
      const ruleFuel = rule.fuelType.toUpperCase();
      const itemFuel = (fuelType || 'PETROL').toUpperCase();
      if (ruleFuel !== itemFuel && ruleFuel !== 'ALL') return false;

      if (itemFuel === 'PETROL') {
        const cc = Number(displacementCc) || 0;
        if (cc < rule.minCc || cc > rule.maxCc) return false;
      }
      return true;
    }

    if (category === 'LABOUR') {
      if (sac && rule.sac && rule.sac !== sac) return false;
      return true;
    }

    if (category === 'PARTS') {
      if (hsn && rule.hsn && rule.hsn !== hsn) {
        // Fallback to default parts rule if specific HSN not explicitly found
        return rule.hsn === '8714';
      }
      return true;
    }

    return false;
  });

  if (!matched) {
    throw new Error(
      `GST Tax Rule Missing for Category: ${category}, Fuel: ${fuelType}, CC: ${displacementCc}, HSN/SAC: ${hsn || sac}. CA Confirmation required.`
    );
  }

  return matched;
}

/**
 * Computes GST split (CGST + SGST for intra-state Karnataka 29, or IGST for inter-state)
 * Implements half-up integer paise rounding per line
 */
export function computeLineTax({
  taxableAmountPaise,
  taxRule,
  buyerStateCode = '29',
  sellerStateCode = TAX_CONSTANTS.HOME_STATE_CODE,
}) {
  if (taxableAmountPaise == null || isNaN(taxableAmountPaise)) {
    throw new Error('Invalid taxable amount for tax computation');
  }

  if (!taxRule) {
    throw new Error('Tax rule must be provided. Cannot default silently.');
  }

  const isIntraState = String(buyerStateCode).padStart(2, '0') === String(sellerStateCode).padStart(2, '0');
  const gstRate = Number(taxRule.gstRatePercent);

  let cgstRate = 0;
  let sgstRate = 0;
  let igstRate = 0;
  let cgstPaise = 0;
  let sgstPaise = 0;
  let igstPaise = 0;

  if (isIntraState) {
    cgstRate = gstRate / 2;
    sgstRate = gstRate / 2;
    cgstPaise = Math.round((taxableAmountPaise * cgstRate) / 100);
    sgstPaise = Math.round((taxableAmountPaise * sgstRate) / 100);
  } else {
    igstRate = gstRate;
    igstPaise = Math.round((taxableAmountPaise * igstRate) / 100);
  }

  const totalTaxPaise = cgstPaise + sgstPaise + igstPaise;
  const grossAmountPaise = taxableAmountPaise + totalTaxPaise;

  return {
    taxableAmountPaise,
    gstRatePercent: gstRate,
    isIntraState,
    cgstRatePercent: cgstRate,
    sgstRatePercent: sgstRate,
    igstRatePercent: igstRate,
    cgstPaise,
    sgstPaise,
    igstPaise,
    totalTaxPaise,
    grossAmountPaise,
    ruleId: taxRule.id,
    hsnSac: taxRule.hsn || taxRule.sac,
    complianceNote: taxRule.complianceNote,
  };
}

/**
 * Computes full invoice tax breakdown with statutory round-off line
 */
export function computeInvoiceTaxTotals(lineItems, { buyerStateCode = '29', sellerStateCode = '29' } = {}) {
  let totalTaxablePaise = 0;
  let totalCgstPaise = 0;
  let totalSgstPaise = 0;
  let totalIgstPaise = 0;
  let totalTaxPaise = 0;

  const processedLines = lineItems.map((item) => {
    const lineTax = computeLineTax({
      taxableAmountPaise: item.taxableAmountPaise,
      taxRule: item.taxRule,
      buyerStateCode,
      sellerStateCode,
    });

    totalTaxablePaise += lineTax.taxableAmountPaise;
    totalCgstPaise += lineTax.cgstPaise;
    totalSgstPaise += lineTax.sgstPaise;
    totalIgstPaise += lineTax.igstPaise;
    totalTaxPaise += lineTax.totalTaxPaise;

    return {
      ...item,
      tax: lineTax,
      lineTotalPaise: lineTax.grossAmountPaise,
    };
  });

  const unroundedGrandTotalPaise = totalTaxablePaise + totalTaxPaise;
  // Round off to the nearest full rupee (multiple of 100 paise)
  const grandTotalPaise = Math.round(unroundedGrandTotalPaise / 100) * 100;
  const roundOffPaise = grandTotalPaise - unroundedGrandTotalPaise;

  return {
    lines: processedLines,
    totalTaxablePaise,
    totalCgstPaise,
    totalSgstPaise,
    totalIgstPaise,
    totalTaxPaise,
    unroundedGrandTotalPaise,
    roundOffPaise,
    grandTotalPaise,
    buyerStateCode,
    sellerStateCode,
  };
}
