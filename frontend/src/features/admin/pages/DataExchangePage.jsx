// src/features/admin/pages/DataExchangePage.jsx
/**
 * Data Exchange Center (Import & Export Center)
 * Enterprise-grade client-side Data Hub with Import Wizard, Validation Engine,
 * Atomic Store Commits, 24h Undo, PII Masking, Approvals, Integrations & Scheduled Jobs.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpDown,
  UploadCloud,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Clock,
  Sparkles,
  Eye,
  Filter,
  Check,
  Calendar,
  Layers,
  Database,
  Search,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  FileText,
  Lock,
  ExternalLink,
  Info,
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

import { useAppStore } from '../../../store';
import { hasPermission } from '../../../lib/rbac';
import { PERMISSIONS } from '../../../config/permissions';
import { IMPORT_SCHEMAS, MODULE_OPTIONS } from '../../../config/importSchemas';
import { autoMapHeaders, mapRawRows } from '../utils/dataMapper';
import { parseFile, computeFileHash } from '../utils/fileParser';
import { validateDataChunked, generateErrorReportCsv } from '../utils/dataValidator';

export function DataExchangePage() {
  const navigate = useNavigate();
  const store = useAppStore();
  const {
    currentUser,
    branches = [],
    customers = [],
    vehicleStock = [],
    leads = [],
    partsStock = [],
    invoices = [],
    bikeModels = [],
    staffUsers = [],
    importHistory = [],
    exportHistory = [],
    scheduledJobs = [],
    syncIntegrations = [],
    lastImportMappings = {},
    commitImport,
    undoImport,
    addExportHistory,
    requestExportApproval,
    addScheduledJob,
    updateScheduledJob,
    deleteScheduledJob,
    toggleScheduledJob,
    triggerSyncIntegration,
  } = store;

  // Permissions check
  const canImport = useMemo(() => {
    if (currentUser?.role === 'Technician') return false;
    // Check if user has any import permission or super_admin
    return (
      currentUser?.role === 'Super Admin' ||
      hasPermission(currentUser, PERMISSIONS.IMPORT_CUSTOMERS) ||
      hasPermission(currentUser, PERMISSIONS.IMPORT_LEADS) ||
      hasPermission(currentUser, PERMISSIONS.IMPORT_PARTS) ||
      hasPermission(currentUser, PERMISSIONS.IMPORT_VEHICLES)
    );
  }, [currentUser]);

  const canExport = useMemo(() => {
    if (currentUser?.role === 'Technician') return false;
    return (
      currentUser?.role === 'Super Admin' ||
      hasPermission(currentUser, PERMISSIONS.EXPORT_LEADS) ||
      hasPermission(currentUser, PERMISSIONS.EXPORT_CUSTOMERS) ||
      hasPermission(currentUser, PERMISSIONS.EXPORT_PARTS) ||
      hasPermission(currentUser, PERMISSIONS.EXPORT_VEHICLES) ||
      hasPermission(currentUser, PERMISSIONS.EXPORT_INVOICES)
    );
  }, [currentUser]);

  // Main active tab: 'import' | 'export' | 'sync' | 'scheduled'
  const [activeTab, setActiveTab] = useState(canImport ? 'import' : 'export');

  // References
  const historyRef = useRef(null);
  const fileInputRef = useRef(null);

  // -------------------------------------------------------------
  // IMPORT WIZARD STATE
  // -------------------------------------------------------------
  const [selectedModuleId, setSelectedModuleId] = useState('customers');
  const [wizardStep, setWizardStep] = useState(1); // 1: Upload, 2: Map, 3: Validate, 4: Done/Result

  // Step 1: Upload state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileHash, setFileHash] = useState('');
  const [parsedHeaders, setParsedHeaders] = useState([]);
  const [rawRows, setRawRows] = useState([]);
  const [isParsing, setIsParsing] = useState(false);
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheetIndex, setSelectedSheetIndex] = useState(0);

  // Step 2: Mapping state
  const [fieldMapping, setFieldMapping] = useState({}); // { sourceHeader: { targetKey, confidence, score } }
  const [showLivePreview, setShowLivePreview] = useState(false);

  // Step 3: Validation state
  const [isValidating, setIsValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const [validationResults, setValidationResults] = useState(null);
  const [duplicateStrategy, setDuplicateStrategy] = useState('UPDATE'); // 'SKIP' | 'UPDATE' | 'CREATE'

  // Step 4: Import confirmation & commit
  const [importConfirmOpen, setImportConfirmOpen] = useState(false);
  const [dpdpConsentChecked, setDpdpConsentChecked] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState(null);

  // Drawers & Modals
  const [viewErrorsModalOpen, setViewErrorsModalOpen] = useState(false);
  const [errorSearchQuery, setErrorSearchQuery] = useState('');
  const [errorSeverityFilter, setErrorSeverityFilter] = useState('ALL');
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [historyRangeFilter, setHistoryRangeFilter] = useState('Last 30 Days');

  // Schema config for current module
  const currentSchema = useMemo(() => {
    return IMPORT_SCHEMAS[selectedModuleId] || IMPORT_SCHEMAS.customers;
  }, [selectedModuleId]);

  // Existing records in store for current module
  const currentStoreRecords = useMemo(() => {
    switch (selectedModuleId) {
      case 'customers': return customers;
      case 'vehicles': return vehicleStock;
      case 'leads': return leads;
      case 'parts': return partsStock;
      case 'models': return bikeModels;
      case 'staff': return staffUsers;
      default: return [];
    }
  }, [selectedModuleId, customers, vehicleStock, leads, partsStock, bikeModels, staffUsers]);

  // -------------------------------------------------------------
  // COMPUTED KPI METRICS (Dynamic from store)
  // -------------------------------------------------------------
  const kpiMetrics = useMemo(() => {
    const list = importHistory || [];
    const totalImports = list.length;
    const successfulImports = list.filter((i) => i.status === 'Completed' || i.status === 'Completed with warnings').length;
    const failedImports = list.filter((i) => i.status === 'Failed').length;
    const successRate = totalImports > 0 ? Math.round((successfulImports / totalImports) * 100) : 100;

    // Find last import
    const lastItem = list[0];
    const lastImportTime = lastItem?.displayTime || 'Today, 11:45 AM';
    const lastImportModule = lastItem?.module ? `${lastItem.module} Data` : 'Customer Data';

    // Sparkline mock data based on recent trend
    const sparklineTotal = [
      { v: 12 }, { v: 16 }, { v: 14 }, { v: 19 }, { v: 22 }, { v: totalImports || 24 }
    ];
    const sparklineSuccess = [
      { v: 10 }, { v: 15 }, { v: 13 }, { v: 18 }, { v: 20 }, { v: successfulImports || 22 }
    ];
    const sparklineFailed = [
      { v: 1 }, { v: 0 }, { v: 2 }, { v: 1 }, { v: 3 }, { v: failedImports || 2 }
    ];

    return {
      totalImports,
      successfulImports,
      failedImports,
      successRate,
      lastImportTime,
      lastImportModule,
      sparklineTotal,
      sparklineSuccess,
      sparklineFailed,
    };
  }, [importHistory]);

  // Last Sync time across system
  const lastSyncTimeFormatted = useMemo(() => {
    const lastImp = importHistory[0]?.displayTime;
    const lastExp = exportHistory[0]?.displayTime;
    return lastImp || lastExp || '30 Oct 2026, 11:45 AM';
  }, [importHistory, exportHistory]);

  // -------------------------------------------------------------
  // FILE UPLOAD & PARSING (Step 1)
  // -------------------------------------------------------------
  const handleFileSelected = async (file) => {
    if (!file) return;

    setIsParsing(true);
    try {
      // 1. Compute hash to detect duplicates
      const hash = await computeFileHash(file);
      setFileHash(hash);

      const alreadyImported = importHistory.find((h) => h.fileHash === hash && h.status === 'Completed');
      if (alreadyImported) {
        toast.warning(`Note: A file with identical content was already imported on ${alreadyImported.displayTime}.`);
      }

      // 2. Parse file
      const result = await parseFile(file, { selectedSheetIndex });
      setUploadedFile(file);
      setParsedHeaders(result.headers);
      setRawRows(result.rows);
      setSheetNames(result.sheetNames || ['Default']);

      // 3. Auto-map headers immediately using schema and remembered mappings
      const remembered = lastImportMappings[selectedModuleId] || null;
      const initialMapping = autoMapHeaders(result.headers, currentSchema.fields, remembered);
      setFieldMapping(initialMapping);

      setWizardStep(2);
      toast.success(`File "${file.name}" loaded: ${result.rows.length.toLocaleString()} records detected.`);
    } catch (err) {
      toast.error(err.message || 'Failed to parse file.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelected(file);
  };

  const handleDownloadSampleTemplate = () => {
    const schema = currentSchema;
    const headerRow = schema.fields.map((f) => f.label).join(',');
    const sampleRow = schema.fields.map((f) => {
      const val = schema.sampleRow[f.key] ?? '';
      return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
    }).join(',');

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + `${headerRow}\n${sampleRow}\n`;
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `${schema.id}_Sample_Template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloaded ${schema.label} sample template.`);
  };

  // -------------------------------------------------------------
  // FIELD MAPPING (Step 2)
  // -------------------------------------------------------------
  const handleAutoMapClick = () => {
    const newMapping = autoMapHeaders(parsedHeaders, currentSchema.fields);
    setFieldMapping(newMapping);
    toast.success('Auto-mapped source columns to schema fields.');
  };

  const handleTargetFieldChange = (sourceHeader, newTargetKey) => {
    setFieldMapping((prev) => ({
      ...prev,
      [sourceHeader]: {
        targetKey: newTargetKey,
        confidence: newTargetKey === '__IGNORE__' ? 'NONE' : 'HIGH',
        score: 1.0,
      },
    }));
  };

  // Check whether all required schema fields are mapped
  const missingRequiredFields = useMemo(() => {
    const mappedTargetKeys = new Set(
      Object.values(fieldMapping)
        .map((m) => (typeof m === 'string' ? m : m?.targetKey))
        .filter((k) => k && k !== '__IGNORE__')
    );
    return currentSchema.fields.filter((f) => f.required && !mappedTargetKeys.has(f.key));
  }, [fieldMapping, currentSchema]);

  // Live Preview Rows (First 20 mapped rows)
  const previewMappedRows = useMemo(() => {
    if (!rawRows.length) return [];
    return mapRawRows(rawRows.slice(0, 20), fieldMapping, currentSchema);
  }, [rawRows, fieldMapping, currentSchema]);

  // -------------------------------------------------------------
  // VALIDATION ENGINE (Step 3)
  // -------------------------------------------------------------
  const handleRunValidation = async () => {
    if (missingRequiredFields.length > 0) {
      toast.error(`Please map required fields: ${missingRequiredFields.map((f) => f.label).join(', ')}`);
      return;
    }

    setIsValidating(true);
    setValidationProgress(10);

    try {
      // 1. Map all rows through the field mapping
      const allMappedRows = mapRawRows(rawRows, fieldMapping, currentSchema);

      // 2. Run chunked validation
      const results = await validateDataChunked(
        allMappedRows,
        currentSchema,
        {
          existingRecords: currentStoreRecords,
          branches,
          duplicateStrategy,
        },
        (progress) => {
          setValidationProgress(progress);
        }
      );

      setValidationResults(results);
      setWizardStep(3);

      if (results.errorCount === 0) {
        toast.success(`Validation passed! All ${results.validCount.toLocaleString()} records are valid.`);
      } else {
        toast.warning(`Validation completed: ${results.errorCount} errors found.`);
      }
    } catch (err) {
      toast.error(`Validation failed: ${err.message}`);
    } finally {
      setIsValidating(false);
    }
  };

  const handleDownloadErrorReport = () => {
    if (!validationResults || !validationResults.errors.length) {
      toast.info('No errors to download.');
      return;
    }
    const csvStr = generateErrorReportCsv(validationResults.errors, rawRows, parsedHeaders);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedModuleId}_Validation_Errors.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloaded error report CSV.');
  };

  // -------------------------------------------------------------
  // ATOMIC STORE COMMIT (Step 4)
  // -------------------------------------------------------------
  const handleProceedToImport = () => {
    if (!validationResults || validationResults.validCount === 0) {
      toast.error('No valid records to import.');
      return;
    }
    setDpdpConsentChecked(false);
    setImportConfirmOpen(true);
  };

  const handleConfirmImport = async () => {
    if (selectedModuleId === 'customers' && !dpdpConsentChecked) {
      toast.error('DPDP consent confirmation is mandatory for importing customer records.');
      return;
    }

    setImportConfirmOpen(false);
    setIsImporting(true);
    setImportProgress(20);

    const startTime = performance.now();

    try {
      // Simulate progress ticks
      setImportProgress(60);
      await new Promise((r) => setTimeout(r, 400));
      setImportProgress(90);

      // Prepare mapping snapshot
      const mappingSnapshot = {};
      Object.entries(fieldMapping).forEach(([src, info]) => {
        const tgt = typeof info === 'string' ? info : info?.targetKey;
        if (tgt && tgt !== '__IGNORE__') mappingSnapshot[src] = tgt;
      });

      const durationMs = performance.now() - startTime;
      const durationStr = `${(durationMs / 1000).toFixed(1)}s`;

      // Commit to store atomically
      const resultEntry = commitImport({
        moduleId: selectedModuleId,
        validRows: validationResults.validRows,
        duplicateStrategy,
        mappingSnapshot,
        fileName: uploadedFile?.name || `${selectedModuleId}_Data.csv`,
        fileSize: uploadedFile ? `${(uploadedFile.size / 1024).toFixed(0)} KB` : '120 KB',
        fileHash,
        duration: durationStr,
      });

      setImportProgress(100);
      setImportResult(resultEntry);
      setWizardStep(4);
      toast.success(`Successfully imported ${resultEntry.importedRecords} records into ${currentSchema.label}!`);
    } catch (err) {
      toast.error(`Import failed: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  // -------------------------------------------------------------
  // UNDO IMPORT (24h Window)
  // -------------------------------------------------------------
  const handleUndoImport = (importId) => {
    try {
      undoImport(importId);
      toast.success(`Successfully undone import ${importId}. Store restored.`);
      if (selectedHistoryItem?.id === importId) {
        setSelectedHistoryItem((prev) => ({ ...prev, status: 'Undone', undoAvailable: false }));
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // -------------------------------------------------------------
  // EXPORT TAB STATE & HANDLERS
  // -------------------------------------------------------------
  const [exportModule, setExportModule] = useState('customers');
  const [exportBranch, setExportBranch] = useState('all');
  const [exportFormat, setExportFormat] = useState('CSV'); // 'CSV' | 'XLSX' | 'JSON'
  const [exportDateRange, setExportDateRange] = useState('All Time');
  const [maskPersonalData, setMaskPersonalData] = useState(true);
  const [exportColumns, setExportColumns] = useState({});

  // Reset export columns when module changes
  useEffect(() => {
    const schema = IMPORT_SCHEMAS[exportModule] || IMPORT_SCHEMAS.customers;
    const initial = {};
    schema.fields.forEach((f) => {
      initial[f.key] = true;
    });
    setExportColumns(initial);
  }, [exportModule]);

  // Compute records matching export criteria
  const exportMatchingRecords = useMemo(() => {
    let list = [];
    switch (exportModule) {
      case 'customers': list = customers; break;
      case 'vehicles': list = vehicleStock; break;
      case 'leads': list = leads; break;
      case 'parts': list = partsStock; break;
      case 'invoices': list = invoices; break;
      default: list = [];
    }

    if (exportBranch !== 'all') {
      list = list.filter((r) => r.branchId === exportBranch || r.branch === exportBranch);
    }
    return list;
  }, [exportModule, exportBranch, customers, vehicleStock, leads, partsStock, invoices]);

  const handleTriggerExport = () => {
    const count = exportMatchingRecords.length;

    // Check DPDP approval rule:
    // If exporting customers with unmasked PII OR > 1,000 records
    if (exportModule === 'customers' && (!maskPersonalData || count > 1000)) {
      requestExportApproval({
        module: 'Customers',
        recordCount: count,
        unmasked: !maskPersonalData,
        reason: !maskPersonalData
          ? 'Unmasked customer PII export requested under DPDP oversight.'
          : 'Bulk customer export exceeding 1,000 records limit.',
      });
      toast.info(
        'Export request submitted to Approvals Center! Once approved by your manager, the download will unlock.'
      );
      return;
    }

    // Direct export
    const activeBranchCode = branches.find((b) => b.id === exportBranch)?.code || 'blr-main';
    const todayStr = new Date().toISOString().split('T')[0];
    const fileName = `bike-erp_${exportModule}_${todayStr}_${activeBranchCode}.${exportFormat.toLowerCase()}`;

    // Apply masking if enabled
    const maskedRecords = exportMatchingRecords.map((item) => {
      const copy = { ...item };
      if (maskPersonalData) {
        if (copy.phone) {
          const p = String(copy.phone);
          copy.phone = p.length >= 10 ? `${p.slice(0, 2)}****${p.slice(-4)}` : '****';
        }
        if (copy.email) {
          const [u, d] = String(copy.email).split('@');
          copy.email = u ? `${u[0]}***@${d || 'email.com'}` : '***@email.com';
        }
        if (copy.address) {
          copy.address = '[MASKED - DPDP]';
        }
      }
      return copy;
    });

    // Generate output
    if (exportFormat === 'JSON') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(maskedRecords, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', fileName);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      // CSV format
      const activeKeys = Object.keys(exportColumns).filter((k) => exportColumns[k]);
      const csvHeader = activeKeys.join(',');
      const csvRows = maskedRecords.map((r) =>
        activeKeys.map((k) => {
          const val = r[k] ?? '';
          return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
        }).join(',')
      );
      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [csvHeader, ...csvRows].join('\r\n');
      const encoded = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encoded);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // Log to Export History & Audit
    addExportHistory({
      module: exportModule.charAt(0).toUpperCase() + exportModule.slice(1),
      fileName,
      format: exportFormat,
      recordCount: count,
      branch: 'Bangalore Central Flagship',
      user: currentUser?.name || 'Super Admin',
      masked: maskPersonalData,
      fileSize: `${Math.round(count * 0.12) + 15} KB`,
    });

    toast.success(`Exported ${count.toLocaleString()} records as ${fileName}`);
  };

  // -------------------------------------------------------------
  // SCHEDULED JOBS BACKGROUND TICKER (Simulated)
  // -------------------------------------------------------------
  const [newJobModalOpen, setNewJobModalOpen] = useState(false);
  const [newJobForm, setNewJobForm] = useState({
    name: '',
    module: 'Vehicles',
    type: 'Export',
    frequency: 'Daily',
    time: '08:00 AM',
    format: 'XLSX',
    destination: 'Email',
    destinationTarget: 'ops@akashbajaj.com',
  });

  useEffect(() => {
    // 30-second heartbeat to trigger due jobs
    const timer = setInterval(() => {
      const activeJobs = scheduledJobs.filter((j) => j.status === 'Active');
      if (activeJobs.length > 0) {
        // Lightly simulate tick
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [scheduledJobs]);

  const handleCreateScheduledJob = () => {
    if (!newJobForm.name.trim()) {
      toast.error('Please enter a job name.');
      return;
    }
    addScheduledJob(newJobForm);
    setNewJobModalOpen(false);
    toast.success(`Scheduled job "${newJobForm.name}" created successfully.`);
    setNewJobForm({
      name: '',
      module: 'Vehicles',
      type: 'Export',
      frequency: 'Daily',
      time: '08:00 AM',
      format: 'XLSX',
      destination: 'Email',
      destinationTarget: 'ops@akashbajaj.com',
    });
  };

  // -------------------------------------------------------------
  // FILTERED IMPORT HISTORY
  // -------------------------------------------------------------
  const filteredHistory = useMemo(() => {
    let list = importHistory || [];
    if (historyRangeFilter === 'Today') {
      list = list.filter((item) => (item.displayTime || '').includes('Today') || (item.displayTime || '').includes('30 Oct'));
    } else if (historyRangeFilter === 'Last 7 Days') {
      list = list.slice(0, 10);
    } else if (historyRangeFilter === 'Failed Only') {
      list = list.filter((item) => item.status === 'Failed');
    }
    return list;
  }, [importHistory, historyRangeFilter]);

  // Smooth scroll to history table
  const scrollToHistory = () => {
    historyRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm flex items-center justify-center">
            <ArrowUpDown className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Data Exchange Center
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Import or Export data across modules — quickly, securely and reliably.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-lg px-3 py-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Last Sync: {lastSyncTimeFormatted}</span>
          </div>

          <button
            onClick={scrollToHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-xs"
          >
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>View History</span>
          </button>
        </div>
      </div>

      {/* 2. PILL-STYLE TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
        <button
          onClick={() => setActiveTab('import')}
          disabled={!canImport}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'import'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          } ${!canImport ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Import Data</span>
        </button>

        <button
          onClick={() => setActiveTab('export')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'export'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Export Data</span>
        </button>

        <button
          onClick={() => setActiveTab('sync')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'sync'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Sync Status</span>
        </button>

        <button
          onClick={() => setActiveTab('scheduled')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'scheduled'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Scheduled Jobs</span>
        </button>
      </div>

      {/* 3. FOUR KPI CARDS (Computed from store) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Imports */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Imports</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  {kpiMetrics.totalImports}
                </span>
                <span className="text-xs font-bold text-emerald-600">↑ 12%</span>
              </div>
              <p className="text-[11px] text-slate-400">This Month</p>
            </div>
          </div>
          <div className="w-16 h-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={kpiMetrics.sparklineTotal}>
                <Area type="monotone" dataKey="v" stroke="#3b82f6" fill="#93c5fd" fillOpacity={0.3} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Successful Imports */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Successful Imports</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  {kpiMetrics.successfulImports}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">{kpiMetrics.successRate}% Success Rate</p>
            </div>
          </div>
          <div className="w-16 h-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={kpiMetrics.sparklineSuccess}>
                <Area type="monotone" dataKey="v" stroke="#10b981" fill="#a7f3d0" fillOpacity={0.3} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 3: Failed Imports */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Failed Imports</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  {kpiMetrics.failedImports}
                </span>
              </div>
              <button
                onClick={() => {
                  setHistoryRangeFilter('Failed Only');
                  scrollToHistory();
                }}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                View Details →
              </button>
            </div>
          </div>
          <div className="w-16 h-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={kpiMetrics.sparklineFailed}>
                <Area type="monotone" dataKey="v" stroke="#f43f5e" fill="#fecdd3" fillOpacity={0.3} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 4: Last Import */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Last Import</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {kpiMetrics.lastImportTime}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">{kpiMetrics.lastImportModule}</p>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-500">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: IMPORT DATA WORKSPACE */}
      {/* ========================================================= */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          {/* STEPPER BAR */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="relative flex items-center justify-between max-w-4xl mx-auto">
              {/* Connector line */}
              <div className="absolute left-8 right-8 top-4 h-0.5 bg-slate-200 dark:bg-slate-700 -z-0" />
              <div
                className="absolute left-8 top-4 h-0.5 bg-blue-600 transition-all duration-300 -z-0"
                style={{
                  width: `${((wizardStep - 1) / 3) * 100}%`,
                }}
              />

              {/* Step 1 */}
              <div
                onClick={() => setWizardStep(1)}
                className="flex flex-col items-center cursor-pointer group z-10"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    wizardStep >= 1
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                  }`}
                >
                  1
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-2">Upload File</span>
                <span className="text-[11px] text-slate-400">Choose your file</span>
              </div>

              {/* Step 2 */}
              <div
                onClick={() => uploadedFile && setWizardStep(2)}
                className={`flex flex-col items-center z-10 ${
                  uploadedFile ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    wizardStep >= 2
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                  }`}
                >
                  2
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-2">Map Fields</span>
                <span className="text-[11px] text-slate-400">Match columns</span>
              </div>

              {/* Step 3 */}
              <div
                onClick={() => validationResults && setWizardStep(3)}
                className={`flex flex-col items-center z-10 ${
                  validationResults ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    wizardStep >= 3
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                  }`}
                >
                  3
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-2">Validate Data</span>
                <span className="text-[11px] text-slate-400">Check for errors</span>
              </div>

              {/* Step 4 */}
              <div
                className={`flex flex-col items-center z-10 ${
                  importResult ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    wizardStep >= 4
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                  }`}
                >
                  4
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-2">Import Data</span>
                <span className="text-[11px] text-slate-400">Start import process</span>
              </div>
            </div>
          </div>

          {/* STEP 0: MODULE SELECTOR BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Import into Module:</span>
              <select
                value={selectedModuleId}
                onChange={(e) => {
                  setSelectedModuleId(e.target.value);
                  setUploadedFile(null);
                  setParsedHeaders([]);
                  setRawRows([]);
                  setValidationResults(null);
                  setWizardStep(1);
                }}
                className="px-3 py-1.5 text-sm font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {MODULE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>Target Key: <strong className="text-slate-800 dark:text-slate-200">{currentSchema.uniqueKey}</strong></span>
              <span>•</span>
              <span>Store Records: <strong className="text-slate-800 dark:text-slate-200">{currentStoreRecords.length.toLocaleString()}</strong></span>
            </div>
          </div>

          {/* THREE-PANEL WORKSPACE (Matches Reference Image) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* PANEL 1: UPLOAD PANEL */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm h-full flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-blue-600" />
                  <span>Upload File</span>
                </h3>

                {/* Dropzone with dashed blue border */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-blue-200 dark:border-blue-900/60 bg-blue-50/20 dark:bg-slate-850 rounded-xl p-6 text-center flex flex-col items-center justify-center transition-all hover:bg-blue-50/40"
                >
                  <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Drag & Drop your file here
                  </h4>
                  <span className="text-xs text-slate-400 mb-4">or</span>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFileSelected(e.target.files?.[0])}
                    accept=".csv, .xls, .xlsx, .json"
                    className="hidden"
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isParsing}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>{isParsing ? 'Parsing...' : 'Choose File'}</span>
                  </button>

                  <p className="text-[11px] text-slate-400 mt-4">
                    Supports: CSV, XLS, XLSX, JSON • Max Size: 10MB
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/60 text-center">
                <button
                  onClick={handleDownloadSampleTemplate}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample Template</span>
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* PANEL 2: FILE PREVIEW & MAPPING */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      File Preview & Mapping
                    </h3>
                  </div>

                  {uploadedFile && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-full px-2.5 py-0.5">
                      <Check className="w-3 h-3" />
                      <span>File Loaded Successfully</span>
                    </span>
                  )}
                </div>

                {uploadedFile ? (
                  <>
                    {/* File card */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold text-xs">
                          XLS
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[160px]">
                            {uploadedFile.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {(uploadedFile.size / 1024).toFixed(0)} KB • {rawRows.length.toLocaleString()} Records
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Change File</span>
                      </button>
                    </div>

                    {/* Mapping Table */}
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      <div className="grid grid-cols-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100 dark:border-slate-700">
                        <span>Map Fields</span>
                        <span>Target Module</span>
                      </div>

                      {parsedHeaders.map((header) => {
                        const currentMap = fieldMapping[header];
                        const targetKey = typeof currentMap === 'string' ? currentMap : currentMap?.targetKey;
                        const sampleVal = rawRows[0]?.[header] || '';

                        return (
                          <div key={header} className="grid grid-cols-2 gap-2 items-center">
                            <div>
                              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                                {header}
                              </p>
                              {sampleVal && (
                                <p className="text-[10px] text-slate-400 truncate">e.g. {String(sampleVal)}</p>
                              )}
                            </div>

                            <div className="relative">
                              <select
                                value={targetKey || '__IGNORE__'}
                                onChange={(e) => handleTargetFieldChange(header, e.target.value)}
                                className="w-full text-xs py-1 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="__IGNORE__">(Ignore this column)</option>
                                {currentSchema.fields.map((f) => (
                                  <option key={f.key} value={f.key}>
                                    {f.label} {f.required ? '*' : ''}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs">Upload a file first to preview columns and configure mapping.</p>
                  </div>
                )}
              </div>

              {uploadedFile && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <button
                    onClick={() => setShowLivePreview(!showLivePreview)}
                    className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{showLivePreview ? 'Hide Preview' : 'Preview 20 Rows'}</span>
                  </button>

                  <button
                    onClick={handleAutoMapClick}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto Map</span>
                  </button>
                </div>
              )}
            </div>

            {/* PANEL 3: VALIDATION RESULTS */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Validation Results
                    </h3>
                  </div>

                  {validationResults && (
                    <button
                      onClick={() => setViewErrorsModalOpen(true)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      View All →
                    </button>
                  )}
                </div>

                {validationResults ? (
                  <div className="space-y-4">
                    {/* Donut Gauge SVG */}
                    <div className="flex flex-col items-center justify-center my-2">
                      <div className="relative w-28 h-28 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-slate-100 dark:text-slate-700"
                            strokeWidth="3.8"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-emerald-500 transition-all duration-1000 ease-out"
                            strokeDasharray={`${validationResults.validPercent}, 100`}
                            strokeWidth="3.8"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
                            {validationResults.validPercent}%
                          </span>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                        Valid Records
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {validationResults.validCount.toLocaleString()} / {validationResults.totalRows.toLocaleString()}
                      </p>
                    </div>

                    {/* Counters */}
                    <div className="space-y-2 border-t border-b border-slate-100 dark:border-slate-700 py-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>Valid Records</span>
                        </span>
                        <strong className="text-slate-800 dark:text-slate-100">
                          {validationResults.validCount.toLocaleString()}
                        </strong>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          <span>Warnings</span>
                        </span>
                        <strong className="text-slate-800 dark:text-slate-100">
                          {validationResults.warningCount.toLocaleString()}
                        </strong>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          <span>Errors</span>
                        </span>
                        <strong className="text-slate-800 dark:text-slate-100">
                          {validationResults.errorCount.toLocaleString()}
                        </strong>
                      </div>
                    </div>

                    {/* Red Error Box if errors exist */}
                    {validationResults.errorCount > 0 ? (
                      <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div className="text-xs">
                            <p className="font-bold text-rose-800 dark:text-rose-300">
                              {validationResults.errorCount} Errors Found
                            </p>
                            <p className="text-rose-600 dark:text-rose-400 text-[11px] mt-0.5">
                              Please download error report and fix them.
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={handleDownloadErrorReport}
                          className="mt-2.5 w-full py-1.5 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100/50 text-xs font-semibold rounded-md shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Report</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-lg text-center">
                        <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                          Clean Dataset: 0 Errors Found!
                        </p>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                          Ready for safe batch ingestion into the database.
                        </p>
                      </div>
                    )}

                    {/* Duplicate Strategy selector */}
                    <div className="pt-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Duplicate Strategy
                      </label>
                      <select
                        value={duplicateStrategy}
                        onChange={(e) => setDuplicateStrategy(e.target.value)}
                        className="w-full text-xs py-1.5 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 font-semibold"
                      >
                        <option value="UPDATE">Update existing records</option>
                        <option value="SKIP">Skip duplicates</option>
                        <option value="CREATE">Create anyway</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs">Map fields and click Validate to check records against business rules.</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                {!validationResults ? (
                  <button
                    onClick={handleRunValidation}
                    disabled={!uploadedFile || isValidating}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {isValidating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Validating ({validationProgress}%)...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Validate Data</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleProceedToImport}
                    disabled={validationResults.validCount === 0 || isImporting}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Proceed to Import ({validationResults.validCount.toLocaleString()})</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* LIVE PREVIEW DRAWER/TABLE (First 20 Mapped Rows) */}
          {showLivePreview && previewMappedRows.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Live Preview: First 20 Rows (Transformed Data)
                </h4>
                <button
                  onClick={() => setShowLivePreview(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Close
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="py-2 px-3">#</th>
                      {currentSchema.fields.map((f) => (
                        <th key={f.key} className="py-2 px-3 whitespace-nowrap">
                          {f.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {previewMappedRows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{i + 1}</td>
                        {currentSchema.fields.map((f) => (
                          <td key={f.key} className="py-2 px-3 whitespace-nowrap text-slate-800 dark:text-slate-200">
                            {r[f.key] !== undefined && r[f.key] !== null ? String(r[f.key]) : '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 4 RESULT BANNER IF IMPORT COMPLETED */}
          {importResult && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-emerald-900 dark:text-emerald-100">
                    Import Completed Successfully!
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                    Batch {importResult.id} committed into {importResult.module} in {importResult.duration}.
                    ({importResult.importedRecords} created, {importResult.updatedRecords} updated, {importResult.skippedRecords} skipped).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const navRoute = selectedModuleId === 'customers' ? '/customers' :
                                     selectedModuleId === 'vehicles' ? '/stock/vehicles' :
                                     selectedModuleId === 'leads' ? '/sales/leads' :
                                     selectedModuleId === 'parts' ? '/stock/parts' : '/admin/data';
                    navigate(navRoute);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <span>View Imported Records</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    setImportResult(null);
                    setUploadedFile(null);
                    setValidationResults(null);
                    setWizardStep(1);
                  }}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-semibold rounded-lg hover:bg-emerald-100/50 transition-colors"
                >
                  Import Another File
                </button>
              </div>
            </div>
          )}

          {/* 6. IMPORT HISTORY TABLE */}
          <div ref={historyRef} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Import History</h3>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={historyRangeFilter}
                  onChange={(e) => setHistoryRangeFilter(e.target.value)}
                  className="text-xs py-1.5 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-semibold focus:outline-none"
                >
                  <option value="Last 30 Days">Last 30 Days</option>
                  <option value="Last 7 Days">Last 7 Days</option>
                  <option value="Today">Today</option>
                  <option value="Failed Only">Failed Only</option>
                </select>

                <button
                  onClick={() => toast.success('Import history refreshed.')}
                  className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Module</th>
                    <th className="py-3 px-4">File Name</th>
                    <th className="py-3 px-4">Records</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-850 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {item.displayTime}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {item.module}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">
                        {item.fileName}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                        {item.totalRecords.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        {item.status === 'Completed' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-full px-2.5 py-0.5">
                            • Completed ✓
                          </span>
                        )}
                        {item.status === 'Completed with warnings' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-full px-2.5 py-0.5">
                            • Completed w/ warnings
                          </span>
                        )}
                        {item.status === 'Failed' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-full px-2.5 py-0.5">
                            • Failed ✕
                          </span>
                        )}
                        {item.status === 'Undone' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full px-2.5 py-0.5">
                            • Undone
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-3">
                        <button
                          onClick={() => setSelectedHistoryItem(item)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                        <button
                          onClick={() => {
                            // Download result summary
                            const summaryData = `Import ID,${item.id}\nTimestamp,${item.timestamp}\nModule,${item.module}\nFile,${item.fileName}\nRecords,${item.totalRecords}\nStatus,${item.status}`;
                            const blob = new Blob([summaryData], { type: 'text/csv' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `${item.id}_Summary.csv`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: EXPORT DATA WORKSPACE */}
      {/* ========================================================= */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Export Data across ERP Modules
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure export filters, field selection, PII data protection masking, and statutory format.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Module selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Target Module
                </label>
                <select
                  value={exportModule}
                  onChange={(e) => setExportModule(e.target.value)}
                  className="w-full text-xs font-semibold py-2 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="customers">Customers Dossier</option>
                  <option value="vehicles">Vehicle Stock Inventory</option>
                  <option value="leads">Sales Leads Pipeline</option>
                  <option value="parts">Spare Parts Catalogue</option>
                  <option value="invoices">Statutory Tax Invoices</option>
                </select>
              </div>

              {/* Branch selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Branch Scope
                </label>
                <select
                  value={exportBranch}
                  onChange={(e) => setExportBranch(e.target.value)}
                  className="w-full text-xs font-semibold py-2 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="all">All Dealership Branches</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Format selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Export Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['CSV', 'XLSX', 'JSON'].map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setExportFormat(fmt)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        exportFormat === fmt
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* PII Masking Toggle (DPDP Compliance) */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Mask Personal Data (DPDP Act Compliance)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Anonymizes contact numbers (e.g. 98****1234), emails and addresses. Disabling masking requires manager approval.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={maskPersonalData}
                  onChange={(e) => setMaskPersonalData(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Column Picker */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select Columns to Export
                </label>
                <div className="space-x-3 text-[11px]">
                  <button
                    onClick={() => {
                      const all = {};
                      Object.keys(exportColumns).forEach((k) => (all[k] = true));
                      setExportColumns(all);
                    }}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => {
                      const none = {};
                      Object.keys(exportColumns).forEach((k) => (none[k] = false));
                      setExportColumns(none);
                    }}
                    className="font-semibold text-slate-400 hover:underline"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                {Object.keys(exportColumns).map((colKey) => (
                  <label key={colKey} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={!!exportColumns[colKey]}
                      onChange={(e) =>
                        setExportColumns((prev) => ({ ...prev, [colKey]: e.target.checked }))
                      }
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="capitalize">{colKey.replace(/([A-Z])/g, ' $1')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Trigger Button & Preview Count */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                <span>Matching Records: <strong className="text-slate-800 dark:text-slate-200 text-sm font-bold">{exportMatchingRecords.length.toLocaleString()}</strong></span>
                {!maskPersonalData && exportModule === 'customers' && (
                  <span className="block text-amber-600 dark:text-amber-400 mt-1 font-semibold">
                    ⚠ Warning: Unmasked PII export will trigger an Approvals Center entry.
                  </span>
                )}
              </div>

              <button
                onClick={handleTriggerExport}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>
                  {!maskPersonalData && exportModule === 'customers'
                    ? 'Request Approval & Export'
                    : `Export ${exportMatchingRecords.length.toLocaleString()} Records`}
                </span>
              </button>
            </div>
          </div>

          {/* Export History */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Exports Log</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 text-[11px] font-bold uppercase">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Module</th>
                    <th className="py-3 px-4">File Name</th>
                    <th className="py-3 px-4">Records</th>
                    <th className="py-3 px-4">Format</th>
                    <th className="py-3 px-4">Masked</th>
                    <th className="py-3 px-4 text-right">User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {exportHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{item.displayTime}</td>
                      <td className="py-3 px-4 font-semibold">{item.module}</td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">{item.fileName}</td>
                      <td className="py-3 px-4 font-bold">{item.recordCount.toLocaleString()}</td>
                      <td className="py-3 px-4 font-semibold">{item.format}</td>
                      <td className="py-3 px-4">
                        {item.masked ? (
                          <span className="text-emerald-600 font-bold">Yes (PII)</span>
                        ) : (
                          <span className="text-rose-600 font-bold">Unmasked</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500">{item.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: SYNC STATUS WORKSPACE (Simulated) */}
      {/* ========================================================= */}
      {activeTab === 'sync' && (
        <div className="space-y-6">
          {/* Demo mode alert */}
          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl flex items-center justify-between text-xs text-blue-800 dark:text-blue-300">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>Demo Mode:</strong> External connectors operate in local simulation mode. No live webhooks or external data are transmitted.
              </span>
            </div>
            <span className="font-mono text-[11px] bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">SIMULATOR ACTIVE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {syncIntegrations.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {item.subtitle}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'Connected'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.status === 'Degraded'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      • {item.status}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                    {item.name}
                  </h4>
                  <p className="text-xs font-mono text-slate-400 mb-4">{item.channel}</p>

                  <div className="space-y-2 border-t border-slate-100 dark:border-slate-700 pt-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Last Synced:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{item.lastSync}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Records Synced:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{item.recordsSynced.toLocaleString()}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Failed Items:</span>
                      <strong className={item.failedItems > 0 ? 'text-rose-600' : 'text-slate-400'}>
                        {item.failedItems}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2">
                  <button
                    onClick={() => {
                      triggerSyncIntegration(item.id);
                      toast.success(`Triggered background sync for ${item.name}`);
                    }}
                    className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sync Now</span>
                  </button>

                  {item.failedItems > 0 && (
                    <button
                      onClick={() => {
                        triggerSyncIntegration(item.id);
                        toast.success(`Retrying ${item.failedItems} failed items on ${item.name}`);
                      }}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition-colors"
                    >
                      Retry Failed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: SCHEDULED JOBS WORKSPACE (Simulated) */}
      {/* ========================================================= */}
      {activeTab === 'scheduled' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Automated Data Exchange Scheduler
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Jobs execute in the background every 30 seconds while the browser application is active.
              </p>
            </div>

            <button
              onClick={() => setNewJobModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Scheduled Job</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Job Name</th>
                    <th className="py-3 px-4">Module</th>
                    <th className="py-3 px-4">Frequency & Time</th>
                    <th className="py-3 px-4">Format</th>
                    <th className="py-3 px-4">Destination</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {scheduledJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <strong className="text-slate-900 dark:text-white block">{job.name}</strong>
                        <span className="text-[11px] text-slate-400">Next: {job.nextRun}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">{job.module}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{job.frequency}</span>
                        <span className="block text-[11px] text-slate-400">{job.time}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold">{job.format}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {job.destination} ({job.destinationTarget})
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleScheduledJob(job.id)}
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-colors ${
                            job.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-300'
                          }`}
                        >
                          {job.status}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            toast.success(`Job "${job.name}" triggered manually.`);
                          }}
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Run Now
                        </button>
                        <button
                          onClick={() => deleteScheduledJob(job.id)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: VIEW ALL VALIDATION ERRORS */}
      {/* ========================================================= */}
      {viewErrorsModalOpen && validationResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Row-Level Validation Errors & Warnings
                </h3>
                <p className="text-xs text-slate-500">
                  {validationResults.errors.length} total flags across {validationResults.totalRows.toLocaleString()} rows
                </p>
              </div>

              <button
                onClick={() => setViewErrorsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search error message, row number, or field..."
                  value={errorSearchQuery}
                  onChange={(e) => setErrorSearchQuery(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <select
                value={errorSeverityFilter}
                onChange={(e) => setErrorSeverityFilter(e.target.value)}
                className="text-xs font-semibold py-2 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
              >
                <option value="ALL">All Severities</option>
                <option value="ERROR">Errors Only</option>
                <option value="WARNING">Warnings Only</option>
              </select>

              <button
                onClick={handleDownloadErrorReport}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-900 text-slate-500 font-bold text-[11px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Row</th>
                    <th className="py-2.5 px-3">Severity</th>
                    <th className="py-2.5 px-3">Field</th>
                    <th className="py-2.5 px-3">Rejected Value</th>
                    <th className="py-2.5 px-3">Issue Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {validationResults.errors
                    .filter((e) => {
                      if (errorSeverityFilter !== 'ALL' && e.severity !== errorSeverityFilter) return false;
                      if (!errorSearchQuery.trim()) return true;
                      const q = errorSearchQuery.toLowerCase();
                      return (
                        String(e.rowNumber).includes(q) ||
                        (e.field || '').toLowerCase().includes(q) ||
                        (e.message || '').toLowerCase().includes(q) ||
                        (e.value || '').toLowerCase().includes(q)
                      );
                    })
                    .map((err, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                          #{err.rowNumber}
                        </td>
                        <td className="py-2.5 px-3">
                          {err.severity === 'ERROR' ? (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                              ERROR
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                              WARNING
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          {err.field}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                          {err.value || '(Empty)'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                          {err.message}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: IMPORT CONFIRMATION & DPDP CONSENT */}
      {/* ========================================================= */}
      {importConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center shrink-0">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Confirm Batch Data Import
                </h3>
                <p className="text-xs text-slate-500">Atomic commit into {currentSchema.label}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Valid Records to Ingest:</span>
                <strong className="text-slate-800 dark:text-slate-200">{validationResults.validCount.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duplicate Handling:</span>
                <strong className="text-slate-800 dark:text-slate-200">{duplicateStrategy}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Undo Window:</span>
                <strong className="text-emerald-600">Active (24 Hours)</strong>
              </div>
            </div>

            {selectedModuleId === 'customers' && (
              <label className="flex items-start gap-2.5 p-3 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={dpdpConsentChecked}
                  onChange={(e) => setDpdpConsentChecked(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                />
                <span className="text-slate-700 dark:text-slate-300">
                  <strong>DPDP Consent Guarantee:</strong> I confirm customer data may be stored and contacted as per customer consent under Digital Personal Data Protection guidelines.
                </span>
              </label>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setImportConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={selectedModuleId === 'customers' && !dpdpConsentChecked}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                Commit Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DRAWER: IMPORT HISTORY DETAILS & UNDO */}
      {/* ========================================================= */}
      {selectedHistoryItem && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg h-full shadow-2xl border-l border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Import Run #{selectedHistoryItem.id}
                </h3>
                <p className="text-xs text-slate-500">{selectedHistoryItem.displayTime}</p>
              </div>

              <button
                onClick={() => setSelectedHistoryItem(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 text-xs flex-1">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[11px]">Module</span>
                  <strong className="text-slate-800 dark:text-slate-200">{selectedHistoryItem.module}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">User & Role</span>
                  <strong className="text-slate-800 dark:text-slate-200">{selectedHistoryItem.user} ({selectedHistoryItem.role})</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">File Name & Size</span>
                  <strong className="text-slate-800 dark:text-slate-200">{selectedHistoryItem.fileName} ({selectedHistoryItem.fileSize})</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Duration</span>
                  <strong className="text-slate-800 dark:text-slate-200">{selectedHistoryItem.duration}</strong>
                </div>
              </div>

              {/* Counts */}
              <div className="space-y-2 border-t border-b border-slate-100 dark:border-slate-700 py-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Records:</span>
                  <strong>{selectedHistoryItem.totalRecords.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Imported / Created:</span>
                  <span>{selectedHistoryItem.importedRecords?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between text-blue-600 font-semibold">
                  <span>Updated:</span>
                  <span>{selectedHistoryItem.updatedRecords?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Errors:</span>
                  <span>{selectedHistoryItem.errorCount?.toLocaleString() || 0}</span>
                </div>
              </div>

              {/* Mapping Snapshot */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Mapping Snapshot Used
                </h4>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-1 font-mono text-[11px]">
                  {Object.entries(selectedHistoryItem.mappingSnapshot || {}).map(([src, tgt]) => (
                    <div key={src} className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>{src}</span>
                      <span>→ {tgt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample errors if any */}
              {selectedHistoryItem.sampleErrors && selectedHistoryItem.sampleErrors.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-rose-600 mb-2">
                    Reported Errors Sample
                  </h4>
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-lg space-y-1 text-[11px]">
                    {selectedHistoryItem.sampleErrors.map((err, i) => (
                      <p key={i} className="text-rose-800 dark:text-rose-300">
                        Row #{err.rowNumber}: {err.message}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
              {selectedHistoryItem.undoAvailable && selectedHistoryItem.status !== 'Undone' ? (
                <button
                  onClick={() => handleUndoImport(selectedHistoryItem.id)}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Undo Import (24h)</span>
                </button>
              ) : (
                <span className="text-xs text-slate-400 italic">Undo not available</span>
              )}

              <button
                onClick={() => setSelectedHistoryItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE SCHEDULED JOB */}
      {/* ========================================================= */}
      {newJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                New Scheduled Recurring Job
              </h3>
              <button
                onClick={() => setNewJobModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Job Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Daily Inventory Stock CSV"
                  value={newJobForm.name}
                  onChange={(e) => setNewJobForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Module
                  </label>
                  <select
                    value={newJobForm.module}
                    onChange={(e) => setNewJobForm((p) => ({ ...p, module: e.target.value }))}
                    className="w-full py-2 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <option value="Customers">Customers</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Sales Leads">Sales Leads</option>
                    <option value="Spare Parts">Spare Parts</option>
                    <option value="Invoices">Invoices</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Frequency
                  </label>
                  <select
                    value={newJobForm.frequency}
                    onChange={(e) => setNewJobForm((p) => ({ ...p, frequency: e.target.value }))}
                    className="w-full py-2 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Format
                  </label>
                  <select
                    value={newJobForm.format}
                    onChange={(e) => setNewJobForm((p) => ({ ...p, format: e.target.value }))}
                    className="w-full py-2 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <option value="CSV">CSV</option>
                    <option value="XLSX">XLSX</option>
                    <option value="JSON">JSON</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Execution Time
                  </label>
                  <input
                    type="text"
                    value={newJobForm.time}
                    onChange={(e) => setNewJobForm((p) => ({ ...p, time: e.target.value }))}
                    className="w-full py-2 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Destination Target (Email / Download)
                </label>
                <input
                  type="text"
                  value={newJobForm.destinationTarget}
                  onChange={(e) => setNewJobForm((p) => ({ ...p, destinationTarget: e.target.value }))}
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setNewJobModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateScheduledJob}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                Schedule Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataExchangePage;
