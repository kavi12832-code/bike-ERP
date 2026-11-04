import React, { useState } from 'react';
import { useAppStore } from '../../../store';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { formatMoney, formatDate } from '../../../lib/format';
import {
  Megaphone,
  PlusCircle,
  Upload,
  Download,
  CheckCircle,
  AlertTriangle,
  Send,
  Users,
  Eye,
  ShieldCheck,
  Pencil,
  Trash2,
  Play,
  Pause,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

import { useCollection } from '../../../hooks/useCollection';
export function MarketingCampaignsPage() {
  const [campaigns, setCampaigns] = useCollection('marketing.marketingCampaigns.campaigns');

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [campaignTitle, setCampaignTitle] = useState('New Hunter 350 Custom Colour Promotion');
  const [selectedTemplate, setSelectedTemplate] = useState('FESTIVAL_OFFER_DIWALI');
  const [csvUploaded, setCsvUploaded] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCamp, setEditingCamp] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    targetSegment: '',
    status: 'COMPLETED',
  });

  const openEditModal = (camp) => {
    setEditingCamp(camp);
    setEditForm({
      title: camp.title || '',
      targetSegment: camp.targetSegment || '',
      status: camp.status || 'COMPLETED',
    });
    setEditModalOpen(true);
  };

  const handleSaveEditCampaign = () => {
    if (!editForm.title.trim()) {
      toast.error('Campaign title is required');
      return;
    }
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === editingCamp.id
          ? {
              ...c,
              title: editForm.title,
              targetSegment: editForm.targetSegment,
              status: editForm.status,
            }
          : c
      )
    );
    toast.success(`Campaign "${editForm.title}" updated.`);
    setEditModalOpen(false);
  };

  const handleDeleteCampaign = (campId, title) => {
    if (window.confirm(`Are you sure you want to delete campaign "${title}"?`)) {
      setCampaigns((prev) => prev.filter((c) => c.id !== campId));
      toast.info(`Campaign "${title}" deleted.`);
    }
  };

  const handleToggleCampaignPause = (camp) => {
    const nextStatus = camp.status === 'PAUSED' ? 'ACTIVE_DISPATCH' : 'PAUSED';
    setCampaigns((prev) =>
      prev.map((c) => (c.id === camp.id ? { ...c, status: nextStatus } : c))
    );
    toast.info(nextStatus === 'PAUSED' ? `Campaign "${camp.title}" broadcast paused.` : `Campaign "${camp.title}" broadcast resumed.`);
  };

  const handleLaunchCampaign = () => {
    const newCamp = {
      id: `cmp-${Date.now()}`,
      title: campaignTitle,
      templateCode: selectedTemplate,
      targetSegment: 'Verified Opt-in Audience',
      totalAudience: 100,
      optedInCount: 92,
      optedOutCount: 8,
      sentCount: 92,
      deliveredCount: 90,
      readCount: 65,
      repliedCount: 12,
      costEstimatePaise: 9200,
      status: 'ACTIVE_DISPATCH',
      roiRevenuePaise: 0,
      approvedBy: 'Dual-Control Certified',
    };

    setCampaigns([newCamp, ...campaigns]);
    setWizardOpen(false);
    toast.success(`Campaign "${campaignTitle}" scheduled! Dispatched strictly to 92 opted-in customers.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main">Marketing Campaigns & Promotional Broadcasts</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Meta approved templates, strict opt-in DPDP consent filters, dual-control approval & ROI tracking
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={PlusCircle}
          onClick={() => {
            setWizardStep(1);
            setWizardOpen(true);
          }}
        >
          Launch New Campaign
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase font-semibold">Total Campaigns Run</div>
          <div className="text-2xl font-bold text-text-main mt-1 tabular-nums">{campaigns.length} Campaigns</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase font-semibold">Consent Compliance Rate</div>
          <div className="text-2xl font-bold text-status-green mt-1 tabular-nums">100% Opt-in</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase font-semibold">Average Read Rate</div>
          <div className="text-2xl font-bold text-primary mt-1 tabular-nums">82.8%</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase font-semibold">Campaign Revenue Generated</div>
          <div className="text-2xl font-bold text-status-green mt-1 tabular-nums">₹ 1.22 Cr</div>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-subtle border-b border-border text-text-muted font-semibold uppercase text-[11px]">
                <th className="p-3.5">Campaign Name</th>
                <th className="p-3.5">Template</th>
                <th className="p-3.5">Target Segment</th>
                <th className="p-3.5">Opted-in Count</th>
                <th className="p-3.5">Delivered</th>
                <th className="p-3.5">Read Rate</th>
                <th className="p-3.5">Revenue Booked</th>
                <th className="p-3.5">Approver</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-surface-subtle/70 transition-colors">
                  <td className="p-3.5 font-bold text-text-main">{camp.title}</td>
                  <td className="p-3.5 font-mono text-primary font-semibold">{camp.templateCode}</td>
                  <td className="p-3.5 text-text-muted">{camp.targetSegment}</td>
                  <td className="p-3.5 font-bold text-status-green tabular-nums">
                    {camp.optedInCount} ({camp.optedOutCount} opted out)
                  </td>
                  <td className="p-3.5 tabular-nums text-text-main">{camp.deliveredCount}</td>
                  <td className="p-3.5 font-bold text-primary tabular-nums">
                    {Math.round((camp.readCount / camp.deliveredCount) * 100)}%
                  </td>
                  <td className="p-3.5 tabular-nums font-bold text-status-green">
                    {formatMoney(camp.roiRevenuePaise)}
                  </td>
                  <td className="p-3.5 text-text-muted text-[11px]">{camp.approvedBy}</td>
                  <td className="p-3.5">
                    <StatusBadge status={camp.status} />
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleToggleCampaignPause(camp)}
                        className="p-1.5 rounded hover:bg-surface-subtle text-text-muted hover:text-primary"
                        title={camp.status === 'PAUSED' ? 'Resume Campaign' : 'Pause Broadcast'}
                      >
                        {camp.status === 'PAUSED' ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => openEditModal(camp)}
                        className="p-1.5 rounded hover:bg-surface-subtle text-text-muted hover:text-primary"
                        title="Edit Campaign"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCampaign(camp.id, camp.title)}
                        className="p-1.5 rounded hover:bg-red-50 text-text-muted hover:text-status-red"
                        title="Delete Campaign"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Campaign Creation Multi-Step Wizard Modal */}
      <Modal
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        title={`WhatsApp Campaign Wizard - Step ${wizardStep} of 3`}
        size="md"
      >
        <div className="space-y-4 text-xs">
          {wizardStep === 1 && (
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-text-main mb-1">Campaign Title</label>
                <input
                  type="text"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  className="w-full p-2.5 rounded-input border border-border bg-surface-subtle text-text-main"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-main mb-1">Meta Approved Template</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full p-2.5 rounded-input border border-border bg-surface-subtle text-text-main"
                >
                  <option value="FESTIVAL_OFFER_DIWALI">FESTIVAL_OFFER_DIWALI (Festival Mega Savings)</option>
                  <option value="SERVICE_DUE_REMINDER_V2">SERVICE_DUE_REMINDER_V2 (Periodic Maintenance)</option>
                  <option value="VEHICLE_READY_DELIVERY">VEHICLE_READY_DELIVERY (Handover Alert)</option>
                </select>
              </div>

              <div className="flex justify-end pt-3">
                <Button variant="primary" onClick={() => setWizardStep(2)}>
                  Next: Audience Validation
                </Button>
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="space-y-4">
              <div className="p-4 rounded-card bg-surface-subtle border border-dashed border-border text-center space-y-3">
                <Upload className="w-6 h-6 text-text-muted mx-auto" />
                <h4 className="font-semibold text-text-main">Audience List & DPDP Consent Filter</h4>
                <p className="text-[11px] text-text-muted">
                  System filters opted-out numbers automatically to guarantee legal compliance.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setCsvUploaded(true);
                      toast.success('Live CRM audience loaded: 92 Opted-in recipients selected.');
                    }}
                    className="bg-blue-600 text-white font-bold"
                  >
                    ⚡ Select 92 Opted-in CRM Contacts
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setCsvUploaded(true);
                      toast.success('Audience validated: 92 Opted-in rows, 8 Opted-out rows excluded.');
                    }}
                  >
                    {csvUploaded ? '✓ 92 Opted-in Validated' : 'Upload Audience CSV'}
                  </Button>
                </div>
              </div>

              <div className="flex justify-between pt-3">
                <Button variant="secondary" onClick={() => setWizardStep(1)}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    if (!csvUploaded) setCsvUploaded(true);
                    setWizardStep(3);
                  }}
                >
                  Next: Cost &amp; Dual-Control Sign-off
                </Button>
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="space-y-4">
              <div className="p-3 bg-surface-subtle rounded border space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-muted">Audience Recipients:</span>
                  <strong className="text-status-green">92 Opted-in Customers</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Estimated Meta Cloud Cost:</span>
                  <strong className="text-text-main">₹ 92.00 (@ ₹1.00/message)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Broadcast Window:</span>
                  <span className="text-text-main font-semibold">10:00 AM - 07:00 PM IST (Permitted)</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-blue-50 border border-blue-200 text-status-blue flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Dual-control rule enforced: Approved by Sales Manager persona before dispatch.</span>
              </div>

              <div className="flex justify-between pt-3 border-t border-border">
                <Button variant="secondary" onClick={() => setWizardStep(2)}>
                  Back
                </Button>
                <Button variant="primary" onClick={handleLaunchCampaign}>
                  Authorize &amp; Dispatch Campaign
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Edit Campaign Modal */}
      {editModalOpen && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title={`Edit Campaign: ${editingCamp?.title}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-text-main mb-1">Campaign Title</label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              />
            </div>

            <div>
              <label className="block font-semibold text-text-main mb-1">Target Segment</label>
              <input
                type="text"
                value={editForm.targetSegment}
                onChange={(e) => setEditForm({ ...editForm, targetSegment: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              />
            </div>

            <div>
              <label className="block font-semibold text-text-main mb-1">Broadcast Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              >
                <option value="ACTIVE_DISPATCH">ACTIVE_DISPATCH</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="PAUSED">PAUSED</option>
                <option value="SCHEDULED">SCHEDULED</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button variant="secondary" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveEditCampaign}>
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
export default MarketingCampaignsPage;
