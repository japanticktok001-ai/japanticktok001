import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { addFavorite, fetchFavoriteNames, removeFavorite } from '@/lib/player';
import { useAuth } from '@/context/AuthContext';

interface FavoritesContextValue {
  favorites: Set<string>;
  isReady: boolean;
  toggle: (gameName: string) => Promise<void>;
  isFavorite: (gameName: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { player } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!player) {
      setFavorites(new Set());
      setIsReady(true);
      return;
    }
    let cancelled = false;
    fetchFavoriteNames()
      .then((names) => {
        if (!cancelled) setFavorites(names);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [player]);

  const toggle = useCallback(
    async (gameName: string) => {
      if (!player) return;
      setFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(gameName)) next.delete(gameName);
        else next.add(gameName);
        return next;
      });
      try {
        if (favorites.has(gameName)) {
          await removeFavorite(gameName);
        } else {
          await addFavorite(gameName);
        }
      } catch {
        setFavorites((prev) => {
          const next = new Set(prev);
          if (next.has(gameName)) next.delete(gameName);
          else next.add(gameName);
          return next;
        });
      }
    },
    [player, favorites],
  );

  const isFavorite = useCallback((gameName: string) => favorites.has(gameName), [favorites]);

  return (
    <FavoritesContext.Provider value={{ favorites, isReady, toggle, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used inside FavoritesProvider');
  return context;
}
