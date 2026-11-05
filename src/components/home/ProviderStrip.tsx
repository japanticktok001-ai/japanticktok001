import { navigate } from '@/lib/router';

interface ProviderStripProps {
  providers: { name: string; count: number }[];
  isLoading: boolean;
}

function initialsOf(name: string): string {
  const words = name.split(/[\s_-]+/).filter(Boolean);
  const letters = words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2);
  return letters.toUpperCase();
}

const TONES = [
  'from-amber-300 to-amber-500 text-slate-950',
  'from-cyan-300 to-cyan-500 text-slate-950',
  'from-emerald-300 to-emerald-500 text-slate-950',
  'from-rose-300 to-rose-500 text-slate-950',
  'from-sky-300 to-blue-500 text-white',
  'from-orange-300 to-orange-500 text-slate-950',
];

export function ProviderStrip({ providers, isLoading }: ProviderStripProps) {
  return (
    <section aria-labelledby="providers-heading" className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">Studios</p>
          <h2 id="providers-heading" className="font-display text-2xl font-bold text-white sm:text-3xl">
            Games from top providers
          </h2>
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-20 w-40 shrink-0 animate-pulse rounded-2xl bg-slate-800/70" />
          ))}
        </div>
      ) : (
        <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
          {providers.map((provider, index) => (
            <button
              key={provider.name}
              type="button"
              onClick={() => navigate(`/games?provider=${encodeURIComponent(provider.name)}`)}
              style={{ animationDelay: `${index * 60}ms` }}
              className="animate-rise group flex shrink-0 snap-start items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/50 hover:bg-slate-800"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold shadow-lg ${TONES[index % TONES.length]}`}
              >
                {initialsOf(provider.name)}
              </span>
              <span className="text-left">
                <span className="block text-sm font-semibold text-white">{provider.name}</span>
                <span className="block text-xs text-slate-400">{provider.count} games</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
