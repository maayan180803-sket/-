import { useMemo, useState } from 'react';
import { useHousehold } from '../contexts/HouseholdContext';
import { useExpenses } from '../hooks/useBudgetData';
import { PageHeader } from '../components/ui/PageHeader';
import { MonthPicker } from '../components/ui/MonthPicker';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { ExpenseForm, type ExpenseFormValues } from '../components/forms/ExpenseForm';
import { currentMonthKey, filterByMonth, sumBy } from '../lib/calculations';
import { formatCurrency, formatDate } from '../lib/format';
import type { Expense } from '../types';

export function ExpensesPage() {
  const { members } = useHousehold();
  const { data: expenses, insert, update, remove } = useExpenses();
  const [month, setMonth] = useState(currentMonthKey());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [busy, setBusy] = useState(false);

  const monthExpenses = useMemo(() => filterByMonth(expenses, 'expense_date', month), [expenses, month]);
  const total = sumBy(monthExpenses, 'amount');

  const memberName = (id: string | null) => members.find((m) => m.id === id)?.display_name ?? '—';

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (expense: Expense) => {
    setEditing(expense);
    setModalOpen(true);
  };

  const handleSubmit = async (values: ExpenseFormValues) => {
    setBusy(true);
    if (editing) await update(editing.id, values);
    else await insert(values);
    setBusy(false);
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('למחוק את ההוצאה?')) await remove(id);
  };

  return (
    <div>
      <PageHeader
        title="הוצאות"
        subtitle={`סך הוצאות החודש: ${formatCurrency(total)}`}
        actions={
          <>
            <MonthPicker value={month} onChange={setMonth} />
            <Button onClick={openAdd}>+ הוצאה חדשה</Button>
          </>
        }
      />

      {monthExpenses.length === 0 ? (
        <EmptyState icon="💳" title="אין הוצאות בחודש זה" description="לחצו על 'הוצאה חדשה' כדי להתחיל" />
      ) : (
        <div className="space-y-2">
          {monthExpenses.map((expense) => (
            <Card key={expense.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">
                  {expense.name} <span className="font-normal text-slate-400">· {expense.category}</span>
                </p>
                <p className="text-xs text-slate-400">
                  {formatDate(expense.expense_date)} · שולם ע"י{' '}
                  {expense.paid_by_type === 'shared' ? 'חשבון משותף' : memberName(expense.paid_by_member_id)} · שייכת ל
                  {expense.belongs_to_type === 'shared' ? 'משותפת' : memberName(expense.belongs_to_member_id)}
                  {expense.is_recurring && ' · קבועה'}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-bold text-rose-600">{formatCurrency(expense.amount)}</span>
                <button onClick={() => openEdit(expense)} className="text-slate-400 hover:text-indigo-600" aria-label="עריכה">
                  ✏️
                </button>
                <button onClick={() => handleDelete(expense.id)} className="text-slate-400 hover:text-rose-600" aria-label="מחיקה">
                  🗑️
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal title={editing ? 'עריכת הוצאה' : 'הוצאה חדשה'} onClose={() => setModalOpen(false)}>
          <ExpenseForm
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
