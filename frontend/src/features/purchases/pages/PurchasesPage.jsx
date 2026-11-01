import React, { useState } from 'react';
import { useAppStore } from '../../../store';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { formatMoney, formatDate } from '../../../lib/format';
import { PageHeader } from '../../../components/ui/PageHeader';
import { KpiCard } from '../../../components/ui/KpiCard';
import {
  ShoppingBag,
  PlusCircle,
  Truck,
  CheckCircle,
  AlertTriangle,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

export function PurchasesPage() {
  const [purchaseOrders, setPurchaseOrders] = useState([
    {
      id: 'po-2627-001',
      poNumber: 'PO/2627/00001',
      supplierName: 'Royal Enfield India Ltd (Oragadam Plant)',
      category: 'VEHICLES',
      orderDate: new Date(Date.now() - 5 * 86400000).toISOString(),
      expectedDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      itemCount: 12,
      totalAmountPaise: 1845000000, // ₹18,45,000 (18.45 Lakhs)
      status: 'IN_TRANSIT', // DRAFT, APPROVED, IN_TRANSIT, RECEIVED
      approvalRequired: false,
      grnNumber: 'GRN/2627/00041',
      varianceDetected: false,
    },
    {
      id: 'po-2627-002',
      poNumber: 'PO/2627/00002',
      supplierName: 'Brembo Brake Systems India Ltd',
      category: 'SPARE_PARTS',
      orderDate: new Date(Date.now() - 2 * 86400000).toISOString(),
      expectedDate: new Date(Date.now() + 4 * 86400000).toISOString(),
      itemCount: 80,
      totalAmountPaise: 44000000, // ₹4,40,000
      status: 'APPROVED',
      approvalRequired: false,
      grnNumber: null,
      varianceDetected: false,
    },
    {
      id: 'po-2627-003',
      poNumber: 'PO/2627/00003',
      supplierName: 'Motul India Lubricants Ltd',
      category: 'LUBRICANTS',
      orderDate: new Date(Date.now() - 10 * 86400000).toISOString(),
      expectedDate: new Date(Date.now() - 3 * 86400000).toISOString(),
      itemCount: 150,
      totalAmountPaise: 100500000, // ₹10,05,000
      status: 'RECEIVED',
      approvalRequired: true,
      grnNumber: 'GRN/2627/00039',
      varianceDetected: false,
    },
  ]);

  const [activePo, setActivePo] = useState(null);
  const [grnModalOpen, setGrnModalOpen] = useState(false);
  const [receivedQty, setReceivedQty] = useState(12);

  const handleConfirmGrn = () => {
    if (!activePo) return;
    activePo.status = 'RECEIVED';
    setGrnModalOpen(false);
    toast.success(`GRN Confirmed for ${activePo.poNumber}! Zero quantity or price variance.`);
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Operations', path: '/dashboard' },
          { label: 'Purchases & GRN', path: '/purchases' },
        ]}
        title="OEM Purchase Orders & Goods Receipt (GRN)"
        subtitle="Procurement tracking for factory consignments and genuine spare parts distributors."
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={PlusCircle}
            onClick={() => toast.info('New PO creation wizard initialized')}
            className="bg-primary hover:bg-primary-hover text-white"
          >
            Generate Purchase Order
          </Button>
        }
      />

      {/* 2. Plain KPI Cards per Section 0.5 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          label="Active POs Issued"
          value={`${purchaseOrders.length} Orders`}
          helperText="Factory & spares orders"
          icon={<ShoppingBag className="w-5 h-5 text-primary" />}
        />
        <KpiCard
          label="Consignments In-Transit"
          value={`${purchaseOrders.filter((p) => p.status === 'IN_TRANSIT').length} In-Transit`}
          helperText="Awaiting warehouse dock arrival"
          icon={<Truck className="w-5 h-5 text-blue-500" />}
        />
        <KpiCard
          label="Committed Value"
          value={formatMoney(purchaseOrders.reduce((sum, po) => sum + (po.totalAmountPaise || 0), 0))}
          helperText="Total purchase commitments"
          icon={<CheckCircle className="w-5 h-5 text-emerald-500" />}
        />
        <KpiCard
          label="GRN Variance Alerts"
          value="0 Discrepancy"
          helperText="100% 3-way match pass rate"
          icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
        />
      </div>

      {/* Purchase Orders Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-subtle border-b border-border text-text-muted font-semibold uppercase text-[11px]">
                <th className="p-3.5">PO Number</th>
                <th className="p-3.5">Supplier / Manufacturer</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Order Date</th>
                <th className="p-3.5">Est. Arrival</th>
                <th className="p-3.5">Total Value</th>
                <th className="p-3.5">GRN Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {purchaseOrders.map((po) => (
                <tr key={po.id} className="hover:bg-surface-subtle/70 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-primary">{po.poNumber}</td>
                  <td className="p-3.5 font-bold text-text-main">{po.supplierName}</td>
                  <td className="p-3.5">
                    <span className="font-semibold text-text-muted">{po.category}</span>
                  </td>
                  <td className="p-3.5 text-text-muted">{formatDate(po.orderDate)}</td>
                  <td className="p-3.5 text-text-main font-medium">{formatDate(po.expectedDate)}</td>
                  <td className="p-3.5 tabular-nums font-bold text-text-main">
                    {formatMoney(po.totalAmountPaise)}
                  </td>
                  <td className="p-3.5">
                    <StatusBadge status={po.status} />
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {po.status === 'IN_TRANSIT' ? (
                        <Button
                          size="sm"
                          variant="primary"
                          icon={CheckCircle}
                          onClick={() => {
                            setActivePo(po);
                            setGrnModalOpen(true);
                          }}
                        >
                          Verify & GRN
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" icon={FileText}>
                          Voucher
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

      {/* GRN Verification Modal */}
      <Modal
        isOpen={grnModalOpen}
        onClose={() => setGrnModalOpen(false)}
        title={activePo ? `Goods Receipt Note (GRN): ${activePo.poNumber}` : ''}
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-card bg-surface-subtle border border-border">
            <div className="font-bold text-text-main">{activePo?.supplierName}</div>
            <div className="text-[11px] text-text-muted mt-0.5">
              Consignment Bill of Lading: <strong>LR-8491024</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-text-muted block">Invoiced Quantity</label>
              <div className="font-bold text-sm text-text-main tabular-nums">
                {activePo?.itemCount} Units
              </div>
            </div>
            <div>
              <label className="text-text-muted block font-semibold mb-1">Physically Verified Qty</label>
              <input
                type="number"
                value={receivedQty}
                onChange={(e) => setReceivedQty(Number(e.target.value))}
                className="w-full p-2 rounded-input border border-border bg-surface text-text-main font-bold"
              />
            </div>
          </div>

          <div className="p-2.5 rounded bg-green-50 border border-green-200 text-status-green flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Quantity verified matches OEM delivery invoice exactly. Zero variance recorded.</span>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setGrnModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmGrn}>
              Authorize Inward GRN
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
