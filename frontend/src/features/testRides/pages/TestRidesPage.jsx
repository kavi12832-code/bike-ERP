import React, { useState } from 'react';
import { useAppStore } from '../../../store';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { BikeThumb } from '../../../components/domain/BikeThumb';
import { formatTimeOnly, formatDate } from '../../../lib/format';
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
      bikeModel: 'Royal Enfield Hunter 350',
      demoBikeReg: 'KA-05-DEMO-01',
      scheduledDate: new Date().toISOString(),
      timeSlot: '11:30 AM - 12:00 PM',
      licenceVerified: true,
      status: 'SCHEDULED', // SCHEDULED, COMPLETED, CANCELLED
      feedbackRating: null,
      feedbackComment: '',
    },
    {
      id: 'tr-002',
      customerName: 'Meera Krishnan',
      phone: '+91 97420 55432',
      bikeModel: 'TVS iQube Electric',
      demoBikeReg: 'KA-05-EV-DEMO',
      scheduledDate: new Date().toISOString(),
      timeSlot: '02:00 PM - 02:30 PM',
      licenceVerified: true,
      status: 'COMPLETED',
      feedbackRating: 5,
      feedbackComment: 'Loved the smooth electric acceleration and regenerative braking!',
    },
    {
      id: 'tr-003',
      customerName: 'Sanjay Reddy',
      phone: '+91 99450 67124',
      bikeModel: 'Royal Enfield Himalayan 450',
      demoBikeReg: 'KA-05-ADV-DEMO',
      scheduledDate: new Date().toISOString(),
      timeSlot: '04:00 PM - 04:30 PM',
      licenceVerified: true,
      status: 'SCHEDULED',
      feedbackRating: null,
      feedbackComment: '',
    },
  ]);

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [activeRide, setActiveRide] = useState(null);

  // New Test ride state
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedBike, setSelectedBike] = useState(bikeCatalog[0]?.model || 'Hunter 350');
  const [timeSlot, setTimeSlot] = useState('11:00 AM - 11:30 AM');
  const [licenceUploaded, setLicenceUploaded] = useState(false);

  // Feedback form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleCreateTestRide = (e) => {
    e.preventDefault();
    if (!licenceUploaded) {
      toast.error('Driving licence photo verification is required before starting test ride!');
      return;
    }

    const newRide = {
      id: `tr-${Date.now()}`,
      customerName,
      phone,
      bikeModel: selectedBike,
      demoBikeReg: 'KA-05-DEMO-02',
      scheduledDate: new Date().toISOString(),
      timeSlot,
      licenceVerified: true,
      status: 'SCHEDULED',
      feedbackRating: null,
      feedbackComment: '',
    };

    setTestRides([newRide, ...testRides]);
    setBookingModalOpen(false);
    toast.success(`Test ride scheduled for ${customerName} on ${selectedBike}!`);
  };

  const handleSaveFeedback = () => {
    if (!activeRide) return;
    setTestRides(
      testRides.map((tr) =>
        tr.id === activeRide.id
          ? { ...tr, status: 'COMPLETED', feedbackRating: rating, feedbackComment: comment }
          : tr
      )
    );
    setFeedbackModalOpen(false);
    toast.success(`Feedback saved! Rating: ${rating}/5`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main">Demo Bikes & Test Ride Calendar</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Licence verification gate, ride slot tracking and instant conversion to quotation
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={PlusCircle}
          onClick={() => setBookingModalOpen(true)}
        >
          Book Test Ride
        </Button>
      </div>

      {/* Demo Fleet Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-blue-50 text-status-blue">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-text-muted">Registered Demo Fleet</div>
              <div className="text-lg font-bold text-text-main">6 Dedicated Bikes</div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-status-green">
            100% Insured
          </span>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-amber-50 text-status-amber">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-text-muted">Today's Scheduled Rides</div>
              <div className="text-lg font-bold text-text-main tabular-nums">
                {testRides.filter((r) => r.status === 'SCHEDULED').length} Rides
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-status-amber">
            Active
          </span>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-green-50 text-status-green">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-text-muted">Average Ride CSAT</div>
              <div className="text-lg font-bold text-status-green">4.9 / 5.0</div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-status-green">
            Top Tier
          </span>
        </Card>
      </div>

      {/* Test Rides Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Today's Test Ride Slots</CardTitle>
          <span className="text-xs text-text-muted">{formatDate(new Date())}</span>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-subtle border-b border-border text-text-muted font-semibold uppercase text-[11px]">
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Phone</th>
                <th className="p-3.5">Demo Model</th>
                <th className="p-3.5">Demo Reg #</th>
                <th className="p-3.5">Time Slot</th>
                <th className="p-3.5">DL Status</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {testRides.map((ride) => (
                <tr key={ride.id} className="hover:bg-surface-subtle/70 transition-colors">
                  <td className="p-3.5 font-bold text-text-main">{ride.customerName}</td>
                  <td className="p-3.5 text-text-muted">{ride.phone}</td>
                  <td className="p-3.5 font-semibold text-primary">{ride.bikeModel}</td>
                  <td className="p-3.5 font-mono text-text-muted">{ride.demoBikeReg}</td>
                  <td className="p-3.5 tabular-nums text-text-main">{ride.timeSlot}</td>
                  <td className="p-3.5">
                    {ride.licenceVerified ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-status-green bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                        <FileCheck className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-status-red bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                        Missing DL
                      </span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <StatusBadge status={ride.status} />
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {ride.status === 'SCHEDULED' ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setActiveRide(ride);
                            setFeedbackModalOpen(true);
                          }}
                        >
                          Complete & Feedback
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="primary"
                          icon={ArrowRight}
                          onClick={() => {
                            navigate('/quotations');
                            toast.success(`Converting ${ride.customerName}'s test ride to official quotation!`);
                          }}
                        >
                          Convert to Quote
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Book Test Ride Modal */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title="Schedule Customer Test Ride"
        size="md"
      >
        <form onSubmit={handleCreateTestRide} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-text-main mb-1">Customer Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Babu"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full p-2.5 rounded-input border border-border bg-surface-subtle text-text-main"
            />
          </div>

          <div>
            <label className="block font-semibold text-text-main mb-1">Phone Number (+91)</label>
            <input
              type="tel"
              required
              placeholder="9845012345"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 rounded-input border border-border bg-surface-subtle text-text-main"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-text-main mb-1">Demo Bike Model</label>
              <select
                value={selectedBike}
                onChange={(e) => setSelectedBike(e.target.value)}
                className="w-full p-2.5 rounded-input border border-border bg-surface-subtle text-text-main"
              >
                {bikeCatalog.map((b) => (
                  <option key={b.id} value={`${b.brand} ${b.model}`}>
                    {b.brand} {b.model}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-text-main mb-1">Time Slot</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full p-2.5 rounded-input border border-border bg-surface-subtle text-text-main"
              >
                <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                <option value="11:00 AM - 11:30 AM">11:00 AM - 11:30 AM</option>
                <option value="12:00 PM - 12:30 PM">12:00 PM - 12:30 PM</option>
                <option value="03:00 PM - 03:30 PM">03:00 PM - 03:30 PM</option>
                <option value="04:30 PM - 05:00 PM">04:30 PM - 05:00 PM</option>
              </select>
            </div>
          </div>

          {/* Licence Photo Upload Simulation */}
          <div className="p-3 rounded-card bg-surface-subtle border border-dashed border-border text-center">
            <Camera className="w-6 h-6 text-text-muted mx-auto mb-1.5" />
            <div className="font-semibold text-text-main">Original Driving Licence Scan</div>
            <p className="text-[10px] text-text-muted mt-0.5">Mandatory security check prior to key handover</p>
            <div className="mt-2.5">
              <Button
                type="button"
                size="sm"
                variant={licenceUploaded ? 'secondary' : 'primary'}
                onClick={() => {
                  setLicenceUploaded(true);
                  toast.success('Driving Licence photo verified successfully (KA-03-2018001923)');
                }}
              >
                {licenceUploaded ? '✓ DL Photo Attached' : 'Capture / Upload Licence'}
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setBookingModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Confirm Test Ride Booking
            </Button>
          </div>
        </form>
      </Modal>

      {/* Ride Feedback Modal */}
      <Modal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        title="Test Ride Completion & Feedback"
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-text-main mb-1.5">
              Customer Ride Experience (1 to 5 Stars)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-2 rounded-button border flex items-center justify-center ${
                    rating >= star
                      ? 'border-amber-400 bg-amber-50 text-amber-500'
                      : 'border-border text-slate-300'
                  }`}
                >
                  <Star className="w-5 h-5 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-text-main mb-1">Customer Observations / Remarks</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Liked pickup, wants to compare with Hunter Dapper White..."
              className="w-full p-2.5 rounded-input border border-border bg-surface-subtle text-text-main"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setFeedbackModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveFeedback}>
              Complete & Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
