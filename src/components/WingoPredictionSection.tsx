/**
 * Wingo Prediction Section Component
 * Exact match to the technical blueprint card layout.
 * Features live counting 30-second timer badge.
 */

import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { ClockHandIcon } from './ClockHandIcon.tsx';
import { useGeoLanguage } from '../utils/geoLocale.ts';
import type { WingoSignal } from '../types/index.ts';

interface WingoPredictionSectionProps {
  activeSignal?: WingoSignal | null;
  onOpenWingoDetail?: () => void;
}

export const WingoPredictionSection: React.FC<WingoPredictionSectionProps> = ({
  activeSignal,
  onOpenWingoDetail,
}) => {
  const { strings } = useGeoLanguage();

  // Live counting 30-second cycle: 30, 29, 28, ... 01, 00
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
    if (onOpenWingoDetail) {
      onOpenWingoDetail();
    }
  };

  return (
    <section id="section-wingo-prediction">
      {/* Section Header with Line */}
      <div className="flex items-center space-x-2 mb-2.5">
        <Sparkles size={14} className="text-[#0b1a3d]" />
        <h2 className="text-[12.5px] font-serif-luxury font-extrabold tracking-[0.12em] text-[#0b1a3d] whitespace-nowrap uppercase">
          WINGO PREDICTION
        </h2>
        <div className="h-[1.5px] bg-[#0b1a3d]/25 w-full ml-1" />
      </div>

      {/* Sleek Full-Width Card: Wingo 30s (Clicking opens detailed view from screenshot) */}
      <div className="w-full">
        <div
          id="wingo-30s-card"
          onClick={handleClick}
          className="screen-card card-dot-matrix py-3.5 px-4 flex items-center justify-between select-none w-full relative shadow-xs cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
        >
          {/* Tech Corner Accents # */}
          <span className="tech-hash top-1.5 left-2">#</span>
          <span className="tech-hash top-1.5 right-2">#</span>
          <span className="tech-hash bottom-1.5 left-2">#</span>
          <span className="tech-hash bottom-1.5 right-2">#</span>

          {/* Left: Logo & Titles */}
          <div className="flex items-center space-x-3.5 z-10 min-w-0 pr-2">
            {/* Dark Killer Wingo 30s Exact Logo */}
            <div className="relative w-12 h-12 rounded-xl p-[2px] border-[1.8px] border-[#0b1a3d] bg-black shadow-xs overflow-hidden flex-shrink-0">
              <img
                src="https://raw.githubusercontent.com/adminnirobvai1-ux/drx/refs/heads/main/IMG_20260912_224401_019.jpg"
                referrerPolicy="no-referrer"
                loading="eager"
                alt="Wingo 30s Logo"
                className="w-full h-full object-cover rounded-lg"
              />
              {/* Mini Active Radar Indicator */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
            </div>

            {/* Title & Single Elegant Line with Distinct Colors (No Clutter, 200 IQ Luxury) */}
            <div className="flex flex-col justify-center min-w-0 flex-1">
              <div className="flex items-center space-x-1.5">
                <h3 className="text-[16px] font-serif-luxury font-extrabold text-[#0b1a3d] tracking-tight leading-tight whitespace-nowrap">
                  Wingo 30s
                </h3>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 font-mono-tech text-[8.5px] font-extrabold tracking-wider">
                  LIVE AI
                </span>
              </div>
              {/* Smooth Left-to-Right and Right-to-Left Animated Bengali Text in One Line */}
              <div className="overflow-hidden w-full relative h-[18px] flex items-center mt-0.5">
                <div className="animate-pingpong-slide font-bangla text-[10.5px] whitespace-nowrap flex items-center space-x-1">
                  <span className="font-bold text-amber-600 tracking-tight">আল্ট্রা ফাস্ট</span>
                  <span className="text-slate-300 font-normal">|</span>
                  <span className="font-semibold text-emerald-600">৩০ সেকেন্ড</span>
                  <span className="text-slate-300 font-normal">|</span>
                  <span className="font-medium text-[#0b1a3d]/85">লাইভ সিগন্যাল</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Live Counting 30S Badge */}
          <div className="flex flex-col items-end z-10 pl-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              title="Click to view all Wingo 30s AI signals"
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
