/**
 * Secure Session Service
 * Manages encrypted HttpOnly session checks and token validation.
 */

import { apiClient } from './apiClient.ts';
import { SECURE_ENDPOINTS } from '../security/stringCiphers.ts';
import type { SessionState } from '../types/index.ts';

export class SessionService {
  private currentSession: SessionState = {
    authenticated: false,
    securityClearance: 'GUEST',
  };

  public async verifySession(): Promise<SessionState> {
    try {
      const data = await apiClient.get<SessionState>(SECURE_ENDPOINTS.SESSION);
      this.currentSession = data;
      return data;
    } catch {
      // Initialize a new secure session if none exists
      return this.initializeSession();
    }
  }

  public async initializeSession(): Promise<SessionState> {
    try {
      const data = await apiClient.post<SessionState>(SECURE_ENDPOINTS.SESSION, {
        clientHandshake: 'DARK_KILLER_V4_SECURE_CLIENT',
      });
      this.currentSession = data;
      return data;
    } catch (err) {
      console.error('Session initialization error:', err);
      return {
        authenticated: false,
        securityClearance: 'GUEST',
      };
    }
  }

  public async logout(): Promise<void> {
    try {
      await apiClient.post(SECURE_ENDPOINTS.LOGOUT);
    } finally {
      this.currentSession = {
        authenticated: false,
        securityClearance: 'GUEST',
      };
    }
  }

  public getSession(): SessionState {
    return this.currentSession;
  }
}

export const sessionService = new SessionService();
