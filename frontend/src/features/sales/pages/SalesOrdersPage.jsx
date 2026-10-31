import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../../store';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Drawer } from '../../../components/ui/Drawer';
import { PageHeader } from '../../../components/ui/PageHeader';
import { KpiCard } from '../../../components/ui/KpiCard';
import { FilterBar } from '../../../components/ui/FilterBar';
import { StatusChip } from '../../../components/ui/StatusChip';
import { formatMoney, formatDate } from '../../../lib/format';
import {
  Bike,
  CheckCircle,
  Clock,
  ShieldCheck,
  FileText,
  Printer,
  Camera,
  FileCheck,
  Award,
  AlertCircle,
  ChevronRight,
  Truck,
  CheckCircle2,
  Layers,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

const ORDER_STEPS = ['BOOKED', 'ALLOCATED', 'PDI', 'INVOICED', 'RTO', 'DELIVERED'];

export function SalesOrdersPage() {
  const state = useAppStore();
  const salesOrders = state.salesOrders || [];
  const pdiTemplates = state.catalogs?.pdiTemplate || [];
  const currentUser = state.currentUser;

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'PDI', 'INVOICED', 'DELIVERED'
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [pdiModalOpen, setPdiModalOpen] = useState(false);
  const [handoverModalOpen, setHandoverModalOpen] = useState(false);
  const [gatePassOpen, setGatePassOpen] = useState(false);

  // PDI checklist state
  const [checkedPdiItems, setCheckedPdiItems] = useState({});

  // Handover state
  const [photoCaptured, setPhotoCaptured] = useState(false);
  const [customerSigned, setCustomerSigned] = useState(false);

  // Plain KPI derivations
  const kpis = useMemo(() => {
    const total = salesOrders.length;
    const pdiPending = salesOrders.filter((so) => so.stage === 'PDI' || so.stage === 'ALLOCATED').length;
    const invoiced = salesOrders.filter((so) => so.stage === 'INVOICED' || so.stage === 'RTO').length;
    const delivered = salesOrders.filter((so) => so.stage === 'DELIVERED').length;
    return { total, pdiPending, invoiced, delivered };
  }, [salesOrders]);

  const filteredOrders = useMemo(() => {
    return salesOrders.filter((so) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        so.customerName?.toLowerCase().includes(q) ||
        so.orderNumber?.toLowerCase().includes(q) ||
        so.chassisNumber?.toLowerCase().includes(q) ||
        so.vehicleModel?.toLowerCase().includes(q);
      const matchTab = activeTab === 'ALL' || so.stage === activeTab;
      return matchSearch && matchTab;
    });
  }, [salesOrders, search, activeTab]);

  const handleTogglePdiItem = (id) => {
    setCheckedPdiItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSavePdi = () => {
    const totalItems = pdiTemplates.length > 0 ? pdiTemplates.length : 10;
    const completedItems = Object.values(checkedPdiItems).filter(Boolean).length;

    if (completedItems < totalItems) {
      toast.error(`PDI Incomplete! Only ${completedItems}/${totalItems} checkpoints cleared.`);
      return;
    }

    if (selectedOrder) {
      selectedOrder.pdiCompleted = true;
      selectedOrder.stage = 'INVOICED';
      setPdiModalOpen(false);
      toast.success(`PDI 100% Cleared for Chassis ${selectedOrder.chassisNumber}! Ready for Invoicing & Delivery.`);
    }
  };

  const handleExecuteDelivery = () => {
    if (!photoCaptured || !customerSigned) {
      toast.error('Customer handover photo and gate pass signature required!');
      return;
    }

    if (selectedOrder) {
      selectedOrder.stage = 'DELIVERED';
      selectedOrder.status = 'DELIVERED';
      setHandoverModalOpen(false);
      setGatePassOpen(true);
      toast.success(`Vehicle successfully delivered to ${selectedOrder.customerName}! Free service schedule activated.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Operations', path: '/dashboard' },
          { label: 'Sales Orders', path: '/sales' },
        ]}
        title="Showroom Vehicle Sales & Delivery Orders"
        subtitle="End-to-end deal progression tracking (Booked → Allocated → PDI → Invoiced → RTO → Delivered) with statutory delivery gate passes."
      />

      {/* 2. Plain KPI Cards (Strictly no charts/arrows) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Layers}
          label="Total Sales Orders"
          value={kpis.total}
          subtitle="All confirmed showroom deals"
        />
        <KpiCard
          icon={Clock}
          label="Awaiting PDI"
          value={kpis.pdiPending}
          subtitle="Allocated chassis in yard"
        />
        <KpiCard
          icon={FileText}
          label="Invoiced & RTO"
          value={kpis.invoiced}
          subtitle="Tax invoiced, awaiting delivery"
        />
        <KpiCard
          icon={Truck}
          label="Delivered Vehicles"
          value={kpis.delivered}
          subtitle="Handed over with gate pass"
        />
      </div>

      {/* 3. Filter Bar */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search order number, customer name, chassis VIN..."
        filters={[
          {
            label: 'Order Stage',
            value: activeTab,
            onChange: setActiveTab,
            options: [
              { label: 'All Stages', value: 'ALL' },
              { label: 'Booked / Allocated', value: 'BOOKED' },
              { label: 'PDI Inspection', value: 'PDI' },
              { label: 'Invoiced & RTO', value: 'INVOICED' },
              { label: 'Delivered', value: 'DELIVERED' },
            ],
          },
        ]}
        onClear={() => {
          setSearch('');
          setActiveTab('ALL');
        }}
      />

      {/* 4. Orders List / Table */}
      <div className="bg-surface rounded-card border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-surface-subtle text-text-muted font-semibold uppercase text-[11px] border-b border-border">
              <tr>
                <th className="p-3.5">Order Number</th>
                <th className="p-3.5">Customer & Contact</th>
                <th className="p-3.5">Vehicle & Chassis</th>
                <th className="p-3.5">Current Stage</th>
                <th className="p-3.5">Deal Total</th>
                <th className="p-3.5">PDI Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-muted">
                    No sales orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-subtle/70 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-primary">
                      {order.orderNumber || order.id}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-text-main">{order.customerName}</div>
                      <div className="text-[10px] font-mono text-text-muted">{order.customerPhone}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-text-main">{order.vehicleModel}</div>
                      <div className="text-[10px] font-mono text-text-muted">
                        VIN: {order.chassisNumber || 'Pending Allocation'}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <StatusChip status={order.stage} />
                    </td>
                    <td className="p-3.5 font-semibold text-text-main tabular-nums">
                      {formatMoney(order.totalAmountPaise || 18500000)}
                    </td>
                    <td className="p-3.5">
                      {order.pdiCompleted ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-status-green font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>PDI Cleared</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-status-amber font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>PDI Pending</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      {!order.pdiCompleted && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setSelectedOrder(order);
                            setCheckedPdiItems({});
                            setPdiModalOpen(true);
                          }}
                          className="text-[11px] h-7 mr-1.5"
                        >
                          Execute PDI
                        </Button>
                      )}

                      {order.pdiCompleted && order.stage !== 'DELIVERED' && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            setSelectedOrder(order);
                            setPhotoCaptured(false);
                            setCustomerSigned(false);
                            setHandoverModalOpen(true);
                          }}
                          className="text-[11px] h-7 bg-primary text-white mr-1.5"
                        >
                          Customer Handover
                        </Button>
                      )}

                      {order.stage === 'DELIVERED' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedOrder(order);
                            setGatePassOpen(true);
                          }}
                          className="text-[11px] h-7"
                        >
                          <Printer className="w-3 h-3 mr-1" />
                          Gate Pass
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

      {/* 5. PDI Inspection Modal */}
      {selectedOrder && (
        <Modal
          isOpen={pdiModalOpen}
          onClose={() => setPdiModalOpen(false)}
          title={`Pre-Delivery Inspection (PDI): ${selectedOrder.vehicleModel}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-2.5 rounded bg-surface-subtle border border-border">
              <div className="text-[11px] font-mono text-text-muted">Chassis VIN: {selectedOrder.chassisNumber}</div>
              <div className="font-semibold text-text-main">Customer: {selectedOrder.customerName}</div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(pdiTemplates.length > 0
                ? pdiTemplates
                : [
                    { id: 'pdi-1', label: 'Engine oil level & radiator coolant verification' },
                    { id: 'pdi-2', label: 'Battery terminal voltage (>=12.8V) & electrical test' },
                    { id: 'pdi-3', label: 'Front & rear disc brake pads & fluid level' },
                    { id: 'pdi-4', label: 'Tyre cold pressure check (F: 29 PSI, R: 33 PSI)' },
                    { id: 'pdi-5', label: 'Paint finish, clear coat & tank decal inspection' },
                    { id: 'pdi-6', label: 'All turn indicators, horn & hazard flasher test' },
                    { id: 'pdi-7', label: 'Digital cluster self-check sequence & speedometer test' },
                    { id: 'pdi-8', label: 'Drive chain slackness (20-25mm) & lube application' },
                    { id: 'pdi-9', label: 'Side stand cut-off sensor functionality' },
                    { id: 'pdi-10', label: 'Tool kit, first aid pouch & 2 sets of factory keys placed' },
                  ]
              ).map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-2 p-2 rounded hover:bg-surface-subtle cursor-pointer border border-transparent hover:border-border"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(checkedPdiItems[item.id])}
                    onChange={() => handleTogglePdiItem(item.id)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-[11px] text-text-main">{item.label}</span>
                </label>
              ))}
            </div>

            <div className="pt-3 border-t border-border flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setPdiModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSavePdi} className="bg-primary text-white">
                Clear PDI Certification
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 6. Handover & Gate Pass Execution Modal */}
      {selectedOrder && (
        <Modal
          isOpen={handoverModalOpen}
          onClose={() => setHandoverModalOpen(false)}
          title={`Delivery Handover: ${selectedOrder.customerName}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-text-muted">
              Verify customer identity, perform key handover ceremony, and record digital gate pass authorization.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setPhotoCaptured(true);
                  toast.success('Customer delivery handover photo captured!');
                }}
                className={`p-3 rounded-lg border text-center transition-colors ${
                  photoCaptured
                    ? 'border-status-green bg-emerald-500/10 text-status-green'
                    : 'border-border bg-surface-subtle hover:bg-surface-muted text-text-main'
                }`}
              >
                <Camera className="w-5 h-5 mx-auto mb-1 text-primary" />
                <span className="font-semibold block text-xs">
                  {photoCaptured ? 'Photo Captured' : 'Capture Handover Photo'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCustomerSigned(true);
                  toast.success('Customer digital signature recorded on gate pass.');
                }}
                className={`p-3 rounded-lg border text-center transition-colors ${
                  customerSigned
                    ? 'border-status-green bg-emerald-500/10 text-status-green'
                    : 'border-border bg-surface-subtle hover:bg-surface-muted text-text-main'
                }`}
              >
                <FileCheck className="w-5 h-5 mx-auto mb-1 text-primary" />
                <span className="font-semibold block text-xs">
                  {customerSigned ? 'Signed & Acknowledged' : 'Record Signature'}
                </span>
              </button>
            </div>

            <div className="pt-3 border-t border-border flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setHandoverModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleExecuteDelivery} className="bg-primary text-white">
                Authorize Delivery & Gate Pass
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 7. Gate Pass Modal */}
      {selectedOrder && (
        <Modal
          isOpen={gatePassOpen}
          onClose={() => setGatePassOpen(false)}
          title={`Vehicle Delivery Gate Pass: ${selectedOrder.orderNumber || selectedOrder.id}`}
          size="md"
        >
          <div className="p-4 rounded-lg bg-surface-subtle border border-border text-xs space-y-3 font-mono">
            <div className="text-center pb-2 border-b border-border">
              <h4 className="font-bold text-sm text-text-main">AKASH BAJAJ DEALERSHIP</h4>
              <p className="text-[10px] text-text-muted">Bangalore Central Flagship • Official Gate Pass</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div><strong>Customer:</strong> {selectedOrder.customerName}</div>
              <div><strong>Date:</strong> {formatDate(new Date())}</div>
              <div><strong>Vehicle:</strong> {selectedOrder.vehicleModel}</div>
              <div><strong>Chassis VIN:</strong> {selectedOrder.chassisNumber}</div>
              <div><strong>Security Status:</strong> CLEARED</div>
              <div><strong>Authorized By:</strong> {currentUser?.name || 'Store Manager'}</div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end gap-2 font-sans">
              <Button
                variant="primary"
                onClick={() => {
                  window.print();
                  toast.success('Gate pass sent to thermal printer');
                }}
                className="bg-primary text-white"
              >
                <Printer className="w-3.5 h-3.5 mr-1" />
                Print Official Pass
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default SalesOrdersPage;
