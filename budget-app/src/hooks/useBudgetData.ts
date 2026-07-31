import { useSupabaseTable } from './useSupabaseTable';
import { useHousehold } from '../contexts/HouseholdContext';
import type {
  CategoryBudget,
  Expense,
  Income,
  MonthlyPlan,
  MovingItem,
  RecurringExpense,
  SavingsGoal,
} from '../types';

export function useIncomes() {
  const { household } = useHousehold();
  return useSupabaseTable<Income>('incomes', household?.id, { orderColumn: 'income_date' });
}

export function useExpenses() {
  const { household } = useHousehold();
  return useSupabaseTable<Expense>('expenses', household?.id, { orderColumn: 'expense_date' });
}

export function useRecurringExpenses() {
  const { household } = useHousehold();
  return useSupabaseTable<RecurringExpense>('recurring_expenses', household?.id, { orderColumn: 'day_of_month', ascending: true });
}

export function useCategoryBudgets() {
  const { household } = useHousehold();
  return useSupabaseTable<CategoryBudget>('category_budgets', household?.id, { orderColumn: 'category', ascending: true });
}

export function useMovingItems() {
  const { household } = useHousehold();
  return useSupabaseTable<MovingItem>('moving_items', household?.id, { orderColumn: 'created_at' });
}

export function useSavingsGoals() {
  const { household } = useHousehold();
  return useSupabaseTable<SavingsGoal>('savings_goals', household?.id, { orderColumn: 'created_at' });
}

export function useMonthlyPlans() {
  const { household } = useHousehold();
  return useSupabaseTable<MonthlyPlan>('monthly_plans', household?.id, { orderColumn: 'month', ascending: false });
}
