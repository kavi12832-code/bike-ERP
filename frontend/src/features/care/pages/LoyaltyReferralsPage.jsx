import React, { useState, useMemo } from 'react';
import { 
  Gift, 
  Award, 
  QrCode, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Share2, 
  CreditCard, 
  Sparkles,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Trash2,
  DollarSign,
  Copy,
  Check,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { KpiCard } from '../../../components/ui/KpiCard';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { formatMoney } from '../../../lib/format';
import { toast } from 'sonner';

import { useCollection, useCollectionItems } from '../../../hooks/useCollection';
// SAMPLE_MEMBERS: loaded from the database (collection "care.loyaltyReferrals.members")

export function LoyaltyReferralsPage() {
  const SAMPLE_MEMBERS = useCollectionItems('care.loyaltyReferrals.members');
  const [members, setMembers] = useCollection('care.loyaltyReferrals.members');
  const [selectedMember, setSelectedMember] = useState(SAMPLE_MEMBERS[0]);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');

  // Modals
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [pointsModalOpen, setPointsModalOpen] = useState(false);

  const [memberForm, setMemberForm] = useState({
    customerName: '',
    phone: '+91 ',
    tier: 'SILVER',
    initialPoints: 200,
  });

  const [pointsForm, setPointsForm] = useState({
    type: 'EARN', // EARN or REDEEM
    amount: 150,
    description: 'Accessories Counter POS Purchase',
  });

  // Dynamic KPIs (Section 0.5: plain numbers, NO charts)
  const kpiStats = useMemo(() => {
    const totalMembers = members.length;
    const totalPoints = members.reduce((sum, m) => sum + (m.pointsBalance || 0), 0);
    const totalReferrals = members.reduce((sum, m) => sum + (m.referralCount || 0), 0);
    const totalEarningsPaise = members.reduce((sum, m) => sum + (m.referralEarningsPaise || 0), 0);
    const expiringSoon = members.reduce((sum, m) => sum + (m.pointsExpiringSoon || 0), 0);

    return {
      totalMembers,
      totalPoints,
      totalReferrals,
      totalEarningsPaise,
      expiringSoon,
    };
  }, [members]);

  const handleCopyReferral = (code) => {
    navigator.clipboard?.writeText(`https://akashbajaj.com/refer/${code}`);
    toast.success(`Referral link for code "${code}" copied to clipboard!`);
  };

  const handleCreateMember = (e) => {
    e.preventDefault();
    if (!memberForm.customerName.trim() || !memberForm.phone.trim()) {
      toast.error('Customer name and phone are required.');
      return;
    }

    const cardPrefix = memberForm.tier === 'PLATINUM' ? 'PLT' : memberForm.tier === 'GOLD' ? 'GLD' : 'SLV';
    const randomCardNo = `VEN-${cardPrefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    const initials = memberForm.customerName.slice(0, 5).toUpperCase().replace(/\s/g, '');
    const referralCode = `${initials}-${Math.floor(100 + Math.random() * 900)}`;

    const newMember = {
      id: `mem-${Date.now().toString(36)}`,
      customerName: memberForm.customerName.trim(),
      phone: memberForm.phone.trim(),
      tier: memberForm.tier,
      pointsBalance: Number(memberForm.initialPoints) || 0,
      lifetimeSpendPaise: 0,
      referralCode,
      referralCount: 0,
      referralEarningsPaise: 0,
      pointsExpiringSoon: 0,
      cardNo: randomCardNo,
      history: [
        {
          date: new Date().toISOString().split('T')[0],
          desc: 'Privilege Member Welcome Bonus',
          points: `+${Number(memberForm.initialPoints) || 0}`,
        },
      ],
    };

    setMembers((prev) => [newMember, ...prev]);
    setSelectedMember(newMember);
    toast.success(`New Privilege Member Card issued: ${randomCardNo}!`);
    setAddMemberModalOpen(false);
  };

  const handleTransactPoints = (e) => {
    e.preventDefault();
    const pts = Number(pointsForm.amount) || 0;
    if (pts <= 0) {
      toast.error('Please enter a valid points amount');
      return;
    }

    if (pointsForm.type === 'REDEEM' && selectedMember.pointsBalance < pts) {
      toast.error(`Insufficient balance. Member only has ${selectedMember.pointsBalance} points.`);
      return;
    }

    const diff = pointsForm.type === 'EARN' ? pts : -pts;
    const historyEntry = {
      date: new Date().toISOString().split('T')[0],
      desc: pointsForm.description.trim() || (pointsForm.type === 'EARN' ? 'Points Earned' : 'Points Redeemed'),
      points: pointsForm.type === 'EARN' ? `+${pts}` : `-${pts}`,
    };

    const updatedMembers = members.map((m) => {
      if (m.id !== selectedMember.id) return m;
      return {
        ...m,
        pointsBalance: m.pointsBalance + diff,
        history: [historyEntry, ...(m.history || [])],
      };
    });

    setMembers(updatedMembers);
    const updatedSelected = updatedMembers.find((m) => m.id === selectedMember.id);
    if (updatedSelected) setSelectedMember(updatedSelected);

    toast.success(
      `${pts} Points ${pointsForm.type === 'EARN' ? 'credited to' : 'redeemed from'} ${selectedMember.customerName}!`
    );
    setPointsModalOpen(false);
  };

  const filteredMembers = members.filter((m) => {
    if (tierFilter !== 'ALL' && m.tier !== tierFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        m.customerName.toLowerCase().includes(q) ||
        m.phone.includes(q) ||
        m.referralCode.toLowerCase().includes(q) ||
        m.cardNo.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Customer Care', path: '/customers' },
          { label: 'Loyalty & Referrals', path: '/care/loyalty' },
        ]}
        title="Loyalty Rewards & Referral Program"
        subtitle="Silver, Gold & Platinum member tiers, automated points accumulation engine, QR member cards & referral rewards."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={() => setPointsModalOpen(true)}
            >
              Earn / Redeem Points
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={CreditCard}
              onClick={() => setAddMemberModalOpen(true)}
              className="bg-primary hover:bg-primary-hover text-white"
            >
              Issue Member Card
            </Button>
          </div>
        }
      />

      {/* 2. Plain KPI Cards Row (Section 0.5: NO charts, sparklines, or trend arrows) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          label="Privilege Members"
          value={kpiStats.totalMembers}
          helperText="Active loyalty cardholders"
          icon={<Users className="w-5 h-5 text-primary" />}
        />
        <KpiCard
          label="Points in Circulation"
          value={`${kpiStats.totalPoints.toLocaleString()} Pts`}
          helperText={`Worth ${formatMoney(kpiStats.totalPoints * 100)} in redemption discount`}
          icon={<Gift className="w-5 h-5 text-purple-600" />}
        />
        <KpiCard
          label="Referrals Delivered"
          value={kpiStats.totalReferrals}
          helperText={`${formatMoney(kpiStats.totalEarningsPaise)} in referral credits rewarded`}
          icon={<Share2 className="w-5 h-5 text-emerald-600" />}
        />
        <KpiCard
          label="Points Expiring Soon"
          value={`${kpiStats.expiringSoon} Pts`}
          helperText="Expiring within next 30 days"
          icon={<Clock className="w-5 h-5 text-amber-500" />}
        />
      </div>

      {/* 3. Tier Rules Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-3.5 bg-surface-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-main uppercase">Silver Tier</span>
            <span className="text-[10px] bg-surface px-2 py-0.5 rounded border border-border font-mono">
              Spend &lt; ₹1.5L
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1.5">
            1 pt per ₹100 service spend • 5% off riding gear &amp; accessories
          </p>
        </Card>

        <Card className="p-3.5 bg-amber-50/50 border-amber-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase">Gold Tier</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-300 font-mono">
              Spend ₹1.5L - ₹3L
            </span>
          </div>
          <p className="text-xs text-amber-900 mt-1.5">
            1.5x points multiplier • Free annual bike polishing voucher
          </p>
        </Card>

        <Card className="p-3.5 bg-purple-50/50 border-purple-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-800 uppercase">Platinum Tier</span>
            <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded border border-purple-300 font-mono">
              Spend &gt; ₹3L
            </span>
          </div>
          <p className="text-xs text-purple-900 mt-1.5">
            2x points multiplier • Priority workshop express bay &amp; free door pickup
          </p>
        </Card>
      </div>

      {/* 4. Search & Filter Bar */}
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
            <input
              type="text"
              placeholder="Search member name, card number, phone or referral code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-input border border-border bg-surface text-text-main focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-input border border-border bg-surface text-text-main"
            >
              <option value="ALL">All Tiers</option>
              <option value="PLATINUM">Platinum</option>
              <option value="GOLD">Gold</option>
              <option value="SILVER">Silver</option>
            </select>

            {(search || tierFilter !== 'ALL') && (
              <Button
                variant="ghost"
                size="sm"
                icon={X}
                onClick={() => {
                  setSearch('');
                  setTierFilter('ALL');
                }}
                className="text-text-muted hover:text-text-main"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 5. Main Grid: Digital Member Card + Points Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Col: Digital QR Member Card & Referral Hub */}
        <div className="space-y-4">
          {selectedMember && (
            <div
              className={`p-6 rounded-2xl shadow-lg text-white space-y-4 relative overflow-hidden ${
                selectedMember.tier === 'PLATINUM'
                  ? 'bg-gradient-to-br from-purple-950 via-indigo-900 to-slate-900'
                  : selectedMember.tier === 'GOLD'
                  ? 'bg-gradient-to-br from-amber-700 via-amber-800 to-stone-900'
                  : 'bg-gradient-to-br from-slate-700 to-slate-900'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">
                    AKASH BAJAJ Privilege Club
                  </span>
                  <h3 className="text-lg font-black mt-0.5">{selectedMember.customerName}</h3>
                  <span className="text-xs font-mono opacity-90">{selectedMember.cardNo}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-white/20 backdrop-blur-sm border border-white/30">
                  {selectedMember.tier}
                </span>
              </div>

              <div className="flex justify-between items-end pt-4">
                <div>
                  <span className="text-[10px] opacity-75 uppercase block">Redeemable Balance</span>
                  <span className="text-2xl font-black font-mono">
                    {selectedMember.pointsBalance.toLocaleString()} Pts
                  </span>
                  <div className="text-[10px] opacity-80 mt-0.5">
                    Worth {formatMoney(selectedMember.pointsBalance * 100)} discount
                  </div>
                </div>

                <div className="p-1.5 bg-white rounded-lg shadow-md">
                  <QRCodeSVG
                    value={`AKASH BAJAJ|MEMBER:${selectedMember.cardNo}|PTS:${selectedMember.pointsBalance}`}
                    size={64}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Referral Card */}
          {selectedMember && (
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-primary" />
                  Referral Rewards Engine
                </h3>
                <span className="text-xs font-bold text-emerald-600 font-mono">
                  {selectedMember.referralCount} Referred
                </span>
              </div>

              <div className="p-3 bg-surface-subtle rounded-lg border border-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-text-muted block">Personal Referral Code</span>
                  <span className="text-sm font-mono font-black text-text-main">
                    {selectedMember.referralCode}
                  </span>
                </div>
                <Button
                  size="xs"
                  variant="primary"
                  icon={Copy}
                  onClick={() => handleCopyReferral(selectedMember.referralCode)}
                  className="bg-primary hover:bg-primary-hover text-white"
                >
                  Copy Link
                </Button>
              </div>

              <div className="text-[11px] text-text-muted space-y-1 leading-relaxed">
                <p>• Referrer receives <strong>₹1,000 service credit</strong> upon verified bike delivery.</p>
                <p>• Friend receives <strong>₹500 accessory discount</strong> on booking confirmation.</p>
              </div>
            </Card>
          )}
        </div>

        {/* Right 2 Cols: Member Directory Strip & Transaction Ledger */}
        <div className="lg:col-span-2 space-y-4">
          {/* Member Selection Strip */}
          <Card className="p-3">
            <span className="text-[11px] font-semibold text-text-muted block mb-2">
              Select Privilege Member:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {filteredMembers.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMember(m)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border cursor-pointer ${
                    selectedMember?.id === m.id
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-surface text-text-main border-border hover:bg-surface-subtle'
                  }`}
                >
                  {m.customerName} ({m.tier})
                </button>
              ))}
            </div>
          </Card>

          {/* Points Ledger */}
          {selectedMember && (
            <Card className="overflow-hidden">
              <div className="p-4 bg-surface-subtle border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-text-main">
                    Points Accumulation &amp; Redemption Ledger — {selectedMember.customerName}
                  </h3>
                  <p className="text-xs text-text-muted">
                    Points expire 12 months after earning date under statutory customer retention rules.
                  </p>
                </div>

                {selectedMember.pointsExpiringSoon > 0 && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 self-start sm:self-auto">
                    <Clock className="w-3.5 h-3.5" />
                    {selectedMember.pointsExpiringSoon} Pts expiring soon
                  </span>
                )}
              </div>

              <div className="divide-y divide-border">
                {selectedMember.history.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 sm:p-4 flex items-center justify-between text-xs hover:bg-surface-subtle/40 transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-text-main block">{item.desc}</span>
                      <span className="text-[11px] text-text-muted font-mono">{item.date}</span>
                    </div>

                    <span
                      className={`text-sm font-mono font-bold ${
                        item.points.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {item.points} Pts
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* 6. Issue Member Card Modal */}
      <Modal
        isOpen={addMemberModalOpen}
        onClose={() => setAddMemberModalOpen(false)}
        title="Issue New Privilege Club Member Card"
        size="md"
      >
        <form onSubmit={handleCreateMember} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Customer Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Nithin Kamat"
                value={memberForm.customerName}
                onChange={(e) => setMemberForm({ ...memberForm, customerName: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Mobile Phone *</label>
              <input
                type="text"
                placeholder="+91 98450 00000"
                value={memberForm.phone}
                onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Initial Membership Tier</label>
              <select
                value={memberForm.tier}
                onChange={(e) => setMemberForm({ ...memberForm, tier: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              >
                <option value="SILVER">Silver Tier (Spend &lt; ₹1.5L)</option>
                <option value="GOLD">Gold Tier (Spend ₹1.5L - ₹3L)</option>
                <option value="PLATINUM">Platinum Tier (Spend &gt; ₹3L)</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Welcome Bonus Points</label>
              <input
                type="number"
                value={memberForm.initialPoints}
                onChange={(e) => setMemberForm({ ...memberForm, initialPoints: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setAddMemberModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="bg-primary hover:bg-primary-hover text-white">
              Issue Privilege Card
            </Button>
          </div>
        </form>
      </Modal>

      {/* 7. Earn / Redeem Points Modal */}
      <Modal
        isOpen={pointsModalOpen}
        onClose={() => setPointsModalOpen(false)}
        title={`Points Transaction: ${selectedMember?.customerName}`}
        size="md"
      >
        <form onSubmit={handleTransactPoints} className="space-y-4 text-xs">
          <div className="p-3 bg-surface-subtle border border-border rounded-lg flex items-center justify-between">
            <span className="text-text-muted">Current Balance:</span>
            <strong className="text-base text-primary font-mono">{selectedMember?.pointsBalance} Points</strong>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-text-main block mb-1">Transaction Action</label>
              <select
                value={pointsForm.type}
                onChange={(e) => setPointsForm({ ...pointsForm, type: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-semibold"
              >
                <option value="EARN">Credit / Earn Points (+)</option>
                <option value="REDEEM">Redeem / Burn Points (-)</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-text-main block mb-1">Points Amount</label>
              <input
                type="number"
                min={1}
                value={pointsForm.amount}
                onChange={(e) => setPointsForm({ ...pointsForm, amount: e.target.value })}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main font-mono font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-text-main block mb-1">Transaction Description / Invoice Reference</label>
            <input
              type="text"
              placeholder="e.g. Redeemed on Riding Gloves invoice #POS-992"
              value={pointsForm.description}
              onChange={(e) => setPointsForm({ ...pointsForm, description: e.target.value })}
              className="w-full p-2.5 rounded-input border border-border bg-surface text-text-main"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setPointsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="bg-primary hover:bg-primary-hover text-white">
              Confirm Transaction
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default LoyaltyReferralsPage;
