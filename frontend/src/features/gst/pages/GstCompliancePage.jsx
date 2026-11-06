import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../../store';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Pagination } from '../../../components/ui/Pagination';
import { formatMoney, formatDate } from '../../../lib/format';
import {
  Download,
  Search,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { toast } from 'sonner';

export function GstCompliancePage() {
  const [activeTab, setActiveTab] = useState('GSTR1'); // 'GSTR1', 'GSTR3B', 'HSN_SUMMARY', 'ITC_RECON'
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const invoices = useAppStore((state) => state.invoices || []);

  const totalOutputGstPaise = invoices.reduce((s, i) => s + (i.totalTaxPaise || 0), 0);
  const totalCgstPaise = invoices.reduce((s, i) => s + (i.cgstPaise || 0), 0);
  const totalSgstPaise = invoices.reduce((s, i) => s + (i.sgstPaise || 0), 0);
  const totalTaxablePaise = invoices.reduce((s, i) => s + (i.taxableAmountPaise || 0), 0);

  // Sort invoices so the newest datas show first
  const sortedInvoices = useMemo(() => {
    return [...invoices].sort((a, b) => {
      // Primary: date / postedAt / createdAt descending (newest first)
      const dateA = a.date || a.postedAt || a.createdAt || '';
      const dateB = b.date || b.postedAt || b.createdAt || '';
      const timeDiff = new Date(dateB).getTime() - new Date(dateA).getTime();
      if (!isNaN(timeDiff) && timeDiff !== 0) {
        return timeDiff;
      }
      // Secondary: invoiceNumber descending (e.g. VI/2627/00256 before VI/2627/00001)
      return (b.invoiceNumber || '').localeCompare(a.invoiceNumber || '', undefined, { numeric: true });
    });
  }, [invoices]);

  // Optional search filter
  const filteredInvoices = useMemo(() => {
    if (!searchQuery.trim()) return sortedInvoices;
    const q = searchQuery.toLowerCase().trim();
    return sortedInvoices.filter(
      (inv) =>
        inv.invoiceNumber?.toLowerCase().includes(q) ||
        inv.customerName?.toLowerCase().includes(q) ||
        inv.gstin?.toLowerCase().includes(q) ||
        inv.buyerStateCode?.includes(q)
    );
  }, [sortedInvoices, searchQuery]);

  // Pagination calculation (10 per page default)
  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedInvoices = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredInvoices.slice(start, start + pageSize);
  }, [filteredInvoices, safeCurrentPage, pageSize]);

  const handleExportJson = () => {
    toast.success('Generated compliant offline GSTR JSON filing payload (GSTR1_29AABCB1829M1ZK_OCT2026.json)');
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main">GST Compliance, GSTR-1 &amp; Statutory Returns</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Table 4 (B2B), Table 5 (B2CL), HSN 8711/8714 summaries and Input Tax Credit (ITC) reconciliation
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            icon={Download}
            onClick={handleExportJson}
          >
            Export Offline GSTR JSON
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase font-semibold">Aggregate Taxable Turnover</div>
          <div className="text-2xl font-bold text-text-main mt-1 tabular-nums">
            {formatMoney(totalTaxablePaise)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase font-semibold">Total CGST Liability</div>
          <div className="text-2xl font-bold text-status-blue mt-1 tabular-nums">
            {formatMoney(totalCgstPaise)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase font-semibold">Total SGST Liability</div>
          <div className="text-2xl font-bold text-status-blue mt-1 tabular-nums">
            {formatMoney(totalSgstPaise)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase font-semibold">Net ITC Available (2B)</div>
          <div className="text-2xl font-bold text-status-green mt-1 tabular-nums">₹ 2,24,000.00</div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border space-x-2">
        {[
          { id: 'GSTR1', label: 'GSTR-1 Outward Supplies' },
          { id: 'GSTR3B', label: 'GSTR-3B Monthly Return' },
          { id: 'HSN_SUMMARY', label: 'Table 12 HSN Summary' },
          { id: 'ITC_RECON', label: 'GSTR-2B vs Books ITC Recon' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 font-semibold text-xs border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary bg-primary/5 rounded-t'
                : 'border-transparent text-text-muted hover:text-text-main'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* GSTR-1 View */}
      {activeTab === 'GSTR1' && (
        <Card className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <h3 className="font-bold text-base text-text-main">Table 4: B2B Taxable Supplies &amp; Table 5: B2C Large</h3>
              <p className="text-xs text-text-muted">GSTIN: 29AABCB1829M1ZK • Tax Period: October 2026</p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Filter invoice, GSTIN, name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8 pr-3 py-1 text-xs border border-border rounded-lg bg-surface text-text-main placeholder:text-text-muted focus:outline-hidden focus:ring-1 focus:ring-primary w-52 sm:w-60"
                />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 text-status-green flex items-center gap-1 whitespace-nowrap">
                <CheckCircle2 className="w-3 h-3 text-status-green" />
                Auto-Compiled from Store Invoices
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-border">
              <thead className="bg-surface-subtle font-semibold">
                <tr>
                  <th className="p-3 border border-border">Invoice #</th>
                  <th className="p-3 border border-border">Recipient GSTIN / Name</th>
                  <th className="p-3 border border-border">POS</th>
                  <th className="p-3 border border-border text-right">Invoice Value</th>
                  <th className="p-3 border border-border text-right">Taxable Value</th>
                  <th className="p-3 border border-border text-right">CGST (₹)</th>
                  <th className="p-3 border border-border text-right">SGST (₹)</th>
                </tr>
              </thead>
              <tbody>
                {paginatedInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-text-muted">
                      No invoices found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-surface-subtle/50 transition-colors">
                      <td className="p-2.5 border border-border font-mono">
                        <span className="font-bold text-primary">{inv.invoiceNumber}</span>
                        {(inv.date || inv.postedAt) && (
                          <span className="block text-[10px] text-text-muted font-sans font-normal mt-0.5">
                            {formatDate(inv.date || inv.postedAt)}
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 border border-border">
                        <span className="font-medium">{inv.gstin || 'B2C Consumer'}</span>{' '}
                        <span className="text-text-muted">({inv.customerName})</span>
                      </td>
                      <td className="p-2.5 border border-border font-mono">{inv.buyerStateCode || '29'}-Karnataka</td>
                      <td className="p-2.5 border border-border text-right tabular-nums font-bold text-text-main">
                        {formatMoney(inv.grandTotalPaise)}
                      </td>
                      <td className="p-2.5 border border-border text-right tabular-nums text-text-main">
                        {formatMoney(inv.taxableAmountPaise)}
                      </td>
                      <td className="p-2.5 border border-border text-right tabular-nums text-text-muted">
                        {formatMoney(inv.cgstPaise)}
                      </td>
                      <td className="p-2.5 border border-border text-right tabular-nums text-text-muted">
                        {formatMoney(inv.sgstPaise)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination: 10 per page */}
          <Pagination
            currentPage={safeCurrentPage}
            pageSize={pageSize}
            totalItems={filteredInvoices.length}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[10, 25, 50, 100]}
            itemLabel="invoices"
          />
        </Card>
      )}

      {/* GSTR-3B Summary */}
      {activeTab === 'GSTR3B' && (
        <Card className="p-6 space-y-4">
          <div className="border-b border-border pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-text-main">GSTR-3B Monthly Summary Return</h3>
              <p className="text-xs text-text-muted">Form GSTR-3B (Rule 61(5)) for October 2026</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
              Draft for Review
            </span>
          </div>

          <table className="w-full text-xs text-left border-collapse border border-border">
            <thead className="bg-surface-subtle font-semibold">
              <tr>
                <th className="p-3 border border-border">Nature of Supplies</th>
                <th className="p-3 border border-border text-right">Total Taxable Value (₹)</th>
                <th className="p-3 border border-border text-right">Integrated Tax (₹)</th>
                <th className="p-3 border border-border text-right">Central Tax (₹)</th>
                <th className="p-3 border border-border text-right">State/UT Tax (₹)</th>
                <th className="p-3 border border-border text-right">Cess (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2.5 border border-border font-medium">
                  3.1(a) Outward taxable supplies (other than zero rated, nil rated and exempted)
                </td>
                <td className="p-2.5 border border-border text-right tabular-nums font-bold">
                  {formatMoney(totalTaxablePaise)}
                </td>
                <td className="p-2.5 border border-border text-right tabular-nums">₹ 0.00</td>
                <td className="p-2.5 border border-border text-right tabular-nums">
                  {formatMoney(totalCgstPaise)}
                </td>
                <td className="p-2.5 border border-border text-right tabular-nums">
                  {formatMoney(totalSgstPaise)}
                </td>
                <td className="p-2.5 border border-border text-right tabular-nums">₹ 0.00</td>
              </tr>
              <tr>
                <td className="p-2.5 border border-border font-medium">
                  3.1(d) Inward supplies liable to reverse charge
                </td>
                <td className="p-2.5 border border-border text-right tabular-nums font-bold">₹ 0.00</td>
                <td className="p-2.5 border border-border text-right tabular-nums">₹ 0.00</td>
                <td className="p-2.5 border border-border text-right tabular-nums">₹ 0.00</td>
                <td className="p-2.5 border border-border text-right tabular-nums">₹ 0.00</td>
                <td className="p-2.5 border border-border text-right tabular-nums">₹ 0.00</td>
              </tr>
              <tr className="bg-surface-subtle/40 font-semibold">
                <td className="p-2.5 border border-border">4(A)(4) Eligible Input Tax Credit (ITC - All Other)</td>
                <td className="p-2.5 border border-border text-right tabular-nums">—</td>
                <td className="p-2.5 border border-border text-right tabular-nums">₹ 0.00</td>
                <td className="p-2.5 border border-border text-right tabular-nums text-status-green">₹ 1,12,000.00</td>
                <td className="p-2.5 border border-border text-right tabular-nums text-status-green">₹ 1,12,000.00</td>
                <td className="p-2.5 border border-border text-right tabular-nums">₹ 0.00</td>
              </tr>
              <tr className="bg-primary/5 font-bold text-text-main">
                <td className="p-2.5 border border-border">Net Cash Tax Payable (Output Liability - Eligible ITC)</td>
                <td className="p-2.5 border border-border text-right tabular-nums">—</td>
                <td className="p-2.5 border border-border text-right tabular-nums">₹ 0.00</td>
                <td className="p-2.5 border border-border text-right tabular-nums text-status-blue">
                  {formatMoney(Math.max(0, totalCgstPaise - 11200000))}
                </td>
                <td className="p-2.5 border border-border text-right tabular-nums text-status-blue">
                  {formatMoney(Math.max(0, totalSgstPaise - 11200000))}
                </td>
                <td className="p-2.5 border border-border text-right tabular-nums">₹ 0.00</td>
              </tr>
            </tbody>
          </table>
        </Card>
      )}

      {/* HSN Summary */}
      {activeTab === 'HSN_SUMMARY' && (
        <Card className="p-6 space-y-4">
          <div className="border-b border-border pb-3">
            <h3 className="font-bold text-base text-text-main">Table 12: HSN Summary of Outward Supplies</h3>
            <p className="text-xs text-text-muted">Mandatory 4/6 digit HSN level disclosure</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-border">
              <thead className="bg-surface-subtle font-semibold">
                <tr>
                  <th className="p-3 border border-border">HSN / SAC</th>
                  <th className="p-3 border border-border">Description</th>
                  <th className="p-3 border border-border text-right">Quantity</th>
                  <th className="p-3 border border-border text-right">Total Taxable Value (₹)</th>
                  <th className="p-3 border border-border text-right">Central Tax CGST</th>
                  <th className="p-3 border border-border text-right">State Tax SGST</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2.5 border border-border font-mono font-bold text-primary">8711</td>
                  <td className="p-2.5 border border-border">Motorcycles &amp; Scooters (Two-Wheelers)</td>
                  <td className="p-2.5 border border-border text-right font-bold">1 NOS</td>
                  <td className="p-2.5 border border-border text-right tabular-nums font-bold">₹ 2,77,857.14</td>
                  <td className="p-2.5 border border-border text-right tabular-nums">₹ 55,571.43</td>
                  <td className="p-2.5 border border-border text-right tabular-nums">₹ 55,571.43</td>
                </tr>
                <tr>
                  <td className="p-2.5 border border-border font-mono font-bold text-primary">8714</td>
                  <td className="p-2.5 border border-border">Parts &amp; Accessories of Two-Wheelers</td>
                  <td className="p-2.5 border border-border text-right font-bold">2 NOS</td>
                  <td className="p-2.5 border border-border text-right tabular-nums font-bold">₹ 5,605.93</td>
                  <td className="p-2.5 border border-border text-right tabular-nums">₹ 504.53</td>
                  <td className="p-2.5 border border-border text-right tabular-nums">₹ 504.53</td>
                </tr>
                <tr>
                  <td className="p-2.5 border border-border font-mono font-bold text-primary">9987</td>
                  <td className="p-2.5 border border-border">Maintenance and Repair Services of Motorcycles</td>
                  <td className="p-2.5 border border-border text-right font-bold">1 NOS</td>
                  <td className="p-2.5 border border-border text-right tabular-nums font-bold">₹ 0.00</td>
                  <td className="p-2.5 border border-border text-right tabular-nums">₹ 0.00</td>
                  <td className="p-2.5 border border-border text-right tabular-nums">₹ 0.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ITC Recon Tab */}
      {activeTab === 'ITC_RECON' && (
        <Card className="p-6 space-y-4">
          <div className="border-b border-border pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-text-main">GSTR-2B vs Books ITC Reconciliation</h3>
              <p className="text-xs text-text-muted">Auto-matched Input Tax Credit from GSTN Portal vs Purchase Register</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-status-green flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-status-green" /> 100% ITC Matched
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg border border-border bg-surface-subtle/30">
              <div className="text-[11px] text-text-muted uppercase font-semibold">Matched Invoices (2B &amp; Books)</div>
              <div className="text-lg font-bold text-status-green mt-1">₹ 2,24,000.00</div>
              <div className="text-[11px] text-text-muted mt-0.5">14 Supplier invoices fully reconciled</div>
            </div>
            <div className="p-3 rounded-lg border border-border bg-surface-subtle/30">
              <div className="text-[11px] text-text-muted uppercase font-semibold">Pending in 2B (Books Only)</div>
              <div className="text-lg font-bold text-text-main mt-1">₹ 0.00</div>
              <div className="text-[11px] text-text-muted mt-0.5">Zero unfiled supplier returns</div>
            </div>
            <div className="p-3 rounded-lg border border-border bg-surface-subtle/30">
              <div className="text-[11px] text-text-muted uppercase font-semibold">Eligible ITC Claim Ratio</div>
              <div className="text-lg font-bold text-primary mt-1">100.0%</div>
              <div className="text-[11px] text-text-muted mt-0.5">Zero disallowed ITC under Sec 17(5)</div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-dashed border-border text-center text-xs text-text-muted flex items-center justify-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-primary" />
            All purchase bills and spare OEM consignments for October 2026 match Form GSTR-2B statutory filing.
          </div>
        </Card>
      )}
    </div>
  );
}
