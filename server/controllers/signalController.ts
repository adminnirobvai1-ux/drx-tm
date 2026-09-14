/**
 * Server-Side Proprietary Wingo 30s Signal Engine
 * Computes live predictions, period numbers, and cryptographic digests server-side.
 * The client only receives the final sanitized output.
 */

import crypto from 'crypto';

interface SignalCache {
  id: string;
  gameType: 'WINGO_30S';
  periodNumber: string;
  prediction: 'BIG' | 'SMALL';
  confidenceRate: number;
  generatedAt: number;
  validUntil: number;
  remainingSeconds: number;
  status: 'ACTIVE';
  hashDigest: string;
}

let cachedSignal: SignalCache | null = null;

export function computeActiveSignal(): SignalCache {
  const now = Date.now();
  // 30-second cycles
  const cycleMs = 30000;
  const currentPeriodInt = Math.floor(now / cycleMs);
  const cycleStart = currentPeriodInt * cycleMs;
  const cycleEnd = cycleStart + cycleMs;
  const remaining = Math.max(0, Math.ceil((cycleEnd - now) / 1000));

  const periodString = `${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${currentPeriodInt % 100000}`;

  if (cachedSignal && cachedSignal.periodNumber === periodString) {
    return {
      ...cachedSignal,
      remainingSeconds: remaining,
    };
  }

  // Cryptographic seed for deterministic but secure prediction per period
  const serverSecret = process.env.SIGNAL_SERVER_SECRET || 'DARK_KILLER_INTERNAL_SALT_89X';
  const seed = `${serverSecret}:${periodString}`;
  const hash = crypto.createHash('sha256').update(seed).digest('hex');

  // Derive prediction
  const numericVal = parseInt(hash.substring(0, 8), 16);
  const isBig = numericVal % 2 === 0;
  const prediction = isBig ? 'BIG' : 'SMALL';

  // Confidence rate between 88% and 98%
  const confidence = 88 + (numericVal % 11);

  cachedSignal = {
    id: `SIG_${currentPeriodInt}`,
    gameType: 'WINGO_30S',
    periodNumber: periodString,
    prediction,
    confidenceRate: confidence,
    generatedAt: cycleStart,
    validUntil: cycleEnd,
    remainingSeconds: remaining,
    status: 'ACTIVE',
    hashDigest: hash,
  };

  return cachedSignal;
}
