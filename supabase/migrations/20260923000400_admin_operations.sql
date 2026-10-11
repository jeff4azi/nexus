-- Operations, funding instructions, and safe payment-intent tracking.
-- Never store card PAN, CVV, expiry, or a full SSN in this application database.

alter table public.profiles add column role text not null default 'user' check (role in ('user', 'admin', 'super_admin'));
alter table public.profiles add column ssn_last4 text check (ssn_last4 is null or ssn_last4 ~ '^[0-9]{4}$');
alter table public.profiles add column ssn_verification_status text not null default 'Not provided' check (ssn_verification_status in ('Not provided', 'Pending', 'Verified', 'Rejected'));

create table public.crypto_wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  asset text not null,
  network text not null,
  wallet_address text not null,
  label text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, asset, network, wallet_address)
);
create unique index crypto_wallets_one_default_per_user on public.crypto_wallets (user_id) where is_default;

create table public.funding_destinations (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('bank', 'crypto')),
  label text not null,
  currency text not null default 'USD',
  bank_name text,
  account_name text,
  account_number text,
  routing_code text,
  asset text,
  network text,
  wallet_address text,
  instructions text,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((kind = 'bank' and bank_name is not null and account_name is not null and account_number is not null) or (kind = 'crypto' and asset is not null and network is not null and wallet_address is not null))
);

create table public.deposit_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  funding_destination_id uuid references public.funding_destinations(id) on delete set null,
  transaction_id uuid unique references public.transactions(id) on delete set null,
  amount numeric(14,2) not null check (amount > 0),
  method text not null check (method in ('Bank Transfer', 'Crypto', 'Card')),
  payment_reference text,
  proof_url text,
  status text not null default 'Pending Review' check (status in ('Pending Review', 'Approved', 'Rejected', 'Failed')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- This is a non-sensitive placeholder until a PCI-compliant payment provider is integrated.
create table public.card_payment_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  deposit_request_id uuid unique references public.deposit_requests(id) on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  currency text not null default 'USD',
  provider text not null default 'unconfigured',
  status text not null default 'Failed' check (status in ('Pending', 'Failed', 'Provider Connected', 'Succeeded')),
  failure_code text,
  failure_message text,
  provider_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index crypto_wallets_user_created_idx on public.crypto_wallets (user_id, created_at desc);
create index deposits_user_created_idx on public.deposit_requests (user_id, created_at desc);
create index deposits_status_created_idx on public.deposit_requests (status, created_at asc);

create trigger crypto_wallets_updated_at before update on public.crypto_wallets for each row execute procedure public.set_updated_at();
create trigger funding_destinations_updated_at before update on public.funding_destinations for each row execute procedure public.set_updated_at();
create trigger deposit_requests_updated_at before update on public.deposit_requests for each row execute procedure public.set_updated_at();
create trigger card_attempts_updated_at before update on public.card_payment_attempts for each row execute procedure public.set_updated_at();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'));
$$;

-- Do not allow users to change role, status, or sensitive back-office fields directly.
drop policy "Users update own profile" on public.profiles;
create or replace function public.update_my_profile(p_first_name text, p_last_name text, p_phone text default null, p_date_of_birth date default null, p_country text default null, p_city text default null, p_address text default null, p_ssn_last4 text default null)
returns public.profiles language plpgsql security definer set search_path = public as $$
declare updated_profile public.profiles;
begin
  update public.profiles set first_name = coalesce(p_first_name, ''), last_name = coalesce(p_last_name, ''), phone = p_phone, date_of_birth = p_date_of_birth, country = p_country, city = p_city, address = p_address, ssn_last4 = p_ssn_last4, ssn_verification_status = case when p_ssn_last4 is null then 'Not provided' else 'Pending' end where id = auth.uid() returning * into updated_profile;
  return updated_profile;
end;
$$;
grant execute on function public.update_my_profile(text, text, text, date, text, text, text, text) to authenticated;

alter table public.crypto_wallets enable row level security;
alter table public.funding_destinations enable row level security;
alter table public.deposit_requests enable row level security;
alter table public.card_payment_attempts enable row level security;
create policy "Users manage own wallets" on public.crypto_wallets for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Authenticated users read active funding destinations" on public.funding_destinations for select to authenticated using (is_active or public.is_admin());
create policy "Users read own deposits" on public.deposit_requests for select using ((select auth.uid()) = user_id or public.is_admin());
create policy "Users create own deposits" on public.deposit_requests for insert with check ((select auth.uid()) = user_id);
create policy "Users read own card attempts" on public.card_payment_attempts for select using ((select auth.uid()) = user_id or public.is_admin());
create policy "Users create own card attempts" on public.card_payment_attempts for insert with check ((select auth.uid()) = user_id);

-- Admin staff can review all operational data. Service-role jobs handle actual money movement.
create policy "Admins read all profiles" on public.profiles for select using (public.is_admin());
create policy "Admins manage plans" on public.investment_plans for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage investments" on public.user_investments for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage transactions" on public.transactions for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins read bank accounts" on public.bank_accounts for select using (public.is_admin());
create policy "Admins manage withdrawals" on public.withdrawal_requests for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage notifications" on public.notifications for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins read documents" on public.documents for select using (public.is_admin());
create policy "Admins read login sessions" on public.login_sessions for select using (public.is_admin());
create policy "Admins read wallets" on public.crypto_wallets for select using (public.is_admin());
create policy "Admins manage funding destinations" on public.funding_destinations for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins update deposits" on public.deposit_requests for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins update card attempts" on public.card_payment_attempts for update using (public.is_admin()) with check (public.is_admin());

create or replace function public.admin_review_deposit(p_deposit_id uuid, p_approve boolean, p_note text default null)
returns public.deposit_requests language plpgsql security definer set search_path = public as $$
declare result public.deposit_requests;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  update public.deposit_requests set status = case when p_approve then 'Approved' else 'Rejected' end, reviewed_by = auth.uid(), reviewed_at = now(), review_note = p_note where id = p_deposit_id and status = 'Pending Review' returning * into result;
  if result.id is null then raise exception 'Deposit is unavailable for review'; end if;
  if result.transaction_id is not null then update public.transactions set status = case when p_approve then 'Completed' else 'Failed' end where id = result.transaction_id; end if;
  return result;
end;
$$;

create or replace function public.admin_review_withdrawal(p_withdrawal_id uuid, p_status text, p_note text default null)
returns public.withdrawal_requests language plpgsql security definer set search_path = public as $$
declare result public.withdrawal_requests;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  if p_status not in ('Approved', 'Processing', 'Rejected', 'Paid') then raise exception 'Invalid withdrawal status'; end if;
  update public.withdrawal_requests set status = p_status, reviewed_at = now(), review_note = p_note where id = p_withdrawal_id returning * into result;
  if result.id is null then raise exception 'Withdrawal not found'; end if;
  if result.transaction_id is not null and p_status in ('Rejected', 'Paid') then update public.transactions set status = case when p_status = 'Paid' then 'Completed' else 'Failed' end where id = result.transaction_id; end if;
  return result;
end;
$$;
grant execute on function public.admin_review_deposit(uuid, boolean, text) to authenticated;
grant execute on function public.admin_review_withdrawal(uuid, text, text) to authenticated;
