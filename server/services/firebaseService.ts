/**
 * Firebase Realtime Database & License Management Service
 * 
 * Interacts with Firebase RTDB:
 * https://gsgssnn-580ca-default-rtdb.firebaseio.com
 * 
 * Manages:
 * - Password / License keys with usage limits and expiration
 * - Telegram channel link settings
 * - Allowed IP whitelisting (including 37.111.253.150)
 * - Clone / Whitelabel link configurations
 */

export interface LicenseKey {
  key: string;
  type: '1_HOUR' | '1_DAY' | '7_DAYS' | '30_DAYS' | 'LIFETIME';
  createdAt: number;
  expiresAt: number;
  maxUses: number; // e.g. 1 device, 5 devices, or -1 for unlimited
  usedCount: number;
  usedDevices: string[];
  active: boolean;
  notes?: string;
}

export interface DeviceSession {
  deviceId: string;
  licenseKey: string;
  deviceName: string;
  platform: string;
  browser: string;
  ip: string;
  firstSeen: number;
  lastActive: number;
  status: 'ONLINE' | 'OFFLINE' | 'KICKED';
  kickedReason?: string;
}

export interface AppSettings {
  telegramLink: string;
  allowedIps: string[];
  masterAdminPin: string;
  appName: string;
  brandLogo: string;
}

export interface CloneConfig {
  slug: string;
  name: string;
  logo: string;
  telegramLink: string;
  theme?: string;
  createdAt: number;
}

const FIREBASE_DB_URL = 'https://gsgssnn-580ca-default-rtdb.firebaseio.com';

// In-memory cache for ultra-fast local validation
let settingsCache: AppSettings = {
  telegramLink: 'https://t.me/DARK67HACK',
  allowedIps: ['37.111.253.150', '127.0.0.1', '::1', 'localhost'],
  masterAdminPin: 'DARK67@ADMIN',
  appName: 'DARK KILLER VIP',
  brandLogo: 'https://raw.githubusercontent.com/adminnirobvai1-ux/drx/refs/heads/main/IMG_20260912_224401_019.jpg',
};

const licensesCache = new Map<string, LicenseKey>();
const clonesCache = new Map<string, CloneConfig>();
const devicesCache = new Map<string, DeviceSession>();

/**
 * REST Helper with Timeout
 */
async function firebaseFetch<T>(path: string, options: RequestInit = {}): Promise<T | null> {
  const url = `${FIREBASE_DB_URL}/${path}.json`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      console.warn(`[Firebase RTDB] HTTP ${res.status} on ${path}`);
      return null;
    }

    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[Firebase RTDB] Network error on ${path}:`, err instanceof Error ? err.message : err);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Initialize Firebase connection & sync initial data
 */
export async function initFirebaseService(): Promise<void> {
  try {
    // 1. Fetch or initialize settings
    const remoteSettings = await firebaseFetch<Partial<AppSettings>>('settings');
    if (remoteSettings) {
      settingsCache = {
        ...settingsCache,
        ...remoteSettings,
        allowedIps: Array.isArray(remoteSettings.allowedIps)
          ? Array.from(new Set([...settingsCache.allowedIps, ...remoteSettings.allowedIps]))
          : settingsCache.allowedIps,
      };
    } else {
      // Seed default settings into Firebase
      await firebaseFetch('settings', {
        method: 'PUT',
        body: JSON.stringify(settingsCache),
      });
    }

    // 2. Fetch licenses
    const remoteLicenses = await firebaseFetch<Record<string, LicenseKey>>('licenses');
    if (remoteLicenses && typeof remoteLicenses === 'object') {
      Object.entries(remoteLicenses).forEach(([k, v]) => {
        if (v && typeof v === 'object') {
          licensesCache.set(k.toUpperCase(), v);
        }
      });
    }

    // If no licenses exist yet, seed a default VIP master demo license
    if (licensesCache.size === 0) {
      const defaultKey: LicenseKey = {
        key: 'DARK-VIP-777',
        type: 'LIFETIME',
        createdAt: Date.now(),
        expiresAt: Date.now() + 365 * 24 * 3600 * 1000,
        maxUses: 100,
        usedCount: 0,
        usedDevices: [],
        active: true,
        notes: 'Initial VIP Master Key',
      };
      await saveLicenseKey(defaultKey);
    }

    // 3. Fetch Clones
    const remoteClones = await firebaseFetch<Record<string, CloneConfig>>('clones');
    if (remoteClones && typeof remoteClones === 'object') {
      Object.entries(remoteClones).forEach(([k, v]) => {
        if (v && typeof v === 'object') {
          clonesCache.set(k.toLowerCase(), v);
        }
      });
    }

    // 4. Fetch Devices
    const remoteDevices = await firebaseFetch<Record<string, DeviceSession>>('devices');
    if (remoteDevices && typeof remoteDevices === 'object') {
      Object.entries(remoteDevices).forEach(([k, v]) => {
        if (v && typeof v === 'object') {
          devicesCache.set(k, v);
        }
      });
    }

    console.log('[Firebase RTDB] Service initialized successfully. Allowed IPs:', settingsCache.allowedIps);
  } catch (err) {
    console.warn('[Firebase RTDB] Initialization warning:', err);
  }
}

/**
 * Get current system settings
 */
export function getAppSettings(): AppSettings {
  return { ...settingsCache };
}

/**
 * Update system settings (Telegram link, allowed IPs, brand info, master PIN)
 */
export async function updateAppSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
  settingsCache = {
    ...settingsCache,
    ...updates,
  };

  // Persist to Firebase
  await firebaseFetch('settings', {
    method: 'PUT',
    body: JSON.stringify(settingsCache),
  });

  return settingsCache;
}

/**
 * Save or update a License Key in Firebase
 */
export async function saveLicenseKey(license: LicenseKey): Promise<LicenseKey> {
  const cleanKey = license.key.trim().toUpperCase();
  const payload = {
    ...license,
    key: cleanKey,
    usedDevices: Array.isArray(license.usedDevices) ? license.usedDevices : [],
  };

  licensesCache.set(cleanKey, payload);

  await firebaseFetch(`licenses/${encodeURIComponent(cleanKey)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  // If license was disabled (active = false), kick associated devices
  if (!license.active) {
    for (const [devId, dev] of devicesCache.entries()) {
      if (dev.licenseKey && dev.licenseKey.trim().toUpperCase() === cleanKey) {
        dev.status = 'KICKED';
        dev.kickedReason = 'PASSWORD_DEACTIVATED';
        devicesCache.set(devId, dev);
        firebaseFetch(`devices/${encodeURIComponent(devId)}`, {
          method: 'PUT',
          body: JSON.stringify(dev),
        }).catch(() => {});
      }
    }
  }

  return payload;
}

