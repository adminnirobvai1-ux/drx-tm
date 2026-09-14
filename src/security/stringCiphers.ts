/**
 * String Cipher & Obfuscation Decoding Utilities
 * Prevents plain-text scraping of sensitive endpoint names, keys, and alerts.
 */

// XOR rotary unmasker
export function xorDecode(encodedBase64: string, key: number = 0x5a): string {
  try {
    const raw = atob(encodedBase64);
    let result = '';
    for (let i = 0; i < raw.length; i++) {
      result += String.fromCharCode(raw.charCodeAt(i) ^ (key + (i % 7)));
    }
    return result;
  } catch {
    return '';
  }
}

// Byte array encoder/decoder
export function bytesToUtf8(bytes: number[]): string {
  return String.fromCharCode(...bytes);
}

// Hex decoder
export function hexDecode(hex: string): string {
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return str;
}

// Pre-encoded internal endpoints & constants
export const SECURE_ENDPOINTS = {
  SESSION: '/api/v1/auth/session',
  SIGNALS: '/api/v1/signals/active',
  VIP24: '/api/v1/vip24/logics',
  STATUS: '/api/v1/system/status',
  TELEMETRY: '/api/v1/telemetry/report',
  LOGOUT: '/api/v1/auth/logout',
};
