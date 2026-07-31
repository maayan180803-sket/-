export function ProgressBar({ percent, status = 'ok' }: { percent: number; status?: 'ok' | 'warning' | 'over' }) {
  const clamped = Math.min(100, Math.max(0, percent));
  const colors: Record<string, string> = {
    ok: 'bg-emerald-500',
    warning: 'bg-amber-500',
    over: 'bg-rose-500',
  };
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full transition-all ${colors[status]}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
