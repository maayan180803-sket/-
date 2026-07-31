import { useMemo, useState } from 'react';
import { useHousehold } from '../contexts/HouseholdContext';
import { useIncomes } from '../hooks/useBudgetData';
import { PageHeader } from '../components/ui/PageHeader';
import { MonthPicker } from '../components/ui/MonthPicker';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { IncomeForm, type IncomeFormValues } from '../components/forms/IncomeForm';
import { currentMonthKey, filterByMonth, sumBy } from '../lib/calculations';
import { formatCurrency, formatDate } from '../lib/format';
import type { Income } from '../types';

export function IncomePage() {
  const { members } = useHousehold();
  const { data: incomes, insert, update, remove } = useIncomes();
  const [month, setMonth] = useState(currentMonthKey());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Income | null>(null);
  const [busy, setBusy] = useState(false);

  const monthIncomes = useMemo(() => filterByMonth(incomes, 'income_date', month), [incomes, month]);
  const total = sumBy(monthIncomes, 'amount');

  const memberName = (id: string) => members.find((m) => m.id === id)?.display_name ?? '—';

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (income: Income) => {
    setEditing(income);
    setModalOpen(true);
  };

  const handleSubmit = async (values: IncomeFormValues) => {
    setBusy(true);
    if (editing) await update(editing.id, values);
    else await insert(values);
    setBusy(false);
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('למחוק את ההכנסה?')) await remove(id);
  };

  return (
    <div>
      <PageHeader
        title="הכנסות"
        subtitle={`סך הכנסות החודש: ${formatCurrency(total)}`}
        actions={
          <>
            <MonthPicker value={month} onChange={setMonth} />
            <Button onClick={openAdd}>+ הכנסה חדשה</Button>
          </>
        }
      />

      {monthIncomes.length === 0 ? (
        <EmptyState icon="💰" title="אין הכנסות בחודש זה" description="לחצו על 'הכנסה חדשה' כדי להתחיל" />
      ) : (
        <div className="space-y-2">
          {monthIncomes.map((income) => (
            <Card key={income.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">
                  {income.income_type} · {memberName(income.member_id)}
                </p>
                <p className="text-xs text-slate-400">
                  {formatDate(income.income_date)} {income.is_recurring && '· קבועה'}
                  {income.notes && ` · ${income.notes}`}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-bold text-emerald-600">{formatCurrency(income.amount)}</span>
                <button onClick={() => openEdit(income)} className="text-slate-400 hover:text-indigo-600" aria-label="עריכה">
                  ✏️
                </button>
                <button onClick={() => handleDelete(income.id)} className="text-slate-400 hover:text-rose-600" aria-label="מחיקה">
                  🗑️
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal title={editing ? 'עריכת הכנסה' : 'הכנסה חדשה'} onClose={() => setModalOpen(false)}>
          <IncomeForm
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
