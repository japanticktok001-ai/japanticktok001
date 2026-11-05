import { AuthProvider } from '@/context/AuthContext';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { GamePage } from '@/pages/GamePage';
import { GamesPage } from '@/pages/GamesPage';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { useHashPath } from '@/lib/router';

function Routes() {
  const path = useHashPath().split('?')[0];
  const gameMatch = path.match(/^\/games\/([^/]+)$/);

  if (gameMatch) return <GamePage name={decodeURIComponent(gameMatch[1])} />;
  if (path === '/games') return <GamesPage />;
  if (path === '/login') return <LoginPage />;
  return <HomePage />;
}

function App() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
        <div className="pointer-events-none fixed inset-0 -z-0 bg-[radial-gradient(ellipse_at_top,_rgba(251,191,36,0.12),_transparent_60%)]" />
        <SiteHeader />
        <main className="relative mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <Routes />
        </main>
        <SiteFooter />
      </div>
    </AuthProvider>
  );
}

export default App;
