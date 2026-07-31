import { monthLabel } from '../../lib/format';

function shiftMonth(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function MonthPicker({ value, onChange }: { value: string; onChange: (month: string) => void }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5">
      <button
        type="button"
        onClick={() => onChange(shiftMonth(value, -1))}
        className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
        aria-label="חודש קודם"
      >
        ›
      </button>
      <span className="min-w-[7rem] text-center text-sm font-semibold text-slate-800">{monthLabel(value)}</span>
      <button
        type="button"
        onClick={() => onChange(shiftMonth(value, 1))}
        className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
        aria-label="חודש הבא"
      >
        ‹
      </button>
    </div>
  );
}
