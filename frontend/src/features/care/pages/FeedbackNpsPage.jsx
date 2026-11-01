import React, { useState, useMemo } from 'react';
import { 
  Star, 
  Smile, 
  Meh, 
  Frown, 
  CheckCircle2, 
  AlertTriangle, 
  Phone, 
  Send, 
  Filter, 
  MessageSquare,
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  Award,
  ThumbsUp,
} from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { KpiCard } from '../../../components/ui/KpiCard';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { formatDate } from '../../../lib/format';
import { toast } from 'sonner';

const SAMPLE_FEEDBACK = [
  {
    id: 'fb-01',
    customerName: 'Priya Singh',
    phone: '+91 98450 12345',
    type: 'DELIVERY', // DELIVERY or SERVICE
    vehicle: 'Royal Enfield Himalayan 450',
    rating: 5,
    npsScore: 10, // 0 to 10
    comment: 'Flawless delivery experience by Deepak! Vehicle was polished, all documents ready on time.',
    date: '2026-10-24',
    escalatedToComplaint: false,
  },
  {
    id: 'fb-02',
    customerName: 'Girish Patil',
    phone: '+91 97402 33445',
    type: 'SERVICE',
    vehicle: 'Honda SP125',
    rating: 2,
    npsScore: 3,
    comment: 'Service took 4 hours more than promised and water wash was poorly done. Chain was not greased.',
    date: '2026-10-23',
    escalatedToComplaint: true,
    complaintOwner: 'Karthik Raja (Service Manager)',
  },
  {
    id: 'fb-03',
    customerName: 'Arjun Das',
    phone: '+91 98860 99441',
    type: 'DELIVERY',
    vehicle: 'Royal Enfield Hunter 350',
    rating: 5,
    npsScore: 10,
    comment: 'PDI was detailed and explained clearly. Excellent tea and showroom ambiance.',
    date: '2026-10-22',
    escalatedToComplaint: false,
  },
  {
    id: 'fb-04',
    customerName: 'Ramesh Shenoy',
    phone: '+91 99001 55667',
    type: 'SERVICE',
    vehicle: 'TVS iQube EV',
    rating: 3,
    npsScore: 5,
    comment: 'Good staff but software update took too long due to OEM server slowness.',
    date: '2026-10-21',
    escalatedToComplaint: true,
    complaintOwner: 'Ananya Sharma',
  },
  {
    id: 'fb-05',
    customerName: 'Anil Deshmukh',
    phone: '+91 98440 88991',
    type: 'SERVICE',
    vehicle: 'Royal Enfield Classic 350',
    rating: 5,
    npsScore: 9,
    comment: 'Manoj Kumar did fantastic tuning on the tappets. Bike feels brand new.',
    date: '2026-10-20',
    escalatedToComplaint: false,
  }
];

