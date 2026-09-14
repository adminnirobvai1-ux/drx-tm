/**
 * Client-Side License & Password Management Service
 * 
 * Manages:
 * - Unlocked/Locked status of the application
 * - Local storage caching of valid keys
 * - Verification calls to backend (which checks Firebase RTDB)
 * - Dynamic Telegram Channel Link
 */

import { fbRestFetch } from '../config/firebase.ts';

export interface LicenseState {
  isUnlocked: boolean;
  licenseKey: string | null;
  expiresAt: number | null;
  keyType: string | null;
  telegramLink: string;
}

export interface ClientDeviceInfo {
  deviceId: string;
  deviceName: string;
  platform: string;
  browser: string;
}

type LicenseListener = (state: LicenseState) => void;

class LicenseService {
  private static instance: LicenseService;
  private state: LicenseState = {
    isUnlocked: false,
    licenseKey: null,
    expiresAt: null,
    keyType: null,
    telegramLink: 'https://t.me/DARK67HACK',
  };

  private listeners = new Set<LicenseListener>();
  private watchdogTimer: ReturnType<typeof setInterval> | null = null;
  private isChecking = false;

  public static getInstance(): LicenseService {
    if (!LicenseService.instance) {
      LicenseService.instance = new LicenseService();
    }
    return LicenseService.instance;
  }

  constructor() {
    this.restoreFromStorage();
    this.fetchPublicSettings();
    this.setupWatchdogListeners();
  }

