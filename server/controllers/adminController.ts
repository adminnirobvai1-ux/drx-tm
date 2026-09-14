/**
 * Admin Panel Controller
 * Handles password/license generation, IP protection, Telegram link updates, and Whitelabel clones.
 */

import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import {
  getAppSettings,
  updateAppSettings,
  getAllLicenses,
  saveLicenseKey,
  deleteLicenseKey,
  getAllClones,
  saveCloneConfig,
  deleteCloneConfig,
  addAllowedIp,
  removeAllowedIp,
  isIpAllowed,
  getAllDevices,
  kickDevice,
  kickAllDevices,
  type LicenseKey,
  type CloneConfig,
  type DeviceSession,
} from '../services/firebaseService.ts';

/**
 * Extract clean client IP
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first.replace('::ffff:', '');
  }
  const sock = req.socket.remoteAddress || '';
  return sock.replace('::ffff:', '') || '127.0.0.1';
}

/**
 * Admin Panel PIN Lock Guard Middleware
 */
export function adminAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const settings = getAppSettings();
  const masterPin = (settings.masterAdminPin || 'DARK67@ADMIN').trim();
  const providedPin = String(
    req.headers['x-admin-pin'] || req.query.pin || req.body?.adminPin || ''
  ).trim();

  // Allow if pin matches masterPin or default fallback PIN
  if (providedPin && (providedPin === masterPin || providedPin === 'DARK67@ADMIN')) {
    return next();
  }

  res.status(401).json({
    success: false,
    error: 'PIN_REQUIRED',
    message: 'অ্যাডমিন প্যানেলে প্রবেশ করতে সঠিক সিকিউরিটি পিন দিন।',
  });
}

/**
 * POST Verify Admin PIN
 */
export function handleVerifyAdminPin(req: Request, res: Response): void {
  const settings = getAppSettings();
  const masterPin = (settings.masterAdminPin || 'DARK67@ADMIN').trim();
  const inputPin = String(req.body?.pin || '').trim();

  if (inputPin && (inputPin === masterPin || inputPin === 'DARK67@ADMIN')) {
    res.json({
      success: true,
      message: 'পিন কোড সফলভাবে অনুমোদিত হয়েছে!',
    });
    return;
  }

  res.status(401).json({
    success: false,
    error: 'INVALID_PIN',
    message: 'ভুল সিকিউরিটি পিন! অনুগ্রহ করে সঠিক পিন দিন।',
  });
}

/**
 * GET Admin Dashboard Overview
 */
export async function getAdminDashboard(req: Request, res: Response): Promise<void> {
  const clientIp = getClientIp(req);
  const settings = getAppSettings();
  const [licenses, clones, devices] = await Promise.all([
    getAllLicenses(),
    getAllClones(),
    getAllDevices(),
  ]);

  const now = Date.now();
  const activeLicenses = licenses.filter((l) => l.active && (!l.expiresAt || l.expiresAt > now));
  const onlineDevices = devices.filter(
    (d) => d.status === 'ONLINE' && now - (d.lastActive || 0) < 60000
  );

  res.json({
    success: true,
    clientIp,
    settings: {
      telegramLink: settings.telegramLink,
      allowedIps: settings.allowedIps,
      appName: settings.appName,
      brandLogo: settings.brandLogo,
      masterAdminPin: settings.masterAdminPin || 'DARK67@ADMIN',
    },
    stats: {
      totalKeys: licenses.length,
      activeKeys: activeLicenses.length,
      clonesCount: clones.length,
      totalDevices: devices.length,
      onlineDevices: onlineDevices.length,
      kickedDevices: devices.filter((d) => d.status === 'KICKED').length,
    },
    licenses: licenses.sort((a, b) => b.createdAt - a.createdAt),
    clones,
    devices,
  });
}

/**
 * GET All Connected Devices
 */
export async function handleGetDevices(req: Request, res: Response): Promise<void> {
  const devices = await getAllDevices();
  const now = Date.now();
  const onlineDevices = devices.filter(
    (d) => d.status === 'ONLINE' && now - (d.lastActive || 0) < 60000
  );

  res.json({
    success: true,
    devices,
    stats: {
      total: devices.length,
      online: onlineDevices.length,
      kicked: devices.filter((d) => d.status === 'KICKED').length,
    },
  });
}

/**
 * POST Kick Device (Force Logout)
 */
export async function handleKickDevice(req: Request, res: Response): Promise<void> {
  const deviceId = String(req.body?.deviceId || '').trim();
  const reason = String(req.body?.reason || 'KICKED_BY_ADMIN').trim();

  if (!deviceId) {
    res.status(400).json({ error: 'DEVICE_ID_REQUIRED' });
    return;
  }

  const success = await kickDevice(deviceId, reason);
  res.json({ success, deviceId, message: 'ডিভাইসটি সফলভাবে লগআউট করা হয়েছে।' });
}

/**
 * POST Kick All Devices (Mass Logout)
 */
export async function handleKickAllDevices(req: Request, res: Response): Promise<void> {
  const count = await kickAllDevices('KICKED_ALL_BY_ADMIN');
  res.json({
    success: true,
    kickedCount: count,
    message: `${count} টি ডিভাইস সফলভাবে লগআউট করা হয়েছে।`,
  });
}

/**
 * POST Create / Generate License Key
 */
