import React, { useState, useMemo } from 'react';
import { 
  LifeBuoy, 
  Truck, 
  MapPin, 
  Phone, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench, 
  BatteryCharging, 
  Plus, 
  Navigation,
  ShieldCheck,
  Search,
  X,
  Pencil,
  Trash2,
  PhoneCall,
} from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { KpiCard } from '../../../components/ui/KpiCard';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { formatMoney, formatPhone } from '../../../lib/format';
import { toast } from 'sonner';

import { useCollection, useCollectionItems } from '../../../hooks/useCollection';
// SAMPLE_SOS_REQUESTS: loaded from the database (collection "care.roadsideAssistance.sosRequests")

export function RoadsideAssistancePage() {
  const SAMPLE_SOS_REQUESTS = useCollectionItems('care.roadsideAssistance.sosRequests');
  const [requests, setRequests] = useCollection('care.roadsideAssistance.sosRequests');
  const [selectedTicket, setSelectedTicket] = useState(SAMPLE_SOS_REQUESTS[0]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [breakdownFilter, setBreakdownFilter] = useState('ALL');

  // Modals
  const [showLogModal, setShowLogModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);

  const [form, setForm] = useState({
    customerName: '',
    phone: '+91 ',
    landmark: '',
    gps: '12.9716° N, 77.5946° E',
    breakdownType: 'BATTERY_DEAD',
    vehicle: 'Royal Enfield Hunter 350 (KA-01-AB-1234)',
    technicianName: 'Manoj Kumar (Tech Team A)',
    towTruckAssigned: 'Tow Van #KA-01-T-882',
    etaMinutes: 20,
    status: 'DISPATCHED',
    isAmcCovered: true,
    chargesPaise: 0,
  });

  // Dynamic KPIs (Section 0.5: plain numbers, NO charts)
  const kpiStats = useMemo(() => {
    const total = requests.length;
    const active = requests.filter(r => r.status === 'LOGGED' || r.status === 'DISPATCHED' || r.status === 'REACHED').length;
    const resolved = requests.filter(r => r.status === 'RESOLVED_ON_SPOT' || r.status === 'TOWED').length;
    const amcCovered = requests.filter(r => r.isAmcCovered).length;

    return {
      total,
      active,
      resolved,
      amcCovered,
    };
  }, [requests]);

  const updateStatus = (id, newStatus) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    if (selectedTicket?.id === id) {
      setSelectedTicket(prev => ({ ...prev, status: newStatus }));
    }
    toast.success(`SOS ticket status updated to ${newStatus}`);
  };

  const handleOpenLogModal = () => {
    setForm({
      customerName: '',
      phone: '+91 ',
      landmark: '',
      gps: '12.9716° N, 77.5946° E',
      breakdownType: 'BATTERY_DEAD',
      vehicle: 'Royal Enfield Hunter 350 (KA-01-AB-1234)',
      technicianName: 'Manoj Kumar (Tech Team A)',
      towTruckAssigned: 'Tow Van #KA-01-T-882',
      etaMinutes: 20,
      status: 'DISPATCHED',
      isAmcCovered: true,
      chargesPaise: 0,
    });
    setShowLogModal(true);
  };

  const handleSaveLogCall = (e) => {
    e.preventDefault();
    if (!form.customerName.trim() || !form.phone.trim() || !form.landmark.trim()) {
      toast.error('Customer Name, Phone and Breakdown Landmark are required.');
      return;
    }

    const ticketNo = `SOS/2627/00${16 + requests.length}`;
    const newRequest = {
      id: `rsa-${Date.now().toString(36)}`,
      ticketNo,
      customerName: form.customerName.trim(),
      phone: form.phone.trim(),
      landmark: form.landmark.trim(),
      gps: form.gps.trim() || '12.9716° N, 77.5946° E',
      breakdownType: form.breakdownType,
      vehicle: form.vehicle.trim(),
      technicianName: form.technicianName,
      towTruckAssigned: form.towTruckAssigned,
      etaMinutes: Number(form.etaMinutes) || 20,
      status: form.status,
      isAmcCovered: form.isAmcCovered,
      chargesPaise: form.isAmcCovered ? 0 : Number(form.chargesPaise) * 100 || 150000,
      loggedAt: new Date().toISOString(),
    };

    setRequests(prev => [newRequest, ...prev]);
    setSelectedTicket(newRequest);
    toast.success(`Emergency SOS Call ${ticketNo} logged & fleet dispatched!`);
    setShowLogModal(false);
  };

  const handleOpenEditModal = (item, e) => {
    if (e) e.stopPropagation();
    setSelectedTicket(item);
    setForm({
      customerName: item.customerName,
      phone: item.phone,
      landmark: item.landmark,
      gps: item.gps,
      breakdownType: item.breakdownType,
      vehicle: item.vehicle,
      technicianName: item.technicianName,
      towTruckAssigned: item.towTruckAssigned,
      etaMinutes: item.etaMinutes,
      status: item.status,
      isAmcCovered: item.isAmcCovered,
      chargesPaise: Math.round(item.chargesPaise / 100),
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!form.customerName.trim() || !form.phone.trim()) {
      toast.error('Customer name and phone are required.');
      return;
    }

    const updated = {
      ...selectedTicket,
      customerName: form.customerName.trim(),
      phone: form.phone.trim(),
      landmark: form.landmark.trim(),
      gps: form.gps.trim(),
      breakdownType: form.breakdownType,
      vehicle: form.vehicle.trim(),
      technicianName: form.technicianName,
      towTruckAssigned: form.towTruckAssigned,
      etaMinutes: Number(form.etaMinutes) || 0,
      status: form.status,
      isAmcCovered: form.isAmcCovered,
      chargesPaise: form.isAmcCovered ? 0 : Number(form.chargesPaise) * 100,
    };

    setRequests(prev => prev.map(r => r.id === selectedTicket.id ? updated : r));
    setSelectedTicket(updated);
    toast.success(`SOS Incident ${selectedTicket.ticketNo} updated.`);
    setShowEditModal(false);
  };

  const promptDeleteTicket = (ticket, e) => {
    if (e) e.stopPropagation();
    setTicketToDelete(ticket);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (ticketToDelete) {
      setRequests(prev => prev.filter(r => r.id !== ticketToDelete.id));
      if (selectedTicket?.id === ticketToDelete.id) {
        setSelectedTicket(requests.find(r => r.id !== ticketToDelete.id) || null);
      }
      toast.success(`SOS Ticket ${ticketToDelete.ticketNo} removed.`);
    }
    setDeleteConfirmOpen(false);
    setTicketToDelete(null);
  };

  const filteredRequests = requests.filter(r => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (breakdownFilter !== 'ALL' && r.breakdownType !== breakdownFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.customerName.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        r.ticketNo.toLowerCase().includes(q) ||
        r.vehicle.toLowerCase().includes(q) ||
        r.landmark.toLowerCase().includes(q)
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
          { label: 'Roadside Assistance', path: '/care/roadside' },
        ]}
        title="24x7 Roadside Assistance & Towing Fleet (RSA)"
        subtitle="Emergency SOS breakdown dispatch, live technician ETA tracking & warranty/AMC complimentary check."
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleOpenLogModal}
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            Log Incoming SOS Call
          </Button>
        }
      />

      {/* 2. Plain KPI Cards Row (Section 0.5: NO charts, sparklines, or trend arrows) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          label="Total SOS Dispatches"
          value={kpiStats.total}
          helperText="All emergency breakdown calls"
          icon={<LifeBuoy className="w-5 h-5 text-rose-600" />}
        />
        <KpiCard
          label="Active In-Flight"
          value={kpiStats.active}
          helperText="Tow vans & rescue bikes en route"
          icon={<Truck className="w-5 h-5 text-amber-500" />}
        />
        <KpiCard
          label="Resolved on Spot"
          value={kpiStats.resolved}
          helperText="Towing or roadside fix completed"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        />
        <KpiCard
          label="AMC Covered"
          value={kpiStats.amcCovered}
          helperText="Zero towing charges applied"
          icon={<ShieldCheck className="w-5 h-5 text-blue-600" />}
        />
      </div>

      {/* 3. Search & Filter Bar */}
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
            <input
              type="text"
              placeholder="Search by ticket no, customer, phone, vehicle or landmark..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-input border border-border bg-surface text-text-main focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-input border border-border bg-surface text-text-main"
            >
              <option value="ALL">All Statuses</option>
              <option value="LOGGED">Logged</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="RESOLVED_ON_SPOT">Resolved On Spot</option>
              <option value="TOWED">Towed</option>
            </select>

            <select
              value={breakdownFilter}
              onChange={(e) => setBreakdownFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-input border border-border bg-surface text-text-main"
            >
              <option value="ALL">All Breakdowns</option>
              <option value="BATTERY_DEAD">Battery Dead</option>
              <option value="FLAT_TYRE">Flat Tyre</option>
              <option value="MECHANICAL">Mechanical Failure</option>
              <option value="ACCIDENT">Accident Assistance</option>
            </select>

            {(search || statusFilter !== 'ALL' || breakdownFilter !== 'ALL') && (
              <Button
                variant="ghost"
                size="sm"
                icon={X}
                onClick={() => {
                  setSearch('');
                  setStatusFilter('ALL');
                  setBreakdownFilter('ALL');
                }}
                className="text-text-muted hover:text-text-main"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 4. Active SOS Incident Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredRequests.length === 0 ? (
          <div className="col-span-3 p-8 text-center text-text-muted italic bg-surface rounded-xl border border-border">
            No roadside assistance requests match the current filters.
          </div>
        ) : (
          filteredRequests.map((item) => (
            <Card
              key={item.id}
              onClick={() => setSelectedTicket(item)}
              className={`p-5 transition-all cursor-pointer space-y-4 ${
                selectedTicket?.id === item.id
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'hover:border-border-hover'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {item.ticketNo}
                  </span>
                  <h3 className="text-sm font-bold text-text-main mt-1.5">
                    {item.customerName}
                  </h3>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.status === 'RESOLVED_ON_SPOT' || item.status === 'TOWED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.status === 'DISPATCHED'
                      ? 'bg-amber-100 text-amber-800 animate-pulse'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {item.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="text-xs space-y-1.5 text-text-muted">
                <div className="flex items-center gap-1.5 font-bold text-text-main">
                  {item.breakdownType === 'BATTERY_DEAD' && <BatteryCharging className="w-4 h-4 text-amber-500" />}
                  {item.breakdownType === 'MECHANICAL' && <Wrench className="w-4 h-4 text-rose-500" />}
                  {item.breakdownType === 'FLAT_TYRE' && <Truck className="w-4 h-4 text-blue-500" />}
                  <span>{item.vehicle}</span>
                </div>

                <div className="flex items-start gap-1.5 text-[11px] leading-relaxed">
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-text-muted" />
                  <span>{item.landmark}</span>
                </div>
              </div>

              <div className="p-3 bg-surface-subtle rounded-lg border border-border flex items-center justify-between text-xs">
                <div>
                  <span className="text-text-muted block text-[10px]">ETA to Scene</span>
                  <span className="font-bold font-mono text-rose-600">
                    {item.etaMinutes > 0 ? `${item.etaMinutes} Mins` : 'Scene Reached'}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-text-muted block text-[10px]">Towing Charges</span>
                  <span className="font-bold text-text-main">
                    {item.isAmcCovered ? (
                      <strong className="text-emerald-600">₹0 (AMC Covered)</strong>
                    ) : (
                      formatMoney(item.chargesPaise)
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                <a
                  href={`tel:${item.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-emerald-600 font-bold hover:underline"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> Call Customer
                </a>

                <div className="flex items-center gap-1">
                  {item.status === 'DISPATCHED' && (
                    <Button
                      size="xs"
                      variant="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateStatus(item.id, 'RESOLVED_ON_SPOT');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Resolve
                    </Button>
                  )}
                  <Button
                    size="xs"
                    variant="ghost"
                    icon={Pencil}
                    onClick={(e) => handleOpenEditModal(item, e)}
                    title="Edit SOS Details"
                  />
                  <Button
                    size="xs"
                    variant="ghost"
                    icon={Trash2}
                    onClick={(e) => promptDeleteTicket(item, e)}
                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                    title="Delete Incident"
                  />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* 5. Selected Incident Dossier */}
      {selectedTicket && (
        <Card className="p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
            <div>
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                Active Incident Dossier &amp; GPS Telemetry
              </span>
              <h2 className="text-base font-bold text-text-main mt-0.5">
                {selectedTicket.ticketNo} — {selectedTicket.customerName} ({selectedTicket.vehicle})
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-surface-subtle border border-border font-mono text-text-muted">
                GPS: {selectedTicket.gps}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-surface-subtle border border-border rounded-lg space-y-1">
              <span className="text-text-muted block text-[11px]">Assigned Roadside Tech:</span>
              <span className="font-bold text-text-main">{selectedTicket.technicianName}</span>
            </div>
            <div className="p-3.5 bg-surface-subtle border border-border rounded-lg space-y-1">
              <span className="text-text-muted block text-[11px]">Towing Vehicle / Crane:</span>
              <span className="font-bold text-text-main">{selectedTicket.towTruckAssigned}</span>
            </div>
            <div className="p-3.5 bg-surface-subtle border border-border rounded-lg space-y-1">
              <span className="text-text-muted block text-[11px]">Warranty / AMC Eligibility:</span>
              <span className="font-bold text-emerald-600">
                {selectedTicket.isAmcCovered ? 'Verified Active Plan (Zero Charges)' : 'Standard Commercial Towing Rate'}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* 6. Log Incoming SOS Call Modal */}
      <Modal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        title="Log Incoming Emergency SOS Call"
        size="md"
      >
        <form onSubmit={handleSaveLogCall} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Customer Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Ramesh Hegde"
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

          <div>
            <label className="font-semibold text-text-main block mb-1">Breakdown Location / Landmark *</label>
            <textarea
              rows={2}
              placeholder="e.g. Outer Ring Road, near Marathahalli Bridge underpass..."
              value={form.landmark}
              onChange={(e) => setForm({ ...form, landmark: e.target.value })}
              className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Vehicle Model &amp; Reg</label>
              <input
                type="text"
                value={form.vehicle}
                onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Breakdown Category</label>
              <select
                value={form.breakdownType}
                onChange={(e) => setForm({ ...form, breakdownType: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              >
                <option value="BATTERY_DEAD">Battery Dead / Jumpstart</option>
                <option value="FLAT_TYRE">Flat Tyre / Puncture</option>
                <option value="MECHANICAL">Mechanical Engine Failure</option>
                <option value="ACCIDENT">Accident Collision</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Assigned Technician</label>
              <select
                value={form.technicianName}
                onChange={(e) => setForm({ ...form, technicianName: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              >
                <option value="Manoj Kumar (Tech Team A)">Manoj Kumar (Tech Team A)</option>
                <option value="Suresh Gowda (Tow Specialist)">Suresh Gowda (Tow Specialist)</option>
                <option value="Ramesh Kumar (Quick Response)">Ramesh Kumar (Quick Response)</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Estimated Arrival (Minutes)</label>
              <input
                type="number"
                value={form.etaMinutes}
                onChange={(e) => setForm({ ...form, etaMinutes: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-surface-subtle border border-border rounded-lg">
            <input
              type="checkbox"
              id="amcCheck"
              checked={form.isAmcCovered}
              onChange={(e) => setForm({ ...form, isAmcCovered: e.target.checked })}
              className="rounded border-border text-primary"
            />
            <label htmlFor="amcCheck" className="font-semibold text-text-main cursor-pointer">
              Active Warranty / AMC Coverage Verified (Complimentary Zero Charge)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setShowLogModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="bg-rose-600 hover:bg-rose-700 text-white">
              Dispatch Roadside Team
            </Button>
          </div>
        </form>
      </Modal>

      {/* 7. Edit Incident Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit SOS Incident ${selectedTicket?.ticketNo}`}
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
              <label className="font-semibold text-text-main block mb-1">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-text-main block mb-1">Breakdown Location</label>
            <input
              type="text"
              value={form.landmark}
              onChange={(e) => setForm({ ...form, landmark: e.target.value })}
              className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Incident Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              >
                <option value="LOGGED">LOGGED</option>
                <option value="DISPATCHED">DISPATCHED</option>
                <option value="REACHED">REACHED</option>
                <option value="RESOLVED_ON_SPOT">RESOLVED ON SPOT</option>
                <option value="TOWED">TOWED TO WORKSHOP</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">ETA (Minutes)</label>
              <input
                type="number"
                value={form.etaMinutes}
                onChange={(e) => setForm({ ...form, etaMinutes: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="bg-primary hover:bg-primary-hover text-white">
              Update Incident
            </Button>
          </div>
        </form>
      </Modal>

      {/* 8. Delete Confirmation */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirm Incident Deletion"
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-text-muted leading-relaxed">
            Are you sure you want to permanently delete SOS ticket{' '}
            <strong className="text-text-main">{ticketToDelete?.ticketNo}</strong> for{' '}
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

export default RoadsideAssistancePage;
