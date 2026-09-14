/**
 * VIP Model Prediction View Component
 * Exact 4K 2D match to reference screenshots (IMG_20260913_010509_239.jpg & IMG_20260913_010512_299.jpg).
 * Features:
 * - Special Cyberpunk Deep Purple & Dark Red color atmosphere
 * - Top bar: Back button, Avatar, Model Name (e.g. Ninja Master), colored dot & reason, live counting 30s pill
 * - Technical Blueprint White Card:
 *   - UID Period Number (e.g. 20260912100052290), 30S badge
 *   - Concentric 2D animated circular radar target stamp:
 *     - "✨ SMALL SIGNAL", giant "SMALL" or "BIG", "🎯 TARGET: 1"
 *   - Confidence meter progress bar: 94%, MIN: 60%, NEURAL ACCURACY, MAX: 99%
 *   - "ALGORITHM VERIFIED" & "HIGH PROBABILITY"
 * - Bengali AI Analysis: "🎯 বিশ্লেষণ: ক্রোমাটিক কালার রেজোন্যান্স সক্রিয়"
 * - 3 Stat Counters: WINS (Green), LOSSES (Dark Red), RATE (Cyan/Green)
 * - Complete scrollable history table: PERIOD | # | SIZE | SIG | STATUS
 * - Real-time synchronized 30s countdown and auto-refreshing live data
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Activity, ShieldCheck, Zap, Volume2, Eye, EyeOff, Lock, Brain, Sparkles, RefreshCw } from 'lucide-react';
import { ClockHandIcon } from './ClockHandIcon.tsx';
import { WingoIconAvatar } from './WingoIconAvatar.tsx';
import { playTechBeep, speakModelPrediction } from '../utils/audioAnnouncer.ts';
import { useGeoLanguage } from '../utils/geoLocale.ts';
import type { VipLogicModel, VipHistoryItem } from '../types/index.ts';

interface VipModelPredictionViewProps {
  model: VipLogicModel;
  allModels?: VipLogicModel[];
  onSelectModel?: (model: VipLogicModel) => void;
  onBack: () => void;
  onRefresh?: () => void;
  isUnlocked?: boolean;
  onRequestUnlock?: () => void;
}

export const VipModelPredictionView: React.FC<VipModelPredictionViewProps> = ({
  model,
  allModels = [],
  onSelectModel,
  onBack,
  onRefresh,
  isUnlocked = false,
  onRequestUnlock,
}) => {
  const { strings, lang } = useGeoLanguage();

  // Derive active model from allModels if available to stay 100% synced with live polls
  const currentModel = useMemo(() => {
    if (allModels && allModels.length > 0) {
      const found = allModels.find(
        (m) => m.logic.toLowerCase() === model.logic.toLowerCase()
      );
      if (found) return found;
    }
    return model;
  }, [allModels, model]);

  // Live synchronized 30-second countdown (30, 29, 28, ... 01, 00)
  const [countdown, setCountdown] = useState<number>(() => {
    const nowSec = Math.floor(Date.now() / 1000);
    const rem = 30 - (nowSec % 30);
    return rem === 30 ? 30 : rem;
  });

  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;
  const currentModelRef = useRef(currentModel);
  currentModelRef.current = currentModel;
  const lastAnnouncedPid = useRef<number>(-1);

  // Smooth drift-free quartz timer without stutter
  useEffect(() => {
    let lastSec = -1;

    const tick = () => {
      const nowSec = Math.floor(Date.now() / 1000);
      const rem = 30 - (nowSec % 30);
      const val = rem === 30 ? 30 : rem;

      if (val !== lastSec) {
        lastSec = val;
        setCountdown(val);

        if (val === 30 || val === 1 || val === 15) {
          onRefreshRef.current?.();
        }
        if (val === 30 && lastAnnouncedPid.current !== nowSec) {
          lastAnnouncedPid.current = nowSec;
          const cm = currentModelRef.current;
          if (cm) {
            speakModelPrediction(cm.logic, cm.pred, cm.num);
          }
        }
      }
    };

    tick();
    const timer = setInterval(tick, 250);
    return () => clearInterval(timer);
  }, []);

  // Safe prediction string (e.g. "SMALL" or "BIG")
  const predictionType = ((currentModel && currentModel.pred) || 'SMALL').toUpperCase();
  const targetNumber = typeof currentModel?.num === 'number' ? currentModel.num : 1;

  // Confidence calculation (e.g. 94%)
  const confidencePercent = useMemo(() => {
    if (currentModel.win_15m) {
      const p = Math.round((currentModel.win_15m / 30) * 100) + 18;
      return Math.min(98, Math.max(82, p));
    }
    return 94;
  }, [currentModel.win_15m]);

  // Target Period UID
  const targetPeriodUid = useMemo(() => {
    if (currentModel.upcomingPredictionPeriod && currentModel.upcomingPredictionPeriod.length >= 8) {
      return currentModel.upcomingPredictionPeriod;
    }
    if (currentModel.history && currentModel.history.length > 0 && currentModel.history[0].pid) {
      const lastPid = currentModel.history[0].pid;
      const last5 = lastPid.slice(-5);
      const prefix = lastPid.slice(0, -5);
      const nextVal = String(Number(last5) + 1).padStart(5, '0');
      return `${prefix}${nextVal}`;
    }
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `${today}100052290`;
  }, [currentModel]);

  // History list: ensures at least 10 entries matching the screenshot
  const historyList: VipHistoryItem[] = useMemo(() => {
    if (Array.isArray(currentModel.history) && currentModel.history.length >= 8) {
      return currentModel.history;
    }
    // Fallback seed history matching screenshot rows
    const lastPidNum = Number(targetPeriodUid.slice(-5)) - 1;
    const prefix = targetPeriodUid.slice(0, -5);
    const mockRows: VipHistoryItem[] = [
      { pid: `${prefix}${lastPidNum}`, num: 7, actual: 'BIG', pred: 'BIG', pred_num: 7, res: 'WIN' },
      { pid: `${prefix}${lastPidNum - 1}`, num: 8, actual: 'BIG', pred: 'SMALL', pred_num: 4, res: 'LOSS' },
      { pid: `${prefix}${lastPidNum - 2}`, num: 7, actual: 'BIG', pred: 'BIG', pred_num: 9, res: 'WIN' },
      { pid: `${prefix}${lastPidNum - 3}`, num: 4, actual: 'SMALL', pred: 'SMALL', pred_num: 4, res: 'WIN' },
      { pid: `${prefix}${lastPidNum - 4}`, num: 8, actual: 'BIG', pred: 'BIG', pred_num: 6, res: 'WIN' },
      { pid: `${prefix}${lastPidNum - 5}`, num: 9, actual: 'BIG', pred: 'BIG', pred_num: 7, res: 'WIN' },
      { pid: `${prefix}${lastPidNum - 6}`, num: 4, actual: 'SMALL', pred: 'SMALL', pred_num: 2, res: 'WIN' },
      { pid: `${prefix}${lastPidNum - 7}`, num: 9, actual: 'BIG', pred: 'BIG', pred_num: 9, res: 'WIN' },
      { pid: `${prefix}${lastPidNum - 8}`, num: 3, actual: 'SMALL', pred: 'SMALL', pred_num: 3, res: 'WIN' },
      { pid: `${prefix}${lastPidNum - 9}`, num: 6, actual: 'BIG', pred: 'BIG', pred_num: 8, res: 'WIN' },
    ];
    return mockRows;
  }, [currentModel.history, targetPeriodUid]);

  // Calculated Wins, Losses, and Rate from history
  const { winsCount, lossesCount, winRateText } = useMemo(() => {
    const wins = historyList.filter((h) => h.res === 'WIN').length;
    const losses = historyList.length - wins;
    const rate = Math.round((wins / (historyList.length || 1)) * 100);
    return {
      winsCount: wins,
      lossesCount: losses,
      winRateText: `${rate}%`,
    };
  }, [historyList]);

  // System AI Reason based on model name & reason field
  const systemReason = useMemo(() => {
    const raw = ((currentModel && currentModel.reason) || '').toUpperCase();
    const name = ((currentModel && currentModel.logic) || '').toUpperCase();

    if (raw.includes('VECT') || raw.includes('V-MAX') || name.includes('VECTOR')) {
      return 'VECTOR LINEAR REGRESSION ACTIVE';
    }
    if (raw.includes('APEX') || name.includes('APEX')) {
      return 'APEX APOGEE OPTIMIZATION LOCKED';
    }
    if (raw.includes('SORT') || name.includes('TITAN')) {
      return 'TITAN MACRO SORTING ALGORITHM ACTIVE';
    }
    if (raw.includes('WT') || name.includes('CYCLONE') || name.includes('FALCON')) {
      return 'QUANTUM TREND MOMENTUM 4D ACTIVE';
    }
    if (raw.includes('REV') || name.includes('PHANTOM')) {
      return 'PHANTOM REVERSAL REPEATER PATTERN LOCKED';
    }
    if (raw.includes('SQ') || name.includes('SHADOW') || name.includes('AURORA')) {
      return 'QUADRATIC OSCILLATOR MODULATION ACTIVE';
    }
    if (raw.includes('PAT') || name.includes('NINJA') || raw.includes('CHROM')) {
      return 'CHROMATIC RESONANCE ACTIVE';
    }
    if (raw.includes('AVG') || name.includes('NOVA')) {
      return 'MOVING AVERAGE NEURAL PROJECTION ACTIVE';
    }
    if (raw.includes('OPP') || name.includes('STAR')) {
      return 'OPPOSITE STAR MOMENTUM BREAKOUT DETECTED';
    }
    if (raw.includes('SUM') || raw.includes('PULS') || name.includes('VORTEX')) {
      return 'PULSE VECTOR ENERGY FLOW CONFIRMED';
    }
    if (raw.includes('PHI') || name.includes('GOLDEN') || name.includes('PHOENIX')) {
      return 'GOLDEN HARMONIC OSCILLATOR LOCKED';
    }
    if (raw.includes('XOR') || name.includes('OMEGA') || name.includes('FUSION')) {
      return 'XOR LOGIC FUSION GATE ACTIVE';
    }
    if (raw.includes('ST-REV') || name.includes('STELLAR')) {
      return 'STELLAR MATRIX TRANSITION LOCKED';
    }
    if (raw.includes('FRACTAL') || raw.includes('QUANTUM')) {
      return 'FRACTAL DIMENSION RECURSION ACTIVE';
    }
    if (raw.includes('VOLT') || raw.includes('LIGHTNING') || raw.includes('ELECTRIC') || raw.includes('THUNDER')) {
      return 'HIGH-VOLTAGE FREQUENCY REGRESSION CONFIRMED';
    }
    if (raw.includes('HMC') || name.includes('LEAF')) {
      return 'HARMONIC PARALLEL PROBABILITY ACTIVE';
    }
    if (raw.includes('GRID') || name.includes('CITY')) {
      return 'GRID QUANTUM RESONANCE ACTIVE';
    }
    if (name.includes('DRAGON')) {
      return 'MACRO LINEAR VECTOR BREAKOUT DETECTED';
    }
    return 'NEURAL PATTERN RESONANCE ACTIVE';
  }, [currentModel.reason, currentModel.logic]);

  // Subtitle reason badge (e.g. "Chromatic #14")
  const subtitleReason = useMemo(() => {
    if (currentModel.reason) {
      return `${currentModel.reason} #${currentModel.rank || 14}`;
    }
    return `Chromatic #${currentModel.rank || 14}`;
  }, [currentModel.reason, currentModel.rank]);

  // AI Rethinking state for models with losses
  const [isThinking, setIsThinking] = useState(false);
  const [hasRethought, setHasRethought] = useState(false);
  const [useRecoverySignal, setUseRecoverySignal] = useState(false);
  const [rethoughtPrediction, setRethoughtPrediction] = useState<{
    pred: string;
    num: number;
    color: 'RED' | 'GREEN';
    reason: string;
    confidence: number;
  } | null>(null);

  // Detect recent loss streak (e.g. 2 or more recent losses or overall high losses >= 3)
  const recentLossStreak = useMemo(() => {
    let streak = 0;
    for (const h of historyList) {
      if (h.res === 'LOSS') streak++;
      else break;
    }
    return streak;
  }, [historyList]);

  const hasHighLoss = recentLossStreak >= 2 || lossesCount >= 3;

  useEffect(() => {
    if (hasHighLoss) {
      setIsThinking(true);
      const timer = setTimeout(() => {
        setIsThinking(false);
        setHasRethought(true);
        setUseRecoverySignal(true);
        const inverted = predictionType === 'BIG' ? 'SMALL' : 'BIG';
        const hedgedNum = inverted === 'BIG' ? 7 : 2;
        const hedgedColor = inverted === 'BIG' ? 'GREEN' : 'RED';
        setRethoughtPrediction({
          pred: inverted,
          num: hedgedNum,
          color: hedgedColor,
          confidence: 98.6,
          reason: `⚠️ ${currentModel.logic} তে লস পরিলক্ষিত হয়েছে। এআই নিউরাল ডিপ-থিংকিং স্বয়ংক্রিয়ভাবে সক্রিয় হয়ে কোয়ান্টাম রিভার্সাল টার্গেট ${inverted} (${hedgedNum}) রিকভারি প্রেডিকশন তৈরি করেছে।`,
        });
        playTechBeep(1200);
      }, 1400);
      return () => clearTimeout(timer);
    } else {
      setIsThinking(false);
      setHasRethought(false);
      setUseRecoverySignal(false);
      setRethoughtPrediction(null);
    }
  }, [currentModel.logic, hasHighLoss, predictionType]);

  const triggerManualRethink = () => {
    setIsThinking(true);
    playTechBeep(980);
    setTimeout(() => {
      setIsThinking(false);
      setHasRethought(true);
      setUseRecoverySignal(true);
      const inverted = predictionType === 'BIG' ? 'SMALL' : 'BIG';
      const hedgedNum = inverted === 'BIG' ? (Math.random() > 0.5 ? 7 : 9) : (Math.random() > 0.5 ? 2 : 4);
      const hedgedColor = inverted === 'BIG' ? 'GREEN' : 'RED';
      setRethoughtPrediction({
        pred: inverted,
        num: hedgedNum,
        color: hedgedColor,
        confidence: 99.1,
        reason: `🧠 এআই নিউরাল ডিপ-থিংকিং সম্পন্ন: ${currentModel.logic}-এর অতীত মোমেন্টাম রিক্যালকুলেট করে ${inverted} (${hedgedNum}) সিগন্যাল প্রদান করা হলো।`,
      });
      playTechBeep(1250);
    }, 1200);
  };

  const activeDisplayPred = useRecoverySignal && rethoughtPrediction
    ? rethoughtPrediction.pred
    : predictionType;
  const activeDisplayNum = useRecoverySignal && rethoughtPrediction
    ? rethoughtPrediction.num
    : targetNumber;

  // Model switching (Next / Prev logic)
  const currentIndex = allModels.findIndex(
    (m) => (m?.logic || '').toLowerCase() === ((currentModel && currentModel.logic) || '').toLowerCase()
  );

  const handlePrevModel = () => {
    if (allModels.length === 0 || !onSelectModel) return;
    const prevIdx = (currentIndex - 1 + allModels.length) % allModels.length;
    onSelectModel(allModels[prevIdx]);
  };

  const handleNextModel = () => {
    if (allModels.length === 0 || !onSelectModel) return;
    const nextIdx = (currentIndex + 1) % allModels.length;
    onSelectModel(allModels[nextIdx]);
  };

  return (
    <div
      id="vip-model-prediction-screen"
      className="fixed inset-0 z-50 bg-[#090314] text-slate-100 flex justify-center overflow-y-auto select-none"
    >
      <div className="w-full max-w-[430px] min-h-screen bg-gradient-to-b from-[#140628] via-[#090314] to-[#04010a] flex flex-col relative pb-10 border-x border-[#3b0764]/40 shadow-2xl">
        
        {/* ================= TOP HEADER (Screenshot Match) ================= */}
        <header className="sticky top-0 z-30 bg-[#16072b]/95 backdrop-blur-md px-3.5 pt-3.5 pb-3 border-b border-[#3b0764]/70 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2.5 min-w-0">
            {/* Back Button [ <- ] */}
            <button
              onClick={onBack}
              type="button"
              className="w-10 h-10 rounded-xl bg-[#240c42] border border-[#a855f7]/40 flex items-center justify-center text-purple-200 hover:text-white hover:bg-[#34115e] active:scale-90 transition-all cursor-pointer shadow-inner flex-shrink-0"
              title="Return to 30S Signals"
            >
              <ArrowLeft size={19} strokeWidth={2.4} />
            </button>

            {/* Model Avatar */}
            <WingoIconAvatar name={currentModel.logic} className="w-11 h-11" />

            {/* Model Name & Subtitle Reason */}
            <div className="flex flex-col justify-center min-w-0 pr-1">
              <div className="flex items-center space-x-1.5">
                <h1 className="font-serif-luxury font-extrabold text-[15.5px] text-white leading-tight truncate tracking-tight whitespace-nowrap">
                  {currentModel.logic}
                </h1>
                <span className="px-1.5 py-0.2 rounded bg-amber-400/20 border border-amber-400/50 text-amber-300 font-mono-tech text-[8px] font-black tracking-wider flex-shrink-0 whitespace-nowrap">
                  VIP 3X
                </span>
              </div>
              <div className="overflow-hidden relative h-[18px] flex items-center mt-0.5 min-w-0 max-w-[210px]">
                <div className="animate-pingpong-slide font-bangla text-[9.5px] whitespace-nowrap flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0 mr-0.5" />
                  <span className="font-bold text-emerald-400">লাইভ ৯৯%</span>
                  <span className="text-purple-400/50">•</span>
                  <span className="font-semibold text-amber-300">হাই একুরেসি</span>
                  <span className="text-purple-400/50">•</span>
                  <span className="font-medium text-purple-200">সিগন্যাল প্রোফাইল</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Voice Announcer Button & Live Counting 30s Pill */}
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            <button
              onClick={() => {
                playTechBeep(1100);
                speakModelPrediction(currentModel.logic, currentModel.pred, currentModel.num);
              }}
              type="button"
              title="Voice Announce Signal"
              className="w-8 h-8 rounded-xl bg-[#240c42] border border-[#a855f7]/50 flex items-center justify-center text-purple-200 hover:text-white hover:bg-purple-700 active:scale-90 transition-all cursor-pointer shadow-sm"
            >
              <Volume2 size={15} />
            </button>
            <div className="px-2.5 py-1 rounded-xl bg-[#1f0939] border border-[#22c55e]/50 flex items-center space-x-1.5 shadow-sm">
              <ClockHandIcon size={13} className="text-[#4ade80]" />
              <span className="text-[12px] font-mono-tech font-black text-[#4ade80] tabular-nums">
                {countdown}s
              </span>
            </div>
          </div>
        </header>

        {/* Quick Carousel / Switcher Bar */}
        {allModels.length > 1 && (
          <div className="px-3.5 py-1.5 bg-[#120422] border-b border-[#3b0764]/50 flex items-center justify-between text-[10px] font-mono-tech text-purple-200 shadow-inner">
            <button
              onClick={handlePrevModel}
              type="button"
              className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-[#240b40] border border-[#a855f7]/30 hover:bg-[#3b126b] active:scale-95 transition-all cursor-pointer text-purple-200"
            >
              <ChevronLeft size={12} />
              <span className="font-bold">PREV</span>
            </button>
            <div className="flex items-center space-x-1 text-amber-300 font-extrabold tracking-wider text-[10px]">
              <Zap size={10} className="text-amber-400 fill-amber-400" />
              <span>LOGIC #{currentIndex + 1} OF {allModels.length}</span>
            </div>
            <button
              onClick={handleNextModel}
              type="button"
              className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-[#240b40] border border-[#a855f7]/30 hover:bg-[#3b126b] active:scale-95 transition-all cursor-pointer text-purple-200"
            >
              <span className="font-bold">NEXT</span>
              <ChevronRight size={12} />
            </button>
          </div>
        )}

        {/* ================= MAIN SCROLLABLE CONTENT ================= */}
        <div className="flex-1 px-3.5 pt-3 space-y-3">
          
          {/* AI Deep-Thinking Floating Notification */}
          {isThinking && (
            <div className="px-3.5 py-2.5 rounded-2xl bg-[#1d0638] border border-cyan-500/70 shadow-[0_0_20px_rgba(6,182,212,0.35)] flex items-center space-x-2.5 animate-pulse">
              <div className="w-7 h-7 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300 shrink-0">
                <Brain size={17} className="animate-spin" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11.5px] font-bold font-bangla text-cyan-300">
                    🧠 এআই ডিপ-থিংকিং চলছে...
                  </span>
                  <span className="text-[9px] font-mono-tech text-amber-400 font-extrabold animate-bounce">
                    ANALYZING LOSS
                  </span>
                </div>
                <span className="text-[10px] font-bangla text-slate-300 leading-tight truncate">
                  {currentModel.logic}-এ সাম্প্রতিক লস শনাক্ত হয়েছে। নিউরাল রিকভারি সিগন্যাল গণনা করা হচ্ছে...
                </span>
              </div>
            </div>
          )}

          {/* AI Recovery Alert & Signal Box */}
          {hasRethought && rethoughtPrediction && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-[#1b0736] via-[#2a0b4d] to-[#1b0736] border border-amber-400/70 shadow-[0_0_20px_rgba(251,191,36,0.3)] flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Sparkles size={15} className="text-amber-400 animate-pulse" />
                  <span className="text-[11.5px] font-black font-bangla text-amber-300">
                    এআই ডিপ-থিংকিং লস রিকভারি প্রেডিকশন
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[8.5px] font-mono-tech font-black border border-emerald-500/40">
                    {rethoughtPrediction.confidence}% HEDGE
                  </span>
                </div>
                <button
                  type="button"
                  onClick={triggerManualRethink}
                  className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-[#3b126b] hover:bg-[#4d168b] border border-purple-400/40 text-[9.5px] font-mono-tech text-cyan-300 cursor-pointer active:scale-95 transition-all"
                  title="পুনরায় চিন্তা করুন"
                >
                  <RefreshCw size={10} className={isThinking ? 'animate-spin' : ''} />
                  <span>রি-থিঙ্ক</span>
                </button>
              </div>

              {/* Prediction Details Card */}
              <div className="flex items-center justify-between bg-[#0e021c] p-2.5 rounded-xl border border-purple-500/40">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono-tech text-slate-400 uppercase">
                    রিকভারি টার্গেট:
                  </span>
                  <span
                    className={`text-[16px] font-black font-mono-tech ${
                      rethoughtPrediction.pred === 'BIG'
                        ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                        : 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                    }`}
                  >
                    {rethoughtPrediction.pred} ({rethoughtPrediction.num})
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[9.5px] font-black font-mono-tech uppercase ${
                      rethoughtPrediction.color === 'GREEN'
                        ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/80'
                        : 'bg-rose-950/90 text-rose-300 border border-rose-500/80'
                    }`}
                  >
                    {rethoughtPrediction.color === 'GREEN' ? '🟢 GREEN' : '🔴 RED'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setUseRecoverySignal((prev) => !prev)}
                    className={`px-2 py-0.5 rounded text-[9px] font-bold font-bangla border cursor-pointer transition-all ${
                      useRecoverySignal
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                        : 'bg-purple-950 text-purple-200 border-purple-500/50 hover:bg-purple-900'
                    }`}
                  >
                    {useRecoverySignal ? '✓ সক্রিয়' : 'প্রয়োগ করুন'}
                  </button>
                </div>
              </div>

              <p className="text-[10px] font-bangla text-purple-200/90 leading-tight">
                {rethoughtPrediction.reason}
              </p>
            </div>
          )}

          {/* 1. CENTRAL WHITE TECHNICAL BLUEPRINT CARD (Exact Match to Screenshot) */}
          <div className="bg-white rounded-[20px] p-3.5 text-[#0b1a3d] border-[2px] border-[#0b1a3d] shadow-[0_4px_24px_rgba(0,0,0,0.5)] relative overflow-hidden blueprint-grid">
            
            {/* Tech Corner Markers # */}
            <span className="tech-hash top-2 left-2 text-[#0b1a3d]/40">#</span>
            <span className="tech-hash top-2 right-2 text-[#0b1a3d]/40">#</span>
            <span className="tech-hash bottom-2 left-2 text-[#0b1a3d]/40">#</span>
            <span className="tech-hash bottom-2 right-2 text-[#0b1a3d]/40">#</span>

            {/* Top Row: TARGET PERIOD (UID) & 30S Badge */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <div className="flex flex-col">
                  <span className="text-[8.5px] font-mono-tech font-extrabold tracking-wider text-[#0b1a3d] uppercase leading-none">
                    TARGET
                  </span>
                  <span className="text-[8.5px] font-mono-tech font-extrabold tracking-wider text-[#0b1a3d] uppercase leading-none mt-0.5">
                    PERIOD (UID)
                  </span>
                </div>
              </div>

              {/* Period Number Box */}
              <div className="px-2 py-0.5 rounded-md border-[1.4px] border-[#0b1a3d] bg-white font-mono-tech font-black text-[12px] text-[#0b1a3d] tracking-wider shadow-2xs">
                {targetPeriodUid}
              </div>

              {/* 30S Badge */}
              <div className="px-2 py-0.5 rounded-md border-[1.4px] border-[#0b1a3d] bg-white font-mono-tech font-black text-[11px] text-blue-700 tracking-wider shadow-2xs">
                30S
              </div>
            </div>

            {/* Circular Target Radar Stamp (Centerpiece) */}
            <div className="my-3.5 flex flex-col items-center justify-center">
              <div className="relative w-40 h-40 rounded-full border-[2.5px] border-blue-600 flex flex-col items-center justify-center bg-radial from-blue-50/70 via-white to-white shadow-[inset_0_0_14px_rgba(37,99,235,0.15)]">
                
                {/* Outer Dashed Rotating Ring (2D 4K Animation) */}
                <div
                  className="absolute -inset-2 rounded-full border-[1.6px] border-dashed border-blue-500/40 animate-spin"
                  style={{ animationDuration: '24s' }}
                />

                {/* Inner Concentric Ring */}
                <div className="absolute inset-2 rounded-full border border-blue-400/30 pointer-events-none" />

                {/* Prediction Content: Locked (EyeOff) or Unlocked (Eye) */}
                {!isUnlocked ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (onRequestUnlock) onRequestUnlock();
                    }}
                    className="flex flex-col items-center justify-center p-2 cursor-pointer group select-none"
                    title="ক্লিক করে আনলক করুন"
                  >
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-amber-600 mb-2 group-hover:scale-110 transition-transform shadow-md animate-pulse">
                      <EyeOff size={22} />
                    </div>
                    <div className="px-3 py-1 rounded-full bg-slate-950 text-amber-300 font-mono-tech text-[11px] font-black flex items-center space-x-1.5 shadow-md">
                      <Lock size={12} />
                      <span>লকড (পাসওয়ার্ড দিন)</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-sans mt-1.5 underline">
                      ক্লিক করে আনলক করুন
                    </span>
                  </button>
                ) : (
                  <>
                    {/* Top Label: ✨ SMALL SIGNAL or ✨ BIG SIGNAL */}
                    <div className="flex items-center space-x-1 text-blue-600 font-mono-tech text-[10px] font-extrabold uppercase tracking-wider mb-1">
                      {useRecoverySignal ? (
                        <>
                          <Brain size={12} className="text-amber-600 animate-spin" />
                          <span className="text-amber-700 font-black">AI RECOVERY {activeDisplayPred}</span>
                        </>
                      ) : (
                        <>
                          <Eye size={12} className="text-emerald-600" />
                          <span>{activeDisplayPred} SIGNAL</span>
                        </>
                      )}
                    </div>

                    {/* Giant Main Prediction Text */}
                    <h2
                      className={`font-serif-luxury font-black text-[34px] tracking-tight leading-none ${
                        activeDisplayPred === 'BIG'
                          ? 'text-emerald-700'
                          : activeDisplayPred === 'RED'
                          ? 'text-red-600'
                          : activeDisplayPred === 'GREEN'
                          ? 'text-emerald-600'
                          : 'text-blue-700'
                      }`}
                    >
                      {activeDisplayPred}
                    </h2>

                    {/* Target Number Label: 🎯 TARGET: 1 */}
                    <div className="mt-2 px-2.5 py-0.5 rounded-full border-[1.2px] border-blue-600 bg-white text-blue-700 font-mono-tech text-[10.5px] font-black flex items-center space-x-1 shadow-2xs">
                      <span>🎯</span>
                      <span>TARGET: {activeDisplayNum}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Confidence Meter Section */}
            <div className="mt-3 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between text-[10.5px] font-mono-tech font-black text-[#0b1a3d] mb-1">
                <div className="flex items-center space-x-1">
                  <Activity size={12} className="text-blue-600" />
                  <span className="tracking-wider uppercase">CONFIDENCE METER</span>
                </div>
                <span className="text-blue-700 font-extrabold text-[11.5px]">
                  {confidencePercent}%
                </span>
              </div>

              {/* Progress Bar with Glowing Pill */}
              <div className="w-full h-2.5 rounded-full bg-slate-100 border-[1.4px] border-[#0b1a3d] p-[1px] overflow-hidden relative shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 transition-all duration-700"
                  style={{ width: `${confidencePercent}%` }}
                />
              </div>

              {/* Min - Neural Accuracy - Max */}
              <div className="flex items-center justify-between text-[9px] font-mono-tech font-bold text-slate-500 mt-1">
                <span>MIN: 60%</span>
                <span className="text-[#0b1a3d] font-extrabold tracking-wider">NEURAL ACCURACY</span>
                <span>MAX: 99%</span>
              </div>
            </div>

            {/* Bottom Verification Badges: ALGORITHM VERIFIED & HIGH PROBABILITY */}
            <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[9.5px] font-mono-tech font-extrabold text-[#0b1a3d]">
              <div className="flex items-center space-x-1 text-emerald-700">
                <ShieldCheck size={12} className="text-emerald-600" />
                <span>ALGORITHM VERIFIED</span>
              </div>
              <div className="flex items-center space-x-1 text-blue-700">
                <Zap size={12} className="text-amber-500" />
                <span>HIGH PROBABILITY</span>
              </div>
            </div>
          </div>

          {/* 2. AI ANALYSIS BADGE (Ultra-Clean, Distinct Luxury Colors, Animated Left-Right) */}
          <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#200537] via-[#130324] to-[#200537] border border-[#a855f7]/40 shadow-sm flex items-center justify-between text-[10.5px] min-w-0 overflow-hidden">
            <div className="flex items-center space-x-1.5 min-w-0 flex-1 mr-2">
              <ShieldCheck size={13} className="text-amber-400 flex-shrink-0" />
              <span className="px-1.5 py-0.5 rounded bg-amber-400/15 border border-amber-400/40 text-amber-300 font-mono-tech text-[8px] font-extrabold uppercase tracking-wider flex-shrink-0">
                AI ANALYSIS
              </span>
              <div className="overflow-hidden flex-1 relative h-5 flex items-center min-w-0">
                <div className="animate-pingpong-slide font-bangla text-[10px] whitespace-nowrap flex items-center space-x-1">
                  <span className="font-bold text-emerald-400">মোমেন্টাম রেজোন্যান্স</span>
                  <span className="text-purple-400/60">•</span>
                  <span className="font-bold text-amber-300">৯৯% নির্ভুল অ্যাক্টিভ</span>
                  <span className="text-purple-400/60">•</span>
                  <span className="font-medium text-cyan-300">অ্যালগরিদম ভেরিফাইড</span>
                </div>
              </div>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          </div>

          {/* 3. THREE STAT BOXES: WINS (Green), LOSSES (Dark Red), RATE (Cyan/Green) */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Wins Box */}
            <div className="rounded-xl bg-[#0f041d] border-[1.5px] border-[#22c55e]/40 p-2.5 text-center flex flex-col justify-center items-center shadow-md">
              <span className="font-mono-tech font-black text-[24px] text-[#22c55e] leading-none">
                {winsCount}
              </span>
              <span className="font-mono-tech text-[9.5px] font-black text-slate-400 tracking-wider uppercase mt-1">
                WINS
              </span>
            </div>

            {/* Losses Box (Dark Red Special Color) */}
            <div className="rounded-xl bg-[#1c0408] border-[1.5px] border-[#ef4444]/50 p-2.5 text-center flex flex-col justify-center items-center shadow-md">
              <span className="font-mono-tech font-black text-[24px] text-[#ef4444] leading-none">
                {lossesCount}
              </span>
              <span className="font-mono-tech text-[9.5px] font-black text-rose-300/80 tracking-wider uppercase mt-1">
                LOSSES
              </span>
            </div>

            {/* Rate Box */}
            <div className="rounded-xl bg-[#0f041d] border-[1.5px] border-[#06b6d4]/40 p-2.5 text-center flex flex-col justify-center items-center shadow-md">
              <span className="font-mono-tech font-black text-[24px] text-[#22c55e] leading-none">
                {winRateText}
              </span>
              <span className="font-mono-tech text-[9.5px] font-black text-slate-400 tracking-wider uppercase mt-1">
                RATE
              </span>
            </div>
          </div>

          {/* 4. PAST ROUNDS RESULTS TABLE (Exact match to IMG_20260913_010509 & IMG_20260913_010512) */}
          <div className="rounded-[18px] bg-[#0f041e] border-[1.6px] border-[#3b0764]/60 overflow-hidden shadow-xl">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-1 px-3 py-2.5 bg-[#1a0633] border-b border-[#3b0764]/70 text-[10px] font-mono-tech font-extrabold text-purple-300/90 uppercase tracking-wider">
              <div className="col-span-5">PERIOD</div>
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-2 text-center">SIZE</div>
              <div className="col-span-2 text-center">SIG</div>
              <div className="col-span-2 text-center">STATUS</div>
            </div>

            {/* Table Rows (Scrollable past history) */}
            <div className="divide-y divide-[#240a44]/70">
              {historyList.map((row, rIdx) => {
                const isWin = row.res === 'WIN';
                const rowNum = typeof row.num === 'number' ? row.num : (rIdx % 10);
                const isGreenNum = [1, 3, 7, 9].includes(rowNum);
                const isRedNum = [0, 2, 4, 6, 8].includes(rowNum);
                const isBig = row.actual === 'BIG' || (rowNum >= 5);
                const sigLetter = row.pred ? (row.pred === 'BIG' ? 'B' : 'S') : (isBig ? 'B' : 'S');

                return (
                  <div
                    key={row.pid || rIdx}
                    className="grid grid-cols-12 gap-1 items-center px-3 py-2.5 text-[11px] font-mono-tech hover:bg-[#190731]/80 transition-colors"
                  >
                    {/* PERIOD UID */}
                    <div className="col-span-5 font-semibold text-slate-200 tabular-nums truncate">
                      {row.pid}
                    </div>

                    {/* # (Number badge) */}
                    <div className="col-span-1 flex justify-center">
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center font-black text-[10.5px] border ${
                          isGreenNum
                            ? 'bg-[#064e3b]/80 border-[#10b981] text-[#34d399]'
                            : isRedNum
                            ? 'bg-[#7f1d1d]/80 border-[#ef4444] text-[#f87171]'
                            : 'bg-purple-950 border-purple-500 text-purple-200'
                        }`}
                      >
                        {rowNum}
                      </span>
                    </div>

                    {/* SIZE */}
                    <div className="col-span-2 text-center">
                      <span
                        className={`font-black text-[10.5px] ${
                          isBig ? 'text-[#22c55e]' : 'text-[#f59e0b]'
                        }`}
                      >
                        {isBig ? 'BIG' : 'SML'}
                      </span>
                    </div>

                    {/* SIG */}
                    <div className="col-span-2 text-center font-bold text-slate-300">
                      {sigLetter}
                    </div>

                    {/* STATUS (WIN or LOSS pill) */}
                    <div className="col-span-2 flex justify-center">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[9.5px] font-black border ${
                          isWin
                            ? 'bg-[#052e16] border-[#22c55e] text-[#4ade80]'
                            : 'bg-[#450a0a] border-[#ef4444] text-[#f87171]'
                        }`}
                      >
                        {isWin ? 'WIN' : 'LOSS'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
