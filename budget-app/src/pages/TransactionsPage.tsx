import { useMemo, useState } from 'react';
import { useHousehold } from '../contexts/HouseholdContext';
import { useExpenses, useIncomes } from '../hooks/useBudgetData';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { SelectField, TextField } from '../components/ui/Field';
import { IncomeForm, type IncomeFormValues } from '../components/forms/IncomeForm';
import { ExpenseForm, type ExpenseFormValues } from '../components/forms/ExpenseForm';
import { EXPENSE_CATEGORIES, INCOME_TYPES } from '../lib/constants';
import { formatCurrency, formatDate } from '../lib/format';
import type { Expense, Income } from '../types';

type SortKey = 'date' | 'amount';

interface Row {
  id: string;
  type: 'income' | 'expense';
  date: string;
  amount: number;
  title: string;
  category: string;
  personLabel: string;
  raw: Income | Expense;
}

export function TransactionsPage() {
  const { household, members } = useHousehold();
  const incomesHook = useIncomes();
  const expensesHook = useExpenses();
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');
  const [personFilter, setPersonFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [editingRow, setEditingRow] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);

  const memberName = (id: string | null) => members.find((m) => m.id === id)?.display_name ?? '—';

  const rows: Row[] = useMemo(() => {
    const incomeRows: Row[] = incomesHook.data.map((i) => ({
      id: i.id,
      type: 'income',
      date: i.income_date,
      amount: i.amount,
      title: i.income_type,
      category: i.income_type,
      personLabel: memberName(i.member_id),
      raw: i,
    }));
    const expenseRows: Row[] = expensesHook.data.map((e) => ({
      id: e.id,
      type: 'expense',
      date: e.expense_date,
      amount: e.amount,
      title: e.name,
      category: e.category,
      personLabel: e.paid_by_type === 'shared' ? 'חשבון משותף' : memberName(e.paid_by_member_id),
      raw: e,
    }));
    return [...incomeRows, ...expenseRows];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomesHook.data, expensesHook.data, members]);

  const months = useMemo(() => {
    const set = new Set(rows.map((r) => r.date.slice(0, 7)));
    return Array.from(set).sort().reverse();
  }, [rows]);

  const filtered = rows
    .filter((r) => (typeFilter === 'all' ? true : r.type === typeFilter))
    .filter((r) => (monthFilter === 'all' ? true : r.date.slice(0, 7) === monthFilter))
    .filter((r) => {
      if (personFilter === 'all') return true;
      if (r.type === 'income') return (r.raw as Income).member_id === personFilter;
      const e = r.raw as Expense;
      return e.paid_by_member_id === personFilter || e.belongs_to_member_id === personFilter;
    })
    .filter((r) => (categoryFilter === 'all' ? true : r.category === categoryFilter))
    .filter((r) => {
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q) || r.personLabel.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'date') return a.date.localeCompare(b.date) * dir;
      return (a.amount - b.amount) * dir;
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const handleDelete = async (row: Row) => {
    if (!confirm('למחוק את התנועה?')) return;
    if (row.type === 'income') await incomesHook.remove(row.id);
    else await expensesHook.remove(row.id);
  };

  const handleIncomeSubmit = async (values: IncomeFormValues) => {
    if (!editingRow) return;
    setBusy(true);
    await incomesHook.update(editingRow.id, values);
    setBusy(false);
    setEditingRow(null);
  };

  const handleExpenseSubmit = async (values: ExpenseFormValues) => {
    if (!editingRow) return;
    setBusy(true);
    await expensesHook.update(editingRow.id, values);
    setBusy(false);
    setEditingRow(null);
  };

  const sortIndicator = (key: SortKey) => (sortKey === key ? (sortDir === 'asc' ? '↑' : '↓') : '');

  return (
    <div>
      <PageHeader title="טבלת תנועות" subtitle={`${filtered.length} תנועות`} />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="col-span-2 sm:col-span-3 lg:col-span-2">
          <TextField label="חיפוש" placeholder="חיפוש חופשי..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <SelectField label="חודש" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
          <option value="all">כל החודשים</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </SelectField>
        <SelectField label="אדם" value={personFilter} onChange={(e) => setPersonFilter(e.target.value)}>
          <option value="all">כולם</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.display_name}
            </option>
          ))}
        </SelectField>
        <SelectField label="סוג" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}>
          <option value="all">הכל</option>
          <option value="income">הכנסות</option>
          <option value="expense">הוצאות</option>
        </SelectField>
        <SelectField label="קטגוריה" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">הכל</option>
          <optgroup label="קטגוריות הוצאה">
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </optgroup>
          <optgroup label="סוגי הכנסה">
            {INCOME_TYPES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </optgroup>
        </SelectField>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="📋" title="לא נמצאו תנועות" description="נסו לשנות את הסינון או החיפוש" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-right text-xs text-slate-500">
                <th className="cursor-pointer select-none px-4 py-3" onClick={() => toggleSort('date')}>
                  תאריך {sortIndicator('date')}
                </th>
                <th className="px-4 py-3">שם</th>
                <th className="px-4 py-3">קטגוריה / סוג</th>
                <th className="px-4 py-3">אדם</th>
                <th className="cursor-pointer select-none px-4 py-3" onClick={() => toggleSort('amount')}>
                  סכום {sortIndicator('amount')}
                </th>
                <th className="px-4 py-3">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={`${row.type}-${row.id}`} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500">{formatDate(row.date)}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {row.title}
                    {row.type === 'expense' && (row.raw as Expense).receipt_path && ' 📎'}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{row.category}</td>
                  <td className="px-4 py-3 text-slate-500">{row.personLabel}</td>
                  <td className={`px-4 py-3 font-bold ${row.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {row.type === 'income' ? '+' : '-'}
                    {formatCurrency(row.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditingRow(row)} className="text-slate-400 hover:text-indigo-600" aria-label="עריכה">
                        ✏️
                      </button>
                      <button onClick={() => handleDelete(row)} className="text-slate-400 hover:text-rose-600" aria-label="מחיקה">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingRow && editingRow.type === 'income' && (
        <Modal title="עריכת הכנסה" onClose={() => setEditingRow(null)}>
          <IncomeForm
            members={members}
            initial={editingRow.raw as Income}
            busy={busy}
            onCancel={() => setEditingRow(null)}
            onSubmit={handleIncomeSubmit}
          />
        </Modal>
      )}

      {editingRow && editingRow.type === 'expense' && (
        <Modal title="עריכת הוצאה" onClose={() => setEditingRow(null)}>
          <ExpenseForm
            householdId={household!.id}
            members={members}
            initial={editingRow.raw as Expense}
            busy={busy}
            onCancel={() => setEditingRow(null)}
            onSubmit={handleExpenseSubmit}
          />
        </Modal>
      )}
    </div>
  );
}
