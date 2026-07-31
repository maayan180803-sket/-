import { useState } from 'react';
import type { Expense, HouseholdMember } from '../../types';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../../lib/constants';
import { TextField, SelectField, TextareaField } from '../ui/Field';
import { Button } from '../ui/Button';

export interface ExpenseFormValues {
  name: string;
  amount: number;
  expense_date: string;
  category: string;
  paid_by_type: 'member' | 'shared';
  paid_by_member_id: string | null;
  belongs_to_type: 'shared' | 'member';
  belongs_to_member_id: string | null;
  payment_method: string;
  is_recurring: boolean;
  notes: string;
}

const SHARED_VALUE = 'shared';

export function ExpenseForm({
  members,
  initial,
  onSubmit,
  onCancel,
  busy,
}: {
  members: HouseholdMember[];
  initial?: Expense | null;
  onSubmit: (values: ExpenseFormValues) => void;
  onCancel: () => void;
  busy?: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [amount, setAmount] = useState(initial?.amount ?? 0);
  const [date, setDate] = useState(initial?.expense_date ?? new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState(initial?.category ?? EXPENSE_CATEGORIES[0]);
  const [paidBy, setPaidBy] = useState(
    initial?.paid_by_type === 'member' && initial.paid_by_member_id ? initial.paid_by_member_id : SHARED_VALUE,
  );
  const [belongsTo, setBelongsTo] = useState(
    initial?.belongs_to_type === 'member' && initial.belongs_to_member_id ? initial.belongs_to_member_id : SHARED_VALUE,
  );
  const [paymentMethod, setPaymentMethod] = useState(initial?.payment_method ?? PAYMENT_METHODS[0]);
  const [isRecurring, setIsRecurring] = useState(initial?.is_recurring ?? false);
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      amount,
      expense_date: date,
      category,
      paid_by_type: paidBy === SHARED_VALUE ? 'shared' : 'member',
      paid_by_member_id: paidBy === SHARED_VALUE ? null : paidBy,
      belongs_to_type: belongsTo === SHARED_VALUE ? 'shared' : 'member',
      belongs_to_member_id: belongsTo === SHARED_VALUE ? null : belongsTo,
      payment_method: paymentMethod,
      is_recurring: isRecurring,
      notes,
    });
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <TextField label="שם ההוצאה" required value={name} onChange={(e) => setName(e.target.value)} />

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
        <TextField label="תאריך" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <SelectField label="קטגוריה" required value={category} onChange={(e) => setCategory(e.target.value)}>
        {EXPENSE_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </SelectField>

      <div className="grid grid-cols-2 gap-3">
        <SelectField label="מי שילם" required value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
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

      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-indigo-600"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
        />
        הוצאה קבועה (חוזרת כל חודש)
      </label>

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
