import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { fetchProfile, login as loginRequest, logout as logoutRequest, type Player } from '@/lib/auth';
import { getStoredToken, storeToken } from '@/lib/api';
import { refreshBalance } from '@/lib/player';

interface AuthContextValue {
  player: Player | null;
  currency: string;
  isReady: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshPlayerBalance: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [currency, setCurrency] = useState('USD');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!getStoredToken()) {
      setIsReady(true);
      return;
    }
    fetchProfile()
      .then((profile) => {
        if (profile) setPlayer(profile);
      })
      .catch(() => storeToken(null))
      .finally(() => setIsReady(true));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const result = await loginRequest(username, password);
    storeToken(result.token);
    setPlayer(result.player);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // The local session is cleared even if the server could not confirm the logout.
    }
    storeToken(null);
    setPlayer(null);
  }, []);

  const refreshPlayerBalance = useCallback(async () => {
    try {
      const info = await refreshBalance();
      setCurrency(info.currency);
      setPlayer((prev) => (prev ? { ...prev, balance: info.balance } : prev));
    } catch {
      // Keep the last known balance if the refresh fails.
    }
  }, []);

  const value = useMemo(
    () => ({ player, currency, isReady, login, logout, refreshPlayerBalance }),
    [player, currency, isReady, login, logout, refreshPlayerBalance],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
