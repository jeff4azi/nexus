-- ─────────────────────────────────────────────────────────────────────────────
-- Public-facing form submissions: contact messages, consultation bookings, leads
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Contact messages
create table public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  subject     text,
  message     text not null,
  status      text not null default 'New'
                check (status in ('New', 'Read', 'Replied')),
  admin_note  text,
  created_at  timestamptz not null default now()
);

create index contact_messages_status_idx on public.contact_messages (status, created_at desc);

-- 2. Consultation bookings
create table public.consultation_bookings (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  email           text not null,
  phone           text,
  preferred_date  date not null,
  preferred_time  text not null,
  topic           text,
  status          text not null default 'Pending'
                    check (status in ('Pending', 'Confirmed', 'Cancelled')),
  admin_note      text,
  created_at      timestamptz not null default now()
);

create index consultation_bookings_status_idx on public.consultation_bookings (status, created_at desc);

-- 3. Leads (email captures from the CTA banner)
create table public.leads (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  source     text not null default 'cta_banner',
  created_at timestamptz not null default now(),
  unique (email)  -- deduplicate by email
);

-- RLS: these tables are written to by anonymous visitors (no session)
-- and read only by admins.

alter table public.contact_messages      enable row level security;
alter table public.consultation_bookings enable row level security;
alter table public.leads                 enable row level security;

-- Anyone (anon) can insert — public forms don't require a login
create policy "Public can submit contact messages"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

create policy "Public can submit consultation bookings"
  on public.consultation_bookings for insert
  to anon, authenticated
  with check (true);

create policy "Public can submit leads"
  on public.leads for insert
  to anon, authenticated
  with check (true);

-- Only admins can read and update
create policy "Admins manage contact messages"
  on public.contact_messages for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage consultation bookings"
  on public.consultation_bookings for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins read leads"
  on public.leads for select
  using (public.is_admin());
