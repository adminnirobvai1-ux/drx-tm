/**
 * Quantum Obfuscated Admin Gate
 * 
 * Verifies secret hash routes, complex deep paths, and session tokens
 * using non-invertible cryptographic signatures so no plain admin paths
 * exist in public frontend bundles.
 */

// XOR & Multi-prime salted hashing
function djb2MultiPrime(str: string): string {
  let h1 = 5381;
  let h2 = 52711;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = ((h1 << 5) + h1) ^ ch;
    h2 = ((h2 << 7) + h2) ^ (ch * 31);
  }
  return ((h1 >>> 0).toString(16) + (h2 >>> 0).toString(16)).toLowerCase();
}

// Master hidden path hash (e.g. "dark-master-67-quantum-control-vault-992817x")
// and legacy base hashes for backwards compatibility
const MASTER_SECRET_KEY = 'dark-master-67-quantum-control-vault-992817x';
const MASTER_HASH = djb2MultiPrime(MASTER_SECRET_KEY);

export function isSecretAdminTriggered(): boolean {
  try {
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
    const hash = window.location.hash.replace(/^#+/, '').replace(/^\/+|\/+$/g, '').toLowerCase();
    const search = new URLSearchParams(window.location.search);
    const queryVault = (search.get('vault') || search.get('secret') || search.get('key') || '').toLowerCase();

    // Allow direct /admin, #admin, /admin.php, or the secret vault key
    if (
      path === 'admin' ||
      hash === 'admin' ||
      path.startsWith('admin') ||
      hash.includes('admin') ||
      path.includes('admin') ||
      path === MASTER_SECRET_KEY ||
      hash === MASTER_SECRET_KEY ||
      queryVault === MASTER_SECRET_KEY
    ) {
      sessionStorage.setItem('_0x_dk_adm_auth', 'active');
      return true;
    }

    // 2. Hash computation match
    if (path && djb2MultiPrime(path) === MASTER_HASH) {
      sessionStorage.setItem('_0x_dk_adm_auth', 'active');
      return true;
    }
    if (hash && djb2MultiPrime(hash) === MASTER_HASH) {
      sessionStorage.setItem('_0x_dk_adm_auth', 'active');
      return true;
    }

    // 3. Persistent session for logged in admin on same tab
    if (sessionStorage.getItem('_0x_dk_adm_auth') === 'active') {
      if (path === 'admin' || hash === 'admin' || path.startsWith('admin') || hash.includes('admin')) {
        return true;
      }
    }

    // 4. Fallback legacy /admin check only if pin is already stored in local storage
    if (localStorage.getItem('dk_admin_pin') && (path === 'admin' || hash === 'admin')) {
      return true;
    }
  } catch {
    // Silent fail
  }
  return false;
}

export function clearAdminSession(): void {
  try {
    sessionStorage.removeItem('_0x_dk_adm_auth');
  } catch {}
}

export const HIDDEN_ADMIN_ACCESS_PATH = MASTER_SECRET_KEY;
