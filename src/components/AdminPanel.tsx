/**
 * Admin Panel Component (/admin or /admin.php)
 * 
 * Features:
 * - Strict IP Whitelist Protection (e.g. 37.111.253.150) + Emergency PIN bypass
 * - Password / License Key Generator with Duration (1hr, 1d, 7d, 30d, lifetime) & Device limit
 * - Dynamic Telegram Channel Link Management (https://t.me/DARK67HACK)
 * - Allowed IP Whitelist Manager (Add/Remove IPs)
 * - Clone / Whitelabel URL Manager ("ফ্ল্যাশল লিংক সিস্টেম": custom slug, name, logo, telegram)
 * - Live Sync with Firebase Realtime Database
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  Globe,
  Send,
  RefreshCw,
  Sliders,
  ExternalLink,
  Lock,
  ArrowLeft,
  Users,
  Smartphone,
  Monitor,
  Eye,
  EyeOff,
  LogOut,
  AlertTriangle,
  Radio,
  Clock,
} from 'lucide-react';
import { fbRestFetch } from '../config/firebase.ts';

interface LicenseItem {
  key: string;
  type: string;
  createdAt: number;
  expiresAt: number;
  maxUses: number;
  usedCount: number;
  usedDevices: string[];
  active: boolean;
  notes?: string;
}

interface DeviceItem {
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

interface CloneItem {
  slug: string;
  name: string;
  logo: string;
  telegramLink: string;
  theme?: string;
  createdAt: number;
}

interface AdminDashboardData {
  clientIp: string;
  settings: {
    telegramLink: string;
    allowedIps: string[];
    masterAdminPin?: string;
    appName: string;
    brandLogo: string;
  };
  stats: {
    totalKeys: number;
    activeKeys: number;
    clonesCount: number;
    totalDevices?: number;
    onlineDevices?: number;
    kickedDevices?: number;
  };
  licenses: LicenseItem[];
  clones: CloneItem[];
  devices?: DeviceItem[];
}

interface AdminPanelProps {
  onBackToApp: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToApp }) => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Security Lock System
  const [adminPin, setAdminPin] = useState(() => {
    try {
      return sessionStorage.getItem('dk_admin_pin') || localStorage.getItem('dk_admin_pin') || '';
    } catch {
      return '';
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('dk_admin_session_unlocked') === 'true';
    } catch {
      return false;
    }
  });
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinVerifying, setPinVerifying] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  // Form states
  const [activeTab, setActiveTab] = useState<'keys' | 'devices' | 'settings' | 'ips' | 'clones'>('keys');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [devicesList, setDevicesList] = useState<DeviceItem[]>([]);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // New Key Form
  const [customKeyName, setCustomKeyName] = useState('');
  const [keyType, setKeyType] = useState('7_DAYS');
  const [keyMaxUses, setKeyMaxUses] = useState('1');
  const [keyNotes, setKeyNotes] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);
  const [keySuccessNotice, setKeySuccessNotice] = useState<string | null>(null);
  const [keyErrorNotice, setKeyErrorNotice] = useState<string | null>(null);
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());

  // Settings Form
  const [telegramInput, setTelegramInput] = useState('');
  const [appNameInput, setAppNameInput] = useState('');
  const [brandLogoInput, setBrandLogoInput] = useState('');
  const [masterPinInput, setMasterPinInput] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // IP Form
  const [newIpInput, setNewIpInput] = useState('');
  const [addingIp, setAddingIp] = useState(false);

  // Clone Form
  const [cloneSlug, setCloneSlug] = useState('');
  const [cloneName, setCloneName] = useState('');
  const [cloneLogo, setCloneLogo] = useState('');
  const [cloneTelegram, setCloneTelegram] = useState('');
  const [creatingClone, setCreatingClone] = useState(false);

  // Fetch Connected Devices
  const loadDevices = async (pinOverride?: string) => {
    const pinToUse = pinOverride || adminPin || localStorage.getItem('dk_admin_pin') || '';
    try {
      const res = await fetch('/api/v1/admin/devices', {
        headers: pinToUse ? { 'x-admin-pin': pinToUse } : {},
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.devices)) {
          setDevicesList(json.devices);
          return;
        }
      }
    } catch {
      // Fallback
    }

    // Direct Firebase fallback
    try {
      const fbDevs = await fbRestFetch<Record<string, DeviceItem>>('devices');
      if (fbDevs && typeof fbDevs === 'object') {
        const list = Object.values(fbDevs).sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0));
        setDevicesList(list);
      }
    } catch {}
  };

  // Fetch Dashboard data
  const loadDashboard = async (pinOverride?: string) => {
    setLoading(true);
    setError(null);

    const pinToUse = pinOverride || adminPin || localStorage.getItem('dk_admin_pin') || '';

    try {
      const headers: Record<string, string> = {};
      if (pinToUse) {
        headers['x-admin-pin'] = pinToUse;
      }

      const res = await fetch('/api/v1/admin/dashboard', { headers });
      const json = await res.json();

      if (res.ok && json.success) {
        setData(json);
        setIsAuthenticated(true);
        try {
          sessionStorage.setItem('dk_admin_session_unlocked', 'true');
        } catch {}
        setTelegramInput(json.settings.telegramLink || 'https://t.me/DARK67HACK');
        setAppNameInput(json.settings.appName || 'DARK KILLER VIP');
        setBrandLogoInput(json.settings.brandLogo || '');
        setMasterPinInput(json.settings.masterAdminPin || 'DARK67@ADMIN');
        if (json.devices && Array.isArray(json.devices)) {
          setDevicesList(json.devices);
        } else {
          loadDevices(pinToUse);
        }
        if (pinToUse) {
          localStorage.setItem('dk_admin_pin', pinToUse);
          sessionStorage.setItem('dk_admin_pin', pinToUse);
          setAdminPin(pinToUse);
        }
      } else {
        if (res.status === 401 || res.status === 403) {
          setIsAuthenticated(false);
          try {
            sessionStorage.removeItem('dk_admin_session_unlocked');
          } catch {}
          setError(
            json.message ||
              `অ্যাডমিন প্যানেলে প্রবেশ করতে সঠিক সিকিউরিটি পিন দিন।`
          );
        } else {
          setError(json.error || 'Failed to load dashboard');
        }
      }
    } catch (err) {
      // Backend maybe offline, try direct Firebase
      try {
        const remoteSettings = await fbRestFetch<any>('settings');
        const remoteLicenses = await fbRestFetch<Record<string, LicenseItem>>('licenses');
        const remoteClones = await fbRestFetch<Record<string, CloneItem>>('clones');
        const remoteDevices = await fbRestFetch<Record<string, DeviceItem>>('devices');

        const licArr = remoteLicenses ? Object.values(remoteLicenses) : [];
        const devArr = remoteDevices ? Object.values(remoteDevices) : [];
        const cloneArr = remoteClones ? Object.values(remoteClones) : [];

        setDevicesList(devArr);
        setData({
          clientIp: '127.0.0.1',
          settings: {
            telegramLink: remoteSettings?.telegramLink || 'https://t.me/DARK67HACK',
            allowedIps: remoteSettings?.allowedIps || ['127.0.0.1'],
            masterAdminPin: remoteSettings?.masterAdminPin || 'DARK67@ADMIN',
            appName: remoteSettings?.appName || 'DARK KILLER VIP',
            brandLogo: remoteSettings?.brandLogo || '',
          },
          stats: {
            totalKeys: licArr.length,
            activeKeys: licArr.filter((l) => l.active).length,
            clonesCount: cloneArr.length,
            totalDevices: devArr.length,
            onlineDevices: devArr.filter((d) => d.status === 'ONLINE').length,
            kickedDevices: devArr.filter((d) => d.status === 'KICKED').length,
          },
          licenses: licArr,
          clones: cloneArr,
          devices: devArr,
        });
        setTelegramInput(remoteSettings?.telegramLink || 'https://t.me/DARK67HACK');
        setAppNameInput(remoteSettings?.appName || 'DARK KILLER VIP');
        setBrandLogoInput(remoteSettings?.brandLogo || '');
        setMasterPinInput(remoteSettings?.masterAdminPin || 'DARK67@ADMIN');
      } catch {
        setError('সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না।');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboard();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleUnlockWithPin = async (e: React.FormEvent) => {
    e.preventDefault();
    const entered = pinInput.trim();
    if (!entered) {
      setPinError('অনুগ্রহ করে অ্যাডমিন পিন দিন।');
      return;
    }

    setPinVerifying(true);
    setPinError(null);

    try {
      const res = await fetch('/api/v1/admin/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: entered }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          onUnlockSuccess(entered);
          return;
        }
      }
    } catch {
      // Backend not running fallback
    }

    // Direct Firebase check
    try {
      const remoteSettings = await fbRestFetch<{ masterAdminPin?: string }>('settings');
      const expected = remoteSettings?.masterAdminPin || 'DARK67@ADMIN';
      if (entered === expected || entered === 'DARK67@ADMIN' || entered === 'DARK67HACK') {
        onUnlockSuccess(entered);
        return;
      }
    } catch {
      if (entered === 'DARK67@ADMIN' || entered === 'DARK67HACK') {
        onUnlockSuccess(entered);
        return;
      }
    }

    setPinVerifying(false);
    setPinError('ভুল অ্যাডমিন পিন! অনুগ্রহ করে সঠিক পিন কোড দিন।');
  };

  const onUnlockSuccess = (validPin: string) => {
    setAdminPin(validPin);
    setIsAuthenticated(true);
    setPinVerifying(false);
    try {
      sessionStorage.setItem('dk_admin_session_unlocked', 'true');
      sessionStorage.setItem('dk_admin_pin', validPin);
      localStorage.setItem('dk_admin_pin', validPin);
    } catch {}
    loadDashboard(validPin);
    loadDevices(validPin);
  };

  const handleLockPanel = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem('dk_admin_session_unlocked');
    } catch {}
  };

  const handleKickDevice = async (deviceId: string) => {
    if (!confirm('এই ডিভাইসটি কি এখনই লগআউট করে দিতে চান?')) return;
    setActionInProgress(deviceId);
    try {
      const pinToUse = adminPin || localStorage.getItem('dk_admin_pin') || '';
      await fetch('/api/v1/admin/devices/kick', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pinToUse,
        },
        body: JSON.stringify({ deviceId, reason: 'KICKED_BY_ADMIN' }),
      });

      // Direct Firebase update for instant sync
      await fbRestFetch(`devices/${encodeURIComponent(deviceId)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'KICKED',
          kickedReason: 'KICKED_BY_ADMIN',
          lastActive: Date.now(),
        }),
      });

      await loadDevices(pinToUse);
      await loadDashboard(pinToUse);
    } catch {
      //
    } finally {
      setActionInProgress(null);
    }
  };

  const handleKickAllDevices = async () => {
    if (!confirm('সতর্কতা: আপনি কি নিশ্চিত যে সমস্ত কানেক্টেড ডিভাইস একসাথে লগআউট করতে চান?')) return;
    setActionInProgress('all_devices');
    try {
      const pinToUse = adminPin || localStorage.getItem('dk_admin_pin') || '';
      await fetch('/api/v1/admin/devices/kick-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pinToUse,
        },
        body: JSON.stringify({ reason: 'MASS_LOGOUT' }),
      });

      // Direct Firebase update
      const allDevs = await fbRestFetch<Record<string, DeviceItem>>('devices');
      if (allDevs && typeof allDevs === 'object') {
        for (const devId of Object.keys(allDevs)) {
          await fbRestFetch(`devices/${encodeURIComponent(devId)}`, {
            method: 'PATCH',
            body: JSON.stringify({
              status: 'KICKED',
              kickedReason: 'MASS_LOGOUT',
              lastActive: Date.now(),
            }),
          });
        }
      }

      await loadDevices(pinToUse);
      await loadDashboard(pinToUse);
    } catch {
      //
    } finally {
      setActionInProgress(null);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingKey(true);
    setKeySuccessNotice(null);
    setKeyErrorNotice(null);

    try {
      const pinToUse =
        adminPin ||
        sessionStorage.getItem('dk_admin_pin') ||
        localStorage.getItem('dk_admin_pin') ||
        'DARK67@ADMIN';

      // 1. Calculate clean key or auto-generate
      let cleanKey = customKeyName.trim().toUpperCase().replace(/[.#$\[\]\/]/g, '-');
      if (!cleanKey) {
        const randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
        const numPart = Math.floor(1000 + Math.random() * 9000);
        cleanKey = `DK-${randPart}-${numPart}`;
      }

      // 2. Calculate expiration timestamp
      const now = Date.now();
      let expiresAt = now + 7 * 24 * 3600 * 1000;
      switch (keyType) {
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
          expiresAt = now + 3650 * 24 * 3600 * 1000;
          break;
        default:
          expiresAt = now + 7 * 24 * 3600 * 1000;
      }

      const parsedMaxUses = keyMaxUses === '-1' ? -1 : Number(keyMaxUses) || 1;
      const newLicense: LicenseItem = {
        key: cleanKey,
        type: keyType,
        createdAt: now,
        expiresAt,
        maxUses: parsedMaxUses,
        usedCount: 0,
        usedDevices: [],
        active: true,
        notes: keyNotes.trim() || 'Admin Panel',
      };

      // 3. Direct Firebase Realtime Database save (100% persistent on any hosting)
      await fbRestFetch(`licenses/${encodeURIComponent(cleanKey)}`, {
        method: 'PUT',
        body: JSON.stringify(newLicense),
      });

      // 4. Also notify backend API (to update backend memory cache)
      try {
        await fetch('/api/v1/admin/keys/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-pin': pinToUse,
          },
          body: JSON.stringify({
            customKey: cleanKey,
            type: keyType,
            maxUses: parsedMaxUses,
            notes: newLicense.notes,
          }),
        });
      } catch {
        // Backend offline or static hosting, direct Firebase already saved
      }

      // 5. Update local React state immediately for instant feedback
      setData((prev) => {
        if (!prev) return prev;
        const remaining = (prev.licenses || []).filter((l) => l.key !== cleanKey);
        const updated = [newLicense, ...remaining];
        return {
          ...prev,
          licenses: updated,
          stats: {
            ...prev.stats,
            totalKeys: updated.length,
            activeKeys: updated.filter((l) => l.active).length,
          },
        };
      });

      setCustomKeyName('');
      setKeyNotes('');
      setKeySuccessNotice('পাসওয়ার্ড সফলভাবে তৈরি ও ফায়ারবেসে সেভ হয়েছে! (নিচের তালিকা থেকে কপি করতে পারেন)');
      setTimeout(() => setKeySuccessNotice(null), 8000);

      // 6. Refresh in background
      await loadDashboard(pinToUse);
    } catch {
      setKeyErrorNotice('পাসওয়ার্ড তৈরি করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setCreatingKey(false);
    }
  };

  const handleDeleteKey = async (key: string) => {
    if (
      !confirm(
        `পাসওয়ার্ড "${key}" মুছে ফেলতে চান?\nসতর্কতা: এই পাসওয়ার্ড দিয়ে লগইন করা সমস্ত ফোন স্বয়ংক্রিয়ভাবে লগআউট হয়ে যাবে!`
      )
    ) {
      return;
    }

    try {
      const pinToUse =
        adminPin ||
        sessionStorage.getItem('dk_admin_pin') ||
        localStorage.getItem('dk_admin_pin') ||
        'DARK67@ADMIN';

      // 1. Direct Firebase Realtime DB delete
      await fbRestFetch(`licenses/${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });

      // 2. Immediately kick/logout all devices using this deleted key in Firebase RTDB
      try {
        const allDevs = await fbRestFetch<Record<string, DeviceItem>>('devices');
        if (allDevs && typeof allDevs === 'object') {
          for (const [devId, dev] of Object.entries(allDevs)) {
            if (dev.licenseKey === key && dev.status !== 'KICKED') {
              await fbRestFetch(`devices/${encodeURIComponent(devId)}`, {
                method: 'PATCH',
                body: JSON.stringify({
                  status: 'KICKED',
                  kickedReason: 'PASSWORD_DELETED',
                  lastActive: Date.now(),
                }),
              });
            }
          }
        }
      } catch {}

      // 3. Backend API call
      try {
        await fetch('/api/v1/admin/keys/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-pin': pinToUse,
          },
          body: JSON.stringify({ key }),
        });
      } catch {}

      // 4. Immediately remove from UI state
      setData((prev) => {
        if (!prev) return prev;
        const filtered = (prev.licenses || []).filter((l) => l.key !== key);
        return {
          ...prev,
          licenses: filtered,
          stats: {
            ...prev.stats,
            totalKeys: filtered.length,
            activeKeys: filtered.filter((l) => l.active).length,
          },
        };
      });

      await loadDashboard(pinToUse);
      await loadDevices(pinToUse);
    } catch {
      //
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);

    try {
      const pinToUse = adminPin || localStorage.getItem('dk_admin_pin') || '';
      const payload = {
        telegramLink: telegramInput.trim(),
        appName: appNameInput.trim(),
        brandLogo: brandLogoInput.trim(),
        masterAdminPin: masterPinInput.trim() || 'DARK67@ADMIN',
      };

      await fetch('/api/v1/admin/settings/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pinToUse,
        },
        body: JSON.stringify(payload),
      });

      // Direct Firebase update
      await fbRestFetch('settings', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      if (masterPinInput.trim()) {
        setAdminPin(masterPinInput.trim());
        try {
          localStorage.setItem('dk_admin_pin', masterPinInput.trim());
          sessionStorage.setItem('dk_admin_pin', masterPinInput.trim());
        } catch {}
      }

      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
      await loadDashboard(pinToUse);
    } catch {
      //
    } finally {
      setSavingSettings(false);
    }
  };

  const handleWhitelistCurrentIp = async () => {
    if (!data?.clientIp) return;
    try {
      const res = await fetch('/api/v1/admin/ips/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin || localStorage.getItem('dk_admin_pin') || '',
        },
        body: JSON.stringify({ ip: data.clientIp }),
      });
      if (res.ok) {
        await loadDashboard();
      }
    } catch {
      //
    }
  };

  const handleAddIp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIpInput.trim()) return;
    setAddingIp(true);

    try {
      const res = await fetch('/api/v1/admin/ips/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin || localStorage.getItem('dk_admin_pin') || '',
        },
        body: JSON.stringify({ ip: newIpInput.trim() }),
      });

      if (res.ok) {
        setNewIpInput('');
        await loadDashboard();
      }
    } finally {
      setAddingIp(false);
    }
  };

  const handleRemoveIp = async (ip: string) => {
    if (!confirm(`Remove IP ${ip} from whitelist?`)) return;
    try {
      await fetch('/api/v1/admin/ips/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin || localStorage.getItem('dk_admin_pin') || '',
        },
        body: JSON.stringify({ ip }),
      });
      await loadDashboard();
    } catch {}
  };

  const handleCreateClone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloneSlug.trim()) return;
    setCreatingClone(true);

    try {
      const res = await fetch('/api/v1/admin/clones/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin || localStorage.getItem('dk_admin_pin') || '',
        },
        body: JSON.stringify({
          slug: cloneSlug.trim(),
          name: cloneName.trim() || 'DARK KILLER VIP',
          logo: cloneLogo.trim(),
          telegramLink: cloneTelegram.trim() || telegramInput || 'https://t.me/DARK67HACK',
        }),
      });

      if (res.ok) {
        setCloneSlug('');
        setCloneName('');
        setCloneLogo('');
        setCloneTelegram('');
        await loadDashboard();
      }
    } finally {
      setCreatingClone(false);
    }
  };

  const handleDeleteClone = async (slug: string) => {
    if (!confirm(`Delete clone "${slug}"?`)) return;
    try {
      await fetch('/api/v1/admin/clones/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin || localStorage.getItem('dk_admin_pin') || '',
        },
        body: JSON.stringify({ slug }),
      });
      await loadDashboard();
    } catch {}
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // If not authenticated, show Security PIN Lock Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050814] text-white flex items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-[#081024] border border-amber-900/60 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-amber-950/40 relative z-10">
          <div className="text-center space-y-3 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/10">
              <Lock size={32} className="animate-pulse" />
            </div>
            <h2 className="text-xl font-black font-serif-luxury text-white tracking-wide">
              ADMIN SECURITY LOCK
            </h2>
            <p className="text-xs text-slate-400 font-mono-tech leading-relaxed">
              অ্যাডমিন প্যানেলে প্রবেশ করতে আপনার মাস্টার সিকিউরিটি পিন (Admin PIN) দিন।
            </p>
          </div>

          {pinError && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs font-mono-tech flex items-center space-x-2">
              <AlertTriangle size={16} className="text-red-400 shrink-0" />
              <span>{pinError}</span>
            </div>
          )}

          <form onSubmit={handleUnlockWithPin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono-tech text-amber-400 uppercase tracking-wider mb-1.5">
                মাস্টার সিকিউরিটি পিন কোড:
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(null);
                  }}
                  autoFocus
                  placeholder="যেমন: DARK67@ADMIN"
                  className="w-full pl-4 pr-11 py-3 rounded-xl bg-black/70 border border-amber-900/70 text-amber-300 font-mono-tech text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 p-1 text-slate-400 hover:text-white"
                  title={showPin ? 'Hide PIN' : 'Show PIN'}
                >
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 font-mono-tech mt-1.5">
                ডিফল্ট মাস্টার পিন: <code className="text-amber-300 font-bold">DARK67@ADMIN</code>
              </p>
            </div>

            <button
              type="submit"
              disabled={pinVerifying}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs font-serif-luxury uppercase tracking-widest shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {pinVerifying ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>যাচাই করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>প্যানেল আনলক করুন</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-blue-950 flex items-center justify-between">
            <button
              type="button"
              onClick={onBackToApp}
              className="text-xs text-slate-400 hover:text-white flex items-center space-x-1.5 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>ইউজার প্যানেলে ফিরে যান</span>
            </button>
            <span className="text-[10px] text-emerald-400 font-mono-tech flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>FIREBASE RTDB SECURE</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // If loading first time after auth
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[#050814] text-white flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-mono-tech text-cyan-400">LOADING ADMIN CONTROL PANEL...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050914] text-slate-100 font-sans pb-16">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-50 bg-[#081024]/90 backdrop-blur-md border-b border-blue-900/50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onBackToApp}
              className="p-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900 text-slate-300 hover:text-white border border-blue-800 transition-colors"
              title="Return to user interface"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center font-black text-black text-xs font-mono-tech shadow-sm">
                DK
              </div>
              <div>
                <h1 className="font-serif-luxury font-black text-base text-white tracking-wide">
                  ADMIN CONTROL PANEL
                </h1>
                <p className="text-[10px] text-emerald-400 font-mono-tech flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>FIREBASE REALTIME DB CONNECTED</span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick info & Refresh & Lock */}
          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-800/60 text-[11px] font-mono-tech text-slate-300">
              <Globe size={13} className="text-cyan-400" />
              <span>IP: {data?.clientIp || '...'}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                loadDashboard();
                loadDevices();
              }}
              className="p-1.5 rounded-lg bg-blue-950 hover:bg-blue-900 text-slate-300 border border-blue-800 transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={handleLockPanel}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-red-950/70 hover:bg-red-900 text-red-300 border border-red-800/80 text-xs font-mono-tech transition-colors cursor-pointer"
              title="Lock Admin Panel"
            >
              <Lock size={13} />
              <span className="hidden sm:inline">লক করুন</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Container */}
      <main className="max-w-7xl mx-auto px-4 pt-6 space-y-6">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-[#0a142e] border border-blue-900/60 rounded-xl p-3.5">
            <div className="text-[11px] font-mono-tech text-slate-400 uppercase">Total Keys</div>
            <div className="text-2xl font-black font-mono-tech text-white mt-1">
              {data?.stats?.totalKeys ?? 0}
            </div>
          </div>

          <div className="bg-[#0a142e] border border-emerald-900/60 rounded-xl p-3.5">
            <div className="text-[11px] font-mono-tech text-emerald-400 uppercase">Active Keys</div>
            <div className="text-2xl font-black font-mono-tech text-emerald-300 mt-1">
              {data?.stats?.activeKeys ?? 0}
            </div>
          </div>

          <div className="bg-[#0a142e] border border-cyan-900/60 rounded-xl p-3.5">
            <div className="text-[11px] font-mono-tech text-cyan-400 uppercase">All Devices</div>
            <div className="text-2xl font-black font-mono-tech text-cyan-300 mt-1">
              {devicesList.length || (data?.stats?.totalDevices ?? 0)}
            </div>
          </div>

          <div className="bg-[#0a142e] border border-teal-900/60 rounded-xl p-3.5">
            <div className="text-[11px] font-mono-tech text-teal-400 uppercase">Online Now</div>
            <div className="text-2xl font-black font-mono-tech text-teal-300 mt-1 flex items-center space-x-1.5">
              <span>
                {devicesList.filter(
                  (d) => d.status === 'ONLINE' && Date.now() - (d.lastActive || 0) < 60000
                ).length}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>

          <div className="bg-[#0a142e] border border-amber-900/60 rounded-xl p-3.5">
            <div className="text-[11px] font-mono-tech text-amber-400 uppercase">Allowed IPs</div>
            <div className="text-2xl font-black font-mono-tech text-amber-300 mt-1">
              {data?.settings?.allowedIps?.length ?? 1}
            </div>
          </div>

          <div className="bg-[#0a142e] border border-purple-900/60 rounded-xl p-3.5">
            <div className="text-[11px] font-mono-tech text-purple-400 uppercase">Clone Portals</div>
            <div className="text-2xl font-black font-mono-tech text-purple-300 mt-1">
              {data?.stats?.clonesCount ?? 0}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-blue-950 space-x-2 overflow-x-auto">
          {[
            { id: 'keys', label: 'পাসওয়ার্ড জেনারেটর (Keys)', icon: Key },
            { id: 'devices', label: `সব ডিভাইস (${devicesList.length})`, icon: Smartphone },
            { id: 'settings', label: 'টেলিগ্রাম ও ব্র্যান্ডিং', icon: Send },
            { id: 'ips', label: 'আইপি প্রটেকশন (Firewall)', icon: ShieldCheck },
            { id: 'clones', label: 'ক্লোন লিংক সিস্টেম (Whitelabel)', icon: Globe },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-amber-400 text-amber-300 bg-blue-950/40'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: KEYS GENERATOR & MANAGEMENT */}
        {activeTab === 'keys' && (
          <div className="space-y-6">
            {/* Create New Key Card */}
            <div className="bg-[#081024] border border-blue-900/60 rounded-2xl p-5">
              <div className="flex items-center space-x-2 mb-4">
                <Key size={18} className="text-amber-400" />
                <h3 className="font-bold text-sm text-white">নতুন পাসওয়ার্ড / লাইসেন্স কি তৈরি করুন</h3>
              </div>

              {keySuccessNotice && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-between text-emerald-300 text-xs font-mono-tech">
                  <div className="flex items-center space-x-2">
                    <Check size={16} className="text-emerald-400 shrink-0" />
                    <span>{keySuccessNotice}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setKeySuccessNotice(null)}
                    className="text-emerald-400 hover:text-white text-xs px-2 py-0.5 rounded cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {keyErrorNotice && (
                <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-500/50 flex items-center justify-between text-red-300 text-xs font-mono-tech">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle size={16} className="text-red-400 shrink-0" />
                    <span>{keyErrorNotice}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setKeyErrorNotice(null)}
                    className="text-red-400 hover:text-white text-xs px-2 py-0.5 rounded cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              <form onSubmit={handleCreateKey} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-mono-tech text-slate-400 mb-1">
                    কাস্টম পাসওয়ার্ড (খালি রাখলে অটো হবে):
                  </label>
                  <input
                    type="text"
                    value={customKeyName}
                    onChange={(e) => setCustomKeyName(e.target.value.toUpperCase())}
                    placeholder="Ex: DARK-VIP-99"
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-700 text-white font-mono-tech text-xs focus:border-amber-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono-tech text-slate-400 mb-1">
                    মেয়াদ (DURATION):
                  </label>
                  <select
                    value={keyType}
                    onChange={(e) => setKeyType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-700 text-white font-mono-tech text-xs focus:border-amber-400 outline-none"
                  >
                    <option value="1_HOUR">১ ঘন্টা (1 Hour Demo)</option>
                    <option value="1_DAY">১ দিন (24 Hours)</option>
                    <option value="7_DAYS">৭ দিন (1 Week)</option>
                    <option value="30_DAYS">৩০ দিন (1 Month)</option>
                    <option value="LIFETIME">লাইফটাইম (Lifetime VIP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono-tech text-slate-400 mb-1">
                    ডিভাইস লিমিট (MAX DEVICES):
                  </label>
                  <select
                    value={keyMaxUses}
                    onChange={(e) => setKeyMaxUses(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-700 text-white font-mono-tech text-xs focus:border-amber-400 outline-none"
                  >
                    <option value="1">১ টি ডিভাইস (Strict 1 Device)</option>
                    <option value="2">২ টি ডিভাইস</option>
                    <option value="5">৫ টি ডিভাইস</option>
                    <option value="10">১০ টি ডিভাইস</option>
                    <option value="-1">আনলিমিটেড (Unlimited)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={creatingKey}
                    className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs font-serif-luxury tracking-wider uppercase shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <Plus size={15} />
                    <span>{creatingKey ? 'তৈরি হচ্ছে...' : 'জেনারেট করুন'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Keys Table */}
            <div className="bg-[#081024] border border-blue-900/60 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-blue-900/40 flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-300 font-mono-tech tracking-wider uppercase">
                  ACTIVE FIREBASE LICENSES ({data?.licenses?.length ?? 0})
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAllPasswords(!showAllPasswords)}
                  className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-blue-950/80 hover:bg-blue-900 border border-blue-800 text-[11px] font-mono-tech text-amber-300 transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Toggle mask for all keys"
                >
                  {showAllPasswords ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{showAllPasswords ? 'সব পাসওয়ার্ড হাইড করুন' : 'সব পাসওয়ার্ড শো করুন'}</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0a142e] text-slate-400 font-mono-tech border-b border-blue-900/30">
                    <tr>
                      <th className="px-4 py-3">PASSWORD KEY (PROTECTED)</th>
                      <th className="px-4 py-3">DURATION</th>
                      <th className="px-4 py-3">DEVICE USAGE</th>
                      <th className="px-4 py-3">EXPIRES AT</th>
                      <th className="px-4 py-3">STATUS</th>
                      <th className="px-4 py-3 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-950 font-mono-tech">
                    {data?.licenses?.map((item) => {
                      const isExpired = item.expiresAt && Date.now() > item.expiresAt;
                      const isRevealed = showAllPasswords || revealedKeys.has(item.key);
                      const displayKey = isRevealed
                        ? item.key
                        : item.key.length > 8
                        ? `${item.key.slice(0, 3)}••••••••${item.key.slice(-3)}`
                        : '••••••••••••';

                      return (
                        <tr key={item.key} className="hover:bg-blue-950/20 transition-colors">
                          <td className="px-4 py-3 font-bold text-amber-300 flex items-center space-x-2">
                            <span className="font-mono-tech select-all tracking-wider text-[12px]">
                              {displayKey}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setRevealedKeys((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(item.key)) next.delete(item.key);
                                  else next.add(item.key);
                                  return next;
                                });
                              }}
                              className="p-1 rounded text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                              title={isRevealed ? "পাসওয়ার্ড হাইড করুন" : "পাসওয়ার্ড দেখুন"}
                            >
                              {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(item.key)}
                              className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                              title="Copy Plain Key"
                            >
                              {copiedKey === item.key ? (
                                <Check size={13} className="text-emerald-400" />
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-slate-300">{item.type}</td>
                          <td className="px-4 py-3 text-slate-300">
                            {item.usedCount} / {item.maxUses === -1 ? '∞' : item.maxUses}
                          </td>
                          <td className="px-4 py-3 text-slate-400">
                            {new Date(item.expiresAt).toLocaleDateString()}{' '}
                            {new Date(item.expiresAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isExpired
                                  ? 'bg-red-950 text-red-400 border border-red-800'
                                  : item.active
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {isExpired ? 'EXPIRED' : item.active ? 'ACTIVE' : 'REVOKED'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteKey(item.key)}
                              className="p-1.5 rounded text-red-400 hover:text-red-300 hover:bg-red-950/60 cursor-pointer"
                              title="Delete Key"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONNECTED DEVICES (ALL DEVICES) */}
        {activeTab === 'devices' && (
          <div className="space-y-6">
            {/* Devices Management Top Bar */}
            <div className="bg-[#081024] border border-blue-900/60 rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
                    <Smartphone size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                      <span>সমস্ত কানেক্টেড মোবাইল ও ডিভাইস</span>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 text-[10px] font-mono-tech border border-cyan-800">
                        {devicesList.length} টি ডিভাইস
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono-tech mt-0.5">
                      কোনো পাসওয়ার্ড ডিলিট হলে সেই পাসওয়ার্ডের সব ফোন অটোমেটিক লগআউট হয়ে যায়।
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => loadDevices()}
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-slate-300 border border-blue-800 text-xs font-mono-tech transition-colors cursor-pointer"
                  >
                    <RefreshCw size={13} className={actionInProgress === 'refresh' ? 'animate-spin' : ''} />
                    <span>রিফ্রেশ</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleKickAllDevices}
                    disabled={actionInProgress === 'all_devices' || devicesList.length === 0}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-mono-tech font-bold transition-all shadow-md shadow-red-950/50 cursor-pointer disabled:opacity-40"
                  >
                    <LogOut size={13} />
                    <span>
                      {actionInProgress === 'all_devices' ? 'লগআউট হচ্ছে...' : 'সব ডিভাইস লগআউট (Kick All)'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Devices List Table */}
            <div className="bg-[#081024] border border-blue-900/60 rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-blue-900/40 flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-300 font-mono-tech tracking-wider uppercase flex items-center space-x-2">
                  <span>ACTIVE SESSIONS & DEVICES ({devicesList.length})</span>
                </h4>
                <div className="flex items-center space-x-2 text-[11px] font-mono-tech">
                  <span className="flex items-center space-x-1 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>
                      অনলাইন:{' '}
                      {
                        devicesList.filter(
                          (d) => d.status === 'ONLINE' && Date.now() - (d.lastActive || 0) < 60000
                        ).length
                      }
                    </span>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-red-400">
                    লগআউট:{' '}
                    {devicesList.filter((d) => d.status === 'KICKED').length}
                  </span>
                </div>
              </div>

              {devicesList.length === 0 ? (
                <div className="p-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-950/50 border border-blue-900 flex items-center justify-center mx-auto text-slate-500">
                    <Smartphone size={24} />
                  </div>
                  <p className="text-xs text-slate-400 font-mono-tech">
                    এখনো কোনো ডিভাইস সংযুক্ত হয়নি। যখনই কোনো ইউজার পাসওয়ার্ড দিয়ে লগইন করবে, সাথে সাথে তার মোবাইল/ডিভাইস এখানে লাইভ দেখাবে।
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0a142e] text-slate-400 font-mono-tech border-b border-blue-900/30">
                      <tr>
                        <th className="px-4 py-3">DEVICE / PHONE</th>
                        <th className="px-4 py-3">LOGIN PASSWORD</th>
                        <th className="px-4 py-3">IP & PLATFORM</th>
                        <th className="px-4 py-3">STATUS</th>
                        <th className="px-4 py-3">LAST ACTIVE</th>
                        <th className="px-4 py-3 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-950 font-mono-tech">
                      {devicesList.map((dev) => {
                        const isOnline =
                          dev.status === 'ONLINE' && Date.now() - (dev.lastActive || 0) < 60000;
                        const isKicked = dev.status === 'KICKED';
                        const isMobile =
                          (dev.platform &&
                            (dev.platform.toLowerCase().includes('android') ||
                              dev.platform.toLowerCase().includes('iphone') ||
                              dev.platform.toLowerCase().includes('mobile'))) ||
                          false;

                        let kickedReasonLabel = '';
                        if (dev.kickedReason === 'PASSWORD_DELETED') {
                          kickedReasonLabel = 'পাসওয়ার্ড ডিলিট করায় অটো লগআউট';
                        } else if (dev.kickedReason === 'PASSWORD_DEACTIVATED') {
                          kickedReasonLabel = 'পাসওয়ার্ড ডিঅ্যাক্টিভ করায় লগআউট';
                        } else if (dev.kickedReason === 'KICKED_BY_ADMIN') {
                          kickedReasonLabel = 'অ্যাডমিন কর্তৃক কিকড';
                        } else if (dev.kickedReason === 'MASS_LOGOUT') {
                          kickedReasonLabel = 'সকল ডিভাইস লগআউট';
                        }

                        return (
                          <tr key={dev.deviceId} className="hover:bg-blue-950/20 transition-colors">
                            {/* Device details */}
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-2.5">
                                <div
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                    isMobile
                                      ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                                      : 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/60'
                                  }`}
                                >
                                  {isMobile ? <Smartphone size={15} /> : <Monitor size={15} />}
                                </div>
                                <div>
                                  <div className="font-bold text-white flex items-center space-x-1.5">
                                    <span>{dev.deviceName || 'Android Mobile'}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-mono-tech truncate max-w-[140px]">
                                    ID: {dev.deviceId.slice(0, 16)}...
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Password key */}
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800/80 text-amber-300 font-bold font-mono-tech text-[11px]">
                                {dev.licenseKey || 'N/A'}
                              </span>
                            </td>

                            {/* IP & Platform */}
                            <td className="px-4 py-3">
                              <div className="text-slate-300 text-[11px] font-mono-tech">
                                {dev.ip || '127.0.0.1'}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono-tech">
                                {dev.platform || 'Android'} · {dev.browser || 'Chrome'}
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3">
                              {isKicked ? (
                                <div>
                                  <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 text-[10px] font-bold">
                                    KICKED / LOGGED OUT
                                  </span>
                                  {kickedReasonLabel && (
                                    <div className="text-[10px] text-red-400/80 mt-0.5">
                                      {kickedReasonLabel}
                                    </div>
                                  )}
                                </div>
                              ) : isOnline ? (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  <span>ONLINE NOW</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[10px] font-bold">
                                  OFFLINE
                                </span>
                              )}
                            </td>

                            {/* Last Active */}
                            <td className="px-4 py-3 text-slate-400 text-[11px]">
                              {dev.lastActive ? (
                                <>
                                  <div>{new Date(dev.lastActive).toLocaleDateString()}</div>
                                  <div className="text-[10px] text-slate-500">
                                    {new Date(dev.lastActive).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      second: '2-digit',
                                    })}
                                  </div>
                                </>
                              ) : (
                                'N/A'
                              )}
                            </td>

                            {/* Action Button */}
                            <td className="px-4 py-3 text-right">
                              {isKicked ? (
                                <span className="text-[10px] text-slate-500 font-mono-tech">
                                  লগআউট সম্পন্ন
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleKickDevice(dev.deviceId)}
                                  disabled={actionInProgress === dev.deviceId}
                                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-red-950/70 hover:bg-red-900 text-red-300 border border-red-800 text-[11px] font-mono-tech transition-colors cursor-pointer disabled:opacity-50"
                                  title="Force Logout this Device"
                                >
                                  <LogOut size={12} />
                                  <span>
                                    {actionInProgress === dev.deviceId ? 'লগআউট হচ্ছে...' : 'কিক করুন'}
                                  </span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SETTINGS & TELEGRAM */}
        {activeTab === 'settings' && (
          <div className="bg-[#081024] border border-blue-900/60 rounded-2xl p-6 max-w-2xl">
            <div className="flex items-center space-x-2 mb-5">
              <Send size={18} className="text-cyan-400" />
              <h3 className="font-bold text-sm text-white">টেলিগ্রাম চ্যানেল ও অ্যাপ কনফিগারেশন</h3>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono-tech text-amber-400 mb-1 flex items-center space-x-1.5">
                  <Lock size={13} />
                  <span>অ্যাডমিন মাস্টার পিন লক কোড (ADMIN MASTER PIN):</span>
                </label>
                <input
                  type="text"
                  value={masterPinInput}
                  onChange={(e) => setMasterPinInput(e.target.value)}
                  placeholder="DARK67@ADMIN"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-amber-800/80 text-amber-300 font-mono-tech text-xs focus:border-amber-400 outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  এই সিকিউরিটি পিন দিয়ে অ্যাডমিন প্যানেলে লগইন করতে হবে। ডিফল্ট পিন: DARK67@ADMIN
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-mono-tech text-slate-400 mb-1">
                  অফিসিয়াল টেলিগ্রাম চ্যানেল লিংক (ভুল পাসওয়ার্ড দিলে এই লিংকে যাবে):
                </label>
                <div className="relative flex items-center">
                  <Send size={15} className="absolute left-3.5 text-cyan-400" />
                  <input
                    type="url"
                    value={telegramInput}
                    onChange={(e) => setTelegramInput(e.target.value)}
                    placeholder="https://t.me/DARK67HACK"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-black/60 border border-slate-700 text-white font-mono-tech text-xs focus:border-cyan-400 outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  পাসওয়ার্ড ভুল দিলে বা বটে প্রেডিকশন চাইলে ইউজার স্বয়ংক্রিয়ভাবে এই লিংকে রিডাইরেক্ট হবে।
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-mono-tech text-slate-400 mb-1">
                  অ্যাপের নাম (DEFAULT APP NAME):
                </label>
                <input
                  type="text"
                  value={appNameInput}
                  onChange={(e) => setAppNameInput(e.target.value)}
                  placeholder="DARK KILLER VIP"
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-700 text-white font-mono-tech text-xs focus:border-cyan-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono-tech text-slate-400 mb-1">
                  লোগো ইমেজ লিংক (BRAND LOGO URL):
                </label>
                <input
                  type="url"
                  value={brandLogoInput}
                  onChange={(e) => setBrandLogoInput(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-700 text-white font-mono-tech text-xs focus:border-cyan-400 outline-none"
                />
              </div>

              {settingsSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-xs font-bold">
                  সেটিংস সফলভাবে ফায়ারবেসে সেভ হয়েছে!
                </div>
              )}

              <button
                type="submit"
                disabled={savingSettings}
                className="py-2.5 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md shadow-cyan-600/30 active:scale-95 transition-all cursor-pointer"
              >
                {savingSettings ? 'সেভ হচ্ছে...' : 'সেটিংস আপডেট করুন'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: IP PROTECTION */}
        {activeTab === 'ips' && (
          <div className="space-y-6 max-w-3xl">
            <div className="bg-[#081024] border border-blue-900/60 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <ShieldCheck size={18} className="text-emerald-400" />
                  <h3 className="font-bold text-sm text-white">অনুমোদিত আইপি তালিকা (WHITELISTED IPS)</h3>
                </div>
                <button
                  type="button"
                  onClick={handleWhitelistCurrentIp}
                  className="px-3 py-1.5 rounded-lg bg-emerald-900/40 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-xs font-bold font-mono-tech cursor-pointer"
                >
                  + Whitelist My Current IP ({data?.clientIp})
                </button>
              </div>

              <form onSubmit={handleAddIp} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newIpInput}
                  onChange={(e) => setNewIpInput(e.target.value)}
                  placeholder="37.111.253.150"
                  className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-slate-700 text-white font-mono-tech text-xs focus:border-emerald-400 outline-none"
                />
                <button
                  type="submit"
                  disabled={addingIp}
                  className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono-tech uppercase cursor-pointer"
                >
                  Add IP
                </button>
              </form>

              <div className="divide-y divide-blue-950">
                {data?.settings?.allowedIps?.map((ip) => (
                  <div key={ip} className="py-2.5 flex items-center justify-between font-mono-tech text-xs">
                    <span className="text-slate-200">
                      {ip}{' '}
                      {ip === data?.clientIp && (
                        <span className="text-[10px] text-emerald-400 font-bold">(Your Current IP)</span>
                      )}
                    </span>
                    {ip !== '127.0.0.1' && ip !== '::1' && (
                      <button
                        type="button"
                        onClick={() => handleRemoveIp(ip)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CLONE / WHITELABEL LINKS */}
        {activeTab === 'clones' && (
          <div className="space-y-6">
            <div className="bg-[#081024] border border-blue-900/60 rounded-2xl p-5">
              <div className="flex items-center space-x-2 mb-4">
                <Globe size={18} className="text-purple-400" />
                <h3 className="font-bold text-sm text-white">নতুন ক্লোন লিংক তৈরি করুন (ফ্ল্যাশল লিংক সিস্টেম)</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                এই ফিচার দিয়ে আপনি আপনার মূল ডোমেইনের অধীনে যেকোনো সাব-পাথ (যেমন <code>/clone/vip</code> বা <code>?brand=vip</code>) দিয়ে হুবহু কপি ভার্সন তৈরি করতে পারবেন নিজের মনমতো নাম, লোগো ও টেলিগ্রাম দিয়ে।
              </p>

              <form onSubmit={handleCreateClone} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-mono-tech text-slate-400 mb-1">
                    পাথ স্লাগ (SLUG, Ex: pro, master):
                  </label>
                  <input
                    type="text"
                    value={cloneSlug}
                    onChange={(e) => setCloneSlug(e.target.value)}
                    placeholder="vip2"
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-700 text-white font-mono-tech text-xs focus:border-purple-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono-tech text-slate-400 mb-1">
                    ব্র্যান্ডের নাম (APP NAME):
                  </label>
                  <input
                    type="text"
                    value={cloneName}
                    onChange={(e) => setCloneName(e.target.value)}
                    placeholder="ROYAL DARK VIP"
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-700 text-white font-mono-tech text-xs focus:border-purple-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono-tech text-slate-400 mb-1">
                    কাস্টম টেলিগ্রাম লিংক:
                  </label>
                  <input
                    type="url"
                    value={cloneTelegram}
                    onChange={(e) => setCloneTelegram(e.target.value)}
                    placeholder="https://t.me/DARK67HACK"
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-700 text-white font-mono-tech text-xs focus:border-purple-400 outline-none"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={creatingClone}
                    className="w-full py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-mono-tech uppercase shadow-md shadow-purple-600/30 cursor-pointer"
                  >
                    {creatingClone ? 'তৈরি হচ্ছে...' : 'ক্লোন লিংক বানান'}
                  </button>
                </div>
              </form>
            </div>

            {/* Clones List */}
            <div className="bg-[#081024] border border-blue-900/60 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-blue-900/40">
                <h4 className="font-bold text-xs text-slate-300 font-mono-tech uppercase">
                  ACTIVE CLONE PORTALS ({data?.clones?.length ?? 0})
                </h4>
              </div>

              <div className="divide-y divide-blue-950">
                {data?.clones?.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 font-mono-tech">
                    এখনো কোনো ক্লোন লিংক তৈরি করা হয়নি।
                  </div>
                ) : (
                  data?.clones?.map((c) => (
                    <div key={c.slug} className="p-4 flex items-center justify-between hover:bg-blue-950/20">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono-tech font-bold text-purple-300 text-sm">
                            /{c.slug}
                          </span>
                          <span className="text-xs text-slate-300">({c.name})</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono-tech mt-0.5 flex items-center space-x-2">
                          <span>URL: ?brand={c.slug}</span>
                          <span>·</span>
                          <a
                            href={c.telegramLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyan-400 hover:underline"
                          >
                            {c.telegramLink}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => window.open(`?brand=${c.slug}`, '_blank')}
                          className="p-1.5 rounded-lg bg-blue-950 hover:bg-blue-900 text-slate-300"
                          title="Open Clone Portal"
                        >
                          <ExternalLink size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClone(c.slug)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/50"
                          title="Delete Clone"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
