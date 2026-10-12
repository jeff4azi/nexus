-- Enforces that only a super_admin can assign the super_admin role.
-- A regular admin can create/update other admin profiles but cannot
-- escalate anyone (including themselves) to super_admin.

-- Helper: is the current user a super_admin?
create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin'
  );
$$;

grant execute on function public.is_super_admin() to authenticated;

-- Drop the old broad read policy so we can replace it cleanly
drop policy if exists "Admins read all profiles" on public.profiles;

-- Admins can read all profiles
create policy "Admins read all profiles"
  on public.profiles for select
  using (public.is_admin());

-- Admins can insert new profiles (used when the edge function stamps a new
-- admin account — the handle_new_user trigger covers normal signups)
drop policy if exists "Admins insert profiles" on public.profiles;
create policy "Admins insert profiles"
  on public.profiles for insert
  with check (public.is_admin());

-- Admins can update profiles with two guards:
--   1. Only super_admin may write role = 'super_admin' on any row
--   2. No admin (including super_admin) may edit an existing super_admin row
--      unless they themselves are super_admin
-- In WITH CHECK, column names refer to the incoming (new) row values directly
-- — no NEW. prefix needed in Postgres RLS expressions.
drop policy if exists "Admins update profiles" on public.profiles;
create policy "Admins update profiles"
  on public.profiles for update
  using (public.is_admin())
  with check (
    public.is_super_admin()
    or (
      role <> 'super_admin'
      and (select p.role from public.profiles p where p.id = profiles.id) <> 'super_admin'
    )
  );
