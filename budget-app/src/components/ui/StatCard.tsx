import type { ReactNode } from 'react';
import { Card } from './Card';

export function StatCard({
  label,
  value,
  sub,
  tone = 'default',
  icon,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: 'default' | 'positive' | 'negative';
  icon?: ReactNode;
}) {
  const toneClasses: Record<string, string> = {
    default: 'text-slate-900',
    positive: 'text-emerald-600',
    negative: 'text-rose-600',
  };
  return (
    <Card>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <p className={`mt-1 text-2xl font-bold ${toneClasses[tone]}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </Card>
  );
}
