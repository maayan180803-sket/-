export const INCOME_TYPES = [
  'משכורת',
  'הכנסה מעסק',
  'עבודה נוספת',
  'החזר כספי',
  'מתנה',
  'הכנסה אחרת',
] as const;

export const EXPENSE_CATEGORIES = [
  'שכירות',
  'ארנונה',
  'חשמל',
  'מים',
  'גז',
  'אינטרנט וטלוויזיה',
  'ועד בית',
  'קניות לבית',
  'סופר',
  'מסעדות',
  'רכב',
  'דלק',
  'ביטוחים',
  'בריאות',
  'בילויים',
  'חיית מחמד',
  'ריהוט ומוצרי חשמל',
  'הוצאות מעבר דירה',
  'הוצאה אישית',
  'אחר',
] as const;

export const PAYMENT_METHODS = [
  'מזומן',
  'אשראי',
  'העברה בנקאית',
  'הוראת קבע',
  'ביט',
  'אחר',
] as const;

export const MOVING_STATUS_LABELS: Record<string, string> = {
  to_buy: 'צריך לקנות',
  ordered: 'הוזמן',
  bought: 'נקנה',
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'נמוכה',
  medium: 'בינונית',
  high: 'גבוהה',
};

export const SPLIT_METHOD_LABELS: Record<string, string> = {
  equal: 'חצי-חצי',
  percent: 'לפי אחוזים',
  by_income: 'לפי גובה ההכנסה',
  custom: 'מותאם אישית לכל הוצאה',
};

export const HEBREW_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];

export const MEMBER_COLORS = ['#4f46e5', '#db2777'];
