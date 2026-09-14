/**
 * Security Lockdown Overlay
 * Displayed if DevTools or browser inspection tampering is detected.
 */

import React from 'react';
import { ShieldAlert, Lock, AlertTriangle } from 'lucide-react';

interface SecurityLockOverlayProps {
  reason?: string;
  onDismissDevDemo?: () => void;
  onReLogin?: () => void;
}

export const SecurityLockOverlay: React.FC<SecurityLockOverlayProps> = ({
  reason,
  onDismissDevDemo,
  onReLogin,
}) => {
  const isKicked =
    reason?.includes('KICKED') ||
    reason?.includes('PASSWORD_DELETED') ||
    reason?.includes('PASSWORD_DEACTIVATED') ||
    reason?.includes('পাসওয়ার্ড') ||
    reason?.includes('লগআউট');

  const title = isKicked ? 'সেশন সমাপ্ত / ডিভাইস লগআউট' : '403 Forbidden';
  const description = isKicked
    ? 'আপনার ব্যবহৃত পাসওয়ার্ডটি ডিলিট বা ডিঅ্যাক্টিভ করা হয়েছে, অথবা অ্যাডমিন কর্তৃক এই ডিভাইসটি লগআউট করা হয়েছে।'
    : 'Developer Mode & Inspect Element are strictly disabled on this terminal.';

  return (
    <div
      id="security-lock-overlay"
      className="fixed inset-0 z-[999999] bg-[#0b1a3d] text-white flex flex-col items-center justify-center p-6 text-center select-none backdrop-blur-xl"
    >
      <div className="bg-[#12234e] border-[2px] border-red-500/60 rounded-2xl p-8 max-w-[420px] w-full shadow-2xl relative overflow-hidden">
        {/* Glowing warning line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 animate-pulse" />

        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/40 flex items-center justify-center text-red-400 shadow-inner">
            <ShieldAlert size={36} />
          </div>
        </div>

        <span className="inline-block px-3 py-1 rounded-full bg-red-500/20 text-red-300 font-mono-tech text-[11px] font-bold tracking-widest uppercase mb-3 border border-red-500/30">
          {isKicked ? 'DEVICE LOGGED OUT' : 'ACCESS BLOCKED'}
        </span>

        <h2 className="text-lg sm:text-xl font-serif-luxury font-black text-white tracking-wide mb-2">
          {title}
        </h2>

        <p className="text-[13px] text-slate-300 font-sans leading-relaxed mb-4">
          {description}
        </p>

        <div className="p-3 bg-[#08132e] rounded-xl border border-white/10 text-left mb-5 font-mono-tech text-[11px] text-slate-400">
          <div className="flex items-center space-x-1.5 text-amber-400 font-bold mb-1">
            <AlertTriangle size={13} />
            <span>{isKicked ? 'DISCONNECT NOTICE' : 'SECURITY VIOLATION'}</span>
          </div>
          <div className="text-slate-300 text-[11px]">
            {reason || 'UNAUTHORIZED_INSPECTION_ATTEMPT'}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Protected by Dark Killer™ Security Architecture
          </div>
        </div>

        {isKicked ? (
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => {
                if (onReLogin) {
                  onReLogin();
                } else {
                  window.location.reload();
                }
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <Lock size={14} />
              <span>নতুন পাসওয়ার্ড দিন</span>
            </button>
            <a
              href="https://t.me/DARK67HACK"
              target="_blank"
              rel="noreferrer"
              className="block w-full py-2 px-4 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-800 text-cyan-300 text-xs font-mono-tech transition-colors"
            >
              নতুন পাসওয়ার্ড নিতে টেলিগ্রামে যান
            </a>
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 font-mono-tech flex items-center justify-center space-x-1">
            <Lock size={12} className="text-emerald-400" />
            <span>Encrypted Session Suspended</span>
          </div>
        )}

        {/* Development resume button for testing */}
        {onDismissDevDemo && !isKicked && (
          <button
            onClick={onDismissDevDemo}
            className="mt-6 text-[10px] font-mono-tech text-slate-400 underline hover:text-white transition-colors"
          >
            [Dev Override: Resume Terminal]
          </button>
        )}
      </div>
    </div>
  );
};
