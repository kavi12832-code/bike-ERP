/**
 * Unified Bay Statistics Selector
 * Invariant: occupied + readyForDelivery + waitingParts + qualityCheck + available === total
 * Categories are mutually exclusive and ALWAYS sum to total.
 * Utilisation = Math.round((occupied / total) * 100)
 */

export function selectBayStats(state, branchId = null) {
  const allBays = state?.bays || [];
  const targetBranch = branchId || state?.activeBranchId;
  const filtered = targetBranch && targetBranch !== 'all'
    ? allBays.filter((b) => !b.branchId || b.branchId === targetBranch)
    : allBays;
  const bays = filtered.length > 0 ? filtered : allBays;
  const jobCards = state?.jobCards || [];

  let occupied = 0;
  let readyForDelivery = 0;
  let waitingParts = 0;
  let qualityCheck = 0;
  let available = 0;

  bays.forEach((bay) => {
    // If bay is in maintenance or free with no active job card assigned
    if (!bay.activeJobCardId || bay.status === 'FREE' || bay.status === 'MAINTENANCE') {
      available++;
      return;
    }

    const linkedJob = jobCards.find((j) => j.id === bay.activeJobCardId);
    const stage = linkedJob ? (linkedJob.stage || '').toUpperCase() : '';

    if (stage === 'READY' || stage === 'READY_FOR_DELIVERY') {
      readyForDelivery++;
    } else if (stage === 'WAITING_PARTS') {
      waitingParts++;
    } else if (stage === 'QUALITY_CHECK' || stage === 'QC') {
      qualityCheck++;
    } else if (stage === 'IN_PROGRESS' || bay.status === 'OCCUPIED') {
      occupied++;
    } else {
      available++;
    }
  });

  const total = bays.length;
  const utilisation = total > 0 ? Math.round((occupied / total) * 100) : 0;

  return {
    total,
    occupied,
    readyForDelivery,
    waitingParts,
    qualityCheck,
    available,
    utilisation,
  };
}
