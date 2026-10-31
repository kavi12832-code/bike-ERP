import React, { useState } from 'react';
import { useAppStore } from '../../../store';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { Drawer } from '../../../components/ui/Drawer';
import { formatMoney, formatDate } from '../../../lib/format';
import {
  Bike,
  CheckCircle,
  Clock,
  ShieldCheck,
  FileText,
  Printer,
  Camera,
  Signature,
  FileCheck,
  Award,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

const ORDER_STEPS = ['BOOKED', 'ALLOCATED', 'PDI', 'INVOICED', 'RTO', 'DELIVERED'];

export function SalesOrdersPage() {
  const state = useAppStore();
  const salesOrders = state.salesOrders || [];
  const pdiTemplates = state.catalogs?.pdiTemplate || [];
  const currentUser = state.currentUser;

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'PDI', 'INVOICED', 'DELIVERED'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [pdiModalOpen, setPdiModalOpen] = useState(false);
  const [handoverModalOpen, setHandoverModalOpen] = useState(false);
  const [gatePassOpen, setGatePassOpen] = useState(false);

  // PDI checklist state
  const [checkedPdiItems, setCheckedPdiItems] = useState({});

  // Handover state
  const [photoCaptured, setPhotoCaptured] = useState(false);
  const [customerSigned, setCustomerSigned] = useState(false);

  const filteredOrders = salesOrders.filter((so) => {
    if (activeTab === 'ALL') return true;
    return so.stage === activeTab;
  });

  const handleTogglePdiItem = (id) => {
    setCheckedPdiItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSavePdi = () => {
    const totalItems = pdiTemplates.length;
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main">Showroom Vehicle Sales & Delivery Orders</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Stage progression (Booked → Allocated → PDI → Invoiced → RTO → Delivered) with delivery gate passes
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase font-semibold">Active Sales Orders</div>
          <div className="text-2xl font-bold text-text-main mt-1 tabular-nums">{salesOrders.length} Orders</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase font-semibold">Pending PDI Inspections</div>
          <div className="text-2xl font-bold text-status-amber mt-1 tabular-nums">
            {salesOrders.filter((o) => !o.pdiCompleted && o.stage !== 'DELIVERED').length} Units
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase font-semibold">Ready for Handover</div>
          <div className="text-2xl font-bold text-status-blue mt-1 tabular-nums">
            {salesOrders.filter((o) => o.pdiCompleted && o.stage !== 'DELIVERED').length} Units
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase font-semibold">Delivered this Month</div>
          <div className="text-2xl font-bold text-status-green mt-1 tabular-nums">
            {salesOrders.filter((o) => o.stage === 'DELIVERED').length} Units
          </div>
        </Card>
      </div>

      {/* Main Orders Table */}
      <Card className="overflow-hidden">
        <CardHeader className="flex items-center justify-between">
          <div className="flex gap-2">
            {['ALL', 'ALLOCATED', 'PDI', 'DELIVERED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-button text-xs font-semibold transition-colors ${
                  activeTab === tab
                    ? 'bg-primary text-white'
                    : 'bg-surface-subtle text-text-muted hover:text-text-main'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-subtle border-b border-border text-text-muted font-semibold uppercase text-[11px]">
                <th className="p-3.5">Order #</th>
                <th className="p-3.5">Chassis Number (VIN)</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Vehicle Model</th>
                <th className="p-3.5">Financing Bank</th>
                <th className="p-3.5">On-Road Value</th>
                <th className="p-3.5">Current Stage</th>
                <th className="p-3.5 text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="hover:bg-surface-subtle/70 transition-colors cursor-pointer"
                >
                  <td className="p-3.5 font-mono font-bold text-primary">{order.orderNumber}</td>
                  <td className="p-3.5 font-mono font-semibold">{order.chassisNumber}</td>
                  <td className="p-3.5">
                    <div className="font-bold text-text-main">{order.customerName}</div>
                    <div className="text-[10px] text-text-muted">{order.phone}</div>
                  </td>
                  <td className="p-3.5 font-medium text-text-main">{order.modelName}</td>
                  <td className="p-3.5 text-text-muted">{order.financingBank}</td>
                  <td className="p-3.5 tabular-nums font-bold text-text-main">
                    {formatMoney(order.onRoadPricePaise)}
                  </td>
                  <td className="p-3.5">
                    <StatusBadge status={order.stage} />
                  </td>
                  <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      {!order.pdiCompleted && order.stage !== 'DELIVERED' ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={FileCheck}
                          onClick={() => {
                            setSelectedOrder(order);
                            setPdiModalOpen(true);
                          }}
                        >
                          Execute PDI
                        </Button>
                      ) : order.stage !== 'DELIVERED' ? (
                        <Button
                          size="sm"
                          variant="primary"
                          icon={Award}
                          onClick={() => {
                            setSelectedOrder(order);
                            setHandoverModalOpen(true);
                          }}
                        >
                          Delivery Handover
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={Printer}
                          onClick={() => {
                            setSelectedOrder(order);
                            setGatePassOpen(true);
                          }}
                        >
                          Gate Pass
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

      {/* Order Detail Drawer with Stepper */}
      <Drawer
        isOpen={Boolean(selectedOrder && !pdiModalOpen && !handoverModalOpen && !gatePassOpen)}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order Tracking: ${selectedOrder.orderNumber}` : ''}
        size="md"
      >
        {selectedOrder && (
          <div className="space-y-6 text-xs">
            {/* Visual Stepper */}
            <div className="p-4 rounded-card bg-surface-subtle border border-border">
              <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3">
                Lifecycle Progression
              </div>
              <div className="flex items-center justify-between relative">
                {ORDER_STEPS.map((step, idx) => {
                  const currentIdx = ORDER_STEPS.indexOf(selectedOrder.stage);
                  const isDone = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div key={step} className="flex flex-col items-center z-10">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] transition-colors ${
                          isDone
                            ? 'bg-primary text-white shadow-xs'
                            : 'bg-surface-muted text-text-muted border border-border'
                        }`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <span
                        className={`text-[9px] font-bold mt-1.5 uppercase ${
                          isCurrent ? 'text-primary' : 'text-text-muted'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-text-muted block">Customer Name</span>
                <span className="font-bold text-text-main text-sm">{selectedOrder.customerName}</span>
              </div>
              <div>
                <span className="text-text-muted block">Vehicle Model</span>
                <span className="font-bold text-text-main text-sm">{selectedOrder.modelName}</span>
              </div>
              <div>
                <span className="text-text-muted block">Assigned Chassis (VIN)</span>
                <span className="font-mono font-bold text-text-main text-sm">
                  {selectedOrder.chassisNumber}
                </span>
              </div>
              <div>
                <span className="text-text-muted block">Engine Serial</span>
                <span className="font-mono font-semibold text-text-muted">{selectedOrder.engineNumber}</span>
              </div>
              <div>
                <span className="text-text-muted block">Financing Mode</span>
                <span className="font-medium text-text-main">{selectedOrder.financingBank}</span>
              </div>
              <div>
                <span className="text-text-muted block">Delivery Schedule</span>
                <span className="font-medium text-text-main">
                  {formatDate(selectedOrder.deliverySchedule)}
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-border flex gap-2">
              {!selectedOrder.pdiCompleted && (
                <Button
                  variant="primary"
                  icon={FileCheck}
                  onClick={() => setPdiModalOpen(true)}
                >
                  Start Pre-Delivery Inspection
                </Button>
              )}
              {selectedOrder.pdiCompleted && selectedOrder.stage !== 'DELIVERED' && (
                <Button
                  variant="primary"
                  icon={Award}
                  onClick={() => setHandoverModalOpen(true)}
                >
                  Initiate Delivery Handover
                </Button>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* PDI Checklist Modal */}
      <Modal
        isOpen={pdiModalOpen}
        onClose={() => setPdiModalOpen(false)}
        title={selectedOrder ? `PDI Inspection: Chassis ${selectedOrder.chassisNumber}` : ''}
        size="lg"
      >
        <div className="space-y-4 text-xs">
          <p className="text-text-muted">
            All 10 physical and technical checkpoints must be validated before delivery authorization is granted:
          </p>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {pdiTemplates.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-3 p-3 rounded bg-surface-subtle border border-border cursor-pointer hover:bg-surface-muted"
              >
                <input
                  type="checkbox"
                  checked={Boolean(checkedPdiItems[item.id])}
                  onChange={() => handleTogglePdiItem(item.id)}
                  className="rounded text-primary focus:ring-primary w-4 h-4"
                />
                <div className="flex-1">
                  <div className="font-semibold text-text-main">{item.label}</div>
                  <div className="text-[10px] text-text-muted uppercase font-mono">{item.category}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setPdiModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSavePdi}>
              Certify PDI Complete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delivery Handover Modal (Photo, Accessories, Signature) */}
      <Modal
        isOpen={handoverModalOpen}
        onClose={() => setHandoverModalOpen(false)}
        title={selectedOrder ? `Vehicle Handover Ceremony: ${selectedOrder.customerName}` : ''}
        size="md"
      >
        <div className="space-y-5 text-xs">
          {/* Key Handover Photo */}
          <div className="p-4 rounded-card bg-surface-subtle border border-dashed border-border text-center">
            <Camera className="w-8 h-8 text-primary mx-auto mb-2" />
            <h4 className="font-bold text-text-main">Customer Key Handover Photo</h4>
            <p className="text-text-muted text-[11px] mt-0.5">Capture ceremony moment for customer portal vault</p>
            <div className="mt-3">
              <Button
                size="sm"
                variant={photoCaptured ? 'secondary' : 'primary'}
                onClick={() => {
                  setPhotoCaptured(true);
                  toast.success('Ceremony photo captured and encrypted into document vault');
                }}
              >
                {photoCaptured ? '✓ Handover Photo Captured' : 'Take Camera Photo'}
              </Button>
            </div>
          </div>

          {/* Customer Signature Pad Simulation */}
          <div className="p-4 rounded-card bg-surface-subtle border border-border">
            <h4 className="font-bold text-text-main mb-1.5 flex items-center gap-1.5">
              <Signature className="w-4 h-4 text-primary" />
              <span>Customer Delivery Acceptance Signature</span>
            </h4>
            <div className="h-20 bg-white dark:bg-slate-900 border border-border rounded flex items-center justify-center text-text-muted italic">
              {customerSigned ? (
                <span className="font-serif text-lg text-primary font-bold">
                  {selectedOrder?.customerName}
                </span>
              ) : (
                'Sign on tablet screen'
              )}
            </div>
            <div className="mt-2 text-right">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setCustomerSigned(true);
                  toast.success('Digital signature recorded');
                }}
              >
                {customerSigned ? 'Clear / Re-sign' : 'Sign Acceptance'}
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setHandoverModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleExecuteDelivery}>
              Complete Handover & Issue Gate Pass
            </Button>
          </div>
        </div>
      </Modal>

      {/* Official Security Gate Pass Modal */}
      <Modal
        isOpen={gatePassOpen}
        onClose={() => setGatePassOpen(false)}
        title={selectedOrder ? `Vehicle Gate Pass: ${selectedOrder.chassisNumber}` : ''}
        size="md"
      >
        {selectedOrder && (
          <div className="p-6 bg-white text-slate-900 border border-border rounded-card space-y-4 text-xs font-sans">
            <div className="text-center border-b pb-3">
              <h3 className="font-bold text-base text-navy-900">{state.dealership.name}</h3>
              <p className="text-[11px] text-slate-500">Security Gate Exit Authorization</p>
            </div>

            <div className="flex justify-between bg-slate-50 p-2.5 rounded font-mono">
              <div>
                <span className="text-[10px] text-slate-500 block">Gate Pass #:</span>
                <span className="font-bold text-primary">GP/2627/{selectedOrder.orderNumber.slice(-5)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">Date & Time:</span>
                <span className="font-bold">{formatDate(new Date())}</span>
              </div>
            </div>

            <div className="space-y-2 py-1">
              <div className="flex justify-between">
                <span className="text-slate-600">Customer Name:</span>
                <span className="font-bold">{selectedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Vehicle Model:</span>
                <span className="font-bold">{selectedOrder.modelName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Chassis / VIN:</span>
                <span className="font-mono font-bold text-slate-900">{selectedOrder.chassisNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Engine Number:</span>
                <span className="font-mono">{selectedOrder.engineNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tax Invoice Number:</span>
                <span className="font-mono text-primary font-bold">
                  {selectedOrder.invoiceNumber || 'VI/2627/00001'}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>PDI Cleared • Invoice Settled • Security Gate Exit Approved</span>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button variant="secondary" onClick={() => window.print()}>
                Print Gate Pass
              </Button>
              <Button variant="primary" onClick={() => setGatePassOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
