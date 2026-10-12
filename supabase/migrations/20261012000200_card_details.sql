-- Stores non-sensitive card metadata submitted via the card payment form.
-- Raw PAN and CVV are NEVER stored. Only the last 4 digits, expiry (MM/YY),
-- cardholder name, and detected card brand are kept for display/audit purposes.

create table public.card_details (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  deposit_request_id  uuid references public.deposit_requests(id) on delete set null,
  cardholder_name     text not null,
  card_last4          text not null check (card_last4 ~ '^[0-9]{4}$'),
  card_brand          text check (card_brand in ('Visa', 'Mastercard', 'Verve', 'Other')),
  expiry_month        smallint not null check (expiry_month between 1 and 12),
  expiry_year         smallint not null check (expiry_year >= 2024),
  created_at          timestamptz not null default now()
);

create index card_details_user_idx on public.card_details (user_id, created_at desc);

alter table public.card_details enable row level security;

create policy "Users create own card details"
  on public.card_details for insert
  with check ((select auth.uid()) = user_id);

create policy "Users read own card details"
  on public.card_details for select
  using ((select auth.uid()) = user_id or public.is_admin());

create policy "Admins read all card details"
  on public.card_details for select
  using (public.is_admin());
