import { useEffect, useState } from 'react';
import { Gift, ArrowRight } from 'lucide-react';
import { HeroSection } from '@/components/home/HeroSection';
import { ProviderStrip } from '@/components/home/ProviderStrip';
import { GameGrid } from '@/components/games/GameGrid';
import { navigate } from '@/lib/router';
import { deriveProviders } from '@/lib/games';
import { useGames } from '@/hooks/useGames';
import { useAuth } from '@/context/AuthContext';
import { fetchDailyRewardStatus, claimDailyReward } from '@/lib/player';

const FEATURED_COUNT = 10;

export function HomePage() {
  const { games, isLoading, error, reload } = useGames();
  const providers = deriveProviders(games);
  const { player, currency, refreshPlayerBalance } = useAuth();
  const [reward, setReward] = useState<{ canClaim: boolean; amount: string; day: number } | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    if (!player) return;
    fetchDailyRewardStatus()
      .then((status) => setReward({ canClaim: status.canClaim, amount: status.rewardAmount, day: status.currentDay }))
      .catch(() => {});
  }, [player]);

  const handleClaim = async () => {
    if (!reward?.canClaim || isClaiming) return;
    setIsClaiming(true);
    try {
      await claimDailyReward();
      await refreshPlayerBalance();
      setReward((prev) => (prev ? { ...prev, canClaim: false } : prev));
    } catch {
      // Keep the reward visible if the claim fails.
    } finally {
      setIsClaiming(false);
    }
  };

  const formatAmount = (value: string) => {
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(num);
    } catch {
      return `${num.toLocaleString()} ${currency}`;
    }
  };

  return (
    <div className="flex flex-col gap-16 sm:gap-20">
      <HeroSection />

      {player && reward && (
        <section className="flex items-center justify-between gap-4 rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-400/15 to-amber-500/5 p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/20">
              <Gift className="h-6 w-6 text-amber-300" />
            </span>
            <div>
              <p className="text-sm font-medium text-amber-200/80">Daily reward - Day {reward.day}</p>
              <p className="font-display text-xl font-bold text-white">{formatAmount(reward.amount)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void handleClaim()}
            disabled={!reward.canClaim || isClaiming}
            className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-all hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
          >
            {isClaiming ? 'Claiming...' : reward.canClaim ? 'Claim' : 'Claimed'}
          </button>
        </section>
      )}

      <ProviderStrip providers={providers} isLoading={isLoading} />

      <section aria-labelledby="featured-heading" className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">Popular right now</p>
            <h2 id="featured-heading" className="font-display text-2xl font-bold text-white sm:text-3xl">
              Featured games
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/games')}
            className="group flex items-center gap-2 rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white transition-colors hover:border-amber-400/60 hover:text-amber-300"
          >
            View all games
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
        <GameGrid
          games={games.slice(0, FEATURED_COUNT)}
          isLoading={isLoading}
          error={error}
          onRetry={reload}
          emptyMessage="New games are on their way. Check back soon."
        />
      </section>
    </div>
  );
}
