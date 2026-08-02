import type {
  CategoryBudget,
  Expense,
  Household,
  HouseholdMember,
  Income,
  MonthlyPlan,
  MovingItem,
  RecurringExpense,
  SavingsGoal,
  SplitSettings,
} from '../types';

const HOUSEHOLD_ID = 'h1';
const MAAYAN_ID = 'm1';
const ADI_ID = 'm2';
const USER_ID = 'u1';
const now = new Date();
const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
const d = (day: number) => `${thisMonth}-${String(day).padStart(2, '0')}`;
const iso = new Date().toISOString();

export const FIXTURE_USER = { id: USER_ID, email: 'maayan@example.com' };

export const FIXTURE_HOUSEHOLD: Household = {
  id: HOUSEHOLD_ID,
  name: 'התקציב המשותף שלנו',
  moving_budget: 25000,
  created_by: USER_ID,
  created_at: iso,
  updated_at: iso,
};

export const FIXTURE_MEMBERS: HouseholdMember[] = [
  { id: MAAYAN_ID, household_id: HOUSEHOLD_ID, user_id: USER_ID, display_name: 'מעיין', color: '#4f46e5', created_at: iso },
  { id: ADI_ID, household_id: HOUSEHOLD_ID, user_id: 'u2', display_name: 'עדי', color: '#db2777', created_at: iso },
];

export const FIXTURE_INCOMES: Income[] = [
  { id: 'i1', household_id: HOUSEHOLD_ID, member_id: MAAYAN_ID, income_type: 'משכורת', amount: 12500, income_date: d(1), is_recurring: true, notes: null, created_by: USER_ID, updated_by: USER_ID, created_at: iso, updated_at: iso },
  { id: 'i2', household_id: HOUSEHOLD_ID, member_id: ADI_ID, income_type: 'משכורת', amount: 10800, income_date: d(1), is_recurring: true, notes: null, created_by: USER_ID, updated_by: USER_ID, created_at: iso, updated_at: iso },
  { id: 'i3', household_id: HOUSEHOLD_ID, member_id: ADI_ID, income_type: 'עבודה נוספת', amount: 900, income_date: d(5), is_recurring: false, notes: 'פרויקט צד', created_by: USER_ID, updated_by: USER_ID, created_at: iso, updated_at: iso },
];

export const FIXTURE_EXPENSES: Expense[] = [
  { id: 'e1', household_id: HOUSEHOLD_ID, name: 'שכירות', amount: 5500, expense_date: d(2), category: 'שכירות', paid_by_type: 'shared', paid_by_member_id: null, belongs_to_type: 'shared', belongs_to_member_id: null, payment_method: 'העברה בנקאית', is_recurring: true, recurring_expense_id: null, split_override: null, receipt_path: null, notes: null, created_by: USER_ID, updated_by: USER_ID, created_at: iso, updated_at: iso },
  { id: 'e2', household_id: HOUSEHOLD_ID, name: 'ארנונה', amount: 450, expense_date: d(4), category: 'ארנונה', paid_by_type: 'member', paid_by_member_id: MAAYAN_ID, belongs_to_type: 'shared', belongs_to_member_id: null, payment_method: 'הוראת קבע', is_recurring: true, recurring_expense_id: null, split_override: null, receipt_path: null, notes: null, created_by: USER_ID, updated_by: USER_ID, created_at: iso, updated_at: iso },
  { id: 'e3', household_id: HOUSEHOLD_ID, name: 'חשמל', amount: 380, expense_date: d(10), category: 'חשמל', paid_by_type: 'member', paid_by_member_id: ADI_ID, belongs_to_type: 'shared', belongs_to_member_id: null, payment_method: 'הוראת קבע', is_recurring: false, recurring_expense_id: null, split_override: null, receipt_path: null, notes: null, created_by: USER_ID, updated_by: USER_ID, created_at: iso, updated_at: iso },
  { id: 'e4', household_id: HOUSEHOLD_ID, name: 'סופר שבועי', amount: 620, expense_date: d(12), category: 'סופר', paid_by_type: 'member', paid_by_member_id: MAAYAN_ID, belongs_to_type: 'shared', belongs_to_member_id: null, payment_method: 'אשראי', is_recurring: false, recurring_expense_id: null, split_override: null, receipt_path: null, notes: null, created_by: USER_ID, updated_by: USER_ID, created_at: iso, updated_at: iso },
  { id: 'e5', household_id: HOUSEHOLD_ID, name: 'ארוחה בחוץ', amount: 210, expense_date: d(14), category: 'מסעדות', paid_by_type: 'member', paid_by_member_id: ADI_ID, belongs_to_type: 'shared', belongs_to_member_id: null, payment_method: 'אשראי', is_recurring: false, recurring_expense_id: null, split_override: null, receipt_path: null, notes: 'יום הולדת', created_by: USER_ID, updated_by: USER_ID, created_at: iso, updated_at: iso },
  { id: 'e6', household_id: HOUSEHOLD_ID, name: 'דלק', amount: 350, expense_date: d(15), category: 'דלק', paid_by_type: 'member', paid_by_member_id: MAAYAN_ID, belongs_to_type: 'member', belongs_to_member_id: MAAYAN_ID, payment_method: 'אשראי', is_recurring: false, recurring_expense_id: null, split_override: null, receipt_path: null, notes: null, created_by: USER_ID, updated_by: USER_ID, created_at: iso, updated_at: iso },
];

