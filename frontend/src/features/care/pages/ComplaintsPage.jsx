import React, { useState, useMemo } from 'react';
import { 
  MessageSquareWarning, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  ChevronRight, 
  Phone, 
  Plus, 
  Search, 
  ShieldAlert,
  X,
  Pencil,
  Trash2,
  Filter,
  Check,
  Send,
} from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { KpiCard } from '../../../components/ui/KpiCard';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { formatDate } from '../../../lib/format';
import { toast } from 'sonner';

const COMPLAINT_STAGES = [
  { id: 'OPEN', label: 'Open', color: 'border-rose-500 text-rose-700 bg-rose-50' },
  { id: 'ASSIGNED', label: 'Assigned', color: 'border-amber-500 text-amber-700 bg-amber-50' },
  { id: 'UNDER_INVESTIGATION', label: 'Under Investigation', color: 'border-blue-500 text-blue-700 bg-blue-50' },
  { id: 'RESOLUTION_PROPOSED', label: 'Resolution Proposed', color: 'border-purple-500 text-purple-700 bg-purple-50' },
  { id: 'CLOSED', label: 'Closed & Verified', color: 'border-emerald-500 text-emerald-700 bg-emerald-50' },
];

const INITIAL_COMPLAINTS = [
  {
    id: 'cmp-001',
    ticketNo: 'CMP/2627/0042',
    customerName: 'Vinay Bhaskar',
    phone: '+91 98451 88440',
    vehicle: 'Royal Enfield Hunter 350 (KA-01-MJ-9912)',
    category: 'Service Quality',
    issue: 'Engine oil leakage observed immediately after 2nd general service.',
    stage: 'OPEN',
    createdAt: new Date(Date.now() - 32 * 3600000).toISOString(),
    slaHoursRemaining: 16,
    escalationLevel: 'SERVICE_MANAGER',
    assignedTo: 'Karthik Raja (Service Manager)',
    resolutionNote: '',
  },
  {
    id: 'cmp-002',
    ticketNo: 'CMP/2627/0043',
    customerName: 'Aishwarya Raman',
    phone: '+91 97401 22990',
    vehicle: 'TVS iQube EV (KA-03-EV-1144)',
    category: 'Billing Discrepancy',
    issue: 'Discrepancy in extended warranty charging amount compared to sales quote.',
    stage: 'ASSIGNED',
    createdAt: new Date(Date.now() - 10 * 3600000).toISOString(),
    slaHoursRemaining: 38,
    escalationLevel: 'ADVISOR',
    assignedTo: 'Deepak Rao (Sales Executive)',
    resolutionNote: '',
  },
  {
    id: 'cmp-003',
    ticketNo: 'CMP/2627/0040',
    customerName: 'Kishore Kumar',
    phone: '+91 98860 11234',
    vehicle: 'Honda SP125 (KA-05-AB-5511)',
    category: 'Part Delay',
    issue: 'Rear shock absorber replacement part delayed over 14 days.',
    stage: 'UNDER_INVESTIGATION',
    createdAt: new Date(Date.now() - 52 * 3600000).toISOString(),
    slaHoursRemaining: -4,
    escalationLevel: 'DEALER_PRINCIPAL',
    assignedTo: 'Rajesh Varma (Dealer Principal)',
    resolutionNote: '',
  },
  {
    id: 'cmp-004',
    ticketNo: 'CMP/2627/0039',
    customerName: 'Sanjay Reddy',
    phone: '+91 99002 44331',
    vehicle: 'Royal Enfield Himalayan 450 (KA-01-NJ-8810)',
    category: 'Delivery PDI',
    issue: 'Small scratch on exhaust heat shield noted during handover.',
    stage: 'CLOSED',
    createdAt: new Date(Date.now() - 90 * 3600000).toISOString(),
    slaHoursRemaining: 0,
    escalationLevel: 'RESOLVED',
    assignedTo: 'Ananya Sharma',
    resolutionNote: 'Free heat shield replacement completed under dealer goodwill. Customer signed satisfaction note.',
  }
];

