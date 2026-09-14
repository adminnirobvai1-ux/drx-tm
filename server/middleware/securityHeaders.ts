/**
 * HTTP Security Headers Middleware
 * Protects backend responses against sniffing, clickjacking, and unauthorized embeds.
 */

import type { Request, Response, NextFunction } from 'express';

export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Block any source map inspection requests immediately
  if (req.path.endsWith('.map')) {
    res.status(404).send('Not Found');
    return;
  }

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Suppress and strip sourcemap linking
  res.setHeader('X-SourceMap', 'none');
  res.setHeader('SourceMap', 'none');
  
  // Strict Referrer Policy
  res.setHeader('Referrer-Policy', 'no-referrer');
  
  // Anti-Clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Prevent caching of sensitive API responses and ensure fresh security tokens
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
}
