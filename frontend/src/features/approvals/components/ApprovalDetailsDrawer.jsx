// src/features/approvals/components/ApprovalDetailsDrawer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../store';
import { APPROVAL_STATUS, APPROVAL_TYPES, STATUS_COLORS, TYPE_COLORS } from '../../../approvals/config';
import { canUserDecide } from '../../../approvals/engine';
import { computeRequestSla } from '../../../approvals/sla';
import { formatMoney } from '../../../lib/format';
import { Button } from '../../../components/ui/Button';
import {
  X,
  Shield,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  AlertTriangle,
  FileText,
  ExternalLink,
  MessageSquare,
  Send,
  User,
  Building,
  Calendar,
  AlertCircle,
  Zap,
  Check,
  ChevronRight,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';

export function ApprovalDetailsDrawer({ requestId, isOpen, onClose, onActionCompleted }) {
  const navigate = useNavigate();
  const drawerRef = useRef(null);

  const currentUser = useAppStore((state) => state.currentUser);
  const approvals = useAppStore((state) => state.approvals || []);
  const policies = useAppStore((state) => state.approvalPolicies || []);

  const decideApproval = useAppStore((state) => state.decideApproval);
  const addApprovalComment = useAppStore((state) => state.addApprovalComment);
  const emergencyOverrideApproval = useAppStore((state) => state.emergencyOverrideApproval);

  const request = approvals.find((r) => r.id === requestId || r.legacyId === requestId);
  const policy = policies.find((p) => p.id === request?.policyId);

  const [decisionNote, setDecisionNote] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOverridePrompt, setShowOverridePrompt] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');

  // Close on Escape & trap focus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !request) return null;

  const slaInfo = computeRequestSla(request);
  const decisionCheck = canUserDecide(currentUser, request, policy);
  const isSuperAdmin = currentUser?.role === 'Super Admin' || currentUser?.role === 'SUPER_ADMIN';

  const handleDecision = async (decision) => {
    if ((decision === 'REJECT' || decision === 'RETURN') && !decisionNote.trim()) {
      toast.error(`A justification note is required to ${decision.toLowerCase()} this request.`);
      return;
    }

    setIsSubmitting(true);
    try {
      decideApproval(request.id, decision, { note: decisionNote });
      toast.success(
        decision === 'APPROVE'
          ? `Request ${request.id} approved successfully.`
          : decision === 'REJECT'
          ? `Request ${request.id} rejected.`
          : `Request ${request.id} returned for revisions.`
      );
      setDecisionNote('');
      if (onActionCompleted) onActionCompleted();
    } catch (err) {
      toast.error(err.message || 'Error processing approval decision.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmergencyOverride = () => {
    if (!overrideReason.trim()) {
      toast.error('Emergency justification is mandatory.');
      return;
    }
    try {
      emergencyOverrideApproval(request.id, overrideReason);
      toast.warning(`Emergency override invoked for ${request.id}`);
      setShowOverridePrompt(false);
      setOverrideReason('');
      if (onActionCompleted) onActionCompleted();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addApprovalComment(request.id, commentInput.trim());
    setCommentInput('');
    toast.success('Comment added to record.');
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/approvals?request=${request.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Direct approval link copied to clipboard.');
  };

  // Avatar helper
  const renderInitials = (name) => {
    return (name || 'Staff')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-[2px] flex justify-end transition-opacity">
      <div
        ref={drawerRef}
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200"
      >
        {/* 1. Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-xs font-bold bg-white text-slate-800 border border-slate-300 px-2 py-0.5 rounded shadow-sm">
              {request.id}
            </span>

            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                TYPE_COLORS[request.type] || 'bg-slate-100 text-slate-700'
              }`}
            >
              {request.type}
            </span>

            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                STATUS_COLORS[request.status] || 'bg-slate-100 text-slate-700'
              }`}
            >
              {request.status}
            </span>

            {/* SLA State Pill */}
            {!slaInfo.isClosed ? (
              <span
                title={slaInfo.escalationText}
                className={`text-[11px] font-semibold px-2 py-0.5 rounded border flex items-center gap-1 ${slaInfo.pillColor}`}
              >
                <Clock className="w-3 h-3" />
                <span>{slaInfo.label}</span>
              </span>
            ) : (
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded border flex items-center gap-1 ${slaInfo.statusColor}`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Turnaround: {slaInfo.turnaroundText}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyLink}
              title="Copy shareable link"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          {/* Summary & Justification */}
          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 leading-snug">{request.title}</h2>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-800 block mb-1">Business Justification:</span>
              {request.justification}
            </p>
          </div>

          {/* Key Facts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50/50 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Amount
              </span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                {request.amountPaise ? formatMoney(request.amountPaise) : 'N/A (Access/Export)'}
              </span>
              {request.percent > 0 && (
                <span className="text-[10px] text-blue-600 font-medium">
                  {request.percent}% of vehicle price
                </span>
              )}
            </div>

            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Customer / Entity
              </span>
              <span className="text-xs font-semibold text-slate-800 mt-0.5 block truncate">
                {request.customerName || request.sourceId || 'Dealership Operations'}
              </span>
              {request.vehicleModel && (
                <span className="text-[10px] text-slate-500 block truncate">
                  {request.vehicleModel}
                </span>
              )}
            </div>

            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Branch Location
              </span>
              <span className="text-xs font-semibold text-slate-800 mt-0.5 block truncate">
                {request.branchName}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Initiated By
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold">
                  {renderInitials(request.requesterName)}
                </div>
                <span className="text-xs font-medium text-slate-800 truncate">
                  {request.requesterName}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block">{request.requesterRole}</span>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Submitted At
              </span>
              <span className="text-xs font-mono text-slate-700 mt-0.5 block">
                {new Date(request.createdAt).toLocaleDateString([], {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                IST
              </span>
            </div>

            {request.vin && (
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  VIN / Chassis
                </span>
                <span className="text-xs font-mono font-medium text-slate-800 mt-0.5 block truncate">
                  {request.vin}
                </span>
              </div>
            )}
          </div>

          {/* Why Approval is Needed */}
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs mb-1">
              <Shield className="w-4 h-4 text-amber-700" />
              <span>Statutory Rule Triggered</span>
            </div>
            <p className="text-xs text-amber-950 font-medium">{request.ruleText}</p>
            <div className="flex items-center gap-2 mt-2 text-[10px] text-amber-800">
              <span className="bg-white/80 px-1.5 py-0.5 rounded border border-amber-200 font-mono">
                Policy: {policy?.label || request.policyId} (v{request.policyVersion || '1.0'})
              </span>
            </div>
          </div>

          {/* Approval Path Stepper */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Dual-Control Approval Path
            </h3>
            <div className="space-y-2.5">
              {(request.levels || []).map((lvl, index) => {
                const isCurrent = request.currentLevel === lvl.level && request.status === APPROVAL_STATUS.PENDING;
                const isPassed = lvl.status === APPROVAL_STATUS.APPROVED;
                const isRejected = lvl.status === APPROVAL_STATUS.REJECTED;
                const isReturned = lvl.status === APPROVAL_STATUS.RETURNED;

                return (
                  <div
                    key={lvl.level}
                    className={`p-3 rounded-lg border text-xs transition-all ${
                      isCurrent
                        ? 'bg-blue-50/70 border-blue-300 shadow-sm'
                        : isPassed
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : isRejected
                        ? 'bg-red-50/40 border-red-200'
                        : isReturned
                        ? 'bg-blue-50/40 border-blue-200'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            isPassed
                              ? 'bg-emerald-600 text-white'
                              : isRejected
                              ? 'bg-red-600 text-white'
                              : isCurrent
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {isPassed ? <Check className="w-3 h-3" /> : lvl.level}
                        </span>
                        <span className="font-bold text-slate-800">{lvl.label}</span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isPassed
                            ? 'bg-emerald-100 text-emerald-800'
                            : isRejected
                            ? 'bg-red-100 text-red-800'
                            : isReturned
                            ? 'bg-blue-100 text-blue-800'
                            : isCurrent
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {isPassed
                          ? 'Approved'
                          : isRejected
                          ? 'Rejected'
                          : isReturned
                          ? 'Returned'
                          : isCurrent
                          ? 'Action Required'
                          : 'Waiting Tier'}
                      </span>
                    </div>

                    <div className="mt-1.5 text-[11px] text-slate-500 pl-7">
                      Eligible Sign-off: <span className="font-semibold text-slate-700">{lvl.approverRoles?.join(', ')}</span>
                      {lvl.decidedBy && (
                        <div className="mt-1 text-slate-800">
                          Decided by: <span className="font-bold">{lvl.decidedBy}</span> on{' '}
                          <span className="font-mono text-[10px]">
                            {new Date(lvl.decidedAt).toLocaleString([], {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                          {lvl.note && (
                            <p className="mt-0.5 text-slate-600 italic">"{lvl.note}"</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Attachments & Source Deep Link */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Evidence &amp; Source Record
              </h3>
              {request.sourceRef?.route && (
                <button
                  type="button"
                  onClick={() => navigate(request.sourceRef.route)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 hover:underline"
                >
                  <span>Open source record ({request.sourceRef.id})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {request.attachments?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {request.attachments.map((att, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-800 truncate">{att.name}</p>
                        <span className="text-[10px] text-slate-400">{att.size}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-blue-600 font-bold cursor-pointer hover:underline ml-2">
                      View
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No external files attached.</p>
            )}
          </div>

          {/* Comments Thread */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Internal Comments &amp; Notes
            </h3>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {(request.comments || []).length === 0 ? (
                <p className="text-xs text-slate-400 italic">No comments posted yet.</p>
              ) : (
                request.comments.map((c) => (
                  <div key={c.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span className="font-bold text-slate-800">
                        {c.authorName} ({c.authorRole})
                      </span>
                      <span className="font-mono">
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-700">{c.text}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Add a remark for the audit trail..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <Button type="submit" size="sm" variant="outline" className="text-xs h-8">
                <Send className="w-3 h-3 mr-1" />
                Post
              </Button>
            </form>
          </div>

          {/* Event Timeline */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Statutory Event Timeline
            </h3>
            <div className="space-y-2 pl-2 border-l-2 border-slate-200 ml-1">
              {(request.history || []).map((h, i) => (
                <div key={i} className="pl-3 relative text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-blue-500 absolute -left-[17px] top-1" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{h.event.replace(/_/g, ' ')}</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {new Date(h.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                  {h.note && <p className="text-slate-600 mt-0.5">{h.note}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Decision Footer Panel */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/90 space-y-3">
          {/* If request is open */}
          {[APPROVAL_STATUS.PENDING, APPROVAL_STATUS.ESCALATED].includes(request.status) ? (
            decisionCheck.canDecide ? (
              <div className="space-y-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Decision Justification Note{' '}
                    <span className="text-slate-400 font-normal">
                      (Mandatory for Reject / Return; Optional for Approve)
                    </span>
                  </label>
                  <textarea
                    rows={2}
                    value={decisionNote}
                    onChange={(e) => setDecisionNote(e.target.value)}
                    placeholder="Enter statutory rationale or required revision remarks..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleDecision('APPROVE')}
                      disabled={isSubmitting}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      Approve
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDecision('REJECT')}
                      disabled={isSubmitting}
                      className="border-red-300 text-red-600 hover:bg-red-50 font-bold text-xs h-9 px-4"
                    >
                      <XCircle className="w-4 h-4 mr-1.5" />
                      Reject
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDecision('RETURN')}
                      disabled={isSubmitting}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50 font-bold text-xs h-9 px-3"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      Return for Changes
                    </Button>
                  </div>

                  {/* Super Admin Emergency Override */}
                  {isSuperAdmin && (
                    <button
                      type="button"
                      onClick={() => setShowOverridePrompt(!showOverridePrompt)}
                      className="text-[11px] text-red-600 hover:text-red-800 font-bold underline flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3" />
                      Override
                    </button>
                  )}
                </div>

                {/* Emergency Override Box */}
                {showOverridePrompt && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-2 mt-2">
                    <div className="flex items-center gap-1.5 text-red-800 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span>Principal Dealer Emergency Override</span>
                    </div>
                    <p className="text-[11px] text-red-700">
                      Bypasses normal multi-tier governance. This action will be permanently recorded in the immutable audit log and counted as a policy exception.
                    </p>
                    <input
                      type="text"
                      placeholder="Mandatory emergency business rationale..."
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-red-300 rounded text-slate-800"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowOverridePrompt(false)}
                        className="text-xs h-7"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleEmergencyOverride}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-7"
                      >
                        Confirm Override
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-900 text-xs block">
                    Action Restricted by Dual Control Policy
                  </span>
                  <p className="text-[11px] text-amber-800 mt-0.5">{decisionCheck.reason}</p>
                </div>
              </div>
            )
          ) : (
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">
                Request is closed ({request.status}). Decided by{' '}
                <strong className="text-slate-700">{request.decidedBy || 'System'}</strong>.
              </span>
              <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ApprovalDetailsDrawer;