export const FIXTURE_RECURRING: RecurringExpense[] = [
  { id: 'r1', household_id: HOUSEHOLD_ID, name: 'אינטרנט וטלוויזיה', amount: 199, category: 'אינטרנט וטלוויזיה', day_of_month: 5, paid_by_type: 'shared', paid_by_member_id: null, belongs_to_type: 'shared', belongs_to_member_id: null, payment_method: 'הוראת קבע', split_override: null, auto_apply: true, active: true, notes: null, created_by: USER_ID, updated_by: USER_ID, created_at: iso, updated_at: iso },
];

export const FIXTURE_BUDGETS: CategoryBudget[] = [
  { id: 'b1', household_id: HOUSEHOLD_ID, category: 'סופר', monthly_amount: 2000, created_by: USER_ID, updated_by: USER_ID, created_at: iso, updated_at: iso },
  { id: 'b2', household_id: HOUSEHOLD_ID, category: 'מסעדות', monthly_amount: 800, created_by: USER_ID, updated_by: USER_ID, created_at: iso, updated_at: iso },
  { id: 'b3', household_id: HOUSEHOLD_ID, category: 'דלק', monthly_amount: 1000, created_by: USER_ID, updated_by: USER_ID, created_at: iso, updated_at: iso },
];

export const FIXTURE_SPLIT_SETTINGS: SplitSettings = {
  id: 's1',
  household_id: HOUSEHOLD_ID,
  method: 'equal',
  member_percents: {},
  updated_by: USER_ID,
  updated_at: iso,
};

export const FIXTURE_MOVING_ITEMS: MovingItem[] = [
  { id: 'mv1', household_id: HOUSEHOLD_ID, name: 'הובלה', planned_price: 2500, actual_price: null, paid_by_type: 'shared', paid_by_member_id: null, status: 'to_buy', priority: 'high', link: null, notes: null, created_by: USER_ID, updated_by: USER_ID, created_at: iso, updated_at: iso },
  { id: 'mv2', household_id: HOUSEHOLD_ID, name: 'פיקדון לדירה', planned_price: 5500, actual_price: 5500, paid_by_type: 'shared', paid_by_member_id: null, status: 'bought', priority: 'high', link: null, notes: null, created_by: USER_ID, updated_by: USER_ID, created_at: iso, updated_at: iso },
  { id: 'mv3', household_id: HOUSEHOLD_ID, name: 'מכונת כביסה', planned_price: 2400, actual_price: 2200, paid_by_type: 'member', paid_by_member_id: MAAYAN_ID, status: 'ordered', priority: 'medium', link: 'https://example.com', notes: 'מגיע בשבוע הבא', created_by: USER_ID, updated_by: USER_ID, created_at: iso, updated_at: iso },
];

export const FIXTURE_SAVINGS_GOALS: SavingsGoal[] = [
  { id: 'g1', household_id: HOUSEHOLD_ID, name: 'קרן חירום', target_amount: 30000, saved_amount: 6000, target_date: `${now.getFullYear() + 1}-01-01`, notes: null, created_by: USER_ID, updated_by: USER_ID, created_at: iso, updated_at: iso },
];

export const FIXTURE_MONTHLY_PLANS: MonthlyPlan[] = [];

export const FIXTURES: Record<string, unknown[]> = {
  household_members: FIXTURE_MEMBERS,
  incomes: FIXTURE_INCOMES,
  expenses: FIXTURE_EXPENSES,
  recurring_expenses: FIXTURE_RECURRING,
  category_budgets: FIXTURE_BUDGETS,
  split_settings: [FIXTURE_SPLIT_SETTINGS],
  moving_items: FIXTURE_MOVING_ITEMS,
  savings_goals: FIXTURE_SAVINGS_GOALS,
  monthly_plans: FIXTURE_MONTHLY_PLANS,
  households: [FIXTURE_HOUSEHOLD],
  household_invites: [],
};
