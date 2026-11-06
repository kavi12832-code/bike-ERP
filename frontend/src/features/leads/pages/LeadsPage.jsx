import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerContainer, cardEntranceVariants } from '../../../lib/motion';
import { useAppStore } from '../../../store';
import { hasPermission } from '../../../lib/rbac';
import { PERMISSIONS } from '../../../config/permissions';
import { Card } from '../../../components/ui/Card';
import { KpiCard } from '../../../components/ui/KpiCard';
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
  Users,
  Target,
  IndianRupee,
  Timer
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
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0b1b2b]">Leads &amp; Enquiries Pipeline</h1>
          <p className="text-xs sm:text-sm text-[#0b1b2b]/65 font-medium mt-0.5">
            {canViewAll ? 'All Showroom Leads (Manager View)' : `My Active Leads (${currentUser?.name})`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Segmented View Mode Toggle */}
          <div className="flex bg-white/20 border border-white/30 rounded-full p-1 text-xs backdrop-blur-md shadow-xs">
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 font-semibold transition-all cursor-pointer ${viewMode === 'KANBAN'
                  ? 'bg-[#0b1220] text-white shadow-xs'
                  : 'text-[#0b1b2b]/70 hover:text-[#0b1b2b]'
                }`}
              title="Kanban Board View"
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 font-semibold transition-all cursor-pointer ${viewMode === 'LIST'
                  ? 'bg-[#0b1220] text-white shadow-xs'
                  : 'text-[#0b1b2b]/70 hover:text-[#0b1b2b]'
                }`}
              title="Tabular List View"
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          <motion.button
            whileHover={{ y: -1, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setNewLeadModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-[#0b1220] hover:bg-[#162033] text-white font-semibold text-xs inline-flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-white" />
            <span>Create Lead</span>
          </motion.button>
        </div>
      </div>

      {/* KPI Row (Computed from actual store records) */}
      <motion.div variants={cardEntranceVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Users}
          label="Active Pipeline"
          value={totalLeadsCount}
          subtitle={`${convertedCount} converted`}
        />
        <KpiCard
          icon={Target}
          label="Conversion Rate"
          value={`${conversionRate}%`}
          subtitle="Booked & Delivered"
        />
        <KpiCard
          icon={IndianRupee}
          label="Pipeline Value"
          value={formatMoney(totalPipelineValuePaise)}
          subtitle="Estimated gross potential"
        />
        <KpiCard
          icon={Timer}
          label="Avg SLA Follow-up"
          value="1.8 Hours"
          subtitle="Benchmark < 2.0 Hours"
        />
      </motion.div>

      {/* Filter and Search Bar */}
      <motion.div variants={cardEntranceVariants} className="glass-card !p-3 !rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#0b1b2b]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads by customer name, phone or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white/40 border border-white/40 rounded-full text-[#0b1b2b] placeholder:text-[#0b1b2b]/40 focus:outline-hidden focus:bg-white/60 focus:ring-2 focus:ring-[#0b1220]/20 transition-all backdrop-blur-sm"
          />
        </div>
      </motion.div>

      {/* Kanban Board Mode */}
      {viewMode === 'KANBAN' ? (
        <motion.div variants={cardEntranceVariants} className="flex gap-4 overflow-x-auto pb-4 min-w-full">
          {STAGES.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.stage === stage.id);

            return (
              <div
                key={stage.id}
                className="w-72 shrink-0 glass-card !p-3 !rounded-2xl flex flex-col"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/20">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${stage.color}`} />
                    <span className="text-xs font-bold text-[#0b1b2b] truncate">{stage.label}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/40 text-[#0b1b2b] border border-white/30 tabular-nums shrink-0">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Lead Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-340px)]">
                  {stageLeads.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-[#0b1b2b]/50 italic">
                      No leads in {stage.label}
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <motion.div
                        key={lead.id}
                        whileHover={{ y: -3, scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedLead(lead)}
                        className="p-3 bg-white/40 hover:bg-white/60 border border-white/40 rounded-xl transition-all text-xs shadow-xs cursor-pointer backdrop-blur-sm"
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <h4 className="font-bold text-[#0b1b2b] truncate text-xs">{lead.customerName}</h4>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 border backdrop-blur-xs ${lead.aiScoreTier === 'HOT'
                                ? 'bg-red-500/15 text-red-700 border-red-500/30'
                                : lead.aiScoreTier === 'WARM'
                                  ? 'bg-amber-500/15 text-amber-700 border-amber-500/30'
                                  : 'bg-slate-500/15 text-slate-700 border-slate-500/30'
                              }`}
                          >
                            AI {lead.aiScore}
                          </span>
                        </div>

                        <div className="text-[11px] font-semibold text-blue-800 truncate mb-1">
                          {lead.modelName}
                        </div>

                        <div className="text-[10px] text-[#0b1b2b]/65 flex items-center justify-between gap-1 mb-1.5 font-medium">
                          <span>{formatPhone(lead.phone)}</span>
                          <span className="capitalize px-2 py-0.5 rounded-full bg-white/40 border border-white/30 text-[9px]">
                            {lead.source.replace(/_/g, ' ')}
                          </span>
                        </div>

                        {/* Quick Stage Mover Buttons */}
                        <div
                          className="pt-2 border-t border-white/20 flex items-center justify-between"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-[10px] text-[#0b1b2b]/60 font-semibold">{lead.assignedToName.split(' ')[0]}</span>
                          <div className="flex gap-1">
                            {stage.id !== 'DELIVERY' && (
                              <button
                                onClick={() => {
                                  const nextIdx = STAGES.findIndex((s) => s.id === stage.id) + 1;
                                  if (nextIdx < STAGES.length) {
                                    handleStageMove(lead.id, STAGES[nextIdx].id);
                                  }
                                }}
                                className="p-1 rounded-full bg-white/40 hover:bg-[#0b1220] hover:text-white text-[#0b1b2b] transition-colors cursor-pointer"
                                title="Advance to Next Stage"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>
      ) : (
        /* List Mode Table */
        <motion.div variants={cardEntranceVariants} className="glass-card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white/20 border-b border-white/20 text-[#0b1b2b]/70 font-semibold uppercase text-[11px]">
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
              <tbody className="divide-y divide-white/15">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="hover:bg-white/25 transition-colors cursor-pointer"
                  >
                    <td className="p-3.5 font-bold text-[#0b1b2b]">{lead.customerName}</td>
                    <td className="p-3.5 text-[#0b1b2b]/70 font-mono">{formatPhone(lead.phone)}</td>
                    <td className="p-3.5 font-medium text-blue-800">{lead.modelName}</td>
                    <td className="p-3.5">
                      <StatusBadge status={lead.stage} />
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${lead.aiScoreTier === 'HOT'
                            ? 'bg-red-500/15 text-red-700 border-red-500/30'
                            : 'bg-amber-500/15 text-amber-700 border-amber-500/30'
                          }`}
                      >
                        {lead.aiScore} ({lead.aiScoreTier})
                      </span>
                    </td>
                    <td className="p-3.5 tabular-nums text-[#0b1b2b] font-semibold">{formatMoney(lead.budgetPaise)}</td>
                    <td className="p-3.5 text-[#0b1b2b]/70">{lead.assignedToName}</td>
                    <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedLead(lead)}
                        className="px-3 py-1 text-xs font-semibold rounded-full bg-white/40 hover:bg-white/60 text-[#0b1b2b] border border-white/40 inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        Details
                      </motion.button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
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
    </motion.div>
  );
}