/**
 * Delete a License Key - Auto Kicks all devices that logged in with this key!
 */
export async function deleteLicenseKey(key: string): Promise<boolean> {
  const cleanKey = key.trim().toUpperCase();
  licensesCache.delete(cleanKey);

  await firebaseFetch(`licenses/${encodeURIComponent(cleanKey)}`, {
    method: 'DELETE',
  });

  // Auto-Kick: Immediately kick all phones/devices logged in with this key!
  for (const [devId, dev] of devicesCache.entries()) {
    if (dev.licenseKey && dev.licenseKey.trim().toUpperCase() === cleanKey) {
      dev.status = 'KICKED';
      dev.kickedReason = 'PASSWORD_DELETED';
      devicesCache.set(devId, dev);
      firebaseFetch(`devices/${encodeURIComponent(devId)}`, {
        method: 'PUT',
        body: JSON.stringify(dev),
      }).catch(() => {});
    }
  }

  return true;
}

/**
 * Record / update device heartbeat & session state
 */
export async function recordDeviceHeartbeat(session: {
  deviceId: string;
  licenseKey: string;
  deviceName?: string;
  platform?: string;
  browser?: string;
  ip?: string;
}): Promise<{ valid: boolean; kicked: boolean; reason?: string; device?: DeviceSession }> {
  const cleanDeviceId = session.deviceId.trim();
  const cleanKey = session.licenseKey.trim().toUpperCase();
  const now = Date.now();

  // Check if device already exists in cache/Firebase
  let dev = devicesCache.get(cleanDeviceId);
  if (!dev) {
    const remote = await firebaseFetch<DeviceSession>(`devices/${encodeURIComponent(cleanDeviceId)}`);
    if (remote) {
      dev = remote;
      devicesCache.set(cleanDeviceId, remote);
    }
  }

  // If already kicked
  if (dev && dev.status === 'KICKED') {
    return {
      valid: false,
      kicked: true,
      reason: dev.kickedReason || 'KICKED_BY_ADMIN',
      device: dev,
    };
  }

  // Check if license exists and is active
  let lic = licensesCache.get(cleanKey);
  if (!lic) {
    const remoteLic = await firebaseFetch<LicenseKey>(`licenses/${encodeURIComponent(cleanKey)}`);
    if (remoteLic) {
      lic = remoteLic;
      licensesCache.set(cleanKey, remoteLic);
    }
  }

  // If license was deleted or inactive -> auto-kick this device
  if (!lic || !lic.active || (lic.expiresAt && now > lic.expiresAt)) {
    const reason = !lic ? 'PASSWORD_DELETED' : (!lic.active ? 'PASSWORD_DEACTIVATED' : 'PASSWORD_EXPIRED');
    const kickedDev: DeviceSession = {
      deviceId: cleanDeviceId,
      licenseKey: cleanKey,
      deviceName: session.deviceName || dev?.deviceName || 'Unknown Device',
      platform: session.platform || dev?.platform || 'Mobile/Web',
      browser: session.browser || dev?.browser || 'Browser',
      ip: session.ip || dev?.ip || '',
      firstSeen: dev?.firstSeen || now,
      lastActive: now,
      status: 'KICKED',
      kickedReason: reason,
    };
    devicesCache.set(cleanDeviceId, kickedDev);
    firebaseFetch(`devices/${encodeURIComponent(cleanDeviceId)}`, {
      method: 'PUT',
      body: JSON.stringify(kickedDev),
    }).catch(() => {});

    return {
      valid: false,
      kicked: true,
      reason,
      device: kickedDev,
    };
  }

  // Update active session
  const updatedDev: DeviceSession = {
    deviceId: cleanDeviceId,
    licenseKey: cleanKey,
    deviceName: session.deviceName || dev?.deviceName || 'Smart Device',
    platform: session.platform || dev?.platform || 'Mobile',
    browser: session.browser || dev?.browser || 'Web Browser',
    ip: session.ip || dev?.ip || '',
    firstSeen: dev?.firstSeen || now,
    lastActive: now,
    status: 'ONLINE',
  };

  devicesCache.set(cleanDeviceId, updatedDev);
  firebaseFetch(`devices/${encodeURIComponent(cleanDeviceId)}`, {
    method: 'PUT',
    body: JSON.stringify(updatedDev),
  }).catch(() => {});

  return {
    valid: true,
    kicked: false,
    device: updatedDev,
  };
}

