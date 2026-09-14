/**
 * Cryptographic Token Authentication Middleware
 * 
 * Enforces strict Token Handshake on all API endpoints.
 * All client-server communication requires an HMAC-SHA256 signed bearer token.
 * Prevents unauthorized API access, scraping, and replay attacks.
 */

import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

const TOKEN_SECRET = process.env.TOKEN_SECRET || 'DARK_KILLER_SECURE_TOKEN_SECRET_HMAC_998124_VIP';
const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour validity

export interface TokenPayload {
  tokenId: string;
  sessionId: string;
  scope: 'VIP_ENGINE_ACCESS';
  issuedAt: number;
  expiresAt: number;
  nonce: string;
}

// In-memory revoked tokens blacklist for replay protection
const revokedTokens = new Set<string>();

/**
 * Generate a cryptographically signed security token
 */
export function generateSecurityToken(sessionId?: string): { token: string; expiresAt: number; tokenId: string } {
  const now = Date.now();
  const expiresAt = now + TOKEN_EXPIRY_MS;
  const tokenId = crypto.randomBytes(16).toString('hex');
  const nonce = crypto.randomBytes(8).toString('hex');

  const payload: TokenPayload = {
    tokenId,
    sessionId: sessionId || crypto.randomBytes(12).toString('hex'),
    scope: 'VIP_ENGINE_ACCESS',
    issuedAt: now,
    expiresAt,
    nonce,
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  const token = `DK-SEC.${payloadBase64}.${signature}`;
  return { token, expiresAt, tokenId };
}

/**
 * Verify and decode an incoming security token
 */
export function verifySecurityToken(tokenString: string): { valid: boolean; payload?: TokenPayload; reason?: string } {
  if (!tokenString || typeof tokenString !== 'string') {
    return { valid: false, reason: 'TOKEN_EMPTY' };
  }

  const parts = tokenString.split('.');
  if (parts.length !== 3 || parts[0] !== 'DK-SEC') {
    return { valid: false, reason: 'TOKEN_MALFORMED' };
  }

  const [, payloadBase64, signature] = parts;

  // Verify HMAC signature
  const expectedSignature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  try {
    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!isSignatureValid) {
      return { valid: false, reason: 'SIGNATURE_INVALID' };
    }

    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadJson) as TokenPayload;

    if (revokedTokens.has(payload.tokenId)) {
      return { valid: false, reason: 'TOKEN_REVOKED' };
    }

    if (Date.now() > payload.expiresAt) {
      return { valid: false, reason: 'TOKEN_EXPIRED' };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false, reason: 'TOKEN_PARSE_FAILED' };
  }
}

/**
 * Revoke a token (e.g. on logout)
 */
export function revokeToken(tokenId: string): void {
  revokedTokens.add(tokenId);
  // Auto purge blacklist memory after 2 hours
  setTimeout(() => revokedTokens.delete(tokenId), 2 * TOKEN_EXPIRY_MS);
}

/**
 * Express Middleware enforcing token presence and validity
 */
export function tokenAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Allow public handshake routes to bootstrap security token
  const path = req.path;
  if (
    path === '/auth/token/handshake' ||
    path === '/auth/session' ||
    path === '/auth/logout' ||
    path === '/health'
  ) {
    return next();
  }

  // Extract token from standard headers
  const authHeader = req.headers['authorization'];
  const customSecurityHeader = req.headers['x-security-token'] as string | undefined;
  const customAuthHeader = req.headers['x-auth-token'] as string | undefined;

  let token: string | undefined = undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (customSecurityHeader) {
    token = customSecurityHeader.trim();
  } else if (customAuthHeader) {
    token = customAuthHeader.trim();
  }

  if (!token) {
    res.status(401).json({
      error: 'ACCESS_DENIED_TOKEN_REQUIRED',
      message: 'Dark Killer Security Protocol: Valid cryptographic access token is required.',
      code: 401,
    });
    return;
  }

  const verification = verifySecurityToken(token);
  if (!verification.valid || !verification.payload) {
    res.status(403).json({
      error: 'ACCESS_FORBIDDEN_TOKEN_INVALID',
      message: `Invalid or expired access token (${verification.reason || 'UNAUTHORIZED'}). Please perform a handshake.`,
      code: 403,
    });
    return;
  }

  // Attach token payload to request for downstream handlers
  (req as unknown as { tokenPayload: TokenPayload }).tokenPayload = verification.payload;
  next();
}
