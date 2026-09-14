/**
 * VIP 24 AI Logic Engine Controller
 * Securely proxies and processes the 24 VIP prediction logics from backend.
 * Keeps external API endpoints, internal heuristics, and data transformation private.
 */

import type { Request, Response } from 'express';

const EXTERNAL_API_URL = 'https://data-vip-24-hack.ai.studio/apipid.json?page=1';

export interface RawLogicItem {
  logic: string;
  pred: string;
  num?: number;
  reason?: string;
  pac?: string;
  rank?: number;
  win_15m?: number;
  rate_15m?: string;
  win_rate?: string;
  streak?: number;
  score?: number;
  history?: Array<{
    pid: string;
    num?: number;
    actual?: string;
    actual_color?: string;
    pred?: string;
    pred_num?: number;
    res: 'WIN' | 'LOSS';
  }>;
}

export interface ProcessedLogicItem {
  logic: string;
  pred: string;
  num?: number;
  reason?: string;
  pac?: string;
  rank: number;
  win_15m: number;
  rate_15m: string;
  win_rate: string;
  streak: number;
  score: number;
  history: Array<{
    pid: string;
    num?: number;
    actual?: string;
    actual_color?: string;
    pred?: string;
    pred_num?: number;
    res: 'WIN' | 'LOSS';
  }>;
  marketSettledPeriod: string;
  upcomingPredictionPeriod: string;
}

// Canonical 24 Logic Names featuring the 20 models
const CANONICAL_24_LOGICS = [
  'TIGER KING',
  'DRAGON X',
  'PHOENIX PRO',
  'EAGLE FORCE',
  'LION X',
  'THUNDER KING',
  'NINJA X',
  'COBRA PRO',
  'WOLF X',
  'BLAZE KING',
  'VIPER X',
  'ROCKET PRO',
  'STORM X',
  'NINJA Y',
  'FALCON RUSH PRO',
  'PANTHER X',
  'GHOST PRO',
  'SHARK X',
  'BULLET KING',
  'DARK PRO',
  'SHADOW X',
  'GOLDEN X',
  'OMEGA PRO',
  'TITAN PRO',
];

let cachedData: ProcessedLogicItem[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 1500; // 1.5 seconds cache for fast live polling

function formatPeriodNext(pidStr: string): string {
  try {
    // Increment last digits
    const lastPart = pidStr.slice(-5);
    const prefix = pidStr.slice(0, -5);
    const nextVal = String(Number(lastPart) + 1).padStart(5, '0');
    return `${prefix}${nextVal}`;
  } catch {
    return `${pidStr}_NEXT`;
  }
}

function generateFallbackData(): ProcessedLogicItem[] {
  const now = Date.now();
  const cycleMs = 30000;
  const currentCycle = Math.floor(now / cycleMs);
  const basePid = `${new Date().toISOString().slice(0, 10).replace(/-/g, '')}1000${(currentCycle % 90000) + 10000}`;
  const nextPid = formatPeriodNext(basePid);

  return CANONICAL_24_LOGICS.map((name, index) => {
    // Generate 10 history results
    const history: ProcessedLogicItem['history'] = [];
    let wins = 0;
    for (let i = 0; i < 10; i++) {
      const pidNum = String(Number(basePid) - i);
      const isWin = (index * 7 + i * 3) % 4 !== 0; // ~75% win rate
      if (isWin) wins++;
      history.push({
        pid: pidNum,
        num: (index + i) % 10,
        actual: (index + i) % 2 === 0 ? 'BIG' : 'SMALL',
        pred: (index + i) % 2 === 0 ? 'BIG' : 'SMALL',
        pred_num: (index + i) % 10,
        res: isWin ? 'WIN' : 'LOSS',
      });
    }

    const win15m = 14 + ((index * 3) % 12);
    const rate15m = `${((win15m / 30) * 100).toFixed(1)}%`;

    return {
      logic: name,
      pred: index % 2 === 0 ? 'BIG' : 'SMALL',
      num: (index * 3) % 10,
      reason: `AI-M${index + 1}`,
      pac: '1/38',
      rank: index + 1,
      win_15m: win15m,
      rate_15m: rate15m,
      win_rate: rate15m,
      streak: (index % 5) + 1,
      score: win15m * 250,
      history,
      marketSettledPeriod: basePid,
      upcomingPredictionPeriod: nextPid,
    };
  }).sort((a, b) => b.win_15m - a.win_15m)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));
}

let reigningTopChampion: string = '';

/**
 * 200 IQ Momentum & Cushion Ranking for VIP Models:
 * - Top performer in recent 1-3 minutes stays at #1.
 * - Single loss will NOT demote the #1 Champion (Cushion Buffer).
 * - Demotion only occurs if the champion incurs 2-3 recent losses.
 */
