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
    <div className="relative rounded-2xl overflow-hidden border border-border shadow-soft min-h-[140px] flex flex-col justify-between p-5 sm:p-6 bg-surface text-text-main">
      {/* Background Showroom Photo with Soft Fade Gradient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Placeholder showroom image from src/assets/dashboard */}
        <img
          src={showroomPlaceholder}
          alt=""
          className="w-full h-full object-cover object-right opacity-15 dark:opacity-25"
        />
        {/* Soft fade overlay to ensure full text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/90 to-surface/40" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* Operational Date & Branch */}
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{todayFormatted}</span>
          </div>

          {/* Welcome back, FirstName! 👋 */}
          <h1 className="text-xl sm:text-2xl font-black text-text-main tracking-tight flex items-center gap-2">
            <span>Welcome back, {firstName}!</span>
            <span className="text-xl inline-block animate-bounce" role="img" aria-label="waving hand">
              👋
            </span>
          </h1>

          {/* Tagline & Branch Scope */}
          <p className="text-xs text-text-muted mt-1">
            <span className="font-semibold text-text-main italic">"{tagline}"</span> — Operational Overview for{' '}
            <strong className="text-text-main">{currentBranch.name}</strong>
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => {
              if (onQuickBayAssign) onQuickBayAssign();
              else navigate('/service/live-bays');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-surface hover:bg-surface-subtle text-xs font-bold text-text-main transition-colors shadow-2xs"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-600" />
            <span>Bay Allocation</span>
          </button>

          <button
            onClick={() => navigate('/sales')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-soft"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Vehicle Sale</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default HeroBanner;

