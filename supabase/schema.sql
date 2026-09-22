-- ============================================================================
-- PrintCraft BMS — Database schema + Row-Level Security policies
--
-- Run this once in your Supabase project's SQL Editor (Dashboard → SQL Editor
-- → New query → paste this whole file → Run). It is safe to re-run: every
-- statement uses IF NOT EXISTS / OR REPLACE / DROP POLICY IF EXISTS.
--
-- These RLS policies are a direct, literal translation of the ROLE_PERMS
-- matrix already designed in src/pages/Users.tsx — this file is that matrix,
-- enforced by Postgres instead of drawn as checkmarks in the UI.
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────
-- 1. Helper functions — who is asking, and what can they do
-- ────────────────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null, -- kept only for account recovery; never shown as a login field
  role text not null check (role in ('staff', 'accountant', 'manager', 'owner')),
  position text not null default '',
  dept text not null default '',
  avatar text not null default '',
  joined date not null default current_date,
  phone text not null default '',
  status text not null default 'active' check (status in ('active', 'inactive'))
);

-- CREATE TABLE IF NOT EXISTS above is a no-op on a table that already
-- exists from an earlier run of this file — it does NOT add new columns to
-- it. This ALTER is what actually adds `username` for anyone re-running an
-- older database; it's a no-op itself if the column is already there.
alter table public.profiles add column if not exists username text;

-- Backfill for any profiles created before usernames existed, then enforce
-- going forward. Safe to re-run.
update public.profiles set username = lower(split_part(email, '@', 1)) where username is null;
alter table public.profiles alter column username set not null;
create unique index if not exists profiles_username_key on public.profiles (lower(username));

