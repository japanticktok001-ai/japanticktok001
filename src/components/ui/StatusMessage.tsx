import { AlertTriangle, Inbox } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-6 py-12 text-center">
      <AlertTriangle className="h-10 w-10 text-rose-400" />
      <p className="max-w-md text-rose-100">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full bg-rose-400 px-5 py-2 text-sm font-semibold text-slate-950 transition-transform hover:scale-105 active:scale-95"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/60 px-6 py-12 text-center">
      <Inbox className="h-10 w-10 text-slate-500" />
      <p className="text-slate-400">{message}</p>
    </div>
  );
}
