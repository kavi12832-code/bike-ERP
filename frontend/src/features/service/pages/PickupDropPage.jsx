import React, { useState } from 'react';
import { 
  MapPin, 
  Truck, 
  Phone, 
  Clock, 
  CheckCircle2, 
  User, 
  Plus, 
  Navigation, 
  KeyRound, 
  AlertCircle,
  Calendar
} from 'lucide-react';
import { formatMoney } from '../../../lib/format';
import { PageHeader } from '../../../components/ui/PageHeader';
import { KpiCard } from '../../../components/ui/KpiCard';
import { toast } from 'sonner';

const SAMPLE_TRIPS = [
  {
    id: 'trip-001',
    type: 'PICKUP', // PICKUP or DROP
    customerName: 'Praveen Venkatesh',
    phone: '+91 98451 90812',
    address: 'Flat 402, Prestige Palms, Koramangala 4th Block, Bangalore',
    vehicleModel: 'Royal Enfield Meteor 350',
    registrationNumber: 'KA-01-EQ-5590',
    timeWindow: '09:00 - 11:00 AM',
    driverName: 'Suresh Gowda',
    status: 'EN_ROUTE', // ASSIGNED, EN_ROUTE, COLLECTED, AT_WORKSHOP, OUT_FOR_DELIVERY, DELIVERED
    otp: '4821',
    isAmcFree: true,
    chargesPaise: 0,
  },
  {
    id: 'trip-002',
    type: 'PICKUP',
    customerName: 'Deepa Hegde',
    phone: '+91 97401 23456',
    address: 'Villa 12, Chaithanya Smaran, Whitefield Main Road',
    vehicleModel: 'Honda Activa 6G',
    registrationNumber: 'KA-53-EN-8812',
    timeWindow: '11:00 - 01:00 PM',
    driverName: 'Ramesh Kumar',
    status: 'ASSIGNED',
    otp: '9103',
    isAmcFree: false,
    chargesPaise: 25000, // ₹250
  },
  {
    id: 'trip-003',
    type: 'DROP',
    customerName: 'Rohit Chandran',
    phone: '+91 98860 99441',
    address: '14th Cross, Indiranagar 1st Stage, Bangalore',
    vehicleModel: 'Royal Enfield Himalayan 450',
    registrationNumber: 'KA-03-NJ-1122',
    timeWindow: '02:00 - 04:00 PM',
    driverName: 'Suresh Gowda',
    status: 'AT_WORKSHOP',
    otp: '6529',
    isAmcFree: true,
    chargesPaise: 0,
  },
  {
    id: 'trip-004',
    type: 'DROP',
    customerName: 'Anil Kumar',
    phone: '+91 98440 55112',
    address: 'Near HDFC Bank, Bellandur Outer Ring Road',
    vehicleModel: 'TVS iQube Electric',
    registrationNumber: 'KA-03-EV-8840',
    timeWindow: '04:00 - 06:00 PM',
    driverName: 'Ramesh Kumar',
    status: 'OUT_FOR_DELIVERY',
    otp: '3310',
    isAmcFree: false,
    chargesPaise: 40000, // ₹400
  }
];

export function PickupDropPage() {
  const [trips, setTrips] = useState(SAMPLE_TRIPS);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'PICKUP', 'DROP'
  const [enteredOtp, setEnteredOtp] = useState({});

  const updateTripStatus = (tripId, newStatus) => {
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, status: newStatus } : t));
    toast.success(`Trip status updated to ${newStatus}`);
  };

  const handleVerifyOtp = (trip) => {
    const input = enteredOtp[trip.id];
    if (input === trip.otp) {
      const nextStatus = trip.type === 'PICKUP' ? 'COLLECTED' : 'DELIVERED';
      updateTripStatus(trip.id, nextStatus);
      toast.success(`Handover OTP ${input} verified! Vehicle status: ${nextStatus}.`);
    } else {
      toast.error('Invalid OTP! Please check with customer on WhatsApp.');
    }
  };

  const filteredTrips = trips.filter(t => filterType === 'ALL' || t.type === filterType);

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Workshop & Service', path: '/service/bays' },
          { label: 'Pickup & Drop', path: '/service/pickup' },
        ]}
        title="Doorstep Pickup & Drop Logistics"
        subtitle="Driver transit dispatch, route windows, OTP-verified custody handover and AMC billing waiver."
        actions={
          <div className="flex items-center gap-1.5 bg-surface-subtle p-1 rounded-lg border border-border">
            {['ALL', 'PICKUP', 'DROP'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  filterType === type
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                {type === 'ALL' ? 'All Trips' : `${type}s`}
              </button>
            ))}
          </div>
        }
      />

      {/* 2. Plain KPI Cards per Section 0.5 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          label="Active Transit Drivers"
          value="2 On Duty"
          helperText="Suresh & Ramesh"
          icon={<User className="w-5 h-5 text-primary" />}
        />
        <KpiCard
          label="Today's Transit Queue"
          value={`${trips.length} Bookings`}
          helperText="Pickups & Drops scheduled"
          icon={<Truck className="w-5 h-5 text-blue-500" />}
        />
        <KpiCard
          label="Doorstep Logistics Rev."
          value={formatMoney(trips.reduce((sum, t) => sum + t.chargesPaise, 0))}
          helperText="Paid logistics charges"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
        />
        <KpiCard
          label="AMC Logistics Waivers"
          value="2 Trips FOC"
          helperText="Under Gold/Platinum AMC"
          icon={<KeyRound className="w-5 h-5 text-purple-500" />}
        />
      </div>

      {/* Trips Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTrips.map(trip => (
          <div 
            key={trip.id} 
            className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    trip.type === 'PICKUP' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' : 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                  }`}>
                    {trip.type}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {trip.customerName}
                  </h3>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">
                  {trip.vehicleModel} (<span className="font-mono">{trip.registrationNumber}</span>)
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded block">
                  {trip.timeWindow}
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {trip.isAmcFree ? (
                    <strong className="text-emerald-600">Free (AMC Cover)</strong>
                  ) : (
                    <span>Fee: {formatMoney(trip.chargesPaise)}</span>
                  )}
                </span>
              </div>
            </div>

            {/* Address with direct dial */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs space-y-2">
              <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{trip.address}</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Driver: <strong>{trip.driverName}</strong></span>
                <a
                  href={`tel:${trip.phone}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold hover:bg-emerald-100"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {trip.phone}</span>
                </a>
              </div>
            </div>

            {/* Progress Stages Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                <span>Trip Status</span>
                <span className="text-blue-600 font-bold font-mono">{trip.status}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{
                    width: 
                      trip.status === 'ASSIGNED' ? '20%' :
                      trip.status === 'EN_ROUTE' ? '40%' :
                      trip.status === 'COLLECTED' ? '60%' :
                      trip.status === 'AT_WORKSHOP' ? '75%' :
                      trip.status === 'OUT_FOR_DELIVERY' ? '90%' : '100%'
                  }}
                />
              </div>
            </div>

            {/* OTP Handover Verification Box */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-500 shrink-0" />
                <input
                  type="text"
                  maxLength={4}
                  placeholder="Enter OTP (e.g. 4821)"
                  value={enteredOtp[trip.id] || ''}
                  onChange={(e) => setEnteredOtp({ ...enteredOtp, [trip.id]: e.target.value })}
                  className="w-36 px-2.5 py-1 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>

              <button
                onClick={() => handleVerifyOtp(trip)}
                className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
              >
                Verify &amp; Handover
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PickupDropPage;
