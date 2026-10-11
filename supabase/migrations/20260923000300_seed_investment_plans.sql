insert into public.investment_plans (name, tier, description, min_amount, max_amount, roi_percent, duration_hrs, payout_type, risk_level)
values
  ('Foundation Yield', 'Starter', 'A low-risk entry plan for new investors.', 100, 999, 4.5, 720, 'At Maturity', 'Low'),
  ('Growth Yield', 'Growth', 'Balanced growth with a monthly payout schedule.', 1000, 9999, 8.0, 2160, 'Monthly', 'Medium'),
  ('Premier Yield', 'Premier', 'Longer-term investment plan for higher returns.', 10000, null, 12.5, 4320, 'At Maturity', 'High')
on conflict (name) do update set
  tier = excluded.tier, description = excluded.description, min_amount = excluded.min_amount,
  max_amount = excluded.max_amount, roi_percent = excluded.roi_percent, duration_hrs = excluded.duration_hrs,
  payout_type = excluded.payout_type, risk_level = excluded.risk_level, is_active = true;
