/**
 * 🧠 200 IQ Dynamic Ranking & Momentum Engine
 * 
 * Intelligent model ranking algorithm:
 * 1. Prioritizes the best performing logic models in the last 1 to 3 minutes (highest recent win rate & win streak).
 * 2. Reigning Champion Loss-Cushion (Hysteresis Rule):
 *    - The #1 Top Champion model receives a Stability Shield against a single (1) loss.
 *    - It will NOT drop or get demoted on 1 isolated loss.
 *    - It only loses the #1 Top spot if it incurs at least 2 to 3 losses in its recent window.
 *    - A surging challenger on a dominant streak will then take the #1 crown.
 */

import type { VipLogicModel, VipHistoryItem } from '../types/index.ts';

// In-memory tracker for the Reigning #1 Champion model name
let reigningChampionName: string = '';
let championConsecutiveTopCycles: number = 0;

export interface ModelMomentumProfile {
  logic: string;
  wins10: number;
  losses10: number;
  recent3Wins: number; // Last 1.5 minutes
  recent6Wins: number; // Last 3 minutes
  currentStreak: number;
  recentLosses: number; // Losses in last 4 rounds
  isReigningLeader: boolean;
  hasLossCushion: boolean;
  totalScore: number;
}

/**
 * Calculates the Momentum Profile and 200-IQ Score for a given logic model
 */
export function evaluateModelMomentum(
  model: VipLogicModel,
  currentChampion: string = reigningChampionName
): ModelMomentumProfile {
  const history: VipHistoryItem[] = Array.isArray(model.history) ? model.history : [];
  
  // Total 10-period counts
  const wins10 = history.filter((h) => h.res === 'WIN').length;
  const losses10 = Math.max(0, history.length - wins10);

  // Recent 3 rounds (last 1.5 min)
  const recent3 = history.slice(0, 3);
  const recent3Wins = recent3.filter((h) => h.res === 'WIN').length;

  // Recent 6 rounds (last 3 min)
  const recent6 = history.slice(0, 6);
  const recent6Wins = recent6.filter((h) => h.res === 'WIN').length;

  // Losses in the last 4 rounds
  const recent4 = history.slice(0, 4);
  const recentLosses = recent4.filter((h) => h.res === 'LOSS').length;

  // Consecutive win streak from the most recent result backward
  let currentStreak = 0;
  for (let i = 0; i < history.length; i++) {
    if (history[i].res === 'WIN') {
      currentStreak++;
    } else {
      break;
    }
  }

  const isReigningLeader = model.logic === currentChampion;

  // Base Momentum Score (weighted heavily towards recent 1-3 minutes)
  let baseScore =
    recent3Wins * 450 +       // Heavy weight for last 1.5 mins
    recent6Wins * 280 +       // Strong weight for last 3 mins
    wins10 * 180 +            // Overall 10-round form
    currentStreak * 120 +     // Live uninterrupted win streak
    (model.win_15m || 0) * 15; // 15-minute aggregate bonus

  // 🛡️ 200 IQ Loss-Cushion Protection for the Reigning #1 Champion:
  // If reigning leader has only 1 recent loss, grant a Cushion Buffer (+750 pts)
  // so it does NOT drop or get replaced by a single random loss.
  // If it gets 2 or 3 losses, the cushion breaks and it can be overtaken.
  let hasLossCushion = false;
  if (isReigningLeader) {
    if (recentLosses <= 1) {
      hasLossCushion = true;
      baseScore += 750; // Resilient 1-loss buffer
    } else if (recentLosses >= 3) {
      baseScore -= 600; // Demotion penalty for 3+ recent losses
    }
  }

  return {
    logic: model.logic,
    wins10,
    losses10,
    recent3Wins,
    recent6Wins,
    currentStreak,
    recentLosses,
    isReigningLeader,
    hasLossCushion,
    totalScore: baseScore,
  };
}

/**
 * Sorts and ranks logic models with the 200 IQ algorithm:
 * - Best momentum logic goes to Top #1
 * - Preserves #1 Champion across 1 isolated loss
 * - Demotes #1 only after 2-3 losses
 */
export function rankVipModelsBy200IQ(models: VipLogicModel[]): VipLogicModel[] {
  if (!models || models.length === 0) return [];

  // If no champion is registered yet, pick the first or highest win model
  if (!reigningChampionName && models.length > 0) {
    const initialTop = [...models].sort((a, b) => {
      const aW = a.history ? a.history.filter((h) => h.res === 'WIN').length : (a.win_15m || 0);
      const bW = b.history ? b.history.filter((h) => h.res === 'WIN').length : (b.win_15m || 0);
      return bW - aW;
    })[0];
    reigningChampionName = initialTop?.logic || models[0].logic;
  }

  // Profile and score every model
  const scored = models.map((m) => {
    const profile = evaluateModelMomentum(m, reigningChampionName);
    return {
      model: m,
      profile,
    };
  });

  // Sort descending by 200 IQ Total Score
  scored.sort((a, b) => {
    if (b.profile.totalScore !== a.profile.totalScore) {
      return b.profile.totalScore - a.profile.totalScore;
    }
    // Tie-breaker 1: Recent 6 wins (3 mins)
    if (b.profile.recent6Wins !== a.profile.recent6Wins) {
      return b.profile.recent6Wins - a.profile.recent6Wins;
    }
    // Tie-breaker 2: Total 10 wins
    return b.profile.wins10 - a.profile.wins10;
  });

  // Crown the new or retaining #1 Top Champion
  const newLeader = scored[0]?.model.logic;
  if (newLeader) {
    if (newLeader === reigningChampionName) {
      championConsecutiveTopCycles++;
    } else {
      reigningChampionName = newLeader;
      championConsecutiveTopCycles = 1;
    }
  }

  // Map back to VipLogicModel with clean rank assignments 1..N and updated score
  return scored.map((item, index) => {
    const wins = item.profile.wins10;
    const rateStr = `${Math.round((wins / (item.model.history?.length || 10)) * 100)}%`;

    return {
      ...item.model,
      rank: index + 1,
      score: item.profile.totalScore,
      streak: item.profile.currentStreak || (index === 0 ? 3 : 1),
      rate_15m: item.model.rate_15m || rateStr,
      win_rate: rateStr,
    };
  });
}

/**
 * Returns the currently crowned #1 Top Champion logic name
 */
export function getReigningChampion(): string {
  return reigningChampionName;
}
