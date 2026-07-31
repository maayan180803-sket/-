import { useState } from 'react';
import type { HouseholdMember, RecurringExpense } from '../../types';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../../lib/constants';
import { TextField, SelectField, TextareaField } from '../ui/Field';
import { Button } from '../ui/Button';

export interface RecurringExpenseFormValues {
  name: string;
  amount: number;
  category: string;
  day_of_month: number;
  paid_by_type: 'member' | 'shared';
  paid_by_member_id: string | null;
  belongs_to_type: 'shared' | 'member';
  belongs_to_member_id: string | null;
  payment_method: string;
  auto_apply: boolean;
  active: boolean;
  notes: string;
}

const SHARED_VALUE = 'shared';

export function RecurringExpenseForm({
  members,
  initial,
  onSubmit,
  onCancel,
  busy,
}: {
  members: HouseholdMember[];
  initial?: RecurringExpense | null;
  onSubmit: (values: RecurringExpenseFormValues) => void;
  onCancel: () => void;
  busy?: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [amount, setAmount] = useState(initial?.amount ?? 0);
  const [category, setCategory] = useState(initial?.category ?? EXPENSE_CATEGORIES[0]);
  const [dayOfMonth, setDayOfMonth] = useState(initial?.day_of_month ?? 1);
  const [paidBy, setPaidBy] = useState(
    initial?.paid_by_type === 'member' && initial.paid_by_member_id ? initial.paid_by_member_id : SHARED_VALUE,
  );
  const [belongsTo, setBelongsTo] = useState(
    initial?.belongs_to_type === 'member' && initial.belongs_to_member_id ? initial.belongs_to_member_id : SHARED_VALUE,
  );
  const [paymentMethod, setPaymentMethod] = useState(initial?.payment_method ?? PAYMENT_METHODS[0]);
  const [autoApply, setAutoApply] = useState(initial?.auto_apply ?? true);
  const [active, setActive] = useState(initial?.active ?? true);
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      amount,
      category,
      day_of_month: dayOfMonth,
      paid_by_type: paidBy === SHARED_VALUE ? 'shared' : 'member',
      paid_by_member_id: paidBy === SHARED_VALUE ? null : paidBy,
      belongs_to_type: belongsTo === SHARED_VALUE ? 'shared' : 'member',
      belongs_to_member_id: belongsTo === SHARED_VALUE ? null : belongsTo,
      payment_method: paymentMethod,
      auto_apply: autoApply,
      active,
      notes,
    });
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <TextField label="שם ההוצאה הקבועה" required value={name} onChange={(e) => setName(e.target.value)} />

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="סכום (₪)"
          type="number"
          min={0}
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <TextField
          label="יום בחודש"
          type="number"
          min={1}
          max={31}
          required
          value={dayOfMonth}
          onChange={(e) => setDayOfMonth(Number(e.target.value))}
        />
      </div>

      <SelectField label="קטגוריה" required value={category} onChange={(e) => setCategory(e.target.value)}>
        {EXPENSE_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </SelectField>

      <div className="grid grid-cols-2 gap-3">
        <SelectField label="מי משלם" required value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.display_name}
            </option>
          ))}
          <option value={SHARED_VALUE}>חשבון משותף</option>
        </SelectField>

        <SelectField label="למי ההוצאה שייכת" required value={belongsTo} onChange={(e) => setBelongsTo(e.target.value)}>
          <option value={SHARED_VALUE}>משותפת</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.display_name} בלבד
            </option>
          ))}
        </SelectField>
      </div>

      <SelectField label="אמצעי תשלום" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
        {PAYMENT_METHODS.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </SelectField>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-indigo-600"
            checked={autoApply}
            onChange={(e) => setAutoApply(e.target.checked)}
          />
          הוסף אוטומטית כהוצאה בכל חודש
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-indigo-600"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          פעילה
        </label>
      </div>

      <TextareaField label="הערות" value={notes} onChange={(e) => setNotes(e.target.value)} />

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={busy} className="flex-1">
          שמירה
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          ביטול
        </Button>
      </div>
    </form>
  );
}
