-- =====================================================================
-- מערכת ניהול תקציב משותף - סכמת בסיס נתונים ל-Supabase
-- הרץ את הקובץ הזה במלואו ב-SQL Editor של פרויקט ה-Supabase שלך
-- =====================================================================

-- ---------------------------------------------------------------------
-- טבלאות ליבה: מרחב משותף, חברים והזמנות
-- ---------------------------------------------------------------------

create table if not exists households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'התקציב המשותף שלנו',
  moving_budget numeric(12,2) not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  color text not null default '#4f46e5',
  created_at timestamptz not null default now(),
  unique (user_id),
  unique (household_id, user_id)
);

create table if not exists household_invites (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  code text not null unique default substr(md5(random()::text || clock_timestamp()::text), 1, 8),
  email text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '14 days'),
  used_at timestamptz,
  used_by uuid references auth.users(id)
);

-- ---------------------------------------------------------------------
-- פונקציית עזר: האם המשתמש המחובר שייך למרחב התקציב הנתון
-- ---------------------------------------------------------------------

create or replace function is_household_member(hid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from household_members
    where household_id = hid and user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------
-- טבלאות נתונים
-- ---------------------------------------------------------------------

create table if not exists incomes (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  member_id uuid not null references household_members(id) on delete cascade,
  income_type text not null,
  amount numeric(12,2) not null check (amount >= 0),
  income_date date not null,
  is_recurring boolean not null default false,
  notes text,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  amount numeric(12,2) not null check (amount >= 0),
  expense_date date not null,
  category text not null,
  paid_by_type text not null check (paid_by_type in ('member', 'shared')),
  paid_by_member_id uuid references household_members(id) on delete set null,
  belongs_to_type text not null check (belongs_to_type in ('shared', 'member')),
  belongs_to_member_id uuid references household_members(id) on delete set null,
  payment_method text,
  is_recurring boolean not null default false,
  recurring_expense_id uuid,
  split_override jsonb,
  notes text,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists recurring_expenses (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  amount numeric(12,2) not null check (amount >= 0),
  category text not null,
  day_of_month int not null check (day_of_month between 1 and 31),
  paid_by_type text not null check (paid_by_type in ('member', 'shared')),
  paid_by_member_id uuid references household_members(id) on delete set null,
  belongs_to_type text not null check (belongs_to_type in ('shared', 'member')),
  belongs_to_member_id uuid references household_members(id) on delete set null,
  payment_method text,
  split_override jsonb,
  auto_apply boolean not null default true,
  active boolean not null default true,
  notes text,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table expenses
  add constraint expenses_recurring_expense_id_fkey
  foreign key (recurring_expense_id) references recurring_expenses(id) on delete set null;

create table if not exists category_budgets (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  category text not null,
  monthly_amount numeric(12,2) not null check (monthly_amount >= 0),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (household_id, category)
);

create table if not exists split_settings (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null unique references households(id) on delete cascade,
  method text not null default 'equal' check (method in ('equal', 'percent', 'by_income', 'custom')),
  member_percents jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

create table if not exists moving_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  planned_price numeric(12,2) not null default 0,
  actual_price numeric(12,2),
  paid_by_type text not null default 'shared' check (paid_by_type in ('member', 'shared')),
  paid_by_member_id uuid references household_members(id) on delete set null,
  status text not null default 'to_buy' check (status in ('to_buy', 'ordered', 'bought')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  link text,
  notes text,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists savings_goals (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  target_amount numeric(12,2) not null check (target_amount >= 0),
  saved_amount numeric(12,2) not null default 0,
  target_date date,
  notes text,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists monthly_plans (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  month date not null,
  expected_income numeric(12,2) not null default 0,
  expected_fixed_expenses numeric(12,2) not null default 0,
  planned_variable_expenses numeric(12,2) not null default 0,
  savings_goal_amount numeric(12,2) not null default 0,
  notes text,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (household_id, month)
);

-- ---------------------------------------------------------------------
-- טריגר גנרי לעדכון שדות ביקורת (created_by/updated_by/updated_at)
-- ---------------------------------------------------------------------

create or replace function set_audit_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := auth.uid();
    new.updated_by := auth.uid();
    new.created_at := coalesce(new.created_at, now());
    new.updated_at := now();
  elsif tg_op = 'UPDATE' then
    new.created_by := old.created_by;
    new.created_at := old.created_at;
    new.updated_by := auth.uid();
    new.updated_at := now();
  end if;
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array['incomes','expenses','recurring_expenses','category_budgets','moving_items','savings_goals','monthly_plans']
  loop
    execute format('drop trigger if exists trg_audit_%1$s on %1$s', t);
    execute format('create trigger trg_audit_%1$s before insert or update on %1$s for each row execute function set_audit_fields()', t);
  end loop;
end $$;

create or replace function set_household_audit_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := auth.uid();
    new.created_at := coalesce(new.created_at, now());
    new.updated_at := now();
  elsif tg_op = 'UPDATE' then
    new.created_by := old.created_by;
    new.created_at := old.created_at;
    new.updated_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_audit_households on households;
create trigger trg_audit_households before insert or update on households
  for each row execute function set_household_audit_fields();

create or replace function touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_by := auth.uid();
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_touch_split_settings on split_settings;
create trigger trg_touch_split_settings before update on split_settings
  for each row execute function touch_updated_at();

-- ---------------------------------------------------------------------
-- RPC: יצירת מרחב תקציב משותף חדש (המשתמש הופך לחבר ראשון)
-- ---------------------------------------------------------------------

create or replace function create_household(p_name text, p_display_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_household_id uuid;
begin
  if exists (select 1 from household_members where user_id = auth.uid()) then
    raise exception 'המשתמש כבר משויך למרחב תקציב';
  end if;

  insert into households (name, created_by) values (coalesce(nullif(p_name, ''), 'התקציב המשותף שלנו'), auth.uid())
    returning id into v_household_id;

  insert into household_members (household_id, user_id, display_name)
    values (v_household_id, auth.uid(), p_display_name);

  insert into split_settings (household_id, method) values (v_household_id, 'equal');

  return v_household_id;
end;
$$;

-- ---------------------------------------------------------------------
-- RPC: הצטרפות למרחב תקציב קיים לפי קוד הזמנה
-- ---------------------------------------------------------------------

create or replace function accept_household_invite(p_code text, p_display_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite household_invites%rowtype;
begin
  if exists (select 1 from household_members where user_id = auth.uid()) then
    raise exception 'המשתמש כבר משויך למרחב תקציב';
  end if;

  select * into v_invite from household_invites
    where code = p_code and used_at is null and expires_at > now();

  if v_invite.id is null then
    raise exception 'קוד ההזמנה אינו תקין או שפג תוקפו';
  end if;

  insert into household_members (household_id, user_id, display_name)
    values (v_invite.household_id, auth.uid(), p_display_name);

  update household_invites set used_at = now(), used_by = auth.uid() where id = v_invite.id;

  return v_invite.household_id;
end;
$$;

grant execute on function create_household(text, text) to authenticated;
grant execute on function accept_household_invite(text, text) to authenticated;
grant execute on function is_household_member(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------

alter table households enable row level security;
alter table household_members enable row level security;
alter table household_invites enable row level security;
alter table incomes enable row level security;
alter table expenses enable row level security;
alter table recurring_expenses enable row level security;
alter table category_budgets enable row level security;
alter table split_settings enable row level security;
alter table moving_items enable row level security;
alter table savings_goals enable row level security;
alter table monthly_plans enable row level security;

-- households
drop policy if exists households_select on households;
create policy households_select on households for select
  using (is_household_member(id));
drop policy if exists households_update on households;
create policy households_update on households for update
  using (is_household_member(id));

-- household_members
drop policy if exists household_members_select on household_members;
create policy household_members_select on household_members for select
  using (is_household_member(household_id));
drop policy if exists household_members_delete on household_members;
create policy household_members_delete on household_members for delete
  using (user_id = auth.uid());
drop policy if exists household_members_update on household_members;
create policy household_members_update on household_members for update
  using (user_id = auth.uid());

-- household_invites
drop policy if exists household_invites_select on household_invites;
create policy household_invites_select on household_invites for select
  using (is_household_member(household_id));
drop policy if exists household_invites_insert on household_invites;
create policy household_invites_insert on household_invites for insert
  with check (is_household_member(household_id) and created_by = auth.uid());
drop policy if exists household_invites_delete on household_invites;
create policy household_invites_delete on household_invites for delete
  using (is_household_member(household_id));

-- generic per-table policies for household-scoped data
do $$
declare
  t text;
begin
  foreach t in array array['incomes','expenses','recurring_expenses','category_budgets','split_settings','moving_items','savings_goals','monthly_plans']
  loop
    execute format('drop policy if exists %1$s_select on %1$s', t);
    execute format('create policy %1$s_select on %1$s for select using (is_household_member(household_id))', t);

    execute format('drop policy if exists %1$s_insert on %1$s', t);
    execute format('create policy %1$s_insert on %1$s for insert with check (is_household_member(household_id))', t);

    execute format('drop policy if exists %1$s_update on %1$s', t);
    execute format('create policy %1$s_update on %1$s for update using (is_household_member(household_id))', t);

    execute format('drop policy if exists %1$s_delete on %1$s', t);
    execute format('create policy %1$s_delete on %1$s for delete using (is_household_member(household_id))', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- אינדקסים
-- ---------------------------------------------------------------------

create index if not exists idx_incomes_household_date on incomes(household_id, income_date);
create index if not exists idx_expenses_household_date on expenses(household_id, expense_date);
create index if not exists idx_recurring_household on recurring_expenses(household_id);
create index if not exists idx_moving_household on moving_items(household_id);
create index if not exists idx_savings_household on savings_goals(household_id);
create index if not exists idx_monthly_plans_household on monthly_plans(household_id);

-- ---------------------------------------------------------------------
-- הפעלת Realtime לסנכרון בין מכשירים
-- ---------------------------------------------------------------------

alter publication supabase_realtime add table incomes;
alter publication supabase_realtime add table expenses;
alter publication supabase_realtime add table recurring_expenses;
alter publication supabase_realtime add table category_budgets;
alter publication supabase_realtime add table split_settings;
alter publication supabase_realtime add table moving_items;
alter publication supabase_realtime add table savings_goals;
alter publication supabase_realtime add table monthly_plans;
alter publication supabase_realtime add table household_members;
alter publication supabase_realtime add table households;
