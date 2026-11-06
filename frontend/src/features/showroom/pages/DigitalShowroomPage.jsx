import React, { useState } from 'react';
import { 
  Monitor, 
  Layers, 
  Calculator, 
  Lock, 
  Unlock, 
  Check, 
  Plus, 
  Sparkles, 
  Bike, 
  Fuel, 
  Gauge, 
  ShieldCheck, 
  Tag, 
  X,
  CreditCard
} from 'lucide-react';
import { BikeThumb } from '../../../components/domain/BikeThumb';
import { PageHeader } from '../../../components/ui/PageHeader';
import { KpiCard } from '../../../components/ui/KpiCard';
import { BIKE_CATALOG } from '../../../data/catalogs/bikes';
import { formatMoney } from '../../../lib/format';
import { toast } from 'sonner';

const STATE_TAX_RATES = {
  KARNATAKA: { name: 'Karnataka (Bangalore)', rtoPercent: 18, roadSafetyPaise: 100000 },
  TAMIL_NADU: { name: 'Tamil Nadu (Chennai)', rtoPercent: 12, roadSafetyPaise: 75000 },
  KERALA: { name: 'Kerala (Kochi)', rtoPercent: 15, roadSafetyPaise: 80000 },
  ANDHRA: { name: 'Andhra Pradesh (Tirupati)', rtoPercent: 12, roadSafetyPaise: 60000 },
};

const SHOWROOM_ACCESSORIES = [
  { id: 'acc-crash', name: 'Engine Crash Guard & Bash Plate', pricePaise: 385000 },
  { id: 'acc-seat', name: 'Touring Gel Seat Upgrade', pricePaise: 240000 },
  { id: 'acc-vis', name: 'Tall Windscreen Visor', pricePaise: 165000 },
  { id: 'acc-saddle', name: 'Waterproof Side Saddlebags (Pair)', pricePaise: 420000 },
];

