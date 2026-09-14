/**
 * VIP Logic Card Component
 * Sleek, compact wide rectangular card format for each AI logic model.
 * Ranks highest performers at the top and applies neon red/purple glowing animation to Top #1.
 * Gated with Eye/Lock icons when unauthorized.
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Flame, Sparkles, TrendingUp, Eye, EyeOff, Lock } from 'lucide-react';
import type { VipLogicModel } from '../types/index.ts';

interface VipLogicCardProps {
  model: VipLogicModel;
  isTopWinner: boolean;
  onSelect?: () => void;
  isUnlocked?: boolean;
  onRequestUnlock?: () => void;
}

export const VipLogicCard: React.FC<VipLogicCardProps> = ({
  model,
  isTopWinner,
  onSelect,
  isUnlocked = false,
  onRequestUnlock,
}) => {
  const [expanded, setExpanded] = useState(false);

  // Extract last 3-4 digits for clean display (e.g. "620" / "621")
  const marketPidShort = model.marketSettledPeriod
    ? model.marketSettledPeriod.slice(-4)
    : '620';
  
  const upcomingPidShort = model.upcomingPredictionPeriod
    ? model.upcomingPredictionPeriod.slice(-4)
    : '621';

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isUnlocked) {
      if (onRequestUnlock) {
        onRequestUnlock();
        return;
      }
    }
    setExpanded(!expanded);
    if (onSelect) onSelect();
  };

  return (
    <div
      onClick={toggleExpand}
      className={`w-full rounded-xl select-none transition-all cursor-pointer relative ${
        isTopWinner
          ? 'bg-white glow-top-winner border-[2px] border-red-500'
          : 'bg-white/95 border-[1.5px] border-[#0b1a3d] hover:border-[#0b1a3d]/80'
      } shadow-xs`}
    >
      {/* Top Winner Glow Label */}
      {isTopWinner && (
        <div className="absolute -top-2.5 left-4 z-20 flex items-center space-x-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-purple-600 text-white font-mono-tech text-[9.5px] font-black tracking-wider uppercase shadow-sm">
          <Sparkles size={11} className="text-amber-300 animate-spin" />
          <span>TOP #1 VIP PREDICTOR</span>
          <Flame size={11} className="text-amber-300 fill-amber-300" />
        </div>
      )}

      {/* Main Bar: High Contrast Compact Horizontal Layout */}
      <div className="flex items-center justify-between p-2.5 sm:p-3">
        {/* Left Group: Rank Badge + Logic Name + Algorithm Type */}
        <div className="flex items-center space-x-2.5 min-w-0">
          {/* Rank Badge: Golden for #1, clean dark blue for others */}
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono-tech font-black text-[12px] flex-shrink-0 ${
              isTopWinner
                ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-xs'
                : 'bg-[#0b1a3d] text-white'
            }`}
          >
            #{model.rank || 1}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="font-serif-luxury font-extrabold text-[13.5px] text-[#0b1a3d] leading-none truncate">
                {model.logic}
              </span>
              {model.streak && model.streak >= 3 && (
                <span className="text-[9px] font-mono-tech font-bold text-red-600 bg-red-100 px-1 rounded flex items-center">
                  🔥{model.streak}
                </span>
              )}
            </div>
            <span className="text-[10px] font-mono-tech font-semibold text-slate-500 mt-0.5">
              {model.reason || 'QUANT MATRIX'}
            </span>
          </div>
        </div>

        {/* Center-Right Group: 10 Recent Win/Loss Indicators (Desktop/Tablet) */}
        <div className="hidden xs:flex items-center space-x-1">
          {model.history.slice(0, 10).map((h, i) => (
            <span
              key={i}
              className={`history-win-box ${
                h.res === 'WIN' ? 'history-win-box-win' : 'history-win-box-loss'
              }`}
            >
              {h.res === 'WIN' ? 'W' : 'L'}
            </span>
          ))}
        </div>

        {/* Right Group: Win Rate */}
        <div className="flex items-center space-x-2">
          <div className="text-right">
            <span className="text-[13px] font-mono-tech font-black text-[#0b1a3d]">
              {model.rate_15m || '92%'}
            </span>
            <span className="text-[9px] font-mono-tech text-slate-500 block leading-none">
              ACCURACY
            </span>
          </div>
        </div>

        {/* Right Group: Prediction Badge & Expand Icon */}
        <div className="flex items-center space-x-1.5 flex-shrink-0">
          <div className="flex flex-col items-end">
            {!isUnlocked ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onRequestUnlock) onRequestUnlock();
                }}
                className="px-2 py-0.5 rounded-md font-mono-tech text-[10.5px] font-bold bg-amber-50 text-amber-900 border border-amber-400 flex items-center space-x-1 cursor-pointer hover:bg-amber-100 transition-colors shadow-2xs"
                title="লকড - পাসওয়ার্ড দিন"
              >
                <EyeOff size={11} className="text-amber-600" />
                <span>LOCKED</span>
              </button>
            ) : (
              <span
                className={`px-2 py-0.5 rounded-md font-mono-tech text-[11px] font-black flex items-center space-x-1 ${
                  model.pred === 'BIG'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : model.pred === 'SMALL'
                    ? 'bg-blue-100 text-blue-900 border border-blue-300'
                    : model.pred === 'RED'
                    ? 'bg-red-100 text-red-900 border border-red-300'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}
              >
                <Eye size={11} className="opacity-75" />
                <span>
                  {model.pred} {typeof model.num === 'number' ? `(${model.num})` : ''}
                </span>
              </span>
            )}
          </div>

          <button
            type="button"
            className="text-[#0b1a3d]/60 hover:text-[#0b1a3d] p-0.5 transition-colors"
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* Mobile visible 10 Win boxes if collapsed on narrow screen */}
      <div className="flex xs:hidden sm:hidden items-center justify-between px-3 pb-2 pt-0">
        <div className="flex items-center space-x-[2.5px]">
          {model.history.slice(0, 10).map((h, i) => (
            <span
              key={i}
              className={`history-win-box ${
                h.res === 'WIN' ? 'history-win-box-win' : 'history-win-box-loss'
              }`}
            >
              {h.res === 'WIN' ? 'W' : 'L'}
            </span>
          ))}
        </div>
        <span className="text-[9px] font-mono-tech font-bold text-slate-500">
          {model.win_15m || 8}W / 10R
        </span>
      </div>

      {/* Expanded Detailed View */}
      {expanded && (
        <div className="border-t-[1.5px] border-[#0b1a3d]/20 bg-[#f9fbfe] p-3 rounded-b-xl text-[#0b1a3d] space-y-2.5">
          {/* Period Transition Header */}
          <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-[#0b1a3d]/20 shadow-xs">
            <div className="flex flex-col">
              <span className="text-[9.5px] font-mono-tech text-slate-500 font-bold uppercase tracking-wider">
                MARKET SETTLED
              </span>
              <span className="text-[13px] font-mono-tech font-bold text-slate-700">
                #{marketPidShort}
              </span>
            </div>

            {/* Target Prediction Period Animation */}
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-[#0b1a3d] to-[#1e3a8a] text-white shadow-sm animate-period-pulse">
              <span className="text-[10px] font-mono-tech font-bold text-amber-300">TARGET:</span>
              <span className="text-[14px] font-mono-tech font-black text-white tracking-wider">
                #{upcomingPidShort}
              </span>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[9.5px] font-mono-tech text-slate-500 font-bold uppercase tracking-wider">
                PREDICTION
              </span>
              {!isUnlocked ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onRequestUnlock) onRequestUnlock();
                  }}
                  className="text-[11px] font-mono-tech font-black text-amber-700 flex items-center space-x-1 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 mt-0.5 cursor-pointer"
                >
                  <Lock size={10} />
                  <span>আনলক করুন</span>
                </button>
              ) : (
                <span className="text-[13px] font-serif-luxury font-black text-purple-700 flex items-center space-x-1">
                  <Eye size={12} className="text-purple-600" />
                  <span>{model.pred} {typeof model.num === 'number' ? `· ${model.num}` : ''}</span>
                </span>
              )}
            </div>
          </div>

          {/* 10-Period Detailed Audit Table */}
          <div className="bg-white rounded-lg border border-[#0b1a3d]/15 p-2 overflow-x-auto">
            <div className="text-[10px] font-mono-tech font-bold text-[#0b1a3d] mb-1 flex items-center justify-between">
              <span>LAST 10 ROUNDS VERIFICATION</span>
              <span className="text-emerald-600">{model.win_15m || 8} WINS / 30 ROUNDS</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 text-center font-mono-tech text-[10px]">
              {model.history.slice(0, 10).map((item, idx) => (
                <div
                  key={idx}
                  className={`p-1 rounded border flex flex-col items-center justify-center ${
                    item.res === 'WIN'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-red-50 border-red-300 text-red-800'
                  }`}
                >
                  <span className="text-[8.5px] opacity-75 font-semibold">#{item.pid.slice(-3)}</span>
                  <span className="font-extrabold text-[11px] leading-tight mt-0.5">
                    {item.res}
                  </span>
                  <span className="text-[8px] opacity-80">
                    {item.pred || item.actual || '-'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Meta Footer */}
          <div className="flex items-center justify-between text-[10px] font-mono-tech text-[#0b1a3d]/70 px-1">
            <span>Algorithm: <strong className="text-[#0b1a3d]">{model.reason || 'QUANT'}</strong></span>
            <span>Streak: <strong className="text-emerald-700">{model.streak || 0} Wins</strong></span>
            <span>PAC: <strong className="text-[#0b1a3d]">{model.pac || '1/38'}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
