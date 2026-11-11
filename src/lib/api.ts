import { API_PREFIX, SITE_ORIGIN } from '@/lib/config';

const TOKEN_KEY = 'token';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function resolveAssetUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('/')) return `${SITE_ORIGIN}${url}`;
  return url;
}

function extractErrorMessage(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;
  if (typeof record.message === 'string' && record.message) return record.message;
  if (typeof record.error === 'string' && record.error) return record.error;
  return null;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body) headers.set('Content-Type', 'application/json');

  const token = getStoredToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_PREFIX}${path}`, { ...init, headers });
  } catch {
    throw new ApiError('Could not reach the casino server. Please try again.', 0);
  }

  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new ApiError(extractErrorMessage(data) ?? `Request failed (${response.status})`, response.status);
  }

  return data as T;
}
