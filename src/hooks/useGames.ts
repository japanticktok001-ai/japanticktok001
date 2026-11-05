import { useCallback, useEffect, useState } from 'react';
import { fetchGames, type Game } from '@/lib/games';
import { ApiError } from '@/lib/api';

interface GamesState {
  games: Game[];
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

export function useGames(): GamesState {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    fetchGames()
      .then((result) => {
        if (!cancelled) setGames(result);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'We could not load the games. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);

  return { games, isLoading, error, reload };
}
