import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useStore } from '../../store';
import { formatMoney } from '../../lib/format';
import { BikeThumb } from '../../components/domain/BikeThumb';
import { QRCodeSVG } from 'qrcode.react';
import {
  Bike,
  Wrench,
  Calendar,
  Receipt,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Smartphone,
  Download,
  CreditCard,
  QrCode,
  LogOut,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

export default function CustomerPortalPage() {
  const store = useStore();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [phone, setPhone] = useState('9845012345');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [activeTab, setActiveTab] = useState('garage'); // 'garage', 'book', 'track', 'vault'

  // Service Booking State
  const [selectedPackage, setSelectedPackage] = useState('General Maintenance Service');
  const [selectedDate, setSelectedDate] = useState('2026-10-26');
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Demo Customer Data
  const customer = {
    name: 'Rohan Mehta',
    phone: '+91 98450 12345',
    email: 'rohan.mehta@gmail.com',
    address: '#142, Indiranagar 100ft Road, Bangalore, Karnataka',
    bikes: [
      {
        id: 'B-101',
        model: 'Royal Enfield Hunter 350',
        color: 'Dapper Ash',
        regNumber: 'KA-01-MJ-4589',
        chassis: 'ME3J350ERKA108922',
        bodyType: 'cruiser',
        purchaseDate: '2023-04-12',
        insuranceValidTill: '2027-04-11',
        amcStatus: 'Active (2 Free Services Remaining)',
        lastService: '2026-08-10 (4,850 km)',
      },
    ],
  };

  // Active Job for Rohan
  const activeJob = {
    jobCardNumber: 'JC-2627-0042',
    bikeModel: 'Royal Enfield Hunter 350',
    regNumber: 'KA-01-MJ-4589',
    stage: 'Quality Check & Detailing',
    technician: 'Karthik Raja (Master Tech)',
    serviceType: '10,000 km Scheduled Service',
    estimatedReady: 'Today, 5:30 PM',
    estimatedAmountPaise: 245000, // ₹ 2,450.00
    steps: [
      { name: 'Vehicle Dropped & Inspected', done: true, time: '09:15 AM' },
      { name: 'Parts Issued from Store', done: true, time: '10:45 AM' },
      { name: 'Engine Oil & Filter Service', done: true, time: '01:30 PM' },
      { name: 'Pressure Wash & Polish', done: true, time: '03:15 PM' },
      { name: 'Dual-Control Quality Check', done: true, time: '04:00 PM' },
      { name: 'Ready for Gate Delivery', done: false, time: 'Pending' },
    ],
  };

  const handleSendOtp = () => {
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    setOtpSent(true);
    setOtp('123456');
    toast.success('Mock OTP sent to +91 ' + phone + ': 123456');
  };

  const handleVerifyOtp = () => {
    if (otp === '123456') {
      setIsLoggedIn(true);
      toast.success('Welcome back, Rohan Mehta!');
    } else {
      toast.error('Invalid OTP. Use 123456');
    }
  };

  const handleConfirmService = () => {
    setBookingSuccess(true);
    toast.success(`Service appointment confirmed for ${selectedDate} at ${selectedSlot}!`);
  };

  if (!isLoggedIn) {
    return (
      <div className="h-full overflow-y-auto bg-slate-900 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
              VB
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">AKASH Bajaj Customer Portal</h2>
              <p className="text-xs text-slate-500">Service, RC Vault &amp; Live Tracking</p>
            </div>
          </div>

          <div className="space-y-4 mt-6">
            <div>
              <label className="text-xs font-semibold text-slate-600">Enter Registered Mobile Number</label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-2 rounded-lg border border-slate-300">
                  +91
                </span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98450 12345"
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {otpSent ? (
              <div>
                <label className="text-xs font-semibold text-slate-600">Enter 6-Digit Verification Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 text-sm tracking-widest text-center font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  variant="primary"
                  onClick={handleVerifyOtp}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Verify &amp; Access My Garage
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                onClick={handleSendOtp}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2"
              >
                Send Login OTP
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#F3F7FD] dark:bg-slate-950 pb-20">
      {/* Customer Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
              VB
            </div>
            <div>
              <h1 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-tight">
                AKASH Bajaj Customer Lounge
              </h1>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <span>Welcome, {customer.name}</span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-600 font-medium">Verified Customer</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/"
              className="text-xs font-medium text-blue-600 hover:underline hidden sm:inline"
            >
              Back to Staff ERP
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLoggedIn(false)}
              className="text-xs"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Navigation Tabs (Pills) */}
        <div className="grid grid-cols-4 gap-2 bg-slate-200/80 dark:bg-slate-800 p-1.5 rounded-xl">
          <button
            onClick={() => setActiveTab('garage')}
            className={`py-2 px-2 sm:px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'garage'
                ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span className="hidden sm:inline">My Garage</span>
          </button>

          <button
            onClick={() => setActiveTab('track')}
            className={`py-2 px-2 sm:px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all relative ${
              activeTab === 'track'
                ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Live Job Tracker</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse absolute top-1.5 right-1.5 sm:hidden" />
          </button>

          <button
            onClick={() => setActiveTab('book')}
            className={`py-2 px-2 sm:px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'book'
                ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Book Service</span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`py-2 px-2 sm:px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'vault'
                ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span className="hidden sm:inline">Invoices &amp; RC</span>
          </button>
        </div>

        {/* 1. MY GARAGE TAB */}
        {activeTab === 'garage' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Registered Vehicles</h2>
              <span className="text-xs text-slate-500">1 Vehicle Enrolled</span>
            </div>

            {customer.bikes.map((bike) => (
              <Card key={bike.id} className="p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center p-2">
                      <BikeThumb bodyType={bike.bodyType} className="w-12 h-12 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {bike.model}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Color: {bike.color} • Purchased: {bike.purchaseDate}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700">
                          {bike.regNumber}
                        </span>
                        <StatusBadge status="Confirmed" label="Active Warranty" />
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setActiveTab('book')}
                    className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                  >
                    Schedule Service
                  </Button>
                </div>

                {/* Bike Metrics Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                    <span className="text-slate-400 block font-medium">Chassis VIN</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {bike.chassis}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                    <span className="text-slate-400 block font-medium">Insurance Expiry</span>
                    <span className="font-semibold text-emerald-600 mt-0.5 block">
                      Valid till {bike.insuranceValidTill}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                    <span className="text-slate-400 block font-medium">Annual Maintenance (AMC)</span>
                    <span className="font-semibold text-blue-600 mt-0.5 block">
                      {bike.amcStatus}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* 2. LIVE JOB TRACKER TAB */}
        {activeTab === 'track' && (
          <div className="space-y-6">
            <Card className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 px-2.5 py-0.5 rounded">
                      {activeJob.jobCardNumber}
                    </span>
                    <StatusBadge status="In Progress" label={activeJob.stage} />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base mt-1.5">
                    {activeJob.bikeModel} ({activeJob.regNumber})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Lead Technician: {activeJob.technician} • Estimated Ready: {activeJob.estimatedReady}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Estimated Total Bill</div>
                  <div className="text-xl font-bold tabular-nums text-slate-900 dark:text-white">
                    {formatMoney(activeJob.estimatedAmountPaise)}
                  </div>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="py-6">
                <div className="space-y-4">
                  {activeJob.steps.map((st, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            st.done
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                          }`}
                        >
                          {st.done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        {idx !== activeJob.steps.length - 1 && (
                          <div
                            className={`w-0.5 h-8 my-1 ${
                              st.done ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-sm font-semibold ${
                              st.done
                                ? 'text-slate-900 dark:text-white'
                                : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {st.name}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">{st.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* UPI Online Settlement Box */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <QRCodeSVG
                      value={`upi://pay?pa=akashbajaj@icici&pn=AKASHBajaj&am=${activeJob.estimatedAmountPaise / 100}&cu=INR`}
                      size={64}
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                      Pre-Approve &amp; Pay via UPI
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                      Fast-track your vehicle delivery by settling online before arrival.
                    </p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  onClick={() => toast.success('Mock UPI Payment of ₹2,450 successfully authorized!')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                >
                  <CreditCard className="w-4 h-4 mr-1.5" />
                  Pay ₹ 2,450 via UPI
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* 3. BOOK SERVICE TAB */}
        {activeTab === 'book' && (
          <Card className="p-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Schedule Workshop Appointment
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Bangalore Central Flagship Workshop (Mon-Sat, 9:00 AM - 6:00 PM)
            </p>

            {bookingSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                  Service Appointment Confirmed!
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  We have reserved your bay slot for {selectedDate} at {selectedSlot}. A confirmation SMS and WhatsApp reminder have been dispatched.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setBookingSuccess(false)}
                  className="mt-4"
                >
                  Book Another Appointment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Select Service Package
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
                    {[
                      { name: 'General Maintenance Service', price: '₹ 2,450', desc: 'Engine oil, filter replacement, 24-point safety check' },
                      { name: 'Free AMC Scheduled Check', price: '₹ 0.00', desc: 'Covered under your active AKASH Bajaj AMC plan' },
                      { name: 'Water Wash & Chain Detailing', price: '₹ 450', desc: 'Foam wash, chain lubrication, polish' },
                      { name: 'Express Brake & Electrical Diagnostic', price: '₹ 850', desc: 'Brake pads check, battery load test' },
                    ].map((pkg) => (
                      <div
                        key={pkg.name}
                        onClick={() => setSelectedPackage(pkg.name)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          selectedPackage === pkg.name
                            ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-xs">{pkg.name}</span>
                          <span className="font-bold text-xs text-blue-600">{pkg.price}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{pkg.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min="2026-10-25"
                      className="w-full mt-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Preferred Bay Slot
                    </label>
                    <select
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      className="w-full mt-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="09:00 AM">09:00 AM (Available)</option>
                      <option value="10:00 AM">10:00 AM (Available)</option>
                      <option value="11:30 AM">11:30 AM (Available)</option>
                      <option value="02:00 PM">02:00 PM (Available)</option>
                      <option value="03:30 PM">03:30 PM (Available)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <Button
                    variant="primary"
                    onClick={handleConfirmService}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Confirm Service Slot
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* 4. INVOICES & VAULT TAB */}
        {activeTab === 'vault' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Document Vault &amp; Tax Invoices
            </h2>

            <Card className="p-4 divide-y divide-slate-100 dark:divide-slate-800">
              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Receipt className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-white">
                      Tax Invoice VI/2627/00001
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Vehicle Purchase: Royal Enfield Hunter 350 • ₹ 1,94,800
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success('Downloading Official GST Tax Invoice PDF...')}
                  className="text-xs"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Download
                </Button>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-white">
                      HDFC ERGO Comprehensive Policy
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Policy #2312-9845-01 • Valid until April 2027
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success('Downloading Insurance Certificate...')}
                  className="text-xs"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Certificate
                </Button>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wrench className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-white">
                      OEM 3-Year Extended Warranty Certificate
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Contract #VBS-AMC-2627 • Zero Depreciation cover
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success('Downloading Warranty Card...')}
                  className="text-xs"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Download
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
