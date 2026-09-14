/**
 * Server-Side Session & Authentication Controller
 * Manages encrypted HttpOnly cookies and access control.
 */

import crypto from 'crypto';
import type { Request, Response } from 'express';

const SESSION_COOKIE_NAME = '__Host_dk_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'DARK_KILLER_SESSION_SIGNING_KEY_7749';

interface SessionRecord {
  sessionId: string;
  createdAt: number;
  expiresAt: number;
  securityClearance: 'VIP_AI';
}

const activeSessions = new Map<string, SessionRecord>();

function signSession(sessionId: string): string {
  const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(sessionId).digest('hex');
  return `${sessionId}.${hmac}`;
}

function verifySessionSignature(signedValue: string): string | null {
  const parts = signedValue.split('.');
  if (parts.length !== 2) return null;
  const [sessionId, hmac] = parts;
  const expectedHmac = crypto.createHmac('sha256', SESSION_SECRET).update(sessionId).digest('hex');
  if (crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac))) {
    return sessionId;
  }
  return null;
}

export function handleSessionCheck(req: Request, res: Response): void {
  const cookieValue = req.cookies?.[SESSION_COOKIE_NAME];
  if (!cookieValue) {
    res.status(401).json({
      authenticated: false,
      securityClearance: 'GUEST',
      message: 'No active session found',
    });
    return;
  }

  const sessionId = verifySessionSignature(cookieValue);
  if (!sessionId || !activeSessions.has(sessionId)) {
    res.status(401).json({
      authenticated: false,
      securityClearance: 'GUEST',
      message: 'Invalid or expired session',
    });
    return;
  }

  const session = activeSessions.get(sessionId)!;
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(sessionId);
    res.status(401).json({
      authenticated: false,
      securityClearance: 'GUEST',
      message: 'Session timed out',
    });
    return;
  }

  res.json({
    authenticated: true,
    sessionId: session.sessionId,
    expiresAt: session.expiresAt,
    securityClearance: session.securityClearance,
  });
}

export function handleSessionInit(req: Request, res: Response): void {
  const sessionId = crypto.randomBytes(24).toString('hex');
  const now = Date.now();
  const maxAgeMs = 24 * 60 * 60 * 1000; // 24 hours

  const sessionRecord: SessionRecord = {
    sessionId,
    createdAt: now,
    expiresAt: now + maxAgeMs,
    securityClearance: 'VIP_AI',
  };

  activeSessions.set(sessionId, sessionRecord);
  const signedCookie = signSession(sessionId);

  res.cookie(SESSION_COOKIE_NAME, signedCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: maxAgeMs,
    path: '/',
  });

  res.json({
    authenticated: true,
    sessionId,
    expiresAt: sessionRecord.expiresAt,
    securityClearance: sessionRecord.securityClearance,
  });
}

export function handleLogout(req: Request, res: Response): void {
  const cookieValue = req.cookies?.[SESSION_COOKIE_NAME];
  if (cookieValue) {
    const sessionId = verifySessionSignature(cookieValue);
    if (sessionId) {
      activeSessions.delete(sessionId);
    }
  }

  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  res.json({ success: true, message: 'Session terminated safely' });
}
