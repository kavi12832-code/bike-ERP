import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../store';
import { KpiCard } from '../../../components/ui/KpiCard';
import { StatusChip } from '../../../components/ui/StatusChip';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { 
  Wrench, 
  CheckCircle2, 
  Clock, 
  ClipboardCheck, 
  ArrowRight, 
  Play, 
  Eye, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export function TechnicianDashboardView() {
  const navigate = useNavigate();
  const state = useAppStore();
  const currentUser = state.currentUser;
  const jobCards = state.jobCards || [];
  const bays = state.bays || [];
  const updateJobCardStage = state.updateJobCardStage;

  // Filter jobs for this technician
  const myJobs = useMemo(() => {
    return jobCards.filter((jc) => {
      const matchTech = 
        jc.technicianId === currentUser?.id || 
        jc.technicianName?.toLowerCase() === currentUser?.name?.toLowerCase() ||
        jc.technician === currentUser?.name;
      return matchTech;
    });
  }, [jobCards, currentUser]);

  const activeJobs = myJobs.filter((j) => j.stage !== 'DELIVERED' && j.stage !== 'CANCELLED');
  const inProgressJobs = myJobs.filter((j) => j.stage === 'IN_PROGRESS' || j.stage === 'WORK_IN_PROGRESS');
  const completedToday = myJobs.filter((j) => j.stage === 'READY' || j.stage === 'DELIVERED');

  const occupiedBaysCount = bays.filter(
    (b) => b.status === 'OCCUPIED' || b.activeJobCardId
  ).length;

  const handleAdvanceStage = (jobId, currentStage) => {
    let nextStage = 'IN_PROGRESS';
    if (currentStage === 'CHECKED_IN' || currentStage === 'ASSIGNED') nextStage = 'IN_PROGRESS';
    else if (currentStage === 'IN_PROGRESS' || currentStage === 'WORK_IN_PROGRESS') nextStage = 'QUALITY_CHECK';
    else if (currentStage === 'QUALITY_CHECK') nextStage = 'READY';

    if (updateJobCardStage) {
      updateJobCardStage(jobId, nextStage);
      toast.success(`Job card ${jobId} updated to ${nextStage}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Technician Banner */}
      <div className="p-4 rounded-card bg-primary/10 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-text-main flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary" />
            <span>Technician Service Bay Workspace</span>
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Logged in as <strong className="text-text-main">{currentUser?.name || 'Technician'}</strong> • Bangalore Central Workshop
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/service/live-bays')}
            className="text-xs"
          >
            Live Bay Board
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate('/service/dvi')}
            className="text-xs bg-primary text-white"
          >
            Digital Inspection (DVI)
          </Button>
        </div>
      </div>

      {/* 1. Plain KPI Cards for Technician (Strictly no charts/arrows) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Wrench}
          label="My Active Jobs"
          value={activeJobs.length}
          subtitle="Currently assigned to you"
        />
        <KpiCard
          icon={Clock}
          label="Work In Progress"
          value={inProgressJobs.length}
          subtitle="On hydraulic lifts"
        />
        <KpiCard
          icon={CheckCircle2}
          label="Completed Today"
          value={completedToday.length}
          subtitle="Passed QC & inspection"
        />
        <KpiCard
          icon={ClipboardCheck}
          label="Workshop Bays Utilised"
          value={`${occupiedBaysCount} / ${bays.length || 12}`}
          subtitle="Active bay occupancy"
        />
      </div>

      {/* 2. My Assigned Jobs Queue */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-text-main">My Repair & Service Queue</h3>
            <p className="text-xs text-text-muted mt-0.5">Directly assigned job cards requiring technical diagnosis or maintenance</p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface-subtle border border-border text-text-main">
            {activeJobs.length} Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-surface-subtle text-text-muted font-semibold uppercase text-[11px] border-b border-border">
              <tr>
                <th className="p-3.5">Job Card</th>
                <th className="p-3.5">Customer & Bike</th>
                <th className="p-3.5">Package / Service</th>
                <th className="p-3.5">Bay Lift</th>
                <th className="p-3.5">Status Stage</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {activeJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-muted">
                    No active service jobs currently assigned to you. Check the Live Bay Board or Kanban.
                  </td>
                </tr>
              ) : (
                activeJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-surface-subtle/70 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-primary">
                      {job.jobCardNumber || job.id}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-text-main">{job.customerName || 'Customer'}</div>
                      <div className="text-[10px] text-text-muted font-mono">{job.regNumber || job.vehicleModel}</div>
                    </td>
                    <td className="p-3.5 text-text-muted">
                      {job.serviceType || job.servicePackage || 'General Periodic Service'}
                    </td>
                    <td className="p-3.5 font-semibold text-text-main">
                      {job.bayNumber ? `Bay #${job.bayNumber}` : <span className="text-text-muted italic">Unallocated</span>}
                    </td>
                    <td className="p-3.5">
                      <StatusChip status={job.stage} />
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleAdvanceStage(job.id, job.stage)}
                        className="text-[11px] h-7 mr-1.5"
                      >
                        Advance Stage
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate('/service/dvi')}
                        className="text-[11px] h-7"
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default TechnicianDashboardView;
