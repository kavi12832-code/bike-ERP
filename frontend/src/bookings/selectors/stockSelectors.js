/**
 * Pure Selector for Vehicle Stock Availability Gate
 */
export function getStockAvailability(vehicleStock = [], criteria = {}) {
  const { modelId = '', variantId = '', colorName = '', branchId = '' } = criteria;

  const matching = vehicleStock.filter((unit) => {
    if (modelId && unit.modelId !== modelId) return false;
    if (variantId && unit.variantId !== variantId) return false;
    if (colorName && unit.colorName !== colorName) return false;
    if (branchId && branchId !== 'all' && unit.branchId !== branchId) return false;
    return true;
  });

  const inStockUnits = matching.filter((u) => u.status === 'IN_STOCK');
  const heldUnits = matching.filter((u) => u.status === 'HELD');
  const allocatedUnits = matching.filter((u) => u.status === 'ALLOCATED');
  const deliveredUnits = matching.filter((u) => u.status === 'DELIVERED');

  // Available to allocate = IN_STOCK (not held, not allocated, not delivered)
  const availableToAllocate = inStockUnits.sort((a, b) => (b.daysInStock || 0) - (a.daysInStock || 0));

  return {
    totalMatching: matching.length,
    inStockCount: inStockUnits.length,
    heldCount: heldUnits.length,
    allocatedCount: allocatedUnits.length,
    deliveredCount: deliveredUnits.length,
    availableToAllocateCount: availableToAllocate.length,
    availableUnits: availableToAllocate,
  };
}

