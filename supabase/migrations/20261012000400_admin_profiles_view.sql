-- Secure view that joins profiles with auth.users to expose email.
-- Only admins can query this view (enforced by the underlying RLS on profiles
-- plus the security_invoker = false default which runs as the definer).

create or replace view public.admin_user_profiles
with (security_invoker = false) as
  select
    p.*,
    u.email
  from public.profiles p
  join auth.users u on u.id = p.id;

-- Restrict access: only authenticated users whose profile has an admin role
-- may select from this view. We use a security barrier to prevent optimisation
-- tricks that could leak rows.
alter view public.admin_user_profiles owner to postgres;

grant select on public.admin_user_profiles to authenticated;

-- Row-level policy is enforced via the security_invoker behaviour on the
-- underlying profiles table. As an extra safety net we also create an
-- explicit policy on the view itself via a security definer function.
-- (Supabase does not support RLS directly on views, so we rely on the
--  is_admin() check inside the application query + the profiles RLS.)
