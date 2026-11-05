import { useRef, useState, type MouseEvent } from 'react';
import { Play } from 'lucide-react';
import { navigate } from '@/lib/router';
import type { Game } from '@/lib/games';

interface GameCardProps {
  game: Game;
  index?: number;
}

export function GameCard({ game, index = 0 }: GameCardProps) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const [imageSrc, setImageSrc] = useState(game.thumbnail);

  const handleImageError = () => {
    if (imageSrc !== game.thumbnailFallback) setImageSrc(game.thumbnailFallback);
    else setImageSrc(null);
  };

  const handleMove = (event: MouseEvent<HTMLButtonElement>) => {
    const card = cardRef.current;
    if (!card || window.matchMedia('(hover: none)').matches) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 12}deg) rotateY(${(x - 0.5) * 12}deg) translateY(-6px)`;
    card.style.setProperty('--shine-x', `${x * 100}%`);
    card.style.setProperty('--shine-y', `${y * 100}%`);
  };

  const handleLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = '';
  };

  return (
    <button
      ref={cardRef}
      type="button"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={() => navigate(`/games/${encodeURIComponent(game.name)}`)}
      style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
      className="tilt-card animate-rise group relative flex w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 text-left shadow-lg shadow-black/40 transition-[transform,box-shadow] duration-300 ease-out hover:shadow-2xl hover:shadow-amber-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-amber-500/30 via-rose-500/20 to-cyan-500/30">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={game.title}
            loading="lazy"
            onError={handleImageError}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-4xl font-bold text-white/80">
            {game.title.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="shine pointer-events-none absolute inset-0" />
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/40 transition-transform duration-300 group-hover:scale-100 scale-75">
            <Play className="h-6 w-6 fill-current" />
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1 p-4">
        <h3 className="truncate font-display text-base font-semibold text-white">{game.title}</h3>
        <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
          <span className="truncate">{game.provider}</span>
          <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-amber-300">{game.category}</span>
        </div>
      </div>
    </button>
  );
}
