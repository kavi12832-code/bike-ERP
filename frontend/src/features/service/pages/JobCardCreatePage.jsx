import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import { toast } from 'sonner';
import {
  ArrowLeft,
  CalendarClock,
  Car,
  ChevronDown,
  ClipboardList,
  FileText,
  Fuel,
  MessagesSquare,
  Phone,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  Wrench,
} from 'lucide-react';
import { useAppStore } from '../../../store';
import { PageHeader } from '../../../components/ui/PageHeader';
import { ApiError } from '../../../services/api/client';
import { getAvailableSlotsForDate, isDateBlockedForService, isSlotInPast } from '../../../lib/slots';
import { relativeDateString } from '../../../lib/dates';
import {
  COLOURS,
  COMPLAINT_CATEGORIES,
  CONDITIONS,
  DAMAGE_POINTS,
  FUEL_LEVELS,
  INSPECTION_ITEMS,
  INSURANCE_PROVIDERS,
  JOB_STATUSES,
  MANUFACTURERS,
  PRIORITIES,
  REPORTED_PROBLEMS,
  serviceAdvisersFrom,
  SERVICE_TYPES,
  techniciansFrom,
  VARIANTS,
  VEHICLE_TYPES,
  WARRANTY_TYPES,
  emptyComplaint,
  emptyJobCardForm,
  fromJobCard,
  toJobCardPayload,
  validateJobCard,
} from '../jobCardForm';

// Server error keys that map onto a differently named form field.
const SERVER_FIELD_MAP = {
  inAt: 'inDate',
  expectedDeliveryAt: 'expectedDate',
  actualDeliveryAt: 'actualDate',
  // appointment booking errors
  date: 'bookingDate',
  timeSlot: 'bookingSlot',
  phone: 'customerPhone',
};

const inputClass = (error) =>
  clsx(
    'w-full h-9 px-3 text-xs rounded-md border bg-surface text-text-main placeholder:text-text-muted/70',
    'focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-colors',
    error ? 'border-red-400 bg-red-50/40' : 'border-border'
  );

function Field({ label, required, error, className, children }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-[11px] font-medium text-text-main mb-1">
          {label}
          {required && <span className="text-status-red ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-[10px] text-status-red mt-0.5">{error}</p>}
    </div>
  );
}

function Select({ value, onChange, options, placeholder = 'Select', error, className }) {
  return (
    <div className="relative">
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className={clsx(inputClass(error), 'appearance-none pr-8', !value && 'text-text-muted', className)}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => {
          const { id, label } = typeof opt === 'string' ? { id: opt, label: opt } : opt;
          return (
            <option key={id} value={id}>
              {label}
            </option>
          );
        })}
      </select>
      <ChevronDown className="w-3.5 h-3.5 text-text-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

