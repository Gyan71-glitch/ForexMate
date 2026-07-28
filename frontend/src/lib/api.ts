/**
 * Central API configuration.
 * Uses relative path for local dev proxying to avoid cross-origin cookie issues.
 */


const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
const API_URL = rawApiUrl.endsWith('/api/v1') ? rawApiUrl : `${rawApiUrl}/api/v1`;

export default API_URL;

// In-Memory Access Token storage to prevent XSS leakage
let memoryToken: string | null = null;

export function setMemoryToken(token: string | null) {
  memoryToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      // 365d cookie so middleware doesn't expire while refresh token is still valid
      document.cookie = `accessToken=${token}; path=/; max-age=31536000; SameSite=Lax`;
      localStorage.setItem('forexmate_token', token);
    } else {
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      localStorage.removeItem('forexmate_token');
    }
  }
}

let refreshPromise: Promise<boolean> | null = null;

export async function refreshAuthSession(): Promise<boolean> {
  // Cross-tab coordination: if another tab is refreshing, wait for the new token
  const lockKey = 'forexmate_refresh_lock';
  const lockTime = localStorage.getItem(lockKey);
  if (lockTime && Date.now() - parseInt(lockTime) < 5000) {
    // Another tab is refreshing — wait up to 5s then read from localStorage
    await new Promise(resolve => setTimeout(resolve, 1500));
    const savedToken = localStorage.getItem('forexmate_token');
    if (savedToken && savedToken !== memoryToken) {
      setMemoryToken(savedToken);
      return true;
    }
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  const promise = (async () => {
    // Acquire lock to prevent other tabs from calling refresh simultaneously
    localStorage.setItem(lockKey, Date.now().toString());

    try {
      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        const payload = data.data ? data.data : data;
        setMemoryToken(payload.access_token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('forexmate_token', payload.access_token);
        }
        return true;
      }
    } catch (error) {
      console.error('Transparent token refresh failed:', error);
    } finally {
      localStorage.removeItem(lockKey);
    }
    
    // Refresh failed or revoked
    setMemoryToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('forexmate_user');
      localStorage.removeItem('forexmate_token');
    }
    return false;
  })();

  refreshPromise = promise;

  try {
    const result = await promise;
    return result;
  } finally {
    // Keep the promise cached for 2 seconds to debounce concurrent 401s from in-flight requests
    setTimeout(() => {
      if (refreshPromise === promise) {
        refreshPromise = null;
      }
    }, 2000);
  }
}

export function getMemoryToken(): string | null {
  return memoryToken;
}

/**
 * A wrapper around fetch that automatically appends the Authorization header
 * using the in-memory access token and handles transparent token rotation.
 */
export async function authFetch(url: string, options: RequestInit = {}) {
  // Developer Latency Delay Interception
  if (typeof window !== 'undefined') {
    const delayStr = localStorage.getItem('dev_network_delay');
    if (delayStr) {
      const delay = parseInt(delayStr, 10);
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  const isFormData = typeof window !== 'undefined' && options.body instanceof FormData;
  const headers: HeadersInit = {
    ...(options.body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  };

  // Developer Mock Time Synchronization
  if (typeof window !== 'undefined') {
    const mockTimeVal = localStorage.getItem('dev_mock_time');
    if (mockTimeVal) {
      (headers as any)['x-mock-time'] = mockTimeVal;
    }
  }

  let tokenToUse = memoryToken;
  if (!tokenToUse && typeof window !== 'undefined') {
    // Try localStorage first (persists across tabs), then sessionStorage for compat
    tokenToUse = localStorage.getItem('forexmate_token') || sessionStorage.getItem('forexmate_token');
    if (tokenToUse) {
      memoryToken = tokenToUse; // Restore memory token
    }
  }

  if (tokenToUse) {
    (headers as any)['Authorization'] = `Bearer ${tokenToUse}`;
  }


  // Ensure cookies (HttpOnly refresh token) are sent with every request
  options.credentials = 'include';

  let res = await fetch(url, {
    ...options,
    headers,
  });

  // If access token is expired, trigger transparent token refresh
  if (res.status === 401) {
    const refreshed = await refreshAuthSession();
    
    if (refreshed) {
      // Replay the original request with the new access token
      const newHeaders: HeadersInit = {
        ...options.headers,
        'Authorization': `Bearer ${memoryToken}`,
      };

      res = await fetch(url, {
        ...options,
        headers: newHeaders,
      });
    } else {
      if (typeof window !== 'undefined') {
        if (
          window.location.pathname.startsWith('/dashboard') ||
          window.location.pathname.startsWith('/admin')
        ) {
          window.location.href = '/login';
        }
      }
    }
  }

  return res;
}

/**
 * Parse a response from the backend and unwrap the TransformInterceptor envelope.
 * Backend always wraps responses as: { success: boolean, data: T, meta?: any }
 * This helper returns the inner `data` field directly.
 */
export async function apiJson<T = any>(res: Response): Promise<T> {
  const json = await res.json();
  // If response is already the wrapped envelope, unwrap it
  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    if (!res.ok) {
      const details = json.error?.details;
      const detailStr = (details && Array.isArray(details)) ? `: ${details.join(', ')}` : '';
      const msg = (json.error?.message || (json.data as any)?.message || json.message || 'Request failed') + detailStr;
      throw new Error(msg);
    }
    return json.data as T;
  }
  // Fallback: return raw JSON (for error responses)
  if (!res.ok) {
    const details = json.error?.details;
    const detailStr = (details && Array.isArray(details)) ? `: ${details.join(', ')}` : '';
    const errorMsg = (json.error?.message || json.message || 'Request failed') + detailStr;
    throw new Error(errorMsg);
  }
  return json as T;
}
