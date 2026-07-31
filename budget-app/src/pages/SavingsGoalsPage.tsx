import { useState } from 'react';
import { useSavingsGoals } from '../hooks/useBudgetData';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmptyState } from '../components/ui/EmptyState';
import { TextField, TextareaField } from '../components/ui/Field';
import { calcSavingsMonthlyNeeded } from '../lib/calculations';
import { formatCurrency, formatPercent } from '../lib/format';
import type { SavingsGoal } from '../types';

interface GoalForm {
  name: string;
  target_amount: number;
  saved_amount: number;
  target_date: string;
  notes: string;
}

export function SavingsGoalsPage() {
  const { data: goals, insert, update, remove } = useSavingsGoals();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SavingsGoal | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<GoalForm>({ name: '', target_amount: 0, saved_amount: 0, target_date: '', notes: '' });

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', target_amount: 0, saved_amount: 0, target_date: '', notes: '' });
    setModalOpen(true);
  };

  const openEdit = (goal: SavingsGoal) => {
    setEditing(goal);
    setForm({
      name: goal.name,
      target_amount: goal.target_amount,
      saved_amount: goal.saved_amount,
      target_date: goal.target_date ?? '',
      notes: goal.notes ?? '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const payload = { ...form, target_date: form.target_date || null };
    if (editing) await update(editing.id, payload);
    else await insert(payload);
    setBusy(false);
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('למחוק את מטרת החיסכון?')) await remove(id);
  };

  return (
    <div>
      <PageHeader title="מטרות חיסכון" subtitle="קרן חירום, חופשה, רכב, ריהוט ועוד" actions={<Button onClick={openAdd}>+ מטרה חדשה</Button>} />

      {goals.length === 0 ? (
        <EmptyState icon="🏆" title="עדיין אין מטרות חיסכון" description="הוסיפו מטרה כמו קרן חירום או חופשה" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const percent = goal.target_amount > 0 ? (goal.saved_amount / goal.target_amount) * 100 : 0;
            const monthlyNeeded = calcSavingsMonthlyNeeded(goal);
            return (
              <Card key={goal.id}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-bold text-slate-900">{goal.name}</p>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(goal)} className="text-slate-400 hover:text-indigo-600" aria-label="עריכה">
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(goal.id)} className="text-slate-400 hover:text-rose-600" aria-label="מחיקה">
                      🗑️
                    </button>
                  </div>
                </div>
                <ProgressBar percent={percent} status={percent >= 100 ? 'ok' : percent >= 70 ? 'warning' : 'ok'} />
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    {formatCurrency(goal.saved_amount)} מתוך {formatCurrency(goal.target_amount)}
                  </span>
                  <span className="font-semibold text-indigo-600">{formatPercent(percent)}</span>
                </div>
                {goal.target_date && (
                  <p className="mt-1 text-xs text-slate-400">
                    יעד: {new Intl.DateTimeFormat('he-IL', { month: 'long', year: 'numeric' }).format(new Date(goal.target_date))}
                  </p>
                )}
                {monthlyNeeded > 0 && (
                  <p className="mt-1 text-xs font-medium text-indigo-600">כדאי לחסוך {formatCurrency(monthlyNeeded)} בחודש כדי להגיע ליעד</p>
                )}
                {goal.notes && <p className="mt-2 text-xs text-slate-400">{goal.notes}</p>}
              </Card>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <Modal title={editing ? 'עריכת מטרה' : 'מטרת חיסכון חדשה'} onClose={() => setModalOpen(false)}>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <TextField label="שם המטרה" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="סכום יעד (₪)"
                type="number"
                min={0}
                required
                value={form.target_amount}
                onChange={(e) => setForm((f) => ({ ...f, target_amount: Number(e.target.value) }))}
              />
              <TextField
                label="סכום שנחסך (₪)"
                type="number"
                min={0}
                value={form.saved_amount}
                onChange={(e) => setForm((f) => ({ ...f, saved_amount: Number(e.target.value) }))}
              />
            </div>
            <TextField
              label="תאריך יעד"
              type="date"
              value={form.target_date}
              onChange={(e) => setForm((f) => ({ ...f, target_date: e.target.value }))}
            />
            <TextareaField label="הערות" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
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
