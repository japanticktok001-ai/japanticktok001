import { ErrorState } from '@/components/ui/StatusMessage';
import { GameCard } from '@/components/games/GameCard';
import type { Game } from '@/lib/games';

interface GameGridProps {
  games: Game[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  emptyMessage?: string;
}

export function GameGrid({ games, isLoading, error, onRetry, emptyMessage = 'No games found.' }: GameGridProps) {
  if (error) return <ErrorState message={error} onRetry={onRetry} />;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="aspect-[3/4] animate-pulse rounded-2xl bg-slate-800/70" />
        ))}
      </div>
    );
  }

  if (games.length === 0) {
    return <p className="py-16 text-center text-slate-400">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
      {games.map((game, index) => (
        <GameCard key={game.name} game={game} index={index} />
      ))}
    </div>
  );
}
