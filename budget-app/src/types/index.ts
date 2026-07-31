export type PaidByType = 'member' | 'shared';
export type BelongsToType = 'shared' | 'member';
export type MovingStatus = 'to_buy' | 'ordered' | 'bought';
export type Priority = 'low' | 'medium' | 'high';
export type SplitMethod = 'equal' | 'percent' | 'by_income' | 'custom';

export interface Household {
  id: string;
  name: string;
  moving_budget: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface HouseholdMember {
  id: string;
  household_id: string;
  user_id: string;
  display_name: string;
  color: string;
  created_at: string;
}

export interface HouseholdInvite {
  id: string;
  household_id: string;
  code: string;
  email: string | null;
  created_by: string | null;
  created_at: string;
  expires_at: string;
  used_at: string | null;
  used_by: string | null;
}

export interface AuditFields {
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Income extends AuditFields {
  id: string;
  household_id: string;
  member_id: string;
  income_type: string;
  amount: number;
  income_date: string;
  is_recurring: boolean;
  notes: string | null;
}

export interface Expense extends AuditFields {
  id: string;
  household_id: string;
  name: string;
  amount: number;
  expense_date: string;
  category: string;
  paid_by_type: PaidByType;
  paid_by_member_id: string | null;
  belongs_to_type: BelongsToType;
  belongs_to_member_id: string | null;
  payment_method: string | null;
  is_recurring: boolean;
  recurring_expense_id: string | null;
  split_override: Record<string, number> | null;
  notes: string | null;
}

export interface RecurringExpense extends AuditFields {
  id: string;
  household_id: string;
  name: string;
  amount: number;
  category: string;
  day_of_month: number;
  paid_by_type: PaidByType;
  paid_by_member_id: string | null;
  belongs_to_type: BelongsToType;
  belongs_to_member_id: string | null;
  payment_method: string | null;
  split_override: Record<string, number> | null;
  auto_apply: boolean;
  active: boolean;
  notes: string | null;
}

export interface CategoryBudget extends AuditFields {
  id: string;
  household_id: string;
  category: string;
  monthly_amount: number;
}

export interface SplitSettings {
  id: string;
  household_id: string;
  method: SplitMethod;
  member_percents: Record<string, number>;
  updated_by: string | null;
  updated_at: string;
}

export interface MovingItem extends AuditFields {
  id: string;
  household_id: string;
  name: string;
  planned_price: number;
  actual_price: number | null;
  paid_by_type: PaidByType;
  paid_by_member_id: string | null;
  status: MovingStatus;
  priority: Priority;
  link: string | null;
  notes: string | null;
}

export interface SavingsGoal extends AuditFields {
  id: string;
  household_id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  target_date: string | null;
  notes: string | null;
}

export interface MonthlyPlan extends AuditFields {
  id: string;
  household_id: string;
  month: string;
  expected_income: number;
  expected_fixed_expenses: number;
  planned_variable_expenses: number;
  savings_goal_amount: number;
  notes: string | null;
}