export function DigitalShowroomPage() {
  const [selectedBike, setSelectedBike] = useState(BIKE_CATALOG[0]);
  const [selectedColor, setSelectedColor] = useState(BIKE_CATALOG[0].colors[0]);
  const [selectedState, setSelectedState] = useState('KARNATAKA');
  const [selectedAccessories, setSelectedAccessories] = useState(['acc-crash']);
  const [comparisonBikes, setComparisonBikes] = useState([BIKE_CATALOG[0], BIKE_CATALOG[1], BIKE_CATALOG[2]]);
  const [showComparison, setShowComparison] = useState(false);

  // Customer Kiosk Mode with PIN Lock
  const [isCustomerMode, setIsCustomerMode] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');

  // EMI Calculator state
  const [downPaymentPercent, setDownPaymentPercent] = useState(25);
  const [tenureMonths, setTenureMonths] = useState(36);
  const [interestRatePercent, setInterestRatePercent] = useState(9.5);

  const toggleAccessory = (accId) => {
    setSelectedAccessories(prev => 
      prev.includes(accId) ? prev.filter(id => id !== accId) : [...prev, accId]
    );
  };

  // Price calculations
  const stateRule = STATE_TAX_RATES[selectedState];
  const exShowroomPaise = selectedBike.exShowroomPaise;
  const rtoTaxPaise = Math.round((exShowroomPaise * stateRule.rtoPercent) / 100);
  const insurancePaise = Math.round(exShowroomPaise * 0.045) + 185000; // 5-year insurance
  const accessoriesTotalPaise = SHOWROOM_ACCESSORIES
    .filter(a => selectedAccessories.includes(a.id))
    .reduce((sum, a) => sum + a.pricePaise, 0);

  const onRoadPricePaise = exShowroomPaise + rtoTaxPaise + insurancePaise + stateRule.roadSafetyPaise + accessoriesTotalPaise;

  // EMI math
  const downPaymentPaise = Math.round((onRoadPricePaise * downPaymentPercent) / 100);
  const loanPrincipalPaise = onRoadPricePaise - downPaymentPaise;
  const monthlyRate = (interestRatePercent / 12) / 100;
  const emiPaise = Math.round(
    (loanPrincipalPaise * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1)
  );
  const totalRepaymentPaise = emiPaise * tenureMonths;
  const totalInterestPaise = totalRepaymentPaise - loanPrincipalPaise;

  const handleToggleCustomerMode = () => {
    if (isCustomerMode) {
      setShowPinModal(true);
    } else {
      setIsCustomerMode(true);
      toast.success('Customer Kiosk Mode engaged. Staff margin & cost figures locked.');
    }
  };

  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (pinInput === '1234') {
      setIsCustomerMode(false);
      setShowPinModal(false);
      setPinInput('');
      toast.success('Staff Mode unlocked successfully.');
    } else {
      toast.error('Incorrect PIN! Default manager PIN is 1234.');
    }
  };

  return (
    <div className={`p-4 sm:p-5 max-w-7xl mx-auto space-y-4 ${isCustomerMode ? 'bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 border-4 border-blue-500/20' : ''}`}>
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Operations', path: '/dashboard' },
          { label: 'Digital Showroom', path: '/showroom' },
        ]}
        title="AKASH Bajaj Digital Showroom Kiosk"
        subtitle="Explore models, test colour combinations, compute regional on-road pricing and design tailored EMI plans."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-text-main bg-surface border border-border rounded-lg hover:bg-surface-subtle shadow-xs transition"
            >
              <Layers className="w-3.5 h-3.5 text-primary" />
              {showComparison ? 'Back to Configurator' : '3-Bike Spec Compare'}
            </button>

            <button
              onClick={handleToggleCustomerMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border shadow-xs transition ${
                isCustomerMode
                  ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                  : 'bg-primary text-white border-primary hover:bg-primary-hover'
              }`}
            >
              {isCustomerMode ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              {isCustomerMode ? 'Exit Customer Mode' : 'Lock Customer Kiosk'}
            </button>
          </div>
        }
      />

      {/* 2. Plain KPI Cards per Section 0.5 */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard
          label="Models in Catalog"
          value={BIKE_CATALOG.length}
          helperText="Active showroom fleet"
          icon={<Bike className="w-5 h-5 text-primary" />}
        />
        <KpiCard
          label="Ex-Showroom Starting"
          value={formatMoney(selectedBike.exShowroomPaise)}
          helperText={`${selectedBike.model} standard`}
          icon={<Tag className="w-5 h-5 text-emerald-500" />}
        />
        <KpiCard
          label="Calculated On-Road"
          value={formatMoney(onRoadPricePaise)}
          helperText={`State: ${stateRule.name.split(' ')[0]}`}
          icon={<Gauge className="w-5 h-5 text-blue-500" />}
        />
        <KpiCard
          label="Estimated EMI / mo"
          value={formatMoney(emiPaise)}
          helperText={`${tenureMonths} mo @ ${interestRatePercent}%`}
          icon={<CreditCard className="w-5 h-5 text-purple-500" />}
        />
      </div>

      {showComparison ? (
        /* 3-Bike Side-by-Side Comparison Matrix */
        <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                3-Way Direct Model Comparison
              </h2>
              <p className="text-xs text-slate-500">Benchmark power, displacement, mileage, kerb weight &amp; ex-showroom pricing</p>
            </div>
            <button
              onClick={() => setShowComparison(false)}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Close Comparison
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {comparisonBikes.map(bike => (
              <div key={bike.id} className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="h-32 flex items-center justify-center p-2 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
                  <BikeThumb
                    bodyType={bike.bodyType}
                    color={bike.colors[0]?.hex || '#2563EB'}
                    imageUrl={bike.imageUrl}
                    className="w-full h-28 object-contain"
                  />
                </div>

                <div className="text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">{bike.brand}</span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">{bike.model}</h3>
                  <div className="text-sm font-bold text-blue-600 font-mono mt-1">
                    Ex-Showroom: {formatMoney(bike.exShowroomPaise)}
                  </div>
                </div>

                <div className="space-y-2 text-xs divide-y divide-slate-200 dark:divide-slate-700 pt-2">
                  <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                    <span>Displacement:</span>
                    <strong className="font-mono">{bike.displacementCc} cc</strong>
                  </div>
                  <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                    <span>Fuel Type:</span>
                    <strong className="font-mono">{bike.fuelType}</strong>
                  </div>
                  <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                    <span>Certified Mileage:</span>
                    <strong className="font-mono">{bike.mileageKmpl} km/l</strong>
                  </div>
                  <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                    <span>Fuel Tank Capacity:</span>
                    <strong className="font-mono">{bike.fuelTankLitres} Litres</strong>
                  </div>
                  <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                    <span>Warranty:</span>
                    <strong>3 Years / 30,000 KM</strong>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedBike(bike);
                    setSelectedColor(bike.colors[0]);
                    setShowComparison(false);
                    toast.success(`Selected ${bike.model} in configurator`);
                  }}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition"
                >
                  Configure This Bike
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Configurator: Bike Selector + Live SVG Color Tinting + Price Breakdown + EMI */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left 2 Cols: Bike Canvas + Color Chips + Accessories */}
          <div className="lg:col-span-2 space-y-3">
            {/* Bike Select Strip */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {BIKE_CATALOG.map(b => (
                <button
                  key={b.id}
                  onClick={() => {
                    setSelectedBike(b);
                    setSelectedColor(b.colors[0]);
                  }}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                    selectedBike.id === b.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {b.model}
                </button>
              ))}
            </div>

            {/* Visual Canvas Display */}
            <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-5 py-2.5 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-blue-600">
                    {selectedBike.brand}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700 font-bold">•</span>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    {selectedBike.model}
                  </h2>
                </div>
                <p className="text-xs text-slate-400 italic">"{selectedBike.tagline}"</p>
              </div>

              {/* Showcase Frame - Full Width Tab Fit */}
              <div className="w-full">
                {selectedBike.videoUrl ? (
                  <div className="relative w-full aspect-video bg-black overflow-hidden">
                    <video
                      key={selectedBike.videoUrl}
                      src={selectedBike.videoUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      disablePictureInPicture
                      onContextMenu={(e) => e.preventDefault()}
                      className="w-full h-full object-cover pointer-events-none select-none"
                    />
                  </div>
                ) : (
                  <div className="py-8 flex items-center justify-center">
                    <BikeThumb
                      bodyType={selectedBike.bodyType}
                      color={selectedColor?.hex || '#2563EB'}
                      imageUrl={selectedBike.imageUrl}
                      className="w-80 h-48 drop-shadow-xl transition-all duration-300"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Optional Genuine Accessories Pack */}
            <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" />
                Customize with Genuine Factory Accessories
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SHOWROOM_ACCESSORIES.map(acc => {
                  const isChecked = selectedAccessories.includes(acc.id);
                  return (
                    <div
                      key={acc.id}
                      onClick={() => toggleAccessory(acc.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                        isChecked
                          ? 'bg-blue-50 border-blue-300 text-blue-900 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-200'
                          : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-bold">{acc.name}</div>
                        <div className="text-[11px] font-mono text-slate-500">{formatMoney(acc.pricePaise)}</div>
                      </div>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                        isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-400'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Col: Regional On-Road Price + Live EMI Slider */}
          <div className="space-y-6">
            {/* On-Road Price Calculator */}
            <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-blue-600" />
                  On-Road Price Breakdown
                </h3>

                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border rounded-lg"
                >
                  {Object.entries(STATE_TAX_RATES).map(([key, item]) => (
                    <option key={key} value={key}>{item.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800">
                <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                  <span>Ex-Showroom Price:</span>
                  <span className="font-mono font-bold">{formatMoney(exShowroomPaise)}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                  <span>RTO Road Tax ({stateRule.rtoPercent}%):</span>
                  <span className="font-mono">{formatMoney(rtoTaxPaise)}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                  <span>5-Year Comprehensive Insurance:</span>
                  <span className="font-mono">{formatMoney(insurancePaise)}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                  <span>Accessories Selected:</span>
                  <span className="font-mono">{formatMoney(accessoriesTotalPaise)}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                  <span>Smart Card &amp; Road Safety Cess:</span>
                  <span className="font-mono">{formatMoney(stateRule.roadSafetyPaise)}</span>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-xl flex items-center justify-between border border-blue-200 dark:border-blue-900">
                <div>
                  <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider block">Total On-Road</span>
                  <span className="text-xl font-black text-blue-600 font-mono">{formatMoney(onRoadPricePaise)}</span>
                </div>
                <span className="text-[11px] text-slate-500">Includes all taxes</span>
              </div>
            </div>

            {/* Interactive EMI Slider */}
            <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                Easy Monthly EMI Plan
              </h3>

              {/* Down Payment Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500">Down Payment ({downPaymentPercent}%):</span>
                  <span className="font-mono text-slate-900 dark:text-white">{formatMoney(downPaymentPaise)}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              {/* Tenure Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500">Loan Tenure:</span>
                  <span className="font-mono text-slate-900 dark:text-white">{tenureMonths} Months ({tenureMonths / 12} Yrs)</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="60"
                  step="6"
                  value={tenureMonths}
                  onChange={(e) => setTenureMonths(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              {/* EMI Result Card */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Estimated Monthly EMI</span>
                  <span className="text-2xl font-black text-emerald-600 font-mono">{formatMoney(emiPaise)} / mo</span>
                </div>

                <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800 flex justify-between text-[11px] text-emerald-950 dark:text-emerald-200">
                  <span>Loan: {formatMoney(loanPrincipalPaise)}</span>
                  <span>Total Interest: {formatMoney(totalInterestPaise)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff Unlock PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-850 rounded-xl max-w-xs w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" />
              Staff Authentication Required
            </h3>
            <p className="text-xs text-slate-500">
              Enter 4-digit staff PIN to exit customer mode and unlock dealer margins.
            </p>

            <form onSubmit={handleVerifyPin} className="space-y-3">
              <input
                type="password"
                maxLength={4}
                required
                autoFocus
                placeholder="Enter PIN (e.g. 1234)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full p-2.5 text-center text-lg font-mono tracking-widest bg-slate-50 dark:bg-slate-800 border rounded-lg"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="px-3 py-1.5 text-xs rounded-lg border hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DigitalShowroomPage;
