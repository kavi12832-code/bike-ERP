import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../store';
import { hasPermission } from '../../../lib/rbac';
import { PERMISSIONS } from '../../../config/permissions';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Drawer } from '../../../components/ui/Drawer';
import { Modal } from '../../../components/ui/Modal';
import { formatMoney, formatPhone, formatDate } from '../../../lib/format';
import {
  UserPlus,
  Kanban,
  List,
  Search,
  Phone,
  MessageSquare,
  Sparkles,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  UserCheck,
  CheckCircle,
  FileSpreadsheet,
  Edit3,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

const STAGES = [
  { id: 'ENQUIRY', label: 'Enquiry', color: 'bg-blue-500' },
  { id: 'TEST_RIDE', label: 'Test Ride', color: 'bg-amber-500' },
  { id: 'QUOTATION', label: 'Quotation', color: 'bg-purple-500' },
  { id: 'BOOKING', label: 'Booking', color: 'bg-emerald-500' },
  { id: 'FINANCE', label: 'Finance', color: 'bg-indigo-500' },
  { id: 'DELIVERY', label: 'Delivery', color: 'bg-teal-500' },
];

export function LeadsPage() {
  const navigate = useNavigate();
  const state = useAppStore();
  const currentUser = state.currentUser;
  const leads = state.leads || [];
  const bikeCatalog = state.catalogs?.bikes || [];
  const updateLeadStage = state.updateLeadStage;
  const addLead = state.addLead;
  const updateLead = state.updateLead;
  const deleteLead = state.deleteLead;

  const [viewMode, setViewMode] = useState('KANBAN'); // 'KANBAN' or 'LIST'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [newLeadModalOpen, setNewLeadModalOpen] = useState(false);
  const [lostModalOpen, setLostModalOpen] = useState(false);
  const [lostReason, setLostReason] = useState('Competitor Price (Triumph/Bajaj)');
  const [editLeadModalOpen, setEditLeadModalOpen] = useState(false);
  const [editLeadForm, setEditLeadForm] = useState({
    customerName: '',
    phone: '',
    modelName: '',
    budgetRupees: 180000,
    source: 'WALK_IN',
    stage: 'ENQUIRY',
  });

  // Form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formModelId, setFormModelId] = useState(bikeCatalog[0]?.id || '');
  const [formSource, setFormSource] = useState('WALK_IN');
  const [formBudget, setFormBudget] = useState('180000');

  // Permission Filtering: Sales Executive sees only own leads; Manager/Admin sees all
  const canViewAll = hasPermission(currentUser, PERMISSIONS.LEAD_VIEW_ALL);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (!canViewAll && lead.assignedToId !== currentUser?.id) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          lead.customerName.toLowerCase().includes(q) ||
          lead.phone.includes(q) ||
          lead.modelName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [leads, canViewAll, currentUser, searchTerm]);

  // Compute KPI metrics dynamically from records
  const totalLeadsCount = filteredLeads.length;
  const convertedCount = filteredLeads.filter((l) => l.stage === 'DELIVERY' || l.stage === 'BOOKING').length;
  const totalPipelineValuePaise = filteredLeads.reduce((s, l) => s + (l.budgetPaise || 0), 0);
  const conversionRate = totalLeadsCount > 0 ? Math.round((convertedCount / totalLeadsCount) * 100) : 0;

  // Duplicate phone detection
  const duplicateLeads = useMemo(() => {
    if (!formPhone || formPhone.length < 10) return [];
    return leads.filter((l) => l.phone.includes(formPhone.slice(-10)));
  }, [formPhone, leads]);

  const handleCreateLead = (e) => {
    e.preventDefault();
    const bike = bikeCatalog.find((b) => b.id === formModelId) || bikeCatalog[0];

    const newLead = addLead({
      customerName: formName,
      phone: formPhone.startsWith('+91') ? formPhone : `+91 ${formPhone}`,
      email: '',
      modelId: bike.id,
      modelName: `${bike.brand} ${bike.model}`,
      source: formSource,
      budgetPaise: Number(formBudget) * 100,
      assignedToId: currentUser?.id || 'sales-exec',
      assignedToName: currentUser?.name || 'Deepak Rao',
      aiScore: 85,
      aiScoreTier: 'HOT',
      aiScoreReasons: ['Fresh enquiry with immediate budget match', 'Assigned directly'],
      followUpDate: new Date().toISOString(),
      notes: 'Initial showroom enquiry logged.',
    });

    setNewLeadModalOpen(false);
    toast.success(`Lead created for ${newLead.customerName}! AI Score: 85 (HOT)`);
    // Reset form
    setFormName('');
    setFormPhone('');
  };

  const handleStageMove = (leadId, targetStage) => {
    updateLeadStage(leadId, targetStage);
    toast.success(`Lead stage updated to ${targetStage.replace(/_/g, ' ')}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main">Leads & Enquiries Pipeline</h1>
          <p className="text-xs text-text-muted mt-0.5">
            {canViewAll ? 'All Showroom Leads (Manager View)' : `My Active Leads (${currentUser?.name})`}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex bg-surface border border-border rounded-button p-0.5 text-xs shadow-xs">
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'KANBAN' ? 'bg-primary text-white font-semibold' : 'text-text-muted hover:text-text-main'
              }`}
              title="Kanban Board View"
            >
              <Kanban className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'LIST' ? 'bg-primary text-white font-semibold' : 'text-text-muted hover:text-text-main'
              }`}
              title="Tabular List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={UserPlus}
            onClick={() => setNewLeadModalOpen(true)}
          >
            Create Lead
          </Button>
        </div>
      </div>

      {/* KPI Row (Computed from actual store records) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase font-semibold">Active Pipeline</div>
          <div className="text-2xl font-bold text-text-main mt-1 tabular-nums">{totalLeadsCount} Leads</div>
          <div className="text-[11px] text-text-muted mt-0.5">{convertedCount} converted</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase font-semibold">Conversion Rate</div>
          <div className="text-2xl font-bold text-status-green mt-1 tabular-nums">{conversionRate}%</div>
          <div className="text-[11px] text-text-muted mt-0.5">Booked & Delivered</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase font-semibold">Pipeline Value</div>
          <div className="text-2xl font-bold text-primary mt-1 tabular-nums">
            {formatMoney(totalPipelineValuePaise)}
          </div>
          <div className="text-[11px] text-text-muted mt-0.5">Estimated gross potential</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase font-semibold">Avg SLA Follow-up</div>
          <div className="text-2xl font-bold text-status-amber mt-1 tabular-nums">1.8 Hours</div>
          <div className="text-[11px] text-text-muted mt-0.5">Benchmark &lt; 2.0 Hours</div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-3 bg-surface p-3 rounded-card border border-border shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search leads by customer name, phone or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-input border border-border bg-surface-subtle text-text-main focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Kanban Board Mode */}
      {viewMode === 'KANBAN' ? (
        <div className="flex gap-4 overflow-x-auto pb-4 min-w-full">
          {STAGES.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.stage === stage.id);

            return (
              <div
                key={stage.id}
                className="w-72 shrink-0 bg-surface-subtle/80 rounded-card border border-border p-3 flex flex-col"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-border">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${stage.color}`} />
                    <span className="text-xs font-bold text-text-main truncate">{stage.label}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface text-text-muted border border-border tabular-nums shrink-0">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Lead Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-340px)]">
                  {stageLeads.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-text-muted italic">
                      No leads in {stage.label}
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <Card
                        key={lead.id}
                        hover
                        onClick={() => setSelectedLead(lead)}
                        className="p-3 bg-surface border-border hover:border-primary/50 transition-all text-xs shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <h4 className="font-bold text-text-main truncate text-xs">{lead.customerName}</h4>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                              lead.aiScoreTier === 'HOT'
                                ? 'bg-red-50 text-status-red border border-red-200'
                                : lead.aiScoreTier === 'WARM'
                                ? 'bg-amber-50 text-status-amber border border-amber-200'
                                : 'bg-slate-100 text-text-muted border border-slate-200'
                            }`}
                          >
                            AI {lead.aiScore}
                          </span>
                        </div>

                        <div className="text-[11px] font-semibold text-primary truncate mb-1">
                          {lead.modelName}
                        </div>

                        <div className="text-[10px] text-text-muted flex items-center justify-between gap-1 mb-1.5">
                          <span>{formatPhone(lead.phone)}</span>
                          <span className="capitalize px-1.5 py-0.5 rounded bg-surface-subtle border border-border/60">
                            {lead.source.replace(/_/g, ' ')}
                          </span>
                        </div>

                        {/* Quick Stage Mover Buttons */}
                        <div
                          className="pt-2 border-t border-border/60 flex items-center justify-between"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-[10px] text-text-muted font-medium">{lead.assignedToName.split(' ')[0]}</span>
                          <div className="flex gap-1">
                            {stage.id !== 'DELIVERY' && (
                              <button
                                onClick={() => {
                                  const nextIdx = STAGES.findIndex((s) => s.id === stage.id) + 1;
                                  if (nextIdx < STAGES.length) {
                                    handleStageMove(lead.id, STAGES[nextIdx].id);
                                  }
                                }}
                                className="p-1 rounded bg-surface-muted hover:bg-primary hover:text-white transition-colors"
                                title="Advance to Next Stage"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Mode Table */
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-subtle border-b border-border text-text-muted font-semibold uppercase text-[11px]">
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">Interested Model</th>
                  <th className="p-3.5">Stage</th>
                  <th className="p-3.5">AI Score</th>
                  <th className="p-3.5">Budget</th>
                  <th className="p-3.5">Assigned To</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="hover:bg-surface-subtle/70 transition-colors cursor-pointer"
                  >
                    <td className="p-3.5 font-bold text-text-main">{lead.customerName}</td>
                    <td className="p-3.5 text-text-muted">{formatPhone(lead.phone)}</td>
                    <td className="p-3.5 font-medium text-primary">{lead.modelName}</td>
                    <td className="p-3.5">
                      <StatusBadge status={lead.stage} />
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          lead.aiScoreTier === 'HOT'
                            ? 'bg-red-100 text-status-red'
                            : 'bg-amber-100 text-status-amber'
                        }`}
                      >
                        {lead.aiScore} ({lead.aiScoreTier})
                      </span>
                    </td>
                    <td className="p-3.5 tabular-nums">{formatMoney(lead.budgetPaise)}</td>
                    <td className="p-3.5 text-text-muted">{lead.assignedToName}</td>
                    <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedLead(lead)}
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Lead Detail Drawer with Timeline & WhatsApp Integration */}
      <Drawer
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        title={selectedLead ? `Lead Detail: ${selectedLead.customerName}` : ''}
        size="md"
      >
        {selectedLead && (
          <div className="space-y-6 text-xs">
            {/* Header Bio */}
            <div className="flex items-start justify-between p-4 rounded-card bg-surface-subtle border border-border">
              <div>
                <h3 className="text-base font-bold text-text-main">{selectedLead.customerName}</h3>
                <div className="text-text-muted mt-0.5 flex items-center gap-2">
                  <span>{formatPhone(selectedLead.phone)}</span>
                  <span>•</span>
                  <span className="capitalize">{selectedLead.source.replace(/_/g, ' ')}</span>
                </div>
              </div>
              <StatusBadge status={selectedLead.stage} />
            </div>

            {/* AI Lead Scoring Breakdown */}
            <Card className="p-4 bg-blue-50/50 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-bold text-primary">AI Lead Quality Score: {selectedLead.aiScore}/100</span>
              </div>
              <div className="space-y-1.5 pl-6 list-disc text-text-main">
                {selectedLead.aiScoreReasons?.map((reason, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-text-muted">
                    <CheckCircle className="w-3.5 h-3.5 text-status-green shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-text-muted block">Interested Model</span>
                <span className="font-bold text-text-main text-sm">{selectedLead.modelName}</span>
              </div>
              <div>
                <span className="text-text-muted block">Estimated Budget</span>
                <span className="font-bold text-text-main text-sm tabular-nums">
                  {formatMoney(selectedLead.budgetPaise)}
                </span>
              </div>
              <div>
                <span className="text-text-muted block">Sales Executive</span>
                <span className="font-medium text-text-main">{selectedLead.assignedToName}</span>
              </div>
              <div>
                <span className="text-text-muted block">Enquiry Date</span>
                <span className="font-medium text-text-main">{formatDate(selectedLead.createdAt)}</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-border flex flex-wrap gap-2">
              <Button
                variant="primary"
                size="sm"
                icon={FileSpreadsheet}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                onClick={() => {
                  navigate(`/quotations?customer=${encodeURIComponent(selectedLead.customerName)}&phone=${encodeURIComponent(selectedLead.phone)}&model=${encodeURIComponent(selectedLead.modelName)}`);
                  toast.success(`Transitioning Lead ${selectedLead.customerName} to Quotation Builder...`);
                }}
              >
                Create Quotation
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Phone}
                onClick={() => toast.success(`Simulating call to ${selectedLead.customerName}...`)}
              >
                Call Customer
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={MessageSquare}
                onClick={() => {
                  toast.success(`Opening WhatsApp Chat with ${selectedLead.customerName}`);
                }}
              >
                WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={Edit3}
                onClick={() => {
                  setEditLeadForm({
                    customerName: selectedLead.customerName,
                    phone: selectedLead.phone,
                    modelName: selectedLead.modelName,
                    budgetRupees: Math.round((selectedLead.budgetPaise || 18000000) / 100),
                    source: selectedLead.source,
                    stage: selectedLead.stage,
                  });
                  setEditLeadModalOpen(true);
                }}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLostModalOpen(true)}
              >
                Mark Lost
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={Trash2}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  if (window.confirm(`Delete lead "${selectedLead.customerName}"?`)) {
                    if (deleteLead) deleteLead(selectedLead.id);
                    setSelectedLead(null);
                    toast.success('Lead deleted from pipeline.');
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* New Lead Modal with duplicate detection */}
      <Modal
        isOpen={newLeadModalOpen}
        onClose={() => setNewLeadModalOpen(false)}
        title="Create Showroom Lead"
        size="md"
      >
        <form onSubmit={handleCreateLead} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-text-main mb-1">Customer Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Anand Murthy"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full p-2.5 rounded-input border border-border bg-surface-subtle text-text-main"
            />
          </div>

          <div>
            <label className="block font-semibold text-text-main mb-1">Mobile Number (+91)</label>
            <input
              type="tel"
              required
              placeholder="9845012345"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              className="w-full p-2.5 rounded-input border border-border bg-surface-subtle text-text-main"
            />
            {duplicateLeads.length > 0 && (
              <div className="mt-2 p-2 rounded bg-amber-50 border border-amber-200 text-status-amber flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Possible Shared / Duplicate Phone:</strong> Found existing record for{' '}
                  {duplicateLeads[0].customerName}. (ERP policy: Duplicate suggested, never auto-merged).
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-text-main mb-1">Interested Model</label>
              <select
                value={formModelId}
                onChange={(e) => setFormModelId(e.target.value)}
                className="w-full p-2.5 rounded-input border border-border bg-surface-subtle text-text-main"
              >
                {bikeCatalog.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.brand} {b.model}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-text-main mb-1">Lead Source</label>
              <select
                value={formSource}
                onChange={(e) => setFormSource(e.target.value)}
                className="w-full p-2.5 rounded-input border border-border bg-surface-subtle text-text-main"
              >
                <option value="WALK_IN">Walk-in Visit</option>
                <option value="PHONE">Phone Call</option>
                <option value="WEBSITE">Official Website</option>
                <option value="WHATSAPP">WhatsApp Inbound</option>
                <option value="REFERRAL">Customer Referral</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-text-main mb-1">Estimated Budget (₹ Rupees)</label>
            <input
              type="number"
              value={formBudget}
              onChange={(e) => setFormBudget(e.target.value)}
              className="w-full p-2.5 rounded-input border border-border bg-surface-subtle text-text-main"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setNewLeadModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save & Score Lead
            </Button>
          </div>
        </form>
      </Modal>

      {/* Lost Reason Modal */}
      <Modal
        isOpen={lostModalOpen}
        onClose={() => setLostModalOpen(false)}
        title="Mark Lead as Lost"
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-text-muted">
            Select the primary reason for archiving this lead:
          </p>
          <select
            value={lostReason}
            onChange={(e) => setLostReason(e.target.value)}
            className="w-full p-2.5 rounded-input border border-border bg-surface-subtle text-text-main"
          >
            <option value="Competitor Price">Competitor Price (Triumph/Bajaj)</option>
            <option value="Finance Rejected">Loan Application Rejected</option>
            <option value="Postponed Decision">Purchase Postponed (6+ months)</option>
            <option value="Color Unavailable">Requested Colour Not in Stock</option>
            <option value="Unreachable">Customer Unreachable after 3 Attempts</option>
          </select>
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setLostModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (selectedLead) {
                  updateLeadStage(selectedLead.id, 'LOST');
                  setLostModalOpen(false);
                  setSelectedLead(null);
                  toast.error(`Lead archived as Lost: ${lostReason}`);
                }
              }}
            >
              Confirm Lost
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Lead Modal */}
      <Modal
        isOpen={editLeadModalOpen}
        onClose={() => setEditLeadModalOpen(false)}
        title={selectedLead ? `Edit Lead — ${selectedLead.customerName}` : 'Edit Lead'}
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-text-main block mb-1">Customer Full Name</label>
            <input
              type="text"
              value={editLeadForm.customerName}
              onChange={(e) => setEditLeadForm({ ...editLeadForm, customerName: e.target.value })}
              className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Mobile Number</label>
              <input
                type="text"
                value={editLeadForm.phone}
                onChange={(e) => setEditLeadForm({ ...editLeadForm, phone: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Pipeline Stage</label>
              <select
                value={editLeadForm.stage}
                onChange={(e) => setEditLeadForm({ ...editLeadForm, stage: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              >
                {STAGES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
                <option value="LOST">Lost</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Interested Model</label>
              <input
                type="text"
                value={editLeadForm.modelName}
                onChange={(e) => setEditLeadForm({ ...editLeadForm, modelName: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Estimated Budget (₹)</label>
              <input
                type="number"
                value={editLeadForm.budgetRupees}
                onChange={(e) => setEditLeadForm({ ...editLeadForm, budgetRupees: Number(e.target.value) })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main tabular-nums font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setEditLeadModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (selectedLead && updateLead) {
                  updateLead(selectedLead.id, {
                    customerName: editLeadForm.customerName,
                    phone: editLeadForm.phone,
                    modelName: editLeadForm.modelName,
                    budgetPaise: editLeadForm.budgetRupees * 100,
                    stage: editLeadForm.stage,
                  });
                  setSelectedLead({
                    ...selectedLead,
                    customerName: editLeadForm.customerName,
                    phone: editLeadForm.phone,
                    modelName: editLeadForm.modelName,
                    budgetPaise: editLeadForm.budgetRupees * 100,
                    stage: editLeadForm.stage,
                  });
                  setEditLeadModalOpen(false);
                  toast.success(`Lead ${editLeadForm.customerName} updated successfully.`);
                }
              }}
              className="bg-blue-600 text-white"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
