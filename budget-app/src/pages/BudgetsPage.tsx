import { useMemo, useState } from 'react';
import { useCategoryBudgets, useExpenses } from '../hooks/useBudgetData';
import { PageHeader } from '../components/ui/PageHeader';
import { MonthPicker } from '../components/ui/MonthPicker';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmptyState } from '../components/ui/EmptyState';
import { SelectField, TextField } from '../components/ui/Field';
import { EXPENSE_CATEGORIES } from '../lib/constants';
import { currentMonthKey, filterByMonth, calcCategorySpend } from '../lib/calculations';
import { formatCurrency, formatPercent } from '../lib/format';

export function BudgetsPage() {
  const { data: budgets, insert, remove } = useCategoryBudgets();
  const { data: expenses } = useExpenses();
  const [month, setMonth] = useState(currentMonthKey());
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState(0);
  const [busy, setBusy] = useState(false);

  const monthExpenses = useMemo(() => filterByMonth(expenses, 'expense_date', month), [expenses, month]);
  const spend = useMemo(() => calcCategorySpend(monthExpenses, budgets), [monthExpenses, budgets]);
  const availableCategories = EXPENSE_CATEGORIES.filter((c) => !budgets.some((b) => b.category === c));

  const openAdd = () => {
    setCategory(availableCategories[0] ?? EXPENSE_CATEGORIES[0]);
    setAmount(0);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await insert({ category, monthly_amount: amount });
    setBusy(false);
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('למחוק את תקציב הקטגוריה?')) await remove(id);
  };

  return (
    <div>
      <PageHeader
        title="תקציב לפי קטגוריה"
        subtitle="הגדירו תקרת הוצאה חודשית לכל קטגוריה ועקבו אחרי הניצול"
        actions={
          <>
            <MonthPicker value={month} onChange={setMonth} />
            {availableCategories.length > 0 && <Button onClick={openAdd}>+ תקציב לקטגוריה</Button>}
          </>
        }
      />

      {spend.length === 0 ? (
        <EmptyState icon="🎯" title="עדיין לא הוגדרו תקציבים" description="הוסיפו תקציב לקטגוריות כמו סופר, מסעדות ובילויים" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {spend.map((s) => {
            const budgetRow = budgets.find((b) => b.category === s.category)!;
            return (
              <Card key={s.category}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{s.category}</p>
                  <button onClick={() => handleDelete(budgetRow.id)} className="text-xs text-slate-400 hover:text-rose-600">
                    מחיקה
                  </button>
                </div>
                <ProgressBar percent={s.percentUsed} status={s.status} />
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    {formatCurrency(s.spent)} מתוך {formatCurrency(s.budget)}
                  </span>
                  <span
                    className={`font-semibold ${
                      s.status === 'over' ? 'text-rose-600' : s.status === 'warning' ? 'text-amber-600' : 'text-emerald-600'
                    }`}
                  >
                    {formatPercent(s.percentUsed)}
                  </span>
                </div>
                {s.status === 'over' && (
                  <p className="mt-2 text-xs font-medium text-rose-600">⚠️ חרגתם מהתקציב ב-{formatCurrency(-s.remaining)}</p>
                )}
                {s.status === 'warning' && (
                  <p className="mt-2 text-xs font-medium text-amber-600">מתקרבים לתקרת התקציב</p>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <Modal title="תקציב לקטגוריה" onClose={() => setModalOpen(false)}>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <SelectField label="קטגוריה" value={category} onChange={(e) => setCategory(e.target.value)}>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </SelectField>
            <TextField
              label="תקציב חודשי (₪)"
              type="number"
              min={0}
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={busy} className="flex-1">
                שמירה
              </Button>
              <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">
                ביטול
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
