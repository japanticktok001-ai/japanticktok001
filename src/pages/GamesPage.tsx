import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { GameGrid } from '@/components/games/GameGrid';
import { useGames } from '@/hooks/useGames';
import { deriveCategories, deriveProviders } from '@/lib/games';
import { navigate, useHashPath } from '@/lib/router';

const ALL = 'All';

function readProviderParam(path: string): string {
  const query = path.split('?')[1] ?? '';
  return new URLSearchParams(query).get('provider') ?? ALL;
}

export function GamesPage() {
  const path = useHashPath();
  const { games, isLoading, error, reload } = useGames();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(ALL);
  const provider = readProviderParam(path);

  const providers = useMemo(() => deriveProviders(games), [games]);
  const categories = useMemo(() => deriveCategories(games), [games]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return games.filter((game) => {
      if (provider !== ALL && game.provider !== provider) return false;
      if (category !== ALL && game.category !== category) return false;
      if (term && !`${game.title} ${game.provider}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [games, provider, category, search]);

  const setProvider = (name: string) => {
    navigate(name === ALL ? '/games' : `/games?provider=${encodeURIComponent(name)}`);
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">Game library</p>
        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">All games</h1>
        <p className="text-slate-400">
          {isLoading ? 'Loading the library...' : `${filtered.length} of ${games.length} games`}
        </p>
      </header>

      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/70 p-4 backdrop-blur sm:p-5">
        <label className="relative block">
          <span className="sr-only">Search games</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by game or provider"
            className="w-full rounded-xl border border-white/10 bg-slate-950 py-3 pl-12 pr-10 text-white placeholder:text-slate-500 transition-colors focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
          />
          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </label>

        <FilterRow label="Provider" options={[ALL, ...providers.map((item) => item.name)]} value={provider} onSelect={setProvider} />
        <FilterRow label="Category" options={[ALL, ...categories]} value={category} onSelect={setCategory} />
      </div>

      <GameGrid
        games={filtered}
        isLoading={isLoading}
        error={error}
        onRetry={reload}
        emptyMessage="No games match your search. Try a different filter."
      />
    </div>
  );
}

interface FilterRowProps {
  label: string;
  options: string[];
  value: string;
  onSelect: (value: string) => void;
}

function FilterRow({ label, options, value, onSelect }: FilterRowProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-sm font-medium text-slate-400">{label}</span>
      <div className="-mx-1 flex flex-1 gap-2 overflow-x-auto px-1 pb-1">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            aria-pressed={value === option}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
              value === option
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
