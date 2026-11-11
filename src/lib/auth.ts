import { apiRequest } from '@/lib/api';

export interface Player {
  username: string;
  balance: number | null;
}

type RawRecord = Record<string, unknown>;

function asRecord(value: unknown): RawRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as RawRecord) : null;
}

function unwrap(payload: unknown): RawRecord {
  const record = asRecord(payload) ?? {};
  return asRecord(record.data) ?? record;
}

function pickToken(payload: unknown): string | null {
  const record = asRecord(payload) ?? {};
  const nested = asRecord(record.data);
  for (const candidate of [record, nested]) {
    if (!candidate) continue;
    for (const key of ['token', 'access_token', 'api_token']) {
      const value = candidate[key];
      if (typeof value === 'string' && value) return value;
    }
  }
  return null;
}

function toPlayer(payload: unknown): Player | null {
  const record = unwrap(payload);
  const user = asRecord(record.user) ?? record;
  const username =
    [user.username, user.name, user.login, user.email].find(
      (value): value is string => typeof value === 'string' && value.length > 0,
    ) ?? null;
  if (!username) return null;
  const balance = [user.balance, record.balance].find((value) => typeof value === 'number' || typeof value === 'string');
  const numericBalance = balance === undefined ? null : Number(balance);
  return { username, balance: numericBalance === null || Number.isNaN(numericBalance) ? null : numericBalance };
}

export async function login(username: string, password: string): Promise<{ token: string | null; player: Player | null }> {
  const payload = await apiRequest<unknown>('/mobile/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  return { token: pickToken(payload), player: toPlayer(payload) ?? { username, balance: null } };
}

export async function fetchProfile(): Promise<Player | null> {
  const payload = await apiRequest<unknown>('/mobile/profile');
  return toPlayer(payload);
}

export async function logout(): Promise<void> {
  await apiRequest<unknown>('/mobile/logout', { method: 'POST' });
}
