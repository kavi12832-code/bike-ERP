import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../store';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { getAvailableSlotsForDate, isDateBlockedForService, isSlotInPast } from '../../../lib/slots';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { formatDate } from '../../../lib/format';
import { PageHeader } from '../../../components/ui/PageHeader';
import { KpiCard } from '../../../components/ui/KpiCard';
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
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

export function AppointmentsPage() {
  const navigate = useNavigate();
  const appointments = useAppStore((state) => state.appointments || []);
  const jobCards = useAppStore((state) => state.jobCards || []);
  const cancelAppointment = useAppStore((state) => state.cancelAppointment);
  const bookAppointment = useAppStore((state) => state.bookAppointment);
  const updateAppointment = useAppStore((state) => state.updateAppointment);
  const deleteAppointment = useAppStore((state) => state.deleteAppointment);
  const servicePackages = useAppStore((state) => state.catalogs?.servicePackages || []);
  const packageNames = servicePackages.map((p) => p.name);
  const [deletingApt, setDeletingApt] = useState(null);

  // Slots with live availability for a date; `exceptId` frees the slot of the appointment being edited.
  const slotOptions = (date, exceptId = null) =>
    getAvailableSlotsForDate(date, appointments.filter((a) => a.id !== exceptId)).map((sl) => ({
      ...sl,
      isPast: isSlotInPast(date, sl.slot),
    }));
  const firstOpenSlot = (date) => slotOptions(date).find((sl) => !sl.isFull && !sl.isPast)?.slot || '';

  // Same rules the API enforces, checked before saving so the user gets an immediate message.
  const validateBooking = (form, exceptId = null) => {
    const digits = String(form.phone || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
    if (!form.customerName.trim()) return 'Customer name is required';
    if (!/^[6-9]\d{9}$/.test(digits)) return 'Enter a valid 10-digit mobile number';
    if (!/^[A-Z]{2}[ -]?\d{1,2}[ -]?[A-Z]{0,3}[ -]?\d{1,4}$/.test(form.registrationNumber.trim().toUpperCase())) {
      return 'Registration must look like KA-05-MN-4321';
    }
    if (isDateBlockedForService(form.date)) return 'The workshop is closed on Sundays';
    const slot = slotOptions(form.date, exceptId).find((sl) => sl.slot === form.timeSlot);
    if (!slot) return 'Pick a time slot';
    if (slot.isFull) return `The ${form.timeSlot} slot is fully booked`;
    if (slot.isPast && !(exceptId && form.timeSlot === editingApt?.timeSlot && form.date === editingApt?.date)) {
      return 'That slot has already started';
    }
    return null;
  };

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
    status: 'CONFIRMED',
    date: '',
  });

  const openEditModal = (apt) => {
    setEditingApt(apt);
    setEditForm({
      customerName: apt.customerName || '',
      phone: apt.phone || '',
      registrationNumber: apt.registrationNumber || '',
      modelName: apt.modelName || '',
      timeSlot: apt.timeSlot || '',
      packageName: apt.packageName || '',
      status: apt.status || 'CONFIRMED',
      date: apt.date || selectedDate,
    });
    setEditModalOpen(true);
  };

  const handleSaveEditAppointment = () => {
    const problem = editForm.status === 'CANCELLED' ? null : validateBooking(editForm, editingApt?.id);
    if (problem) {
      toast.error(problem);
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
    registrationNumber: '',
    modelName: '',
    timeSlot: '',
    packageName: '',
  });

  const handleQuickBook = async () => {
    const form = { ...quickForm, date: selectedDate };
    const problem = validateBooking(form);
    if (problem) {
      toast.error(problem);
      return;
    }
    try {
      await bookAppointment({
        date: selectedDate,
        customerName: form.customerName.trim(),
        phone: form.phone.trim(),
        registrationNumber: form.registrationNumber.trim().toUpperCase(),
        modelName: form.modelName.trim(),
        timeSlot: form.timeSlot,
        packageName: form.packageName,
        packageId: servicePackages.find((p) => p.name === form.packageName)?.id || '',
      });
      toast.success(`Service slot booked for ${form.customerName} on ${selectedDate} at ${form.timeSlot}.`);
      setQuickBookModalOpen(false);
      setQuickForm({ customerName: '', phone: '', registrationNumber: '', modelName: '', timeSlot: '', packageName: '' });
    } catch (err) {
      toast.error(`Could not book: ${err.message}`);
    }
  };

  const handleDeleteAppointment = () => {
    const apt = deletingApt;
    setDeletingApt(null);
    try {
      deleteAppointment(apt.id);
      toast.success(`Appointment for ${apt.customerName} deleted.`);
    } catch (err) {
      toast.error(err.message);
    }
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
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Workshop & Service', path: '/service/bays' },
          { label: 'Service Appointments', path: '/service' },
        ]}
        title="Workshop Service Appointments & Scheduling"
        subtitle="Manage customer service booking slots, capacity pacing, and one-click job card conversion."
        actions={
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
              className="bg-primary hover:bg-primary-hover text-white"
            >
              Full Job Card Intake
            </Button>
          </div>
        }
      />

      {/* 2. Plain KPI Cards per Section 0.5 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          label="Total Bookings on Record"
          value={`${appointments.length} Appointments`}
          helperText="All historical & scheduled"
          icon={<CalendarClock className="w-5 h-5 text-primary" />}
        />
        <KpiCard
          label="Scheduled for Date"
          value={`${appointments.filter((a) => a.date === selectedDate).length} Booked`}
          helperText={`Date: ${formatDate(selectedDate)}`}
          icon={<Clock className="w-5 h-5 text-blue-500" />}
        />
        <KpiCard
          label="Daily Booking Capacity"
          value={isSundayBlocked ? 'Closed (Sun)' : '48 Slots / Day'}
          helperText={isSundayBlocked ? 'Emergency towing only' : 'Workshop service ceiling'}
          icon={<Calendar className="w-5 h-5 text-amber-500" />}
        />
        <KpiCard
          label="Available Slots Today"
          value={isSundayBlocked ? '0 Slots' : `${slots.reduce((sum, s) => sum + s.available, 0)} Open`}
          helperText="Unoccupied technician bays"
          icon={<CheckCircle className="w-5 h-5 text-emerald-500" />}
        />
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
            const isFull = slot.isFull; // fields from lib/slots getAvailableSlotsForDate()
            return (
              <Card
                key={slot.slot}
                className={`p-3 border transition-all ${
                  isFull
                    ? 'bg-surface-subtle border-border opacity-60'
                    : 'bg-surface border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-text-main flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-text-muted" />
                    {slot.slot}
                  </span>
                  <span
                    className={`font-mono font-bold text-[11px] px-1.5 py-0.5 rounded ${
                      isFull
                        ? 'bg-red-50 text-status-red'
                        : 'bg-green-50 text-status-green'
                    }`}
                  >
                    {slot.availableBays} Left
                  </span>
                </div>
                <div className="w-full bg-surface-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isFull ? 'bg-status-red' : 'bg-status-green'}`}
                    style={{ width: `${(slot.bookedCount / slot.capacity) * 100}%` }}
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
                        {!apt.jobCardId && (
                          <button
                            onClick={() => setDeletingApt(apt)}
                            className="p-1.5 rounded text-text-muted hover:text-status-red hover:bg-red-50"
                            title="Delete appointment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
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
                                try {
                                  cancelAppointment(apt.id);
                                  toast.info(`Appointment for ${apt.customerName} cancelled.`);
                                } catch (err) {
                                  toast.error(err.message);
                                }
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
                <option value="">Select a slot</option>
                {slotOptions(selectedDate).map((sl) => (
                  <option key={sl.slot} value={sl.slot} disabled={sl.isFull || sl.isPast}>
                    {sl.slot} ({sl.isPast ? 'started' : sl.isFull ? 'full' : `${sl.availableBays} left`})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Service Package</label>
              <select
                value={quickForm.packageName}
                onChange={(e) => setQuickForm({ ...quickForm, packageName: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              >
                <option value="">Select a package</option>
                {packageNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
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
                <option value="">Select a slot</option>
                {slotOptions(editForm.date, editingApt?.id).map((sl) => (
                  <option key={sl.slot} value={sl.slot} disabled={sl.isFull && sl.slot !== editingApt?.timeSlot}>
                    {sl.slot} ({sl.isFull ? 'full' : `${sl.availableBays} left`})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              >
                <option value="CONFIRMED">Confirmed</option>
                <option value="NO_SHOW">No-show</option>
                <option value="CANCELLED">Cancelled</option>
                {editForm.status === 'CHECKED_IN' && (
                  <option value="CHECKED_IN">Checked in (has a job card)</option>
                )}
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
                <option value="">Select a package</option>
                {packageNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
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
      <ConfirmDialog
        isOpen={Boolean(deletingApt)}
        onClose={() => setDeletingApt(null)}
        onConfirm={handleDeleteAppointment}
        title="Delete appointment?"
        message={deletingApt
          ? `Delete the ${deletingApt.timeSlot} booking for ${deletingApt.customerName} (${deletingApt.registrationNumber})? To keep a record, cancel it instead.`
          : ''}
        confirmLabel="Delete appointment"
      />
    </div>
  );
}
