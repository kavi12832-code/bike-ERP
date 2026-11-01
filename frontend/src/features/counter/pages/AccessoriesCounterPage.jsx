import React, { useState } from 'react';
import { 
  ScanBarcode, 
  ShoppingCart, 
  Printer, 
  Trash2, 
  Plus, 
  Minus, 
  QrCode, 
  DollarSign, 
  CreditCard, 
  Check, 
  Search, 
  Tag, 
  Clock, 
  Layers,
  X
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatMoney } from '../../../lib/format';
import { toast } from 'sonner';

const SAMPLE_PRODUCTS = [
  { id: 'acc-01', barcode: '89012345001', name: 'Royal Enfield Urban Trooper Helmet (L)', pricePaise: 295000, category: 'Riding Gear', hsn: '6506', gstRate: 18 },
  { id: 'acc-02', barcode: '89012345002', name: 'Alpinestars All-Weather Riding Gloves', pricePaise: 240000, category: 'Riding Gear', hsn: '6216', gstRate: 18 },
  { id: 'acc-03', barcode: '89012345003', name: 'Himalayan Heavy-Duty Engine Crash Guard', pricePaise: 385000, category: 'Protection', hsn: '8714', gstRate: 28 },
  { id: 'acc-04', barcode: '89012345004', name: 'BOBO Anti-Vibration Claw Mobile Holder', pricePaise: 165000, category: 'Electronics', hsn: '8529', gstRate: 18 },
  { id: 'acc-05', barcode: '89012345005', name: 'Motul 7100 10W50 4T Synthetic Oil (1.5L)', pricePaise: 145000, category: 'Lubes & Care', hsn: '2710', gstRate: 18 },
  { id: 'acc-06', barcode: '89012345006', name: 'Motul C1 Clean + C2 Chain Lube Combo (400ml)', pricePaise: 95000, category: 'Lubes & Care', hsn: '3403', gstRate: 18 },
  { id: 'acc-07', barcode: '89012345007', name: 'Waterproof Touring Saddlebags (Pair 50L)', pricePaise: 420000, category: 'Luggage', hsn: '4202', gstRate: 18 },
  { id: 'acc-08', barcode: '89012345008', name: 'Disc Brake Anti-Theft Alarm Lock (110dB)', pricePaise: 110000, category: 'Security', hsn: '8301', gstRate: 18 },
];

const PRESET_BUNDLES = [
  {
    id: 'bndl-touring',
    name: 'Touring Highway Pack',
    description: 'Crash Guard + Mobile Holder + Saddlebags',
    discountPaise: 120000, // ₹1,200 discount
    items: ['acc-03', 'acc-04', 'acc-07']
  },
  {
    id: 'bndl-chain-care',
    name: 'Chain & Engine Care Kit',
    description: 'Motul 7100 Oil + Chain Clean & Lube Combo',
    discountPaise: 30000, // ₹300 discount
    items: ['acc-05', 'acc-06']
  }
];

