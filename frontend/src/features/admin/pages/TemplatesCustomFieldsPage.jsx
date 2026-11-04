import React, { useState } from 'react';
import { 
  LayoutTemplate, 
  Sliders, 
  CheckCircle2, 
  Plus, 
  Printer, 
  Eye, 
  Trash2, 
  Languages,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

import { useCollection, useCollectionItems } from '../../../hooks/useCollection';
// SAMPLE_TEMPLATES: loaded from the database (collection "admin.templatesCustomFields.templates")

// SAMPLE_CUSTOM_FIELDS: loaded from the database (collection "admin.templatesCustomFields.customFields")

export function TemplatesCustomFieldsPage() {
  const SAMPLE_TEMPLATES = useCollectionItems('admin.templatesCustomFields.templates');
  const [activeTab, setActiveTab] = useState('TEMPLATES'); // 'TEMPLATES' or 'CUSTOM_FIELDS'
  const [templates, setTemplates] = useCollection('admin.templatesCustomFields.templates');
  const [selectedTemplate, setSelectedTemplate] = useState(SAMPLE_TEMPLATES[0]);
  const [customFields, setCustomFields] = useCollection('admin.templatesCustomFields.customFields');
  const [showNewFieldModal, setShowNewFieldModal] = useState(false);

  // New field state
  const [newEntity, setNewEntity] = useState('CUSTOMER');
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('TEXT');

  const handleToggleTemplateHeader = (key) => {
    const updated = { ...selectedTemplate, [key]: !selectedTemplate[key] };
    setSelectedTemplate(updated);
    setTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? updated : t));
    toast.success('Document template layout updated!');
  };

  const handleCreateCustomField = (e) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;

    const newField = {
      id: `cf-${Date.now()}`,
      entity: newEntity,
      fieldName: newFieldName.trim(),
      fieldType: newFieldType,
      options: '',
      required: false,
    };

    setCustomFields(prev => [...prev, newField]);
    setShowNewFieldModal(false);
    setNewFieldName('');
    toast.success(`Custom field "${newField.fieldName}" attached to ${newEntity} schema!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6 text-blue-600" />
            Document Templates &amp; Dynamic Custom Fields
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Customize print headers, bilingual footer terms (EN/TA/HI) &amp; attach zero-migration custom fields.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('TEMPLATES')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
              activeTab === 'TEMPLATES'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            Print Template Designer
          </button>
          <button
            onClick={() => setActiveTab('CUSTOM_FIELDS')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
              activeTab === 'CUSTOM_FIELDS'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            Custom Entity Fields ({customFields.length})
          </button>
        </div>
      </div>

      {activeTab === 'TEMPLATES' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left: Template Selector & Toggles */}
          <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Document Templates ({templates.length})
            </h2>

            <div className="space-y-2">
              {templates.map(t => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTemplate(t)}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    selectedTemplate.id === t.id
                      ? 'bg-blue-50/70 border-blue-500 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="text-xs">{t.name}</div>
                  <div className="text-[10px] font-mono opacity-60 uppercase">{t.type}</div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t space-y-3 text-xs">
              <h3 className="font-bold text-slate-700 dark:text-slate-300">Header Elements Display</h3>

              {[
                { key: 'showLogo', label: 'Dealership Logo Header' },
                { key: 'showGstin', label: 'GSTIN & Trade License #' },
                { key: 'showBankDetails', label: 'Bank RTGS / IFSC Details Box' },
              ].map(opt => (
                <div key={opt.key} className="flex justify-between items-center">
                  <span>{opt.label}</span>
                  <input
                    type="checkbox"
                    checked={!!selectedTemplate[opt.key]}
                    onChange={() => handleToggleTemplateHeader(opt.key)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right 2 Cols: Live Print Preview */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Printer className="w-4 h-4 text-blue-600" />
                Live Print Preview — {selectedTemplate.name}
              </h3>
              <span className="text-xs font-mono text-slate-400">A4 Standard Format</span>
            </div>

            <div className="p-8 border rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white space-y-6 text-xs">
              {/* Header preview */}
              <div className="flex justify-between items-start pb-4 border-b">
                <div>
                  <h2 className="text-lg font-black uppercase">AKASH Bajaj</h2>
                  <p className="text-slate-500">Bangalore Central Flagship • 100ft Road, Indiranagar</p>
                  {selectedTemplate.showGstin && (
                    <p className="font-mono text-blue-600 font-bold">GSTIN: 29AABCB1829M1ZK</p>
                  )}
                </div>
                {selectedTemplate.showLogo && (
                  <div className="p-2 bg-blue-600 text-white font-black text-sm rounded">
                    AKASH BAJAJ
                  </div>
                )}
              </div>

              {/* Sample Document Body */}
              <div className="p-4 bg-white dark:bg-slate-850 rounded-lg border space-y-2 text-slate-700 dark:text-slate-300">
                <div className="flex justify-between font-bold">
                  <span>Sample Item: Royal Enfield Himalayan 450 (Kamet White)</span>
                  <span className="font-mono">₹2,85,000.00</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Chassis: ME3J450*P1049281 • Engine: J450E1049281
                </div>
              </div>

              {/* Terms Footer */}
              <div className="pt-4 border-t border-dashed space-y-1 text-[11px] text-slate-500">
                <span className="font-bold block uppercase tracking-wider">Statutory Terms &amp; Conditions:</span>
                <p>{selectedTemplate.footerTerms}</p>
                <p className="italic text-[10px] text-slate-400">
                  தமிழ்: "பொருட்கள் விற்ற பிறகு திரும்பப் பெறப்பட மாட்டாது." (Bilingual support active)
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Custom Fields Manager */
        <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Entity Custom Attributes (Zero Schema Migration)
              </h2>
              <p className="text-xs text-slate-500">
                Dynamic fields appear automatically on Customer, Vehicle and Lead intake forms.
              </p>
            </div>

            <button
              onClick={() => setShowNewFieldModal(true)}
              className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs hover:bg-blue-700 shadow"
            >
              + Add Custom Field
            </button>
          </div>

          <div className="divide-y text-xs">
            {customFields.map(cf => (
              <div key={cf.id} className="py-3.5 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{cf.fieldName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800">
                      {cf.entity}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Type: <strong className="font-mono">{cf.fieldType}</strong> {cf.options ? `• Options: ${cf.options}` : ''}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCustomFields(prev => prev.filter(f => f.id !== cf.id));
                    toast.success('Custom field removed');
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Field Modal */}
      {showNewFieldModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-850 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              Attach New Custom Attribute
            </h3>

            <form onSubmit={handleCreateCustomField} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Target Entity</label>
                <select
                  value={newEntity}
                  onChange={(e) => setNewEntity(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                >
                  <option value="CUSTOMER">Customer Profile</option>
                  <option value="VEHICLE">Vehicle Inventory Unit</option>
                  <option value="LEAD">Sales Lead Form</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Field Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Helmet Size Preference, Emergency Contact"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Data Input Type</label>
                <select
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                >
                  <option value="TEXT">Short Text</option>
                  <option value="DROPDOWN">Dropdown List</option>
                  <option value="NUMBER">Numeric Value</option>
                  <option value="DATE">Calendar Date</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewFieldModal(false)}
                  className="px-3 py-1.5 rounded-lg border hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                >
                  Attach Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TemplatesCustomFieldsPage;
