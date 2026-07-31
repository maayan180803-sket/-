import { useMemo, useState } from 'react';
import { useHousehold } from '../contexts/HouseholdContext';
import { useExpenses, useRecurringExpenses } from '../hooks/useBudgetData';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { RecurringExpenseForm, type RecurringExpenseFormValues } from '../components/forms/RecurringExpenseForm';
import { currentMonthKey, filterByMonth, recurringExpenseToExpenseDate } from '../lib/calculations';
import { formatCurrency } from '../lib/format';
import type { RecurringExpense } from '../types';

export function RecurringExpensesPage() {
  const { members } = useHousehold();
  const { data: recurring, insert, update, remove } = useRecurringExpenses();
  const { data: expenses, insert: insertExpense } = useExpenses();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringExpense | null>(null);
  const [busy, setBusy] = useState(false);
  const [applying, setApplying] = useState(false);

  const month = currentMonthKey();
  const monthExpenses = useMemo(() => filterByMonth(expenses, 'expense_date', month), [expenses, month]);
  const appliedRecurringIds = new Set(monthExpenses.map((e) => e.recurring_expense_id).filter(Boolean));

  const memberName = (id: string | null) => members.find((m) => m.id === id)?.display_name ?? '—';

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (item: RecurringExpense) => {
    setEditing(item);
    setModalOpen(true);
  };

  const handleSubmit = async (values: RecurringExpenseFormValues) => {
    setBusy(true);
    if (editing) await update(editing.id, values);
    else await insert(values);
    setBusy(false);
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('למחוק את ההוצאה הקבועה?')) await remove(id);
  };

  const applyToCurrentMonth = async (item: RecurringExpense) => {
    setApplying(true);
    await insertExpense({
      name: item.name,
      amount: item.amount,
      expense_date: recurringExpenseToExpenseDate(item, month),
      category: item.category,
      paid_by_type: item.paid_by_type,
      paid_by_member_id: item.paid_by_member_id,
      belongs_to_type: item.belongs_to_type,
      belongs_to_member_id: item.belongs_to_member_id,
      payment_method: item.payment_method,
      is_recurring: true,
      recurring_expense_id: item.id,
      notes: item.notes,
    });
    setApplying(false);
  };

  const applyAll = async () => {
    setApplying(true);
    const toApply = recurring.filter((r) => r.active && r.auto_apply && !appliedRecurringIds.has(r.id));
    for (const item of toApply) {
      await insertExpense({
        name: item.name,
        amount: item.amount,
        expense_date: recurringExpenseToExpenseDate(item, month),
        category: item.category,
        paid_by_type: item.paid_by_type,
        paid_by_member_id: item.paid_by_member_id,
        belongs_to_type: item.belongs_to_type,
        belongs_to_member_id: item.belongs_to_member_id,
        payment_method: item.payment_method,
        is_recurring: true,
        recurring_expense_id: item.id,
        notes: item.notes,
      });
    }
    setApplying(false);
  };

  const pendingCount = recurring.filter((r) => r.active && r.auto_apply && !appliedRecurringIds.has(r.id)).length;

  return (
    <div>
      <PageHeader
        title="הוצאות קבועות"
        subtitle="הוצאות שחוזרות בכל חודש - שכירות, ארנונה, ביטוחים ועוד"
        actions={
          <>
            {pendingCount > 0 && (
              <Button variant="secondary" onClick={applyAll} disabled={applying}>
                החל {pendingCount} הוצאות לחודש הנוכחי
              </Button>
            )}
            <Button onClick={openAdd}>+ הוצאה קבועה</Button>
          </>
        }
      />

      {recurring.length === 0 ? (
        <EmptyState icon="🔁" title="אין הוצאות קבועות" description="הוסיפו שכירות, ארנונה, ביטוחים ומנויים" />
      ) : (
        <div className="space-y-2">
          {recurring.map((item) => {
            const applied = appliedRecurringIds.has(item.id);
            return (
              <Card key={item.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">
                    {item.name} <span className="font-normal text-slate-400">· {item.category}</span>
                  </p>
                  <p className="text-xs text-slate-400">
                    יורדת ב-{item.day_of_month} לחודש · שולם ע"י{' '}
                    {item.paid_by_type === 'shared' ? 'חשבון משותף' : memberName(item.paid_by_member_id)}
                    {!item.active && ' · לא פעילה'}
                  </p>
                  <p className="mt-1 text-xs">
                    {applied ? (
                      <span className="text-emerald-600">✓ הוחלה החודש</span>
                    ) : item.active && item.auto_apply ? (
                      <button onClick={() => applyToCurrentMonth(item)} disabled={applying} className="text-indigo-600 hover:underline">
                        החל לחודש הנוכחי
                      </button>
                    ) : null}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-bold text-slate-700">{formatCurrency(item.amount)}</span>
                  <button onClick={() => openEdit(item)} className="text-slate-400 hover:text-indigo-600" aria-label="עריכה">
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-rose-600" aria-label="מחיקה">
                    🗑️
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <Modal title={editing ? 'עריכת הוצאה קבועה' : 'הוצאה קבועה חדשה'} onClose={() => setModalOpen(false)}>
          <RecurringExpenseForm
            members={members}
            initial={editing}
            busy={busy}
            onCancel={() => setModalOpen(false)}
            onSubmit={handleSubmit}
          />
        </Modal>
      )}
    </div>
  );
}
