import { useState, type FormEvent } from 'react';
import { Crown, Lock, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import { navigate } from '@/lib/router';

export function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username.trim() || !password) {
      setError('Enter your username and password.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await login(username.trim(), password);
      setPassword('');
      navigate('/games');
    } catch (err) {
      setError(err instanceof ApiError && err.status === 401 ? 'Incorrect username or password.' : err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 py-8 sm:py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-slate-950 shadow-xl shadow-amber-500/30">
          <Crown className="h-7 w-7" />
        </span>
        <h1 className="font-display text-3xl font-bold text-white">Welcome back</h1>
        <p className="text-slate-400">Log in to play your favourite games and track your balance.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-black/40 backdrop-blur sm:p-8"
      >
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-300">Username</span>
          <span className="relative">
            <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 py-3 pl-12 pr-4 text-white transition-colors focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
            />
          </span>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-300">Password</span>
          <span className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 py-3 pl-12 pr-4 text-white transition-colors focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
            />
          </span>
        </label>

        {error && (
          <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-amber-400 py-3 font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:-translate-y-0.5 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </div>
  );
}
