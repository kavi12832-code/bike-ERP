import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../store';
import { DEFAULT_HERO_TAGLINE } from '../../../dashboard/config';
import { Calendar, Wrench, Plus, Bike } from 'lucide-react';
import { format } from 'date-fns';
import showroomPlaceholder from '../../../assets/dashboard/showroom_placeholder.svg';

export function HeroBanner({ onQuickBayAssign }) {
  const navigate = useNavigate();
  const state = useAppStore();
  const currentUser = state.currentUser;
  const activeBranchId = state.activeBranchId;
  const branches = state.branches || [];
  const settings = state.settings || {};

  const currentBranch =
    activeBranchId === 'all'
      ? { name: 'All Dealership Branches (Consolidated)' }
      : branches.find((b) => b.id === activeBranchId) || { name: 'Bangalore Central Flagship' };

  // First name extraction
  const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Rajesh';
  const tagline = settings.heroTagline || DEFAULT_HERO_TAGLINE;
  const todayFormatted = format(new Date(), 'EEEE, dd MMMM yyyy');

  return (
    <div className="relative glass-card !rounded-[24px] overflow-hidden !p-5 sm:!p-6 shadow-card min-h-[140px] flex flex-col justify-between text-text-glass-main">
      {/* Background Showroom Photo with Soft Fade Gradient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Placeholder showroom image from src/assets/dashboard */}
        <img
          src={showroomPlaceholder}
          alt=""
          className="w-full h-full object-cover object-right opacity-15"
        />
        {/* Soft fade overlay to ensure full text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/30 dark:from-navy-950/40 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* Operational Date & Branch */}
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-cyan-400 uppercase tracking-wider mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{todayFormatted}</span>
          </div>

          {/* Welcome back, FirstName! 👋 */}
          <h1 className="text-xl sm:text-2xl font-black text-text-glass-main dark:text-white tracking-tight flex items-center gap-2">
            <span>Welcome back, {firstName}!</span>
            <span className="text-xl inline-block animate-bounce" role="img" aria-label="waving hand">
              👋
            </span>
          </h1>

          {/* Tagline & Branch Scope */}
          <p className="text-xs text-text-glass-muted dark:text-slate-300 mt-1">
            <span className="font-semibold text-text-glass-main dark:text-white italic">"{tagline}"</span> — Operational Overview for{' '}
            <strong className="text-text-glass-main dark:text-white font-bold">{currentBranch.name}</strong>
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => {
              if (onQuickBayAssign) onQuickBayAssign();
              else navigate('/service/live-bays');
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/30 bg-white/20 hover:bg-white/30 text-xs font-semibold text-text-glass-main dark:text-white transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Bay Allocation</span>
          </button>

          <button
            onClick={() => navigate('/sales')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0b1220] dark:bg-blue-600 hover:bg-[#162033] dark:hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-98 hover:-translate-y-0.5"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>New Vehicle Sale</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default HeroBanner;