/**
 * Get all connected devices
 */
export async function getAllDevices(): Promise<DeviceSession[]> {
  const remote = await firebaseFetch<Record<string, DeviceSession>>('devices');
  if (remote && typeof remote === 'object') {
    devicesCache.clear();
    Object.entries(remote).forEach(([k, v]) => {
      if (v && typeof v === 'object') {
        devicesCache.set(k, v);
      }
    });
  }

  return Array.from(devicesCache.values()).sort((a, b) => b.lastActive - a.lastActive);
}

/**
 * Kick a specific device (Force Logout)
 */
export async function kickDevice(deviceId: string, reason = 'KICKED_BY_ADMIN'): Promise<boolean> {
  const cleanId = deviceId.trim();
  let dev = devicesCache.get(cleanId);
  if (!dev) {
    const remote = await firebaseFetch<DeviceSession>(`devices/${encodeURIComponent(cleanId)}`);
    if (remote) dev = remote;
  }

  if (dev) {
    dev.status = 'KICKED';
    dev.kickedReason = reason;
    devicesCache.set(cleanId, dev);
    await firebaseFetch(`devices/${encodeURIComponent(cleanId)}`, {
      method: 'PUT',
      body: JSON.stringify(dev),
    });
    return true;
  }
  return false;
}

/**
 * Kick all devices
 */
export async function kickAllDevices(reason = 'KICKED_ALL_BY_ADMIN'): Promise<number> {
  const devices = await getAllDevices();
  let count = 0;
  for (const dev of devices) {
    dev.status = 'KICKED';
    dev.kickedReason = reason;
    devicesCache.set(dev.deviceId, dev);
    await firebaseFetch(`devices/${encodeURIComponent(dev.deviceId)}`, {
      method: 'PUT',
      body: JSON.stringify(dev),
    });
    count++;
  }
  return count;
}

/**
 * Get all license keys
 */
export async function getAllLicenses(): Promise<LicenseKey[]> {
  // Sync fresh from Firebase if possible
  const remote = await firebaseFetch<Record<string, LicenseKey>>('licenses');
  if (remote && typeof remote === 'object') {
    licensesCache.clear();
    Object.entries(remote).forEach(([k, v]) => {
      if (v && typeof v === 'object') {
        licensesCache.set(k.toUpperCase(), v);
      }
    });
  }

  return Array.from(licensesCache.values());
}

/**
 * Validate a License Key / Password with usage limit and device binding
 */
