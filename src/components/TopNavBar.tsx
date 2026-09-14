/**
 * Top App Navigation Bar Component
 * Matches the exact Dark Killer header, luxury serif font, and VIP status / Admin button.
 */

import React from 'react';
import { Zap, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useGeoLanguage } from '../utils/geoLocale.ts';

interface TopNavBarProps {
  onAiClick?: () => void;
  isUnlocked?: boolean;
  onRequestUnlock?: () => void;
  onOpenAdmin?: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  isUnlocked = false,
  onRequestUnlock,
  onOpenAdmin,
}) => {
  const { lang, strings } = useGeoLanguage();

  return (
    <header
      id="app-header"
      className="bg-white/95 backdrop-blur-md px-3.5 py-3 border-b-[1.8px] border-[#0b1a3d] flex items-center justify-between sticky top-0 z-30 select-none"
    >
      {/* Left: Logo & Title */}
      <div className="flex items-center space-x-2.5">
        {/* Exact Dark Killer Logo Container */}
        <div
          id="dark-killer-logo-container"
          className="relative w-11 h-11 rounded-xl p-[2px] border-[1.8px] border-[#0b1a3d] bg-black shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0"
        >
          <img
            src="https://raw.githubusercontent.com/adminnirobvai1-ux/drx/refs/heads/main/IMG_20260912_224401_019.jpg"
            referrerPolicy="no-referrer"
            loading="eager"
            alt="Dark Killer Logo"
            className="w-full h-full object-cover rounded-lg"
          />
          {/* Small corner dot indicator */}
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
        </div>
        <div>
          <h1
            id="brand-title"
            className="text-[17px] font-serif-luxury font-extrabold text-[#0b1a3d] tracking-tight leading-none mb-1"
          >
            Dark Killer
          </h1>
          <div className="flex items-center text-[11.5px] font-semibold text-[#0b1a3d]/85">
            <Zap size={13} className="text-amber-500 fill-amber-500 mr-1" />
            <span>Signal Dashboard</span>
          </div>
        </div>
      </div>

      {/* Right: VIP Unlock Badge / Status + Admin link */}
      <div className="flex items-center space-x-2">
        {!isUnlocked ? (
          <button
            type="button"
            onClick={onRequestUnlock}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border-[1.8px] border-amber-500 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[11px] font-mono-tech font-black shadow-xs hover:from-amber-300 hover:to-amber-400 cursor-pointer active:scale-95 transition-all"
            title="ভিআইপি আনলক করতে ক্লিক করুন"
          >
            <Lock size={12} className="text-slate-950" />
            <span>UNLOCK VIP</span>
          </button>
        ) : (
          <div className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border-[1.8px] border-emerald-500 bg-emerald-50 text-emerald-800 text-[11px] font-mono-tech font-black shadow-xs">
            <CheckCircle2 size={12} className="text-emerald-600" />
            <span>VIP UNLOCKED</span>
          </div>
        )}

        {/* Hidden/Discreet Admin Portal Button */}
        {onOpenAdmin && (
          <button
            type="button"
            onClick={onOpenAdmin}
            className="w-8 h-8 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            title="Admin Management"
          >
            <ShieldCheck size={15} />
          </button>
        )}
      </div>
    </header>
  );
};
