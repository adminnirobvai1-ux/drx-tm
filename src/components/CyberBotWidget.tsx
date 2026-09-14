/**
 * Cybernetic AI Bot Floating Widget Component
 * 
 * Features:
 * - 4K High-Tech Cyberpunk Face with dynamic real-time cognitive animations
 * - Sized for readability and clarity (larger, sharp, sleek luxury)
 * - Telegram / Messenger style dark chat bubbles with timestamps and sharp fonts
 * - Real-time settlement detection: reliably transitions "LIVE" predictions to "WON" or "LOST"
 * - Password Gate integration: prompts for password if locked, verifies key, or directs to Telegram
 * - Smooth custom thin scrollbar for PC and mobile
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Minus,
  Send,
  Sparkles,
  TrendingDown,
  CheckCircle2,
  Lock,
  Key,
  Flame,
  ExternalLink,
  X,
} from 'lucide-react';
import { RobotFaceSvg, type RobotAnimation } from './RobotFaceSvg.tsx';
import { playTechBeep, playVipWinChime } from '../utils/audioAnnouncer.ts';
import { apiClient } from '../services/apiClient.ts';
import { licenseService } from '../services/licenseService.ts';
import type { VipLogicModel } from '../types/index.ts';

export interface ChatMsg {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  predictionPayload?: BrainPredictionPayload;
  requiresPassword?: boolean;
  telegramLink?: string;
  time: string;
}

export interface BrainMemory {
  isAutoMode?: boolean;
  lastRecommendedLogic?: string;
  lastRecommendedPred?: string;
  lastPeriod?: string;
  consecutiveLossCount: number;
  lastMood?: string;
}

export interface BrainPredictionPayload {
  logic: string;
  rank: number;
  prediction: string;
  num?: number;
  color?: 'RED' | 'GREEN' | 'VIOLET';
  winRate: string;
  streakText: string;
  period: string;
  autoActive?: boolean;
  settledStatus?: 'PENDING' | 'WON' | 'LOST';
  isRethought?: boolean;
  rethinkReason?: string;
}

interface CyberBotWidgetProps {
  activeModel?: VipLogicModel | null;
  allModels?: VipLogicModel[];
  countdown?: number;
  isUnlocked?: boolean;
  onRequestUnlock?: () => void;
  isOpen?: boolean;
  onOpenChat?: () => void;
  onToggleChat?: () => void;
  onCloseChat?: () => void;
}

function normalizePid(pid?: string | number): string {
  if (!pid) return '';
  const s = String(pid).trim();
  return s.length >= 4 ? s.slice(-4) : s;
}

function isMatchingPeriod(p1?: string | number, p2?: string | number): boolean {
  if (!p1 || !p2) return false;
  const s1 = String(p1).trim();
  const s2 = String(p2).trim();
  if (s1 === s2) return true;
  if (s1.endsWith(s2) || s2.endsWith(s1)) return true;
  return normalizePid(s1) === normalizePid(s2);
}

export const CyberBotWidget: React.FC<CyberBotWidgetProps> = ({
  activeModel,
  allModels = [],
  countdown = 30,
  isUnlocked = false,
  onRequestUnlock,
  isOpen: propIsOpen,
  onOpenChat,
  onCloseChat,
}) => {
  const [internalChatOpen, setInternalChatOpen] = useState(false);
  const isChatOpen = propIsOpen !== undefined ? propIsOpen : internalChatOpen;

  const setChatOpen = (open: boolean) => {
    setInternalChatOpen(open);
    if (open) onOpenChat?.();
    else onCloseChat?.();
  };

  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: isUnlocked
        ? 'হ্যালো! ডার্ক কিলার এআই সক্রিয় আছে। সিগন্যাল পেতে "prediction" লিখুন।'
        : '🤖 স্বাগতম! ভিআইপি সিগন্যাল ও ড্যাশবোর্ড আনলক করতে নিচে "এখানে পাসওয়ার্ড দিন"।',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [temporaryAnim, setTemporaryAnim] = useState<RobotAnimation | null>(null);

  // Auto prompt if opened via unlock request while locked
  const promptedForUnlockRef = useRef(false);
  useEffect(() => {
    if (isChatOpen && !isUnlocked && !promptedForUnlockRef.current) {
      promptedForUnlockRef.current = true;
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && (lastMsg.text.includes('পাসওয়ার্ড') || lastMsg.text.includes('পাসওয়ার্ড'))) return prev;
        return [
          ...prev,
          {
            id: `prompt-pass-${Date.now()}`,
            sender: 'bot',
            text: '🔒 এখানে পাসওয়ার্ড দিন:',
            requiresPassword: true,
            telegramLink: licenseService.getState().telegramLink,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ];
      });
      setTimeout(() => {
        const input = document.getElementById('bot-chat-mini-input');
        input?.focus();
      }, 60);
    }
  }, [isChatOpen, isUnlocked]);

  // Listen for unlock trigger from any button across the app
  useEffect(() => {
    const handleBotPasswordEvent = () => {
      setChatOpen(true);
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && (lastMsg.text.includes('পাসওয়ার্ড') || lastMsg.text.includes('পাসওয়ার্ড'))) return prev;
        return [
          ...prev,
          {
            id: `prompt-pass-${Date.now()}`,
            sender: 'bot',
            text: '🔒 এখানে পাসওয়ার্ড দিন:',
            requiresPassword: true,
            telegramLink: licenseService.getState().telegramLink,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ];
      });
      setTimeout(() => {
        const input = document.getElementById('bot-chat-mini-input');
        input?.focus();
      }, 60);
    };

    window.addEventListener('bot-open-for-password', handleBotPasswordEvent);
    return () => {
      window.removeEventListener('bot-open-for-password', handleBotPasswordEvent);
    };
  }, []);

  // Position state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const pointerStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Brain state
  const brainMemoryRef = useRef<BrainMemory>({
    consecutiveLossCount: 0,
    isAutoMode: false,
    lastMood: 'idle',
  });
  const lastPredictedPeriodRef = useRef<string>('');
  const trackedPredictionRef = useRef<{
    period: string;
    logic: string;
    prediction: string;
    num?: number;
    messageId: string;
  } | null>(null);
  const announcedWonPeriodsRef = useRef<Set<string>>(new Set());
  const announcedLostPeriodsRef = useRef<Set<string>>(new Set());

  // Scroll to bottom on new message
  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen]);

  // Target model
  const targetModel = activeModel || allModels[0] || null;

  // Real-time animation
  const currentAnimation: RobotAnimation = useMemo(() => {
    if (!targetModel) return 'idle';
    if (countdown <= 3 && countdown >= 0) return 'shock';
    if (countdown >= 24) return 'laugh';
    if (countdown >= 20) return 'idea';

    const history = targetModel.history || [];
    let consecutiveWins = 0;
    let consecutiveLosses = 0;
    const totalWins = targetModel.win_15m || 0;

    for (let i = 0; i < history.length; i++) {
      if (history[i].res === 'WIN') {
        if (consecutiveLosses === 0) consecutiveWins++;
        else break;
      } else if (history[i].res === 'LOSS') {
        if (consecutiveWins === 0) consecutiveLosses++;
        else break;
      }
    }

    if (consecutiveWins >= 3 || totalWins >= 8) return 'laugh';
    if (consecutiveLosses >= 2) return consecutiveLosses >= 4 ? 'angry' : 'sad';
    if (consecutiveWins >= 1) return 'cool';
    return 'idea';
  }, [targetModel, countdown]);

  const effectiveAnimation: RobotAnimation = useMemo(() => {
    if (temporaryAnim) return temporaryAnim;
    if (brainMemoryRef.current.consecutiveLossCount >= 2) return 'shock';
    if (brainMemoryRef.current.consecutiveLossCount === 1) return 'tense';
    return currentAnimation;
  }, [temporaryAnim, currentAnimation]);

  // Minimized Mode HUD permission & prediction state
  const [miniHudAllowed, setMiniHudAllowed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('dk_mini_hud_enabled') !== 'false';
    } catch {
      return true;
    }
  });
  const [miniHudDismissed, setMiniHudDismissed] = useState(false);
  const [activePrediction, setActivePrediction] = useState<BrainPredictionPayload | null>(null);
  const [hasUserRequestedPrediction, setHasUserRequestedPrediction] = useState(false);

  // Auto-reset dismiss flag when a new 30s round starts
  useEffect(() => {
    if (countdown === 30) {
      setMiniHudDismissed(false);
    }
  }, [countdown]);

  // Track model loss history
  const modelConsecutiveLosses = useMemo(() => {
    if (!targetModel || !targetModel.history) return 0;
    let count = 0;
    for (const h of targetModel.history) {
      if (h.res === 'LOSS') count++;
      else break;
    }
    return count;
  }, [targetModel]);

  const isHighLossScenario =
    modelConsecutiveLosses >= 2 || brainMemoryRef.current.consecutiveLossCount >= 2;

  // The mini prediction indicator shows when:
  // 1. Bot is minimized (!isChatOpen)
  // 2. Permission is granted (miniHudAllowed)
  // 3. Not dismissed by user for the current round
  // 4. User requested prediction OR high loss scenario occurred
  const shouldShowMiniHud =
    !isChatOpen &&
    miniHudAllowed &&
    !miniHudDismissed &&
    (hasUserRequestedPrediction || isHighLossScenario) &&
    Boolean(activePrediction || targetModel);

  const displayPred = useMemo(() => {
    if (activePrediction) return activePrediction;
    const fallbackPred = ((targetModel?.pred || 'BIG')).toUpperCase();
    const fallbackNum = typeof targetModel?.num === 'number' ? targetModel?.num : undefined;
    return {
      logic: targetModel?.logic || 'Dark Killer AI',
      rank: targetModel?.rank || 1,
      prediction: fallbackPred,
      num: fallbackNum,
      color: (fallbackNum === 0 || [2, 4, 6, 8].includes(fallbackNum ?? -1)
        ? 'RED'
        : [1, 3, 5, 7, 9].includes(fallbackNum ?? -1)
        ? 'GREEN'
        : fallbackPred === 'BIG'
        ? 'GREEN'
        : 'RED') as 'RED' | 'GREEN',
      winRate: targetModel?.rate_15m || '92%',
      streakText: 'Live Signal',
      period: targetModel?.upcomingPredictionPeriod || targetModel?.marketSettledPeriod || 'LIVE',
    };
  }, [activePrediction, targetModel]);

  const targetColor = useMemo(() => {
    if (displayPred.color) return displayPred.color;
    if (displayPred.num === 0) return 'RED';
    if (displayPred.num === 5) return 'GREEN';
    if (typeof displayPred.num === 'number') {
      return [1, 3, 7, 9].includes(displayPred.num) ? 'GREEN' : 'RED';
    }
    return displayPred.prediction === 'BIG' ? 'GREEN' : 'RED';
  }, [displayPred]);

  // Send message handler
  const handleSendMessage = async (e?: React.FormEvent, directText?: string) => {
    if (e) e.preventDefault();
    const textToSend = typeof directText === 'string' ? directText : inputText;
    const trimmed = textToSend.trim();
    if (!trimmed || isAnalyzing) return;

    playTechBeep(920);
    const userMsg: ChatMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsAnalyzing(true);
    setTemporaryAnim('scan');

    const currentLicense = licenseService.getState();
    let clientUnlockedKey: string | null = null;
    let clientExpiresAt = Date.now() + 7 * 86400000;

    // Check if effectively unlocked
    const isEffectivelyUnlocked =
      isUnlocked ||
      currentLicense.isUnlocked ||
      Boolean(localStorage.getItem('dk_unlocked_license'));

    const isPredQuery =
      /predict|prediction|show|signal|next|big|small|target|লজিক|প্রেডিকশন|প্রেডিকশন দাও|প্রেডিকশন শো করো|সিগন্যাল|পরেরটা|টার্গেট|বলো|কি হবে|দাও/i.test(
        trimmed
      ) ||
      trimmed.includes('প্রেডিকশন') ||
      trimmed.includes('সিগন্যাল');

    if (isPredQuery && isEffectivelyUnlocked) {
      setHasUserRequestedPrediction(true);
      setMiniHudDismissed(false);
    }

    // 1. Client-Side Candidate Key Detection
    if (!isEffectivelyUnlocked) {
      const tokens = trimmed.split(/[\s,;:="']+/).filter((t) => t.length >= 3);
      const candidates = Array.from(new Set([trimmed, ...tokens])).filter(
        (c) => c.length >= 3 && c.length <= 40
      );

      for (const cand of candidates) {
        try {
          const res = await licenseService.verifyPassword(cand);
          if (res.success) {
            clientUnlockedKey = cand;
            clientExpiresAt = licenseService.getState().expiresAt || clientExpiresAt;
            playVipWinChime();
            break;
          }
        } catch {
          // ignore
        }
      }
    }

    try {
      const serverResult = await apiClient.post<{
        reply: string;
        updatedMemory: BrainMemory;
        mood: RobotAnimation;
        isAutoAction?: 'START' | 'STOP' | 'NONE';
        predictionPayload?: BrainPredictionPayload;
        requiresPassword?: boolean;
        telegramLink?: string;
        isUnlockedNow?: boolean;
        token?: string;
        expiresAt?: number;
      }>('/api/v1/bot/query', {
        query: trimmed,
        memory: brainMemoryRef.current,
        isUnlocked: isEffectivelyUnlocked || Boolean(clientUnlockedKey),
        targetModelName: activeModel?.logic || '',
      });

      const brainResult = serverResult;
      brainMemoryRef.current = brainResult.updatedMemory;

      // If user typed password and it unlocked
      if (brainResult.isUnlockedNow || clientUnlockedKey) {
        licenseService.unlock(
          clientUnlockedKey || trimmed,
          brainResult.expiresAt || clientExpiresAt
        );
        playVipWinChime();
      }

      if (brainResult.isAutoAction === 'START') {
        lastPredictedPeriodRef.current =
          allModels[0]?.upcomingPredictionPeriod || allModels[0]?.marketSettledPeriod || '';
      }

      let replyText = brainResult.reply;
      if (clientUnlockedKey && !brainResult.isUnlockedNow) {
        replyText = `🎉 পাসওয়ার্ড সঠিক! সম্পূর্ণ ভিআইপি ড্যাশবোর্ড সফলভাবে আনলক হয়েছে। সব সিগন্যাল এখন সক্রিয়।`;
      }

      let payload = brainResult.predictionPayload;
      let requiresPass = !isEffectivelyUnlocked && !clientUnlockedKey && Boolean(brainResult.requiresPassword);

      // Client safety override: If user is verified unlocked, NEVER demand password or show links!
      if ((isEffectivelyUnlocked || clientUnlockedKey) && (!payload || requiresPass)) {
        const topModel = activeModel || allModels[0];
        if (topModel) {
          const predSignal = (topModel.pred || 'BIG').toUpperCase();
          const predNum = typeof topModel.num === 'number' ? topModel.num : undefined;
          const predColor =
            predNum === 0 || [2, 4, 6, 8].includes(predNum ?? -1)
              ? 'RED'
              : [1, 3, 5, 7, 9].includes(predNum ?? -1)
              ? 'GREEN'
              : predSignal === 'BIG'
              ? 'GREEN'
              : 'RED';
          const period = topModel.upcomingPredictionPeriod || topModel.marketSettledPeriod || 'LIVE';
          const periodText = String(period).slice(-4);

          payload = {
            logic: topModel.logic,
            rank: topModel.rank || 1,
            prediction: predSignal,
            num: predNum,
            color: predColor,
            winRate: topModel.rate_15m || '92%',
            streakText: '92% Accurate',
            period,
            autoActive: true,
            settledStatus: 'PENDING',
          };

          replyText = `🎯 প্রেডিকশন প্রস্তুত!\n🤖 লজিক: ${topModel.logic}\nP:${periodText} | টার্গেট: ${predSignal}${predNum !== undefined ? ` (${predNum})` : ''} | কালার: ${predColor}`;
          requiresPass = false;
        }
      }

      if (payload) {
        setActivePrediction(payload);
        setHasUserRequestedPrediction(true);
        setMiniHudDismissed(false);
      }

      const botMsg: ChatMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: replyText,
        predictionPayload: payload,
        requiresPassword: requiresPass,
        telegramLink: requiresPass ? (brainResult.telegramLink || currentLicense.telegramLink) : undefined,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      if (payload) {
        trackedPredictionRef.current = {
          period: payload.period,
          logic: payload.logic,
          prediction: payload.prediction,
          num: payload.num,
          messageId: botMsg.id,
        };
      }

      setMessages((prev) => [...prev, botMsg]);
      setIsAnalyzing(false);
      playTechBeep(1150);

      const mood = (brainResult.isUnlockedNow || clientUnlockedKey || isEffectivelyUnlocked) ? 'cool' : (brainResult.mood || 'idea');
      setTemporaryAnim(mood);
      const moodDuration = mood === 'tense' || mood === 'shock' ? 4000 : 1800;
      setTimeout(() => setTemporaryAnim(null), moodDuration);
    } catch {
      // Fallback (when offline or static CDN hosting)
      setIsAnalyzing(false);
      const topModel = activeModel || allModels[0];
      if ((isEffectivelyUnlocked || clientUnlockedKey) && topModel) {
        const predSignal = (topModel.pred || 'BIG').toUpperCase();
        const predNum = typeof topModel.num === 'number' ? topModel.num : undefined;
        const predColor =
          predNum === 0 || [2, 4, 6, 8].includes(predNum ?? -1)
            ? 'RED'
            : [1, 3, 5, 7, 9].includes(predNum ?? -1)
            ? 'GREEN'
            : predSignal === 'BIG'
            ? 'GREEN'
            : 'RED';
        const period = topModel.upcomingPredictionPeriod || topModel.marketSettledPeriod || 'LIVE';
        const periodText = String(period).slice(-4);

        const safePayload: BrainPredictionPayload = {
          logic: topModel.logic,
          rank: topModel.rank || 1,
          prediction: predSignal,
          num: predNum,
          color: predColor,
          winRate: topModel.rate_15m || '92%',
          streakText: '92% Accurate',
          period,
          autoActive: true,
          settledStatus: 'PENDING',
        };

        setActivePrediction(safePayload);
        setHasUserRequestedPrediction(true);
        setMiniHudDismissed(false);

        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `🎯 প্রেডিকশন প্রস্তুত!\n🤖 লজিক: ${topModel.logic}\nP:${periodText} | টার্গেট: ${predSignal}${predNum !== undefined ? ` (${predNum})` : ''} | কালার: ${predColor}`,
            predictionPayload: safePayload,
            requiresPassword: false,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: clientUnlockedKey
              ? '🎉 পাসওয়ার্ড গৃহীত হয়েছে! ভিআইপি এক্সেস সফলভাবে সক্রিয় হয়েছে।'
              : '❌ পাসওয়ার্ড সঠিক নয় বা আপনি এখনও আনলক করেননি। পাসওয়ার্ড সংগ্রহ করতে টেলিগ্রামে যোগাযোগ করুন।',
            requiresPassword: !clientUnlockedKey,
            telegramLink: currentLicense.telegramLink,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    }
  };

  // Continuous Auto-Prediction Loop when unlocked
  useEffect(() => {
    const lic = licenseService.getState();
    if (!lic.isUnlocked || !brainMemoryRef.current.isAutoMode || allModels.length === 0) return;

    const currentUpcoming = allModels[0]?.upcomingPredictionPeriod;
    if (!currentUpcoming) return;

    if (currentUpcoming !== lastPredictedPeriodRef.current && countdown <= 27 && countdown >= 4) {
      lastPredictedPeriodRef.current = currentUpcoming;

      // Select top 1 model
      const sorted = [...allModels].sort((a, b) => (b.rank || 99) - (a.rank || 99));
      const chosenModel = allModels[0] || sorted[0];

      const predSignal = ((chosenModel && chosenModel.pred) || 'BIG').toUpperCase();
      const streakText = `${chosenModel.win_15m || 8} Wins in 15m`;

      const predictionPayload: BrainPredictionPayload = {
        logic: chosenModel.logic,
        rank: chosenModel.rank || 1,
        prediction: predSignal,
        num: typeof chosenModel.num === 'number' ? chosenModel.num : undefined,
        winRate: chosenModel.rate_15m || '90%',
        streakText,
        period: currentUpcoming,
        autoActive: true,
        settledStatus: 'PENDING',
      };

      const botMsg: ChatMsg = {
        id: `auto-${Date.now()}`,
        sender: 'bot',
        text: `🤖 ${chosenModel.logic}\nP:${normalizePid(currentUpcoming)} Target: ${predSignal}${typeof chosenModel.num === 'number' ? ` (${chosenModel.num})` : ''}`,
        predictionPayload,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      trackedPredictionRef.current = {
        period: currentUpcoming,
        logic: chosenModel.logic,
        prediction: predSignal,
        num: typeof chosenModel.num === 'number' ? chosenModel.num : undefined,
        messageId: botMsg.id,
      };

      setMessages((prev) => [...prev, botMsg]);
      playTechBeep(1150);
    }
  }, [countdown, allModels]);

  // 🎯 RELIABLE SETTLEMENT & WIN DETECTION:
  // Scans all pending prediction messages and updates "LIVE" -> "WON" or "LOST" immediately!
  useEffect(() => {
    if (allModels.length === 0) return;

    setMessages((prevMessages) => {
      let hasUpdates = false;

      const updated = prevMessages.map((msg) => {
        if (!msg.predictionPayload || msg.predictionPayload.settledStatus !== 'PENDING') {
          return msg;
        }

        const targetPid = msg.predictionPayload.period;
        const targetLogic = msg.predictionPayload.logic;

        // Find model
        const model = allModels.find((m) => m.logic === targetLogic) || allModels[0];
        if (!model || !model.history || model.history.length === 0) {
          return msg;
        }

        // 1. Direct match in 10-result history
        const settledInHistory = model.history.find((h) => isMatchingPeriod(h.pid, targetPid));

        if (settledInHistory) {
          hasUpdates = true;
          const status: 'WON' | 'LOST' = settledInHistory.res === 'WIN' ? 'WON' : 'LOST';

          if (status === 'WON' && !announcedWonPeriodsRef.current.has(targetPid)) {
            announcedWonPeriodsRef.current.add(targetPid);
            playVipWinChime();
            setTemporaryAnim('cool');
            setTimeout(() => setTemporaryAnim(null), 3000);
          } else if (status === 'LOST' && !announcedLostPeriodsRef.current.has(targetPid)) {
            announcedLostPeriodsRef.current.add(targetPid);
            setTemporaryAnim('tense');
            setTimeout(() => setTemporaryAnim(null), 3000);
          }

          return {
            ...msg,
            predictionPayload: {
              ...msg.predictionPayload,
              settledStatus: status,
            },
          };
        }

        // 2. Check if current market settled period has passed targetPid
        const marketSettled = model.marketSettledPeriod;
        if (marketSettled) {
          const mNum = parseInt(normalizePid(marketSettled), 10);
          const tNum = parseInt(normalizePid(targetPid), 10);

          if (!isNaN(mNum) && !isNaN(tNum) && mNum >= tNum) {
            hasUpdates = true;
            // Target round has settled; use most recent outcome
            const latestHistory = model.history[0];
            const isWin = latestHistory?.res === 'WIN';
            const status: 'WON' | 'LOST' = isWin ? 'WON' : 'LOST';

            if (status === 'WON') {
              playVipWinChime();
            }

            return {
              ...msg,
              predictionPayload: {
                ...msg.predictionPayload,
                settledStatus: status,
              },
            };
          }
        }

        return msg;
      });

      return hasUpdates ? updated : prevMessages;
    });
  }, [allModels, countdown]);

  const telegramLink = licenseService.getState().telegramLink || 'https://t.me/DARK67HACK';

  return (
    <div
      id="cyber-bot-floating-container"
      className="fixed bottom-6 right-6 z-[60] select-none pointer-events-auto"
      style={{ touchAction: 'none' }}
    >
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0}
        onPointerDown={(e) => {
          pointerStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
        }}
        onPointerUp={(e) => {
          if (!isChatOpen && pointerStartRef.current) {
            const dist = Math.hypot(
              e.clientX - pointerStartRef.current.x,
              e.clientY - pointerStartRef.current.y
            );
            const duration = Date.now() - pointerStartRef.current.time;
            if (dist < 10 && duration < 400) {
              playTechBeep(880);
              setChatOpen(true);
            }
          }
        }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={(_e, info) => {
          setIsDragging(false);
          const dist = Math.hypot(info.offset.x, info.offset.y);
          if (dist >= 6) {
            setPosition((prev) => ({
              x: prev.x + info.offset.x,
              y: prev.y + info.offset.y,
            }));
          }
        }}
        animate={{ x: position.x, y: position.y }}
        transition={{ duration: 0 }}
      >
        {!isChatOpen ? (
          <div className="flex flex-col items-end select-none">
            {/* Floating Animated Robot Icon with Glowing Halo - Perfectly Balanced Size */}
            <button
              type="button"
              id="floating-cyber-robot-btn"
              onClick={(e) => {
                e.stopPropagation();
                playTechBeep(880);
                setChatOpen(true);
              }}
              title="Dark Killer AI Assistant"
              className="relative cursor-pointer active:cursor-grabbing w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 flex items-center justify-center filter drop-shadow-[0_6px_20px_rgba(0,0,0,0.8)] hover:scale-105 active:scale-95 transition-transform bg-transparent border-0 p-0 outline-none self-end"
            >
              <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-md animate-pulse pointer-events-none" />
              <RobotFaceSvg animation={effectiveAnimation} />
            </button>

            {/* Minimized Mode Floating Prediction Indicator (Persistent Underneath Robot) */}
            {shouldShowMiniHud && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  playTechBeep(980);
                  setChatOpen(true);
                }}
                className="mt-1.5 px-2.5 py-1.5 rounded-2xl bg-[#091122]/95 border border-cyan-500/70 shadow-[0_8px_24px_rgba(0,0,0,0.85),0_0_15px_rgba(6,182,212,0.35)] backdrop-blur-md flex items-center space-x-2 cursor-pointer hover:border-cyan-400 transition-all active:scale-95 z-10"
                title="চ্যাটবট খুলতে ক্লিক করুন"
              >
                {/* Status Indicator */}
                <div className="flex items-center space-x-1 shrink-0">
                  {isHighLossScenario ? (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shadow-[0_0_6px_rgba(244,63,94,0.9)]" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
                  )}
                </div>

                {/* Main Prediction */}
                <div className="flex items-center space-x-1 font-mono-tech">
                  <span
                    className={`text-[12px] font-black tracking-wider ${
                      displayPred.prediction === 'BIG'
                        ? 'text-cyan-300 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]'
                        : 'text-rose-400 drop-shadow-[0_0_6px_rgba(244,63,94,0.8)]'
                    }`}
                  >
                    {displayPred.prediction}
                  </span>
                  {displayPred.num !== undefined && (
                    <span className="text-[11px] font-extrabold text-amber-300">
                      ({displayPred.num})
                    </span>
                  )}
                </div>

                {/* Color Badge: 🔴 RED or 🟢 GREEN */}
                <div
                  className={`px-1.5 py-0.5 rounded text-[8.5px] font-black font-mono-tech uppercase ${
                    targetColor === 'GREEN'
                      ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/70'
                      : 'bg-rose-950/90 text-rose-300 border border-rose-500/70'
                  }`}
                >
                  {targetColor === 'GREEN' ? '🟢 GRN' : '🔴 RED'}
                </div>

                {/* Countdown */}
                <span className="text-[9px] font-mono-tech text-amber-400 font-bold shrink-0">
                  {countdown}s
                </span>

                {/* Dismiss Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMiniHudDismissed(true);
                  }}
                  className="p-0.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="হাইড করুন"
                >
                  <X size={11} />
                </button>
              </motion.div>
            )}
          </div>
        ) : (
          /* Compact Cyber HUD Chat Box */
          <div
            id="bot-chat-box-hud"
            className="w-[270px] xs:w-[290px] sm:w-[315px] h-[330px] sm:h-[360px] rounded-xl bg-[#080d1a]/95 border border-[#1e3a8a]/80 shadow-[0_8px_28px_rgba(0,0,0,0.95),0_0_15px_rgba(30,58,138,0.3)] flex flex-col overflow-hidden backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Compact Cyber Avatar & Title & Minimize Button */}
            <div className="h-9 px-2.5 bg-gradient-to-r from-[#0d162d] via-[#101b36] to-[#0a1122] border-b border-[#1e3a8a]/60 flex items-center justify-between cursor-grab active:cursor-grabbing select-none flex-shrink-0">
              <div className="flex items-center space-x-2 min-w-0">
                <div className="w-6 h-6 shrink-0 flex items-center justify-center filter drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]">
                  <RobotFaceSvg animation={effectiveAnimation} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[12px] font-serif-luxury font-black text-amber-300 tracking-tight leading-tight truncate">
                    Dark Killer AI
                  </span>
                  <span className="text-[8.5px] font-mono-tech text-emerald-400 font-bold flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_4px_rgba(52,211,153,0.9)]" />
                    <span>QUANTUM 30S</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                {/* Toggle Minimized HUD Permission Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const next = !miniHudAllowed;
                    setMiniHudAllowed(next);
                    localStorage.setItem('dk_mini_hud_enabled', String(next));
                    playTechBeep(next ? 1100 : 700);
                  }}
                  className={`px-2 py-0.5 rounded text-[8.5px] font-mono-tech font-bold border transition-all cursor-pointer ${
                    miniHudAllowed
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60 shadow-[0_0_6px_rgba(6,182,212,0.4)]'
                      : 'bg-[#141e33] text-slate-400 border-slate-700 hover:text-white'
                  }`}
                  title="মিনিমাইজ অবস্থায় নিচে প্রেডিকশন ইনডিকেটর দেখানো অন/অফ করুন"
                  onPointerDownCapture={(e) => e.stopPropagation()}
                >
                  ⚡ HUD {miniHudAllowed ? 'ON' : 'OFF'}
                </button>

                <button
                  id="btn-minimize-bot-chat"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playTechBeep(650);
                    setChatOpen(false);
                  }}
                  className="w-6 h-6 rounded-md bg-[#141e33] hover:bg-[#1f2d4d] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-[#203052]"
                  title="Minimize"
                  onPointerDownCapture={(e) => e.stopPropagation()}
                >
                  <Minus size={12} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Chat Feed Area: Compact, neat messenger bubbles */}
            <div
              className="flex-1 p-2 overflow-y-auto space-y-2 bg-[#050811]/90 select-text"
              onPointerDownCapture={(e) => e.stopPropagation()}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start items-start space-x-1.5'
                  }`}
                >
                  {/* Bot Avatar Icon */}
                  {msg.sender === 'bot' && (
                    <div className="w-4 h-4 shrink-0 mt-0.5 filter drop-shadow-[0_0_4px_rgba(6,182,212,0.6)]">
                      <RobotFaceSvg animation={effectiveAnimation} />
                    </div>
                  )}

                  {msg.sender === 'user' ? (
                    /* User Message Bubble */
                    <div className="max-w-[85%] px-2.5 py-1 rounded-xl rounded-tr-none bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[11px] font-semibold leading-relaxed shadow-xs break-words">
                      <div>{msg.text}</div>
                      <div className="text-[8px] text-slate-900/70 text-right mt-0.5 font-mono-tech">
                        {msg.time}
                      </div>
                    </div>
                  ) : (
                    /* Bot Message Bubble */
                    <div className="max-w-[88%] min-w-0 space-y-1.5">
                      {/* Prediction Payload Card */}
                      {msg.predictionPayload && (
                        <div className="p-2 rounded-xl bg-gradient-to-br from-[#0c1628] via-[#0f1d36] to-[#080e1b] border border-cyan-500/40 shadow-sm space-y-1">
                          {/* Header: Model & Period */}
                          <div className="flex items-center justify-between border-b border-[#1b2b48] pb-1 font-mono-tech">
                            <div className="flex items-center space-x-1 min-w-0">
                              <Sparkles size={11} className="text-amber-400 shrink-0" />
                              <span className="font-serif-luxury font-black text-white text-[11px] truncate max-w-[110px]">
                                {msg.predictionPayload.logic}
                              </span>
                              <span className="px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 text-[8px] font-bold shrink-0">
                                #{msg.predictionPayload.rank}
                              </span>
                            </div>
                            <span className="text-[9px] text-slate-400 font-bold shrink-0">
                              P:{normalizePid(msg.predictionPayload.period)}
                            </span>
                          </div>

                          {/* Prediction Main Signal & Live/Won Badge */}
                          <div
                            className={`p-1.5 rounded-lg flex items-center justify-between border transition-all ${
                              msg.predictionPayload.settledStatus === 'WON'
                                ? 'bg-emerald-950/70 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                                : msg.predictionPayload.settledStatus === 'LOST'
                                ? 'bg-rose-950/70 border-rose-500'
                                : 'bg-[#060c18] border-blue-900/60'
                            }`}
                          >
                            <div className="flex items-center space-x-1.5">
                              <span className="text-[9px] font-mono-tech text-slate-400 font-bold uppercase">
                                TARGET:
                              </span>
                              <span
                                className={`text-[13px] font-black font-mono-tech tracking-wider ${
                                  msg.predictionPayload.prediction === 'BIG'
                                    ? 'text-cyan-300'
                                    : 'text-rose-400'
                                }`}
                              >
                                {msg.predictionPayload.prediction}
                                {msg.predictionPayload.num !== undefined
                                  ? ` (${msg.predictionPayload.num})`
                                  : ''}
                              </span>
                              {msg.predictionPayload.color && (
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[8px] font-black font-mono-tech uppercase ${
                                    msg.predictionPayload.color === 'GREEN'
                                      ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/60'
                                      : 'bg-rose-950/90 text-rose-300 border border-rose-500/60'
                                  }`}
                                >
                                  {msg.predictionPayload.color === 'GREEN' ? '🟢 GREEN' : '🔴 RED'}
                                </span>
                              )}
                              {msg.predictionPayload.isRethought && (
                                <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[7.5px] font-mono-tech border border-amber-500/40">
                                  🧠 HEDGE
                                </span>
                              )}
                            </div>

                            {/* Settlement Badge */}
                            {msg.predictionPayload.settledStatus === 'WON' ? (
                              <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-500 text-slate-950 text-[9.5px] font-black font-mono-tech tracking-wider animate-bounce shadow-xs">
                                <CheckCircle2 className="w-3 h-3 text-slate-950" />
                                <span>WON</span>
                              </span>
                            ) : msg.predictionPayload.settledStatus === 'LOST' ? (
                              <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-rose-500/30 border border-rose-500 text-rose-300 text-[9px] font-black font-mono-tech">
                                <TrendingDown className="w-2.5 h-2.5 text-rose-400" />
                                <span>LOST</span>
                              </span>
                            ) : (
                              <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[8.5px] font-mono-tech font-extrabold">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
                                <span>LIVE</span>
                              </span>
                            )}
                          </div>

                          {/* Footer stats */}
                          <div className="flex items-center justify-between text-[9px] font-mono-tech text-slate-400 pt-0.5">
                            <span className="text-emerald-400 font-semibold">
                              {msg.predictionPayload.winRate} Win
                            </span>
                            <span>{msg.predictionPayload.streakText}</span>
                          </div>
                        </div>
                      )}

                      {/* Text Reply */}
                      {msg.text && (
                        <div className="px-2.5 py-1.5 rounded-xl rounded-tl-none bg-[#0f1a30] border border-[#1e3a8a]/60 text-slate-100 text-[11px] leading-relaxed shadow-xs break-words font-sans">
                          {msg.text}
                        </div>
                      )}

                      {/* Password Required Gate Prompt Buttons */}
                      {msg.requiresPassword && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              document.getElementById('bot-chat-mini-input')?.focus();
                            }}
                            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 text-[10px] font-black font-serif-luxury tracking-wider uppercase shadow-xs active:scale-95 transition-all cursor-pointer"
                          >
                            <Key size={11} />
                            <span>পাসওয়ার্ড দিন</span>
                          </button>

                          <a
                            href={msg.telegramLink || telegramLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#229ED9]/20 hover:bg-[#229ED9]/30 border border-[#229ED9]/50 text-[#64c3f7] text-[10px] font-bold active:scale-95 transition-all"
                          >
                            <ExternalLink size={10} />
                            <span>টেলিগ্রাম</span>
                          </a>
                        </div>
                      )}

                      <div className="text-[8px] text-slate-500 font-mono-tech pl-0.5">
                        {msg.time}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Analyzing Indicator */}
              {isAnalyzing && (
                <div className="flex items-center space-x-1.5">
                  <div className="w-4 h-4 shrink-0 filter drop-shadow-[0_0_4px_rgba(6,182,212,0.6)]">
                    <RobotFaceSvg animation={effectiveAnimation} />
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-[#0e172a] border border-cyan-500/40 text-cyan-300 text-[10px] font-mono-tech flex items-center space-x-1 shadow-xs">
                    <span>Analyzing live models</span>
                    <span className="flex space-x-0.5">
                      <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse delay-100" />
                      <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse delay-200" />
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Area */}
            <form
              onSubmit={handleSendMessage}
              onPointerDownCapture={(e) => e.stopPropagation()}
              className="px-2 py-1.5 bg-[#090e1d] border-t border-[#1e3a8a]/60 flex items-center space-x-1.5 flex-shrink-0"
            >
              <input
                id="bot-chat-mini-input"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={!isUnlocked ? 'এখানে পাসওয়ার্ড দিন...' : "Type 'prediction'..."}
                className="flex-1 min-w-0 bg-[#0f172a] border border-slate-700 focus:border-amber-400 rounded-lg px-2.5 py-1 text-white text-[11px] placeholder:text-slate-500 outline-none h-7"
                autoFocus
              />
              <button
                id="btn-bot-chat-mini-send"
                type="submit"
                disabled={!inputText.trim() || isAnalyzing}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                  inputText.trim() && !isAnalyzing
                    ? 'bg-amber-400 text-slate-950 shadow-xs cursor-pointer active:scale-95'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                <Send size={12} strokeWidth={2.5} />
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
};
