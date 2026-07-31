import { useEffect, useMemo, useState } from 'react';
import { useHousehold } from '../contexts/HouseholdContext';
import { useSplitSettings } from '../hooks/useSplitSettings';
import { useExpenses, useIncomes } from '../hooks/useBudgetData';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SPLIT_METHOD_LABELS } from '../lib/constants';
import { calcBalance, calcSplitShares, currentMonthKey, filterByMonth } from '../lib/calculations';
import { formatCurrency, formatPercent } from '../lib/format';
import type { SplitMethod, SplitSettings } from '../types';

export function SplitSettingsPage() {
  const { members } = useHousehold();
  const { settings, update } = useSplitSettings();
  const { data: incomes } = useIncomes();
  const { data: expenses } = useExpenses();
  const [method, setMethod] = useState<SplitMethod>('equal');
  const [percents, setPercents] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setMethod(settings.method);
      setPercents(settings.member_percents ?? {});
    }
  }, [settings]);

  const month = currentMonthKey();
  const monthIncomes = useMemo(() => filterByMonth(incomes, 'income_date', month), [incomes, month]);
  const monthExpenses = useMemo(() => filterByMonth(expenses, 'expense_date', month), [expenses, month]);

  const previewSettings: SplitSettings = {
    id: settings?.id ?? '',
    household_id: settings?.household_id ?? '',
    method,
    member_percents: percents,
    updated_by: settings?.updated_by ?? null,
    updated_at: settings?.updated_at ?? '',
  };
  const previewShares = calcSplitShares(members, previewSettings, monthIncomes);
  const balance = useMemo(
    () => calcBalance(monthExpenses, members, settings, monthIncomes),
    [monthExpenses, members, settings, monthIncomes],
  );

  const handleSave = async () => {
    setBusy(true);
    await update({ method, member_percents: method === 'percent' ? percents : {} });
    setBusy(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <PageHeader title="חלוקת הוצאות" subtitle="קבעו כיצד מתחלקות ההוצאות המשותפות בין בני הזוג" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-bold text-slate-900">שיטת חלוקה</h2>
          <div className="space-y-2">
            {(Object.keys(SPLIT_METHOD_LABELS) as SplitMethod[]).map((m) => (
              <label
                key={m}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 ${
                  method === m ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200'
                }`}
              >
                <input type="radio" name="split-method" checked={method === m} onChange={() => setMethod(m)} />
                <span className="text-sm font-medium text-slate-700">{SPLIT_METHOD_LABELS[m]}</span>
              </label>
            ))}
          </div>

          {method === 'percent' && (
            <div className="mt-4 space-y-3">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-700">{m.display_name}</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-left"
                      value={percents[m.id] ?? 0}
                      onChange={(e) => setPercents((p) => ({ ...p, [m.id]: Number(e.target.value) }))}
                    />
                    <span className="text-sm text-slate-400">%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {method === 'custom' && (
            <p className="mt-3 text-xs text-slate-400">
              ניתן להגדיר חלוקה מותאמת אישית לכל הוצאה בנפרד בעת יצירת/עריכת ההוצאה (שדה חלוקה מותאמת).
            </p>
          )}

          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm">
            <p className="mb-1 font-medium text-slate-600">תצוגה מקדימה - יחס החלוקה:</p>
            {members.map((m) => (
              <p key={m.id} className="text-slate-500">
                {m.display_name}: {formatPercent((previewShares[m.id] ?? 0) * 100)}
              </p>
            ))}
          </div>

          <Button onClick={handleSave} disabled={busy} className="mt-4 w-full">
            {saved ? 'נשמר ✓' : 'שמירת הגדרות'}
          </Button>
        </Card>

        <Card>
          <h2 className="mb-3 font-bold text-slate-900">איזון לחודש הנוכחי</h2>
          <div className="space-y-2 text-sm">
            {members.map((m) => (
              <div key={m.id} className="flex justify-between border-b border-slate-100 pb-2">
                <span className="font-medium text-slate-700">{m.display_name}</span>
                <span className="text-slate-500">
                  אמור/ה לשלם {formatCurrency(balance.shouldPay[m.id] ?? 0)} · שילם/ה בפועל{' '}
                  {formatCurrency(balance.actuallyPaid[m.id] ?? 0)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4">
            {balance.transfers.length === 0 ? (
              <p className="text-sm text-emerald-600">התשלומים מאוזנים ✓</p>
            ) : (
              balance.transfers.map((t, idx) => {
                const from = members.find((m) => m.id === t.fromMemberId)?.display_name ?? '?';
                const to = members.find((m) => m.id === t.toMemberId)?.display_name ?? '?';
                return (
                  <p key={idx} className="rounded-xl bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-800">
                    {from} מעביר/ה ל{to}: {formatCurrency(t.amount)}
                  </p>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
