import { useState } from 'react';
import type { HouseholdMember, MovingItem } from '../../types';
import { TextField, SelectField, TextareaField } from '../ui/Field';
import { Button } from '../ui/Button';

export interface MovingItemFormValues {
  name: string;
  planned_price: number;
  actual_price: number | null;
  paid_by_type: 'member' | 'shared';
  paid_by_member_id: string | null;
  status: 'to_buy' | 'ordered' | 'bought';
  priority: 'low' | 'medium' | 'high';
  link: string;
  notes: string;
}

const SHARED_VALUE = 'shared';

export function MovingItemForm({
  members,
  initial,
  onSubmit,
  onCancel,
  busy,
}: {
  members: HouseholdMember[];
  initial?: MovingItem | null;
  onSubmit: (values: MovingItemFormValues) => void;
  onCancel: () => void;
  busy?: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [plannedPrice, setPlannedPrice] = useState(initial?.planned_price ?? 0);
  const [actualPrice, setActualPrice] = useState<string>(initial?.actual_price != null ? String(initial.actual_price) : '');
  const [paidBy, setPaidBy] = useState(
    initial?.paid_by_type === 'member' && initial.paid_by_member_id ? initial.paid_by_member_id : SHARED_VALUE,
  );
  const [status, setStatus] = useState(initial?.status ?? 'to_buy');
  const [priority, setPriority] = useState(initial?.priority ?? 'medium');
  const [link, setLink] = useState(initial?.link ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      planned_price: plannedPrice,
      actual_price: actualPrice === '' ? null : Number(actualPrice),
      paid_by_type: paidBy === SHARED_VALUE ? 'shared' : 'member',
      paid_by_member_id: paidBy === SHARED_VALUE ? null : paidBy,
      status: status as MovingItemFormValues['status'],
      priority: priority as MovingItemFormValues['priority'],
      link,
      notes,
    });
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <TextField label="שם הפריט" required value={name} onChange={(e) => setName(e.target.value)} />

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="מחיר מתוכנן (₪)"
          type="number"
          min={0}
          step="0.01"
          required
          value={plannedPrice}
          onChange={(e) => setPlannedPrice(Number(e.target.value))}
        />
        <TextField
          label="מחיר בפועל (₪)"
          type="number"
          min={0}
          step="0.01"
          placeholder="טרם נקנה"
          value={actualPrice}
          onChange={(e) => setActualPrice(e.target.value)}
        />
      </div>

      <SelectField label="מי שילם / ישלם" value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.display_name}
          </option>
        ))}
        <option value={SHARED_VALUE}>חשבון משותף</option>
      </SelectField>

      <div className="grid grid-cols-2 gap-3">
        <SelectField label="סטטוס" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
          <option value="to_buy">צריך לקנות</option>
          <option value="ordered">הוזמן</option>
          <option value="bought">נקנה</option>
        </SelectField>
        <SelectField label="עדיפות" value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)}>
          <option value="low">נמוכה</option>
          <option value="medium">בינונית</option>
          <option value="high">גבוהה</option>
        </SelectField>
      </div>

      <TextField label="קישור למוצר" type="url" placeholder="https://" value={link} onChange={(e) => setLink(e.target.value)} />
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
