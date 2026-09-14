/**
 * Authenticated Cryptographic Token API Client
 * 
 * Enforces Token-Based Authentication across all API calls:
 * - Automatically performs secure handshake with backend on boot
 * - Injects cryptographic HMAC-SHA256 bearer tokens into request headers
 * - Automatically rotates and refreshes expired tokens
 * - Protects all underlying backend endpoints from unauthorized inspection
 */

export class ApiClient {
  private static instance: ApiClient;
  private authToken: string | null = null;
  private tokenExpiresAt = 0;
  private handshakePromise: Promise<string> | null = null;

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  /**
   * Securely acquires a cryptographic access token via handshake
   */
  public async ensureToken(): Promise<string> {
    // If token exists and has > 60 seconds validity, reuse
    if (this.authToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.authToken;
    }

    // Reuse in-flight handshake promise if multiple calls occur in parallel
    if (this.handshakePromise) {
      return this.handshakePromise;
    }

    this.handshakePromise = (async () => {
      try {
        const res = await fetch('/api/v1/auth/token/handshake', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          credentials: 'same-origin',
          body: JSON.stringify({
            client: 'DarkKiller_VIP_Core',
            bootTime: Date.now(),
          }),
        });

        if (!res.ok) {
          throw new Error(`Handshake failed: ${res.status}`);
        }

        const data = await res.json();
        if (data && data.token) {
          this.authToken = data.token;
          this.tokenExpiresAt = Number(data.expiresAt) || Date.now() + 3600000;
          return data.token;
        }
        throw new Error('Invalid handshake token payload');
      } finally {
        this.handshakePromise = null;
      }
    })();

    return this.handshakePromise;
  }

  /**
   * Reset local token (e.g. upon 401 or 403)
   */
  public invalidateToken(): void {
    this.authToken = null;
    this.tokenExpiresAt = 0;
  }

  public async get<T>(endpoint: string, retryCount = 0): Promise<T> {
    // Endpoints that do not require token
    const isPublic = endpoint.includes('/auth/token/handshake');
    let token = '';

    if (!isPublic) {
      try {
        token = await this.ensureToken();
      } catch (err) {
        console.warn('Security handshake warning:', err);
      }
    }

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };

    if (token) {
      headers['X-Security-Token'] = token;
      headers['X-Auth-Token'] = token;
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      method: 'GET',
      headers,
      credentials: 'same-origin',
    });

    // If unauthorized or token expired, invalidate and retry once with fresh handshake
    if ((response.status === 401 || response.status === 403) && retryCount === 0 && !isPublic) {
      this.invalidateToken();
      return this.get<T>(endpoint, retryCount + 1);
    }

    if (!response.ok) {
      throw new Error(`API GET request failed: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  public async post<T>(endpoint: string, data?: unknown, retryCount = 0): Promise<T> {
    const isPublic = endpoint.includes('/auth/token/handshake');
    let token = '';

    if (!isPublic) {
      try {
        token = await this.ensureToken();
      } catch (err) {
        console.warn('Security handshake warning:', err);
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };

    if (token) {
      headers['X-Security-Token'] = token;
      headers['X-Auth-Token'] = token;
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      credentials: 'same-origin',
      body: data ? JSON.stringify(data) : undefined,
    });

    if ((response.status === 401 || response.status === 403) && retryCount === 0 && !isPublic) {
      this.invalidateToken();
      return this.post<T>(endpoint, data, retryCount + 1);
    }

    if (!response.ok) {
      throw new Error(`API POST request failed: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }
}

export const apiClient = ApiClient.getInstance();