export function AccessoriesCounterPage() {
  const [cart, setCart] = useState([]);
  const [barcodeQuery, setBarcodeQuery] = useState('');
  const [search, setSearch] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI'); // 'CASH', 'UPI', 'SPLIT'
  const [cashTendered, setCashTendered] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [shiftFloatPaise, setShiftFloatPaise] = useState(500000); // ₹5,000 opening cash float

  // Add product to cart
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    toast.success(`Added ${product.name} to POS cart`);
  };

  const addBundle = (bundle) => {
    bundle.items.forEach(itemId => {
      const prod = SAMPLE_PRODUCTS.find(p => p.id === itemId);
      if (prod) addToCart(prod);
    });
    toast.success(`Bundle "${bundle.name}" applied with special discount!`);
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id !== id) return item;
      const newQty = item.qty + delta;
      return newQty > 0 ? { ...item, qty: newQty } : null;
    }).filter(Boolean));
  };

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (!barcodeQuery.trim()) return;
    const match = SAMPLE_PRODUCTS.find(p => p.barcode === barcodeQuery.trim() || p.id === barcodeQuery.trim());
    if (match) {
      addToCart(match);
      setBarcodeQuery('');
    } else {
      toast.error(`Barcode "${barcodeQuery}" not recognized in counter catalogue.`);
    }
  };

  // Calculations
  const grossTotalPaise = cart.reduce((sum, i) => sum + (i.pricePaise * i.qty), 0);
  const totalTaxPaise = Math.round(grossTotalPaise * 0.18 / 1.18);
  const netSubtotalPaise = grossTotalPaise - totalTaxPaise;

  const handleCompleteSale = () => {
    if (cart.length === 0) {
      toast.error('POS Cart is empty');
      return;
    }
    setShowReceipt(true);
    toast.success('Sale posted! 80mm thermal slip generated.');
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Operations', path: '/dashboard' },
          { label: 'Accessories Counter (POS)', path: '/counter' },
        ]}
        title="Accessories & Merchandise Fast Counter (POS)"
        subtitle="Rapid walk-in billing with barcode scanning, promotional kit bundles, split payments & 80mm thermal slips."
      />

      {/* 2. Plain KPI Cards per Section 0.5 */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard
          label="Cart Total"
          value={formatMoney(grossTotalPaise)}
          helperText={`${cart.length} line items`}
          icon={<ShoppingCart className="w-5 h-5 text-primary" />}
        />
        <KpiCard
          label="Units in Cart"
          value={`${cart.reduce((sum, i) => sum + i.qty, 0)} Units`}
          helperText="Scanned & in-basket"
          icon={<Layers className="w-5 h-5 text-blue-500" />}
        />
        <KpiCard
          label="Shift Cash Float"
          value={formatMoney(shiftFloatPaise)}
          helperText="Opening till balance"
          icon={<DollarSign className="w-5 h-5 text-emerald-500" />}
        />
        <KpiCard
          label="Payment Mode"
          value={paymentMode}
          helperText="UPI, Cash, or Split"
          icon={<CreditCard className="w-5 h-5 text-purple-500" />}
        />
      </div>

      {/* Main Grid: Products & Bundles vs POS Cart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Barcode Input + Bundle Tiles + Product Grid */}
        <div className="lg:col-span-2 space-y-4">
          {/* Barcode & Search Bar */}
          <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3">
            <form onSubmit={handleBarcodeSubmit} className="relative">
              <ScanBarcode className="w-4 h-4 absolute left-3 top-2.5 text-blue-600" />
              <input
                type="text"
                placeholder="Scan / Type Barcode (e.g. 89012345001)..."
                value={barcodeQuery}
                onChange={(e) => setBarcodeQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </form>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search products or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Quick Bundles Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRESET_BUNDLES.map(b => (
              <div
                key={b.id}
                onClick={() => addBundle(b)}
                className="p-3.5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 rounded-xl cursor-pointer hover:border-blue-400 transition space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-blue-600" />
                    {b.name}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded">
                    Save {formatMoney(b.discountPaise)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{b.description}</p>
              </div>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SAMPLE_PRODUCTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())).map(product => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className="p-3 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between h-36"
              >
                <div>
                  <span className="text-[10px] text-slate-400 block truncate">{product.category}</span>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 mt-0.5">
                    {product.name}
                  </h3>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-blue-600 dark:text-blue-400">
                    {formatMoney(product.pricePaise)}
                  </span>
                  <button className="p-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-600 hover:text-white transition">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: POS Shopping Cart & Tender */}
        <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-blue-600" />
              Counter Cart ({cart.reduce((sum, i) => sum + i.qty, 0)})
            </h2>
            {cart.length > 0 && (
              <button 
                onClick={() => setCart([])}
                className="text-xs text-red-500 hover:underline"
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Cart empty. Scan barcode or tap products on the left.
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex items-center justify-between gap-2 text-xs">
                  <div className="truncate flex-1">
                    <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{formatMoney(item.pricePaise)} each</div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                    >
                      <Minus className="w-3 h-3 text-slate-600" />
                    </button>
                    <span className="w-5 text-center font-bold font-mono">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                    >
                      <Plus className="w-3 h-3 text-slate-600" />
                    </button>
                  </div>

                  <div className="w-16 text-right font-bold font-mono text-slate-900 dark:text-white">
                    {formatMoney(item.pricePaise * item.qty)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Payment Mode Selector */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {['UPI', 'CASH', 'SPLIT'].map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                    paymentMode === mode
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Running Totals */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs space-y-1.5">
            <div className="flex justify-between text-slate-500">
              <span>Taxable Subtotal:</span>
              <span className="font-mono">{formatMoney(netSubtotalPaise)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>GST (CGST + SGST):</span>
              <span className="font-mono">{formatMoney(totalTaxPaise)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
              <span>Grand Total:</span>
              <span className="text-blue-600 font-mono">{formatMoney(grossTotalPaise)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCompleteSale}
            className="w-full py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Complete Sale &amp; Print 80mm Slip
          </button>
        </div>
      </div>

      {/* 80mm Thermal Slip Modal */}
      {showReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl text-slate-900 font-mono text-xs space-y-3">
            <div className="flex justify-between items-start pb-2 border-b border-dashed border-slate-400">
              <div>
                <h3 className="font-bold text-sm uppercase">AKASH Bajaj Counter</h3>
                <p className="text-[10px]">Bangalore Central • GST: 29AABCB1829M1ZK</p>
              </div>
              <button onClick={() => setShowReceipt(false)} className="text-slate-400 hover:text-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-[11px] space-y-0.5">
              <p>Receipt No: <strong>CS/2627/00491</strong></p>
              <p>Date: {new Date().toLocaleString('en-IN')}</p>
              <p>Payment: {paymentMode}</p>
            </div>

            <div className="border-t border-b border-dashed border-slate-400 py-2 space-y-1">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between text-[11px]">
                  <span>{item.name.slice(0, 20)} x{item.qty}</span>
                  <span>{formatMoney(item.pricePaise * item.qty)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-0.5 text-right font-bold">
              <p>Total: {formatMoney(grossTotalPaise)}</p>
              <p className="text-[10px] text-slate-500 font-normal">Inclusive of ₹{Math.round(totalTaxPaise / 100)} GST</p>
            </div>

            <div className="pt-2 text-center text-[10px] text-slate-500">
              <p>Thank you for riding with us!</p>
              <p>Genuine parts guarantee 6 months.</p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  window.print();
                  toast.success('Printing 80mm slip...');
                }}
                className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg text-xs"
              >
                Print Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccessoriesCounterPage;
