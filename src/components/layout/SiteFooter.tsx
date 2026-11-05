import { Crown } from 'lucide-react';
import { navigate } from '@/lib/router';

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-400 sm:flex-row sm:px-6 lg:px-8">
        <button type="button" onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-200">
          <Crown className="h-4 w-4 text-amber-400" />
          <span className="font-display font-semibold">GoldenReels</span>
        </button>
        <p>Play responsibly. Gambling is for adults only.</p>
        <p>&copy; {new Date().getFullYear()} GoldenReels. All rights reserved.</p>
      </div>
    </footer>
  );
}