function Section({ number, title, icon: Icon, action, className, children }) {
  return (
    <section className={clsx('bg-surface rounded-card border border-border shadow-card', className)}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/70">
        <h2 className="flex items-center gap-2.5 text-[13px] font-bold text-primary">
          <span className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </span>
          {number ? `${number}. ` : ''}
          {title}
        </h2>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

/** Line-art motorcycle (side view) with clickable damage markers. */
function BikeDiagram({ marks, onToggle }) {
  const markerPos = { FRONT_LEFT: [62, 34], FRONT_RIGHT: [46, 92], REAR_LEFT: [196, 40], REAR_RIGHT: [214, 96] };
  return (
    <svg viewBox="0 0 260 140" className="w-full max-w-[240px] h-auto" role="img" aria-label="Vehicle damage map">
      <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700">
        <circle cx="52" cy="100" r="30" />
        <circle cx="52" cy="100" r="20" strokeWidth="1.2" />
        <circle cx="52" cy="100" r="4" />
        <circle cx="206" cy="100" r="30" />
        <circle cx="206" cy="100" r="20" strokeWidth="1.2" />
        <circle cx="206" cy="100" r="4" />
        <path d="M52 100 L74 44 L68 30 M60 30 L84 26" />
        <path d="M74 44 L104 52 L150 50 L176 66 L206 100" />
        <path d="M104 52 Q112 36 138 36 L150 50" />
        <path d="M138 36 L178 34 Q194 34 200 44 L176 50" />
        <path d="M106 60 L150 64 L162 84 L118 86 Z" />
        <path d="M118 86 L104 100 L150 102 L162 84" strokeWidth="1.6" />
        <path d="M150 102 L206 100" strokeWidth="1.4" />
        <path d="M176 66 L232 70 L240 80 L216 82" strokeWidth="1.6" />
        <path d="M78 40 L92 38" />
        <circle cx="70" cy="48" r="5" />
      </g>
      {DAMAGE_POINTS.map((p, i) => {
        const [x, y] = markerPos[p.id];
        const active = marks.includes(p.id);
        return (
          <g key={p.id} onClick={() => onToggle(p.id)} className="cursor-pointer">
            <title>{p.label}</title>
            <circle cx={x} cy={y} r="9" fill={active ? '#DC2626' : '#2563EB'} opacity={active ? 1 : 0.85} />
            <text x={x} y={y + 3.5} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">
              {i + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function CustomerPicker({ customers, value, onSelect, onType, error }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  const query = value.trim().toLowerCase();
  const matches = customers
    .filter((c) => !query || c.name.toLowerCase().includes(query) || (c.phone || '').replace(/\s/g, '').includes(query))
    .slice(0, 8);

  return (
    <div className="relative flex-1" ref={ref}>
      <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        value={value}
        onChange={(e) => {
          onType(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search or enter customer name"
        className={clsx(inputClass(error), 'pl-8 pr-8')}
      />
      <ChevronDown className="w-3.5 h-3.5 text-text-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      {open && matches.length > 0 && (
        <div className="absolute z-30 mt-1 w-full bg-surface border border-border rounded-md shadow-dropdown max-h-60 overflow-y-auto">
          {matches.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => {
                onSelect(c);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs hover:bg-surface-subtle"
            >
              <div className="font-semibold text-text-main">{c.name}</div>
              <div className="text-[10px] text-text-muted">
                {c.phone} {c.vehicles?.[0]?.registrationNumber ? `• ${c.vehicles[0].registrationNumber}` : ''}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// "Royal Enfield Hunter 350" -> { manufacturer: 'Royal Enfield', model: 'Hunter 350' }
function splitMakeModel(fullName = '') {
  const make = Object.keys(MANUFACTURERS).find((m) => fullName.toLowerCase().startsWith(m.toLowerCase()));
  if (!make) return { manufacturer: '', model: fullName };
  return { manufacturer: make, model: fullName.slice(make.length).trim() };
}

export default function JobCardCreatePage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const customers = useAppStore((s) => s.customers || []);
  const appointments = useAppStore((s) => s.appointments || []);
  const jobCards = useAppStore((s) => s.jobCards || []);
  const currentUser = useAppStore((s) => s.currentUser);
  const users = useAppStore((s) => s.users || []);
  const SERVICE_ADVISERS = useMemo(() => serviceAdvisersFrom(users), [users]);
  const TECHNICIANS = useMemo(() => techniciansFrom(users), [users]);
  const saveJobCard = useAppStore((s) => s.saveJobCard);
  const bookAppointment = useAppStore((s) => s.bookAppointment);

  // ?draft=<id> continues a draft; ?edit=<id> edits any existing job card.
  const draftId = params.get('edit') || params.get('draft');
  const appointmentId = params.get('appointment');
  const draft = draftId ? jobCards.find((jc) => jc.id === draftId) : null;
  const editingSaved = Boolean(draft && draft.stage !== 'DRAFT');
  const appointment = appointmentId ? appointments.find((a) => a.id === appointmentId) : null;

  const fromAppointment = (base, apt) => {
    const { manufacturer, model } = splitMakeModel(apt.modelName);
    const known = customers.find((c) => c.phone === apt.phone || c.name === apt.customerName);
    return {
      ...base,
      appointmentId: apt.id,
      customerId: known?.id || null,
      customerName: apt.customerName,
      customerPhone: apt.phone,
      customerEmail: known?.email || base.customerEmail,
      customerAddress: known ? [known.address, known.city, known.pincode].filter(Boolean).join(', ') : base.customerAddress,
      registrationNumber: apt.registrationNumber,
      manufacturer,
      modelName: model || '',
      serviceType: /free/i.test(apt.packageName || '') ? 'FREE_SERVICE' : 'PERIODIC_MAINTENANCE',
      complaints: [{ ...emptyComplaint(), category: 'Periodic Service', description: apt.packageName || '' }],
    };
  };

  const [form, setForm] = useState(() => {
    if (draft) return fromJobCard(draft);
    const base = emptyJobCardForm();
    if (serviceAdvisersFrom(users).includes(currentUser?.name)) base.advisorName = currentUser.name;
    if (appointment) return fromAppointment(base, appointment);
    if (params.get('book') === '1') {
      const date = params.get('date') || relativeDateString(0);
      const firstFree = getAvailableSlotsForDate(date, appointments).find((sl) => !sl.isFull && !isSlotInPast(date, sl.slot));
      return { ...base, bookingDate: date, bookingSlot: firstFree?.slot || '' };
    }
    return base;
  });
  const [errors, setErrors] = useState({});

  // Opened from a link, the appointment/draft can arrive from the server after the first render.
  // Fill the form once when it shows up (never over what the user has already typed for it).
  const prefilledFor = useRef(draft?.id || appointment?.id || null);
  useEffect(() => {
    const source = draft || appointment;
    if (!source || prefilledFor.current === source.id) return;
    prefilledFor.current = source.id;
    setForm((f) => (draft ? fromJobCard(draft) : fromAppointment(f, appointment)));
  }, [draft?.id, appointment?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // The signed-in user may load after the first render (backend sync); default the adviser once it does.
  useEffect(() => {
    if (!form.advisorName && SERVICE_ADVISERS.includes(currentUser?.name)) {
      setForm((f) => (f.advisorName ? f : { ...f, advisorName: currentUser.name }));
    }
  }, [currentUser?.name]); // eslint-disable-line react-hooks/exhaustive-deps
  const [saving, setSaving] = useState(null); // 'draft' | 'create' | null

  const set = (field) => (value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };
  const onInput = (field) => (e) => set(field)(e.target.value);

  const models = useMemo(() => {
    const list = MANUFACTURERS[form.manufacturer] || [];
    return form.modelName && !list.includes(form.modelName) ? [form.modelName, ...list] : list;
  }, [form.manufacturer, form.modelName]);

  const nextNumberPreview = useMemo(() => {
    if (draft?.jobCardNumber) return draft.jobCardNumber;
    const d = new Date();
    const day = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const used = jobCards.map((jc) => jc.jobCardNumber || '').filter((n) => n.startsWith(`JC${day}-`));
    return `JC${day}-${String(used.length + 1).padStart(3, '0')}`;
  }, [jobCards, draft]);

  const fillFromCustomer = (c) => {
    const vehicle = c.vehicles?.[0];
    const { manufacturer, model } = splitMakeModel(vehicle?.modelName);
    setForm((f) => ({
      ...f,
      customerId: c.id,
      customerName: c.name,
      customerPhone: c.phone || '',
      customerEmail: c.email || '',
      customerAddress: [c.address, c.city, c.pincode].filter(Boolean).join(', '),
      ...(vehicle
        ? {
            registrationNumber: vehicle.registrationNumber || f.registrationNumber,
            manufacturer: manufacturer || f.manufacturer,
            modelName: model || f.modelName,
            chassisNumber: vehicle.chassisNumber || f.chassisNumber,
            engineNumber: vehicle.engineNumber || f.engineNumber,
            odometerKm: vehicle.odometerKm ?? f.odometerKm,
            dateOfSale: vehicle.purchaseDate ? vehicle.purchaseDate.slice(0, 10) : f.dateOfSale,
          }
        : {}),
    }));
    setErrors({});
  };

  const startNewCustomer = () => {
    setForm((f) => ({ ...f, customerId: null, customerName: '', customerPhone: '', customerEmail: '', customerAddress: '' }));
  };

  const setInspection = (key, patch) =>
    setForm((f) => ({ ...f, inspection: f.inspection.map((row) => (row.key === key ? { ...row, ...patch } : row)) }));
  const setComplaint = (index, patch) =>
    setForm((f) => ({ ...f, complaints: f.complaints.map((c, i) => (i === index ? { ...c, ...patch } : c)) }));
  const toggleDamage = (id) =>
    setForm((f) => ({
      ...f,
      damageMarks: f.damageMarks.includes(id) ? f.damageMarks.filter((m) => m !== id) : [...f.damageMarks, id],
    }));

  const submit = async (asDraft) => {
    const found = validateJobCard(form, { draft: asDraft });
    if (bookingMode && !asDraft) {
      if (isDateBlockedForService(form.bookingDate)) found.bookingDate = 'The workshop is closed on Sundays';
      const slot = bookingSlots.find((sl) => sl.slot === form.bookingSlot);
      if (!form.bookingSlot) found.bookingSlot = 'Select a time slot';
      else if (!slot || slot.isFull) found.bookingSlot = 'This slot is fully booked';
      else if (slot.isPast) found.bookingSlot = 'This slot has already started. Pick a later slot';
    }
    if (asDraft && !form.customerName.trim() && !form.registrationNumber.trim()) {
      found.customerName = 'Enter at least a customer name or registration number to save a draft';
    }
    setErrors(found);
    if (Object.keys(found).length) {
      toast.error(`Please fix ${Object.keys(found).length} highlighted field(s).`);
      document.querySelector('[data-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setSaving(asDraft ? 'draft' : 'create');
    try {
      let payload = toJobCardPayload(form, { draft: asDraft });
      let booked = null;
      if (bookingMode && !asDraft) {
        booked = await bookAppointment({
          customerName: payload.customerName,
          phone: payload.customerPhone,
          registrationNumber: payload.registrationNumber,
          modelName: [form.manufacturer, form.modelName].filter(Boolean).join(' '),
          date: form.bookingDate,
          timeSlot: form.bookingSlot,
          packageName: SERVICE_TYPES.find((t) => t.id === form.serviceType)?.label || 'General Service',
        });
        // Remember it so a retry after a job card error does not book the slot twice.
        setForm((f) => ({ ...f, appointmentId: booked.id }));
        payload = { ...payload, appointmentId: booked.id };
      }
      const saved = await saveJobCard(payload, draft?.id || null);
      if (asDraft) {
        toast.success(`Draft ${saved.jobCardNumber} saved.`);
        setParams({ draft: saved.id }, { replace: true });
      } else {
        toast.success(
          booked
            ? `Booked ${booked.timeSlot} on ${booked.date} and created job card ${saved.jobCardNumber}.`
            : editingSaved
            ? `Job card ${saved.jobCardNumber} updated.`
            : `Job card ${saved.jobCardNumber} created for ${saved.registrationNumber}.`
        );
        navigate(booked ? '/service' : '/service/jobs');
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 400 && err.body && typeof err.body === 'object') {
        const serverErrors = {};
        Object.entries(err.body).forEach(([key, msg]) => {
          serverErrors[SERVER_FIELD_MAP[key] || key] = Array.isArray(msg) ? msg.join(' ') : String(msg);
        });
        setErrors(serverErrors);
        toast.error('The server rejected some fields. Please check the highlighted fields.');
      } else {
        toast.error(err.message || 'Could not save the job card.');
      }
    } finally {
      setSaving(null);
    }
  };

  // Booking mode: this form also books the workshop slot (no separate appointment popup).
  const bookingMode = !form.appointmentId && Boolean(form.bookingDate);
  const bookingSlots = bookingMode
    ? getAvailableSlotsForDate(form.bookingDate, appointments).map((sl) => ({
        ...sl,
        isPast: isSlotInPast(form.bookingDate, sl.slot),
      }))
    : [];

  const err = (field) => errors[field];
  const errAttr = (field) => ({ 'data-error': Boolean(errors[field]) });

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Workshop & Service', path: '/service/jobs' },
          { label: 'Job Cards Kanban', path: '/service/jobs' },
          { label: draft ? 'Edit Job Card' : 'Create Job Card', path: '/service/jobs/new' },
        ]}
        title={editingSaved ? `Edit Job Card ${draft.jobCardNumber}` : draft ? 'Continue Vehicle Service Job Card' : 'Create Vehicle Service Job Card'}
        subtitle={
          appointment
            ? `Intake initialized from appointment ${appointment.timeSlot} for ${appointment.customerName}`
            : 'Record customer details, vehicle information and service requirements to create a new job card.'
        }
        actions={
          <div className="flex items-center gap-2">
            {!editingSaved && (
            <button
              type="button"
              onClick={() => submit(true)}
              disabled={Boolean(saving)}
              className="h-9 px-4 rounded-md bg-surface text-text-main border border-border hover:bg-surface-subtle text-xs font-semibold flex items-center gap-2 disabled:opacity-60 shadow-xs transition"
            >
              <Save className="w-4 h-4" />
              {saving === 'draft' ? 'Saving…' : 'Save Draft'}
            </button>
            )}
            <button
              type="button"
              onClick={() => submit(false)}
              disabled={Boolean(saving)}
              className="h-9 px-4 rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-2 disabled:opacity-60 shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              {saving === 'create'
                ? 'Saving…'
                : editingSaved
                ? 'Save Changes'
                : bookingMode
                ? 'Book & Create Job Card'
                : 'Create Job Card'}
            </button>
          </div>
        }
      />

      {bookingMode && (
        <Section number={0} title="Service Booking" icon={CalendarClock}>
          <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-4 items-start">
            <Field label="Booking Date" required error={err('bookingDate')}>
              <input
                type="date"
                min={relativeDateString(0)}
                value={form.bookingDate}
                onChange={(e) => {
                  const date = e.target.value;
                  const firstFree = getAvailableSlotsForDate(date, appointments).find(
                    (sl) => !sl.isFull && !isSlotInPast(date, sl.slot)
                  );
                  setForm((f) => ({ ...f, bookingDate: date, bookingSlot: firstFree?.slot || '' }));
                  setErrors((er) => ({ ...er, bookingDate: undefined, bookingSlot: undefined }));
                }}
                className={inputClass(err('bookingDate'))}
                {...errAttr('bookingDate')}
              />
            </Field>
            <Field label="Time Slot" required error={err('bookingSlot')}>
              {isDateBlockedForService(form.bookingDate) ? (
                <p className="text-xs text-status-amber font-semibold py-2" {...errAttr('bookingSlot')}>
                  Closed on Sundays. Pick another date.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2" {...errAttr('bookingSlot')}>
                  {bookingSlots.map((sl) => (
                    <button
                      type="button"
                      key={sl.slot}
                      disabled={sl.isFull || sl.isPast}
                      title={sl.isPast ? 'Slot already started' : sl.isFull ? 'Fully booked' : undefined}
                      onClick={() => set('bookingSlot')(sl.slot)}
                      className={clsx(
                        'px-3 py-1.5 rounded-md border text-[11px] font-semibold transition-colors',
                        form.bookingSlot === sl.slot
                          ? 'bg-primary text-white border-primary'
                          : 'bg-surface text-text-main border-border hover:border-primary/50',
                        (sl.isFull || sl.isPast) && 'opacity-40 cursor-not-allowed line-through'
                      )}
                    >
                      {sl.slot}
                      <span className={clsx('ml-1.5 font-normal', form.bookingSlot === sl.slot ? 'text-white/80' : 'text-text-muted')}>
                        ({sl.availableBays} left)
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </Field>
          </div>
        </Section>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left two-thirds */}
        <div className="xl:col-span-8 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* 1. Customer information */}
            <Section number={1} title="Customer Information" icon={UserRound} className="lg:col-span-5">
              <div className="space-y-3">
                <Field label="Customer Name" required error={err('customerName')}>
                  <div className="flex gap-2" {...errAttr('customerName')}>
                    <CustomerPicker
                      customers={customers}
                      value={form.customerName}
                      error={err('customerName')}
                      onSelect={fillFromCustomer}
                      onType={(v) => setForm((f) => ({ ...f, customerName: v, customerId: null }))}
                    />
                    <button
                      type="button"
                      onClick={startNewCustomer}
                      className="h-9 px-3 rounded-md border border-border text-primary text-xs font-semibold flex items-center gap-1 hover:bg-primary/5"
                    >
                      <Plus className="w-3.5 h-3.5" /> New
                    </button>
                  </div>
                </Field>
                <Field label="Mobile Number" required error={err('customerPhone')}>
                  <div className="relative" {...errAttr('customerPhone')}>
                    <Phone className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={form.customerPhone}
                      onChange={onInput('customerPhone')}
                      placeholder="+91 93476 22734"
                      className={clsx(inputClass(err('customerPhone')), 'pl-8')}
                    />
                  </div>
                </Field>
                <Field label="Email" error={err('customerEmail')}>
                  <input
                    type="email"
                    value={form.customerEmail}
                    onChange={onInput('customerEmail')}
                    placeholder="customer@gmail.com"
                    className={inputClass(err('customerEmail'))}
                    {...errAttr('customerEmail')}
                  />
                </Field>
                <Field label="Address">
                  <textarea
                    rows={3}
                    value={form.customerAddress}
                    onChange={onInput('customerAddress')}
                    placeholder="Door no., street, area, city - PIN"
                    className={clsx(inputClass(), 'h-auto py-2 resize-y')}
                  />
                </Field>
              </div>
            </Section>

            {/* 2. Vehicle information */}
            <Section number={2} title="Vehicle Information" icon={Car} className="lg:col-span-7">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Field label="Registration Number" required error={err('registrationNumber')}>
                  <input
                    value={form.registrationNumber}
                    onChange={(e) => set('registrationNumber')(e.target.value.toUpperCase())}
                    placeholder="AP 16 K 7038"
                    className={clsx(inputClass(err('registrationNumber')), 'uppercase font-mono')}
                    {...errAttr('registrationNumber')}
                  />
                </Field>
                <Field label="Manufacturer" required error={err('manufacturer')}>
                  <div {...errAttr('manufacturer')}>
                    <Select
                      value={form.manufacturer}
                      onChange={(v) => setForm((f) => ({ ...f, manufacturer: v, modelName: '' }))}
                      options={Object.keys(MANUFACTURERS)}
                      error={err('manufacturer')}
                    />
                  </div>
                </Field>
                <Field label="Model" required error={err('modelName')}>
                  <div {...errAttr('modelName')}>
                    <Select
                      value={form.modelName}
                      onChange={set('modelName')}
                      options={models}
                      placeholder="Select"
                      error={err('modelName')}
                    />
                  </div>
                </Field>
                <Field label="Variant">
                  <Select value={form.variant} onChange={set('variant')} options={VARIANTS} />
                </Field>
                <Field label="Vehicle Type">
                  <Select value={form.vehicleType} onChange={set('vehicleType')} options={VEHICLE_TYPES} />
                </Field>
                <Field label="Chassis / Frame Number">
                  <input
                    value={form.chassisNumber}
                    onChange={(e) => set('chassisNumber')(e.target.value.toUpperCase())}
                    maxLength={20}
                    placeholder="MBLHAW12345678901"
                    className={clsx(inputClass(), 'font-mono')}
                  />
                </Field>
                <Field label="Engine Number">
                  <input
                    value={form.engineNumber}
                    onChange={(e) => set('engineNumber')(e.target.value.toUpperCase())}
                    maxLength={20}
                    placeholder="HAW123456"
                    className={clsx(inputClass(), 'font-mono')}
                  />
                </Field>
                <Field label="Colour">
                  <Select value={form.colour} onChange={set('colour')} options={COLOURS} />
                </Field>
                <Field label="Date of Sale">
                  <input type="date" value={form.dateOfSale} onChange={onInput('dateOfSale')} className={inputClass()} />
                </Field>
                <Field label="KMS Run" error={err('odometerKm')}>
                  <input
                    type="number"
                    min="0"
                    value={form.odometerKm}
                    onChange={onInput('odometerKm')}
                    placeholder="12850"
                    className={inputClass(err('odometerKm'))}
                  />
                </Field>
                <Field label="Key Number">
                  <input value={form.keyNumber} onChange={onInput('keyNumber')} placeholder="K123" className={inputClass()} />
                </Field>
                <Field label="Selling Dealer">
                  <input
                    value={form.sellingDealer}
                    onChange={onInput('sellingDealer')}
                    placeholder="Dealer name, city"
                    className={inputClass()}
                  />
                </Field>
              </div>
            </Section>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* 4. Service type */}
            <Section number={4} title="Service Type" icon={Wrench} className="lg:col-span-2">
              <Field label="Service Type" required error={err('serviceType')}>
                <div {...errAttr('serviceType')}>
                  <Select value={form.serviceType} onChange={set('serviceType')} options={SERVICE_TYPES} error={err('serviceType')} />
                </div>
              </Field>
            </Section>

            {/* 5. Insurance & warranty */}
            <Section number={5} title="Insurance & Warranty" icon={ShieldCheck} className="lg:col-span-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Insurance Provider">
                  <Select value={form.insuranceProvider} onChange={set('insuranceProvider')} options={INSURANCE_PROVIDERS} />
                </Field>
                <Field label="Policy Number">
                  <input value={form.policyNumber} onChange={onInput('policyNumber')} placeholder="BA/123456789" className={inputClass()} />
                </Field>
                <Field label="Insurance Start Date">
                  <input type="date" value={form.insuranceStart} onChange={onInput('insuranceStart')} className={inputClass()} />
                </Field>
                <Field label="Insurance Expiry Date" error={err('insuranceExpiry')}>
                  <input
                    type="date"
                    value={form.insuranceExpiry}
                    onChange={onInput('insuranceExpiry')}
                    className={inputClass(err('insuranceExpiry'))}
                  />
                </Field>
                <Field label="Warranty Type">
                  <Select value={form.warrantyType} onChange={set('warrantyType')} options={WARRANTY_TYPES} />
                </Field>
                <Field label="Warranty Start Date">
                  <input type="date" value={form.warrantyStart} onChange={onInput('warrantyStart')} className={inputClass()} />
                </Field>
                <Field label="Warranty Expiry Date" error={err('warrantyExpiry')}>
                  <input
                    type="date"
                    value={form.warrantyExpiry}
                    onChange={onInput('warrantyExpiry')}
                    className={inputClass(err('warrantyExpiry'))}
                  />
                </Field>
                <Field label="Free Service Coupon No.">
                  <input value={form.freeServiceCoupon} onChange={onInput('freeServiceCoupon')} placeholder="FS1234" className={inputClass()} />
                </Field>
              </div>
            </Section>
          </div>
        </div>

        {/* Right third */}
        <div className="xl:col-span-4 space-y-4">
          {/* 3. Job card information */}
          <Section number={3} title="Job Card Information" icon={ClipboardList}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Job Card Number">
                <div className="relative">
                  <input value={nextNumberPreview} readOnly className={clsx(inputClass(), 'bg-surface-subtle font-mono pr-14')} />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-text-muted bg-surface-muted px-1.5 py-0.5 rounded">
                    Auto
                  </span>
                </div>
              </Field>
              <Field label="Vehicle Tag Number">
                <input value={form.vehicleTagNumber} onChange={onInput('vehicleTagNumber')} placeholder="VT-001" className={inputClass()} />
              </Field>
              <Field label="In Date & Time" required error={err('inDate')} className="col-span-2">
                <div className="grid grid-cols-2 gap-3" {...errAttr('inDate')}>
                  <input type="date" value={form.inDate} onChange={onInput('inDate')} className={inputClass(err('inDate'))} />
                  <input type="time" value={form.inTime} onChange={onInput('inTime')} className={inputClass(err('inDate'))} />
                </div>
              </Field>
              <Field label="Expected Delivery Date & Time" required error={err('expectedDate')} className="col-span-2">
                <div className="grid grid-cols-2 gap-3" {...errAttr('expectedDate')}>
                  <input type="date" value={form.expectedDate} onChange={onInput('expectedDate')} className={inputClass(err('expectedDate'))} />
                  <input type="time" value={form.expectedTime} onChange={onInput('expectedTime')} className={inputClass(err('expectedDate'))} />
                </div>
              </Field>
              <Field label="Actual Delivery Date & Time" error={err('actualDate')} className="col-span-2">
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" value={form.actualDate} onChange={onInput('actualDate')} className={inputClass(err('actualDate'))} />
                  <input type="time" value={form.actualTime} onChange={onInput('actualTime')} className={inputClass(err('actualDate'))} />
                </div>
              </Field>
              <Field label="Service Adviser" required error={err('advisorName')}>
                <div {...errAttr('advisorName')}>
                  <Select value={form.advisorName} onChange={set('advisorName')} options={SERVICE_ADVISERS} error={err('advisorName')} />
                </div>
              </Field>
              <Field label="Assigned Technician">
                <Select value={form.technicianName} onChange={set('technicianName')} options={TECHNICIANS} />
              </Field>
              <Field label="Service Priority">
                <Select value={form.priority} onChange={set('priority')} options={PRIORITIES} />
              </Field>
              <Field label="Job Card Status">
                <Select
                  value={form.stage}
                  onChange={set('stage')}
                  options={
                    JOB_STATUSES.some((st) => st.id === form.stage)
                      ? JOB_STATUSES
                      : [...JOB_STATUSES, { id: form.stage, label: form.stage.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) }]
                  }
                  className="bg-primary/5 text-primary font-semibold border-primary/30"
                />
              </Field>
            </div>
          </Section>

          {/* 6. Vehicle condition & fuel level */}
          <Section number={6} title="Vehicle Condition & Fuel Level" icon={Fuel}>
            <div className="grid grid-cols-[1fr_auto] gap-3 items-start">
              <div className="space-y-3">
                <Field label="Fuel Level">
                  <Select value={form.fuelLevel} onChange={set('fuelLevel')} options={FUEL_LEVELS} />
                </Field>
                <BikeDiagram marks={form.damageMarks} onToggle={toggleDamage} />
              </div>
              <div className="space-y-2 pt-5">
                {DAMAGE_POINTS.map((p, i) => (
                  <label key={p.id} className="flex items-center gap-2 text-xs text-text-main cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.damageMarks.includes(p.id)}
                      onChange={() => toggleDamage(p.id)}
                      className="w-3.5 h-3.5 rounded-full accent-primary"
                    />
                    <span className="text-[10px] font-bold text-text-muted w-3">{i + 1}</span>
                    {p.label}
                  </label>
                ))}
              </div>
            </div>
            <Field label="Additional Remarks" className="mt-3">
              <textarea
                rows={2}
                value={form.remarks}
                onChange={onInput('remarks')}
                placeholder="Minor scratches on left side body."
                className={clsx(inputClass(), 'h-auto py-2 resize-y')}
              />
            </Field>
          </Section>
        </div>
      </div>

      {/* 7. Vehicle inspection checklist */}
      <Section number={7} title="Vehicle Inspection Checklist" icon={FileText}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {INSPECTION_ITEMS.map((column, colIdx) => (
            <div key={colIdx} className="border border-border rounded-md overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-surface-subtle text-text-main text-[11px] font-semibold">
                    <th className="text-left px-3 py-2 w-[38%]">Inspection Item</th>
                    <th className="text-left px-3 py-2 w-[27%]">Condition</th>
                    <th className="text-left px-3 py-2">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {column.map((item) => {
                    const row = form.inspection.find((r) => r.key === item.key) || { condition: '', remarks: '' };
                    const tone = CONDITIONS.find((c) => c.id === row.condition)?.className;
                    return (
                      <tr key={item.key}>
                        <td className="px-3 py-1.5 text-text-main">{item.label}</td>
                        <td className="px-3 py-1.5">
                          <div className="relative">
                            <select
                              value={row.condition}
                              onChange={(e) => setInspection(item.key, { condition: e.target.value })}
                              className={clsx('w-full h-7 pl-2 pr-6 text-[11px] font-semibold rounded border appearance-none', tone)}
                            >
                              {CONDITIONS.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                          </div>
                        </td>
                        <td className="px-3 py-1.5">
                          <input
                            value={row.remarks}
                            onChange={(e) => setInspection(item.key, { remarks: e.target.value })}
                            placeholder="-"
                            className="w-full h-7 px-2 text-[11px] rounded border border-border bg-surface focus:outline-none focus:border-primary"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </Section>

      {/* 8. Customer complaints */}
      <Section
        number={8}
        title="Customer Complaints / Service Requests"
        icon={MessagesSquare}
        action={
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, complaints: [...f.complaints, emptyComplaint()] }))}
            className="h-8 px-3 rounded-md bg-primary hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Complaint
          </button>
        }
      >
        <div className="border border-border rounded-md overflow-x-auto">
          <table className="w-full text-xs min-w-[900px]">
            <thead>
              <tr className="bg-surface-subtle text-text-main text-[11px] font-semibold">
                <th className="text-left px-3 py-2 w-10">#</th>
                <th className="text-left px-3 py-2 w-[18%]">Complaint Category</th>
                <th className="text-left px-3 py-2">Complaint Description</th>
                <th className="text-left px-3 py-2">Customer Remarks</th>
                <th className="text-left px-3 py-2 w-[16%]">Reported Problem</th>
                <th className="text-left px-3 py-2 w-28">Priority</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {form.complaints.map((c, i) => (
                <tr key={i}>
                  <td className="px-3 py-2 text-text-muted">{i + 1}</td>
                  <td className="px-3 py-2">
                    <Select value={c.category} onChange={(v) => setComplaint(i, { category: v })} options={COMPLAINT_CATEGORIES} />
                  </td>
                  <td className="px-3 py-2">
                    <textarea
                      rows={1}
                      value={c.description}
                      onChange={(e) => setComplaint(i, { description: e.target.value })}
                      placeholder="Vehicle not starting in morning"
                      className={clsx(inputClass(), 'h-9 py-2 resize-y')}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <textarea
                      rows={1}
                      value={c.customerRemarks}
                      onChange={(e) => setComplaint(i, { customerRemarks: e.target.value })}
                      placeholder="Starts after 2-3 attempts"
                      className={clsx(inputClass(), 'h-9 py-2 resize-y')}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Select value={c.reportedProblem} onChange={(v) => setComplaint(i, { reportedProblem: v })} options={REPORTED_PROBLEMS} />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={c.priority}
                      onChange={(e) => setComplaint(i, { priority: e.target.value })}
                      className={clsx(
                        'h-7 px-2 rounded-full text-[11px] font-bold border-0 cursor-pointer',
                        c.priority === 'LOW' && 'bg-slate-100 text-slate-600',
                        c.priority === 'MEDIUM' && 'bg-amber-100 text-amber-700',
                        c.priority === 'HIGH' && 'bg-orange-100 text-orange-700',
                        c.priority === 'URGENT' && 'bg-red-100 text-red-700'
                      )}
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, complaints: f.complaints.filter((_, idx) => idx !== i) }))}
                      className="p-1.5 rounded text-status-red hover:bg-red-50"
                      aria-label={`Remove complaint ${i + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {form.complaints.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-text-muted">
                    No complaints added. Use “Add Complaint” to record the customer’s requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
