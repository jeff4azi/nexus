-- Nexus Yield core schema. Apply with `supabase db push` after linking a new project.
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  phone text,
  date_of_birth date,
  country text,
  city text,
  address text,
  account_id text not null unique default ('NXY-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  account_type text not null default 'Individual' check (account_type in ('Individual', 'Joint', 'Corporate')),
  account_status text not null default 'Pending' check (account_status in ('Pending', 'Active', 'Suspended', 'Closed')),
  kyc_status text not null default 'Unverified' check (kyc_status in ('Unverified', 'Pending', 'Verified', 'Rejected')),
  risk_profile text not null default 'Balanced' check (risk_profile in ('Conservative', 'Balanced', 'Growth', 'Aggressive')),
  avatar_url text,
  withdrawal_pin_hash text,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.investment_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  tier text not null,
  description text,
  min_amount numeric(14,2) not null check (min_amount > 0),
  max_amount numeric(14,2) check (max_amount is null or max_amount >= min_amount),
  roi_percent numeric(7,4) not null check (roi_percent >= 0),
  duration_hrs integer not null check (duration_hrs > 0),
  payout_type text not null check (payout_type in ('At Maturity', 'Daily', 'Weekly', 'Monthly')),
  risk_level text not null check (risk_level in ('Low', 'Medium', 'High')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  investment_plan_id uuid not null references public.investment_plans(id) on delete restrict,
  amount_invested numeric(14,2) not null check (amount_invested > 0),
  expected_return numeric(14,2) not null check (expected_return >= 0),
  returns_earned numeric(14,2) not null default 0 check (returns_earned >= 0),
  current_value numeric(14,2) not null check (current_value >= 0),
  status text not null default 'Pending' check (status in ('Pending', 'Active', 'Maturing Soon', 'Matured', 'Cancelled')),
  started_at timestamptz,
  matures_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (matures_at is null or started_at is null or matures_at >= started_at)
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reference text not null unique default ('TXN-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))),
  type text not null check (type in ('Deposit', 'Withdrawal', 'Return Credit', 'Bonus', 'Fee')),
  description text,
  amount numeric(14,2) not null check (amount >= 0),
  fee numeric(14,2) not null default 0 check (fee >= 0),
  net_amount numeric(14,2) not null check (net_amount >= 0),
  status text not null default 'Pending' check (status in ('Pending', 'Completed', 'Failed', 'Cancelled')),
  payment_method text,
  external_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.bank_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bank_name text not null,
  account_name text not null,
  account_number text not null,
  routing_code text,
  account_type text not null default 'Savings',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, bank_name, account_number)
);

create unique index bank_accounts_one_default_per_user on public.bank_accounts (user_id) where is_default;

create table public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bank_account_id uuid not null references public.bank_accounts(id) on delete restrict,
  transaction_id uuid unique references public.transactions(id) on delete set null,
  amount numeric(14,2) not null check (amount > 0),
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Processing', 'Rejected', 'Paid', 'Cancelled')),
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  category text not null default 'Account' check (category in ('Account', 'Deposit', 'Withdrawal', 'Investment', 'Security', 'Document', 'Promotion')),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  doc_type text not null default 'Other' check (doc_type in ('Statement', 'Certificate', 'Tax Document', 'Agreement', 'Other')),
  file_url text not null,
  storage_path text,
  file_size text,
  created_at timestamptz not null default now()
);

create table public.login_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device text not null default 'Unknown device',
  browser text,
  ip_address inet,
  location text,
  is_current boolean not null default false,
  created_at timestamptz not null default now()
);

create index user_investments_user_created_idx on public.user_investments (user_id, created_at desc);
create index transactions_user_created_idx on public.transactions (user_id, created_at desc);
create index notifications_user_created_idx on public.notifications (user_id, created_at desc);
create index documents_user_created_idx on public.documents (user_id, created_at desc);
create index login_sessions_user_created_idx on public.login_sessions (user_id, created_at desc);
create index withdrawal_requests_user_created_idx on public.withdrawal_requests (user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, first_name, last_name, phone, date_of_birth, country, city, address)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'first_name', ''), coalesce(new.raw_user_meta_data ->> 'last_name', ''), new.raw_user_meta_data ->> 'phone', nullif(new.raw_user_meta_data ->> 'date_of_birth', '')::date, new.raw_user_meta_data ->> 'country', new.raw_user_meta_data ->> 'city', new.raw_user_meta_data ->> 'address');
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
create trigger profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger plans_updated_at before update on public.investment_plans for each row execute procedure public.set_updated_at();
create trigger investments_updated_at before update on public.user_investments for each row execute procedure public.set_updated_at();
create trigger transactions_updated_at before update on public.transactions for each row execute procedure public.set_updated_at();
create trigger bank_accounts_updated_at before update on public.bank_accounts for each row execute procedure public.set_updated_at();
create trigger withdrawals_updated_at before update on public.withdrawal_requests for each row execute procedure public.set_updated_at();

insert into storage.buckets (id, name, public) values ('documents', 'documents', false) on conflict (id) do nothing;
