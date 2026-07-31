import { useState } from 'react';
import { useHousehold } from '../contexts/HouseholdContext';
import { useMovingItems } from '../hooks/useBudgetData';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { Modal } from '../components/ui/Modal';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmptyState } from '../components/ui/EmptyState';
import { TextField } from '../components/ui/Field';
import { MovingItemForm, type MovingItemFormValues } from '../components/forms/MovingItemForm';
import { MOVING_STATUS_LABELS, PRIORITY_LABELS } from '../lib/constants';
import { formatCurrency } from '../lib/format';
import type { MovingItem } from '../types';

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

export function MovingPage() {
  const { household, members, updateHousehold } = useHousehold();
  const { data: items, insert, update, remove } = useMovingItems();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MovingItem | null>(null);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [budgetValue, setBudgetValue] = useState(household?.moving_budget ?? 0);
  const [busy, setBusy] = useState(false);

  const memberName = (id: string | null) => members.find((m) => m.id === id)?.display_name ?? '—';

  const spentOrCommitted = items.reduce((sum, i) => sum + (i.actual_price ?? 0), 0);
  const plannedTotal = items.reduce((sum, i) => sum + i.planned_price, 0);
  const budget = household?.moving_budget ?? 0;
  const remaining = budget - spentOrCommitted;
  const gap = items.filter((i) => i.actual_price != null).reduce((sum, i) => sum + ((i.actual_price ?? 0) - i.planned_price), 0);

  const sortedItems = [...items].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (item: MovingItem) => {
    setEditing(item);
    setModalOpen(true);
  };

  const handleSubmit = async (values: MovingItemFormValues) => {
    setBusy(true);
    if (editing) await update(editing.id, values);
    else await insert(values);
    setBusy(false);
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('למחוק את הפריט?')) await remove(id);
  };

  const handleBudgetSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await updateHousehold({ moving_budget: budgetValue });
    setBusy(false);
    setBudgetOpen(false);
  };

  const statusColors: Record<string, string> = {
    to_buy: 'bg-slate-100 text-slate-600',
    ordered: 'bg-amber-100 text-amber-700',
    bought: 'bg-emerald-100 text-emerald-700',
  };
  const priorityColors: Record<string, string> = {
    high: 'bg-rose-100 text-rose-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-slate-100 text-slate-500',
  };

  return (
    <div>
      <PageHeader
        title="מעבר דירה 📦"
        subtitle="כל ההוצאות החד-פעמיות למעבר הדירה החדשה במקום אחד"
        actions={
          <>
            <Button variant="secondary" onClick={() => setBudgetOpen(true)}>
              עריכת תקציב כולל
            </Button>
            <Button onClick={openAdd}>+ פריט חדש</Button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="תקציב כולל למעבר" value={formatCurrency(budget)} />
        <StatCard label="נוצל / התחייבנו" value={formatCurrency(spentOrCommitted)} tone="negative" />
        <StatCard label="נשאר" value={formatCurrency(remaining)} tone={remaining >= 0 ? 'positive' : 'negative'} />
        <StatCard
          label="פער מהתכנון"
          value={formatCurrency(gap)}
          sub={`סה"כ מתוכנן: ${formatCurrency(plannedTotal)}`}
          tone={gap > 0 ? 'negative' : 'positive'}
        />
      </div>

      {budget > 0 && (
        <Card className="mb-5">
          <p className="mb-2 text-sm font-medium text-slate-600">ניצול תקציב המעבר</p>
          <ProgressBar percent={(spentOrCommitted / budget) * 100} status={spentOrCommitted > budget ? 'over' : 'ok'} />
        </Card>
      )}

      {sortedItems.length === 0 ? (
        <EmptyState icon="📦" title="עדיין לא נוספו פריטים" description="הוסיפו הובלה, ריהוט, מוצרי חשמל ועוד" />
      ) : (
        <div className="space-y-2">
          {sortedItems.map((item) => (
            <Card key={item.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[item.status]}`}>
                    {MOVING_STATUS_LABELS[item.status]}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[item.priority]}`}>
                    עדיפות {PRIORITY_LABELS[item.priority]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  מתוכנן: {formatCurrency(item.planned_price)}
                  {item.actual_price != null && ` · בפועל: ${formatCurrency(item.actual_price)}`} · שולם ע"י{' '}
                  {item.paid_by_type === 'shared' ? 'חשבון משותף' : memberName(item.paid_by_member_id)}
                  {item.link && (
                    <>
                      {' · '}
                      <a href={item.link} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                        קישור למוצר
                      </a>
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button onClick={() => openEdit(item)} className="text-slate-400 hover:text-indigo-600" aria-label="עריכה">
                  ✏️
                </button>
                <button onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-rose-600" aria-label="מחיקה">
                  🗑️
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal title={editing ? 'עריכת פריט' : 'פריט חדש למעבר'} onClose={() => setModalOpen(false)}>
          <MovingItemForm
            members={members}
            initial={editing}
            busy={busy}
            onCancel={() => setModalOpen(false)}
            onSubmit={handleSubmit}
          />
        </Modal>
      )}

      {budgetOpen && (
        <Modal title="תקציב כולל למעבר דירה" onClose={() => setBudgetOpen(false)}>
          <form className="space-y-3" onSubmit={handleBudgetSave}>
            <TextField
              label="תקציב כולל (₪)"
              type="number"
              min={0}
              step="0.01"
              value={budgetValue}
              onChange={(e) => setBudgetValue(Number(e.target.value))}
            />
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={busy} className="flex-1">
                שמירה
              </Button>
              <Button type="button" variant="secondary" onClick={() => setBudgetOpen(false)} className="flex-1">
                ביטול
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
