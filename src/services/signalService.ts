/**
 * Signal Service
 * 
 * Provides real-time Wingo 30s signals derived directly from the live VIP API
 * (https://data-vip-24-hack.ai.studio/apipid.json?page=1)
 * with graceful backend proxy fallback.
 */

import { apiClient } from './apiClient.ts';
import { SECURE_ENDPOINTS } from '../security/stringCiphers.ts';
import { vip24Service } from './vip24Service.ts';
import type { WingoSignal } from '../types/index.ts';

export class SignalService {
  public async getActiveSignal(): Promise<WingoSignal> {
    // 1. If we already have live VIP 24 models from the API, derive the champion signal
    const topSignal = vip24Service.getTopSignal();
    if (topSignal && topSignal.periodNumber) {
      return topSignal;
    }

    // 2. Try proxy backend
    try {
      return await apiClient.get<WingoSignal>(SECURE_ENDPOINTS.SIGNALS);
    } catch {
      // 3. Guaranteed fallback
      return topSignal;
    }
  }
}

export const signalService = new SignalService();
