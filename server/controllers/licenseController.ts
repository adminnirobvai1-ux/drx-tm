/**
 * Public License Controller
 * Handles user password verification and public settings.
 */

import type { Request, Response } from 'express';
import {
  verifyLicenseKey,
  getAppSettings,
  getCloneConfig,
  recordDeviceHeartbeat,
} from '../services/firebaseService.ts';
import { generateSecurityToken } from '../middleware/tokenAuth.ts';

export async function handleVerifyLicense(req: Request, res: Response): Promise<void> {
  const { key, deviceId, deviceName, platform, browser } = req.body || {};
  const settings = getAppSettings();
  const telegramLink = settings.telegramLink || 'https://t.me/DARK67HACK';

  if (!key || typeof key !== 'string' || !key.trim()) {
    res.status(400).json({
      success: false,
      error: 'KEY_EMPTY',
      message: 'অনুগ্রহ করে অ্যাক্সেস পাসওয়ার্ড বা লাইসেন্স কি প্রবেশ করান।',
      telegramLink,
    });
    return;
  }

  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || '';
  const result = await verifyLicenseKey(key, deviceId || req.ip || 'web-client', {
    deviceName: deviceName || 'Smart Device',
    platform: platform || 'Mobile/Web',
    browser: browser || 'Browser',
    ip: clientIp,
  });

  if (!result.valid || !result.license) {
    let errorMsg = 'ভুল পাসওয়ার্ড! অনুগ্রহ করে সঠিক কি প্রবেশ করান।';
    if (result.reason === 'EXPIRED') {
      errorMsg = 'আপনার পাসওয়ার্ড বা লাইসেন্স কি-এর মেয়াদ শেষ হয়ে গেছে।';
    } else if (result.reason === 'LIMIT_EXCEEDED') {
      errorMsg = 'এই পাসওয়ার্ডটি ইতিমধ্যে সর্বোচ্চ সংখ্যক ডিভাইসে ব্যবহৃত হয়েছে।';
    } else if (result.reason === 'INACTIVE') {
      errorMsg = 'এই পাসওয়ার্ডটি নিষ্ক্রিয় করা হয়েছে।';
    }

    res.status(403).json({
      success: false,
      error: result.reason || 'INVALID_KEY',
      message: errorMsg,
      telegramLink,
    });
    return;
  }

  // Generate security token for authenticated predictions
  const tokenData = generateSecurityToken(result.license.key);

  res.json({
    success: true,
    message: 'পাসওয়ার্ড সফলভাবে ভেরিফাই হয়েছে! অল প্রেডিকশন আনলকড।',
    token: tokenData.token,
    expiresAt: result.license.expiresAt,
    keyType: result.license.type,
    key: result.license.key,
    telegramLink,
  });
}

/**
 * Real-time Device Heartbeat & Active Watchdog
 * Ensures deleted passwords or kicked devices are immediately logged out!
 */
export async function handleDeviceHeartbeat(req: Request, res: Response): Promise<void> {
  const { key, deviceId, deviceName, platform, browser } = req.body || {};
  const cleanKey = String(key || '').trim().toUpperCase();
  const cleanDeviceId = String(deviceId || '').trim();

  if (!cleanKey || !cleanDeviceId) {
    res.status(400).json({ success: false, kicked: true, message: 'Invalid session params' });
    return;
  }

  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || '';
  const result = await recordDeviceHeartbeat({
    deviceId: cleanDeviceId,
    licenseKey: cleanKey,
    deviceName,
    platform,
    browser,
    ip: clientIp,
  });

  if (!result.valid || result.kicked) {
    let reasonMsg = 'আপনার পাসওয়ার্ডটি অ্যাডমিন প্যানেল থেকে মুছে ফেলা হয়েছে! আপনাকে স্বয়ংক্রিয়ভাবে লগআউট করা হয়েছে।';
    if (result.reason === 'KICKED_BY_ADMIN' || result.reason === 'KICKED_ALL_BY_ADMIN') {
      reasonMsg = 'অ্যাডমিন এই ডিভাইসটির এক্সেস বাতিল করেছেন। আপনাকে লগআউট করা হয়েছে।';
    } else if (result.reason === 'PASSWORD_DEACTIVATED') {
      reasonMsg = 'আপনার পাসওয়ার্ডটি নিষ্ক্রিয় করা হয়েছে।';
    } else if (result.reason === 'PASSWORD_EXPIRED') {
      reasonMsg = 'আপনার পাসওয়ার্ডের মেয়াদ শেষ হয়ে গেছে।';
    }

    res.status(403).json({
      success: false,
      valid: false,
      kicked: true,
      reason: result.reason,
      message: reasonMsg,
    });
    return;
  }

  res.json({
    success: true,
    valid: true,
    kicked: false,
  });
}

/**
 * Check License Status (Instant Verification)
 */
export async function handleCheckLicenseStatus(req: Request, res: Response): Promise<void> {
  const key = String(req.query.key || '').trim().toUpperCase();
  const deviceId = String(req.query.deviceId || '').trim();

  if (!key) {
    res.json({ valid: false, deleted: true, message: 'No key provided' });
    return;
  }

  const result = await verifyLicenseKey(key, deviceId || 'web-client');
  if (!result.valid) {
    res.json({
      valid: false,
      deleted: result.reason === 'NOT_FOUND',
      inactive: result.reason === 'INACTIVE',
      expired: result.reason === 'EXPIRED',
      reason: result.reason,
      message: 'পাসওয়ার্ডটি মুছে ফেলা হয়েছে বা নিষ্ক্রিয় করা হয়েছে!',
    });
    return;
  }

  res.json({
    valid: true,
    expiresAt: result.license?.expiresAt,
    active: result.license?.active,
  });
}

export function handleGetPublicSettings(req: Request, res: Response): void {
  const settings = getAppSettings();
  res.json({
    success: true,
    telegramLink: settings.telegramLink,
    appName: settings.appName,
    brandLogo: settings.brandLogo,
  });
}

export async function handleGetCloneSettings(req: Request, res: Response): Promise<void> {
  const slug = String(req.params.slug || '').toLowerCase();
  const clone = await getCloneConfig(slug);

  if (!clone) {
    res.status(404).json({ error: 'CLONE_NOT_FOUND' });
    return;
  }

  res.json({
    success: true,
    clone,
  });
}
