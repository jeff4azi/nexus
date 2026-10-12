-- Replace old investment plans with the correct ones from the landing page.
-- Also adds a `badge` column (Popular / VIP / null) and opens plan reads to
-- anonymous users so the public landing page can display them.

-- 1. Add badge column
alter table public.investment_plans
  add column if not exists badge text check (badge is null or badge in ('Popular', 'VIP'));

-- 2. Allow anonymous (unauthenticated) users to read active plans so the
--    landing page can show them without requiring a session.
drop policy if exists "Anyone authenticated reads active plans" on public.investment_plans;
create policy "Anyone reads active plans"
  on public.investment_plans for select
  to anon, authenticated
  using (is_active = true);

-- 3. Wipe old seed data and insert the correct plans
delete from public.investment_plans;

insert into public.investment_plans
  (name, tier, description, min_amount, max_amount, roi_percent, duration_hrs, payout_type, risk_level, badge)
values
  ('Starter',      'Starter',  'A low-risk entry plan for new investors.',                  100,  499,  5.90, 24, 'At Maturity', 'Low',    null),
  ('Elite',        'Elite',    'Solid mid-range returns paid after 24 hours.',               500,  999,  8.90, 24, 'At Maturity', 'Low',    null),
  ('Deluxe',       'Deluxe',   'Enhanced returns over a 32-hour investment cycle.',         1000, 1999, 11.50, 32, 'At Maturity', 'Medium', null),
  ('Superior',     'Superior', 'Our most popular plan with strong 48-hour growth.',         2000, 4999, 15.00, 48, 'At Maturity', 'Medium', 'Popular'),
  ('Ultimate',     'Ultimate', 'High-yield 48-hour plan for serious investors.',            5000, 8999, 18.50, 48, 'At Maturity', 'High',   null),
  ('Platinum VIP', 'Platinum', 'Exclusive VIP tier with unlimited upside and daily ROI.',  9000, null, 10.00, 24, 'At Maturity', 'High',   'VIP');