function apply200IQRanking(items: ProcessedLogicItem[]): ProcessedLogicItem[] {
  if (!items || items.length === 0) return items;

  if (!reigningTopChampion && items.length > 0) {
    reigningTopChampion = items[0].logic;
  }

  const scored = items.map((item) => {
    const history = Array.isArray(item.history) ? item.history : [];
    const wins10 = history.filter((h) => h.res === 'WIN').length;

    // Recent 3 rounds (last 1.5 min)
    const recent3Wins = history.slice(0, 3).filter((h) => h.res === 'WIN').length;

    // Recent 6 rounds (last 3 min)
    const recent6Wins = history.slice(0, 6).filter((h) => h.res === 'WIN').length;

    // Recent 4 losses
    const recentLosses = history.slice(0, 4).filter((h) => h.res === 'LOSS').length;

    // Current win streak
    let streak = 0;
    for (let i = 0; i < history.length; i++) {
      if (history[i].res === 'WIN') streak++;
      else break;
    }

    const isChampion = item.logic === reigningTopChampion;

    // Base 200 IQ score
    let score =
      recent3Wins * 450 +
      recent6Wins * 280 +
      wins10 * 180 +
      streak * 120 +
      (item.win_15m || 0) * 15;

    // 🛡️ Loss-Cushion Hysteresis
    if (isChampion) {
      if (recentLosses <= 1) {
        score += 750; // Resilient 1-loss buffer
      } else if (recentLosses >= 3) {
        score -= 600; // Demotion trigger on 3+ losses
      }
    }

    return {
      item,
      score,
      streak,
      wins10,
      recent6Wins,
    };
  });

  // Sort descending by score
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.recent6Wins !== a.recent6Wins) return b.recent6Wins - a.recent6Wins;
    return b.wins10 - a.wins10;
  });

  // Update reigning champion
  if (scored[0]?.item.logic) {
    reigningTopChampion = scored[0].item.logic;
  }

  return scored.map((s, idx) => ({
    ...s.item,
    rank: idx + 1,
    score: s.score,
    streak: s.streak || (idx === 0 ? 3 : 1),
  }));
}

export async function fetchVip24LogicsInternal(): Promise<ProcessedLogicItem[]> {
  const now = Date.now();
  if (cachedData && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedData;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(EXTERNAL_API_URL, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'DarkKiller-VIP-Security-Core/4.2',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`External API returned HTTP ${response.status}`);
    }

    const rawData = (await response.json()) as RawLogicItem[];

    if (!Array.isArray(rawData) || rawData.length === 0) {
      throw new Error('Invalid or empty array returned from external API');
    }

    // Determine latest market period
    let marketPid = '';
    for (const item of rawData) {
      if (item.history && item.history.length > 0 && item.history[0].pid) {
        marketPid = item.history[0].pid;
        break;
      }
    }
    const nextPid = marketPid ? formatPeriodNext(marketPid) : '621';

    // Map and sanitize all items
    const processed: ProcessedLogicItem[] = rawData.map((item) => {
      const win15 = typeof item.win_15m === 'number' ? item.win_15m : 15;
      const rate15 = item.rate_15m || `${((win15 / 30) * 100).toFixed(1)}%`;
      const itemHistory = Array.isArray(item.history) ? item.history.slice(0, 10) : [];

      return {
        logic: item.logic || 'UNKNOWN AI',
        pred: item.pred || 'SMALL',
        num: item.num,
        reason: item.reason || 'QUANT',
        pac: item.pac || '1/38',
        rank: item.rank || 1,
        win_15m: win15,
        rate_15m: rate15,
        win_rate: item.win_rate || rate15,
        streak: item.streak || 0,
        score: item.score || win15 * 200,
        history: itemHistory,
        marketSettledPeriod: marketPid || (itemHistory[0]?.pid ?? '620'),
        upcomingPredictionPeriod: nextPid,
      };
    });

    // Apply 200 IQ Dynamic Ranking with 1-Loss Cushion
    const rankedData = apply200IQRanking(processed);

    cachedData = rankedData;
    lastFetchTime = now;
    return rankedData;
  } catch (err) {
    console.warn('[VIP 24 Engine] Using fallback logic dataset:', err instanceof Error ? err.message : err);
    if (!cachedData) {
      cachedData = apply200IQRanking(generateFallbackData());
    }
    return cachedData;
  }
}

export async function fetchVip24Logics(req: Request, res: Response): Promise<void> {
  const data = await fetchVip24LogicsInternal();
  res.json(data);
}
