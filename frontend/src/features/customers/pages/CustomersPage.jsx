import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../../store';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Drawer } from '../../../components/ui/Drawer';
import { Modal } from '../../../components/ui/Modal';
import { PageHeader } from '../../../components/ui/PageHeader';
import { KpiCard } from '../../../components/ui/KpiCard';
import { formatMoney, formatPhone, formatDate } from '../../../lib/format';
import {
  Users,
  UserPlus,
  Search,
  Bike,
  ShieldCheck,
  Calendar,
  Clock,
  Wrench,
  FileText,
  Star,
  Sparkles,
  Phone,
  MessageSquare,
  AlertTriangle,
  FolderOpen,
  Edit3,
  Trash2,
  Filter,
  X,
  Plus,
  Award,
  DollarSign,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';

export function CustomersPage() {
  const customers = useAppStore((state) => state.customers || []);
  const currentUser = useAppStore((state) => state.currentUser);
  const addCustomer = useAppStore((state) => state.addCustomer);
  const updateCustomer = useAppStore((state) => state.updateCustomer);
  const deleteCustomer = useAppStore((state) => state.deleteCustomer);

  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [churnFilter, setChurnFilter] = useState('ALL');

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState('OVERVIEW'); // 'OVERVIEW', 'BIKES', 'CONSENT', 'VAULT'
  
  // Modals
  const [editCustomerModalOpen, setEditCustomerModalOpen] = useState(false);
  const [addCustomerModalOpen, setAddCustomerModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Form states
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Bangalore',
    pincode: '560001',
    loyaltyTier: 'Silver',
    loyaltyPoints: 0,
    csatScore: 5,
    churnRisk: 'LOW',
  });

  // Unique cities list for filtering
  const distinctCities = useMemo(() => {
    const set = new Set();
    customers.forEach((c) => {
      if (c.city) set.add(c.city);
    });
    return Array.from(set).sort();
  }, [customers]);

  // Dynamic KPI calculations from store (Section 0.4: NO hardcoded KPI numbers)
  const kpiStats = useMemo(() => {
    const total = customers.length;
    const premiumTiers = customers.filter(
      (c) => c.loyaltyTier === 'Platinum' || c.loyaltyTier === 'Gold'
    ).length;
    const totalLtv = customers.reduce((acc, c) => acc + (c.ltvPaise || 0), 0);
    const avgLtv = total > 0 ? Math.round(totalLtv / total) : 0;
    const highRisk = customers.filter((c) => c.churnRisk === 'HIGH').length;

    return {
      total,
      premiumTiers,
      avgLtv,
      highRisk,
    };
  }, [customers]);

  const handleOpenAddCustomer = () => {
    setCustomerForm({
      name: '',
      phone: '+91 ',
      email: '',
      address: '',
      city: 'Bangalore',
      pincode: '560038',
      loyaltyTier: 'Silver',
      loyaltyPoints: 100,
      csatScore: 5,
      churnRisk: 'LOW',
    });
    setAddCustomerModalOpen(true);
  };

  const handleOpenEditCustomer = (cust) => {
    setSelectedCustomer(cust);
    setCustomerForm({
      name: cust.name || '',
      phone: cust.phone || '',
      email: cust.email || '',
      address: cust.address || '',
      city: cust.city || 'Bangalore',
      pincode: cust.pincode || '560095',
      loyaltyTier: cust.loyaltyTier || 'Silver',
      loyaltyPoints: cust.loyaltyPoints || 0,
      csatScore: cust.csatScore || 5,
      churnRisk: cust.churnRisk || 'LOW',
    });
    setEditCustomerModalOpen(true);
  };

  const handleSaveNewCustomer = () => {
    if (!customerForm.name.trim() || !customerForm.phone.trim() || customerForm.phone.length < 10) {
      toast.error('Customer name and valid mobile phone are required.');
      return;
    }
    if (addCustomer) {
      const created = addCustomer({
        name: customerForm.name.trim(),
        phone: customerForm.phone.trim(),
        email: customerForm.email.trim(),
        address: customerForm.address.trim(),
        city: customerForm.city.trim(),
        pincode: customerForm.pincode.trim(),
        loyaltyTier: customerForm.loyaltyTier,
        loyaltyPoints: Number(customerForm.loyaltyPoints) || 0,
        csatScore: Number(customerForm.csatScore) || 5,
        churnRisk: customerForm.churnRisk,
        ltvPaise: 0,
      });
      toast.success(`Customer ${created.name} registered in Customer 360 database.`);
    }
    setAddCustomerModalOpen(false);
  };

  const handleSaveEditCustomer = () => {
    if (!customerForm.name.trim() || !customerForm.phone.trim()) {
      toast.error('Customer name and phone number are required');
      return;
    }
    if (selectedCustomer && updateCustomer) {
      const patch = {
        name: customerForm.name.trim(),
        phone: customerForm.phone.trim(),
        email: customerForm.email.trim(),
        address: customerForm.address.trim(),
        city: customerForm.city.trim(),
        pincode: customerForm.pincode.trim(),
        loyaltyTier: customerForm.loyaltyTier,
        loyaltyPoints: Number(customerForm.loyaltyPoints) || 0,
        csatScore: Number(customerForm.csatScore) || 5,
        churnRisk: customerForm.churnRisk,
      };
      updateCustomer(selectedCustomer.id, patch);
      setSelectedCustomer({
        ...selectedCustomer,
        ...patch,
      });
      toast.success(`Customer profile for ${customerForm.name} updated successfully.`);
    }
    setEditCustomerModalOpen(false);
  };

  const handleDeletePrompt = (cust) => {
    setCustomerToDelete(cust);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (customerToDelete && deleteCustomer) {
      deleteCustomer(customerToDelete.id);
      if (selectedCustomer?.id === customerToDelete.id) {
        setSelectedCustomer(null);
      }
      toast.success(`Customer record for ${customerToDelete.name} deleted.`);
    }
    setDeleteConfirmOpen(false);
    setCustomerToDelete(null);
  };

  const handleToggleConsent = (key) => {
    if (!selectedCustomer || !updateCustomer) return;
    const currentConsent = selectedCustomer.consent || {};
    const updatedConsent = {
      ...currentConsent,
      [key]: !currentConsent[key],
      updatedAt: new Date().toISOString(),
    };
    updateCustomer(selectedCustomer.id, { consent: updatedConsent });
    setSelectedCustomer({
      ...selectedCustomer,
      consent: updatedConsent,
    });
    toast.success(`Consent preference updated to ${!currentConsent[key] ? 'OPTED IN' : 'OPTED OUT'}`);
  };

  const filteredCustomers = useMemo(() => {
    let list = customers || [];

    if (cityFilter !== 'ALL') {
      list = list.filter((c) => c.city === cityFilter);
    }

    if (tierFilter !== 'ALL') {
      list = list.filter((c) => c.loyaltyTier === tierFilter);
    }

    if (churnFilter !== 'ALL') {
      list = list.filter((c) => c.churnRisk === churnFilter);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((c) => {
        const matchName = (c.name || '').toLowerCase().includes(q);
        const matchPhone = (c.phone || '').includes(q);
        const matchCity = (c.city || '').toLowerCase().includes(q);
        const matchReg = (c.vehicles || []).some((v) =>
          (v.registrationNumber || '').toLowerCase().includes(q)
        );
        return matchName || matchPhone || matchCity || matchReg;
      });
    }

    return list;
  }, [customers, searchTerm, cityFilter, tierFilter, churnFilter]);

  // Paginated records
  const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Customer Care', path: '/customers' },
          { label: 'Customer 360', path: '/customers' },
        ]}
        title="Customer 360 & Relationship Hub"
        subtitle="Single view of customer profiles, bike ownership, consent logs, document vault and AI churn risk."
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={UserPlus}
            onClick={handleOpenAddCustomer}
            className="bg-primary hover:bg-primary-hover text-white"
          >
            Add Customer
          </Button>
        }
      />

      {/* 2. Plain KPI Cards Row (Section 0.5: NO charts, sparklines, or trend arrows) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          label="Total Active Customers"
          value={kpiStats.total}
          helperText="Verified registered showroom profiles"
          icon={<Users className="w-5 h-5 text-primary" />}
        />
        <KpiCard
          label="Gold & Platinum Members"
          value={kpiStats.premiumTiers}
          helperText={`${Math.round((kpiStats.premiumTiers / (kpiStats.total || 1)) * 100)}% premium loyalty tier`}
          icon={<Award className="w-5 h-5 text-amber-500" />}
        />
        <KpiCard
          label="Avg Lifetime Value"
          value={formatMoney(kpiStats.avgLtv)}
          helperText="Sales, accessories & service spend"
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
        />
        <KpiCard
          label="High Churn Risk"
          value={kpiStats.highRisk}
          helperText="Overdue service & low engagement"
          icon={<AlertTriangle className="w-5 h-5 text-rose-500" />}
        />
      </div>

      {/* 3. Filter and Search Bar */}
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by customer name, phone number (+91), city or registration..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-input border border-border bg-surface text-text-main focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* City Filter */}
          <div className="flex items-center gap-2">
            <select
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 text-xs rounded-input border border-border bg-surface text-text-main"
            >
              <option value="ALL">All Cities ({distinctCities.length})</option>
              {distinctCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            {/* Loyalty Tier Filter */}
            <select
              value={tierFilter}
              onChange={(e) => {
                setTierFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 text-xs rounded-input border border-border bg-surface text-text-main"
            >
              <option value="ALL">All Tiers</option>
              <option value="Platinum">Platinum</option>
              <option value="Gold">Gold</option>
              <option value="Silver">Silver</option>
            </select>

            {/* Churn Risk Filter */}
            <select
              value={churnFilter}
              onChange={(e) => {
                setChurnFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 text-xs rounded-input border border-border bg-surface text-text-main"
            >
              <option value="ALL">All Churn Risk</option>
              <option value="LOW">Low Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="HIGH">High Risk</option>
            </select>

            {(searchTerm || cityFilter !== 'ALL' || tierFilter !== 'ALL' || churnFilter !== 'ALL') && (
              <Button
                variant="ghost"
                size="sm"
                icon={X}
                onClick={() => {
                  setSearchTerm('');
                  setCityFilter('ALL');
                  setTierFilter('ALL');
                  setChurnFilter('ALL');
                  setCurrentPage(1);
                }}
                className="text-text-muted hover:text-text-main"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 4. Customer Directory Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-subtle border-b border-border text-text-muted font-semibold uppercase text-[11px]">
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Phone Number</th>
                <th className="p-3.5">City / Location</th>
                <th className="p-3.5">Registered Bikes</th>
                <th className="p-3.5">Loyalty Tier</th>
                <th className="p-3.5">Lifetime Value (LTV)</th>
                <th className="p-3.5">AI Churn Risk</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-text-muted">
                    No customer profiles found matching the active criteria.
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((cust) => {
                  const primaryVehicle = cust.vehicles?.[0];
                  return (
                    <tr
                      key={cust.id}
                      onClick={() => {
                        setSelectedCustomer(cust);
                        setActiveTab('OVERVIEW');
                      }}
                      className="hover:bg-surface-subtle/70 transition-colors cursor-pointer"
                    >
                      <td className="p-3.5 font-bold text-text-main">{cust.name}</td>
                      <td className="p-3.5 font-mono text-text-muted">{formatPhone(cust.phone)}</td>
                      <td className="p-3.5 text-text-muted">{cust.city}</td>
                      <td className="p-3.5">
                        {primaryVehicle ? (
                          <div>
                            <div className="font-semibold text-primary">{primaryVehicle.modelName}</div>
                            <div className="text-[10px] font-mono text-text-muted">
                              {primaryVehicle.registrationNumber}
                            </div>
                          </div>
                        ) : (
                          <span className="text-text-muted italic">No vehicle</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            cust.loyaltyTier === 'Platinum'
                              ? 'bg-purple-100 text-purple-700'
                              : cust.loyaltyTier === 'Gold'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {cust.loyaltyTier}
                        </span>
                      </td>
                      <td className="p-3.5 tabular-nums font-semibold text-text-main">
                        {formatMoney(cust.ltvPaise)}
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={cust.churnRisk} />
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="xs"
                            variant="primary"
                            onClick={() => {
                              setSelectedCustomer(cust);
                              setActiveTab('OVERVIEW');
                            }}
                            className="bg-primary hover:bg-primary-hover text-white"
                          >
                            Customer 360
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            icon={Edit3}
                            onClick={() => handleOpenEditCustomer(cust)}
                            title="Edit Customer Profile"
                          >
                            Edit
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            icon={Trash2}
                            onClick={() => handleDeletePrompt(cust)}
                            className="text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            title="Delete Customer Profile"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
          <div>
            Showing{' '}
            <span className="font-semibold text-text-main">
              {filteredCustomers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-text-main">
              {Math.min(currentPage * pageSize, filteredCustomers.length)}
            </span>{' '}
            of <span className="font-semibold text-text-main">{filteredCustomers.length}</span> customers
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px]">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 text-xs rounded border border-border bg-surface text-text-main"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>

            <Button
              size="xs"
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="font-semibold text-text-main px-1">
              {currentPage} / {totalPages}
            </span>
            <Button
              size="xs"
              variant="outline"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* 5. Customer 360 Slide-over Drawer */}
      <Drawer
        isOpen={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer ? `Customer 360: ${selectedCustomer.name}` : ''}
        size="lg"
      >
        {selectedCustomer && (
          <div className="space-y-6 text-xs">
            {/* Top Bio Banner */}
            <div className="p-5 rounded-card bg-surface-subtle border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-text-main">{selectedCustomer.name}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedCustomer.loyaltyTier === 'Platinum'
                        ? 'bg-purple-100 text-purple-700'
                        : selectedCustomer.loyaltyTier === 'Gold'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {selectedCustomer.loyaltyTier} Member
                  </span>
                </div>
                <div className="text-text-muted mt-1 flex flex-wrap items-center gap-2">
                  <span className="font-mono font-medium text-text-main">{formatPhone(selectedCustomer.phone)}</span>
                  <span>•</span>
                  <span>{selectedCustomer.email || 'No email registered'}</span>
                  <span>•</span>
                  <span>
                    {selectedCustomer.address}, {selectedCustomer.city} - {selectedCustomer.pincode}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <Button
                  size="xs"
                  variant="outline"
                  icon={Edit3}
                  onClick={() => handleOpenEditCustomer(selectedCustomer)}
                  className="mb-2"
                >
                  Edit Profile
                </Button>
                <div className="text-xs text-text-muted uppercase font-semibold">Lifetime Value</div>
                <div className="text-xl font-bold text-primary tabular-nums mt-0.5">
                  {formatMoney(selectedCustomer.ltvPaise)}
                </div>
                <div className="text-[10px] text-text-muted mt-0.5">
                  Loyalty Points: <strong className="text-text-main">{selectedCustomer.loyaltyPoints}</strong>
                </div>
              </div>
            </div>

            {/* Quick Action Navigation Tabs */}
            <div className="flex border-b border-border space-x-2">
              {[
                { id: 'OVERVIEW', label: 'Overview & Recommendations' },
                { id: 'BIKES', label: `Garage Bikes (${selectedCustomer.vehicles?.length || 0})` },
                { id: 'CONSENT', label: 'Consent Records (DPDP)' },
                { id: 'VAULT', label: 'Document Vault' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-primary text-primary bg-primary/5 rounded-t'
                      : 'border-transparent text-text-muted hover:text-text-main'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Overview & Next Best Action */}
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-4">
                <Card className="p-4 bg-blue-50/50 border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="font-bold text-primary uppercase tracking-wide">
                      AI Next-Best-Action Recommendation
                    </span>
                  </div>
                  <p className="text-text-main leading-relaxed">
                    {selectedCustomer.churnRisk === 'HIGH'
                      ? 'Customer is overdue for periodic maintenance. High risk of migrating to unorganized local workshop. Recommend 1-click WhatsApp service reminder with complimentary water wash voucher.'
                      : 'Customer demonstrates high loyalty (CSAT 5/5). Eligible for VIP preview of Himalayan 450 tubeless accessory kit or exchange upgrade appraisal.'}
                  </p>
                  <div className="mt-3 pt-3 border-t border-blue-200 flex gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      icon={MessageSquare}
                      onClick={() => toast.success(`WhatsApp reminder sent to ${selectedCustomer.name}`)}
                    >
                      Trigger 1-Click WhatsApp Reminder
                    </Button>
                  </div>
                </Card>

                {/* CSAT / NPS Score */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <span className="text-text-muted uppercase text-[10px] font-semibold block">
                      Customer Satisfaction (CSAT)
                    </span>
                    <div className="text-xl font-bold text-text-main mt-1 flex items-center gap-1.5">
                      <span>{selectedCustomer.csatScore} / 5</span>
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    </div>
                  </Card>

                  <Card className="p-4">
                    <span className="text-text-muted uppercase text-[10px] font-semibold block">
                      Predictive Churn Risk
                    </span>
                    <div className="mt-1">
                      <StatusBadge status={selectedCustomer.churnRisk} />
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Tab 2: Registered Garage Bikes */}
            {activeTab === 'BIKES' && (
              <div className="space-y-3">
                {(!selectedCustomer.vehicles || selectedCustomer.vehicles.length === 0) ? (
                  <div className="p-6 text-center text-text-muted italic">No vehicles registered under this profile.</div>
                ) : (
                  selectedCustomer.vehicles.map((bike, idx) => (
                    <Card key={idx} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded bg-blue-50 text-primary">
                            <Bike className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-text-main">{bike.modelName}</h4>
                            <div className="font-mono text-[11px] text-text-muted">
                              Reg: <strong>{bike.registrationNumber}</strong> | VIN: {bike.chassisNumber}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 text-status-green">
                          Active Warranty
                        </span>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border grid grid-cols-3 gap-3 text-[11px]">
                        <div>
                          <span className="text-text-muted block">Odometer:</span>
                          <span className="font-bold tabular-nums text-text-main">{bike.odometerKm} KM</span>
                        </div>
                        <div>
                          <span className="text-text-muted block">Avg Daily Usage:</span>
                          <span className="font-bold tabular-nums text-text-main">{bike.avgDailyKm} KM / Day</span>
                        </div>
                        <div>
                          <span className="text-text-muted block">Last Serviced:</span>
                          <span className="font-medium text-text-main">{formatDate(bike.lastServiceDate)}</span>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Tab 3: Consent Records (DPDP Opt-In Tracker) */}
            {activeTab === 'CONSENT' && (
              <Card className="p-4 space-y-4">
                <div className="border-b border-border pb-3">
                  <h4 className="font-bold text-text-main">DPDP Statutory Customer Consent Register</h4>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Immutable consent audit record under Digital Personal Data Protection guidelines. Click to toggle opt-in state.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded bg-surface-subtle border border-border">
                    <div>
                      <div className="font-semibold text-text-main">WhatsApp Transactional Updates</div>
                      <div className="text-[10px] text-text-muted">Job card updates, invoice PDFs, OTP approvals</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleConsent('marketingWhatsapp')}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                        selectedCustomer.consent?.marketingWhatsapp
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border border-slate-300'
                      }`}
                    >
                      {selectedCustomer.consent?.marketingWhatsapp ? 'OPTED IN' : 'OPTED OUT'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded bg-surface-subtle border border-border">
                    <div>
                      <div className="font-semibold text-text-main">Service Due Reminders</div>
                      <div className="text-[10px] text-text-muted">KM and date-based maintenance notifications</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleConsent('serviceReminders')}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                        selectedCustomer.consent?.serviceReminders
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border border-slate-300'
                      }`}
                    >
                      {selectedCustomer.consent?.serviceReminders ? 'OPTED IN' : 'OPTED OUT'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded bg-surface-subtle border border-border">
                    <div>
                      <div className="font-semibold text-text-main">Promotional Schemes & Festival SMS</div>
                      <div className="text-[10px] text-text-muted">Exchange bonuses, seasonal offers</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleConsent('promotionalSms')}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                        selectedCustomer.consent?.promotionalSms
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border border-slate-300'
                      }`}
                    >
                      {selectedCustomer.consent?.promotionalSms ? 'OPTED IN' : 'OPTED OUT'}
                    </button>
                  </div>
                </div>

                <div className="text-[10px] text-text-muted italic pt-2">
                  Last updated on {formatDate(selectedCustomer.consent?.updatedAt || new Date())} via Digital Portal OTP
                </div>
              </Card>
            )}

            {/* Tab 4: Document Vault */}
            {activeTab === 'VAULT' && (
              <Card className="p-4 space-y-3">
                <div className="border-b border-border pb-3">
                  <h4 className="font-bold text-text-main">Customer KYC & Vehicle Document Vault</h4>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Verified Driving Licence, Vehicle RC and Insurance policy copies. (Aadhaar numbers are never stored).
                  </p>
                </div>

                <div className="space-y-2">
                  {(!selectedCustomer.documents || selectedCustomer.documents.length === 0) ? (
                    <div className="py-6 text-center text-text-muted italic">No documents attached yet</div>
                  ) : (
                    selectedCustomer.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 rounded bg-surface-subtle border border-border"
                      >
                        <div className="flex items-center gap-2.5">
                          <FolderOpen className="w-4 h-4 text-primary" />
                          <div>
                            <span className="font-bold text-text-main">{doc.name}</span>
                            <div className="text-[10px] text-text-muted">{doc.type?.replace(/_/g, ' ')}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-status-green bg-green-50 px-2 py-0.5 rounded border border-green-200">
                          Verified
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            )}
          </div>
        )}
      </Drawer>

      {/* 6. Add Customer Modal */}
      <Modal
        isOpen={addCustomerModalOpen}
        onClose={() => setAddCustomerModalOpen(false)}
        title="Add New Customer Profile"
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Customer Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Ramesh Hegde"
                value={customerForm.name}
                onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Mobile Phone Number *</label>
              <input
                type="text"
                placeholder="+91 98450 00000"
                value={customerForm.phone}
                onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-text-main block mb-1">Email Address</label>
            <input
              type="email"
              placeholder="customer@domain.com"
              value={customerForm.email}
              onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
              className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
            />
          </div>

          <div>
            <label className="font-semibold text-text-main block mb-1">Street Address</label>
            <textarea
              rows={2}
              placeholder="House/Plot No, Street, Layout"
              value={customerForm.address}
              onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
              className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">City</label>
              <input
                type="text"
                value={customerForm.city}
                onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">PIN Code</label>
              <input
                type="text"
                value={customerForm.pincode}
                onChange={(e) => setCustomerForm({ ...customerForm, pincode: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Initial Loyalty Tier</label>
              <select
                value={customerForm.loyaltyTier}
                onChange={(e) => setCustomerForm({ ...customerForm, loyaltyTier: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              >
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Churn Risk Classification</label>
              <select
                value={customerForm.churnRisk}
                onChange={(e) => setCustomerForm({ ...customerForm, churnRisk: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setAddCustomerModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveNewCustomer} className="bg-primary hover:bg-primary-hover text-white">
              Create Customer
            </Button>
          </div>
        </div>
      </Modal>

      {/* 7. Edit Customer Modal */}
      <Modal
        isOpen={editCustomerModalOpen}
        onClose={() => setEditCustomerModalOpen(false)}
        title={selectedCustomer ? `Edit Customer Profile — ${selectedCustomer.name}` : 'Edit Customer'}
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Customer Full Name</label>
              <input
                type="text"
                value={customerForm.name}
                onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Mobile Phone Number</label>
              <input
                type="text"
                value={customerForm.phone}
                onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-text-main block mb-1">Email Address</label>
            <input
              type="email"
              value={customerForm.email}
              onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
              className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
            />
          </div>

          <div>
            <label className="font-semibold text-text-main block mb-1">Residential Street Address</label>
            <textarea
              rows={2}
              value={customerForm.address}
              onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
              className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">City</label>
              <input
                type="text"
                value={customerForm.city}
                onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Postal PIN Code</label>
              <input
                type="text"
                value={customerForm.pincode}
                onChange={(e) => setCustomerForm({ ...customerForm, pincode: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Loyalty Tier</label>
              <select
                value={customerForm.loyaltyTier}
                onChange={(e) => setCustomerForm({ ...customerForm, loyaltyTier: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              >
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">CSAT Rating (1-5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={customerForm.csatScore}
                onChange={(e) => setCustomerForm({ ...customerForm, csatScore: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-bold tabular-nums"
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Churn Risk</label>
              <select
                value={customerForm.churnRisk}
                onChange={(e) => setCustomerForm({ ...customerForm, churnRisk: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setEditCustomerModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveEditCustomer} className="bg-primary hover:bg-primary-hover text-white">
              Save Customer Profile
            </Button>
          </div>
        </div>
      </Modal>

      {/* 8. Delete Confirmation Dialog */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirm Customer Deletion"
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-text-muted leading-relaxed">
            Are you sure you want to permanently delete the customer profile for{' '}
            <strong className="text-text-main">{customerToDelete?.name}</strong> ({customerToDelete?.phone})?
            This will remove customer relationship data and consent logs.
          </p>
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Delete Customer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