-- Sign-in only collects a username, but Supabase Auth itself is email-based —
-- this lets the (unauthenticated) sign-in screen resolve "username" to the
-- real email address to hand to signInWithPassword, without exposing emails
-- or any other profile data. SECURITY DEFINER so it can read profiles ahead
-- of a session existing; grants below scope it to exactly this one lookup.
create or replace function public.email_for_username(uname text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select email from public.profiles where lower(username) = lower(uname) limit 1;
$$;

revoke all on function public.email_for_username(text) from public;
grant execute on function public.email_for_username(text) to anon, authenticated;

-- SECURITY DEFINER so the function can read profiles regardless of the
-- caller's own row-level policy — every policy below calls this to decide
-- what the caller may do, so it must not itself be blocked by RLS.
create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.my_name()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select name from public.profiles where id = auth.uid();
$$;

-- Auto-create a profile row whenever someone signs up via Supabase Auth.
-- The role/name/etc. come from the metadata passed at sign-up time
-- People create their own accounts through the app's Sign Up screen and pick
-- their own role there (Owner, Manager, Accountant, or Staff) — no manually-
-- entered metadata JSON needed. Note this is a deliberate simplification for
-- a single-business setup: anyone with access to the Sign Up screen can
-- declare themselves Owner. That's fine when only your own team can reach
-- this app; if that ever changes, gate Owner behind an invite instead.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  full_name text;
  initials text;
  chosen_role text;
  chosen_username text;
  provided_code text;
  required_code text;
begin
  -- Gate account creation behind a shared code the Owner/Manager sets in
  -- Settings → Company (public.company_settings.signup_code) and hands out
  -- to real employees only. Raising here rolls back the whole signup,
  -- including the auth.users row that was about to be created — so a bad
  -- code means no account is created at all, not an orphaned login.
  select signup_code into required_code from public.company_settings where id = 1;
  provided_code := coalesce(new.raw_user_meta_data->>'signup_code', '');
  if required_code is not null and required_code <> '' and provided_code <> required_code then
    raise exception 'Invalid sign-up code.';
  end if;

  full_name := coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  initials := upper(left(split_part(full_name, ' ', 1), 1) || left(coalesce(split_part(full_name, ' ', 2), ''), 1));
  if initials = '' then initials := upper(left(full_name, 2)); end if;

  chosen_role := coalesce(new.raw_user_meta_data->>'role', 'staff');
  if chosen_role not in ('staff', 'accountant', 'manager', 'owner') then
    chosen_role := 'staff';
  end if;

  chosen_username := lower(coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));

  insert into public.profiles (id, name, username, email, role, position, dept, avatar, phone)
  values (
    new.id,
    full_name,
    chosen_username,
    new.email,
    chosen_role,
    coalesce(new.raw_user_meta_data->>'position', ''),
    coalesce(new.raw_user_meta_data->>'dept', ''),
    initials,
    coalesce(new.raw_user_meta_data->>'phone', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- A signed-in user can update their own profile row (e.g. from Settings),
-- but that must never let them grant themselves a bigger role or flip their
-- own account back to active after being disabled. Only a Manager/Owner
-- changing SOMEONE ELSE's row can change role/status.
create or replace function public.prevent_self_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.id = auth.uid() and (new.role is distinct from old.role or new.status is distinct from old.status) then
    if public.get_my_role() not in ('manager', 'owner') then
      new.role := old.role;
      new.status := old.status;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_self_escalation on public.profiles;
create trigger prevent_self_escalation
  before update on public.profiles
  for each row execute procedure public.prevent_self_privilege_escalation();

-- ────────────────────────────────────────────────────────────────────────
-- 2. Tables — one per entity already defined in src/store.tsx
-- ────────────────────────────────────────────────────────────────────────

create table if not exists public.projects (
  id text primary key,
  name text not null,
  client text not null,
  budget numeric not null default 0,
  paid numeric not null default 0,
  balance numeric not null default 0,
  status text not null default 'pending',
  priority text not null default 'medium',
  start date,
  deadline date,
  staff text[] not null default '{}',
  description text not null default '',
  category text not null default 'other',
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id bigint generated always as identity primary key,
  name text not null,
  project text not null default 'Unassigned',
  assigned text not null,
  priority text not null default 'medium',
  deadline text not null default 'TBD',
  status text not null default 'not-started',
  description text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.task_comments (
  id bigint generated always as identity primary key,
  task_id bigint not null references public.tasks(id) on delete cascade,
  author text not null,
  text text not null,
  time text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.inventory (
  id bigint generated always as identity primary key,
  name text not null,
  category text not null,
  qty numeric not null default 0,
  unit text not null default 'Pieces',
  min_stock numeric not null default 0,
  status text not null default 'in-stock',
  last_updated date not null default current_date,
  updated_by text not null default '',
  cost numeric not null default 0
);

create table if not exists public.transactions (
  id text primary key,
  type text not null check (type in ('income', 'expense')),
  client text not null,
  project text,
  amount numeric not null,
  method text not null,
  status text not null default 'paid',
  date date not null default current_date,
  recorded_by text not null,
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.daily_closings (
  id bigint generated always as identity primary key,
  date date not null default current_date,
  time text not null,
  total_amount numeric not null,
  expenses jsonb not null default '[]',
  creditors jsonb not null default '[]',
  has_contract boolean not null default false,
  contract_note text not null default '',
  recorded_by text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.attendance (
  id bigint generated always as identity primary key,
  staff_id uuid references public.profiles(id) on delete set null,
  staff text not null,
  date date not null default current_date,
  clock_in text,
  clock_out text,
  hours text not null default '-',
  status text not null default 'present'
);

-- Real timestamps behind the display strings above, so hours worked can be
-- computed from the stored clock-in moment at clock-out time instead of
-- relying on the browser remembering it — that broke across page reloads
-- and across devices.
alter table public.attendance add column if not exists clock_in_at timestamptz;
alter table public.attendance add column if not exists clock_out_at timestamptz;

create table if not exists public.notifications (
  id bigint generated always as identity primary key,
  title text not null,
  message text not null,
  type text not null,
  read boolean not null default false,
  time text not null default 'just now',
  icon text not null default '🔔',
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  user_name text not null,
  action text not null,
  module text not null,
  date date not null default current_date,
  time text not null,
  ip text not null default '',
  created_at timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────────────────
-- 3. Row-Level Security — the ROLE_PERMS matrix, enforced by Postgres
-- ────────────────────────────────────────────────────────────────────────

alter table public.profiles       enable row level security;
alter table public.projects       enable row level security;
alter table public.tasks          enable row level security;
alter table public.task_comments  enable row level security;
alter table public.inventory      enable row level security;
alter table public.transactions   enable row level security;
alter table public.daily_closings enable row level security;
alter table public.attendance     enable row level security;
alter table public.notifications  enable row level security;
alter table public.audit_logs     enable row level security;

-- ---- profiles (the "Staff" module) ----------------------------------------
-- staff: []           accountant: ['view']   manager: ['view','create','edit']   owner: all
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select
  using (id = auth.uid() or get_my_role() in ('accountant', 'manager', 'owner'));

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert
  with check (get_my_role() in ('manager', 'owner'));

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update
  using (id = auth.uid() or get_my_role() in ('manager', 'owner'));

-- ---- projects --------------------------------------------------------------
-- staff: ['view']   accountant: ['view']   manager: ['view','create','edit','approve']   owner: all
drop policy if exists projects_select on public.projects;
create policy projects_select on public.projects for select
  using (true);

drop policy if exists projects_insert on public.projects;
create policy projects_insert on public.projects for insert
  with check (get_my_role() in ('manager', 'owner'));

drop policy if exists projects_update on public.projects;
create policy projects_update on public.projects for update
  using (get_my_role() in ('manager', 'owner'));

drop policy if exists projects_delete on public.projects;
create policy projects_delete on public.projects for delete
  using (get_my_role() = 'owner');

-- ---- tasks -------------------------------------------------------------
-- staff: ['view','edit'] (own tasks only)   accountant: ['view']
-- manager: ['view','create','edit','delete','approve']   owner: all
drop policy if exists tasks_select on public.tasks;
create policy tasks_select on public.tasks for select
  using (true);

drop policy if exists tasks_insert on public.tasks;
create policy tasks_insert on public.tasks for insert
  with check (
    get_my_role() in ('manager', 'owner')
    or (get_my_role() = 'staff' and assigned = my_name())
  );

drop policy if exists tasks_update on public.tasks;
create policy tasks_update on public.tasks for update
  using (
    get_my_role() in ('manager', 'owner')
    or (get_my_role() = 'staff' and assigned = my_name())
  );

drop policy if exists tasks_delete on public.tasks;
create policy tasks_delete on public.tasks for delete
  using (get_my_role() in ('manager', 'owner'));

-- ---- task_comments (follows task visibility; anyone who can see tasks can comment)
drop policy if exists task_comments_select on public.task_comments;
create policy task_comments_select on public.task_comments for select
  using (true);

drop policy if exists task_comments_insert on public.task_comments;
create policy task_comments_insert on public.task_comments for insert
  with check (get_my_role() in ('staff', 'accountant', 'manager', 'owner'));

-- ---- inventory ----------------------------------------------------------
-- staff: ['view']   accountant: ['view']   manager: ['view','create','edit']   owner: all
drop policy if exists inventory_select on public.inventory;
create policy inventory_select on public.inventory for select
  using (true);

drop policy if exists inventory_insert on public.inventory;
create policy inventory_insert on public.inventory for insert
  with check (get_my_role() in ('manager', 'owner'));

drop policy if exists inventory_update on public.inventory;
create policy inventory_update on public.inventory for update
  using (get_my_role() in ('manager', 'owner'));

drop policy if exists inventory_delete on public.inventory;
create policy inventory_delete on public.inventory for delete
  using (get_my_role() = 'owner');

-- ---- transactions (the "Finance" module) --------------------------------
-- staff: []   accountant: ['view','create','edit','export']
-- manager: ['view','export'] (no create)   owner: all
drop policy if exists transactions_select on public.transactions;
create policy transactions_select on public.transactions for select
  using (get_my_role() in ('accountant', 'manager', 'owner'));

drop policy if exists transactions_insert on public.transactions;
create policy transactions_insert on public.transactions for insert
  with check (get_my_role() in ('accountant', 'owner'));

drop policy if exists transactions_delete on public.transactions;
create policy transactions_delete on public.transactions for delete
  using (get_my_role() = 'owner');

-- ---- daily_closings (same Finance permissions as transactions) ---------
drop policy if exists daily_closings_select on public.daily_closings;
create policy daily_closings_select on public.daily_closings for select
  using (get_my_role() in ('accountant', 'manager', 'owner'));

drop policy if exists daily_closings_insert on public.daily_closings;
create policy daily_closings_insert on public.daily_closings for insert
  with check (get_my_role() in ('accountant', 'owner'));

-- ---- attendance -----------------------------------------------------------
-- Everyone can clock themselves in/out and see their own history;
-- managers/accountants/owner can additionally see and correct everyone's.
drop policy if exists attendance_select on public.attendance;
create policy attendance_select on public.attendance for select
  using (staff_id = auth.uid() or get_my_role() in ('accountant', 'manager', 'owner'));

drop policy if exists attendance_insert on public.attendance;
create policy attendance_insert on public.attendance for insert
  with check (staff_id = auth.uid() or get_my_role() in ('manager', 'owner'));

drop policy if exists attendance_update on public.attendance;
create policy attendance_update on public.attendance for update
  using (staff_id = auth.uid() or get_my_role() in ('manager', 'owner'));

-- ---- notifications (shared list, matches the current single-tenant design)
drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications for select
  using (true);

drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications for update
  using (get_my_role() in ('staff', 'accountant', 'manager', 'owner'));

-- ---- audit_logs (the "Audit Log" module) --------------------------------
-- staff: []   accountant/manager: ['view']   owner: ['view','export']
-- Insert is open to any authenticated user because every mutation above
-- writes its own audit entry on the acting user's behalf.
drop policy if exists audit_logs_select on public.audit_logs;
create policy audit_logs_select on public.audit_logs for select
  using (get_my_role() in ('accountant', 'manager', 'owner'));

drop policy if exists audit_logs_insert on public.audit_logs;
create policy audit_logs_insert on public.audit_logs for insert
  with check (auth.role() = 'authenticated');

-- ============================================================================
-- Creating your account
--
-- No manual account creation needed anymore — use the app's own Sign Up
-- screen, which asks the person to pick their role (Owner, Manager,
-- Accountant, or Staff) and takes them straight to the matching portal.
--
-- If you already created accounts by hand in Authentication → Users while
-- testing an earlier version of this file, you can leave them — the trigger
-- above only changes how NEW sign-ups are handled — or delete them there
-- and sign up fresh through the app instead.
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────
-- 4. No demo/starter data — this business enters its own records
--
-- Earlier versions of this file seeded illustrative demo rows (fake
-- projects, tasks, inventory, transactions, notifications) so the UI had
-- something to show while it was being built. That's gone: the real
-- Owner/Manager/Accountant/Staff who sign up now enter their own real
-- projects, tasks, stock, and transactions through the app itself.
--
-- If you ran an OLDER version of this file that inserted the demo rows
-- (projects PRJ-1024..PRJ-1032, transactions TXN-001..TXN-010, the
-- "Abena Darko"/"Yaw Ofori"/etc. sample tasks and inventory), run this
-- once in the SQL Editor to remove them before handing the app to real
-- users — it only deletes rows matching those exact demo IDs, nothing else:
--
--   delete from public.transactions where id like 'TXN-0%';
--   delete from public.tasks where project in (
--     'Mensah Wedding Package','TechGhana Corp Branding','Accra Foods Campaign',
--     'GCB Bank Training','UG Graduation 2025','MTN Staff ID Cards',
--     'Shoprite Loyalty Program','StarLife Insurance Flyers',
--     'Private Client — Ofori Family','Internal Marketing'
--   );
--   delete from public.projects where id like 'PRJ-10%';
--   delete from public.inventory where updated_by in ('Yaw Ofori','Kofi Boateng','Abena Darko','Nana Frimpong');
--   delete from public.notifications where title in (
--     'Task Deadline Tomorrow','Low Stock Alert','Payment Received','Project Overdue',
--     'Staff Clocked In','Color Ink Out of Stock','New Task Assigned','System Maintenance'
--   );
-- ────────────────────────────────────────────────────────────────────────

-- ────────────────────────────────────────────────────────────────────────
-- 5. Company settings, per-user notification preferences, logo storage
--
-- Matches the "Settings" module in the ROLE_PERMS matrix: Staff and
-- Accountant get ['view'] only, Manager/Owner get ['view','edit'] — so
-- everyone signed in can read this, only Manager/Owner can change it.
-- ────────────────────────────────────────────────────────────────────────

create table if not exists public.company_settings (
  id int primary key default 1 check (id = 1), -- enforces exactly one row
  name text not null default 'My Business',
  address text not null default '',
  phone text not null default '',
  email text not null default '',
  currency text not null default 'GHS',
  timezone text not null default 'Africa/Accra',
  date_format text not null default 'dmy',
  late_threshold_minutes int not null default 10,
  low_stock_warning text not null default 'min',
  logo_url text,
  business_hours jsonb not null default
    '{"Monday":["08:00","17:00"],"Tuesday":["08:00","17:00"],"Wednesday":["08:00","17:00"],"Thursday":["08:00","17:00"],"Friday":["08:00","17:00"],"Saturday":["09:00","13:00"]}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Shared code required at sign-up (checked in handle_new_user() above) so
-- only people your company hands this to can create an account. Ships with
-- a placeholder value so the very first person (you) can sign up at all —
-- change it immediately afterwards in Settings → Company, since anyone who
-- has read this file knows the default.
alter table public.company_settings add column if not exists signup_code text not null default 'CHANGE-ME-AFTER-FIRST-SIGNUP';

insert into public.company_settings (id) values (1) on conflict (id) do nothing;

alter table public.company_settings enable row level security;

drop policy if exists company_settings_select on public.company_settings;
create policy company_settings_select on public.company_settings for select
  using (auth.role() = 'authenticated');

drop policy if exists company_settings_update on public.company_settings;
create policy company_settings_update on public.company_settings for update
  using (get_my_role() in ('manager', 'owner'));

-- Per-user notification preferences live on the person's own profile —
-- covered by the existing profiles_update policy (self-update is already
-- allowed there; the earlier anti-escalation trigger only guards role/status).
alter table public.profiles add column if not exists notification_prefs jsonb not null default
  '{"tasks": true, "projects": true, "stock": true, "payments": false, "attendance": false, "system": true}'::jsonb;

-- Company logo storage: a public-read bucket (so the logo can be shown
-- without a signed URL) that only Manager/Owner can write to.
insert into storage.buckets (id, name, public)
values ('company-assets', 'company-assets', true)
on conflict (id) do nothing;

drop policy if exists company_assets_read on storage.objects;
create policy company_assets_read on storage.objects for select
  using (bucket_id = 'company-assets');

drop policy if exists company_assets_write on storage.objects;
create policy company_assets_write on storage.objects for insert
  with check (bucket_id = 'company-assets' and get_my_role() in ('manager', 'owner'));

drop policy if exists company_assets_modify on storage.objects;
create policy company_assets_modify on storage.objects for update
  using (bucket_id = 'company-assets' and get_my_role() in ('manager', 'owner'));

-- ────────────────────────────────────────────────────────────────────────
-- 6. Profile pictures — everyone can upload their own, nobody else's
-- ────────────────────────────────────────────────────────────────────────

alter table public.profiles add column if not exists avatar_url text;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Files are stored at "<user id>/filename", so this checks the first path
-- segment matches whoever is uploading — everyone can read any avatar
-- (they're shown all over the app), but can only write inside their own folder.
drop policy if exists avatars_read on storage.objects;
create policy avatars_read on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists avatars_write on storage.objects;
create policy avatars_write on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists avatars_modify on storage.objects;
create policy avatars_modify on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
