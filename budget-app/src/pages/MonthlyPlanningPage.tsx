import { useEffect, useMemo, useState } from 'react';
import { useMonthlyPlans, useExpenses, useIncomes } from '../hooks/useBudgetData';
import { PageHeader } from '../components/ui/PageHeader';
import { MonthPicker } from '../components/ui/MonthPicker';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { TextField, TextareaField } from '../components/ui/Field';
import { currentMonthKey, filterByMonth, sumBy } from '../lib/calculations';
import { formatCurrency } from '../lib/format';

export function MonthlyPlanningPage() {
  const { data: plans, insert, update } = useMonthlyPlans();
  const { data: incomes } = useIncomes();
  const { data: expenses } = useExpenses();
  const [month, setMonth] = useState(currentMonthKey());
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const plan = plans.find((p) => p.month.slice(0, 7) === month) ?? null;

  const [expectedIncome, setExpectedIncome] = useState(0);
  const [expectedFixed, setExpectedFixed] = useState(0);
  const [plannedVariable, setPlannedVariable] = useState(0);
  const [savingsGoal, setSavingsGoal] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setExpectedIncome(plan?.expected_income ?? 0);
    setExpectedFixed(plan?.expected_fixed_expenses ?? 0);
    setPlannedVariable(plan?.planned_variable_expenses ?? 0);
    setSavingsGoal(plan?.savings_goal_amount ?? 0);
    setNotes(plan?.notes ?? '');
  }, [plan]);

  const actualIncome = useMemo(() => sumBy(filterByMonth(incomes, 'income_date', month), 'amount'), [incomes, month]);
  const actualExpenses = useMemo(() => sumBy(filterByMonth(expenses, 'expense_date', month), 'amount'), [expenses, month]);

  const projectedBalance = expectedIncome - expectedFixed - plannedVariable - savingsGoal;
  const actualBalance = actualIncome - actualExpenses;
  const gap = actualBalance - projectedBalance;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const payload = {
      month: `${month}-01`,
      expected_income: expectedIncome,
      expected_fixed_expenses: expectedFixed,
      planned_variable_expenses: plannedVariable,
      savings_goal_amount: savingsGoal,
      notes,
    };
    if (plan) await update(plan.id, payload);
    else await insert(payload);
    setBusy(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <PageHeader title="תכנון חודשי" subtitle="תכננו מראש ועקבו אחרי הביצוע בפועל" actions={<MonthPicker value={month} onChange={setMonth} />} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-bold text-slate-900">תכנון</h2>
          <form className="space-y-3" onSubmit={handleSave}>
            <TextField
              label="הכנסות צפויות (₪)"
              type="number"
              min={0}
              value={expectedIncome}
              onChange={(e) => setExpectedIncome(Number(e.target.value))}
            />
            <TextField
              label="הוצאות קבועות צפויות (₪)"
              type="number"
              min={0}
              value={expectedFixed}
              onChange={(e) => setExpectedFixed(Number(e.target.value))}
            />
            <TextField
              label="הוצאות משתנות מתוכננות (₪)"
              type="number"
              min={0}
              value={plannedVariable}
              onChange={(e) => setPlannedVariable(Number(e.target.value))}
            />
            <TextField
              label="יעד חיסכון לחודש (₪)"
              type="number"
              min={0}
              value={savingsGoal}
              onChange={(e) => setSavingsGoal(Number(e.target.value))}
            />
            <TextareaField label="הערות" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <Button type="submit" disabled={busy} className="w-full">
              {saved ? 'נשמר ✓' : 'שמירת תכנון'}
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="יתרה צפויה" value={formatCurrency(projectedBalance)} tone={projectedBalance >= 0 ? 'positive' : 'negative'} />
            <StatCard label="יתרה בפועל (עד כה)" value={formatCurrency(actualBalance)} tone={actualBalance >= 0 ? 'positive' : 'negative'} />
            <StatCard label="הכנסות בפועל" value={formatCurrency(actualIncome)} />
            <StatCard label="הוצאות בפועל" value={formatCurrency(actualExpenses)} />
          </div>
          <Card>
            <p className="text-sm font-medium text-slate-600">הפער בין התכנון לביצוע</p>
            <p className={`mt-1 text-2xl font-bold ${gap >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {gap >= 0 ? '+' : ''}
              {formatCurrency(gap)}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {gap >= 0 ? 'אתם מתנהלים טוב יותר מהתכנון המקורי' : 'ההוצאות בפועל חורגות מהתכנון - כדאי לבדוק את הקטגוריות'}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
