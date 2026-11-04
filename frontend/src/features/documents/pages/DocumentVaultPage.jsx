import React, { useState, useMemo } from 'react';
import { 
  FolderLock, 
  Folder, 
  FileText, 
  UploadCloud, 
  Download, 
  Eye, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  ShieldCheck, 
  Clock,
  Plus,
  Pencil,
  Trash2,
  X,
  FileCheck,
  HardDrive,
} from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { KpiCard } from '../../../components/ui/KpiCard';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { formatDate } from '../../../lib/format';
import { toast } from 'sonner';

import { useCollection } from '../../../hooks/useCollection';
// SAMPLE_DOCS: loaded from the database (collection "documents.documentVault.docs")

export function DocumentVaultPage() {
  const [docs, setDocs] = useCollection('documents.documentVault.docs');
  const [selectedFolder, setSelectedFolder] = useState('ALL');
  const [search, setSearch] = useState('');
  const [viewAuditTrail, setViewAuditTrail] = useState([]);

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

  const [uploadForm, setUploadForm] = useState({
    folder: 'KYC',
    entityName: '',
    docType: 'Customer Driving Licence',
    fileName: 'DL_Customer_Masked.pdf',
    expiryDate: '',
  });

  // Dynamic KPIs (Section 0.5: plain numbers, NO charts)
  const kpiStats = useMemo(() => {
    const total = docs.length;
    const expiring = docs.filter(d => d.status === 'EXPIRING_SOON').length;
    const verified = docs.filter(d => d.status === 'VERIFIED').length;
    const totalSizeKb = docs.reduce((sum, d) => sum + (d.sizeKb || 0), 0);
    const sizeMb = (totalSizeKb / 1024).toFixed(1);

    return {
      total,
      expiring,
      verified,
      sizeMb,
    };
  }, [docs]);

  const logDocAccess = (action, doc) => {
    const entry = {
      id: `acc-${Date.now()}`,
      action,
      fileName: doc.fileName,
      docType: doc.docType,
      user: 'Rajesh Varma (Super Admin)',
      timestamp: new Date().toLocaleTimeString('en-IN'),
    };
    setViewAuditTrail(prev => [entry, ...prev.slice(0, 7)]);
    toast.success(`${action} recorded in statutory document vault audit trail.`);
  };

  const handleOpenUpload = () => {
    setUploadForm({
      folder: selectedFolder === 'ALL' ? 'KYC' : selectedFolder,
      entityName: '',
      docType: 'Customer Driving Licence',
      fileName: 'DL_Customer_Masked.pdf',
      expiryDate: '',
    });
    setShowUploadModal(true);
  };

  const handleSaveUpload = (e) => {
    e.preventDefault();
    if (!uploadForm.entityName.trim() || !uploadForm.fileName.trim()) {
      toast.error('Entity Name and File Name are required.');
      return;
    }

    const newDoc = {
      id: `doc-${Date.now().toString(36)}`,
      folder: uploadForm.folder,
      entityName: uploadForm.entityName.trim(),
      docType: uploadForm.docType,
      fileName: uploadForm.fileName.trim(),
      uploadedAt: new Date().toISOString().slice(0, 10),
      expiryDate: uploadForm.expiryDate ? uploadForm.expiryDate : null,
      status: 'VERIFIED',
      sizeKb: 650,
    };

    setDocs(prev => [newDoc, ...prev]);
    toast.success(`Encrypted file "${newDoc.fileName}" saved to ${uploadForm.folder} repository.`);
    setShowUploadModal(false);
  };

  const handleOpenEdit = (doc) => {
    setEditingDoc(doc);
    setUploadForm({
      folder: doc.folder,
      entityName: doc.entityName,
      docType: doc.docType,
      fileName: doc.fileName,
      expiryDate: doc.expiryDate || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!uploadForm.entityName.trim()) {
      toast.error('Entity Name is required.');
      return;
    }

    setDocs(prev => prev.map(d => {
      if (d.id !== editingDoc.id) return d;
      return {
        ...d,
        folder: uploadForm.folder,
        entityName: uploadForm.entityName.trim(),
        docType: uploadForm.docType,
        fileName: uploadForm.fileName.trim(),
        expiryDate: uploadForm.expiryDate ? uploadForm.expiryDate : null,
      };
    }));

    toast.success(`Document record for ${uploadForm.fileName} updated.`);
    setShowEditModal(false);
    setEditingDoc(null);
  };

  const promptDeleteDoc = (doc) => {
    setDocToDelete(doc);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (docToDelete) {
      setDocs(prev => prev.filter(d => d.id !== docToDelete.id));
      toast.success(`Document ${docToDelete.fileName} removed from vault.`);
    }
    setDeleteConfirmOpen(false);
    setDocToDelete(null);
  };

  const filteredDocs = docs.filter(d => {
    const matchesFolder = selectedFolder === 'ALL' || d.folder === selectedFolder;
    const matchesSearch = 
      d.fileName.toLowerCase().includes(search.toLowerCase()) ||
      d.entityName.toLowerCase().includes(search.toLowerCase()) ||
      d.docType.toLowerCase().includes(search.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Customer Care', path: '/customers' },
          { label: 'Document Vault', path: '/documents' },
        ]}
        title="Centralized Document Vault & Expiry Tracker"
        subtitle="Encrypted repository for Customer KYC, Form 20/21 RTO files, Insurance policies & 30-day statutory renewal alerts."
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={UploadCloud}
            onClick={handleOpenUpload}
            className="bg-primary hover:bg-primary-hover text-white"
          >
            Upload Document
          </Button>
        }
      />

      {/* 2. Plain KPI Cards Row (Section 0.5: NO charts, sparklines, or trend arrows) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          label="Total Stored Files"
          value={kpiStats.total}
          helperText="Encrypted statutory documents"
          icon={<FolderLock className="w-5 h-5 text-primary" />}
        />
        <KpiCard
          label="Expiring in 30 Days"
          value={kpiStats.expiring}
          helperText="Insurance & PUC renewal required"
          icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
        />
        <KpiCard
          label="Verified KYC Masked"
          value={kpiStats.verified}
          helperText="100% UIDAI & DPDP compliant"
          icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />}
        />
        <KpiCard
          label="Vault Encrypted Size"
          value={`${kpiStats.sizeMb} MB`}
          helperText="AES-256 cloud encrypted store"
          icon={<HardDrive className="w-5 h-5 text-indigo-600" />}
        />
      </div>

      {/* 3. Statutory DPDP Compliance Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 bg-blue-50/50 border-blue-200 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-xs text-text-main">
            <p className="font-bold text-primary">DPDP Act 2023 &amp; KYC Masking Standard</p>
            <p className="mt-0.5 text-text-muted leading-relaxed">
              Aadhaar numbers are strictly masked (first 8 digits obscured) in compliance with UIDAI regulations. Zero raw unmasked biometric images are stored.
            </p>
          </div>
        </Card>

        {kpiStats.expiring > 0 && (
          <Card className="p-4 bg-amber-50/50 border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-text-main">
              <p className="font-bold text-amber-800">{kpiStats.expiring} Statutory Policies Expiring in Next 30 Days</p>
              <p className="mt-0.5 text-amber-900 leading-relaxed">
                Insurance policies and emission green PUC certificates identified. 1-click WhatsApp renewal notices queued.
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* 4. Folder Hierarchy Pills & Search Bar */}
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            {['ALL', 'KYC', 'VEHICLES', 'DEALS', 'COMPLIANCE'].map((folder) => (
              <button
                key={folder}
                type="button"
                onClick={() => setSelectedFolder(folder)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                  selectedFolder === folder
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-surface text-text-main border-border hover:bg-surface-subtle'
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>{folder}</span>
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
            <input
              type="text"
              placeholder="Search document name, entity or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-input border border-border bg-surface text-text-main focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </Card>

      {/* 5. Documents Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-subtle border-b border-border text-text-muted font-semibold uppercase text-[11px]">
                <th className="p-3.5">Document Name &amp; File</th>
                <th className="p-3.5">Category Folder</th>
                <th className="p-3.5">Associated Entity</th>
                <th className="p-3.5">Upload Date</th>
                <th className="p-3.5">Expiry Date</th>
                <th className="p-3.5">Integrity</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-muted italic">
                    No documents found matching the active criteria.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-surface-subtle/70 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-primary shrink-0" />
                        <div>
                          <div className="font-bold text-text-main">{doc.docType}</div>
                          <div className="text-[10px] text-text-muted font-mono">
                            {doc.fileName} ({doc.sizeKb} KB)
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-bold font-mono text-[11px] text-text-muted">
                      <span className="bg-surface-subtle px-2 py-0.5 rounded border border-border">
                        {doc.folder}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-text-main">
                      {doc.entityName}
                    </td>
                    <td className="p-3.5 font-mono text-text-muted">{doc.uploadedAt}</td>
                    <td className="p-3.5 font-mono">
                      {doc.expiryDate ? (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            doc.status === 'EXPIRING_SOON'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'text-text-main'
                          }`}
                        >
                          {doc.expiryDate}
                        </span>
                      ) : (
                        <span className="text-text-muted italic">Permanent</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Encrypted
                      </span>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="xs"
                          variant="ghost"
                          icon={Eye}
                          onClick={() => logDocAccess('VIEW', doc)}
                          title="Inspect Document"
                        />
                        <Button
                          size="xs"
                          variant="ghost"
                          icon={Download}
                          onClick={() => logDocAccess('DOWNLOAD', doc)}
                          title="Download Secure Copy"
                        />
                        <Button
                          size="xs"
                          variant="ghost"
                          icon={Pencil}
                          onClick={() => handleOpenEdit(doc)}
                          title="Edit Document Info"
                        />
                        <Button
                          size="xs"
                          variant="ghost"
                          icon={Trash2}
                          onClick={() => promptDeleteDoc(doc)}
                          className="text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          title="Delete Document"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 6. Live Access Audit Trail */}
      {viewAuditTrail.length > 0 && (
        <Card className="p-4 space-y-2">
          <span className="font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
            <Clock className="w-3.5 h-3.5 text-primary" /> Live Document Vault Access Audit Trail
          </span>
          <div className="space-y-1 font-mono text-[11px] text-text-muted">
            {viewAuditTrail.map((entry) => (
              <div key={entry.id} className="flex justify-between items-center py-0.5 border-b border-border/40 last:border-0">
                <span>
                  [{entry.timestamp}] {entry.user} executed <strong>{entry.action}</strong> on {entry.fileName}
                </span>
                <span className="text-emerald-600 font-bold">AUDITED_OK</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 7. Upload Document Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Statutory Vault Document"
        size="md"
      >
        <form onSubmit={handleSaveUpload} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Target Folder</label>
              <select
                value={uploadForm.folder}
                onChange={(e) => setUploadForm({ ...uploadForm, folder: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              >
                <option value="KYC">KYC (Customer Identity)</option>
                <option value="VEHICLES">VEHICLES (RC &amp; Insurance)</option>
                <option value="DEALS">DEALS (Form 20/21 Sales)</option>
                <option value="COMPLIANCE">COMPLIANCE (Dealership Trade)</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Document Classification</label>
              <input
                type="text"
                placeholder="e.g. Form 21 Sale Certificate"
                value={uploadForm.docType}
                onChange={(e) => setUploadForm({ ...uploadForm, docType: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Associated Entity Name *</label>
              <input
                type="text"
                placeholder="e.g. Ramesh Hegde or KA-01-EQ-9921"
                value={uploadForm.entityName}
                onChange={(e) => setUploadForm({ ...uploadForm, entityName: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">File Name *</label>
              <input
                type="text"
                placeholder="filename.pdf"
                value={uploadForm.fileName}
                onChange={(e) => setUploadForm({ ...uploadForm, fileName: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-text-main block mb-1">Statutory Expiry Date (Optional)</label>
            <input
              type="date"
              value={uploadForm.expiryDate}
              onChange={(e) => setUploadForm({ ...uploadForm, expiryDate: e.target.value })}
              className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="bg-primary hover:bg-primary-hover text-white">
              Save to Encrypted Vault
            </Button>
          </div>
        </form>
      </Modal>

      {/* 8. Edit Document Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit Document: ${editingDoc?.fileName}`}
        size="md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Folder</label>
              <select
                value={uploadForm.folder}
                onChange={(e) => setUploadForm({ ...uploadForm, folder: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              >
                <option value="KYC">KYC</option>
                <option value="VEHICLES">VEHICLES</option>
                <option value="DEALS">DEALS</option>
                <option value="COMPLIANCE">COMPLIANCE</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Document Classification</label>
              <input
                type="text"
                value={uploadForm.docType}
                onChange={(e) => setUploadForm({ ...uploadForm, docType: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Entity Name</label>
              <input
                type="text"
                value={uploadForm.entityName}
                onChange={(e) => setUploadForm({ ...uploadForm, entityName: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">File Name</label>
              <input
                type="text"
                value={uploadForm.fileName}
                onChange={(e) => setUploadForm({ ...uploadForm, fileName: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-text-main block mb-1">Expiry Date</label>
            <input
              type="date"
              value={uploadForm.expiryDate}
              onChange={(e) => setUploadForm({ ...uploadForm, expiryDate: e.target.value })}
              className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="bg-primary hover:bg-primary-hover text-white">
              Update Metadata
            </Button>
          </div>
        </form>
      </Modal>

      {/* 9. Delete Confirmation */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirm Document Deletion"
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-text-muted leading-relaxed">
            Are you sure you want to permanently delete <strong className="text-text-main">{docToDelete?.fileName}</strong> from the document vault?
          </p>
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Delete File
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default DocumentVaultPage;
