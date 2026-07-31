import type { Expense, HouseholdMember, Income, RecurringExpense, SavingsGoal, SplitSettings } from '../types';

export function monthKeyOf(dateStr: string): string {
  return dateStr.slice(0, 7);
}

export function currentMonthKey(): string {
  return monthKeyOf(new Date().toISOString());
}

export function filterByMonth<T>(items: T[], dateField: keyof T, monthKey: string): T[] {
  return items.filter((item) => monthKeyOf(String(item[dateField])) === monthKey);
}

export function daysInMonth(monthKey: string): number {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month, 0).getDate();
}

export function sumBy<T>(items: T[], amountField: keyof T): number {
  return items.reduce((sum, item) => sum + (Number(item[amountField]) || 0), 0);
}

export interface MemberShares {
  [memberId: string]: number;
}

/** Fraction (0-1) of shared responsibility each member holds, based on the split method. */
export function calcSplitShares(
  members: HouseholdMember[],
  splitSettings: SplitSettings | null,
  monthIncomes: Income[],
): MemberShares {
  const shares: MemberShares = {};
  if (members.length === 0) return shares;

  if (splitSettings?.method === 'percent') {
    const percents = splitSettings.member_percents || {};
    const total = members.reduce((sum, m) => sum + (percents[m.id] ?? 0), 0);
    if (total > 0) {
      members.forEach((m) => {
        shares[m.id] = (percents[m.id] ?? 0) / total;
      });
      return shares;
    }
  }

  if (splitSettings?.method === 'by_income') {
    const incomeByMember: MemberShares = {};
    let total = 0;
    members.forEach((m) => {
      const memberIncome = sumBy(
        monthIncomes.filter((i) => i.member_id === m.id),
        'amount',
      );
      incomeByMember[m.id] = memberIncome;
      total += memberIncome;
    });
    if (total > 0) {
      members.forEach((m) => {
        shares[m.id] = incomeByMember[m.id] / total;
      });
      return shares;
    }
  }

  const equalShare = 1 / members.length;
  members.forEach((m) => {
    shares[m.id] = equalShare;
  });
  return shares;
}

function expenseShares(
  expense: Pick<Expense, 'belongs_to_type' | 'belongs_to_member_id' | 'split_override'>,
  members: HouseholdMember[],
  defaultShares: MemberShares,
): MemberShares {
  if (expense.split_override && Object.keys(expense.split_override).length > 0) {
    const total = Object.values(expense.split_override).reduce((s, v) => s + v, 0) || 1;
    const shares: MemberShares = {};
    members.forEach((m) => {
      shares[m.id] = (expense.split_override?.[m.id] ?? 0) / total;
    });
    return shares;
  }

  if (expense.belongs_to_type === 'member' && expense.belongs_to_member_id) {
    const shares: MemberShares = {};
    members.forEach((m) => {
      shares[m.id] = m.id === expense.belongs_to_member_id ? 1 : 0;
    });
    return shares;
  }

  return defaultShares;
}

export interface BalanceResult {
  shouldPay: MemberShares;
  actuallyPaid: MemberShares;
  paidFromSharedAccount: number;
  netByMember: MemberShares;
  transfers: { fromMemberId: string; toMemberId: string; amount: number }[];
}

export function calcBalance(
  expenses: Expense[],
  members: HouseholdMember[],
  splitSettings: SplitSettings | null,
  monthIncomes: Income[],
): BalanceResult {
  const defaultShares = calcSplitShares(members, splitSettings, monthIncomes);
  const shouldPay: MemberShares = {};
  const actuallyPaid: MemberShares = {};
  const netByMember: MemberShares = {};
  members.forEach((m) => {
    shouldPay[m.id] = 0;
    actuallyPaid[m.id] = 0;
    netByMember[m.id] = 0;
  });

  let paidFromSharedAccount = 0;

  for (const expense of expenses) {
    const shares = expenseShares(expense, members, defaultShares);
    members.forEach((m) => {
      shouldPay[m.id] += expense.amount * (shares[m.id] ?? 0);
    });

    if (expense.paid_by_type === 'member' && expense.paid_by_member_id) {
      actuallyPaid[expense.paid_by_member_id] =
        (actuallyPaid[expense.paid_by_member_id] ?? 0) + expense.amount;

      members.forEach((m) => {
        const owed = expense.amount * (shares[m.id] ?? 0);
        if (m.id === expense.paid_by_member_id) {
          netByMember[m.id] += expense.amount - owed;
        } else {
          netByMember[m.id] -= owed;
        }
      });
    } else {
      paidFromSharedAccount += expense.amount;
    }
  }

  const creditors = members.filter((m) => netByMember[m.id] > 0.01).map((m) => ({ id: m.id, amount: netByMember[m.id] }));
  const debtors = members.filter((m) => netByMember[m.id] < -0.01).map((m) => ({ id: m.id, amount: -netByMember[m.id] }));
  const transfers: BalanceResult['transfers'] = [];

  let ci = 0;
  let di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const amount = Math.min(creditors[ci].amount, debtors[di].amount);
    if (amount > 0.01) {
      transfers.push({ fromMemberId: debtors[di].id, toMemberId: creditors[ci].id, amount });
    }
    creditors[ci].amount -= amount;
    debtors[di].amount -= amount;
    if (creditors[ci].amount <= 0.01) ci += 1;
    if (debtors[di].amount <= 0.01) di += 1;
  }

  return { shouldPay, actuallyPaid, paidFromSharedAccount, netByMember, transfers };
}

export interface CategorySpend {
  category: string;
  budget: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  status: 'ok' | 'warning' | 'over';
}

export function calcCategorySpend(
  expenses: Expense[],
  budgets: { category: string; monthly_amount: number }[],
): CategorySpend[] {
  return budgets.map((b) => {
    const spent = sumBy(
      expenses.filter((e) => e.category === b.category),
      'amount',
    );
    const remaining = b.monthly_amount - spent;
    const percentUsed = b.monthly_amount > 0 ? (spent / b.monthly_amount) * 100 : 0;
    let status: CategorySpend['status'] = 'ok';
    if (percentUsed >= 100) status = 'over';
    else if (percentUsed >= 80) status = 'warning';
    return { category: b.category, budget: b.monthly_amount, spent, remaining, percentUsed, status };
  });
}

export function calcForecast(monthKey: string, expensesSoFar: number): { projectedTotal: number; daysElapsed: number; totalDays: number } {
  const totalDays = daysInMonth(monthKey);
  const today = new Date();
  const isCurrentMonth = currentMonthKey() === monthKey;
  const daysElapsed = isCurrentMonth ? today.getDate() : totalDays;
  const dailyRate = daysElapsed > 0 ? expensesSoFar / daysElapsed : 0;
  const projectedTotal = isCurrentMonth ? dailyRate * totalDays : expensesSoFar;
  return { projectedTotal, daysElapsed, totalDays };
}

export function calcSavingsMonthlyNeeded(goal: Pick<SavingsGoal, 'target_amount' | 'saved_amount' | 'target_date'>): number {
  if (!goal.target_date) return 0;
  const remaining = goal.target_amount - goal.saved_amount;
  if (remaining <= 0) return 0;
  const now = new Date();
  const target = new Date(goal.target_date);
  const monthsLeft = Math.max(
    1,
    (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth()),
  );
  return remaining / monthsLeft;
}

export function recurringExpenseToExpenseDate(recurring: Pick<RecurringExpense, 'day_of_month'>, monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  const lastDay = daysInMonth(monthKey);
  const day = Math.min(recurring.day_of_month, lastDay);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
