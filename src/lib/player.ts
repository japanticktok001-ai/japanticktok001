import { apiRequest } from '@/lib/api';

export interface Transaction {
  id: number;
  type: 'add' | 'subtract' | string;
  sum: string;
  amount: string;
  system: string;
  title: string;
  status: number;
  createdAt: string;
}

export interface DailyReward {
  canClaim: boolean;
  rewardAmount: string;
  lastClaimed: string | null;
  currentDay: number;
  streak: number;
}

export interface BalanceInfo {
  balance: number;
  currency: string;
}

type RawRecord = Record<string, unknown>;

function asRecord(value: unknown): RawRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as RawRecord) : null;
}

function pickString(record: RawRecord, key: string): string {
  const value = record[key];
  return typeof value === 'string' ? value : '';
}

export async function fetchFavoriteNames(): Promise<Set<string>> {
  const payload = await apiRequest<unknown>('/mobile/favorites');
  const list = Array.isArray(payload) ? payload : asRecord(payload)?.favorites ?? [];
  if (!Array.isArray(list)) return new Set();
  return new Set(
    list
      .map((item) => {
        if (typeof item === 'string') return item;
        const rec = asRecord(item);
        return rec ? pickString(rec, 'name') : '';
      })
      .filter((name) => name.length > 0),
  );
}

export async function addFavorite(gameName: string): Promise<void> {
  await apiRequest<unknown>(`/mobile/favorites/add/${encodeURIComponent(gameName)}`, { method: 'POST' });
}

export async function removeFavorite(gameName: string): Promise<void> {
  await apiRequest<unknown>(`/mobile/favorites/remove/${encodeURIComponent(gameName)}`, { method: 'DELETE' });
}

export async function refreshBalance(): Promise<BalanceInfo> {
  const payload = await apiRequest<unknown>('/mobile/balance/refresh');
  const record = asRecord(payload) ?? {};
  const balance = Number(record.balance);
  const currency = typeof record.currency === 'string' ? record.currency : 'USD';
  return { balance: Number.isFinite(balance) ? balance : 0, currency };
}

export async function fetchDailyRewardStatus(): Promise<DailyReward> {
  const payload = await apiRequest<unknown>('/mobile/daily-rewards/status');
  const record = asRecord(payload) ?? {};
  return {
    canClaim: Boolean(record.can_claim),
    rewardAmount: typeof record.reward_amount === 'string' ? record.reward_amount : '0.00',
    lastClaimed: typeof record.last_claimed === 'string' ? record.last_claimed : null,
    currentDay: Number(record.current_day) || 1,
    streak: Number(record.streak) || 0,
  };
}

export async function claimDailyReward(): Promise<void> {
  await apiRequest<unknown>('/mobile/daily-rewards/claim', { method: 'POST' });
}

export async function fetchTransactions(page = 1): Promise<{ transactions: Transaction[]; lastPage: number }> {
  const payload = await apiRequest<unknown>(`/mobile/transactions?page=${page}`);
  const record = asRecord(payload) ?? {};
  const list = Array.isArray(record.transactions) ? record.transactions : [];
  const lastPage = Number(record.last_page) || 1;
  return {
    transactions: list.map((item) => {
      const rec = asRecord(item) ?? {};
      return {
        id: Number(rec.id) || 0,
        type: typeof rec.type === 'string' ? rec.type : '',
        sum: pickString(rec, 'sum'),
        amount: pickString(rec, 'amount'),
        system: pickString(rec, 'system'),
        title: pickString(rec, 'title'),
        status: Number(rec.status) || 0,
        createdAt: pickString(rec, 'created_at'),
      };
    }),
    lastPage,
  };
}

export async function fetchWithdrawHistory(): Promise<{ id: number; amount: string; status: string; createdAt: string }[]> {
  const payload = await apiRequest<unknown>('/mobile/withdraw/history');
  const record = asRecord(payload) ?? {};
  const list = Array.isArray(record.withdrawals) ? record.withdrawals : [];
  return list.map((item) => {
    const rec = asRecord(item) ?? {};
    return {
      id: Number(rec.id) || 0,
      amount: pickString(rec, 'amount'),
      status: pickString(rec, 'status'),
      createdAt: pickString(rec, 'created_at'),
    };
  });
}

export async function fetchRefundInfo(): Promise<{ refunds: string; availableToClaim: boolean }> {
  const payload = await apiRequest<unknown>('/mobile/refunds/available');
  const record = asRecord(payload) ?? {};
  return {
    refunds: typeof record.refunds === 'string' ? record.refunds : '0.00',
    availableToClaim: Boolean(record.available_to_claim),
  };
}
