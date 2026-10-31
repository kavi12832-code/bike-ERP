import React, { useState } from 'react';
import { useAppStore } from '../../../store';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import {
  Building2,
  CheckCircle,
  Plus,
  Pencil,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export function BranchesPage() {
  const branches = useAppStore((state) => state.branches || []);
  const activeBranchId = useAppStore((state) => state.activeBranchId);
  const setActiveBranch = useAppStore((state) => state.setActiveBranch);
  const addBranch = useAppStore((state) => state.addBranch);
  const updateBranch = useAppStore((state) => state.updateBranch);
  const deleteBranch = useAppStore((state) => state.deleteBranch);

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

  const handleAutoFillDemoBranch = () => {
    setNewBranch({
      name: 'AKASH Bajaj - Whitefield Hub',
      address: 'Plot 44, ITPL Main Road, Whitefield, Bangalore - 560066',
      gstin: '29AAACA1234F1Z8',
      bays: 10,
      type: 'Sales & Service 3S Facility',
      isHeadquarters: false,
    });
    toast.success('Auto-filled demo branch details!');
  };

  const handleCreateBranch = () => {
    const finalName = newBranch.name.trim() || 'AKASH Bajaj - Whitefield Hub';
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            Multi-Branch Dealership Network &amp; Hubs
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Unified inventory visibility, inter-branch logistics and performance comparison across Bangalore
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setAddModalOpen(true)}
          className="bg-primary text-white"
        >
          Add Dealership Hub
        </Button>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {branches.map((b) => {
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
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-status-blue">
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
                        className="p-1 rounded text-text-muted hover:text-status-red hover:bg-red-50"
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

      {/* Add Branch Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Dealership Branch / Hub"
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50 border border-blue-200">
            <span className="text-[11px] text-blue-900 font-medium">
              Demo sample branch details:
            </span>
            <button
              type="button"
              onClick={handleAutoFillDemoBranch}
              className="px-2.5 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Auto-Fill Demo Branch
            </button>
          </div>

          <div>
            <label className="font-semibold text-text-main block mb-1">Branch Name</label>
            <input
              type="text"
              value={newBranch.name}
              onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
              placeholder="e.g. AKASH Bajaj - Whitefield Hub"
              className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
            />
          </div>

          <div>
            <label className="font-semibold text-text-main block mb-1">Complete Address</label>
            <textarea
              rows={2}
              value={newBranch.address}
              onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
              placeholder="e.g. Plot 44, ITPL Main Road, Whitefield, Bangalore - 560066"
              className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">GSTIN</label>
              <input
                type="text"
                value={newBranch.gstin}
                onChange={(e) => setNewBranch({ ...newBranch, gstin: e.target.value.toUpperCase() })}
                placeholder="29AAACA1234F1Z8"
                className="w-full p-2.5 font-mono uppercase rounded-input border border-border bg-surface text-text-main"
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Workshop Bays</label>
              <input
                type="number"
                min={1}
                max={30}
                value={newBranch.bays}
                onChange={(e) => setNewBranch({ ...newBranch, bays: parseInt(e.target.value) || 0 })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-text-main block mb-1">Facility Type</label>
            <select
              value={newBranch.type}
              onChange={(e) => setNewBranch({ ...newBranch, type: e.target.value })}
              className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
            >
              <option value="Sales & Service 3S Facility">Sales &amp; Service 3S Facility</option>
              <option value="Authorized Workshop (Service Only)">Authorized Workshop (Service Only)</option>
              <option value="Showroom & Boutique (Sales Only)">Showroom &amp; Boutique (Sales Only)</option>
              <option value="Spares Distribution Hub">Spares Distribution Hub</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateBranch} className="bg-primary text-white">
              Create Dealership Hub
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Branch Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Dealership Branch Details"
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-text-main block mb-1">Branch Name</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
            />
          </div>

          <div>
            <label className="font-semibold text-text-main block mb-1">Complete Address</label>
            <textarea
              rows={2}
              value={editForm.address}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">GSTIN</label>
              <input
                type="text"
                value={editForm.gstin}
                onChange={(e) => setEditForm({ ...editForm, gstin: e.target.value.toUpperCase() })}
                className="w-full p-2.5 font-mono uppercase rounded-input border border-border bg-surface text-text-main"
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Workshop Bays</label>
              <input
                type="number"
                min={1}
                max={30}
                value={editForm.bays}
                onChange={(e) => setEditForm({ ...editForm, bays: parseInt(e.target.value) || 0 })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-text-main block mb-1">Facility Type</label>
            <select
              value={editForm.type}
              onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
              className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
            >
              <option value="Sales & Service 3S Facility">Sales &amp; Service 3S Facility</option>
              <option value="Authorized Workshop (Service Only)">Authorized Workshop (Service Only)</option>
              <option value="Showroom & Boutique (Sales Only)">Showroom &amp; Boutique (Sales Only)</option>
              <option value="Spares Distribution Hub">Spares Distribution Hub</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveEditBranch} className="bg-primary text-white">
              Save Branch Details
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
export default BranchesPage;
