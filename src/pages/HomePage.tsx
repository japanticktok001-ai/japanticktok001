import { ArrowRight } from 'lucide-react';
import { HeroSection } from '@/components/home/HeroSection';
import { ProviderStrip } from '@/components/home/ProviderStrip';
import { GameGrid } from '@/components/games/GameGrid';
import { navigate } from '@/lib/router';
import { deriveProviders } from '@/lib/games';
import { useGames } from '@/hooks/useGames';

const FEATURED_COUNT = 10;

export function HomePage() {
  const { games, isLoading, error, reload } = useGames();
  const providers = deriveProviders(games);

  return (
    <div className="flex flex-col gap-16 sm:gap-20">
      <HeroSection />

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