export async function verifyLicenseKey(
  inputKey: string,
  deviceId: string,
  clientInfo?: { deviceName?: string; platform?: string; browser?: string; ip?: string }
): Promise<{
  valid: boolean;
  reason?: 'NOT_FOUND' | 'EXPIRED' | 'LIMIT_EXCEEDED' | 'INACTIVE';
  license?: LicenseKey;
  telegramLink: string;
}> {
  const cleanKey = String(inputKey || '').trim().toUpperCase();
  const telegramLink = settingsCache.telegramLink || 'https://t.me/DARK67HACK';

  if (!cleanKey) {
    return { valid: false, reason: 'NOT_FOUND', telegramLink };
  }

  // 1. Check in-memory cache, then query Firebase if missing
  let license = licensesCache.get(cleanKey);
  if (!license) {
    const remote = await firebaseFetch<LicenseKey>(`licenses/${encodeURIComponent(cleanKey)}`);
    if (remote && typeof remote === 'object') {
      license = remote;
      licensesCache.set(cleanKey, remote);
    }
  }

  if (!license) {
    return { valid: false, reason: 'NOT_FOUND', telegramLink };
  }

  if (!license.active) {
    return { valid: false, reason: 'INACTIVE', telegramLink };
  }

  const now = Date.now();
  if (license.expiresAt && now > license.expiresAt) {
    return { valid: false, reason: 'EXPIRED', telegramLink };
  }

  // Check device usage limit
  const devices = Array.isArray(license.usedDevices) ? license.usedDevices : [];
  const cleanDeviceId = String(deviceId || 'browser-anon').trim();
  const isAlreadyRegistered = devices.includes(cleanDeviceId);

  if (!isAlreadyRegistered) {
    if (license.maxUses > 0 && devices.length >= license.maxUses) {
      return { valid: false, reason: 'LIMIT_EXCEEDED', telegramLink };
    }

    // Register new device
    devices.push(cleanDeviceId);
    license.usedDevices = devices;
    license.usedCount = devices.length;

    // Save back to Firebase in background
    saveLicenseKey(license).catch((e) => console.warn('Failed to save device use:', e));
  }

  // Record active device heartbeat in Firebase
  recordDeviceHeartbeat({
    deviceId: cleanDeviceId,
    licenseKey: cleanKey,
    deviceName: clientInfo?.deviceName,
    platform: clientInfo?.platform,
    browser: clientInfo?.browser,
    ip: clientInfo?.ip,
  }).catch(() => {});

  return {
    valid: true,
    license,
    telegramLink,
  };
}

/**
 * Add an IP to the whitelist
 */
export async function addAllowedIp(ip: string): Promise<string[]> {
  const cleanIp = ip.trim();
  if (!cleanIp) return settingsCache.allowedIps;

  const set = new Set(settingsCache.allowedIps);
  set.add(cleanIp);
  settingsCache.allowedIps = Array.from(set);

  await updateAppSettings({ allowedIps: settingsCache.allowedIps });
  return settingsCache.allowedIps;
}

/**
 * Remove an IP from whitelist
 */
export async function removeAllowedIp(ip: string): Promise<string[]> {
  const cleanIp = ip.trim();
  settingsCache.allowedIps = settingsCache.allowedIps.filter((item) => item !== cleanIp);
  await updateAppSettings({ allowedIps: settingsCache.allowedIps });
  return settingsCache.allowedIps;
}

/**
 * Check if an IP is whitelisted
 */
export function isIpAllowed(clientIp: string): boolean {
  if (!clientIp) return false;
  const clean = clientIp.replace('::ffff:', '').trim();

  // Always allow localhost / internal loopback
  if (clean === '127.0.0.1' || clean === '::1' || clean === 'localhost') {
    return true;
  }

  return settingsCache.allowedIps.some((allowed) => {
    const a = allowed.replace('::ffff:', '').trim();
    return a === clean || clean.includes(a);
  });
}

/**
 * Clone / Whitelabel Links Management
 */
export async function getCloneConfig(slug: string): Promise<CloneConfig | null> {
  const clean = slug.toLowerCase().trim();
  if (clonesCache.has(clean)) {
    return clonesCache.get(clean) || null;
  }

  const remote = await firebaseFetch<CloneConfig>(`clones/${encodeURIComponent(clean)}`);
  if (remote) {
    clonesCache.set(clean, remote);
    return remote;
  }
  return null;
}

export async function getAllClones(): Promise<CloneConfig[]> {
  const remote = await firebaseFetch<Record<string, CloneConfig>>('clones');
  if (remote && typeof remote === 'object') {
    clonesCache.clear();
    Object.entries(remote).forEach(([k, v]) => {
      if (v && typeof v === 'object') {
        clonesCache.set(k.toLowerCase(), v);
      }
    });
  }
  return Array.from(clonesCache.values());
}

export async function saveCloneConfig(clone: CloneConfig): Promise<CloneConfig> {
  const clean = clone.slug.toLowerCase().trim();
  const payload = { ...clone, slug: clean };
  clonesCache.set(clean, payload);

  await firebaseFetch(`clones/${encodeURIComponent(clean)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  return payload;
}

export async function deleteCloneConfig(slug: string): Promise<boolean> {
  const clean = slug.toLowerCase().trim();
  clonesCache.delete(clean);
  await firebaseFetch(`clones/${encodeURIComponent(clean)}`, {
    method: 'DELETE',
  });
  return true;
}
