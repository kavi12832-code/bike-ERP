import React, { useState } from 'react';
import { useAppStore } from '../../../store';
import { selectDashboardMetrics } from '../../../store/selectors/dashboard';
import { DashboardKpis } from '../components/DashboardKpis';
import { MiniBayBoard } from '../components/MiniBayBoard';
import { SalesTrendChart } from '../components/SalesTrendChart';
import { TopSellingBikes } from '../components/TopSellingBikes';
import { AiInsightsStrip } from '../components/AiInsightsStrip';
import { WhatsAppLivePhonePreview } from '../components/WhatsAppLivePhonePreview';
import { SystemActivityPanel } from '../components/SystemActivityPanel';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { formatMoney, formatDate } from '../../../lib/format';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Wrench,
  Calendar,
  AlertCircle,
  Warehouse,
  FileText,
  Clock,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

export function DashboardPage() {
  const navigate = useNavigate();
  const state = useAppStore();
  const metrics = selectDashboardMetrics(state);
  const currentUser = state.currentUser;
  const bookings = state.bookings || [];
  const invoices = state.invoices || [];
  const bays = state.bays || [];
  const partsStock = state.partsStock || [];
  const whatsappConversations = state.whatsappConversations || [];

  const [bayModalOpen, setBayModalOpen] = useState(false);
  const [selectedBay, setSelectedBay] = useState('');
  const [selectedJobCardId, setSelectedJobCardId] = useState('');

  // Only bays of the active branch that are free, and job cards still waiting for a bay.
  const freeBays = bays.filter(
    (b) => b.status === 'FREE' && (!b.branchId || b.branchId === state.activeBranchId)
  );
  const unassignedJobCards = (state.jobCards || []).filter((jc) => !jc.bayNumber && jc.stage !== 'DELIVERED');

  const openBayModal = () => {
    // Default to real options; the old hardcoded defaults (Bay #1, jc-2627-005) could point at an
    // occupied bay or a non-existent job card and silently overwrite the bay.
    setSelectedBay(freeBays[0]?.bayNumber ?? '');
    setSelectedJobCardId(unassignedJobCards[0]?.id ?? '');
    setBayModalOpen(true);
  };

  const handleQuickBayAssign = () => {
    if (!selectedBay || !selectedJobCardId) {
      toast.error('Select a free bay and a job card first.');
      return;
    }
    try {
      state.assignBayToJobCard(Number(selectedBay), selectedJobCardId);
      setBayModalOpen(false);
      toast.success(`Assigned Bay #${selectedBay} to Job Card successfully!`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Newest first; the raw list is in seed order, which starts with a 75-day-old invoice.
  const recentPostedInvoices = invoices
    .filter((inv) => inv.status === 'POSTED')
    .sort((a, b) => new Date(b.date || b.postedAt) - new Date(a.date || a.postedAt))
    .slice(0, 4);

  const todayFormatted = formatDate(new Date(), 'EEEE, dd MMMM yyyy');

  return (
    <div className="space-y-6">
      {/* Welcome Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-5 rounded-card border border-border shadow-soft">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" />
            <span>{todayFormatted}</span>
          </div>
          <h1 className="text-xl font-bold text-text-main mt-1">
            Welcome back, {currentUser?.name || 'Administrator'}!
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-xs text-text-muted">
              Operational Overview for <strong>{(state.branches || []).find((b) => b.id === state.activeBranchId)?.name || 'Bangalore Central Flagship'}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-subtle border border-border text-[11px] font-mono text-text-muted shadow-xs">
              <span className="font-sans font-medium text-text-subtle">GSTIN:</span>
              <strong className="text-text-main font-semibold">{(state.branches || []).find((b) => b.id === state.activeBranchId)?.gstin || state.dealership?.gstin || '29AABCB1829M1ZK'}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={Wrench}
            onClick={openBayModal}
          >
            Bay Allocation
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={PlusCircle}
            onClick={() => navigate('/quotations')}
          >
            New Vehicle Sale
          </Button>
        </div>
      </div>

      {/* 4 Core Top KPI Cards (All computed) */}
      <DashboardKpis metrics={metrics} />

      {/* AI Copilot Insights Strip (3 Cards) */}
      <AiInsightsStrip />

      {/* Primary 2-Column Operational Grid: Trajectory Chart & 12-Bay Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <SalesTrendChart trendData={metrics.last7DaysTrend} hourlyData={metrics.hourlyTrend} />
        </div>
        <div className="lg:col-span-5">
          <MiniBayBoard bays={bays} />
        </div>
      </div>

      {/* Secondary Grid: Top Selling Bikes, Stock Overview & WhatsApp Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Selling Bikes */}
        <div className="lg:col-span-4">
          <TopSellingBikes />
        </div>

        {/* Stock Overview with Reorder Alerts */}
        <div className="lg:col-span-4">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div>
                <CardTitle>Inventory Health & Reorder</CardTitle>
                <p className="text-xs text-text-muted mt-0.5">Chassis stock & OEM spare parts alerts</p>
              </div>
              <button
                onClick={() => navigate('/stock/parts')}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>Stock</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </CardHeader>
            <CardContent className="divide-y divide-border/60 p-0">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded bg-blue-50 text-status-blue">
                    <Warehouse className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-text-main">Ready for Sale Vehicles</div>
                    <div className="text-[10px] text-text-muted">Unallocated floor and yard stock</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-text-main tabular-nums">
                  {metrics.stockSummary.freeVehiclesCount} Units
                </div>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded bg-amber-50 text-status-amber">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-text-main">Allocated to Bookings</div>
                    <div className="text-[10px] text-text-muted">Awaiting PDI or RTO registration</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-text-main tabular-nums">
                  {metrics.stockSummary.allocatedVehiclesCount} Units
                </div>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded bg-red-50 text-status-red">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-text-main">Low Stock Parts Alert</div>
                    <div className="text-[10px] text-text-muted">Quantity below reorder threshold</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-status-red tabular-nums">
                  {metrics.stockSummary.lowStockPartsCount} Parts
                </div>
              </div>

              {/* Low stock part chips */}
              <div className="p-4 bg-surface-subtle/50 space-y-2">
                <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                  Critical Spares Requiring PO:
                </div>
                {partsStock
                  .filter((p) => (p.stockQty || 0) < (p.reorderLevel || 0))
                  .slice(0, 2)
                  .map((p) => (
                    <div
                      key={p.id}
                      onClick={() => navigate('/stock/parts')}
                      className="flex items-center justify-between text-xs p-2 rounded bg-surface border border-border cursor-pointer hover:border-primary/40"
                    >
                      <span className="font-medium text-text-main truncate max-w-[180px]">{p.name}</span>
                      <span className="text-[10px] font-bold text-status-red bg-red-100 px-2 py-0.5 rounded-full">
                        {p.stockQty} / Min {p.reorderLevel}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Collapsible WhatsApp Live Phone Preview */}
        <div className="lg:col-span-4">
          <WhatsAppLivePhonePreview conversations={whatsappConversations} />
        </div>
      </div>

      {/* Tertiary Row: Recent Bookings & Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recent Customer Bookings</CardTitle>
              <p className="text-xs text-text-muted mt-0.5">Tokens collected & pending deliveries</p>
            </div>
            <button
              onClick={() => navigate('/bookings')}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </CardHeader>
          <CardContent className="divide-y divide-border/60 p-0">
            {bookings.slice(0, 4).map((b) => (
              <div key={b.id} className="p-4 flex items-center justify-between hover:bg-surface-subtle transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-main">{b.customerName}</span>
                    <span className="text-[10px] font-mono text-text-muted">{b.bookingNumber}</span>
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">{b.modelName}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-text-main tabular-nums">
                    Token: {formatMoney(b.tokenAmountPaise)}
                  </div>
                  <StatusBadge status={b.status} className="mt-1" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recent Posted Invoices</CardTitle>
              <p className="text-xs text-text-muted mt-0.5">Statutory tax invoices and settlements</p>
            </div>
            <button
              onClick={() => navigate('/billing')}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>Billing Terminal</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </CardHeader>
          <CardContent className="divide-y divide-border/60 p-0">
            {recentPostedInvoices.map((inv) => (
              <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-surface-subtle transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-main">{inv.customerName}</span>
                    <span className="text-[10px] font-mono text-primary font-semibold">{inv.invoiceNumber}</span>
                  </div>
                  <div className="text-[11px] text-text-muted mt-0.5">{formatDate(inv.date)} • {(inv.type || 'INVOICE').replace(/_/g, ' ')}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-text-main tabular-nums">
                    {formatMoney(inv.grandTotalPaise)}
                  </div>
                  <StatusBadge status={inv.paymentStatus} className="mt-1" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Backend health, API request log & audit trail */}
      <SystemActivityPanel localMetrics={metrics} />

      {/* Quick Bay Allocation Modal */}
      <Modal
        isOpen={bayModalOpen}
        onClose={() => setBayModalOpen(false)}
        title="Immediate Bay Allocation"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-main mb-1">Select Workshop Bay</label>
            <select
              value={selectedBay}
              onChange={(e) => setSelectedBay(e.target.value)}
              className="w-full text-xs p-2.5 rounded-input border border-border bg-surface-subtle text-text-main"
            >
              {freeBays.length === 0 && <option value="">No free bays</option>}
              {freeBays.map((b) => (
                  <option key={b.bayNumber} value={b.bayNumber}>
                    Bay #{b.bayNumber} ({b.type}) - Currently Free
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-main mb-1">Select Checked-In Job Card</label>
            <select
              value={selectedJobCardId}
              onChange={(e) => setSelectedJobCardId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-input border border-border bg-surface-subtle text-text-main"
            >
              {unassignedJobCards.length === 0 && <option value="">No job cards waiting for a bay</option>}
              {unassignedJobCards.map((jc) => (
                  <option key={jc.id} value={jc.id}>
                    {jc.jobCardNumber} - {jc.registrationNumber} ({jc.customerName})
                  </option>
                ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setBayModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleQuickBayAssign}
              disabled={!selectedBay || !selectedJobCardId}
            >
              Confirm Allocation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
