import { useState } from 'react';
import { Crown, LogIn, LogOut, Menu, Wallet, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { navigate, useHashPath } from '@/lib/router';

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Games', path: '/games' },
];

const currency = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });

export function SiteHeader() {
  const path = useHashPath();
  const { player, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (target: string) => {
    setMenuOpen(false);
    navigate(target);
  };

  const isActive = (target: string) => (target === '/' ? path === '/' : path.startsWith(target));

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button type="button" onClick={() => go('/')} className="group flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 transition-transform duration-300 group-hover:rotate-12">
            <Crown className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-white">
            Golden<span className="text-amber-400">Reels</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <button
              key={link.path}
              type="button"
              onClick={() => go(link.path)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive(link.path) ? 'bg-white/10 text-amber-300' : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {player ? (
            <>
              <span className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
                <Wallet className="h-4 w-4" />
                <span className="font-semibold">{player.username}</span>
                {player.balance !== null && <span className="text-emerald-300">{currency.format(player.balance)}</span>}
              </span>
              <button
                type="button"
                onClick={() => void logout()}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => go('/login')}
              className="flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:-translate-y-0.5 hover:bg-amber-300"
            >
              <LogIn className="h-4 w-4" />
              Log in
            </button>
          )}
        </div>

        <button
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10 md:hidden"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 bg-slate-950/95 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.path}
                type="button"
                onClick={() => go(link.path)}
                className={`rounded-xl px-4 py-3 text-left font-medium ${
                  isActive(link.path) ? 'bg-white/10 text-amber-300' : 'text-slate-200 hover:bg-white/5'
                }`}
              >
                {link.label}
              </button>
            ))}
            {player ? (
              <>
                <div className="mt-2 flex items-center justify-between rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-emerald-200">
                  <span className="font-semibold">{player.username}</span>
                  {player.balance !== null && <span>{currency.format(player.balance)}</span>}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    void logout();
                  }}
                  className="rounded-xl px-4 py-3 text-left font-medium text-slate-200 hover:bg-white/5"
                >
                  Log out
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => go('/login')}
                className="mt-2 rounded-xl bg-amber-400 px-4 py-3 font-semibold text-slate-950"
              >
                Log in
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
