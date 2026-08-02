-- =====================================================================
-- תוספת: צירוף תמונת קבלה להוצאות
-- הרץ את הקובץ הזה ב-SQL Editor אם כבר התקנת את schema.sql לפני התאריך הזה
-- =====================================================================

alter table expenses add column if not exists receipt_path text;

insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

drop policy if exists receipts_select on storage.objects;
create policy receipts_select on storage.objects for select
  using (bucket_id = 'receipts' and is_household_member((storage.foldername(name))[1]::uuid));

drop policy if exists receipts_insert on storage.objects;
create policy receipts_insert on storage.objects for insert
  with check (bucket_id = 'receipts' and is_household_member((storage.foldername(name))[1]::uuid));

drop policy if exists receipts_update on storage.objects;
create policy receipts_update on storage.objects for update
  using (bucket_id = 'receipts' and is_household_member((storage.foldername(name))[1]::uuid));

drop policy if exists receipts_delete on storage.objects;
create policy receipts_delete on storage.objects for delete
  using (bucket_id = 'receipts' and is_household_member((storage.foldername(name))[1]::uuid));
