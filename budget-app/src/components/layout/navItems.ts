export interface NavItem {
  to: string;
  label: string;
  icon: string;
  primary?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'דשבורד', icon: '🏠', primary: true },
  { to: '/transactions', label: 'תנועות', icon: '📋', primary: true },
  { to: '/expenses', label: 'הוצאות', icon: '💳', primary: true },
  { to: '/income', label: 'הכנסות', icon: '💰' },
  { to: '/recurring', label: 'הוצאות קבועות', icon: '🔁' },
  { to: '/budgets', label: 'תקציב לפי קטגוריה', icon: '🎯' },
  { to: '/split', label: 'חלוקת הוצאות', icon: '⚖️' },
  { to: '/moving', label: 'מעבר דירה', icon: '📦', primary: true },
  { to: '/reports', label: 'דוחות וגרפים', icon: '📊' },
  { to: '/planning', label: 'תכנון חודשי', icon: '🗓️' },
  { to: '/goals', label: 'מטרות חיסכון', icon: '🏆' },
  { to: '/settings', label: 'הגדרות', icon: '⚙️', primary: true },
];
