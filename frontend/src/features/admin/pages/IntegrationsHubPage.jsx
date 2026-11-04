import React, { useState } from 'react';
import { 
  Webhook, 
  Key, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Send, 
  ShieldCheck, 
  FileCode, 
  Clock, 
  Sliders, 
  Plus, 
  Copy, 
  Eye, 
  EyeOff,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

import { useCollection } from '../../../hooks/useCollection';
// SAMPLE_INTEGRATIONS: loaded from the database (collection "admin.integrationsHub.integrations")

export function IntegrationsHubPage() {
  const [integrations, setIntegrations] = useCollection('admin.integrationsHub.integrations');
  const [activeTab, setActiveTab] = useState('APPS'); // 'APPS' or 'DEVELOPER'

  // Developer API keys & Webhook simulator
  const [apiKeys, setApiKeys] = useCollection('admin.integrationsHub.apiKeys');
  const [showToken, setShowToken] = useState({});

  const [testEventType, setTestEventType] = useState('INVOICE_POSTED');
  const [simulatedResponse, setSimulatedResponse] = useState(null);

  const toggleConnection = (id) => {
    setIntegrations(prev => prev.map(item => {
      if (item.id !== id) return item;
      const next = !item.connected;
      toast.success(`${item.name} ${next ? 'connected' : 'disconnected'}`);
      return { ...item, connected: next, lastSync: next ? 'Just now' : item.lastSync };
    }));
  };

  const handleTestConnection = (name) => {
    toast.success(`Handshake ping sent to ${name}... Connection HTTP 200 OK!`);
  };

  const handleSendWebhookTest = () => {
    const payload = {
      event: testEventType,
      timestamp: new Date().toISOString(),
      dealershipGstin: '29AABCB1829M1ZK',
      data: {
        invoiceNumber: 'VI/2627/00001',
        customer: 'Rohit Chandran',
        amountPaise: 38900000,
        model: 'Royal Enfield Himalayan 450',
      }
    };

    setSimulatedResponse({
      status: 200,
      deliveredAt: new Date().toLocaleTimeString('en-IN'),
      payload,
      response: { received: true, status: 'PROCESSED_BY_ENDPOINT' }
    });
    toast.success('Webhook delivery simulated successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Webhook className="w-6 h-6 text-blue-600" />
            Integrations Hub &amp; Developer APIs
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Connect Tally Prime, Zoho Books, Razorpay, Meta Ads &amp; WhatsApp Business with live webhook simulator.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('APPS')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
              activeTab === 'APPS'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            Connected Apps &amp; Connectors
          </button>
          <button
            onClick={() => setActiveTab('DEVELOPER')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
              activeTab === 'DEVELOPER'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            Developer API Keys &amp; Webhooks
          </button>
        </div>
      </div>

      {activeTab === 'APPS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map(item => (
            <div 
              key={item.id}
              className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600">
                      {item.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {item.name}
                    </h3>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.connected}
                      onChange={() => toggleConnection(item.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                  {item.description}
                </p>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 text-xs font-mono mt-3">
                  <div className="flex justify-between text-slate-500">
                    <span>API Credentials:</span>
                    <span>{item.apiKeyMasked}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Sync Cadence:</span>
                    <strong className="text-blue-600">{item.syncFreq}</strong>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Last Synchronization:</span>
                    <span className="text-slate-700 dark:text-slate-300">{item.lastSync}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                  item.connected ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                  {item.connected ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {item.connected ? 'Active & Ready' : 'Disabled'}
                </span>

                <button
                  onClick={() => handleTestConnection(item.name)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 rounded-lg text-xs font-bold"
                >
                  Ping Test Connection
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Developer Section: API Keys & Webhook Testing */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* API Keys Manager */}
          <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-600" />
                AKASH Bajaj Developer API Keys
              </h2>
              <button
                onClick={() => {
                  const newK = {
                    id: `key-${Date.now()}`,
                    name: 'Custom Script Integration',
                    scope: 'READ_ONLY',
                    token: `bike_ro_${Math.random().toString(36).substring(2, 18)}`,
                    created: new Date().toISOString().slice(0, 10),
                  };
                  setApiKeys(prev => [...prev, newK]);
                  toast.success('Generated new API token!');
                }}
                className="px-3 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                + Generate Key
              </button>
            </div>

            <div className="space-y-3">
              {apiKeys.map(k => (
                <div key={k.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 dark:text-white">{k.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800">
                      {k.scope}
                    </span>
                  </div>

                  <div className="flex items-center justify-between font-mono bg-white dark:bg-slate-900 p-2 rounded border">
                    <span>{showToken[k.id] ? k.token : '••••••••••••••••••••••••••••••••'}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setShowToken({ ...showToken, [k.id]: !showToken[k.id] })}
                        className="p-1 hover:text-blue-600"
                      >
                        {showToken[k.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(k.token);
                          toast.success('API Key copied to clipboard');
                        }}
                        className="p-1 hover:text-blue-600"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Webhook Dispatch Simulator */}
          <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-600" />
              Live Webhook Dispatch Simulator
            </h2>
            <p className="text-xs text-slate-500">
              Trigger simulated event payload to test third-party webhooks (e.g. Tally, Zapier, Custom backend).
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Select Event Type</label>
                <select
                  value={testEventType}
                  onChange={(e) => setTestEventType(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                >
                  <option value="INVOICE_POSTED">invoice.posted</option>
                  <option value="LEAD_CAPTURED">lead.captured</option>
                  <option value="JOBCARD_COMPLETED">jobcard.completed</option>
                  <option value="PAYMENT_RECEIVED">payment.received</option>
                </select>
              </div>

              <button
                onClick={handleSendWebhookTest}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
              >
                Send Test Webhook Payload
              </button>

              {simulatedResponse && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-[11px] font-mono font-bold text-emerald-600">
                    <span>Delivered at: {simulatedResponse.deliveredAt}</span>
                    <span>HTTP {simulatedResponse.status} OK</span>
                  </div>
                  <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-lg overflow-x-auto max-h-48 whitespace-pre-wrap">
                    {JSON.stringify(simulatedResponse.payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IntegrationsHubPage;
