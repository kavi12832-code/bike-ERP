import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../../store';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { formatMoney } from '../../../lib/format';
import {
  Wrench,
  Search,
  AlertTriangle,
  Barcode,
  TrendingDown,
  ArrowDownUp,
  PackagePlus,
  RotateCcw,
  Plus,
  Edit3,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

export function SparePartsPage() {
  const partsStock = useAppStore((state) => state.partsStock || []);
  const addPartStock = useAppStore((state) => state.addPartStock);
  const updatePartStock = useAppStore((state) => state.updatePartStock);
  const deletePartStock = useAppStore((state) => state.deletePartStock);
  const currentUser = useAppStore((state) => state.currentUser);

  const [searchTerm, setSearchTerm] = useState('');
  const [velocityFilter, setVelocityFilter] = useState('ALL'); // 'ALL', 'FAST', 'SLOW', 'DEAD', 'LOW_STOCK'
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [partModalOpen, setPartModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null);
  const [adjustQty, setAdjustQty] = useState(1);
  const [adjustReason, setAdjustReason] = useState('Physical Audit Count Variance');

  const [partForm, setPartForm] = useState({
    partNumber: 'BAJ-OIL-4T-20W50',
    name: 'Bajaj DTS-i 10,000 4T Engine Oil (1.15L)',
    brand: 'Bajaj Genuine Parts',
    category: 'Consumables & Lubricants',
    hsnCode: '8714',
    mrpRupees: 580,
    unitPriceRupees: 420,
    stockQty: 25,
    reorderLevel: 8,
    rackBin: 'R1-B04',
    movementVelocity: 'FAST',
  });

  const filteredParts = useMemo(() => {
    return partsStock.filter((part) => {
      const qty = part.stockQty ?? part.currentStock ?? 0;
      const reorder = part.reorderLevel ?? 5;
      if (velocityFilter === 'FAST' && part.movementVelocity !== 'FAST') return false;
      if (velocityFilter === 'SLOW' && part.movementVelocity !== 'SLOW') return false;
      if (velocityFilter === 'DEAD' && part.movementVelocity !== 'DEAD') return false;
      if (velocityFilter === 'LOW_STOCK' && qty >= reorder) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          (part.name || '').toLowerCase().includes(q) ||
          (part.partNumber || '').toLowerCase().includes(q) ||
          (part.brand || '').toLowerCase().includes(q) ||
          (part.rackBin || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [partsStock, velocityFilter, searchTerm]);

  const handleOpenAddPart = () => {
    setEditingPart(null);
    setPartForm({
      partNumber: `BAJ-${Math.floor(1000 + Math.random() * 9000)}-EXP`,
      name: '',
      brand: 'Bajaj Genuine Parts',
      category: 'Engine Components',
      hsnCode: '8714',
      mrpRupees: 650,
      unitPriceRupees: 480,
      stockQty: 15,
      reorderLevel: 5,
      rackBin: 'R2-B12',
      movementVelocity: 'FAST',
    });
    setPartModalOpen(true);
  };

  const handleOpenEditPart = (part) => {
    setEditingPart(part);
    const mrp = part.unitPricePaise ? Math.round(part.unitPricePaise / 100) : (part.mrp || 0);
    setPartForm({
      partNumber: part.partNumber || '',
      name: part.name || '',
      brand: part.brand || 'Bajaj Genuine Parts',
      category: part.category || 'Spare Parts',
      hsnCode: part.hsnCode || '8714',
      mrpRupees: mrp,
      unitPriceRupees: part.purchaseCostRupees || Math.round(mrp * 0.75),
      stockQty: part.stockQty ?? part.currentStock ?? 0,
      reorderLevel: part.reorderLevel || 5,
      rackBin: part.rackBin || 'R1-B01',
      movementVelocity: part.movementVelocity || 'FAST',
    });
    setPartModalOpen(true);
  };

  const handleSavePart = () => {
    if (!partForm.partNumber.trim() || !partForm.name.trim()) {
      toast.error('Part Number and Part Name are mandatory');
      return;
    }

    if (editingPart) {
      if (updatePartStock) {
        updatePartStock(editingPart.id, {
          partNumber: partForm.partNumber,
          name: partForm.name,
          brand: partForm.brand,
          category: partForm.category,
          hsnCode: partForm.hsnCode,
          unitPricePaise: partForm.mrpRupees * 100,
          currentStock: Number(partForm.stockQty),
          stockQty: Number(partForm.stockQty),
          reorderLevel: Number(partForm.reorderLevel),
          rackBin: partForm.rackBin,
          movementVelocity: partForm.movementVelocity,
        });
      }
      toast.success(`Part ${partForm.name} updated successfully.`);
    } else {
      if (addPartStock) {
        addPartStock({
          partNumber: partForm.partNumber,
          name: partForm.name,
          brand: partForm.brand,
          category: partForm.category,
          hsnCode: partForm.hsnCode,
          unitPricePaise: partForm.mrpRupees * 100,
          currentStock: Number(partForm.stockQty),
          stockQty: Number(partForm.stockQty),
          reorderLevel: Number(partForm.reorderLevel),
          rackBin: partForm.rackBin,
          movementVelocity: partForm.movementVelocity,
        });
      }
      toast.success(`New Spare Part (${partForm.partNumber}) enrolled into warehouse.`);
    }
    setPartModalOpen(false);
  };

  const handleDeletePart = (part) => {
    if (window.confirm(`Delete part SKU "${part.name}" from inventory?`)) {
      if (deletePartStock) {
        deletePartStock(part.id);
      }
      toast.success(`Part SKU ${part.partNumber} removed.`);
    }
  };

  const handleExecuteAdjustment = () => {
    if (!selectedPart) return;
    const current = selectedPart.stockQty ?? selectedPart.currentStock ?? 0;
    const newQty = current + Number(adjustQty);
    if (updatePartStock) {
      updatePartStock(selectedPart.id, {
        stockQty: newQty,
        currentStock: newQty,
      });
    }
    setAdjustModalOpen(false);
    toast.success(`Inventory adjustment saved for ${selectedPart.name}. New Qty: ${newQty}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main flex items-center gap-2">
            <Wrench className="w-6 h-6 text-primary" />
            Spare Parts &amp; Genuine OEM Inventory
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Rack &amp; bin locator, fast/slow/dead analysis, and strict low-stock reorder triggers
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={handleOpenAddPart}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Add Spare Part
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase font-semibold">Catalogue Line Items</div>
          <div className="text-2xl font-bold text-text-main mt-1 tabular-nums">{partsStock.length} SKUs</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase font-semibold">Low Stock (Below Reorder)</div>
          <div className="text-2xl font-bold text-status-red mt-1 tabular-nums">
            {partsStock.filter((p) => (p.stockQty ?? p.currentStock ?? 0) < (p.reorderLevel || 5)).length} Items
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase font-semibold">Fast Moving Velocity</div>
          <div className="text-2xl font-bold text-status-green mt-1 tabular-nums">
            {partsStock.filter((p) => p.movementVelocity === 'FAST').length} SKUs
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase font-semibold">Dead Stock Items</div>
          <div className="text-2xl font-bold text-text-muted mt-1 tabular-nums">
            {partsStock.filter((p) => p.movementVelocity === 'DEAD').length} SKUs
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-3 rounded-card border border-border shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search parts by name, OEM part number, rack/bin or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-input border border-border bg-surface-subtle text-text-main focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex bg-surface-subtle border border-border rounded-button p-0.5 text-xs">
          {[
            { id: 'ALL', label: 'All Spares' },
            { id: 'LOW_STOCK', label: 'Low Stock Alerts' },
            { id: 'FAST', label: 'Fast Movers' },
            { id: 'SLOW', label: 'Slow Movers' },
            { id: 'DEAD', label: 'Dead Stock' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setVelocityFilter(tab.id)}
              className={`px-3 py-1 font-medium rounded transition-all ${
                velocityFilter === tab.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Parts Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface-subtle border-b border-border text-text-muted uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Part Number</th>
                <th className="p-3.5">Part Description</th>
                <th className="p-3.5">Category &amp; Brand</th>
                <th className="p-3.5">Rack &amp; Bin</th>
                <th className="p-3.5">Unit Price (MRP)</th>
                <th className="p-3.5">Current Stock</th>
                <th className="p-3.5">Reorder Level</th>
                <th className="p-3.5">Velocity</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredParts.map((part) => {
                const qty = part.stockQty ?? part.currentStock ?? 0;
                const reorder = part.reorderLevel || 5;
                const isLow = qty < reorder;
                return (
                  <tr key={part.id} className="hover:bg-surface-subtle/50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-text-main">
                      {part.partNumber}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-text-main">{part.name}</div>
                      <div className="text-[10px] text-text-muted">HSN: {part.hsnCode || '8714'}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="text-text-main">{part.category}</div>
                      <div className="text-[10px] text-text-muted">{part.brand}</div>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-primary">{part.rackBin}</td>
                    <td className="p-3.5 tabular-nums font-bold text-text-main">
                      {formatMoney(part.unitPricePaise || (part.mrp * 100) || 0)}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold tabular-nums text-sm ${isLow ? 'text-status-red' : 'text-text-main'}`}>
                          {qty}
                        </span>
                        {isLow && (
                          <span className="text-[10px] font-bold text-status-red bg-red-50 dark:bg-red-950/40 px-1.5 py-0.5 rounded">
                            LOW
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 tabular-nums text-text-muted font-medium">
                      {reorder} units
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          part.movementVelocity === 'FAST'
                            ? 'bg-green-50 text-status-green border border-green-200'
                            : part.movementVelocity === 'SLOW'
                            ? 'bg-amber-50 text-status-amber border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {part.movementVelocity}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={Barcode}
                          onClick={() => {
                            setSelectedPart(part);
                            setBarcodeModalOpen(true);
                          }}
                          title="Print Barcode Tag"
                        >
                          Tag
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={ArrowDownUp}
                          onClick={() => {
                            setSelectedPart(part);
                            setAdjustModalOpen(true);
                          }}
                          title="Stock Count Adjustment"
                        >
                          Adjust
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={Edit3}
                          onClick={() => handleOpenEditPart(part)}
                          title="Edit Part Details"
                          className="text-slate-600 hover:text-blue-600"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={Trash2}
                          onClick={() => handleDeletePart(part)}
                          title="Delete SKU"
                          className="text-slate-400 hover:text-red-600"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD / EDIT PART MODAL */}
      <Modal
        isOpen={partModalOpen}
        onClose={() => setPartModalOpen(false)}
        title={editingPart ? `Edit Spare Part — ${editingPart.partNumber}` : 'Add New Spare Part / Accessory SKU'}
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">OEM Part Number</label>
              <input
                type="text"
                value={partForm.partNumber}
                onChange={(e) => setPartForm({ ...partForm, partNumber: e.target.value.toUpperCase() })}
                placeholder="e.g. BAJ-PLUG-CHAMP-01"
                className="w-full p-2.5 font-mono uppercase font-bold rounded-input border border-border bg-surface text-text-main"
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">HSN Statutory Code</label>
              <input
                type="text"
                value={partForm.hsnCode}
                onChange={(e) => setPartForm({ ...partForm, hsnCode: e.target.value })}
                className="w-full p-2.5 font-mono rounded-input border border-border bg-surface text-text-main"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-text-main block mb-1">Part Name &amp; Description</label>
            <input
              type="text"
              value={partForm.name}
              onChange={(e) => setPartForm({ ...partForm, name: e.target.value })}
              placeholder="e.g. Front Disc Brake Pad Set (KTM / Pulsar 200)"
              className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Category</label>
              <select
                value={partForm.category}
                onChange={(e) => setPartForm({ ...partForm, category: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              >
                <option value="Consumables & Lubricants">Consumables &amp; Lubricants</option>
                <option value="Engine Components">Engine Components</option>
                <option value="Brakes & Suspension">Brakes &amp; Suspension</option>
                <option value="Electrical & Sensors">Electrical &amp; Sensors</option>
                <option value="Body Parts & Fairing">Body Parts &amp; Fairing</option>
                <option value="Accessories & Riding Gear">Accessories &amp; Riding Gear</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Brand / OEM</label>
              <input
                type="text"
                value={partForm.brand}
                onChange={(e) => setPartForm({ ...partForm, brand: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Selling MRP (₹)</label>
              <input
                type="number"
                value={partForm.mrpRupees}
                onChange={(e) => setPartForm({ ...partForm, mrpRupees: Number(e.target.value) })}
                className="w-full p-2.5 font-bold tabular-nums rounded-input border border-border bg-surface text-text-main"
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Initial Stock Qty</label>
              <input
                type="number"
                value={partForm.stockQty}
                onChange={(e) => setPartForm({ ...partForm, stockQty: Number(e.target.value) })}
                className="w-full p-2.5 tabular-nums rounded-input border border-border bg-surface text-text-main"
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Reorder Level</label>
              <input
                type="number"
                value={partForm.reorderLevel}
                onChange={(e) => setPartForm({ ...partForm, reorderLevel: Number(e.target.value) })}
                className="w-full p-2.5 tabular-nums rounded-input border border-border bg-surface text-text-main"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Rack &amp; Bin Locator</label>
              <input
                type="text"
                value={partForm.rackBin}
                onChange={(e) => setPartForm({ ...partForm, rackBin: e.target.value.toUpperCase() })}
                placeholder="e.g. R3-B08"
                className="w-full p-2.5 font-mono uppercase font-bold rounded-input border border-border bg-surface text-text-main"
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Movement Velocity</label>
              <select
                value={partForm.movementVelocity}
                onChange={(e) => setPartForm({ ...partForm, movementVelocity: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              >
                <option value="FAST">FAST Moving</option>
                <option value="SLOW">SLOW Moving</option>
                <option value="DEAD">DEAD Stock</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setPartModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSavePart} className="bg-blue-600 text-white">
              {editingPart ? 'Save Changes' : 'Enroll Part SKU'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Barcode Label Modal */}
      <Modal
        isOpen={barcodeModalOpen}
        onClose={() => setBarcodeModalOpen(false)}
        title="Print Physical Bin & Barcode Label"
        size="sm"
      >
        {selectedPart && (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-white rounded-card border border-border shadow-xs inline-block">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                AKASH BAJAJ GENUINE SPARES
              </div>
              <div className="font-mono text-2xl font-bold tracking-widest text-slate-900 border-y-2 border-slate-900 py-1 my-2">
                *{selectedPart.partNumber}*
              </div>
              <div className="text-xs font-bold text-slate-800">{selectedPart.name}</div>
              <div className="text-sm font-bold text-slate-900 tabular-nums mt-1">
                MRP: {formatMoney(selectedPart.unitPricePaise || 0)} (Incl. Taxes)
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">
                BIN: {selectedPart.rackBin} | HSN: {selectedPart.hsnCode || '8714'}
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full bg-blue-600 text-white"
              onClick={() => {
                toast.success('Thermal label (50x25mm) queued for barcode printing.');
                setBarcodeModalOpen(false);
              }}
            >
              Print 50x25mm Bin Label
            </Button>
          </div>
        )}
      </Modal>

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        title="Manual Stock Physical Reconciliation"
        size="md"
      >
        {selectedPart && (
          <div className="space-y-4 text-xs">
            <p className="text-text-muted">
              Adjusting physical bin count for <strong className="text-text-main">{selectedPart.name}</strong> ({selectedPart.partNumber}). Current stock is {selectedPart.stockQty ?? selectedPart.currentStock ?? 0} units.
            </p>

            <div>
              <label className="font-semibold text-text-main block mb-1">Delta Adjustment (+ or -)</label>
              <input
                type="number"
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-bold tabular-nums"
              />
            </div>

            <div>
              <label className="font-semibold text-text-main block mb-1">Mandatory Audit Justification</label>
              <select
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              >
                <option value="Physical Audit Count Variance">Physical Audit Count Variance</option>
                <option value="Damaged in transit / Unpacking">Damaged in transit / Unpacking</option>
                <option value="Warranty Return to OEM">Warranty Return to OEM</option>
                <option value="Internal Workshop Consumption">Internal Workshop Consumption</option>
              </select>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-status-amber flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                Discrepancies exceeding ₹10,000 trigger approval workflow to Inventory Manager before general ledger posting.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button variant="secondary" onClick={() => setAdjustModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleExecuteAdjustment} className="bg-blue-600 text-white">
                Confirm Reconciliation
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
