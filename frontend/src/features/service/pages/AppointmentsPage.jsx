import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../store';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { getAvailableSlotsForDate, isDateBlockedForService } from '../../../lib/slots';
import { formatDate } from '../../../lib/format';
import { relativeDateString } from '../../../lib/dates';
import {
  CalendarClock,
  PlusCircle,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle,
  FilePlus2,
  ExternalLink,
  XCircle,
  Plus,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';

export function AppointmentsPage() {
  const navigate = useNavigate();
  const appointments = useAppStore((state) => state.appointments || []);
  const jobCards = useAppStore((state) => state.jobCards || []);
  const cancelAppointment = useAppStore((state) => state.cancelAppointment);
  const bookAppointment = useAppStore((state) => state.bookAppointment);
  const updateAppointment = useAppStore((state) => state.updateAppointment);

  // Was hardcoded to 2026-10-26, which hid every booking made on any other day.
  const [selectedDate, setSelectedDate] = useState(relativeDateString(0));
  const isSundayBlocked = isDateBlockedForService(selectedDate);
  const slots = getAvailableSlotsForDate(selectedDate, appointments);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingApt, setEditingApt] = useState(null);
  const [editForm, setEditForm] = useState({
    customerName: '',
    phone: '',
    registrationNumber: '',
    modelName: '',
    timeSlot: '',
    packageName: '',
    status: 'SCHEDULED',
    date: '',
  });

  const openEditModal = (apt) => {
    setEditingApt(apt);
    setEditForm({
      customerName: apt.customerName || '',
      phone: apt.phone || '',
      registrationNumber: apt.registrationNumber || '',
      modelName: apt.modelName || '',
      timeSlot: apt.timeSlot || '09:30 - 10:30 AM',
      packageName: apt.packageName || 'PMS Paid Service #2 (10,000 KM)',
      status: apt.status || 'SCHEDULED',
      date: apt.date || selectedDate,
    });
    setEditModalOpen(true);
  };

  const handleSaveEditAppointment = () => {
    if (!editForm.customerName.trim() || !editForm.phone.trim()) {
      toast.error('Customer name and phone number are required');
      return;
    }
    if (updateAppointment && editingApt) {
      updateAppointment(editingApt.id, {
        customerName: editForm.customerName,
        phone: editForm.phone,
        registrationNumber: editForm.registrationNumber.toUpperCase(),
        modelName: editForm.modelName,
        timeSlot: editForm.timeSlot,
        packageName: editForm.packageName,
        status: editForm.status,
        date: editForm.date,
      });
      toast.success(`Service appointment updated for ${editForm.customerName}!`);
    }
    setEditModalOpen(false);
  };

  const [quickBookModalOpen, setQuickBookModalOpen] = useState(false);
  const [quickForm, setQuickForm] = useState({
    customerName: '',
    phone: '',
    registrationNumber: 'KA-05-EV-4091',
    modelName: 'Pulsar NS200',
    timeSlot: '09:30 - 10:30 AM',
    packageName: 'PMS Paid Service #2 (10,000 KM)',
    estimatedCostRupees: 1850,
  });

  const handleQuickBook = async () => {
    if (!quickForm.customerName.trim() || !quickForm.phone.trim() || !quickForm.registrationNumber.trim()) {
      toast.error('Customer name, phone, and registration number are mandatory');
      return;
    }
    if (bookAppointment) {
      await bookAppointment({
        date: selectedDate,
        customerName: quickForm.customerName,
        phone: quickForm.phone,
        registrationNumber: quickForm.registrationNumber.toUpperCase(),
        modelName: quickForm.modelName,
        timeSlot: quickForm.timeSlot,
        packageName: quickForm.packageName,
        estimatedCostPaise: quickForm.estimatedCostRupees * 100,
      });
      toast.success(`Service Slot booked for ${quickForm.customerName} on ${selectedDate} at ${quickForm.timeSlot}!`);
    }
    setQuickBookModalOpen(false);
  };

  // Booking opens the full Create Vehicle Service Job Card form for the selected date.
  const startBooking = () => {
    if (isSundayBlocked) {
      toast.error('Workshop is closed on Sundays for routine periodic maintenance.');
      return;
    }
    navigate(`/service/jobs/new?book=1&date=${selectedDate}`);
  };

  const openJobCard = (apt) => {
    const card = jobCards.find((jc) => jc.id === apt.jobCardId);
    if (card?.stage === 'DRAFT') navigate(`/service/jobs/new?draft=${card.id}`);
    else if (card) navigate('/service/jobs');
    else navigate(`/service/jobs/new?appointment=${apt.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-primary" />
            Workshop Service Appointments &amp; Capacity
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Strict bay slot capacity quotas (12 bays), operating hours &amp; Sunday holiday rules
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={() => setQuickBookModalOpen(true)}
          >
            Quick Slot Booking
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={PlusCircle}
            onClick={startBooking}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Full Job Card Intake
          </Button>
        </div>
      </div>

      {/* Date Selector Banner */}
      <div className="flex items-center justify-between p-4 bg-surface rounded-card border border-border shadow-soft">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary" />
          <div>
            <label className="text-xs font-semibold text-text-main block">Appointment Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs p-1.5 rounded border border-border bg-surface-subtle text-text-main font-semibold"
            />
          </div>
        </div>

        {isSundayBlocked ? (
          <div className="flex items-center gap-2 p-2 rounded bg-amber-50 border border-amber-200 text-status-amber text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Sundays are closed for general servicing (emergency towing only)</span>
          </div>
        ) : (
          <div className="text-right">
            <span className="text-xs text-text-muted block">Daily Booking Cap:</span>
            <span className="text-base font-bold text-status-green tabular-nums">48 Slots / Day</span>
          </div>
        )}
      </div>

      {/* Live Slot Capacity Grid */}
      {!isSundayBlocked && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {slots.map((slot) => {
            const isFull = slot.available === 0;
            return (
              <Card
                key={slot.time}
                className={`p-3 border transition-all ${
                  isFull
                    ? 'bg-surface-subtle border-border opacity-60'
                    : 'bg-surface border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-text-main flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-text-muted" />
                    {slot.time}
                  </span>
                  <span
                    className={`font-mono font-bold text-[11px] px-1.5 py-0.5 rounded ${
                      isFull
                        ? 'bg-red-50 text-status-red'
                        : 'bg-green-50 text-status-green'
                    }`}
                  >
                    {slot.available} Left
                  </span>
                </div>
                <div className="w-full bg-surface-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isFull ? 'bg-status-red' : 'bg-status-green'}`}
                    style={{ width: `${(slot.booked / slot.capacity) * 100}%` }}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Appointments List Table */}
      <Card className="overflow-hidden p-0">
        <div className="p-4 bg-surface-subtle border-b border-border flex items-center justify-between">
          <div className="font-semibold text-text-main text-sm">
            Scheduled Appointments for {formatDate(selectedDate)}
          </div>
          <span className="text-xs text-text-muted">
            {appointments.filter((a) => a.date === selectedDate).length} Bookings on Record
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface-subtle border-b border-border text-text-muted uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Contact Phone</th>
                <th className="p-3.5">Registration No</th>
                <th className="p-3.5">Bike Model</th>
                <th className="p-3.5">Slot Time</th>
                <th className="p-3.5">Service Package</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {appointments.filter((a) => a.date === selectedDate).length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-text-muted">
                    No service appointments scheduled for this date.
                  </td>
                </tr>
              )}
              {appointments
                .filter((a) => a.date === selectedDate)
                .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
                .map((apt) => (
                  <tr key={apt.id} className="hover:bg-surface-subtle/70 transition-colors">
                    <td className="p-3.5 font-bold text-text-main">{apt.customerName}</td>
                    <td className="p-3.5 font-mono text-text-muted">{apt.phone}</td>
                    <td className="p-3.5 font-mono font-bold text-primary">{apt.registrationNumber}</td>
                    <td className="p-3.5 text-text-main">{apt.modelName}</td>
                    <td className="p-3.5 font-medium tabular-nums">{apt.timeSlot}</td>
                    <td className="p-3.5 text-text-muted">{apt.packageName}</td>
                    <td className="p-3.5">
                      <StatusBadge status={apt.status} />
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => openEditModal(apt)}
                          className="p-1.5 rounded text-text-muted hover:text-primary hover:bg-surface-subtle"
                          title="Edit / Reschedule Appointment"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {apt.jobCardId ? (
                          <button
                            onClick={() => openJobCard(apt)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline px-1.5 py-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> View Job Card
                          </button>
                        ) : apt.status !== 'CANCELLED' ? (
                          <>
                            <Button size="sm" variant="primary" icon={FilePlus2} onClick={() => openJobCard(apt)}>
                              Create Job Card
                            </Button>
                            <button
                              onClick={() => {
                                cancelAppointment(apt.id);
                                toast.info(`Appointment for ${apt.customerName} cancelled.`);
                              }}
                              className="p-1.5 rounded text-text-muted hover:text-status-red hover:bg-red-50"
                              title="Cancel appointment"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-text-muted italic">Cancelled</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Booking Modal */}
      <Modal
        isOpen={quickBookModalOpen}
        onClose={() => setQuickBookModalOpen(false)}
        title="Quick Service Slot Allocation"
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Customer Full Name</label>
              <input
                type="text"
                value={quickForm.customerName}
                onChange={(e) => setQuickForm({ ...quickForm, customerName: e.target.value })}
                placeholder="e.g. Suresh Kumar"
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Contact Phone</label>
              <input
                type="text"
                value={quickForm.phone}
                onChange={(e) => setQuickForm({ ...quickForm, phone: e.target.value })}
                placeholder="e.g. +91 98450 12345"
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Vehicle Registration No</label>
              <input
                type="text"
                value={quickForm.registrationNumber}
                onChange={(e) => setQuickForm({ ...quickForm, registrationNumber: e.target.value.toUpperCase() })}
                placeholder="e.g. KA-05-EV-4091"
                className="w-full p-2.5 font-mono uppercase font-bold rounded-input border border-border bg-surface text-text-main"
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Bike Model</label>
              <input
                type="text"
                value={quickForm.modelName}
                onChange={(e) => setQuickForm({ ...quickForm, modelName: e.target.value })}
                placeholder="e.g. Pulsar NS200"
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Time Slot Window</label>
              <select
                value={quickForm.timeSlot}
                onChange={(e) => setQuickForm({ ...quickForm, timeSlot: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              >
                <option value="08:30 - 09:30 AM">08:30 - 09:30 AM</option>
                <option value="09:30 - 10:30 AM">09:30 - 10:30 AM</option>
                <option value="10:30 - 11:30 AM">10:30 - 11:30 AM</option>
                <option value="11:30 - 12:30 PM">11:30 - 12:30 PM</option>
                <option value="02:00 - 03:00 PM">02:00 - 03:00 PM</option>
                <option value="03:00 - 04:00 PM">03:00 - 04:00 PM</option>
                <option value="04:00 - 05:00 PM">04:00 - 05:00 PM</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Service Package</label>
              <select
                value={quickForm.packageName}
                onChange={(e) => setQuickForm({ ...quickForm, packageName: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              >
                <option value="PMS Free Service #1 (1,000 KM)">PMS Free Service #1 (1,000 KM)</option>
                <option value="PMS Paid Service #2 (10,000 KM)">PMS Paid Service #2 (10,000 KM)</option>
                <option value="Express Oil & Filter Change">Express Oil &amp; Filter Change</option>
                <option value="General Mechanical Inspection">General Mechanical Inspection</option>
                <option value="Chain Sprocket & Brake Overhaul">Chain Sprocket &amp; Brake Overhaul</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setQuickBookModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleQuickBook} className="bg-blue-600 text-white">
              Confirm Slot Reservation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit / Reschedule Appointment Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit / Reschedule Service Appointment"
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Customer Full Name</label>
              <input
                type="text"
                value={editForm.customerName}
                onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Contact Phone</label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Registration No</label>
              <input
                type="text"
                value={editForm.registrationNumber}
                onChange={(e) => setEditForm({ ...editForm, registrationNumber: e.target.value.toUpperCase() })}
                className="w-full p-2.5 font-mono uppercase font-bold rounded-input border border-border bg-surface text-text-main"
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Bike Model</label>
              <input
                type="text"
                value={editForm.modelName}
                onChange={(e) => setEditForm({ ...editForm, modelName: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Appointment Date</label>
              <input
                type="date"
                value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Time Slot Window</label>
              <select
                value={editForm.timeSlot}
                onChange={(e) => setEditForm({ ...editForm, timeSlot: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              >
                <option value="08:30 - 09:30 AM">08:30 - 09:30 AM</option>
                <option value="09:30 - 10:30 AM">09:30 - 10:30 AM</option>
                <option value="10:30 - 11:30 AM">10:30 - 11:30 AM</option>
                <option value="11:30 - 12:30 PM">11:30 - 12:30 PM</option>
                <option value="02:00 - 03:00 PM">02:00 - 03:00 PM</option>
                <option value="03:00 - 04:00 PM">03:00 - 04:00 PM</option>
                <option value="04:00 - 05:00 PM">04:00 - 05:00 PM</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              >
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="IN_SERVICE">IN_SERVICE</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-text-main block mb-1">Service Package</label>
            <select
              value={editForm.packageName}
              onChange={(e) => setEditForm({ ...editForm, packageName: e.target.value })}
              className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
            >
              <option value="PMS Free Service #1 (1,000 KM)">PMS Free Service #1 (1,000 KM)</option>
              <option value="PMS Paid Service #2 (10,000 KM)">PMS Paid Service #2 (10,000 KM)</option>
              <option value="Express Oil & Filter Change">Express Oil &amp; Filter Change</option>
              <option value="General Mechanical Inspection">General Mechanical Inspection</option>
              <option value="Chain Sprocket & Brake Overhaul">Chain Sprocket &amp; Brake Overhaul</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveEditAppointment} className="bg-primary text-white">
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
