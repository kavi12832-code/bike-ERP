import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../../store';
import { selectBayStats } from '../../../store/selectors/bayStats';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { PageHeader } from '../../../components/ui/PageHeader';
import { KpiCard } from '../../../components/ui/KpiCard';
import {
  Wrench,
  Clock,
  AlertTriangle,
  User,
  CheckCircle,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export function LiveBaysPage() {
  const state = useAppStore();
  const bays = state.bays || [];
  const releaseBay = state.releaseBay;
  const currentUser = state.currentUser;
  const stats = selectBayStats(state);

  // Live timer tick every second for realistic SLA elapsed display
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const [selectedBay, setSelectedBay] = useState(null);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);

  const handleClearBay = () => {
    if (!selectedBay) return;
    releaseBay(selectedBay.bayNumber);
    setCompleteModalOpen(false);
    toast.success(`Bay #${selectedBay.bayNumber} released! Now available for next vehicle.`);
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Workshop & Service', path: '/service/bays' },
          { label: 'Live Bay Board', path: '/service/bays' },
        ]}
        title="Workshop Live Bay Allocation (12 Bays)"
        subtitle="Realtime mechanical bay monitoring, technician allocation and SLA breach alerts."
      />

      {/* 2. Plain KPI Cards per Section 0.5 */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <KpiCard
          label="Occupied Bays"
          value={`${stats.occupied} / ${stats.total} Bays`}
          helperText={`${stats.utilisation}% live utilisation`}
          icon={<Wrench className="w-5 h-5 text-status-blue" />}
        />
        <KpiCard
          label="Waiting Parts"
          value={`${stats.waitingParts} Bays`}
          helperText="Awaiting OEM stock"
          icon={<AlertTriangle className="w-5 h-5 text-status-amber" />}
        />
        <KpiCard
          label="Quality Check"
          value={`${stats.qualityCheck} Bays`}
          helperText="Supervisor sign-off"
          icon={<Clock className="w-5 h-5 text-purple-500" />}
        />
        <KpiCard
          label="Ready Delivery"
          value={`${stats.readyForDelivery} Bays`}
          helperText="Completed & washed"
          icon={<Sparkles className="w-5 h-5 text-emerald-500" />}
        />
        <KpiCard
          label="Available Bays"
          value={`${stats.available} Bays`}
          helperText="Ready for next intake"
          icon={<CheckCircle className="w-5 h-5 text-status-green" />}
        />
      </div>

      {/* 12-Bay Master Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {bays.map((bay) => {
          const isOccupied = bay.status === 'OCCUPIED';
          const isBreached = bay.slaStatus === 'BREACHED';

          let borderStyle = 'border-border';
          if (isOccupied) {
            borderStyle = isBreached ? 'border-status-red shadow-sm' : 'border-primary/50 shadow-sm';
          }

          return (
            <Card key={bay.bayNumber} className={`p-4 flex flex-col justify-between ${borderStyle}`}>
              <div>
                {/* Bay Header */}
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-text-main">
                      Bay #{String(bay.bayNumber).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-surface-muted text-text-muted">
                      {bay.type}
                    </span>
                  </div>
                  <StatusBadge status={bay.status} />
                </div>

                {/* Bay Content */}
                <div className="py-3 space-y-2 text-xs">
                  {isOccupied ? (
                    <>
                      <div>
                        <span className="text-text-muted text-[10px] block">Active Vehicle:</span>
                        <div className="font-bold text-text-main font-mono text-sm">
                          {bay.vehicleRegistration}
                        </div>
                        <div className="text-[11px] font-semibold text-primary">{bay.modelName}</div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-text-muted">Technician:</span>
                        <strong className="text-text-main">{bay.technicianName}</strong>
                      </div>

                      {/* SLA Timer */}
                      <div
                        className={`p-2 rounded flex items-center justify-between mt-2 ${
                          isBreached
                            ? 'bg-red-50 text-status-red font-bold'
                            : 'bg-blue-50 text-status-blue font-semibold'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{isBreached ? 'SLA Breached (+15m)' : 'In Progress (38m elapsed)'}</span>
                        </div>
                        <span className="text-[10px] uppercase">{bay.estimatedMinutes}m Target</span>
                      </div>
                    </>
                  ) : bay.status === 'MAINTENANCE' ? (
                    <div className="py-6 text-center text-text-muted">
                      <AlertTriangle className="w-6 h-6 text-text-muted mx-auto mb-1.5 opacity-60" />
                      <span>Bay hydraulic lift calibration in progress</span>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-text-muted">
                      <CheckCircle className="w-6 h-6 text-status-green mx-auto mb-1.5 opacity-80" />
                      <span className="font-medium text-status-green">Available for immediate check-in</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bay Action Footer */}
              <div className="pt-3 border-t border-border flex justify-end gap-2">
                {isOccupied && (
                  <Button
                    size="sm"
                    variant="outline"
                    icon={CheckCircle}
                    onClick={() => {
                      setSelectedBay(bay);
                      setCompleteModalOpen(true);
                    }}
                  >
                    Finish Job & Clear
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Clear Bay Confirmation Modal */}
      <Modal
        isOpen={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        title={selectedBay ? `Complete Work on Bay #${selectedBay.bayNumber}` : ''}
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-text-muted">
            Confirm that all mechanical tasks for <strong>{selectedBay?.vehicleRegistration}</strong> are finished.
            This bay will immediately transition to <strong>FREE</strong>.
          </p>
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setCompleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleClearBay}>
              Confirm Bay Release
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
