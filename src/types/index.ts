/**
 * Global Type Definitions for Dark Killer Signal Dashboard
 */

export interface SystemStatus {
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  serverTime: string;
  utcTimestamp: number;
  activeNodes: number;
  latencyMs: number;
  engineVersion: string;
}

export interface WingoSignal {
  id: string;
  gameType: 'WINGO_30S';
  periodNumber: string;
  prediction: 'BIG' | 'SMALL' | 'RED' | 'GREEN' | 'VIOLET';
  confidenceRate: number;
  generatedAt: number;
  validUntil: number;
  remainingSeconds: number;
  status: 'ACTIVE' | 'CALCULATING' | 'SETTLED';
  hashDigest: string;
}

export interface SessionState {
  authenticated: boolean;
  sessionId?: string;
  expiresAt?: number;
  securityClearance: 'GUEST' | 'VIP_AI' | 'ROOT';
}

export interface SecurityEventPayload {
  type: 'DEVTOOLS_OPENED' | 'KEY_TAMPER' | 'CONTEXT_MENU_ATTEMPT' | 'INTEGRITY_MISMATCH';
  timestamp: number;
  detail?: string;
}

export interface ClockState {
  hours: string;
  minutes: string;
  seconds: string;
  fullTimeString: string;
}

export interface VipHistoryItem {
  pid: string;
  num?: number;
  actual?: string;
  actual_color?: string;
  pred?: string;
  pred_num?: number;
  res: 'WIN' | 'LOSS';
}

export interface VipLogicModel {
  logic: string;
  pred: string;
  num?: number;
  reason?: string;
  pac?: string;
  rank: number;
  win_15m: number;
  rate_15m: string;
  win_rate?: string;
  streak?: number;
  score?: number;
  history: VipHistoryItem[];
  marketSettledPeriod?: string;
  upcomingPredictionPeriod?: string;
}