export function ComplaintsPage() {
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolutionText, setResolutionText] = useState('');
  
  // Modals
  const [showNewModal, setShowNewModal] = useState(false);
  const [newGrievance, setNewGrievance] = useState({
    customerName: '',
    phone: '',
    vehicle: '',
    category: 'Service Quality',
    issue: '',
    assignedTo: 'Karthik Raja (Service Manager)',
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [editForm, setEditForm] = useState({
    customerName: '',
    phone: '',
    vehicle: '',
    category: '',
    issue: '',
    stage: 'OPEN',
    assignedTo: '',
    resolutionNote: '',
  });

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);

  // Dynamic KPIs (Section 0.5: plain numbers, NO charts)
  const kpiStats = useMemo(() => {
    const total = complaints.length;
    const underInvestigation = complaints.filter(c => c.stage === 'UNDER_INVESTIGATION' || c.stage === 'OPEN' || c.stage === 'ASSIGNED').length;
    const slaBreaches = complaints.filter(c => c.slaHoursRemaining < 0 && c.stage !== 'CLOSED').length;
    const closed = complaints.filter(c => c.stage === 'CLOSED').length;

    return {
      total,
      underInvestigation,
      slaBreaches,
      closed,
    };
  }, [complaints]);

  const handleAdvanceStage = (complaintId, nextStage) => {
    setComplaints(prev => prev.map(c => {
      if (c.id !== complaintId) return c;
      return { ...c, stage: nextStage };
    }));
    toast.success(`Complaint moved to stage ${nextStage}`);
  };

  const handleCloseComplaint = (e) => {
    e.preventDefault();
    if (!resolutionText.trim()) {
      toast.error('Please enter a resolution summary');
      return;
    }

    setComplaints(prev => prev.map(c => {
      if (c.id !== selectedComplaint.id) return c;
      return { 
        ...c, 
        stage: 'CLOSED', 
        resolutionNote: resolutionText.trim(),
        escalationLevel: 'RESOLVED'
      };
    }));

    toast.success(`Complaint ${selectedComplaint.ticketNo} closed and resolution recorded!`);
    setSelectedComplaint(null);
    setResolutionText('');
  };

  const handleCreateGrievance = (e) => {
    e.preventDefault();
    if (!newGrievance.customerName.trim() || !newGrievance.phone.trim() || !newGrievance.issue.trim()) {
      toast.error('Customer Name, Phone, and Issue Description are required.');
      return;
    }

    const newTicketNo = `CMP/2627/00${44 + complaints.length}`;
    const newRecord = {
      id: `cmp-${Date.now().toString(36)}`,
      ticketNo: newTicketNo,
      customerName: newGrievance.customerName.trim(),
      phone: newGrievance.phone.trim(),
      vehicle: newGrievance.vehicle.trim() || 'Bajaj Pulsar NS200 (KA-01-EQ-9921)',
      category: newGrievance.category,
      issue: newGrievance.issue.trim(),
      stage: 'OPEN',
      createdAt: new Date().toISOString(),
      slaHoursRemaining: 48,
      escalationLevel: 'ADVISOR',
      assignedTo: newGrievance.assignedTo,
      resolutionNote: '',
    };

    setComplaints(prev => [newRecord, ...prev]);
    toast.success(`New Grievance ${newTicketNo} logged successfully!`);
    setShowNewModal(false);
    setNewGrievance({
      customerName: '',
      phone: '',
      vehicle: '',
      category: 'Service Quality',
      issue: '',
      assignedTo: 'Karthik Raja (Service Manager)',
    });
  };

  const openEditModal = (ticket, e) => {
    if (e) e.stopPropagation();
    setEditingComplaint(ticket);
    setEditForm({
      customerName: ticket.customerName || '',
      phone: ticket.phone || '',
      vehicle: ticket.vehicle || '',
      category: ticket.category || 'Service Quality',
      issue: ticket.issue || '',
      stage: ticket.stage || 'OPEN',
      assignedTo: ticket.assignedTo || '',
      resolutionNote: ticket.resolutionNote || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEditComplaint = (e) => {
    e.preventDefault();
    if (!editForm.customerName.trim() || !editForm.phone.trim()) {
      toast.error('Customer name and phone number are required');
      return;
    }

    setComplaints(prev => prev.map(c => {
      if (c.id !== editingComplaint.id) return c;
      return {
        ...c,
        customerName: editForm.customerName.trim(),
        phone: editForm.phone.trim(),
        vehicle: editForm.vehicle.trim(),
        category: editForm.category,
        issue: editForm.issue.trim(),
        stage: editForm.stage,
        assignedTo: editForm.assignedTo,
        resolutionNote: editForm.resolutionNote.trim(),
      };
    }));

    if (selectedComplaint && selectedComplaint.id === editingComplaint.id) {
      setSelectedComplaint(prev => ({
        ...prev,
        ...editForm,
      }));
    }

    toast.success(`Complaint ${editingComplaint.ticketNo} updated successfully!`);
    setShowEditModal(false);
  };

  const promptDeleteTicket = (ticket, e) => {
    if (e) e.stopPropagation();
    setTicketToDelete(ticket);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (ticketToDelete) {
      setComplaints(prev => prev.filter(c => c.id !== ticketToDelete.id));
      if (selectedComplaint?.id === ticketToDelete.id) {
        setSelectedComplaint(null);
      }
      toast.success(`Grievance ${ticketToDelete.ticketNo} removed.`);
    }
    setDeleteConfirmOpen(false);
    setTicketToDelete(null);
  };

  const filtered = complaints.filter(c => {
    if (categoryFilter !== 'ALL' && c.category !== categoryFilter) return false;
    if (stageFilter !== 'ALL' && c.stage !== stageFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.customerName.toLowerCase().includes(q) ||
        c.ticketNo.toLowerCase().includes(q) ||
        c.vehicle.toLowerCase().includes(q) ||
        c.issue.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Customer Care', path: '/customers' },
          { label: 'Complaints & Grievances', path: '/care/complaints' },
        ]}
        title="Customer Grievance & Complaints Desk"
        subtitle="5-stage SLA resolution Kanban, 24h/48h auto-escalation ladder & customer sign-off verification."
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setShowNewModal(true)}
            className="bg-primary hover:bg-primary-hover text-white"
          >
            Log New Grievance
          </Button>
        }
      />

      {/* 2. Plain KPI Cards Row (Section 0.5: NO charts, sparklines, or trend arrows) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          label="Total Grievances"
          value={kpiStats.total}
          helperText="All logged customer complaints"
          icon={<MessageSquareWarning className="w-5 h-5 text-primary" />}
        />
        <KpiCard
          label="Active Tickets"
          value={kpiStats.underInvestigation}
          helperText="In progress across workshop/sales"
          icon={<Clock className="w-5 h-5 text-blue-600" />}
        />
        <KpiCard
          label="SLA Breaches"
          value={kpiStats.slaBreaches}
          helperText="Exceeded 48h resolution window"
          icon={<AlertTriangle className="w-5 h-5 text-rose-500" />}
        />
        <KpiCard
          label="Closed & Verified"
          value={kpiStats.closed}
          helperText="Resolved with customer feedback signoff"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        />
      </div>

      {/* 3. SLA Escalation Policy Banner */}
      <div className="p-3.5 bg-surface-subtle border border-border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-text-muted">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary shrink-0" />
          <span>
            <strong className="text-text-main">Resolution Escalation Ladder:</strong> Service Advisor (0-24h) <ChevronRight className="w-3 h-3 inline text-text-muted" /> Service Manager (24-48h) <ChevronRight className="w-3 h-3 inline text-text-muted" /> <strong className="text-rose-600">Dealer Principal (&gt;48h Breach)</strong>
          </span>
        </div>
        <span className="font-semibold text-text-main whitespace-nowrap">Standard Max SLA: 48 Hours</span>
      </div>

      {/* 4. Filter & Search Bar */}
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
            <input
              type="text"
              placeholder="Search by ticket no, customer, vehicle or issue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-input border border-border bg-surface text-text-main focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-input border border-border bg-surface text-text-main"
            >
              <option value="ALL">All Categories</option>
              <option value="Service Quality">Service Quality</option>
              <option value="Billing Discrepancy">Billing Discrepancy</option>
              <option value="Part Delay">Part Delay</option>
              <option value="Delivery PDI">Delivery PDI</option>
            </select>

            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-input border border-border bg-surface text-text-main"
            >
              <option value="ALL">All Stages</option>
              {COMPLAINT_STAGES.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>

            {(search || categoryFilter !== 'ALL' || stageFilter !== 'ALL') && (
              <Button
                variant="ghost"
                size="sm"
                icon={X}
                onClick={() => {
                  setSearch('');
                  setCategoryFilter('ALL');
                  setStageFilter('ALL');
                }}
                className="text-text-muted hover:text-text-main"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 5. 5-Stage Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {COMPLAINT_STAGES.map(stage => {
          const ticketsInStage = filtered.filter(c => c.stage === stage.id);
          return (
            <div 
              key={stage.id} 
              className="bg-surface rounded-xl border border-border shadow-xs flex flex-col h-[650px] overflow-hidden"
            >
              <div className={`p-3 border-b border-l-4 font-bold text-xs flex items-center justify-between ${stage.color}`}>
                <span>{stage.label}</span>
                <span className="px-2 py-0.5 rounded-full bg-white/90 text-text-main text-[11px] font-mono shadow-xs">
                  {ticketsInStage.length}
                </span>
              </div>

              <div className="p-3 overflow-y-auto space-y-3 flex-1 bg-surface-subtle/40">
                {ticketsInStage.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-xs text-text-muted italic">
                    No tickets in this stage
                  </div>
                ) : (
                  ticketsInStage.map(ticket => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedComplaint(ticket)}
                      className="p-3 bg-surface rounded-lg border border-border hover:border-primary hover:shadow-sm transition-all cursor-pointer space-y-2 text-xs group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-primary">
                          {ticket.ticketNo}
                        </span>
                        <div className="flex items-center gap-1">
                          {ticket.slaHoursRemaining < 0 && ticket.stage !== 'CLOSED' ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                              SLA BREACH
                            </span>
                          ) : (
                            <span className="text-[10px] text-text-muted font-mono">
                              {ticket.stage === 'CLOSED' ? 'Resolved' : `${ticket.slaHoursRemaining}h left`}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => openEditModal(ticket, e)}
                            className="p-1 rounded text-text-muted hover:text-primary hover:bg-surface-subtle"
                            title="Edit Ticket"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => promptDeleteTicket(ticket, e)}
                            className="p-1 rounded text-text-muted hover:text-rose-600 hover:bg-rose-50"
                            title="Delete Ticket"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="font-bold text-text-main">
                        {ticket.customerName}
                      </div>

                      <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed">
                        {ticket.issue}
                      </p>

                      <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] text-text-muted">
                        <span className="truncate max-w-[120px]">{ticket.assignedTo}</span>
                        <span className="font-semibold text-primary">{ticket.category}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 6. Resolution & Detail Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={Boolean(selectedComplaint)}
          onClose={() => setSelectedComplaint(null)}
          title={`Ticket ${selectedComplaint.ticketNo}: ${selectedComplaint.customerName}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-surface-subtle rounded-lg border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-text-muted">Customer Vehicle:</span>
                <span className="font-bold text-text-main">{selectedComplaint.vehicle}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-text-muted">Phone Contact:</span>
                <span className="font-mono font-medium text-text-main">{selectedComplaint.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-text-muted">Grievance Category:</span>
                <span className="font-bold text-primary">{selectedComplaint.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-text-muted">Assigned Investigator:</span>
                <span className="font-medium text-text-main">{selectedComplaint.assignedTo}</span>
              </div>
            </div>

            <div>
              <span className="font-bold text-text-main block mb-1">Reported Customer Issue</span>
              <p className="p-3 rounded-lg bg-surface border border-border text-text-main leading-relaxed">
                {selectedComplaint.issue}
              </p>
            </div>

            {selectedComplaint.stage === 'CLOSED' ? (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1">
                <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Resolution Recorded
                </span>
                <p className="text-emerald-900 leading-relaxed">
                  {selectedComplaint.resolutionNote || 'Ticket resolved and closed.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="font-bold text-text-main block">Advance Stage or Record Resolution</label>
                <div className="flex flex-wrap gap-2">
                  {COMPLAINT_STAGES.filter(s => s.id !== selectedComplaint.stage).map(s => (
                    <Button
                      key={s.id}
                      size="xs"
                      variant="outline"
                      onClick={() => handleAdvanceStage(selectedComplaint.id, s.id)}
                    >
                      Move to {s.label}
                    </Button>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="font-semibold text-text-muted block mb-1">Final Resolution Summary (To Close Ticket):</label>
                  <textarea
                    rows={3}
                    placeholder="Describe how the complaint was resolved with the customer..."
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleCloseComplaint}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Close &amp; Mark Resolved
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* 7. Log New Grievance Modal */}
      <Modal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        title="Log New Customer Grievance Ticket"
        size="md"
      >
        <form onSubmit={handleCreateGrievance} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Customer Name *</label>
              <input
                type="text"
                placeholder="e.g. Anand Murthy"
                value={newGrievance.customerName}
                onChange={(e) => setNewGrievance({ ...newGrievance, customerName: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Mobile Phone *</label>
              <input
                type="text"
                placeholder="+91 98450 00000"
                value={newGrievance.phone}
                onChange={(e) => setNewGrievance({ ...newGrievance, phone: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Vehicle &amp; Plate</label>
              <input
                type="text"
                placeholder="Royal Enfield Hunter 350 (KA-01-AB-1234)"
                value={newGrievance.vehicle}
                onChange={(e) => setNewGrievance({ ...newGrievance, vehicle: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Grievance Category</label>
              <select
                value={newGrievance.category}
                onChange={(e) => setNewGrievance({ ...newGrievance, category: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              >
                <option value="Service Quality">Service Quality</option>
                <option value="Billing Discrepancy">Billing Discrepancy</option>
                <option value="Part Delay">Part Delay</option>
                <option value="Delivery PDI">Delivery PDI</option>
                <option value="Staff Behaviour">Staff Behaviour</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-text-main block mb-1">Issue Description *</label>
            <textarea
              rows={3}
              placeholder="Detailed description of customer complaint or failure observation..."
              value={newGrievance.issue}
              onChange={(e) => setNewGrievance({ ...newGrievance, issue: e.target.value })}
              className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-text-main block mb-1">Assign Investigator</label>
            <select
              value={newGrievance.assignedTo}
              onChange={(e) => setNewGrievance({ ...newGrievance, assignedTo: e.target.value })}
              className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
            >
              <option value="Karthik Raja (Service Manager)">Karthik Raja (Service Manager)</option>
              <option value="Vikram Sethi (Sales Manager)">Vikram Sethi (Sales Manager)</option>
              <option value="Rajesh Varma (Dealer Principal)">Rajesh Varma (Dealer Principal)</option>
              <option value="Ananya Sharma (Customer Care Head)">Ananya Sharma (Customer Care Head)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setShowNewModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="bg-primary hover:bg-primary-hover text-white">
              Log Ticket (48h SLA)
            </Button>
          </div>
        </form>
      </Modal>

      {/* 8. Edit Grievance Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={editingComplaint ? `Edit Grievance ${editingComplaint.ticketNo}` : 'Edit Grievance'}
        size="md"
      >
        <form onSubmit={handleSaveEditComplaint} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Customer Name</label>
              <input
                type="text"
                value={editForm.customerName}
                onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Mobile Phone</label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Vehicle Description</label>
              <input
                type="text"
                value={editForm.vehicle}
                onChange={(e) => setEditForm({ ...editForm, vehicle: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Category</label>
              <select
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              >
                <option value="Service Quality">Service Quality</option>
                <option value="Billing Discrepancy">Billing Discrepancy</option>
                <option value="Part Delay">Part Delay</option>
                <option value="Delivery PDI">Delivery PDI</option>
                <option value="Staff Behaviour">Staff Behaviour</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-text-main block mb-1">Issue Details</label>
            <textarea
              rows={3}
              value={editForm.issue}
              onChange={(e) => setEditForm({ ...editForm, issue: e.target.value })}
              className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Stage</label>
              <select
                value={editForm.stage}
                onChange={(e) => setEditForm({ ...editForm, stage: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              >
                {COMPLAINT_STAGES.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Assigned Investigator</label>
              <input
                type="text"
                value={editForm.assignedTo}
                onChange={(e) => setEditForm({ ...editForm, assignedTo: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              />
            </div>
          </div>

          {editForm.stage === 'CLOSED' && (
            <div>
              <label className="font-semibold text-text-main block mb-1">Resolution Summary</label>
              <textarea
                rows={2}
                value={editForm.resolutionNote}
                onChange={(e) => setEditForm({ ...editForm, resolutionNote: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="bg-primary hover:bg-primary-hover text-white">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* 9. Delete Confirmation Dialog */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirm Grievance Deletion"
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-text-muted leading-relaxed">
            Are you sure you want to permanently delete ticket <strong className="text-text-main">{ticketToDelete?.ticketNo}</strong> for{' '}
            <strong className="text-text-main">{ticketToDelete?.customerName}</strong>?
          </p>
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Delete Ticket
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ComplaintsPage;
