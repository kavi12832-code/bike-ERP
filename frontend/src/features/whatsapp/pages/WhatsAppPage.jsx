import React, { useState } from 'react';
import { useAppStore } from '../../../store';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { formatTimeOnly, formatDate, formatPhone, formatMoney } from '../../../lib/format';
import {
  MessageSquareText,
  Send,
  User,
  Wrench,
  Bot,
  UserCheck,
  CheckCheck,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Play,
  Pause,
  Phone,
} from 'lucide-react';
import { toast } from 'sonner';

export function WhatsAppPage() {
  const conversations = useAppStore((state) => state.whatsappConversations || []);
  const templates = useAppStore((state) => state.whatsappTemplates || []);
  const customers = useAppStore((state) => state.customers || []);
  const jobCards = useAppStore((state) => state.jobCards || []);

  const [activeConvId, setActiveConvId] = useState(conversations[0]?.id || '');
  const [inputText, setInputText] = useState('');
  const [viewMode, setViewMode] = useState('INBOX'); // 'INBOX' or 'TEMPLATES'
  const [, setTick] = useState(0);

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];
  const relatedCustomer = customers.find((c) => c.id === activeConv?.customerId);
  const relatedJob = jobCards.find((jc) => jc.customerId === activeConv?.customerId);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    activeConv.messages = activeConv.messages || [];
    activeConv.messages.push({
      id: `msg-${Date.now()}`,
      sender: 'STAFF',
      direction: 'OUTBOUND',
      text: inputText,
      timestamp: new Date().toISOString(),
      status: 'DELIVERED',
    });

    setInputText('');
    setTick((t) => t + 1);
    toast.success('WhatsApp reply dispatched to customer via Meta Cloud API webhook');
  };

  const handleToggleAi = () => {
    if (!activeConv) return;
    activeConv.isAiPaused = !activeConv.isAiPaused;
    setTick((t) => t + 1);
    toast.info(
      activeConv.isAiPaused
        ? 'AI automated replies PAUSED. Staff takeover mode active.'
        : 'AI assistant auto-responder RESUMED.'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main">WhatsApp Staff Operational Inbox & Studio</h1>
          <p className="text-xs text-text-muted mt-0.5">
            24-Hour window compliance, bot-to-human takeover, template approvals and customer context
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'INBOX' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('INBOX')}
          >
            Live Inbox ({conversations.length})
          </Button>
          <Button
            variant={viewMode === 'TEMPLATES' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('TEMPLATES')}
          >
            Meta Templates ({templates.length})
          </Button>
        </div>
      </div>

      {viewMode === 'INBOX' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-230px)] min-h-[500px]">
          {/* Column 1: Conversations List (3 cols) */}
          <Card className="lg:col-span-4 flex flex-col overflow-hidden">
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-xs">Active Customer Threads</CardTitle>
            </CardHeader>
            <div className="flex-1 overflow-y-auto divide-y divide-border/60">
              {conversations.map((conv) => {
                const isSelected = conv.id === activeConv?.id;
                const lastMsg = conv.messages[conv.messages.length - 1];

                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`p-3.5 cursor-pointer transition-colors text-xs ${
                      isSelected ? 'bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-surface-subtle'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-text-main truncate">{conv.customerName}</span>
                      <span className="text-[10px] text-text-muted">
                        {lastMsg ? formatTimeOnly(lastMsg.timestamp) : ''}
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-text-muted mt-0.5">{conv.phone}</div>
                    <p className="text-text-muted truncate mt-1 text-[11px]">{lastMsg?.text || 'No messages'}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {conv.within24hWindow ? '24h Window Open' : 'Template Window Only'}
                      </span>
                      {conv.isAiPaused && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                          Staff Takeover
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Column 2: Chat Canvas (5 cols) */}
          <Card className="lg:col-span-5 flex flex-col overflow-hidden">
            {activeConv ? (
              <>
                {/* Chat Topbar */}
                <div className="p-3 border-b border-border bg-surface-subtle flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                      {activeConv.customerName.slice(0, 1)}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-text-main">{activeConv.customerName}</h4>
                      <div className="text-[10px] text-text-muted font-mono">{activeConv.phone}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={activeConv.isAiPaused ? 'primary' : 'secondary'}
                      icon={activeConv.isAiPaused ? Play : Pause}
                      onClick={handleToggleAi}
                    >
                      {activeConv.isAiPaused ? 'Resume AI' : 'Pause AI'}
                    </Button>
                  </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#E5DDD5] dark:bg-slate-900">
                  {activeConv.messages.map((msg) => {
                    const isOutbound = msg.direction === 'OUTBOUND';
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-2.5 text-xs shadow-xs ${
                            isOutbound ? 'bg-[#DCF8C6] text-slate-800' : 'bg-white text-slate-800'
                          }`}
                        >
                          <div className="text-[9px] font-bold text-emerald-800 uppercase mb-0.5">
                            {msg.sender}
                          </div>
                          <p className="leading-relaxed">{msg.text}</p>
                          <div className="text-[9px] text-slate-400 text-right mt-1 flex items-center justify-end gap-1">
                            <span>{formatTimeOnly(msg.timestamp)}</span>
                            {isOutbound && <CheckCheck className="w-3 h-3 text-blue-500" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Input Area */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-border bg-surface flex items-center gap-2 shrink-0"
                >
                  <input
                    type="text"
                    placeholder="Type official staff WhatsApp message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 text-xs p-2 rounded-input border border-border bg-surface-subtle text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <Button type="submit" variant="primary" size="sm" icon={Send}>
                    Send
                  </Button>
                </form>
              </>
            ) : (
              <div className="p-8 text-center text-xs text-text-muted">Select a conversation thread</div>
            )}
          </Card>

          {/* Column 3: Live Context Side Panel (3 cols) */}
          <Card className="lg:col-span-3 flex flex-col p-4 space-y-4 text-xs overflow-y-auto">
            <div>
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block">
                Customer Context
              </span>
              <h4 className="font-bold text-sm text-text-main mt-1">{activeConv?.customerName}</h4>
              <div className="text-text-muted mt-0.5 font-mono">{activeConv?.phone}</div>
              {relatedCustomer && (
                <div className="mt-2 space-y-1">
                  <div className="text-[11px]">
                    Loyalty: <strong className="text-primary">{relatedCustomer.loyaltyTier}</strong>
                  </div>
                  <div className="text-[11px]">
                    LTV: <strong className="tabular-nums">{formatMoney(relatedCustomer.ltvPaise)}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Active Service Job Card Context */}
            {relatedJob && (
              <div className="p-3 rounded bg-blue-50/60 border border-blue-200 space-y-1.5">
                <span className="text-[10px] font-bold text-primary uppercase block">
                  Active Job Card
                </span>
                <div className="font-mono font-bold text-text-main">{relatedJob.jobCardNumber}</div>
                <div className="text-[11px] text-text-muted">
                  Reg: <strong>{relatedJob.registrationNumber}</strong>
                </div>
                <div className="text-[11px] text-text-muted">
                  Stage: <strong>{relatedJob.stage.replace(/_/g, ' ')}</strong>
                </div>
                <div className="pt-1">
                  <StatusBadge status={relatedJob.stage} />
                </div>
              </div>
            )}

            {/* 24-Hour Policy Rule Notice */}
            <div className="p-3 rounded bg-amber-50 border border-amber-200 text-status-amber space-y-1">
              <div className="font-bold text-[11px] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>Meta 24h Window Rule</span>
              </div>
              <p className="text-[10px] leading-relaxed">
                Free-form replies permitted within 24 hours of customer inbound. Outside 24h, verified Meta template must be selected.
              </p>
            </div>
          </Card>
        </div>
      ) : (
        /* Template Manager View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((tpl) => (
            <Card key={tpl.id} className="p-4 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b">
                  <span className="font-mono text-xs font-bold text-primary">{tpl.code}</span>
                  <StatusBadge status={tpl.status} />
                </div>
                <h4 className="font-bold text-xs text-text-main mt-2">{tpl.name}</h4>
                <div className="text-[10px] text-text-muted uppercase">
                  Language: <strong>{tpl.language}</strong> • Category: {tpl.category}
                </div>
                <p className="text-xs text-text-muted mt-2 p-2.5 rounded bg-surface-subtle border leading-relaxed">
                  "{tpl.body}"
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => toast.success(`Simulated test dispatch for template ${tpl.code}`)}
                >
                  Send Sample
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
