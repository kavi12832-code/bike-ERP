import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../../store';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { PageHeader } from '../../../components/ui/PageHeader';
import { KpiCard } from '../../../components/ui/KpiCard';
import { FilterBar } from '../../../components/ui/FilterBar';
import { StatusChip } from '../../../components/ui/StatusChip';
import {
  Building2,
  CheckCircle,
  Plus,
  Pencil,
  Trash2,
  Sparkles,
  MapPin,
  Wrench,
  Shield,
  Layers,
  ArrowRightLeft
} from 'lucide-react';
import { toast } from 'sonner';

export function BranchesPage() {
  const branches = useAppStore((state) => state.branches || []);
  const activeBranchId = useAppStore((state) => state.activeBranchId);
  const setActiveBranch = useAppStore((state) => state.setActiveBranch);
  const addBranch = useAppStore((state) => state.addBranch);
  const updateBranch = useAppStore((state) => state.updateBranch);
  const deleteBranch = useAppStore((state) => state.deleteBranch);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newBranch, setNewBranch] = useState({
    name: '',
    address: '',
    gstin: '29AAACA1234F1Z8',
    bays: 8,
    type: 'Sales & Service 3S Facility',
    isHeadquarters: false,
  });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    address: '',
    gstin: '',
    bays: 6,
    type: '',
    isHeadquarters: false,
  });

  // Plain KPI metrics
  const kpis = useMemo(() => {
    const totalHubs = branches.length;
    const totalBays = branches.reduce((sum, b) => sum + (Number(b.bays) || 0), 0);
    const hq = branches.find((b) => b.isHeadquarters)?.name || 'Bangalore Central';
    const active = branches.find((b) => b.id === activeBranchId)?.name || 'Bangalore Central';
    return {
      totalHubs,
      totalBays,
      hq,
      active,
    };
  }, [branches, activeBranchId]);

  // Filtered branches
  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        b.name?.toLowerCase().includes(q) ||
        b.address?.toLowerCase().includes(q) ||
        b.gstin?.toLowerCase().includes(q);
      const matchType = typeFilter === 'ALL' || b.type?.includes(typeFilter);
      return matchSearch && matchType;
    });
  }, [branches, search, typeFilter]);

  const handleAutoFillDemoBranch = () => {
    setNewBranch({
      name: 'AKASH Bajaj - Whitefield Experience Hub',
      address: 'Plot 44, ITPL Main Road, Whitefield, Bangalore - 560066',
      gstin: '29AAACA1234F1Z8',
      bays: 10,
      type: 'Sales & Service 3S Facility',
      isHeadquarters: false,
    });
    toast.success('Auto-filled demo branch details!');
  };

  const handleCreateBranch = () => {
    const finalName = newBranch.name.trim() || 'AKASH Bajaj - Whitefield Experience Hub';
    const finalAddress = newBranch.address.trim() || 'Plot 44, ITPL Main Road, Whitefield, Bangalore - 560066';
    if (addBranch) {
      addBranch({
        ...newBranch,
        name: finalName,
        address: finalAddress,
        bays: Number(newBranch.bays) || 4,
      });
      toast.success(`Dealership Hub "${finalName}" created successfully!`);
    }
    setAddModalOpen(false);
    setNewBranch({
      name: '',
      address: '',
      gstin: '29AAACA1234F1Z8',
      bays: 8,
      type: 'Sales & Service 3S Facility',
      isHeadquarters: false,
    });
  };

  const openEditModal = (b) => {
    setEditingBranch(b);
    setEditForm({
      name: b.name || '',
      address: b.address || '',
      gstin: b.gstin || '',
      bays: b.bays || 6,
      type: b.type || 'Sales & Service 3S Facility',
      isHeadquarters: Boolean(b.isHeadquarters),
    });
    setEditModalOpen(true);
  };

  const handleSaveEditBranch = () => {
    if (!editForm.name.trim() || !editForm.address.trim()) {
      toast.error('Branch name and address are required');
      return;
    }
    if (updateBranch && editingBranch) {
      updateBranch(editingBranch.id, {
        ...editForm,
        bays: Number(editForm.bays) || 4,
      });
      toast.success(`Branch "${editForm.name}" updated successfully!`);
    }
    setEditModalOpen(false);
  };

  const handleDeleteBranch = (b) => {
    if (b.isHeadquarters) {
      toast.error('Cannot delete the Dealership Headquarters (HQ).');
      return;
    }
    if (b.id === activeBranchId) {
      toast.error('Cannot delete the currently active session hub. Switch to another branch first.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete branch "${b.name}"?`)) {
      if (deleteBranch) {
        deleteBranch(b.id);
        toast.info(`Branch "${b.name}" deleted.`);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Administration', path: '/admin' },
          { label: 'Branch Network', path: '/branches' },
        ]}
        title="Multi-Branch Dealership Network & Hubs"
        subtitle="Unified inventory visibility, inter-branch logistics, service bay capacity, and GST compliance across Bangalore and Karnataka."
        actions={[
          {
            label: 'Add Dealership Hub',
            icon: Plus,
            variant: 'primary',
            onClick: () => setAddModalOpen(true),
          },
        ]}
      />

      {/* 2. Plain KPI Cards (Strictly no charts/arrows) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Building2}
          label="Dealership Hubs"
          value={kpis.totalHubs}
          subtitle="Active network locations"
        />
        <KpiCard
          icon={Wrench}
          label="Total Workshop Bays"
          value={kpis.totalBays}
          subtitle="Combined bay throughput"
        />
        <KpiCard
          icon={Shield}
          label="Headquarters Hub"
          value={kpis.hq}
          subtitle="Central administrative hub"
        />
        <KpiCard
          icon={MapPin}
          label="Current Session Hub"
          value={kpis.active}
          subtitle="Active operating context"
        />
      </div>

      {/* 3. Filter Bar */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search branch name, area address, or GSTIN..."
        filters={[
          {
            label: 'Facility Type',
            value: typeFilter,
            onChange: setTypeFilter,
            options: [
              { label: 'All Facility Types', value: 'ALL' },
              { label: '3S Facility (Sales & Service)', value: '3S' },
              { label: 'Experience Hub', value: 'Experience' },
              { label: 'Workshop & Spare Hub', value: 'Workshop' },
            ],
          },
        ]}
        onClear={() => {
          setSearch('');
          setTypeFilter('ALL');
        }}
      />

      {/* 4. Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredBranches.map((b) => {
          const isActive = b.id === activeBranchId;
          return (
            <Card
              key={b.id}
              className={`p-5 flex flex-col justify-between transition-all ${
                isActive ? 'border-primary ring-2 ring-primary/20 shadow-soft' : 'hover:border-border-focus'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Building2 className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-text-muted'}`} />
                    <span className="font-bold text-sm text-text-main">{b.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {b.isHeadquarters && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-status-blue">
                        HQ
                      </span>
                    )}
                    <button
                      onClick={() => openEditModal(b)}
                      className="p-1 rounded text-text-muted hover:text-primary hover:bg-surface-subtle"
                      title="Edit Branch Details"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {!b.isHeadquarters && (
                      <button
                        onClick={() => handleDeleteBranch(b)}
                        className="p-1 rounded text-text-muted hover:text-status-red hover:bg-red-50 dark:hover:bg-red-950/40"
                        title="Delete Branch"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="py-3 space-y-2 text-xs">
                  <div className="text-text-muted leading-relaxed">{b.address}</div>
                  <div className="text-[11px] font-mono text-text-main font-semibold">
                    GSTIN: {b.gstin}
                  </div>
                  <div className="pt-2 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-surface-subtle border border-border">
                      <span className="text-text-muted block">Workshop Bays:</span>
                      <strong className="text-text-main tabular-nums text-sm">{b.bays} Bays</strong>
                    </div>
                    <div className="p-2 rounded bg-surface-subtle border border-border">
                      <span className="text-text-muted block">Type:</span>
                      <strong className="text-primary truncate block">{b.type ? b.type.split(' ')[0] : 'Hub'}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-end items-center gap-2">
                {isActive ? (
                  <span className="text-xs font-bold text-status-green flex items-center gap-1.5 py-1.5">
                    <CheckCircle className="w-4 h-4" />
                    <span>Active Session Hub</span>
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setActiveBranch(b.id);
                      toast.success(`Switched active operational session to ${b.name}`);
                    }}
                  >
                    Switch to this Hub
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* 5. Add Branch Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Dealership Branch / Hub"
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
            <span className="text-[11px] text-blue-900 dark:text-blue-200 font-medium">
              Demo sample branch details:
            </span>
            <button
              type="button"
              onClick={handleAutoFillDemoBranch}
              className="px-2.5 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Autofill Sample Hub</span>
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-text-muted uppercase mb-1">
              Branch / Hub Display Name *
            </label>
            <input
              type="text"
              placeholder="e.g. AKASH Bajaj - Whitefield Experience Hub"
              value={newBranch.name}
              onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-input border border-border bg-surface text-text-main focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-text-muted uppercase mb-1">
              Complete Postal Address *
            </label>
            <textarea
              rows={2}
              placeholder="Plot No., Main Road, Suburb, Bangalore - Pincode"
              value={newBranch.address}
              onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-input border border-border bg-surface text-text-main focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-text-muted uppercase mb-1">
                State GSTIN Number *
              </label>
              <input
                type="text"
                placeholder="29AAACA1234F1Z8"
                value={newBranch.gstin}
                onChange={(e) => setNewBranch({ ...newBranch, gstin: e.target.value })}
                className="w-full px-3 py-1.5 text-xs font-mono rounded-input border border-border bg-surface text-text-main focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-muted uppercase mb-1">
                Workshop Bay Capacity *
              </label>
              <input
                type="number"
                min={1}
                max={40}
                value={newBranch.bays}
                onChange={(e) => setNewBranch({ ...newBranch, bays: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-input border border-border bg-surface text-text-main focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-text-muted uppercase mb-1">
              Facility Classification
            </label>
            <select
              value={newBranch.type}
              onChange={(e) => setNewBranch({ ...newBranch, type: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-input border border-border bg-surface text-text-main focus:ring-1 focus:ring-primary"
            >
              <option value="Sales & Service 3S Facility">Sales &amp; Service 3S Facility</option>
              <option value="Experience Hub (Showroom Only)">Experience Hub (Showroom Only)</option>
              <option value="Workshop & Spares Hub">Workshop &amp; Spares Hub</option>
              <option value="Stock Yard & PDI Hub">Stock Yard &amp; PDI Hub</option>
            </select>
          </div>

          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateBranch} className="bg-primary text-white">
              Create Dealership Hub
            </Button>
          </div>
        </div>
      </Modal>

      {/* 6. Edit Branch Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Branch: ${editingBranch?.name}`}
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-text-muted uppercase mb-1">
              Branch Name
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-input border border-border bg-surface text-text-main focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-text-muted uppercase mb-1">
              Address
            </label>
            <textarea
              rows={2}
              value={editForm.address}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-input border border-border bg-surface text-text-main focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-text-muted uppercase mb-1">
                GSTIN
              </label>
              <input
                type="text"
                value={editForm.gstin}
                onChange={(e) => setEditForm({ ...editForm, gstin: e.target.value })}
                className="w-full px-3 py-1.5 text-xs font-mono rounded-input border border-border bg-surface text-text-main focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-muted uppercase mb-1">
                Workshop Bays
              </label>
              <input
                type="number"
                min={1}
                max={40}
                value={editForm.bays}
                onChange={(e) => setEditForm({ ...editForm, bays: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-input border border-border bg-surface text-text-main focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveEditBranch} className="bg-primary text-white">
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default BranchesPage;
