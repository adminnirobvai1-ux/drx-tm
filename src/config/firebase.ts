/**
 * Firebase Configuration & Client Utilities
 * Connected to Firebase project: gsgssnn-580ca
 * Realtime Database: https://gsgssnn-580ca-default-rtdb.firebaseio.com
 */

export const firebaseConfig = {
  apiKey: "AIzaSyAPknzNBmcbrAdtoRKdPAW-rd1k3ZBvn7M",
  authDomain: "gsgssnn-580ca.firebaseapp.com",
  databaseURL: "https://gsgssnn-580ca-default-rtdb.firebaseio.com",
  projectId: "gsgssnn-580ca",
  storageBucket: "gsgssnn-580ca.firebasestorage.app",
  messagingSenderId: "1083059572087",
  appId: "1:1083059572087:web:d63e79befb4f8c72f9e572",
  measurementId: "G-QHD30VNQ9H"
};

export const FIREBASE_RTDB_BASE = firebaseConfig.databaseURL;

/**
 * Direct REST helper for Firebase Realtime Database
 * Ensures frontend operations persist directly in Firebase even on static hosting
 */
export async function fbRestFetch<T>(path: string, options: RequestInit = {}): Promise<T | null> {
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  const url = `${FIREBASE_RTDB_BASE}/${cleanPath}.json`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

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
      return null;
    }

    return (await res.json()) as T;
  } catch (err) {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
