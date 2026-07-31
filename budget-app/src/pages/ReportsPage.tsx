import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useHousehold } from '../contexts/HouseholdContext';
import { useExpenses, useIncomes } from '../hooks/useBudgetData';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { formatCurrency } from '../lib/format';
import { calcForecast, currentMonthKey, filterByMonth, sumBy } from '../lib/calculations';

const PALETTE = ['#4f46e5', '#db2777', '#059669', '#d97706', '#0891b2', '#7c3aed', '#dc2626', '#65a30d', '#0ea5e9', '#c026d3'];

function lastNMonths(n: number): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}

export function ReportsPage() {
  const { members } = useHousehold();
  const { data: incomes } = useIncomes();
  const { data: expenses } = useExpenses();

  const months = lastNMonths(6);
  const month = currentMonthKey();

  const monthlyComparison = useMemo(
    () =>
      months.map((m) => ({
        month: m,
        הכנסות: sumBy(filterByMonth(incomes, 'income_date', m), 'amount'),
        הוצאות: sumBy(filterByMonth(expenses, 'expense_date', m), 'amount'),
      })),
    [months, incomes, expenses],
  );

  const currentMonthExpenses = useMemo(() => filterByMonth(expenses, 'expense_date', month), [expenses, month]);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    currentMonthExpenses.forEach((e) => map.set(e.category, (map.get(e.category) ?? 0) + e.amount));
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [currentMonthExpenses]);

  const byPerson = useMemo(
    () =>
      members.map((m) => ({
        name: m.display_name,
        value: sumBy(
          currentMonthExpenses.filter((e) => e.paid_by_type === 'member' && e.paid_by_member_id === m.id),
          'amount',
        ),
      })),
    [members, currentMonthExpenses],
  );

  const fixedVsVariable = useMemo(() => {
    const fixed = sumBy(currentMonthExpenses.filter((e) => e.is_recurring), 'amount');
    const variable = sumBy(currentMonthExpenses.filter((e) => !e.is_recurring), 'amount');
    return [
      { name: 'הוצאות קבועות', value: fixed },
      { name: 'הוצאות משתנות', value: variable },
    ];
  }, [currentMonthExpenses]);

  const forecast = useMemo(() => calcForecast(month, sumBy(currentMonthExpenses, 'amount')), [month, currentMonthExpenses]);

  return (
    <div>
      <PageHeader title="דוחות וגרפים" subtitle="ניתוח מגמות ההכנסות וההוצאות שלכם" />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="תחזית הוצאות לסוף החודש"
          value={formatCurrency(forecast.projectedTotal)}
          sub={`לפי קצב של ${forecast.daysElapsed} מתוך ${forecast.totalDays} ימים`}
        />
        <StatCard label="הוצאות עד כה החודש" value={formatCurrency(sumBy(currentMonthExpenses, 'amount'))} />
        <StatCard
          label="הפרש מהתחזית"
          value={formatCurrency(forecast.projectedTotal - sumBy(currentMonthExpenses, 'amount'))}
          sub="צפי הוצאה נוספת עד סוף החודש"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-bold text-slate-900">הכנסות מול הוצאות - השוואה בין חודשים</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                <Legend />
                <Bar dataKey="הכנסות" fill="#059669" radius={[6, 6, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="הוצאות" fill="#dc2626" radius={[6, 6, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 font-bold text-slate-900">הוצאות לפי קטגוריה (חודש נוכחי)</h2>
          {byCategory.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-400">אין הוצאות החודש</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCategory}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    label={(entry) => entry.name}
                    isAnimationActive={false}
                  >
                    {byCategory.map((_, index) => (
                      <Cell key={index} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 font-bold text-slate-900">כמה כל אחד שילם (חודש נוכחי)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byPerson}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label={(entry) => entry.name}
                  isAnimationActive={false}
                >
                  {byPerson.map((_, index) => (
                    <Cell key={index} fill={PALETTE[index % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 font-bold text-slate-900">הוצאות קבועות מול משתנות</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fixedVsVariable} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                <Bar dataKey="value" fill="#4f46e5" radius={[0, 6, 6, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