export function FeedbackNpsPage() {
  const [feedbackList, setFeedbackList] = useState(SAMPLE_FEEDBACK);
  const [filterType, setFilterType] = useState('ALL');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [form, setForm] = useState({
    customerName: '',
    phone: '+91 ',
    type: 'SERVICE',
    vehicle: 'Royal Enfield Hunter 350',
    rating: 5,
    npsScore: 9,
    comment: '',
  });

  // Dynamic NPS calculation from store/state (Section 0.4: plain numbers, NO charts)
  const kpiStats = useMemo(() => {
    const total = feedbackList.length;
    if (total === 0) return { total: 0, nps: 0, avgCsat: '0.0', promoters: 0, detractors: 0, escalated: 0 };

    const promoters = feedbackList.filter(f => f.npsScore >= 9).length;
    const passives = feedbackList.filter(f => f.npsScore >= 7 && f.npsScore <= 8).length;
    const detractors = feedbackList.filter(f => f.npsScore <= 6).length;

    const nps = Math.round(((promoters - detractors) / total) * 100);
    const avgCsat = (feedbackList.reduce((sum, f) => sum + (Number(f.rating) || 0), 0) / total).toFixed(1);
    const escalated = feedbackList.filter(f => f.escalatedToComplaint).length;

    return {
      total,
      nps,
      avgCsat,
      promoters,
      detractors,
      escalated,
    };
  }, [feedbackList]);

  const handleOpenAdd = () => {
    setForm({
      customerName: '',
      phone: '+91 ',
      type: 'SERVICE',
      vehicle: 'Royal Enfield Hunter 350',
      rating: 5,
      npsScore: 9,
      comment: '',
    });
    setShowAddModal(true);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!form.customerName.trim() || !form.phone.trim()) {
      toast.error('Customer Name and Phone are required.');
      return;
    }

    const ratingNum = Number(form.rating);
    const npsNum = Number(form.npsScore);
    const autoEscalate = ratingNum <= 3;

    const newFeedback = {
      id: `fb-${Date.now().toString(36)}`,
      customerName: form.customerName.trim(),
      phone: form.phone.trim(),
      type: form.type,
      vehicle: form.vehicle.trim() || 'Royal Enfield',
      rating: ratingNum,
      npsScore: npsNum,
      comment: form.comment.trim() || 'No additional comments provided.',
      date: new Date().toISOString().split('T')[0],
      escalatedToComplaint: autoEscalate,
      complaintOwner: autoEscalate ? 'Karthik Raja (Service Manager)' : undefined,
    };

    setFeedbackList(prev => [newFeedback, ...prev]);
    toast.success(`Survey response recorded from ${form.customerName}!`);
    if (autoEscalate) {
      toast.error(`Low rating (<=3 stars) auto-escalated to Service Manager!`);
    }
    setShowAddModal(false);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setForm({
      customerName: item.customerName,
      phone: item.phone,
      type: item.type,
      vehicle: item.vehicle,
      rating: item.rating,
      npsScore: item.npsScore,
      comment: item.comment,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!form.customerName.trim() || !form.phone.trim()) {
      toast.error('Customer name and phone are required.');
      return;
    }

    setFeedbackList(prev => prev.map(f => {
      if (f.id !== editingItem.id) return f;
      return {
        ...f,
        customerName: form.customerName.trim(),
        phone: form.phone.trim(),
        type: form.type,
        vehicle: form.vehicle.trim(),
        rating: Number(form.rating),
        npsScore: Number(form.npsScore),
        comment: form.comment.trim(),
      };
    }));

    toast.success(`Feedback from ${form.customerName} updated.`);
    setShowEditModal(false);
    setEditingItem(null);
  };

  const promptDelete = (item) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      setFeedbackList(prev => prev.filter(f => f.id !== itemToDelete.id));
      toast.success(`Survey response deleted.`);
    }
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const handleManualEscalation = (item) => {
    toast.success(`Complaint ticket created for ${item.customerName}! Assigned to Service Manager.`);
    setFeedbackList(prev => prev.map(f => f.id === item.id ? { ...f, escalatedToComplaint: true, complaintOwner: 'Service Manager' } : f));
  };

  const filtered = feedbackList.filter(f => {
    if (filterType !== 'ALL' && f.type !== filterType) return false;
    if (ratingFilter !== 'ALL') {
      if (ratingFilter === 'HIGH' && f.rating < 4) return false;
      if (ratingFilter === 'LOW' && f.rating > 3) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        f.customerName.toLowerCase().includes(q) ||
        f.phone.includes(q) ||
        f.vehicle.toLowerCase().includes(q) ||
        f.comment.toLowerCase().includes(q)
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
          { label: 'Feedback & NPS', path: '/care/feedback' },
        ]}
        title="Customer Feedback & Net Promoter Score (NPS)"
        subtitle="Automated post-delivery & post-service survey sentiment, CSAT rating & low-score complaint escalation."
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleOpenAdd}
            className="bg-primary hover:bg-primary-hover text-white"
          >
            Log Survey Response
          </Button>
        }
      />

      {/* 2. Plain KPI Cards Row (Section 0.5: NO charts, sparklines, or trend arrows) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          label="Net Promoter Score"
          value={kpiStats.nps >= 0 ? `+${kpiStats.nps}` : `${kpiStats.nps}`}
          helperText={`${kpiStats.promoters} Promoters • ${kpiStats.detractors} Detractors`}
          icon={<ThumbsUp className="w-5 h-5 text-emerald-600" />}
        />
        <KpiCard
          label="Average CSAT Rating"
          value={`${kpiStats.avgCsat} / 5.0`}
          helperText={`Based on ${kpiStats.total} customer surveys`}
          icon={<Star className="w-5 h-5 text-amber-500 fill-amber-500" />}
        />
        <KpiCard
          label="Promoter Share"
          value={`${kpiStats.total > 0 ? Math.round((kpiStats.promoters / kpiStats.total) * 100) : 0}%`}
          helperText="Customers rating 9-10 / 10 NPS"
          icon={<Smile className="w-5 h-5 text-emerald-600" />}
        />
        <KpiCard
          label="Detractor Escalations"
          value={kpiStats.escalated}
          helperText="Automated urgent tickets logged"
          icon={<AlertTriangle className="w-5 h-5 text-rose-500" />}
        />
      </div>

      {/* 3. Search & Filter Bar */}
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
            <input
              type="text"
              placeholder="Search feedback by customer, phone, vehicle or comment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-input border border-border bg-surface text-text-main focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-input border border-border bg-surface text-text-main"
            >
              <option value="ALL">All Touchpoints</option>
              <option value="DELIVERY">Delivery Handover</option>
              <option value="SERVICE">Workshop Service</option>
            </select>

            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-input border border-border bg-surface text-text-main"
            >
              <option value="ALL">All Ratings</option>
              <option value="HIGH">High (4-5 Stars)</option>
              <option value="LOW">Detractors (&le; 3 Stars)</option>
            </select>

            {(search || filterType !== 'ALL' || ratingFilter !== 'ALL') && (
              <Button
                variant="ghost"
                size="sm"
                icon={X}
                onClick={() => {
                  setSearch('');
                  setFilterType('ALL');
                  setRatingFilter('ALL');
                }}
                className="text-text-muted hover:text-text-main"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 4. Survey Responses Feed */}
      <Card className="overflow-hidden">
        <div className="p-3.5 bg-surface-subtle border-b border-border font-bold text-xs text-text-muted uppercase tracking-wider flex items-center justify-between">
          <span>Recent Customer Feedback Logs ({filtered.length})</span>
          <span className="text-[11px] font-normal lowercase">ratings &le;3 stars auto-escalate to complaint desk</span>
        </div>

        <div className="divide-y divide-border">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-text-muted italic">
              No feedback responses match the selected filters.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-subtle/50 transition-colors"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.type === 'DELIVERY'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {item.type}
                    </span>
                    <h3 className="text-sm font-bold text-text-main">
                      {item.customerName}
                    </h3>
                    <div className="flex text-amber-500">
                      {Array.from({ length: item.rating }).map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 fill-amber-500" />
                      ))}
                    </div>
                    <span className="text-[11px] text-text-muted font-mono font-bold">
                      NPS: {item.npsScore}/10
                    </span>
                  </div>

                  <p className="text-xs text-text-muted italic leading-relaxed">
                    "{item.comment}"
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-text-muted pt-1">
                    <span>Phone: {item.phone}</span>
                    <span>•</span>
                    <span>Vehicle: {item.vehicle}</span>
                    <span>•</span>
                    <span>Date: {item.date}</span>
                  </div>
                </div>

                {/* Status & Escalation Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
                  {item.rating <= 3 ? (
                    item.escalatedToComplaint ? (
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          <AlertTriangle className="w-3.5 h-3.5" /> Complaint Active
                        </span>
                        <div className="text-[10px] text-text-muted mt-0.5">{item.complaintOwner}</div>
                      </div>
                    ) : (
                      <Button
                        size="xs"
                        variant="danger"
                        onClick={() => handleManualEscalation(item)}
                      >
                        Escalate to Complaint
                      </Button>
                    )
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Satisfied Customer
                    </span>
                  )}

                  <Button
                    size="xs"
                    variant="outline"
                    icon={Pencil}
                    onClick={() => handleOpenEdit(item)}
                    title="Edit Feedback"
                  />
                  <Button
                    size="xs"
                    variant="ghost"
                    icon={Trash2}
                    onClick={() => promptDelete(item)}
                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                    title="Delete Feedback"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* 5. Log Survey Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Record Customer Survey Response"
        size="md"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Customer Name *</label>
              <input
                type="text"
                placeholder="e.g. Suresh Gowda"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Mobile Phone *</label>
              <input
                type="text"
                placeholder="+91 98450 00000"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Survey Touchpoint</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              >
                <option value="SERVICE">Workshop General Service</option>
                <option value="DELIVERY">New Bike Delivery Handover</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Vehicle Model</label>
              <input
                type="text"
                value={form.vehicle}
                onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">CSAT Rating (1 to 5 Stars)</label>
              <select
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-bold"
              >
                <option value={5}>⭐⭐⭐⭐⭐ 5 - Excellent</option>
                <option value={4}>⭐⭐⭐⭐ 4 - Good</option>
                <option value={3}>⭐⭐⭐ 3 - Average (Auto Escalate)</option>
                <option value={2}>⭐⭐ 2 - Poor (Auto Escalate)</option>
                <option value={1}>⭐ 1 - Very Poor (Auto Escalate)</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">NPS Score (0 to 10)</label>
              <input
                type="number"
                min={0}
                max={10}
                value={form.npsScore}
                onChange={(e) => setForm({ ...form, npsScore: Number(e.target.value) })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-bold"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-text-main block mb-1">Customer Verbatim Feedback</label>
            <textarea
              rows={3}
              placeholder="Customer's direct comments, praise or complaint..."
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="bg-primary hover:bg-primary-hover text-white">
              Save Survey Feedback
            </Button>
          </div>
        </form>
      </Modal>

      {/* 6. Edit Survey Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Customer Feedback Record"
        size="md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Customer Name</label>
              <input
                type="text"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Phone Number</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">CSAT Rating</label>
              <select
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-bold"
              >
                <option value={5}>5 Stars</option>
                <option value={4}>4 Stars</option>
                <option value={3}>3 Stars</option>
                <option value={2}>2 Stars</option>
                <option value={1}>1 Star</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">NPS Score (0-10)</label>
              <input
                type="number"
                min={0}
                max={10}
                value={form.npsScore}
                onChange={(e) => setForm({ ...form, npsScore: Number(e.target.value) })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-bold"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-text-main block mb-1">Comments</label>
            <textarea
              rows={3}
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="bg-primary hover:bg-primary-hover text-white">
              Update Feedback
            </Button>
          </div>
        </form>
      </Modal>

      {/* 7. Delete Confirmation */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirm Feedback Deletion"
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-text-muted leading-relaxed">
            Are you sure you want to permanently delete the survey feedback from{' '}
            <strong className="text-text-main">{itemToDelete?.customerName}</strong>?
          </p>
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default FeedbackNpsPage;