  private setupWatchdogListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => this.triggerImmediateCheck());
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.triggerImmediateCheck();
        }
      });
    }
  }

  private triggerImmediateCheck(): void {
    if (this.state.isUnlocked && this.state.licenseKey) {
      this.checkSessionValidity();
    }
  }

  private startWatchdog(): void {
    this.stopWatchdog();
    // Heartbeat every 3 seconds to ensure instant logout when admin deletes key
    this.watchdogTimer = setInterval(() => {
      this.checkSessionValidity();
    }, 3000);
    // Also run immediately
    this.checkSessionValidity();
  }

  private stopWatchdog(): void {
    if (this.watchdogTimer) {
      clearInterval(this.watchdogTimer);
      this.watchdogTimer = null;
    }
  }

  /**
   * Real-time watchdog: Verifies if password still exists in Firebase / Server
   * If deleted or kicked -> Immediately locks phone & logs out!
   */
  public async checkSessionValidity(): Promise<void> {
    if (!this.state.isUnlocked || !this.state.licenseKey || this.isChecking) {
      return;
    }

    this.isChecking = true;
    const currentKey = this.state.licenseKey.trim().toUpperCase();
    const devInfo = this.getDeviceInfo();

    try {
      // 1. Try Backend Heartbeat API
      const res = await fetch('/api/v1/license/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: currentKey,
          deviceId: devInfo.deviceId,
          deviceName: devInfo.deviceName,
          platform: devInfo.platform,
          browser: devInfo.browser,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (!data.valid || data.kicked) {
          this.handleForcedLogout(data.message || 'আপনার পাসওয়ার্ডটি অ্যাডমিন প্যানেল থেকে মুছে ফেলা হয়েছে!');
          return;
        }
        // Valid
        return;
      } else if (res.status === 401 || res.status === 403) {
        const errData = await res.json().catch(() => ({}));
        this.handleForcedLogout(errData.message || 'আপনার পাসওয়ার্ডটি নিষ্ক্রিয় বা মুছে ফেলা হয়েছে!');
        return;
      }
    } catch {
      // Backend maybe unreachable, proceed to direct Firebase check
    } finally {
      this.isChecking = false;
    }

    // 2. Direct Firebase RTDB verification (Direct persistence fallback)
    try {
      // Check if license exists in Firebase RTDB
      const licenseRemote = await fbRestFetch<{ active?: boolean; expiresAt?: number }>(
        `licenses/${encodeURIComponent(currentKey)}`
      );

      // If license key was deleted in Firebase -> AUTO LOGOUT!
      if (licenseRemote === null || licenseRemote.active === false) {
        this.handleForcedLogout('আপনার পাসওয়ার্ডটি অ্যাডমিন প্যানেল থেকে মুছে ফেলা হয়েছে! আপনাকে স্বয়ংক্রিয়ভাবে লগআউট করা হয়েছে।');
        return;
      }

      // If expired
      if (licenseRemote.expiresAt && Date.now() > licenseRemote.expiresAt) {
        this.handleForcedLogout('আপনার পাসওয়ার্ডটির মেয়াদ শেষ হয়ে গেছে।');
        return;
      }

      // Check if this device was marked as KICKED in Firebase RTDB
      const deviceRemote = await fbRestFetch<{ status?: string; kickedReason?: string }>(
        `devices/${encodeURIComponent(devInfo.deviceId)}`
      );
      if (deviceRemote && deviceRemote.status === 'KICKED') {
        this.handleForcedLogout('অ্যাডমিন প্যানেল থেকে এই ডিভাইসটি লগআউট করা হয়েছে।');
        return;
      }

      // Send Firebase heartbeat directly
      await fbRestFetch(`devices/${encodeURIComponent(devInfo.deviceId)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          lastActive: Date.now(),
          status: 'ONLINE',
          licenseKey: currentKey,
          deviceName: devInfo.deviceName,
          platform: devInfo.platform,
          browser: devInfo.browser,
        }),
      });
    } catch {
      // Non-blocking network drop
    }
  }

  private handleForcedLogout(reason: string): void {
    this.lock();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('dk_vip_kicked', {
          detail: { message: reason },
        })
      );
    }
  }

  private restoreFromStorage(): void {
    try {
      const savedKey = localStorage.getItem('dk_vip_license_key');
      const savedExpires = localStorage.getItem('dk_vip_license_expires');
      const savedType = localStorage.getItem('dk_vip_license_type');
      const savedTg = localStorage.getItem('dk_vip_telegram_link');

      if (savedTg) {
        this.state.telegramLink = savedTg;
      }

      if (savedKey) {
        const expiresAt = savedExpires ? Number(savedExpires) : null;
        if (!expiresAt || Date.now() < expiresAt) {
          this.state.isUnlocked = true;
          this.state.licenseKey = savedKey;
          this.state.expiresAt = expiresAt;
          this.state.keyType = savedType || 'ACTIVE';
          this.startWatchdog();
        } else {
          this.lock();
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  public async fetchPublicSettings(): Promise<void> {
    try {
      const res = await fetch('/api/v1/license/settings');
      if (res.ok) {
        const data = await res.json();
        if (data && data.telegramLink) {
          this.state.telegramLink = data.telegramLink;
          localStorage.setItem('dk_vip_telegram_link', data.telegramLink);
          this.notify();
        }
      }
    } catch {
      // Try direct Firebase
      try {
        const remoteSettings = await fbRestFetch<{ telegramLink?: string }>('settings');
        if (remoteSettings && remoteSettings.telegramLink) {
          this.state.telegramLink = remoteSettings.telegramLink;
          this.notify();
        }
      } catch {}
    }
  }

  public getState(): LicenseState {
    return { ...this.state };
  }

  public subscribe(listener: LicenseListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const s = this.getState();
    this.listeners.forEach((fn) => fn(s));
  }

  public async verifyPassword(key: string): Promise<{
    success: boolean;
    message: string;
    telegramLink: string;
  }> {
    const cleanKey = key.trim();
    if (!cleanKey) {
      return {
        success: false,
        message: 'অনুগ্রহ করে পাসওয়ার্ড প্রবেশ করান।',
        telegramLink: this.state.telegramLink,
      };
    }

    const devInfo = this.getDeviceInfo();

    try {
      const res = await fetch('/api/v1/license/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: cleanKey,
          deviceId: devInfo.deviceId,
          deviceName: devInfo.deviceName,
          platform: devInfo.platform,
          browser: devInfo.browser,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.success) {
          this.unlock(data.key || cleanKey, data.expiresAt, data.keyType);
          if (data.telegramLink) {
            this.state.telegramLink = data.telegramLink;
          }
          return {
            success: true,
            message: data.message || 'পাসওয়ার্ড সফলভাবে গৃহীত হয়েছে!',
            telegramLink: this.state.telegramLink,
          };
        }
        return {
          success: false,
          message: data.message || 'ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিতে টেলিগ্রামে যোগাযোগ করুন।',
          telegramLink: data.telegramLink || this.state.telegramLink,
        };
      }
    } catch {
      // Backend not running (static hosting fallback)
    }

    // Direct Firebase RTDB Validation & Registration
    try {
      const upper = cleanKey.toUpperCase();
      const fbUrl = `licenses/${encodeURIComponent(upper)}`;
      const lic = await fbRestFetch<{
        key: string;
        active?: boolean;
        expiresAt?: number;
        type?: string;
        usedDevices?: string[];
        maxUses?: number;
      }>(fbUrl);

      if (lic && lic.active !== false) {
        if (!lic.expiresAt || lic.expiresAt > Date.now()) {
          // Register device in Firebase
          const usedDevs = Array.isArray(lic.usedDevices) ? lic.usedDevices : [];
          if (!usedDevs.includes(devInfo.deviceId)) {
            if (lic.maxUses && lic.maxUses > 0 && usedDevs.length >= lic.maxUses) {
              return {
                success: false,
                message: 'এই পাসওয়ার্ডটি ইতিমধ্যে সর্বোচ্চ সংখ্যক ডিভাইসে ব্যবহৃত হয়েছে!',
                telegramLink: this.state.telegramLink,
              };
            }
            usedDevs.push(devInfo.deviceId);
            await fbRestFetch(fbUrl, {
              method: 'PATCH',
              body: JSON.stringify({ usedDevices: usedDevs, usedCount: usedDevs.length }),
            });
          }

          // Register device session in Firebase
          await fbRestFetch(`devices/${encodeURIComponent(devInfo.deviceId)}`, {
            method: 'PUT',
            body: JSON.stringify({
              deviceId: devInfo.deviceId,
              licenseKey: upper,
              deviceName: devInfo.deviceName,
              platform: devInfo.platform,
              browser: devInfo.browser,
              firstSeen: Date.now(),
              lastActive: Date.now(),
              status: 'ONLINE',
            }),
          });

          this.unlock(upper, lic.expiresAt || Date.now() + 30 * 86400000, lic.type || 'VIP');
          return {
            success: true,
            message: 'পাসওয়ার্ড সফলভাবে গৃহীত হয়েছে! ভিআইপি এক্সেস সক্রিয়।',
            telegramLink: this.state.telegramLink,
          };
        }
        return {
          success: false,
          message: 'এই পাসওয়ার্ডটির মেয়াদ শেষ হয়ে গেছে। নতুন পাসওয়ার্ড পেতে টেলিগ্রামে যোগাযোগ করুন।',
          telegramLink: this.state.telegramLink,
        };
      }
    } catch (fbErr) {
      console.warn('Firebase fallback check error:', fbErr);
    }

    return {
      success: false,
      message: 'ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিতে টেলিগ্রামে যোগাযোগ করুন।',
      telegramLink: this.state.telegramLink,
    };
  }

  public unlock(key: string, expiresAt: number, keyType = 'VIP'): void {
    this.state.isUnlocked = true;
    this.state.licenseKey = key;
    this.state.expiresAt = expiresAt;
    this.state.keyType = keyType;

    try {
      localStorage.setItem('dk_vip_license_key', key);
      localStorage.setItem('dk_vip_license_expires', String(expiresAt));
      localStorage.setItem('dk_vip_license_type', keyType);
    } catch {}

    this.startWatchdog();
    this.notify();
  }

  public lock(): void {
    this.stopWatchdog();
    this.state.isUnlocked = false;
    this.state.licenseKey = null;
    this.state.expiresAt = null;
    this.state.keyType = null;

    try {
      localStorage.removeItem('dk_vip_license_key');
      localStorage.removeItem('dk_vip_license_expires');
      localStorage.removeItem('dk_vip_license_type');
    } catch {}

    this.notify();
  }

  public getDeviceId(): string {
    return this.getDeviceInfo().deviceId;
  }

  public getDeviceInfo(): ClientDeviceInfo {
    let deviceId = 'dev-browser';
    try {
      const stored = localStorage.getItem('dk_vip_device_id');
      if (stored) {
        deviceId = stored;
      } else {
        deviceId = `dev-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
        localStorage.setItem('dk_vip_device_id', deviceId);
      }
    } catch {}

    // Detect browser & platform
    let platform = 'Web';
    let browser = 'Chrome';
    let deviceName = 'Smart Device';

    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent;
      if (/Android/i.test(ua)) {
        platform = 'Android';
        const match = ua.match(/Android.*?; (.*?)(?:;|\))/);
        deviceName = match && match[1] ? `Android (${match[1].trim()})` : 'Android Phone';
      } else if (/iPhone/i.test(ua)) {
        platform = 'iOS';
        deviceName = 'Apple iPhone';
      } else if (/iPad/i.test(ua)) {
        platform = 'iOS';
        deviceName = 'Apple iPad';
      } else if (/Windows/i.test(ua)) {
        platform = 'Windows';
        deviceName = 'Windows PC';
      } else if (/Macintosh/i.test(ua)) {
        platform = 'macOS';
        deviceName = 'Apple Mac';
      } else if (/Linux/i.test(ua)) {
        platform = 'Linux';
        deviceName = 'Linux Workstation';
      }

      if (/Edg/i.test(ua)) browser = 'Microsoft Edge';
      else if (/Chrome/i.test(ua)) browser = 'Google Chrome';
      else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Apple Safari';
      else if (/Firefox/i.test(ua)) browser = 'Mozilla Firefox';
      else if (/Opera|OPR/i.test(ua)) browser = 'Opera';
    }

    return {
      deviceId,
      deviceName,
      platform,
      browser,
    };
  }
}

export const licenseService = LicenseService.getInstance();

