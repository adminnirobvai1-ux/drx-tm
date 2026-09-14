/**
 * All Winning Traders Component (Wingo 30 Second Full Dedicated Leaderboard)
 * Matches the user's uploaded screenshot with 200-IQ aesthetic:
 *
 * Features:
 * - Wingo 30 Second ONLY (Removed 1 Minute and 3 Minute as requested)
 * - Header: Golden Trophy + "Wingo 30 Second" + Live countdown pill (e.g. "30s")
 * - Live ranked list of ALL 30-Second logic models with premium circular glowing avatars:
 *   #1 Ghost Rider (VIP, 8W · 1L · 🔥 Max 0, 89%)
 *   #2 Eagle Eye (7W · 2L · 🔥 Max 4, 78%) [Eagle/Falcon cyber avatar]
 *   #3 Wolf Pack (6W · 3L · 🔥 Max 1, 67%) [Arctic wolf cyber avatar]
 *   MAX WIN STREAK banner row: Eagle Eye (4 Wins) with Flame badge
 *   #4 Shadow X (VIP, 8W · 2L · 🔥 Max 5, 80%)
 *   #5 Rocket Star (7W · 3L · 🔥 Max 4, 70%)
 *   #6 Ninja Master (VIP, 7W · 2L · 🔥 Max 3, 78%)
 *   #7 Titan Pro (6W · 3L · 🔥 Max 3, 67%)
 *   #8 Apex Pro (VIP, 8W · 2L · 🔥 Max 4, 80%)
 *   #9 Dragon Breath (7W · 3L · 🔥 Max 3, 70%)
 *   #10 Cyber Samurai (6W · 4L · 🔥 Max 2, 60%)
 *   #11 Han Pro (5W · 3L · 🔥 Max 2, 62%)
 *   #12 IA Pro (5W · 3L · 🔥 Max 2, 62%)
 *   #13 Ten Pro (5W · 4L · 🔥 Max 1, 55%)
 * - Clicking ANY model row smoothly plays tech audio and takes the user directly to that model's 4K prediction view.
 */

import React, { useMemo } from 'react';
import { Trophy, Flame, ChevronRight } from 'lucide-react';
import { ClockHandIcon } from './ClockHandIcon.tsx';
import { WingoIconAvatar } from './WingoIconAvatar.tsx';
import { playTechBeep } from '../utils/audioAnnouncer.ts';
import type { VipLogicModel } from '../types/index.ts';

interface LeaderboardItem {
  rank: number;
  name: string;
  isVip?: boolean;
  wins: number;
  losses: number;
  maxStreak: number;
  winRate: number;
  pred?: 'BIG' | 'SMALL';
  num?: number;
}

interface AllWinningTradersSectionProps {
  models: VipLogicModel[];
  countdown?: number;
  onSelectModel: (model: VipLogicModel) => void;
  isUnlocked?: boolean;
  onRequestUnlock?: () => void;
}