export async function handleCreateLicense(req: Request, res: Response): Promise<void> {
  const {
    customKey,
    type = '7_DAYS',
    maxUses = 1,
    notes = '',
    durationHours,
  } = req.body || {};

  const now = Date.now();
  let keyString = String(customKey || '').trim().toUpperCase();

  if (!keyString) {
    // Auto generate high-tech license key e.g. "DK-8924-VIP"
    const randPart = crypto.randomBytes(3).toString('hex').toUpperCase();
    const numPart = Math.floor(1000 + Math.random() * 9000);
    keyString = `DK-${randPart}-${numPart}`;
  }

  let expiresAt = 0;
  if (durationHours && typeof durationHours === 'number') {
    expiresAt = now + durationHours * 3600 * 1000;
  } else {
    switch (type) {
      case '1_HOUR':
        expiresAt = now + 1 * 3600 * 1000;
        break;
      case '1_DAY':
        expiresAt = now + 24 * 3600 * 1000;
        break;
      case '7_DAYS':
        expiresAt = now + 7 * 24 * 3600 * 1000;
        break;
      case '30_DAYS':
        expiresAt = now + 30 * 24 * 3600 * 1000;
        break;
      case 'LIFETIME':
        expiresAt = now + 3650 * 24 * 3600 * 1000; // ~10 years
        break;
      default:
        expiresAt = now + 7 * 24 * 3600 * 1000;
    }
  }

  const newLicense: LicenseKey = {
    key: keyString,
    type,
    createdAt: now,
    expiresAt,
    maxUses: Number(maxUses) || 1,
    usedCount: 0,
    usedDevices: [],
    active: true,
    notes: String(notes || 'Admin Created'),
  };

  const saved = await saveLicenseKey(newLicense);
  res.json({ success: true, license: saved });
}

/**
 * POST Delete License Key
 */
export async function handleDeleteLicense(req: Request, res: Response): Promise<void> {
  const key = String(req.body?.key || '').trim().toUpperCase();
  if (!key) {
    res.status(400).json({ error: 'KEY_REQUIRED' });
    return;
  }

  await deleteLicenseKey(key);
  res.json({ success: true, deletedKey: key });
}

/**
 * POST Toggle License Active Status
 */
export async function handleToggleLicense(req: Request, res: Response): Promise<void> {
  const key = String(req.body?.key || '').trim().toUpperCase();
  const all = await getAllLicenses();
  const item = all.find((l) => l.key === key);

  if (!item) {
    res.status(404).json({ error: 'KEY_NOT_FOUND' });
    return;
  }

  item.active = !item.active;
  await saveLicenseKey(item);
  res.json({ success: true, license: item });
}

/**
 * POST Update System Settings
 */
export async function handleUpdateSettings(req: Request, res: Response): Promise<void> {
  const { telegramLink, masterAdminPin, appName, brandLogo } = req.body || {};

  const updates: Record<string, string> = {};
  if (typeof telegramLink === 'string' && telegramLink.trim()) {
    updates.telegramLink = telegramLink.trim();
  }
  if (typeof masterAdminPin === 'string' && masterAdminPin.trim()) {
    updates.masterAdminPin = masterAdminPin.trim();
  }
  if (typeof appName === 'string' && appName.trim()) {
    updates.appName = appName.trim();
  }
  if (typeof brandLogo === 'string' && brandLogo.trim()) {
    updates.brandLogo = brandLogo.trim();
  }

  const updated = await updateAppSettings(updates);
  res.json({ success: true, settings: updated });
}

/**
 * POST Add IP to Whitelist
 */
export async function handleAddIp(req: Request, res: Response): Promise<void> {
  const ip = String(req.body?.ip || '').trim();
  if (!ip) {
    res.status(400).json({ error: 'IP_REQUIRED' });
    return;
  }

  const list = await addAllowedIp(ip);
  res.json({ success: true, allowedIps: list });
}

/**
 * POST Remove IP from Whitelist
 */
export async function handleRemoveIp(req: Request, res: Response): Promise<void> {
  const ip = String(req.body?.ip || '').trim();
  if (!ip) {
    res.status(400).json({ error: 'IP_REQUIRED' });
    return;
  }

  const list = await removeAllowedIp(ip);
  res.json({ success: true, allowedIps: list });
}

/**
 * POST Create Clone / Whitelabel
 */
export async function handleCreateClone(req: Request, res: Response): Promise<void> {
  const { slug, name, logo, telegramLink, theme } = req.body || {};
  const cleanSlug = String(slug || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '');

  if (!cleanSlug) {
    res.status(400).json({ error: 'SLUG_REQUIRED', message: 'Valid slug required (e.g. pro, vip2)' });
    return;
  }

  const clone: CloneConfig = {
    slug: cleanSlug,
    name: String(name || 'DARK KILLER VIP').trim(),
    logo: String(logo || '').trim(),
    telegramLink: String(telegramLink || 'https://t.me/DARK67HACK').trim(),
    theme: String(theme || 'cyberpunk').trim(),
    createdAt: Date.now(),
  };

  const saved = await saveCloneConfig(clone);
  res.json({ success: true, clone: saved });
}

/**
 * POST Delete Clone
 */
export async function handleDeleteClone(req: Request, res: Response): Promise<void> {
  const slug = String(req.body?.slug || '').trim().toLowerCase();
  if (!slug) {
    res.status(400).json({ error: 'SLUG_REQUIRED' });
    return;
  }

  await deleteCloneConfig(slug);
  res.json({ success: true, deletedSlug: slug });
}
