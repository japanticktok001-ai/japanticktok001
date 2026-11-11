import { useEffect, useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Gift, LogIn, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchTransactions, fetchWithdrawHistory, fetchDailyRewardStatus, claimDailyReward, refreshBalance, type Transaction } from '@/lib/player';
import { navigate } from '@/lib/router';

export function AccountPage() {
  const { player, currency, logout, refreshPlayerBalance } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTx, setIsLoadingTx] = useState(true);
  const [reward, setReward] = useState<{ canClaim: boolean; amount: string; day: number } | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimMessage, setClaimMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!player) {
      setIsLoadingTx(false);
      return;
    }
    let cancelled = false;
    setIsLoadingTx(true);
    fetchTransactions()
      .then((result) => {
        if (!cancelled) setTransactions(result.transactions);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoadingTx(false);
      });

    fetchDailyRewardStatus()
      .then((status) => {
        if (!cancelled) setReward({ canClaim: status.canClaim, amount: status.rewardAmount, day: status.currentDay });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [player]);

  if (!player) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20">
        <LogIn className="h-12 w-12 text-amber-400" />
        <h1 className="font-display text-2xl font-bold text-white">Sign in to view your account</h1>
        <p className="text-slate-400">Track your balance, transactions, and daily rewards.</p>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="rounded-full bg-amber-400 px-6 py-3 font-semibold text-slate-950 transition-all hover:-translate-y-0.5 hover:bg-amber-300"
        >
          Log in
        </button>
      </div>
    );
  }

  const formatAmount = (value: string | number) => {
    const num = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(num)) return value;
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(num);
    } catch {
      return `${Number(value).toLocaleString()} ${currency}`;
    }
  };

  const handleClaim = async () => {
    if (!reward?.canClaim || isClaiming) return;
    setIsClaiming(true);
    setClaimMessage(null);
    try {
      await claimDailyReward();
      await refreshPlayerBalance();
      setClaimMessage('Reward claimed successfully!');
      setReward((prev) => (prev ? { ...prev, canClaim: false } : prev));
    } catch {
      setClaimMessage('Could not claim the reward right now. Please try again.');
    } finally {
      setIsClaiming(false);
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await refreshPlayerBalance();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">Account</p>
        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">{player.username}</h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-6">
          <p className="text-sm font-medium text-emerald-200/80">Current balance</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="font-display text-3xl font-bold text-emerald-100">
              {player.balance !== null ? formatAmount(player.balance) : '---'}
            </span>
            <button
              type="button"
              aria-label="Refresh balance"
              onClick={() => void handleRefresh()}
              className="text-emerald-300/70 transition-transform hover:text-emerald-200"
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {reward && (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-6">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-amber-300" />
              <p className="text-sm font-medium text-amber-200/80">Daily reward - Day {reward.day}</p>
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-amber-100">{formatAmount(reward.amount)}</p>
            {claimMessage && <p className="mt-2 text-sm text-amber-200">{claimMessage}</p>}
            <button
              type="button"
              onClick={() => void handleClaim()}
              disabled={!reward.canClaim || isClaiming}
              className="mt-3 rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-950 transition-all hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
            >
              {isClaiming ? 'Claiming...' : reward.canClaim ? 'Claim now' : 'Already claimed'}
            </button>
          </div>
        )}
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-bold text-white">Transaction history</h2>
        {isLoadingTx ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-800/70" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-8 text-center text-slate-400">
            No transactions yet.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-4 rounded-xl border border-white/10 bg-slate-900/70 p-4"
              >
                {tx.type === 'add' ? (
                  <ArrowDownCircle className="h-8 w-8 shrink-0 text-emerald-400" />
                ) : (
                  <ArrowUpCircle className="h-8 w-8 shrink-0 text-rose-400" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-white">{tx.title || tx.system}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(tx.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <span className={`shrink-0 font-semibold ${tx.type === 'add' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {tx.type === 'add' ? '+' : '-'}{formatAmount(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={() => void logout()}
        className="w-fit rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-slate-300 transition-colors hover:border-rose-400/40 hover:text-rose-300"
      >
        Log out
      </button>
    </div>
  );
}
