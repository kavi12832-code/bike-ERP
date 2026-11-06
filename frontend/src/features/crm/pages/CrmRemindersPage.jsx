import React, { useState } from 'react';
import { useAppStore } from '../../../store';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Tabs } from '../../../components/ui/Tabs';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { formatMoney, formatDate, formatPhone } from '../../../lib/format';
import {
  HeartHandshake,
  Clock,
  AlertTriangle,
  Calendar,
  MessageSquare,
  ShieldAlert,
  Star,
  CheckCircle,
  Gift,
} from 'lucide-react';
import { toast } from 'sonner';

export function CrmRemindersPage() {
  const [activeTab, setActiveTab] = useState('SERVICE_REMINDERS'); // 'SERVICE_REMINDERS', 'COMPLAINTS', 'INSURANCE_EXPIRY', 'TASKS'

  const serviceReminders = [
    {
      id: 'rem-001',
      customerName: 'Neha Verma',
      phone: '+91 99801 44552',
      vehicleModel: 'Honda Activa 125',
      registrationNumber: 'KA-01-EL-7123',
      currentKm: 14200,
      dueTrigger: 'KM Limit Exceeded (14,000 KM)',
      dueDate: formatDate(new Date()),
      status: 'OVERDUE',
      optedIn: true,
    },
    {
      id: 'rem-002',
      customerName: 'Arjun Das',
      phone: '+91 97412 88901',
      vehicleModel: 'Royal Enfield Classic 350',
      registrationNumber: 'KA-53-MJ-1049',
      currentKm: 9400,
      dueTrigger: 'Date Threshold (180 Days Since Last Service)',
      dueDate: formatDate(new Date(Date.now() + 5 * 86400000)),
      status: 'SCHEDULED',
      optedIn: true,
    },
  ];

  const complaints = [
    {
      id: 'tkt-001',
      ticketNumber: 'TKT/2627/00009',
      customerName: 'Priya Singh',
      phone: '+91 98450 12345',
      subject: 'iQube regenerative brake delay in Eco mode',
      slaHours: 4,
      elapsedHours: 2.5,
      status: 'IN_PROGRESS',
      sentiment: 'FRUSTRATED',
      assignedTo: 'Karthik Raja (Service Manager)',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main">Automated CRM, Reminders & Customer Care</h1>
          <p className="text-xs text-text-muted mt-0.5">
            KM and calendar service alerts, complaint ticket SLA escalations and Google review triggers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            icon={MessageSquare}
            onClick={() => toast.success('Dispatched WhatsApp service reminders to all overdue customers!')}
          >
            Trigger Broadcast to Overdue
          </Button>
        </div>
      </div>

      {/* Tabs */}
      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'SERVICE_REMINDERS', label: 'Service Due Reminders (KM / Date)' },
          { id: 'COMPLAINTS', label: 'Complaint Tickets & SLAs' },
          { id: 'INSURANCE_EXPIRY', label: 'Insurance & PUC Expiries' },
          { id: 'TASKS', label: 'Daily Sales Follow-up Tasks' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        layoutId="crmActiveTab"
      />

      {activeTab === 'SERVICE_REMINDERS' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-subtle border-b border-border text-text-muted font-semibold uppercase text-[11px]">
                  <th className="p-3.5">Customer Name</th>
                  <th className="p-3.5">Mobile Phone</th>
                  <th className="p-3.5">Vehicle & Reg #</th>
                  <th className="p-3.5">Odometer</th>
                  <th className="p-3.5">Due Trigger Reason</th>
                  <th className="p-3.5">Target Due Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {serviceReminders.map((rem) => (
                  <tr key={rem.id} className="hover:bg-surface-subtle/70 transition-colors">
                    <td className="p-3.5 font-bold text-text-main">{rem.customerName}</td>
                    <td className="p-3.5 font-mono text-text-muted">{formatPhone(rem.phone)}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-text-main">{rem.vehicleModel}</div>
                      <div className="font-mono text-[10px] text-text-muted">{rem.registrationNumber}</div>
                    </td>
                    <td className="p-3.5 tabular-nums font-bold text-text-main">{rem.currentKm} KM</td>
                    <td className="p-3.5 text-text-muted">{rem.dueTrigger}</td>
                    <td className="p-3.5 font-medium text-text-main">{rem.dueDate}</td>
                    <td className="p-3.5">
                      <StatusBadge status={rem.status} />
                    </td>
                    <td className="p-3.5 text-right">
                      <Button
                        size="sm"
                        variant="primary"
                        icon={MessageSquare}
                        onClick={() => toast.success(`Automated reminder pushed to ${rem.phone} via WhatsApp`)}
                      >
                        Remind
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'COMPLAINTS' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-subtle border-b border-border text-text-muted font-semibold uppercase text-[11px]">
                  <th className="p-3.5">Ticket #</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Complaint Summary</th>
                  <th className="p-3.5">SLA Target</th>
                  <th className="p-3.5">Assigned Manager</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-subtle/70 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-primary">{c.ticketNumber}</td>
                    <td className="p-3.5 font-bold text-text-main">{c.customerName}</td>
                    <td className="p-3.5 text-text-main font-medium">{c.subject}</td>
                    <td className="p-3.5 text-status-amber font-semibold">{c.elapsedHours}h / {c.slaHours}h SLA</td>
                    <td className="p-3.5 text-text-muted">{c.assignedTo}</td>
                    <td className="p-3.5">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="p-3.5 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => toast.success(`Resolving complaint ticket ${c.ticketNumber}`)}
                      >
                        Resolve Ticket
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {['INSURANCE_EXPIRY', 'TASKS'].includes(activeTab) && (
        <Card className="p-8 text-center text-xs text-text-muted">
          All tasks synchronized with staff calendar. Zero overdue escalations.
        </Card>
      )}
    </div>
  );
}
