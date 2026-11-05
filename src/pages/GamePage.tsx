import { useEffect, useState } from 'react';
import { ArrowLeft, Maximize2, Play, X } from 'lucide-react';
import { ErrorState } from '@/components/ui/StatusMessage';
import { ApiError } from '@/lib/api';
import { fetchGame, launchGame, type Game } from '@/lib/games';
import { navigate } from '@/lib/router';
import { useAuth } from '@/context/AuthContext';

interface GamePageProps {
  name: string;
}

type LoadState = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; game: Game | null };

export function GamePage({ name }: GamePageProps) {
  const { player } = useAuth();
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [launchUrl, setLaunchUrl] = useState<string | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    setLaunchUrl(null);
    fetchGame(name)
      .then((game) => {
        if (!cancelled) setState({ status: 'ready', game });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          status: 'error',
          message: err instanceof ApiError ? err.message : 'We could not load this game. Please try again.',
        });
      });
    return () => {
      cancelled = true;
    };
  }, [name, attempt]);

  const handlePlay = async () => {
    setIsLaunching(true);
    setLaunchError(null);
    try {
      setLaunchUrl(await launchGame(name));
    } catch (err) {
      setLaunchError(err instanceof Error ? err.message : 'The game could not be launched.');
    } finally {
      setIsLaunching(false);
    }
  };

  const toggleFullscreen = (element: HTMLElement | null) => {
    if (!element) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void element.requestFullscreen?.();
  };

  if (state.status === 'loading') {
    return <div className="aspect-video w-full animate-pulse rounded-3xl bg-slate-800/70" />;
  }

  if (state.status === 'error') {
    return <ErrorState message={state.message} onRetry={() => setAttempt((value) => value + 1)} />;
  }

  if (!state.game) {
    return <ErrorState message="This game could not be found." />;
  }

  const game = state.game;

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={() => navigate('/games')}
        className="flex w-fit items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to games
      </button>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/50">
          <GameStage
            game={game}
            launchUrl={launchUrl}
            isLaunching={isLaunching}
            onPlay={() => void handlePlay()}
            onFullscreen={toggleFullscreen}
            onClose={() => setLaunchUrl(null)}
            canPlay={Boolean(player)}
          />
        </section>

        <aside className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/70 p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">{game.category}</p>
            <h1 className="font-display mt-1 text-2xl font-bold text-white">{game.title}</h1>
            <p className="mt-1 text-slate-400">by {game.provider}</p>
          </div>
          <div className="h-px bg-white/10" />
          <p className="text-sm leading-relaxed text-slate-300">
            Spin for bonus features, free spins and big multipliers. Your balance is shared across every game in the library.
          </p>
          {launchError && (
            <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {launchError}
            </p>
          )}
          {!player && (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="rounded-full bg-amber-400 px-5 py-3 font-semibold text-slate-950 transition-all hover:-translate-y-0.5 hover:bg-amber-300"
            >
              Log in to play for real
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}

interface GameStageProps {
  game: Game;
  launchUrl: string | null;
  isLaunching: boolean;
  canPlay: boolean;
  onPlay: () => void;
  onFullscreen: (element: HTMLElement | null) => void;
  onClose: () => void;
}

function GameStage({ game, launchUrl, isLaunching, canPlay, onPlay, onFullscreen, onClose }: GameStageProps) {
  const [frameElement, setFrameElement] = useState<HTMLDivElement | null>(null);

  if (launchUrl) {
    return (
      <div ref={setFrameElement} className="relative aspect-video w-full bg-black">
        <iframe
          key={launchUrl}
          src={launchUrl}
          title={game.title}
          allow="fullscreen; autoplay"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          className="h-full w-full border-0"
        />
        <div className="absolute right-3 top-3 flex gap-2">
          <button
            type="button"
            aria-label="Close game"
            onClick={onClose}
            className="rounded-full bg-slate-950/70 p-2 text-white backdrop-blur transition-colors hover:bg-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Toggle fullscreen"
            onClick={() => onFullscreen(frameElement)}
            className="rounded-full bg-slate-950/70 p-2 text-white backdrop-blur transition-colors hover:bg-slate-900"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden">
      {game.thumbnail ? (
        <img src={game.thumbnail} alt={game.title} className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-amber-500/40 via-rose-500/30 to-cyan-500/40" />
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950/50 backdrop-blur-[2px]">
        <button
          type="button"
          onClick={onPlay}
          disabled={isLaunching || !canPlay}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-2xl shadow-amber-500/50 transition-transform duration-300 hover:scale-110 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300 disabled:shadow-none"
          aria-label={`Play ${game.title}`}
        >
          <Play className="h-8 w-8 fill-current" />
        </button>
        <p className="font-medium text-white">
          {isLaunching ? 'Starting game...' : canPlay ? 'Press play to start' : 'Log in to play this game'}
        </p>
      </div>
    </div>
  );
}
