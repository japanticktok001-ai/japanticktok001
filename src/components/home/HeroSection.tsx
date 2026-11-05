import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import { navigate } from '@/lib/router';

const HERO_IMAGE = 'https://images.pexels.com/photos/24643920/pexels-photo-24643920.jpeg?auto=compress&cs=tinysrgb&h=1000&w=1900';

const COINS = [
  { left: '8%', top: '18%', size: 56, delay: '0s', duration: '7s' },
  { left: '82%', top: '14%', size: 40, delay: '1.2s', duration: '6s' },
  { left: '74%', top: '68%', size: 64, delay: '0.6s', duration: '8s' },
  { left: '14%', top: '72%', size: 44, delay: '2s', duration: '6.5s' },
];

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-slate-900">
      <img src={HERO_IMAGE} alt="" aria-hidden="true" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950 via-slate-950/80 to-amber-950/40" />
      <div className="absolute -left-24 -top-24 -z-10 h-80 w-80 rounded-full bg-amber-500/30 blur-3xl animate-glow" />
      <div className="absolute -bottom-24 right-0 -z-10 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl animate-glow" style={{ animationDelay: '2s' }} />

      {COINS.map((coin, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="coin pointer-events-none absolute hidden rounded-full border-4 border-amber-200/80 bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 shadow-[0_0_30px_rgba(251,191,36,0.6)] md:block"
          style={{
            left: coin.left,
            top: coin.top,
            width: coin.size,
            height: coin.size,
            animationDelay: coin.delay,
            animationDuration: coin.duration,
          }}
        />
      ))}

      <div className="relative flex min-h-[420px] flex-col justify-center gap-6 px-6 py-16 sm:px-10 md:min-h-[520px] md:px-16">
        <span className="animate-rise inline-flex w-fit items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 text-sm font-medium text-amber-200">
          <Sparkles className="h-4 w-4" />
          New jackpots every week
        </span>
        <h1 className="animate-rise font-display max-w-2xl text-4xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-6xl" style={{ animationDelay: '80ms' }}>
          Spin the reels and chase the <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-rose-400 bg-clip-text text-transparent">golden jackpot</span>
        </h1>
        <p className="animate-rise max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg" style={{ animationDelay: '160ms' }}>
          Hundreds of slot games from the world's top studios, all in one place. Pick a favourite and start playing in seconds.
        </p>
        <div className="animate-rise flex flex-wrap items-center gap-3" style={{ animationDelay: '240ms' }}>
          <button
            type="button"
            onClick={() => navigate('/games')}
            className="group flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 font-semibold text-slate-950 shadow-xl shadow-amber-500/30 transition-all hover:-translate-y-0.5 hover:bg-amber-300"
          >
            <Zap className="h-5 w-5" />
            Play now
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
          >
            Log in to your account
          </button>
        </div>
      </div>
    </section>
  );
}
