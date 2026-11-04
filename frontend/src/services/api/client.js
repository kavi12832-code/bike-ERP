/**
 * Django REST API client.
 *
 * Security model:
 * - The short-lived access token is kept in memory only (never localStorage), so a script
 *   injected into the page cannot read it from storage after a reload.
 * - The refresh token is an httpOnly cookie set by the server; JavaScript never sees it.
 *   Cookie requests carry `X-Requested-With`, which the server requires as a CSRF guard.
 * - On a page reload the session is restored with a silent cookie refresh.
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const LEGACY_TOKEN_KEY = 'bikeerp-auth-tokens';

export const isBackendEnabled = () => Boolean(BASE_URL);
export const apiBaseUrl = () => BASE_URL;

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

// Older builds kept JWTs in localStorage; remove them so they cannot be stolen later.
try {
  localStorage.removeItem(LEGACY_TOKEN_KEY);
} catch {
  // storage unavailable
}

let accessToken = null;
export const getAccessToken = () => accessToken;
export const setAccessToken = (token) => {
  accessToken = token || null;
};
export const hasSession = () => Boolean(accessToken);

const unauthorizedListeners = new Set();
export function onUnauthorized(listener) {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

function errorMessage(body, status) {
  if (!body) return `Request failed (${status})`;
  if (typeof body === 'string') return body.length > 200 ? `Request failed (${status})` : body;
  if (body.detail) return body.detail;
  const first = Object.entries(body)[0];
  if (first) return `${first[0]}: ${Array.isArray(first[1]) ? first[1].join(' ') : first[1]}`;
  return `Request failed (${status})`;
}

async function rawRequest(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    credentials: 'include', // send/receive the httpOnly refresh cookie
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { res, data };
}

let refreshing = null;
/** Exchanges the httpOnly refresh cookie for a new access token. Resolves true on success. */
export function refreshSession() {
  refreshing ??= rawRequest('/auth/refresh/', { method: 'POST', auth: false })
    .then(({ res, data }) => {
      if (!res.ok || !data?.access) {
        accessToken = null;
        return false;
      }
      accessToken = data.access;
      return true;
    })
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

export async function apiRequest(path, { method = 'GET', body, auth = true, retry = true } = {}) {
  const { res, data } = await rawRequest(path, { method, body, auth });

  if (res.status === 401 && auth && retry && (await refreshSession())) {
    return apiRequest(path, { method, body, auth, retry: false });
  }
  if (!res.ok) {
    if (res.status === 401 && auth) {
      accessToken = null;
      unauthorizedListeners.forEach((fn) => fn());
    }
    throw new ApiError(errorMessage(data, res.status), res.status, data);
  }
  return data;
}

export const api = {
  get: (path) => apiRequest(path),
  post: (path, body = {}) => apiRequest(path, { method: 'POST', body }),
  patch: (path, body = {}) => apiRequest(path, { method: 'PATCH', body }),
  put: (path, body = {}) => apiRequest(path, { method: 'PUT', body }),
  delete: (path) => apiRequest(path, { method: 'DELETE' }),
};
