/**
 * Server-Side System & Telemetry Controller
 */

import type { Request, Response } from 'express';

interface TelemetryLog {
  type: string;
  detail: string;
  ip?: string;
  userAgent?: string;
  timestamp: number;
}

const recentSecurityEvents: TelemetryLog[] = [];

export function handleSystemStatus(req: Request, res: Response): void {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  res.json({
    status: 'ONLINE',
    serverTime: `${hours}:${minutes}:${seconds}`,
    utcTimestamp: now.getTime(),
    activeNodes: 14,
    latencyMs: 12,
    engineVersion: 'DarkKiller-SecureCore-4.2.0',
  });
}

export function handleTelemetryReport(req: Request, res: Response): void {
  const { type, detail, timestamp } = req.body || {};
  const ip = req.ip || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  const entry: TelemetryLog = {
    type: type || 'UNKNOWN',
    detail: detail || '',
    ip,
    userAgent,
    timestamp: timestamp || Date.now(),
  };

  recentSecurityEvents.push(entry);
  if (recentSecurityEvents.length > 200) {
    recentSecurityEvents.shift();
  }

  res.status(200).json({ acknowledged: true });
}
