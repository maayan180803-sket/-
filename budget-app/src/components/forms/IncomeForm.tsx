import { useState } from 'react';
import type { HouseholdMember, Income } from '../../types';
import { INCOME_TYPES } from '../../lib/constants';
import { TextField, SelectField, TextareaField } from '../ui/Field';
import { Button } from '../ui/Button';

export interface IncomeFormValues {
  member_id: string;
  income_type: string;
  amount: number;
  income_date: string;
  is_recurring: boolean;
  notes: string;
}

export function IncomeForm({
  members,
  initial,
  onSubmit,
  onCancel,
  busy,
}: {
  members: HouseholdMember[];
  initial?: Income | null;
  onSubmit: (values: IncomeFormValues) => void;
  onCancel: () => void;
  busy?: boolean;
}) {
  const [values, setValues] = useState<IncomeFormValues>({
    member_id: initial?.member_id ?? members[0]?.id ?? '',
    income_type: initial?.income_type ?? INCOME_TYPES[0],
    amount: initial?.amount ?? 0,
    income_date: initial?.income_date ?? new Date().toISOString().slice(0, 10),
    is_recurring: initial?.is_recurring ?? false,
    notes: initial?.notes ?? '',
  });

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
    >
      <SelectField
        label="שם האדם"
        required
        value={values.member_id}
        onChange={(e) => setValues((v) => ({ ...v, member_id: e.target.value }))}
      >
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.display_name}
          </option>
        ))}
      </SelectField>

      <SelectField
        label="סוג הכנסה"
        required
        value={values.income_type}
        onChange={(e) => setValues((v) => ({ ...v, income_type: e.target.value }))}
      >
        {INCOME_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </SelectField>

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="סכום (₪)"
          type="number"
          min={0}
          step="0.01"
          required
          value={values.amount}
          onChange={(e) => setValues((v) => ({ ...v, amount: Number(e.target.value) }))}
        />
        <TextField
          label="תאריך"
          type="date"
          required
          value={values.income_date}
          onChange={(e) => setValues((v) => ({ ...v, income_date: e.target.value }))}
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-indigo-600"
          checked={values.is_recurring}
          onChange={(e) => setValues((v) => ({ ...v, is_recurring: e.target.checked }))}
        />
        הכנסה קבועה (חוזרת כל חודש)
      </label>

      <TextareaField
        label="הערות"
        value={values.notes}
        onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
      />

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
