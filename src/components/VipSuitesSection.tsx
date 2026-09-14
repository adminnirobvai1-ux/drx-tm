/**
 * Section: VIP SUITES & AI Component
 * Renders the dedicated PRO TRADER card with clean typography,
 * one-line subtle Bengali subtitle, live 30s timer, and zero clutter.
 */

import React, { useState, useEffect } from 'react';
import { Crown, Trophy } from 'lucide-react';
import { ClockHandIcon } from './ClockHandIcon.tsx';
import { playTechBeep } from '../utils/audioAnnouncer.ts';
import { useGeoLanguage } from '../utils/geoLocale.ts';
import type { VipLogicModel } from '../types/index.ts';

interface VipSuitesSectionProps {
  vipLogics: VipLogicModel[];
  onOpenProTrader: () => void;
}

export const VipSuitesSection: React.FC<VipSuitesSectionProps> = ({
  onOpenProTrader,
}) => {
  const { strings } = useGeoLanguage();

  // Live 30s cycle countdown
  const [countdown, setCountdown] = useState<number>(() => {
    const nowSec = Math.floor(Date.now() / 1000);
    const rem = 30 - (nowSec % 30);
    return rem === 30 ? 30 : rem;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const nowSec = Math.floor(Date.now() / 1000);
      const rem = 30 - (nowSec % 30);
      setCountdown(rem === 30 ? 30 : rem);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    playTechBeep(1200);
    onOpenProTrader();
  };

  return (
    <section id="section-vip-suites" className="pt-1 select-none">
      {/* Section Header with Line */}
      <div className="flex items-center space-x-2 mb-2.5">
        <Crown size={15} className="text-[#0b1a3d]" />
        <h2 className="text-[12.5px] font-serif-luxury font-extrabold tracking-[0.12em] text-[#0b1a3d] whitespace-nowrap uppercase">
          VIP SUITES & AI
        </h2>
        <div className="h-[1.5px] bg-[#0b1a3d]/25 w-full ml-1" />
      </div>

      {/* PRO TRADER Card - Clean & Clutter-Free */}
      <div className="w-full">
        <div
          id="pro-trader-main-card"
          onClick={handleClick}
          className="screen-card card-dot-matrix py-3 px-4 flex items-center justify-between select-none w-full relative shadow-xs cursor-pointer hover:shadow-md transition-all active:scale-[0.99] border-[1.8px] border-[#0b1a3d] hover:border-amber-500 rounded-[18px] bg-white group"
        >
          {/* Tech Corner Accents # */}
          <span className="tech-hash top-1.5 left-2">#</span>
          <span className="tech-hash top-1.5 right-2">#</span>
          <span className="tech-hash bottom-1.5 left-2">#</span>
          <span className="tech-hash bottom-1.5 right-2">#</span>

          {/* Left: Golden Trophy Avatar & Clean Titles */}
          <div className="flex items-center space-x-3.5 z-10 min-w-0 pr-2">
            {/* Golden Trophy Icon Box */}
            <div className="relative w-12 h-12 rounded-xl p-[2px] border-[1.8px] border-amber-500/80 bg-gradient-to-br from-[#2a084e] to-[#120324] shadow-xs flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
              <Trophy size={22} className="text-amber-400 fill-amber-400 animate-pulse" />
              {/* Mini Active Indicator */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
            </div>

            {/* Title & Single Elegant Line with Distinct Colors (No Clutter, 200 IQ Luxury) */}
            <div className="flex flex-col justify-center min-w-0 flex-1">
              <div className="flex items-center space-x-1.5 whitespace-nowrap">
                <h3 className="text-[16px] font-serif-luxury font-extrabold text-[#0b1a3d] tracking-tight leading-tight group-hover:text-amber-700 transition-colors whitespace-nowrap">
                  PRO TRADER
                </h3>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/15 border border-amber-500/50 text-amber-700 font-mono-tech text-[8.5px] font-extrabold tracking-wider whitespace-nowrap">
                  VIP 3X
                </span>
              </div>
              {/* Smooth Left-to-Right and Right-to-Left Animated Bengali Text in One Line */}
              <div className="overflow-hidden w-full relative h-[18px] flex items-center mt-0.5">
                <div className="animate-pingpong-slide font-bangla text-[10.5px] whitespace-nowrap flex items-center space-x-1">
                  <span className="font-bold text-amber-600 tracking-tight">সেরা ৬টি</span>
                  <span className="text-slate-300 font-normal">|</span>
                  <span className="font-semibold text-emerald-600">উচ্চ নির্ভুলতা</span>
                  <span className="text-slate-300 font-normal">|</span>
                  <span className="font-medium text-[#0b1a3d]/85">লাইভ সিগন্যাল</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Live Counting 30S Badge Timer */}
          <div className="flex items-center space-x-2 flex-shrink-0 z-10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              title="Click to view Pro Trader"
              className="px-3.5 py-1.5 rounded-lg bg-[#0b1a3d] text-white text-[12.5px] font-mono-tech font-bold tracking-wider shadow-sm flex items-center space-x-1.5 cursor-pointer active:scale-95 transition-transform"
            >
              <ClockHandIcon size={14} className="text-amber-400" />
              <span className="tabular-nums">
                {countdown < 10 ? `0${countdown}S` : `${countdown}S`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
