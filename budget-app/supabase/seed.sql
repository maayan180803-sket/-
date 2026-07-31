-- =====================================================================
-- נתוני דוגמה - הרץ רק אחרי שכבר יצרת מרחב תקציב משותף והצטרפת אליו
-- (כלומר אחרי ההרשמה הראשונה ולחיצה על "צור מרחב תקציב חדש")
-- ניתן למחוק את כל הנתונים האלה בקלות מתוך המערכת עצמה
-- =====================================================================

do $$
declare
  v_household_id uuid;
  v_member1_id uuid;
  v_member2_id uuid;
  v_member1_name text;
  v_member2_name text;
begin
  select household_id into v_household_id from household_members order by created_at limit 1;

  if v_household_id is null then
    raise exception 'לא נמצא מרחב תקציב. קודם הירשם וצור מרחב תקציב במערכת, ואז הרץ סקריפט זה.';
  end if;

  select id, display_name into v_member1_id, v_member1_name
    from household_members where household_id = v_household_id order by created_at limit 1;
  select id, display_name into v_member2_id, v_member2_name
    from household_members where household_id = v_household_id order by created_at desc limit 1;

  -- הכנסות
  insert into incomes (household_id, member_id, income_type, amount, income_date, is_recurring, notes)
  values
    (v_household_id, v_member1_id, 'משכורת', 12500, date_trunc('month', current_date), true, 'משכורת חודשית'),
    (v_household_id, v_member2_id, 'משכורת', 10800, date_trunc('month', current_date), true, 'משכורת חודשית'),
    (v_household_id, v_member2_id, 'עבודה נוספת', 900, current_date - 5, false, 'פרויקט צד');

  -- הוצאות
  insert into expenses (household_id, name, amount, expense_date, category, paid_by_type, paid_by_member_id, belongs_to_type, belongs_to_member_id, payment_method, is_recurring, notes)
  values
    (v_household_id, 'שכירות', 5500, date_trunc('month', current_date) + 1, 'שכירות', 'shared', null, 'shared', null, 'העברה בנקאית', true, null),
    (v_household_id, 'ארנונה', 450, date_trunc('month', current_date) + 4, 'ארנונה', 'member', v_member1_id, 'shared', null, 'הוראת קבע', true, null),
    (v_household_id, 'חשמל', 380, current_date - 10, 'חשמל', 'member', v_member2_id, 'shared', null, 'הוראת קבע', false, null),
    (v_household_id, 'סופר שבועי', 620, current_date - 3, 'סופר', 'member', v_member1_id, 'shared', null, 'אשראי', false, null),
    (v_household_id, 'ארוחה בחוץ', 210, current_date - 2, 'מסעדות', 'member', v_member2_id, 'shared', null, 'אשראי', false, 'יום הולדת'),
    (v_household_id, 'דלק', 350, current_date - 1, 'דלק', 'member', v_member1_id, 'member', v_member1_id, 'אשראי', false, null);

  -- תקציבים לפי קטגוריה
  insert into category_budgets (household_id, category, monthly_amount)
  values
    (v_household_id, 'סופר', 2000),
    (v_household_id, 'מסעדות', 800),
    (v_household_id, 'בילויים', 600),
    (v_household_id, 'דלק', 1000)
  on conflict (household_id, category) do nothing;

  -- הוצאה קבועה לדוגמה
  insert into recurring_expenses (household_id, name, amount, category, day_of_month, paid_by_type, belongs_to_type, payment_method, auto_apply, active)
  values
    (v_household_id, 'אינטרנט וטלוויזיה', 199, 'אינטרנט וטלוויזיה', 5, 'shared', 'shared', 'הוראת קבע', true, true);

  -- מטרת חיסכון
  insert into savings_goals (household_id, name, target_amount, saved_amount, target_date, notes)
  values
    (v_household_id, 'קרן חירום', 30000, 6000, current_date + interval '12 months', 'שלושה משכורות')
  on conflict do nothing;

  -- פריטי מעבר דירה
  insert into moving_items (household_id, name, planned_price, actual_price, paid_by_type, paid_by_member_id, status, priority, notes)
  values
    (v_household_id, 'הובלה', 2500, null, 'shared', null, 'to_buy', 'high', null),
    (v_household_id, 'פיקדון לדירה', 5500, 5500, 'shared', null, 'bought', 'high', 'שולם לבעל הדירה'),
    (v_household_id, 'מזרון זוגי', 3200, null, 'shared', null, 'to_buy', 'high', null),
    (v_household_id, 'מכונת כביסה', 2400, 2200, 'member', v_member1_id, 'ordered', 'medium', 'מגיע בשבוע הבא');

  update households set moving_budget = 25000 where id = v_household_id;

  raise notice 'נתוני דוגמה נוספו בהצלחה עבור המרחב %', v_household_id;
end $$;
