import React, { useState } from 'react';
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
} from 'lucide-react';
import { formatDate } from '../../../lib/format';
import { toast } from 'sonner';

const COMPLAINT_STAGES = [
  { id: 'OPEN', label: 'Open', color: 'border-red-500 text-red-700 bg-red-50 dark:bg-red-950/40' },
  { id: 'ASSIGNED', label: 'Assigned', color: 'border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950/40' },
  { id: 'UNDER_INVESTIGATION', label: 'Under Investigation', color: 'border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-950/40' },
  { id: 'RESOLUTION_PROPOSED', label: 'Resolution Proposed', color: 'border-purple-500 text-purple-700 bg-purple-50 dark:bg-purple-950/40' },
  { id: 'CLOSED', label: 'Closed & Verified', color: 'border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40' },
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

  const handleAdvanceStage = (complaintId, nextStage) => {
    setComplaints(prev => prev.map(c => {
      if (c.id !== complaintId) return c;
      return { ...c, stage: nextStage };
    }));
    toast.success(`Complaint moved to ${nextStage}`);
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
      customerName: newGrievance.customerName,
      phone: newGrievance.phone,
      vehicle: newGrievance.vehicle || 'Bajaj Pulsar (Registration Pending)',
      category: newGrievance.category,
      issue: newGrievance.issue,
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
        customerName: editForm.customerName,
        phone: editForm.phone,
        vehicle: editForm.vehicle,
        category: editForm.category,
        issue: editForm.issue,
        stage: editForm.stage,
        assignedTo: editForm.assignedTo,
        resolutionNote: editForm.resolutionNote,
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

  const handleDeleteComplaint = (ticketId, ticketNo, e) => {
    if (e) e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete grievance ticket ${ticketNo}?`)) {
      setComplaints(prev => prev.filter(c => c.id !== ticketId));
      if (selectedComplaint && selectedComplaint.id === ticketId) {
        setSelectedComplaint(null);
      }
      toast.info(`Complaint ${ticketNo} deleted.`);
    }
  };

  const filtered = complaints.filter(c => 
    c.customerName.toLowerCase().includes(search.toLowerCase()) ||
    c.ticketNo.toLowerCase().includes(search.toLowerCase()) ||
    c.vehicle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquareWarning className="w-6 h-6 text-red-500" />
            Customer Grievance &amp; Complaints Desk
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            5-stage SLA resolution Kanban, 24h/48h auto-escalation ladder &amp; customer sign-off verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search complaints, customer, vehicle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs border rounded-lg bg-surface text-text-main w-64 border-border"
            />
          </div>

          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Log New Grievance
          </button>
        </div>
      </div>

      {/* SLA Escalation Policy Banner */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>
            <strong>Resolution Escalation Ladder:</strong> Service Advisor (0-24h) <ChevronRight className="w-3 h-3 inline" /> Service Manager (24-48h) <ChevronRight className="w-3 h-3 inline" /> <strong className="text-red-600">Dealer Principal (&gt;48h Breach)</strong>
          </span>
        </div>
        <span className="font-semibold text-slate-500">Max SLA: 48 Hours</span>
      </div>

      {/* 5-Stage Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {COMPLAINT_STAGES.map(stage => {
          const ticketsInStage = filtered.filter(c => c.stage === stage.id);
          return (
            <div 
              key={stage.id} 
              className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[650px] overflow-hidden"
            >
              <div className={`p-3 border-b border-l-4 font-bold text-xs flex items-center justify-between ${stage.color}`}>
                <span>{stage.label}</span>
                <span className="px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 text-[11px] font-mono">
                  {ticketsInStage.length}
                </span>
              </div>

              <div className="p-3 overflow-y-auto space-y-3 flex-1">
                {ticketsInStage.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-xs text-slate-400">
                    No tickets
                  </div>
                ) : (
                  ticketsInStage.map(ticket => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedComplaint(ticket)}
                      className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:shadow-md transition cursor-pointer space-y-2 text-xs group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-blue-600">
                          {ticket.ticketNo}
                        </span>
                        <div className="flex items-center gap-1">
                          {ticket.slaHoursRemaining < 0 ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                              SLA BREACH
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-mono">
                              {ticket.slaHoursRemaining}h left
                            </span>
                          )}
                          <button
                            onClick={(e) => openEditModal(ticket, e)}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-white"
                            title="Edit Ticket"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteComplaint(ticket.id, ticket.ticketNo, e)}
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-white"
                            title="Delete Ticket"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="font-bold text-slate-900 dark:text-white">
                        {ticket.customerName}
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                        {ticket.issue}
                      </p>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500">
                        <span className="truncate max-w-[120px]">{ticket.assignedTo}</span>
                        <span className="font-semibold text-blue-600">{ticket.category}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resolution & Escalation Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-850 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600">{selectedComplaint.ticketNo}</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedComplaint.customerName} — {selectedComplaint.category}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => openEditModal(selectedComplaint)} 
                  className="p-1.5 rounded-lg border text-slate-600 hover:text-blue-600 hover:bg-slate-100 flex items-center gap-1 text-xs font-semibold"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button 
                  onClick={(e) => handleDeleteComplaint(selectedComplaint.id, selectedComplaint.ticketNo, e)} 
                  className="p-1.5 rounded-lg border text-slate-600 hover:text-red-600 hover:bg-slate-100 flex items-center gap-1 text-xs font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
                <button onClick={() => setSelectedComplaint(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
              <p><strong>Vehicle:</strong> {selectedComplaint.vehicle}</p>
              <p><strong>Phone:</strong> {selectedComplaint.phone}</p>
              <p><strong>Owner:</strong> {selectedComplaint.assignedTo}</p>
              <p><strong>Issue Reported:</strong> {selectedComplaint.issue}</p>
              <p><strong>Current Stage:</strong> <span className="font-bold text-blue-600">{selectedComplaint.stage}</span></p>
            </div>

            {selectedComplaint.escalationLevel === 'DEALER_PRINCIPAL' && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-xs flex items-center gap-2 text-red-800 dark:text-red-300 font-semibold">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                <span>Ticket escalated to Dealer Principal due to 48-hour SLA breach!</span>
              </div>
            )}

            {selectedComplaint.stage !== 'CLOSED' ? (
              <form onSubmit={handleCloseComplaint} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Resolution Note (Customer Sign-off Required)
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe action taken, goodwill discount, or part replacement..."
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const next = 
                        selectedComplaint.stage === 'OPEN' ? 'ASSIGNED' :
                        selectedComplaint.stage === 'ASSIGNED' ? 'UNDER_INVESTIGATION' : 'RESOLUTION_PROPOSED';
                      handleAdvanceStage(selectedComplaint.id, next);
                      setSelectedComplaint(null);
                    }}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-200"
                  >
                    Advance to Next Stage
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-sm"
                  >
                    Resolve &amp; Close Ticket
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs space-y-1 text-emerald-950 dark:text-emerald-200">
                <span className="font-bold flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" /> Resolution Completed
                </span>
                <p>{selectedComplaint.resolutionNote}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Log New Grievance Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-850 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquareWarning className="w-5 h-5 text-red-500" />
                Log New Customer Grievance
              </h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGrievance} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Murthy"
                    value={newGrievance.customerName}
                    onChange={(e) => setNewGrievance({ ...newGrievance, customerName: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-text-main"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98450 12345"
                    value={newGrievance.phone}
                    onChange={(e) => setNewGrievance({ ...newGrievance, phone: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-text-main font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Vehicle &amp; Reg No</label>
                  <input
                    type="text"
                    placeholder="e.g. Pulsar NS200 (KA-05-EV-4091)"
                    value={newGrievance.vehicle}
                    onChange={(e) => setNewGrievance({ ...newGrievance, vehicle: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-text-main"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Grievance Category</label>
                  <select
                    value={newGrievance.category}
                    onChange={(e) => setNewGrievance({ ...newGrievance, category: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-text-main"
                  >
                    <option value="Service Quality">Service Quality</option>
                    <option value="Billing Discrepancy">Billing Discrepancy</option>
                    <option value="Part Delay">Part Delay</option>
                    <option value="Delivery PDI">Delivery PDI</option>
                    <option value="Staff Behavior">Staff Behavior</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Issue Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the complaint reported by customer..."
                  value={newGrievance.issue}
                  onChange={(e) => setNewGrievance({ ...newGrievance, issue: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-text-main"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Assigned Case Officer</label>
                <input
                  type="text"
                  value={newGrievance.assignedTo}
                  onChange={(e) => setNewGrievance({ ...newGrievance, assignedTo: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-text-main"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3 py-1.5 rounded-lg border hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                >
                  Create Grievance Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Grievance Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-850 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Pencil className="w-5 h-5 text-blue-600" />
                Edit Grievance Ticket: {editingComplaint?.ticketNo}
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditComplaint} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Customer Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.customerName}
                    onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-text-main"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-text-main font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Vehicle &amp; Reg No</label>
                  <input
                    type="text"
                    value={editForm.vehicle}
                    onChange={(e) => setEditForm({ ...editForm, vehicle: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-text-main"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Stage</label>
                  <select
                    value={editForm.stage}
                    onChange={(e) => setEditForm({ ...editForm, stage: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-text-main"
                  >
                    <option value="OPEN">Open</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="UNDER_INVESTIGATION">Under Investigation</option>
                    <option value="RESOLUTION_PROPOSED">Resolution Proposed</option>
                    <option value="CLOSED">Closed &amp; Verified</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Grievance Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-text-main"
                  >
                    <option value="Service Quality">Service Quality</option>
                    <option value="Billing Discrepancy">Billing Discrepancy</option>
                    <option value="Part Delay">Part Delay</option>
                    <option value="Delivery PDI">Delivery PDI</option>
                    <option value="Staff Behavior">Staff Behavior</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Assigned Case Officer</label>
                  <input
                    type="text"
                    value={editForm.assignedTo}
                    onChange={(e) => setEditForm({ ...editForm, assignedTo: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-text-main"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Issue Description</label>
                <textarea
                  rows={2}
                  value={editForm.issue}
                  onChange={(e) => setEditForm({ ...editForm, issue: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-text-main"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Resolution Note</label>
                <textarea
                  rows={2}
                  placeholder="Resolution details or customer satisfaction comments..."
                  value={editForm.resolutionNote}
                  onChange={(e) => setEditForm({ ...editForm, resolutionNote: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-text-main"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-3 py-1.5 rounded-lg border hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                >
                  Save Ticket Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComplaintsPage;