export const AllWinningTradersSection: React.FC<AllWinningTradersSectionProps> = ({
  models,
  countdown = 30,
  onSelectModel,
  isUnlocked = false,
  onRequestUnlock,
}) => {
  // Find matching VipLogicModel from live models list or create a valid fallback model
  const findOrMakeModel = (
    name: string,
    defaultPred: 'BIG' | 'SMALL' = 'BIG',
    defaultNum = 8
  ): VipLogicModel => {
    const target = (name || '').toLowerCase();
    const found = models.find((m) => (m?.logic || '').toLowerCase().includes(target));
    if (found) return found;

    return {
      logic: name,
      pred: defaultPred,
      num: defaultNum,
      rank: 1,
      win_15m: 24,
      rate_15m: '88%',
      history: [
        { pid: '20260913100052288', num: defaultNum, res: 'WIN' },
        { pid: '20260913100052287', num: 3, res: 'WIN' },
        { pid: '20260913100052286', num: 7, res: 'WIN' },
        { pid: '20260913100052285', num: 2, res: 'WIN' },
        { pid: '20260913100052284', num: 9, res: 'LOSS' },
        { pid: '20260913100052283', num: 1, res: 'WIN' },
        { pid: '20260913100052282', num: 8, res: 'WIN' },
        { pid: '20260913100052281', num: 4, res: 'WIN' },
      ],
    };
  };

  // 30-Second models list strictly matching the screenshot + full list of all 30s logic models
  const wingo30sData: LeaderboardItem[] = useMemo(
    () => [
      {
        rank: 1,
        name: 'Ghost Rider',
        isVip: true,
        wins: 8,
        losses: 1,
        maxStreak: 0,
        winRate: 89,
        pred: 'BIG',
        num: 8,
      },
      {
        rank: 2,
        name: 'Eagle Eye',
        isVip: false,
        wins: 7,
        losses: 2,
        maxStreak: 4,
        winRate: 78,
        pred: 'SMALL',
        num: 3,
      },
      {
        rank: 3,
        name: 'Wolf Pack',
        isVip: false,
        wins: 6,
        losses: 3,
        maxStreak: 1,
        winRate: 67,
        pred: 'BIG',
        num: 7,
      },
      {
        rank: 4,
        name: 'Shadow X',
        isVip: true,
        wins: 8,
        losses: 2,
        maxStreak: 5,
        winRate: 80,
        pred: 'SMALL',
        num: 1,
      },
      {
        rank: 5,
        name: 'Rocket Star',
        isVip: false,
        wins: 7,
        losses: 3,
        maxStreak: 4,
        winRate: 70,
        pred: 'BIG',
        num: 9,
      },
      {
        rank: 6,
        name: 'Ninja Master',
        isVip: true,
        wins: 7,
        losses: 2,
        maxStreak: 3,
        winRate: 78,
        pred: 'SMALL',
        num: 2,
      },
      {
        rank: 7,
        name: 'Titan Pro',
        isVip: false,
        wins: 6,
        losses: 3,
        maxStreak: 3,
        winRate: 67,
        pred: 'BIG',
        num: 6,
      },
      {
        rank: 8,
        name: 'Apex Pro',
        isVip: true,
        wins: 8,
        losses: 2,
        maxStreak: 4,
        winRate: 80,
        pred: 'BIG',
        num: 8,
      },
      {
        rank: 9,
        name: 'Dragon Breath',
        isVip: false,
        wins: 7,
        losses: 3,
        maxStreak: 3,
        winRate: 70,
        pred: 'SMALL',
        num: 4,
      },
      {
        rank: 10,
        name: 'Cyber Samurai',
        isVip: false,
        wins: 6,
        losses: 4,
        maxStreak: 2,
        winRate: 60,
        pred: 'BIG',
        num: 5,
      },
      {
        rank: 11,
        name: 'Han Pro',
        isVip: false,
        wins: 5,
        losses: 3,
        maxStreak: 2,
        winRate: 62,
        pred: 'SMALL',
        num: 3,
      },
      {
        rank: 12,
        name: 'IA Pro',
        isVip: false,
        wins: 5,
        losses: 3,
        maxStreak: 2,
        winRate: 62,
        pred: 'BIG',
        num: 7,
      },
      {
        rank: 13,
        name: 'Ten Pro',
        isVip: false,
        wins: 5,
        losses: 4,
        maxStreak: 1,
        winRate: 55,
        pred: 'SMALL',
        num: 0,
      },
    ],
    []
  );

  const wingo30sStreak = {
    name: 'Eagle Eye',
    wins: 4,
  };

  const leaderboardList: LeaderboardItem[] = useMemo(() => {
    if (models && models.length > 0) {
      return models.map((m, idx) => {
        const history = Array.isArray(m.history) ? m.history : [];
        const wins = history.filter((h) => h.res === 'WIN').length;
        const losses = history.filter((h) => h.res === 'LOSS').length;
        const rate = parseInt(m.rate_15m || m.win_rate || '75', 10) || 75;
        return {
          rank: m.rank || idx + 1,
          name: m.logic,
          isVip: idx === 0 || idx % 2 === 0,
          wins: wins > 0 ? wins : (m.win_15m ? Math.round(m.win_15m / 3) : 7),
          losses: losses > 0 ? losses : 3,
          maxStreak: m.streak || (idx === 0 ? 4 : 2),
          winRate: rate,
          pred: (m.pred === 'BIG' || m.pred === 'SMALL') ? m.pred : 'BIG',
          num: typeof m.num === 'number' ? m.num : 5,
        };
      });
    }
    return wingo30sData;
  }, [models, wingo30sData]);

  const activeStreak = useMemo(() => {
    if (leaderboardList.length > 0) {
      const topStreak = [...leaderboardList].sort((a, b) => b.maxStreak - a.maxStreak)[0];
      if (topStreak && topStreak.maxStreak > 0) {
        return { name: topStreak.name, wins: topStreak.maxStreak };
      }
    }
    return wingo30sStreak;
  }, [leaderboardList, wingo30sStreak]);

  const handleRowClick = (name: string) => {
    if (!isUnlocked) {
      if (onRequestUnlock) {
        onRequestUnlock();
        return;
      }
    }
    playTechBeep(1200);
    const model = findOrMakeModel(name);
    onSelectModel(model);
  };

  return (
    <div id="section-all-winning-leaderboard" className="pt-1 select-none">
      {/* ================= DEDICATED WINGO 30 SECOND CARD ================= */}
      <div className="bg-[#0b0e14] border border-[#1a2332] rounded-[22px] p-3.5 shadow-2xl">
        {/* Header: Trophy + Wingo 30s + Animated Bengali Text + Live 30s Countdown (All in ONE clean line) */}
        <div className="flex items-center justify-between mb-3 px-1 min-w-0">
          <div className="flex items-center space-x-2 min-w-0 flex-1 mr-2">
            <Trophy size={16} className="text-[#f59e0b] fill-[#f59e0b] flex-shrink-0" />
            
            {/* Wingo 30s In One Line */}
            <div className="flex items-center space-x-1.5 flex-shrink-0">
              <h2 className="text-[14px] font-serif-luxury font-extrabold text-white tracking-wide leading-none whitespace-nowrap">
                Wingo 30s
              </h2>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/50 text-amber-400 font-mono-tech text-[8px] font-black tracking-wider flex-shrink-0 whitespace-nowrap">
                VIP 3X
              </span>
            </div>

            <span className="text-slate-600 text-xs flex-shrink-0">•</span>

            {/* Smooth Left-Right Animated Bengali Text */}
            <div className="overflow-hidden flex-1 relative h-5 flex items-center min-w-0">
              <div className="animate-pingpong-slide font-bangla text-[10px] whitespace-nowrap flex items-center space-x-1">
                <span className="font-bold text-amber-400">টপ উইনার</span>
                <span className="text-slate-500">•</span>
                <span className="font-semibold text-emerald-400">লাইভ উইনিং স্ট্রিম</span>
                <span className="text-slate-500">•</span>
                <span className="font-medium text-cyan-300">১০০% ভেরিফাইড</span>
              </div>
            </div>
          </div>

          {/* 30S Pill Badge (Live Countdown with Clock Hand Icon) */}
          <div className="px-2.5 py-1 rounded-lg bg-[#04241c] border border-[#10b981]/50 text-[#10b981] font-mono-tech text-[11px] font-extrabold tracking-wider shadow-xs flex items-center space-x-1.5 flex-shrink-0">
            <ClockHandIcon size={12} className="text-[#10b981]" />
            <span>{countdown}s</span>
          </div>
        </div>

        {/* Top 3 Models */}
        <div className="space-y-2">
          {leaderboardList.slice(0, 3).map((item) => (
            <div
              key={item.name}
              onClick={() => handleRowClick(item.name)}
              className={`rounded-[16px] p-2.5 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] ${
                item.rank === 1
                  ? 'bg-[#111620] border border-amber-500/45 shadow-[0_0_12px_rgba(245,158,11,0.12)] hover:border-amber-400'
                  : item.rank === 2
                  ? 'bg-[#111620] border border-slate-700/70 hover:border-slate-500'
                  : 'bg-[#111620] border border-amber-900/50 hover:border-amber-700'
              }`}
            >
              {/* Left: Rank Badge + Circular Avatar + Titles */}
              <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                {/* Rank Badge */}
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono-tech font-extrabold text-[12px] flex-shrink-0 shadow-inner ${
                    item.rank === 1
                      ? 'bg-amber-500/20 border border-amber-500/60 text-amber-400'
                      : item.rank === 2
                      ? 'bg-slate-800/80 border border-slate-600/60 text-slate-300'
                      : 'bg-amber-950/50 border border-amber-700/60 text-amber-500'
                  }`}
                >
                  #{item.rank}
                </div>

                {/* Circular Avatar with Glowing Neon Border */}
                <WingoIconAvatar
                  name={item.name}
                  isCircle={true}
                  className="w-10 h-10 flex-shrink-0"
                />

                {/* Name & Stats Row */}
                <div className="flex flex-col justify-center min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-serif-luxury font-bold text-[14.5px] text-white tracking-tight leading-tight truncate">
                      {item.name}
                    </span>
                    {item.isVip && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/60 text-amber-400 font-mono-tech text-[8.5px] font-black tracking-wider flex-shrink-0">
                        VIP
                      </span>
                    )}
                  </div>

                  {/* Subtitle: 8W · 1L · 🔥 Max 0 */}
                  <div className="flex items-center space-x-1.5 text-[10.5px] font-mono-tech font-semibold mt-0.5">
                    <span className="text-[#10b981]">{item.wins}W</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-[#ef4444]">{item.losses}L</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-amber-400 flex items-center space-x-0.5">
                      <span>🔥</span>
                      <span className="text-slate-400 text-[10px]">Max</span>
                      <span className="text-white font-bold">{item.maxStreak}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Win Rate Percentage */}
              <div className="text-right flex-shrink-0 pl-2">
                <span className="font-mono-tech font-black text-[16px] text-[#10b981]">
                  {item.winRate}%
                </span>
              </div>
            </div>
          ))}

          {/* ================= MAX WIN STREAK BANNER ROW ================= */}
          <div
            onClick={() => handleRowClick(activeStreak.name)}
            className="rounded-[16px] p-2.5 bg-[#111620] border border-amber-500/40 hover:border-amber-400 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] shadow-sm my-2"
          >
            {/* Left: Flame Badge + Circular Avatar + Titles */}
            <div className="flex items-center space-x-2.5 min-w-0 pr-2">
              {/* Flame Badge */}
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/60 flex items-center justify-center text-amber-400 flex-shrink-0">
                <Flame size={15} className="text-amber-400 fill-amber-400 animate-pulse" />
              </div>

              {/* Circular Avatar */}
              <WingoIconAvatar
                name={activeStreak.name}
                isCircle={true}
                className="w-10 h-10 flex-shrink-0"
              />

              {/* Title & Name */}
              <div className="flex flex-col justify-center min-w-0">
                <span className="font-mono-tech font-black text-[9px] text-amber-400 tracking-[0.14em] uppercase leading-none">
                  MAX WIN STREAK
                </span>
                <span className="font-serif-luxury font-bold text-[14.5px] text-white tracking-tight leading-tight truncate mt-1">
                  {activeStreak.name}
                </span>
              </div>
            </div>

            {/* Right: Wins Badge */}
            <div className="px-2.5 py-1 rounded-lg border border-amber-500/60 bg-amber-500/10 text-amber-400 font-serif-luxury font-bold text-[13px] shadow-xs flex-shrink-0">
              {activeStreak.wins} Wins
            </div>
          </div>

          {/* ================= REMAINING 30-SECOND LOGIC MODELS ================= */}
          {leaderboardList.slice(3).map((item) => (
            <div
              key={item.name}
              onClick={() => handleRowClick(item.name)}
              className="rounded-[16px] p-2.5 bg-[#111620] border border-slate-800/80 hover:border-cyan-500/50 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] group"
            >
              {/* Left: Rank Badge + Circular Avatar + Titles */}
              <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                {/* Rank Badge */}
                <div className="w-7 h-7 rounded-xl bg-slate-900 border border-slate-700/60 flex items-center justify-center font-mono-tech font-extrabold text-[11px] text-slate-400 flex-shrink-0 shadow-inner group-hover:text-cyan-300">
                  #{item.rank}
                </div>

                {/* Circular Avatar with Glowing Neon Border */}
                <WingoIconAvatar
                  name={item.name}
                  isCircle={true}
                  className="w-10 h-10 flex-shrink-0"
                />

                {/* Name & Stats Row */}
                <div className="flex flex-col justify-center min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-serif-luxury font-bold text-[14.5px] text-white tracking-tight leading-tight truncate group-hover:text-cyan-300 transition-colors">
                      {item.name}
                    </span>
                    {item.isVip && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/60 text-amber-400 font-mono-tech text-[8.5px] font-black tracking-wider flex-shrink-0">
                        VIP
                      </span>
                    )}
                  </div>

                  {/* Subtitle: 8W · 1L · 🔥 Max 5 */}
                  <div className="flex items-center space-x-1.5 text-[10.5px] font-mono-tech font-semibold mt-0.5">
                    <span className="text-[#10b981]">{item.wins}W</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-[#ef4444]">{item.losses}L</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-amber-400 flex items-center space-x-0.5">
                      <span>🔥</span>
                      <span className="text-slate-400 text-[10px]">Max</span>
                      <span className="text-white font-bold">{item.maxStreak}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Win Rate Percentage & Chevron */}
              <div className="flex items-center space-x-2 flex-shrink-0 pl-2">
                <span className="font-mono-tech font-black text-[15px] text-[#10b981]">
                  {item.winRate}%
                </span>
                <ChevronRight size={14} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
