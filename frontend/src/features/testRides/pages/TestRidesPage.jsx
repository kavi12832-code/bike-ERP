import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../../store';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { PageHeader } from '../../../components/ui/PageHeader';
import { KpiCard } from '../../../components/ui/KpiCard';
import { FilterBar } from '../../../components/ui/FilterBar';
import { StatusChip } from '../../../components/ui/StatusChip';
import { formatDate } from '../../../lib/format';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  PlusCircle,
  Clock,
  User,
  Star,
  FileCheck,
  Camera,
  Upload,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Bike
} from 'lucide-react';
import { toast } from 'sonner';

export function TestRidesPage() {
  const navigate = useNavigate();
  const bikeCatalog = useAppStore((state) => state.catalogs?.bikes || []);
  const currentUser = useAppStore((state) => state.currentUser);

  const [testRides, setTestRides] = useState([
    {
      id: 'tr-001',
      customerName: 'Karthik Narayanan',
      phone: '+91 98840 99123',
      bikeModel: 'Bajaj Pulsar NS200',
      demoBikeReg: 'KA-05-DEMO-01',
      scheduledDate: new Date().toISOString(),
      timeSlot: '11:30 AM - 12:00 PM',
      licenceVerified: true,
      status: 'SCHEDULED', // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
      odometerOut: null,
      odometerIn: null,
      feedbackRating: null,
      feedbackComment: '',
    },
    {
      id: 'tr-002',
      customerName: 'Meera Krishnan',
      phone: '+91 97420 55432',
      bikeModel: 'Bajaj Chetak Premium 2024',
      demoBikeReg: 'KA-05-EV-DEMO',
      scheduledDate: new Date().toISOString(),
      timeSlot: '02:00 PM - 02:30 PM',
      licenceVerified: true,
      status: 'COMPLETED',
      odometerOut: 1240,
      odometerIn: 1248,
      feedbackRating: 5,
      feedbackComment: 'Loved the smooth electric acceleration and regenerative braking!',
    },
    {
      id: 'tr-003',
      customerName: 'Sanjay Reddy',
      phone: '+91 99450 67124',
      bikeModel: 'Bajaj Dominar 400',
      demoBikeReg: 'KA-05-ADV-DEMO',
      scheduledDate: new Date().toISOString(),
      timeSlot: '04:00 PM - 04:30 PM',
      licenceVerified: true,
      status: 'SCHEDULED',
      odometerOut: null,
      odometerIn: null,
      feedbackRating: null,
      feedbackComment: '',
    },
  ]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [startModalOpen, setStartModalOpen] = useState(false);
  const [activeRide, setActiveRide] = useState(null);

  // New Test ride state
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedBike, setSelectedBike] = useState(bikeCatalog[0]?.model || 'Pulsar NS200');
  const [timeSlot, setTimeSlot] = useState('11:00 AM - 11:30 AM');
  const [licenceUploaded, setLicenceUploaded] = useState(false);
  const [waiverAgreed, setWaiverAgreed] = useState(false);

  // Start ride odometer
  const [odometerStart, setOdometerStart] = useState('1450');

  // Feedback form state
  const [odometerEnd, setOdometerEnd] = useState('1458');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // Plain KPIs
  const kpis = useMemo(() => {
    const total = testRides.length;
    const scheduled = testRides.filter((r) => r.status === 'SCHEDULED' || r.status === 'IN_PROGRESS').length;
    const completed = testRides.filter((r) => r.status === 'COMPLETED').length;
    const verifiedRate = total > 0 ? Math.round((testRides.filter((r) => r.licenceVerified).length / total) * 100) : 100;
    return { total, scheduled, completed, verifiedRate };
  }, [testRides]);

  // Filtered list
  const filteredRides = useMemo(() => {
    return testRides.filter((r) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        r.customerName.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        r.bikeModel.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [testRides, search, statusFilter]);

  const handleCreateTestRide = (e) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim()) {
      toast.error('Customer name and phone number are required');
      return;
    }
    if (!licenceUploaded) {
      toast.error('Driving licence photo verification is required before scheduling test ride!');
      return;
    }
    if (!waiverAgreed) {
      toast.error('Customer must accept the test ride indemnity waiver.');
      return;
    }

    const newRide = {
      id: `tr-${Date.now()}`,
      customerName,
      phone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
      bikeModel: selectedBike,
      demoBikeReg: 'KA-05-DEMO-02',
      scheduledDate: new Date().toISOString(),
      timeSlot,
      licenceVerified: true,
      status: 'SCHEDULED',
      odometerOut: null,
      odometerIn: null,
      feedbackRating: null,
      feedbackComment: '',
    };

    setTestRides([newRide, ...testRides]);
    setBookingModalOpen(false);
    toast.success(`Test ride scheduled for ${customerName}! Demo unit reserved.`);

    setCustomerName('');
    setPhone('');
    setLicenceUploaded(false);
    setWaiverAgreed(false);
  };

  const handleStartRide = () => {
    if (!activeRide) return;
    setTestRides((prev) =>
      prev.map((r) =>
        r.id === activeRide.id
          ? { ...r, status: 'IN_PROGRESS', odometerOut: Number(odometerStart) || 1000 }
          : r
      )
    );
    setStartModalOpen(false);
    toast.success(`Test ride started for ${activeRide.customerName}. Odometer: ${odometerStart} km`);
  };

  const handleSaveFeedback = (e) => {
    e.preventDefault();
    if (!activeRide) return;

    setTestRides((prev) =>
      prev.map((r) =>
        r.id === activeRide.id
          ? {
              ...r,
              status: 'COMPLETED',
              odometerIn: Number(odometerEnd) || (r.odometerOut ? r.odometerOut + 6 : 1006),
              feedbackRating: rating,
              feedbackComment: comment,
            }
          : r
      )
    );

    setFeedbackModalOpen(false);
    toast.success(`Feedback recorded! Rating: ${rating}/5 Stars`);
    setComment('');
  };

  const handleCancelRide = (rideId, name) => {
    if (window.confirm(`Cancel test ride for ${name}?`)) {
      setTestRides((prev) =>
        prev.map((r) => (r.id === rideId ? { ...r, status: 'CANCELLED' } : r))
      );
      toast.info(`Test ride for ${name} marked as Cancelled.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Operations', path: '/dashboard' },
          { label: 'Test Rides', path: '/test-rides' },
        ]}
        title="Test Rides & Demo Fleet Management"
        subtitle="Manage customer test ride bookings, mandatory DL verification, indemnity consent waivers, demo fleet odometers, and feedback scoring."
        actions={[
          {
            label: 'Schedule Test Ride',
            icon: PlusCircle,
            variant: 'primary',
            onClick: () => setBookingModalOpen(true),
          },
        ]}
      />

      {/* 2. Plain KPI Cards (Strictly no charts/arrows) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Compass}
          label="Total Test Rides"
          value={kpis.total}
          subtitle="All logged customer rides"
        />
        <KpiCard
          icon={Clock}
          label="Scheduled / In Progress"
          value={kpis.scheduled}
          subtitle="Awaiting slot or out on road"
        />
        <KpiCard
          icon={CheckCircle2}
          label="Completed Today"
          value={kpis.completed}
          subtitle="Feedback recorded"
        />
        <KpiCard
          icon={FileCheck}
          label="DL Verification Rate"
          value={`${kpis.verifiedRate}%`}
          subtitle="Mandatory license check"
        />
      </div>

      {/* 3. Filter Bar */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search customer name, phone, or demo model..."
        filters={[
          {
            label: 'Ride Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Scheduled', value: 'SCHEDULED' },
              { label: 'In Progress', value: 'IN_PROGRESS' },
              { label: 'Completed', value: 'COMPLETED' },
              { label: 'Cancelled', value: 'CANCELLED' },
            ],
          },
        ]}
        onClear={() => {
          setSearch('');
          setStatusFilter('ALL');
        }}
      />

      {/* 4. Test Rides Table */}
      <div className="bg-surface rounded-card border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-surface-subtle text-text-muted font-semibold uppercase text-[11px] border-b border-border">
              <tr>
                <th className="p-3.5">Customer & Phone</th>
                <th className="p-3.5">Bike Model & Demo Reg</th>
                <th className="p-3.5">Date & Time Slot</th>
                <th className="p-3.5">DL Verified</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Odometer In / Out</th>
                <th className="p-3.5">Feedback</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredRides.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-text-muted">
                    No test ride records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredRides.map((ride) => (
                  <tr key={ride.id} className="hover:bg-surface-subtle/70 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-text-main">{ride.customerName}</div>
                      <div className="text-[10px] font-mono text-text-muted">{ride.phone}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-primary">{ride.bikeModel}</div>
                      <div className="text-[10px] font-mono text-text-muted">{ride.demoBikeReg}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="text-text-main font-medium">{formatDate(ride.scheduledDate)}</div>
                      <div className="text-[10px] text-text-muted">{ride.timeSlot}</div>
                    </td>
                    <td className="p-3.5">
                      {ride.licenceVerified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-status-green">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-status-amber">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <StatusChip status={ride.status} />
                    </td>
                    <td className="p-3.5 font-mono text-[11px]">
                      {ride.odometerOut ? (
                        <span>
                          {ride.odometerOut} km &rarr; {ride.odometerIn ? `${ride.odometerIn} km` : 'Active'}
                        </span>
                      ) : (
                        <span className="text-text-muted italic">—</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {ride.feedbackRating ? (
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span>{ride.feedbackRating} / 5</span>
                        </div>
                      ) : (
                        <span className="text-text-muted italic">Not rated</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      {ride.status === 'SCHEDULED' && (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setActiveRide(ride);
                              setStartModalOpen(true);
                            }}
                            className="text-[11px] h-7 mr-1.5"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Start Ride
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCancelRide(ride.id, ride.customerName)}
                            className="text-[11px] h-7 text-status-red hover:bg-red-50"
                          >
                            Cancel
                          </Button>
                        </>
                      )}

                      {ride.status === 'IN_PROGRESS' && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            setActiveRide(ride);
                            setFeedbackModalOpen(true);
                          }}
                          className="text-[11px] h-7 bg-primary text-white"
                        >
                          Complete &amp; Review
                        </Button>
                      )}

                      {ride.status === 'COMPLETED' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate(`/quotations?customer=${encodeURIComponent(ride.customerName)}`)}
                          className="text-[11px] h-7"
                        >
                          Create Quote
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Schedule Test Ride Modal */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title="Schedule Customer Test Ride"
        size="md"
      >
        <form onSubmit={handleCreateTestRide} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-text-muted uppercase mb-1">
              Customer Full Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Anand Murthy"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              className="w-full px-3 py-1.5 text-xs rounded-input border border-border bg-surface text-text-main focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-text-muted uppercase mb-1">
              Mobile Phone Number (+91) *
            </label>
            <input
              type="tel"
              placeholder="+91 98450 12345"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-3 py-1.5 text-xs font-mono rounded-input border border-border bg-surface text-text-main focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-text-muted uppercase mb-1">
                Demo Vehicle Model *
              </label>
              <select
                value={selectedBike}
                onChange={(e) => setSelectedBike(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-input border border-border bg-surface text-text-main focus:ring-1 focus:ring-primary"
              >
                {bikeCatalog.map((b) => (
                  <option key={b.id} value={`${b.brand} ${b.model}`}>
                    {b.brand} {b.model}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-muted uppercase mb-1">
                Preferred Time Slot *
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-input border border-border bg-surface text-text-main focus:ring-1 focus:ring-primary"
              >
                <option value="10:30 AM - 11:00 AM">10:30 AM - 11:00 AM</option>
                <option value="11:30 AM - 12:00 PM">11:30 AM - 12:00 PM</option>
                <option value="02:30 PM - 03:00 PM">02:30 PM - 03:00 PM</option>
                <option value="04:00 PM - 04:30 PM">04:00 PM - 04:30 PM</option>
                <option value="05:30 PM - 06:00 PM">05:30 PM - 06:00 PM</option>
              </select>
            </div>
          </div>

          {/* Mandatory Licence Check */}
          <div className="p-3 rounded-lg border border-border bg-surface-subtle space-y-2">
            <span className="text-[11px] font-bold text-text-main uppercase block">
              Mandatory Driving Licence (DL) Verification
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setLicenceUploaded(true);
                  toast.success('Valid Indian Driving Licence (Two-Wheeler with Gear) verified.');
                }}
                className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  licenceUploaded
                    ? 'bg-status-green text-white'
                    : 'bg-surface border border-border text-text-main hover:bg-surface-muted'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                {licenceUploaded ? 'DL Verified & Captured' : 'Simulate DL Photo Capture'}
              </button>
            </div>
          </div>

          {/* Consent Checkbox */}
          <label className="flex items-start gap-2 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={waiverAgreed}
              onChange={(e) => setWaiverAgreed(e.target.checked)}
              className="mt-0.5 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-[11px] text-text-muted leading-tight">
              Customer confirms holding a valid driving license, wearing a safety helmet, and agrees to the dealership test ride liability terms.
            </span>
          </label>

          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setBookingModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="bg-primary text-white">
              Confirm Reservation
            </Button>
          </div>
        </form>
      </Modal>

      {/* 6. Start Ride Modal (Odometer Out) */}
      <Modal
        isOpen={startModalOpen}
        onClose={() => setStartModalOpen(false)}
        title={`Start Test Ride: ${activeRide?.customerName}`}
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-text-muted">
            Inspect helmet, handover keys for <strong>{activeRide?.bikeModel}</strong> ({activeRide?.demoBikeReg}) and record departure odometer.
          </p>
          <div>
            <label className="block text-[11px] font-semibold text-text-muted uppercase mb-1">
              Departure Odometer (KM) *
            </label>
            <input
              type="number"
              value={odometerStart}
              onChange={(e) => setOdometerStart(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-mono rounded-input border border-border bg-surface text-text-main focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setStartModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleStartRide} className="bg-primary text-white">
              Confirm Departure
            </Button>
          </div>
        </div>
      </Modal>

      {/* 7. Feedback & Completion Modal */}
      <Modal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        title={`Complete Test Ride: ${activeRide?.customerName}`}
        size="md"
      >
        <form onSubmit={handleSaveFeedback} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-text-muted uppercase mb-1">
              Return Odometer (KM) *
            </label>
            <input
              type="number"
              value={odometerEnd}
              onChange={(e) => setOdometerEnd(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-mono rounded-input border border-border bg-surface text-text-main focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-text-muted uppercase mb-1">
              Customer Feedback Rating (1 to 5 Stars) *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 rounded hover:bg-surface-subtle"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="font-bold text-sm text-text-main ml-2">{rating} / 5</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-text-muted uppercase mb-1">
              Customer Comments &amp; Purchase Intent
            </label>
            <textarea
              rows={3}
              placeholder="Customer feedback on ride handling, acceleration, braking, and next steps..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-input border border-border bg-surface text-text-main focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setFeedbackModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="bg-primary text-white">
              Save Review &amp; Close Ride
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default TestRidesPage;
