import { useMemo, useState } from 'react';
import { useHousehold } from '../contexts/HouseholdContext';
import { useIncomes, useExpenses } from '../hooks/useBudgetData';
import { useSplitSettings } from '../hooks/useSplitSettings';
import { PageHeader } from '../components/ui/PageHeader';
import { MonthPicker } from '../components/ui/MonthPicker';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { formatCurrency, formatPercent } from '../lib/format';
import { calcBalance, currentMonthKey, filterByMonth, sumBy } from '../lib/calculations';

export function DashboardPage() {
  const { members, currentMember } = useHousehold();
  const { data: incomes, loading: incomesLoading } = useIncomes();
  const { data: expenses, loading: expensesLoading } = useExpenses();
  const { settings } = useSplitSettings();
  const [month, setMonth] = useState(currentMonthKey());

  const monthIncomes = useMemo(() => filterByMonth(incomes, 'income_date', month), [incomes, month]);
  const monthExpenses = useMemo(() => filterByMonth(expenses, 'expense_date', month), [expenses, month]);

  const totalIncome = sumBy(monthIncomes, 'amount');
  const totalExpenses = sumBy(monthExpenses, 'amount');
  const remaining = totalIncome - totalExpenses;
  const percentSpent = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  const partner = members.find((m) => m.id !== currentMember?.id) ?? null;
  const myIncome = currentMember ? sumBy(monthIncomes.filter((i) => i.member_id === currentMember.id), 'amount') : 0;
  const partnerIncome = partner ? sumBy(monthIncomes.filter((i) => i.member_id === partner.id), 'amount') : 0;

  const balance = useMemo(
    () => calcBalance(monthExpenses, members, settings, monthIncomes),
    [monthExpenses, members, settings, monthIncomes],
  );

  const loading = incomesLoading || expensesLoading;

  return (
    <div>
      <PageHeader
        title="דשבורד"
        subtitle="תמונת מצב חודשית של התקציב המשותף"
        actions={<MonthPicker value={month} onChange={setMonth} />}
      />

      {loading ? (
        <p className="text-slate-400">טוען נתונים...</p>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label={`הכנסות ${currentMember?.display_name ?? 'שלי'}`} value={formatCurrency(myIncome)} />
            <StatCard label={`הכנסות ${partner?.display_name ?? 'בן/בת הזוג'}`} value={formatCurrency(partnerIncome)} />
            <StatCard label="סך הכנסות משותפות" value={formatCurrency(totalIncome)} tone="positive" />
            <StatCard label="סך הוצאות החודש" value={formatCurrency(totalExpenses)} tone="negative" />
            <StatCard
              label="נשאר אחרי הוצאות"
              value={formatCurrency(remaining)}
              tone={remaining >= 0 ? 'positive' : 'negative'}
            />
            <StatCard label="אחוז הוצאות מהכנסות" value={formatPercent(percentSpent)} />
          </div>

          <Card>
            <h2 className="mb-3 font-bold text-slate-900">כמה כל אחד שילם בפועל</h2>
            <div className="space-y-3">
              {members.map((m) => (
                <div key={m.id}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{m.display_name}</span>
                    <span className="text-slate-500">{formatCurrency(balance.actuallyPaid[m.id] ?? 0)}</span>
                  </div>
                  <ProgressBar
                    percent={totalExpenses > 0 ? ((balance.actuallyPaid[m.id] ?? 0) / totalExpenses) * 100 : 0}
                  />
                </div>
              ))}
              {balance.paidFromSharedAccount > 0 && (
                <p className="text-xs text-slate-400">
                  בנוסף, {formatCurrency(balance.paidFromSharedAccount)} שולמו ישירות מהחשבון המשותף.
                </p>
              )}
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 font-bold text-slate-900">איזון בין בני הזוג</h2>
            {balance.transfers.length === 0 ? (
              <p className="text-sm text-emerald-600">התשלומים מאוזנים - אין צורך בהעברה כספית 🎉</p>
            ) : (
              <div className="space-y-2">
                {balance.transfers.map((t, idx) => {
                  const from = members.find((m) => m.id === t.fromMemberId)?.display_name ?? '?';
                  const to = members.find((m) => m.id === t.toMemberId)?.display_name ?? '?';
                  return (
                    <div key={idx} className="flex items-center justify-between rounded-xl bg-indigo-50 px-3 py-2.5 text-sm">
                      <span className="font-medium text-indigo-900">
                        {from} צריך/ה להעביר ל{to}
                      </span>
                      <span className="font-bold text-indigo-700">{formatCurrency(t.amount)}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="mt-3 text-xs text-slate-400">
              החישוב מתייחס להוצאות ששולמו ישירות על ידי אחד מבני הזוג, ביחס לחלוקה שהוגדרה בעמוד "חלוקת הוצאות". הוצאות
              ששולמו מהחשבון המשותף אינן יוצרות חוב אישי בין הצדדים.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
