import React, { useState } from 'react';
import { useAppStore } from '../../../store';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { formatMoney, formatDate } from '../../../lib/format';
import {
  ShieldCheck,
  FileText,
  Clock,
  CheckCircle,
  Truck,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

import { useCollection } from '../../../hooks/useCollection';
export function InsuranceRtoPage() {
  const [activeTab, setActiveTab] = useState('RTO'); // 'RTO' or 'INSURANCE'

  const [rtoApplications, setRtoApplications] = useState([
    {
      id: 'rto-001',
      orderNumber: 'SO/2627/00001',
      customerName: 'Rohan Mehta',
      chassisNumber: 'ME3U3S5C8PRA10002',
      engineNumber: 'U3S5C810002',
      modelName: 'Hunter 350 Rebel Blue',
      rtoOffice: 'KA-03 (Indiranagar RTO)',
      form20Status: 'PREPARED',
      taxPaidDate: formatDate(new Date()),
      allocatedRegNumber: 'KA-03-TR-9104 (Temporary)',
      hsrpStatus: 'ORDERED', // ORDERED, RECEIVED, FITTED
      rcStatus: 'SUBMITTED', // SUBMITTED, DISPATCHED, DELIVERED
    },
    {
      id: 'rto-002',
      orderNumber: 'SO/2627/00003',
      customerName: 'Rohit Chandran',
      chassisNumber: 'ME3U4S5C8PRA99102',
      engineNumber: 'U4S5C899102',
      modelName: 'Himalayan 450 Hanle Black',
      rtoOffice: 'KA-51 (Electronic City RTO)',
      form20Status: 'APPROVED',
      taxPaidDate: formatDate(new Date(Date.now() - 75 * 86400000)),
      allocatedRegNumber: 'KA-51-EX-0099',
      hsrpStatus: 'FITTED',
      rcStatus: 'DELIVERED',
    },
  ]);

  const [insurancePolicies, setInsurancePolicies] = useCollection('insurance.insuranceRto.insurancePolicies');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main">Insurance Policies & Karnataka RTO Registration</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Form 20/21 data sheets, high security registration plates (HSRP) and policy renewals
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border space-x-2">
        <button
          onClick={() => setActiveTab('RTO')}
          className={`px-4 py-2 font-semibold text-xs border-b-2 transition-colors ${
            activeTab === 'RTO'
              ? 'border-primary text-primary bg-primary/5 rounded-t'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          Karnataka RTO Lifecycle Tracker ({rtoApplications.length})
        </button>
        <button
          onClick={() => setActiveTab('INSURANCE')}
          className={`px-4 py-2 font-semibold text-xs border-b-2 transition-colors ${
            activeTab === 'INSURANCE'
              ? 'border-primary text-primary bg-primary/5 rounded-t'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          Comprehensive Insurance & Renewal Due List ({insurancePolicies.length})
        </button>
      </div>

      {activeTab === 'RTO' ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-subtle border-b border-border text-text-muted font-semibold uppercase text-[11px]">
                  <th className="p-3.5">Order Ref</th>
                  <th className="p-3.5">Customer Name</th>
                  <th className="p-3.5">Chassis Number (VIN)</th>
                  <th className="p-3.5">RTO Jurisdiction</th>
                  <th className="p-3.5">Allocated Reg #</th>
                  <th className="p-3.5">Form 20 / 21</th>
                  <th className="p-3.5">HSRP Status</th>
                  <th className="p-3.5">Smart Card RC</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {rtoApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-surface-subtle/70 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-primary">{app.orderNumber}</td>
                    <td className="p-3.5 font-bold text-text-main">{app.customerName}</td>
                    <td className="p-3.5 font-mono text-text-muted">{app.chassisNumber}</td>
                    <td className="p-3.5 text-text-muted">{app.rtoOffice}</td>
                    <td className="p-3.5 font-mono font-bold text-text-main">
                      {app.allocatedRegNumber}
                    </td>
                    <td className="p-3.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-status-blue">
                        {app.form20Status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={app.hsrpStatus} />
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={app.rcStatus} />
                    </td>
                    <td className="p-3.5 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => toast.success(`Generated Form 20/21 PDF for ${app.chassisNumber}`)}
                      >
                        Form 20 PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-subtle border-b border-border text-text-muted font-semibold uppercase text-[11px]">
                  <th className="p-3.5">Policy Number</th>
                  <th className="p-3.5">Customer Name</th>
                  <th className="p-3.5">Vehicle & Reg #</th>
                  <th className="p-3.5">Insurance Provider</th>
                  <th className="p-3.5">Coverage Type</th>
                  <th className="p-3.5">Premium</th>
                  <th className="p-3.5">Dealer Comm.</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {insurancePolicies.map((pol) => (
                  <tr key={pol.id} className="hover:bg-surface-subtle/70 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-primary">{pol.policyNumber}</td>
                    <td className="p-3.5 font-bold text-text-main">{pol.customerName}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-text-main">{pol.vehicleModel}</div>
                      <div className="font-mono text-[10px] text-text-muted">{pol.registrationNumber}</div>
                    </td>
                    <td className="p-3.5 text-text-muted">{pol.insurer}</td>
                    <td className="p-3.5 text-text-muted">{pol.coverageType}</td>
                    <td className="p-3.5 tabular-nums font-bold text-text-main">
                      {formatMoney(pol.premiumPaise)}
                    </td>
                    <td className="p-3.5 tabular-nums text-status-green font-semibold">
                      {formatMoney(pol.commissionPaise)}
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={pol.status} />
                    </td>
                    <td className="p-3.5 text-right">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => toast.success(`Renewal link generated and sent to ${pol.customerName}!`)}
                      >
                        Renew Policy
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
