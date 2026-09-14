/**
 * VIP 24 Full-Screen AI Suites Modal
 * Opens when clicking on Wingo 30s / 30S badge / VIP Suites.
 * Displays all 24 AI logic models in sleek, wide, compact rectangular cards sorted by win rate.
 */

import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, Sparkles, Trophy, Zap, Search } from 'lucide-react';
import { VipLogicCard } from './VipLogicCard.tsx';
import type { VipLogicModel } from '../types/index.ts';

interface Vip24FullScreenModalProps {
  logics: VipLogicModel[];
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Vip24FullScreenModal: React.FC<Vip24FullScreenModalProps> = ({
  logics,
  isOpen,
  onClose,
  onRefresh,
  isRefreshing = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Filter based on search
  const query = (searchQuery || '').toLowerCase();
  const filteredLogics = logics.filter((item) =>
    (item?.logic || '').toLowerCase().includes(query)
  );

  // Highest win rate is Rank #1 (first in sorted list)
  const topWinnerName = logics.length > 0 ? logics[0].logic : '';

  return (
    <div
      id="vip24-fullscreen-modal"
      className="fixed inset-0 z-50 bg-[#f9fbfe] blueprint-grid flex justify-center overflow-y-auto select-none"
    >
      <div className="w-full max-w-[425px] min-h-screen bg-[#f9fbfe] flex flex-col sm:border-[2px] sm:border-[#0b1a3d] sm:rounded-[22px] sm:shadow-2xl overflow-hidden relative pb-10">
        {/* Sticky Header */}
        <header className="bg-white/95 backdrop-blur-md px-3.5 py-3 border-b-[1.8px] border-[#0b1a3d] flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center space-x-2.5">
            <button
              onClick={onClose}
              type="button"
              className="w-9 h-9 rounded-xl border-[1.8px] border-[#0b1a3d] bg-white flex items-center justify-center text-[#0b1a3d] active:scale-90 transition-transform cursor-pointer shadow-xs"
              title="Return to Dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="text-[15px] font-serif-luxury font-extrabold text-[#0b1a3d] tracking-tight leading-none mb-0.5">
                VIP 24 AI ENGINES
              </h2>
              <div className="flex items-center text-[10.5px] font-semibold text-[#0b1a3d]/80 font-mono-tech">
                <Zap size={11} className="text-amber-500 fill-amber-500 mr-1" />
                <span>24 PROPRIETARY PREDICTION MODELS</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                type="button"
                className="w-8 h-8 rounded-lg border-[1.5px] border-[#0b1a3d] bg-white flex items-center justify-center text-[#0b1a3d] active:scale-95 transition-transform cursor-pointer"
                title="Refresh Predictions"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              </button>
            )}

            <span className="px-2.5 py-1 rounded-lg bg-[#0b1a3d] text-amber-300 text-[10px] font-mono-tech font-bold">
              30S LIVE
            </span>
          </div>
        </header>

        {/* Sub-bar: Ranking Leaderboard Highlights */}
        <section className="px-3.5 py-2 border-b-[1.8px] border-[#0b1a3d] bg-[#f9fbfe]/90 backdrop-blur-sm flex items-center justify-between text-[#0b1a3d] text-[11px] font-mono-tech">
          <div className="flex items-center space-x-1.5">
            <Trophy size={13} className="text-amber-500" />
            <span className="font-bold">15-MIN LEADER:</span>
            <span className="font-serif-luxury font-black text-purple-700 underline truncate max-w-[130px]">
              {topWinnerName || 'GOLDEN X'}
            </span>
          </div>

          <div className="flex items-center space-x-1 text-emerald-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>24/24 ONLINE</span>
          </div>
        </section>

        {/* Search Input Bar */}
        <div className="px-3.5 pt-3 pb-1">
          <div className="relative w-full">
            <Search size={14} className="absolute left-3 top-2.5 text-[#0b1a3d]/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search model (e.g. SHADOW X, FALCON PRO)..."
              className="w-full pl-8 pr-3 py-1.5 bg-white rounded-xl border-[1.5px] border-[#0b1a3d] text-[12px] font-mono-tech text-[#0b1a3d] placeholder:text-[#0b1a3d]/40 focus:outline-none focus:ring-1 focus:ring-[#0b1a3d]"
            />
          </div>
        </div>

        {/* Content: List of all 24 models in compact rectangular cards */}
        <div className="flex-1 px-3.5 py-3 space-y-2.5">
          <div className="flex items-center justify-between font-mono-tech text-[10.5px] text-[#0b1a3d]/70 px-1 mb-1">
            <div className="flex items-center space-x-1 font-bold">
              <Sparkles size={11} className="text-amber-500" />
              <span>SORTED BY 15M WIN PERFORMANCE</span>
            </div>
            <span>{filteredLogics.length} OF 24 MODELS</span>
          </div>

          {filteredLogics.map((model, idx) => (
            <VipLogicCard
              key={model.logic}
              model={model}
              isTopWinner={idx === 0 && !searchQuery}
            />
          ))}

          {filteredLogics.length === 0 && (
            <div className="text-center py-12 text-[#0b1a3d]/60 font-mono-tech text-[12px]">
              No models found matching: &ldquo;{searchQuery}&rdquo;
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
