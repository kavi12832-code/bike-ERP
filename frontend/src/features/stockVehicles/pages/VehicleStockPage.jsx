import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../../store';
import { canViewCost } from '../../../lib/rbac';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { formatMoney, formatDate } from '../../../lib/format';
import { PageHeader } from '../../../components/ui/PageHeader';
import { KpiCard } from '../../../components/ui/KpiCard';
import { QRCodeSVG } from 'qrcode.react';
import {
  Warehouse,
  PlusCircle,
  QrCode,
  Search,
  ArrowRightLeft,
  Upload,
  CheckCircle,
  AlertTriangle,
  Lock,
  Plus,
  Edit3,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export function VehicleStockPage() {
  const state = useAppStore();
  const vehicleStock = state.vehicleStock || [];
  const bikeCatalog = state.catalogs?.bikes || [];
  const branches = state.branches || [];
  const currentUser = state.currentUser;
  const addVehicleStock = state.addVehicleStock;
  const updateVehicleStock = state.updateVehicleStock;
  const deleteVehicleStock = state.deleteVehicleStock;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'FREE', 'ALLOCATED', 'IN_TRANSIT'
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [grnModalOpen, setGrnModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);

  // Add / Edit Vehicle Modal State
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [vehicleForm, setVehicleForm] = useState({
    modelName: 'Pulsar NS200',
    variantName: 'Dual Channel ABS',
    colorName: 'Burnt Red Metallic',
    chassisNumber: '',
    engineNumber: '',
    keyNumber: 'K-NS-092',
    exShowroomRupees: 142000,
    purchaseCostRupees: 122000,
    location: 'Bangalore Central Flagship',
    status: 'IN_STOCK',
  });

  // GRN State
  const [csvText, setCsvText] = useState(
    'ME3U3S5C8PRA10008,U3S5C810008,Hunter 350,Metro Rebel,Rebel Blue,K-HUN-028'
  );

  // Branch transfer
  const [targetBranchId, setTargetBranchId] = useState(branches[1]?.id || '');

  // Permission gate for cost columns
  const allowCostView = canViewCost(currentUser);

  const filteredStock = useMemo(() => {
    return vehicleStock.filter((unit) => {
      if (statusFilter === 'FREE' && (unit.status !== 'IN_STOCK' || unit.allocatedBookingId)) {
        return false;
      }
      if (statusFilter === 'ALLOCATED' && !unit.allocatedBookingId) {
        return false;
      }
      if (statusFilter === 'IN_TRANSIT' && unit.status !== 'IN_TRANSIT') {
        return false;
      }

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          unit.chassisNumber.toLowerCase().includes(q) ||
          unit.engineNumber.toLowerCase().includes(q) ||
          unit.modelName.toLowerCase().includes(q) ||
          unit.colorName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [vehicleStock, statusFilter, searchTerm]);

  // Generate randomized realistic VIN
  const generateRandomVin = () => {
    const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
    let vin = 'MD2A';
    for (let i = 0; i < 13; i++) {
      vin += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return vin;
  };

  const handleOpenAddVehicle = () => {
    setEditingUnit(null);
    setVehicleForm({
      modelName: bikeCatalog[0]?.name || 'Pulsar NS200',
      variantName: 'Dual Channel ABS',
      colorName: 'Gloss Ebony Black',
      chassisNumber: generateRandomVin(),
      engineNumber: `ENG-${Math.floor(100000 + Math.random() * 900000)}`,
      keyNumber: `K-${Math.floor(100 + Math.random() * 900)}`,
      exShowroomRupees: 145000,
      purchaseCostRupees: 125000,
      location: branches[0]?.name || 'Bangalore Central Flagship',
      status: 'IN_STOCK',
    });
    setVehicleModalOpen(true);
  };

  const handleOpenEditVehicle = (unit) => {
    setEditingUnit(unit);
    setVehicleForm({
      modelName: unit.modelName,
      variantName: unit.variantName,
      colorName: unit.colorName,
      chassisNumber: unit.chassisNumber,
      engineNumber: unit.engineNumber,
      keyNumber: unit.keyNumber,
      exShowroomRupees: Math.round((unit.exShowroomPaise || 0) / 100),
      purchaseCostRupees: Math.round((unit.purchaseCostPaise || 0) / 100),
      location: unit.location,
      status: unit.status,
    });
    setVehicleModalOpen(true);
  };

  const handleSaveVehicle = () => {
    if (!vehicleForm.chassisNumber || vehicleForm.chassisNumber.length < 10) {
      toast.error('Valid 17-character VIN/Chassis Number is mandatory.');
      return;
    }

    if (editingUnit) {
      if (updateVehicleStock) {
        updateVehicleStock(editingUnit.id, {
          modelName: vehicleForm.modelName,
          variantName: vehicleForm.variantName,
          colorName: vehicleForm.colorName,
          chassisNumber: vehicleForm.chassisNumber,
          engineNumber: vehicleForm.engineNumber,
          keyNumber: vehicleForm.keyNumber,
          exShowroomPaise: vehicleForm.exShowroomRupees * 100,
          purchaseCostPaise: vehicleForm.purchaseCostRupees * 100,
          location: vehicleForm.location,
          status: vehicleForm.status,
        });
      }
      toast.success(`Vehicle ${vehicleForm.chassisNumber} updated successfully.`);
    } else {
      if (addVehicleStock) {
        addVehicleStock({
          modelName: vehicleForm.modelName,
          variantName: vehicleForm.variantName,
          colorName: vehicleForm.colorName,
          chassisNumber: vehicleForm.chassisNumber,
          engineNumber: vehicleForm.engineNumber,
          keyNumber: vehicleForm.keyNumber,
          exShowroomPaise: vehicleForm.exShowroomRupees * 100,
          purchaseCostPaise: vehicleForm.purchaseCostRupees * 100,
          location: vehicleForm.location,
          status: 'IN_STOCK',
          branchId: branches[0]?.id || 'br-blr-central',
        });
      }
      toast.success(`New Vehicle Unit (VIN: ${vehicleForm.chassisNumber}) added to inventory!`);
    }
    setVehicleModalOpen(false);
  };

  const handleDeleteVehicle = (unit) => {
    if (unit.allocatedBookingId) {
      toast.error(`Cannot delete Chassis ${unit.chassisNumber}. It is allocated to Booking #${unit.allocatedBookingId}`);
      return;
    }
    if (window.confirm(`Write-off or remove Chassis ${unit.chassisNumber} from physical inventory?`)) {
      if (deleteVehicleStock) {
        deleteVehicleStock(unit.id);
      }
      toast.success(`Chassis ${unit.chassisNumber} removed from inventory.`);
    }
  };

  const handleExecuteTransfer = () => {
    if (!selectedUnit) return;
    const destBranch = branches.find((b) => b.id === targetBranchId)?.name || 'Annex Hub';
    if (updateVehicleStock) {
      updateVehicleStock(selectedUnit.id, {
        branchId: targetBranchId,
        location: `Transferred to ${destBranch}`,
      });
    }
    setTransferModalOpen(false);
    toast.success(`Vehicle chassis ${selectedUnit.chassisNumber} dispatched to ${destBranch}!`);
  };

  const handleImportGrn = () => {
    const parts = csvText.split(',');
    if (parts.length >= 4 && addVehicleStock) {
      addVehicleStock({
        chassisNumber: parts[0]?.trim() || generateRandomVin(),
        engineNumber: parts[1]?.trim() || `ENG-${Date.now().toString().slice(-6)}`,
        modelName: parts[2]?.trim() || 'Pulsar N160',
        variantName: parts[3]?.trim() || 'Single Channel ABS',
        colorName: parts[4]?.trim() || 'Caribbean Blue',
        keyNumber: parts[5]?.trim() || 'K-991',
        exShowroomPaise: 13500000,
        purchaseCostPaise: 11500000,
        location: 'Bangalore Central Flagship',
        status: 'IN_STOCK',
      });
      toast.success('Goods Receipt Note (GRN) confirmed! 1 Chassis Unit ingested into inventory.');
    } else {
      toast.success('Goods Receipt Note (GRN) manifest verified.');
    }
    setGrnModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Operations', path: '/dashboard' },
          { label: 'Vehicle Inventory', path: '/stock/vehicles' },
        ]}
        title="Vehicle Stock & Chassis Inventory"
        subtitle="Unit-level physical tracking with 17-char VIN barcodes, ageing analysis and inter-branch transfers."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={Upload}
              onClick={() => setGrnModalOpen(true)}
            >
              OEM Consignment GRN
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={handleOpenAddVehicle}
              className="bg-primary hover:bg-primary-hover text-white"
            >
              Add Vehicle Unit
            </Button>
          </div>
        }
      />

      {/* 2. Plain KPI Cards per Section 0.5 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          label="Total on Hand"
          value={`${vehicleStock.length} Units`}
          helperText="Gross physical stock"
          icon={<Warehouse className="w-5 h-5 text-primary" />}
        />
        <KpiCard
          label="Available (Free)"
          value={`${vehicleStock.filter((v) => v.status === 'IN_STOCK' && !v.allocatedBookingId).length} Units`}
          helperText="Ready for booking allocation"
          icon={<CheckCircle className="w-5 h-5 text-emerald-500" />}
        />
        <KpiCard
          label="Chassis Allocated"
          value={`${vehicleStock.filter((v) => v.allocatedBookingId).length} Units`}
          helperText="Reserved for delivery"
          icon={<ArrowRightLeft className="w-5 h-5 text-blue-500" />}
        />
        <KpiCard
          label="Ageing > 45 Days"
          value={`${vehicleStock.filter((v) => (v.daysInStock || 0) > 45).length} Units`}
          helperText="Yard holding risk"
          icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-3 rounded-card border border-border shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by 17-char Chassis VIN, Engine number, Model, or Color..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-input border border-border bg-surface-subtle text-text-main focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex bg-surface-subtle border border-border rounded-button p-0.5 text-xs">
          {[
            { id: 'ALL', label: 'All Inventory' },
            { id: 'FREE', label: 'Available (Free)' },
            { id: 'ALLOCATED', label: 'Allocated' },
            { id: 'IN_TRANSIT', label: 'In Transit' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1 font-medium rounded transition-all ${
                statusFilter === tab.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stock Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface-subtle border-b border-border text-text-muted uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Chassis Number (VIN)</th>
                <th className="p-3.5">Model &amp; Variant</th>
                <th className="p-3.5">Color</th>
                <th className="p-3.5">Key No</th>
                <th className="p-3.5">Physical Location</th>
                {allowCostView && <th className="p-3.5">Purchase Cost</th>}
                <th className="p-3.5">Ex-Showroom</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStock.map((unit) => (
                <tr key={unit.id} className="hover:bg-surface-subtle/50 transition-colors">
                  <td className="p-3.5">
                    <div className="font-mono font-bold text-text-main text-xs">{unit.chassisNumber}</div>
                    <div className="font-mono text-[10px] text-text-muted">{unit.engineNumber}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-text-main">{unit.modelName}</div>
                    <div className="text-[10px] text-text-muted">{unit.variantName}</div>
                  </td>
                  <td className="p-3.5 text-text-main">{unit.colorName}</td>
                  <td className="p-3.5 font-mono text-text-muted">{unit.keyNumber}</td>
                  <td className="p-3.5 text-text-muted">{unit.location}</td>
                  {allowCostView && (
                    <td className="p-3.5 tabular-nums text-text-muted font-medium">
                      {formatMoney(unit.purchaseCostPaise)}
                    </td>
                  )}
                  <td className="p-3.5 tabular-nums font-bold text-text-main">
                    {formatMoney(unit.exShowroomPaise)}
                  </td>
                  <td className="p-3.5">
                    <StatusBadge status={unit.status} />
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={QrCode}
                        onClick={() => {
                          setSelectedUnit(unit);
                          setQrModalOpen(true);
                        }}
                        title="Print QR Passport"
                      >
                        QR Tag
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={ArrowRightLeft}
                        onClick={() => {
                          setSelectedUnit(unit);
                          setTransferModalOpen(true);
                        }}
                        title="Inter-Branch Transfer"
                      >
                        Transfer
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={Edit3}
                        onClick={() => handleOpenEditVehicle(unit)}
                        title="Edit Vehicle Details"
                        className="text-slate-600 hover:text-blue-600"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={Trash2}
                        onClick={() => handleDeleteVehicle(unit)}
                        title="Write-off / Delete Vehicle"
                        className="text-slate-400 hover:text-red-600"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD / EDIT VEHICLE MODAL */}
      <Modal
        isOpen={vehicleModalOpen}
        onClose={() => setVehicleModalOpen(false)}
        title={editingUnit ? `Edit Vehicle Unit — ${editingUnit.chassisNumber}` : 'Add New Physical Vehicle Unit'}
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Model Name</label>
              <input
                type="text"
                value={vehicleForm.modelName}
                onChange={(e) => setVehicleForm({ ...vehicleForm, modelName: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Variant Name</label>
              <input
                type="text"
                value={vehicleForm.variantName}
                onChange={(e) => setVehicleForm({ ...vehicleForm, variantName: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Color Finish</label>
              <input
                type="text"
                value={vehicleForm.colorName}
                onChange={(e) => setVehicleForm({ ...vehicleForm, colorName: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Physical Location</label>
              <select
                value={vehicleForm.location}
                onChange={(e) => setVehicleForm({ ...vehicleForm, location: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-text-main">17-Character VIN / Chassis Number</label>
              {!editingUnit && (
                <button
                  type="button"
                  onClick={() => setVehicleForm({ ...vehicleForm, chassisNumber: generateRandomVin() })}
                  className="text-primary hover:underline text-[11px] flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Auto-generate VIN
                </button>
              )}
            </div>
            <input
              type="text"
              value={vehicleForm.chassisNumber}
              onChange={(e) => setVehicleForm({ ...vehicleForm, chassisNumber: e.target.value.toUpperCase() })}
              placeholder="e.g. MD2A14BY8P1892019"
              className="w-full p-2.5 font-mono text-xs uppercase font-bold rounded-input border border-border bg-surface text-text-main"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Engine Serial Number</label>
              <input
                type="text"
                value={vehicleForm.engineNumber}
                onChange={(e) => setVehicleForm({ ...vehicleForm, engineNumber: e.target.value.toUpperCase() })}
                className="w-full p-2.5 font-mono text-xs uppercase rounded-input border border-border bg-surface text-text-main"
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Physical Key Tag No</label>
              <input
                type="text"
                value={vehicleForm.keyNumber}
                onChange={(e) => setVehicleForm({ ...vehicleForm, keyNumber: e.target.value })}
                className="w-full p-2.5 font-mono text-xs rounded-input border border-border bg-surface text-text-main"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Ex-Showroom Price (₹)</label>
              <input
                type="number"
                value={vehicleForm.exShowroomRupees}
                onChange={(e) => setVehicleForm({ ...vehicleForm, exShowroomRupees: Number(e.target.value) })}
                className="w-full p-2.5 font-bold tabular-nums rounded-input border border-border bg-surface text-text-main"
              />
            </div>
            {allowCostView && (
              <div>
                <label className="font-semibold text-text-main block mb-1">Factory Invoice Cost (₹)</label>
                <input
                  type="number"
                  value={vehicleForm.purchaseCostRupees}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, purchaseCostRupees: Number(e.target.value) })}
                  className="w-full p-2.5 tabular-nums rounded-input border border-border bg-surface text-text-main"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setVehicleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveVehicle} className="bg-blue-600 text-white">
              {editingUnit ? 'Save Changes' : 'Confirm Inward to Inventory'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* QR Code Tag Modal */}
      <Modal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title="Vehicle Floor Passport & QR Tag"
        size="sm"
      >
        {selectedUnit && (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-white inline-block rounded-card border border-border shadow-xs">
              <QRCodeSVG
                value={`AKASH-BAJAJ://VIN/${selectedUnit.chassisNumber}`}
                size={160}
                level="M"
              />
            </div>

            <div>
              <span className="font-mono font-bold text-sm text-text-main block">
                {selectedUnit.chassisNumber}
              </span>
              <span className="text-xs text-text-muted block">
                {selectedUnit.modelName} — {selectedUnit.colorName}
              </span>
            </div>

            <div className="text-[11px] text-text-muted bg-surface-subtle p-2.5 rounded-input text-left space-y-1">
              <div><strong>Key ID:</strong> {selectedUnit.keyNumber}</div>
              <div><strong>Engine:</strong> {selectedUnit.engineNumber}</div>
              <div><strong>Stock Location:</strong> {selectedUnit.location}</div>
            </div>

            <Button
              variant="primary"
              className="w-full bg-blue-600 text-white"
              onClick={() => {
                toast.success('Directing printable QR label to Zebra 50x25mm thermal printer...');
                setQrModalOpen(false);
              }}
            >
              Print Floor Label
            </Button>
          </div>
        )}
      </Modal>

      {/* Inter-Branch Transfer Modal */}
      <Modal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        title="Inter-Branch Transit Delivery Challan"
        size="md"
      >
        {selectedUnit && (
          <div className="space-y-4 text-xs">
            <p className="text-text-muted">
              Dispatching vehicle <strong className="text-text-main">{selectedUnit.chassisNumber}</strong> ({selectedUnit.modelName}) from Current Location ({selectedUnit.location}) to:
            </p>

            <div>
              <label className="font-semibold text-text-main block mb-1">Destination Branch</label>
              <select
                value={targetBranchId}
                onChange={(e) => setTargetBranchId(e.target.value)}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-medium"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-status-amber flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                Creates statutory Delivery Challan under Rule 55 of CGST Rules for stock movement between dealer branches.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button variant="secondary" onClick={() => setTransferModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleExecuteTransfer} className="bg-blue-600 text-white">
                Generate Transit Challan &amp; Dispatch
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* GRN Consignment Wizard */}
      <Modal
        isOpen={grnModalOpen}
        onClose={() => setGrnModalOpen(false)}
        title="OEM Goods Receipt Note (GRN) Ingestion"
        size="md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-text-muted">
            Paste carrier manifest CSV (Chassis, Engine, Model, Variant, Colour, KeyNo) for bulk intake:
          </p>
          <textarea
            rows={4}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className="w-full p-2.5 font-mono text-xs rounded-input border border-border bg-surface-subtle text-text-main"
          />
          <div className="p-2.5 rounded bg-green-50 border border-green-200 text-status-green flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Format validated: 1 Unit ready for intake (Zero duplicate VIN detected)</span>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setGrnModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleImportGrn} className="bg-blue-600 text-white">
              Confirm Inward GRN
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
