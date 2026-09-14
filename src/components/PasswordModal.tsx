/**
 * Password / VIP License Unlock Modal Component
 * 
 * Protects predictions behind Firebase-verified password system.
 * Features:
 * - Direct password input
 * - Validation against Firebase Realtime Database
 * - Instant Telegram Channel link redirect if incorrect or needed
 * - High-tech cyberpunk aesthetic with crystal clear typography
 */

import React, { useState } from 'react';
import { Lock, Key, Eye, EyeOff, ShieldAlert, Send, CheckCircle2, X } from 'lucide-react';
import { licenseService } from '../services/licenseService.ts';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMessage?: string;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMessage,
}) => {
  const [keyInput, setKeyInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const licenseState = licenseService.getState();
  const telegramLink = licenseState.telegramLink || 'https://t.me/DARK67HACK';

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) {
      setErrorMessage('অনুগ্রহ করে একটি পাসওয়ার্ড বা লাইসেন্স কি প্রবেশ করান।');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await licenseService.verifyPassword(keyInput.trim());
    setIsLoading(false);

    if (result.success) {
      setSuccessMessage(result.message);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 900);
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleOpenTelegram = () => {
    window.open(telegramLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-[#0a1020] border-2 border-[#1e3a8a] rounded-2xl p-6 shadow-2xl text-white overflow-hidden">
        {/* Glow corner accents */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center shadow-lg border border-amber-400/30">
            <Lock size={22} className="text-white" />
          </div>
          <div>
            <h3 className="font-serif-luxury text-lg font-black text-white tracking-wide">
              ভিআইপি এক্সেস আনলক
            </h3>
            <p className="text-[11px] text-amber-300/80 font-mono-tech tracking-wider">
              FIREBASE SECURE ACCESS GATE
            </p>
          </div>
        </div>

        {/* Prompt / Instructions */}
        <div className="mb-4 bg-blue-950/40 border border-blue-800/40 rounded-xl p-3 text-[12px] text-slate-300 leading-relaxed font-sans">
          {initialMessage || (
            <>
              সকল লাইভ প্রেডিকশন এবং অ্যালগরিদম সিগন্যাল অ্যাক্সেস করতে অনুগ্রহ করে আপনার
              <span className="font-bold text-amber-400"> পাসওয়ার্ড বা লাইসেন্স কি </span>
              প্রবেশ করান।
            </>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="block text-[11px] font-mono-tech text-slate-400 mb-1 tracking-wider uppercase">
              ENTER VIP PASSWORD / LICENSE KEY:
            </label>
            <div className="relative flex items-center">
              <Key size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Ex: DARK-VIP-777"
                className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-black/60 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-white placeholder-slate-500 text-sm font-mono-tech tracking-wider outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-700/60 text-red-200 text-[12px] flex items-start space-x-2 animate-shake">
              <ShieldAlert size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">{errorMessage}</p>
                <button
                  type="button"
                  onClick={handleOpenTelegram}
                  className="mt-1.5 inline-flex items-center space-x-1 text-[11.5px] font-bold text-amber-300 hover:underline"
                >
                  <Send size={12} />
                  <span>টেলিগ্রামে পাসওয়ার্ড নিতে এখানে ক্লিক করুন</span>
                </button>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-200 text-[12px] flex items-center space-x-2">
              <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
              <p className="font-medium">{successMessage}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-2.5 pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-serif-luxury font-black text-[13.5px] tracking-wider uppercase shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'যাচাই করা হচ্ছে...' : 'আনলক করুন (UNLOCK VIP)'}
            </button>

            {/* Telegram Channel Button */}
            <button
              type="button"
              onClick={handleOpenTelegram}
              className="w-full py-2.5 rounded-xl bg-[#229ED9]/20 hover:bg-[#229ED9]/30 border border-[#229ED9]/50 text-[#64c3f7] font-sans font-bold text-[12.5px] flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Send size={15} className="text-[#229ED9]" />
              <span>পাসওয়ার্ড নিতে টেলিগ্রাম চ্যানেলে জয়েন করুন</span>
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono-tech">
          <span>ENCRYPTED BY FIREBASE</span>
          <span>@DARK67HACK</span>
        </div>
      </div>
    </div>
  );
};
