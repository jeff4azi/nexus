-- ─────────────────────────────────────────────────────────────────────────────
-- Full admin remediation plan
-- Items: withdrawal flow, KYC, account status, investments,
--        notifications/broadcast, overview count optimisation
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Make withdrawal_requests support crypto wallets (bank_account_id was NOT NULL)
alter table public.withdrawal_requests
  alter column bank_account_id drop not null,
  add column if not exists crypto_wallet_id uuid
    references public.crypto_wallets(id) on delete set null;

alter table public.withdrawal_requests
  add constraint withdrawal_has_destination
    check (bank_account_id is not null or crypto_wallet_id is not null);

-- 2. submit_withdrawal — atomically reserves funds and creates the request
create or replace function public.submit_withdrawal(
  p_amount           numeric,
  p_crypto_wallet_id uuid
)
returns public.withdrawal_requests
language plpgsql security definer set search_path = public as $$
declare
  current_balance numeric;
  tx_id           uuid;
  result          public.withdrawal_requests;
begin
  -- Lock the profile row to prevent double-spend race conditions
  select balance into current_balance
  from public.profiles
  where id = auth.uid()
  for update;

  if current_balance is null then
    raise exception 'Profile not found';
  end if;

  if p_amount <= 0 then
    raise exception 'Amount must be greater than zero';
  end if;

  if p_amount < 10 then
    raise exception 'Minimum withdrawal is $10';
  end if;

  if p_amount > current_balance then
    raise exception 'Insufficient balance. Available: $%', round(current_balance, 2);
  end if;

  -- Reserve funds immediately (mirrors Stripe/Wise hold semantics)
  update public.profiles
  set balance = balance - p_amount
  where id = auth.uid();

  -- Create a pending transaction so it shows in the history right away
  insert into public.transactions (
    user_id, type, description, amount, fee, net_amount,
    status, payment_method
  )
  values (
    auth.uid(),
    'Withdrawal',
    'Withdrawal request — pending admin approval',
    p_amount, 0, p_amount,
    'Pending',
    'Crypto'
  )
  returning id into tx_id;

  -- Create the withdrawal request linked to the wallet and transaction
  insert into public.withdrawal_requests (
    user_id, crypto_wallet_id, transaction_id, amount, status
  )
  values (
    auth.uid(), p_crypto_wallet_id, tx_id, p_amount, 'Pending'
  )
  returning * into result;

  -- Notify the user
  insert into public.notifications (user_id, title, message, category)
  values (
    auth.uid(),
    'Withdrawal Request Received',
    'Your withdrawal request for $' || round(p_amount, 2)::text ||
      ' has been submitted and is pending admin approval.',
    'Withdrawal'
  );

  return result;
end;
$$;

grant execute on function public.submit_withdrawal(numeric, uuid) to authenticated;

-- 3. Replace admin_review_withdrawal to restore balance on rejection
create or replace function public.admin_review_withdrawal(
  p_withdrawal_id uuid,
  p_status        text,
  p_note          text default null
)
returns public.withdrawal_requests
language plpgsql security definer set search_path = public as $$
declare result public.withdrawal_requests;
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  if p_status not in ('Approved', 'Processing', 'Rejected', 'Paid') then
    raise exception 'Invalid status: %', p_status;
  end if;

  update public.withdrawal_requests
  set status      = p_status,
      reviewed_at = now(),
      review_note = p_note,
      reviewed_by = auth.uid()
  where id = p_withdrawal_id
  returning * into result;

  if result.id is null then
    raise exception 'Withdrawal not found';
  end if;

  -- Rejection: restore the reserved balance and fail the transaction
  if p_status = 'Rejected' then
    update public.profiles
    set balance = balance + result.amount
    where id = result.user_id;

    if result.transaction_id is not null then
      update public.transactions set status = 'Failed'
      where id = result.transaction_id;
    end if;

    insert into public.notifications (user_id, title, message, category)
    values (
      result.user_id,
      'Withdrawal Rejected',
      'Your withdrawal of $' || round(result.amount, 2)::text || ' was rejected.' ||
        coalesce(' Note: ' || p_note, ''),
      'Withdrawal'
    );
  end if;

  -- Paid: complete the transaction
  if p_status = 'Paid' then
    if result.transaction_id is not null then
      update public.transactions set status = 'Completed'
      where id = result.transaction_id;
    end if;

    insert into public.notifications (user_id, title, message, category)
    values (
      result.user_id,
      'Withdrawal Paid',
      'Your withdrawal of $' || round(result.amount, 2)::text ||
        ' has been processed and sent to your crypto wallet.',
      'Withdrawal'
    );
  end if;

  return result;
end;
$$;

grant execute on function public.admin_review_withdrawal(uuid, text, text) to authenticated;

-- 4. admin_activate_investment
create or replace function public.admin_activate_investment(
  p_investment_id uuid
)
returns public.user_investments
language plpgsql security definer set search_path = public as $$
declare
  inv    public.user_investments;
  plan   public.investment_plans;
  result public.user_investments;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;

  select * into inv from public.user_investments where id = p_investment_id;
  if inv.id is null then raise exception 'Investment not found'; end if;
  if inv.status != 'Pending' then raise exception 'Investment is not in Pending status'; end if;

  select * into plan from public.investment_plans where id = inv.investment_plan_id;

  update public.user_investments
  set status     = 'Active',
      started_at = now(),
      matures_at = now() + (plan.duration_hrs || ' hours')::interval
  where id = p_investment_id
  returning * into result;

  insert into public.notifications (user_id, title, message, category)
  values (
    inv.user_id,
    'Investment Activated',
    'Your ' || plan.name || ' investment of $' ||
      round(inv.amount_invested, 2)::text || ' is now active and will mature in ' ||
      plan.duration_hrs || ' hours.',
    'Investment'
  );

  return result;
end;
$$;

grant execute on function public.admin_activate_investment(uuid) to authenticated;

-- 5. admin_credit_returns — manually credit returns_earned and current_value
create or replace function public.admin_credit_returns(
  p_investment_id uuid,
  p_returns       numeric
)
returns public.user_investments
language plpgsql security definer set search_path = public as $$
declare
  inv    public.user_investments;
  result public.user_investments;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  if p_returns <= 0 then raise exception 'Returns must be positive'; end if;

  select * into inv from public.user_investments where id = p_investment_id;
  if inv.id is null then raise exception 'Investment not found'; end if;

  update public.user_investments
  set returns_earned = returns_earned + p_returns,
      current_value  = amount_invested + returns_earned + p_returns
  where id = p_investment_id
  returning * into result;

  -- Credit the user balance too
  update public.profiles
  set balance = balance + p_returns
  where id = inv.user_id;

  -- Create a return credit transaction
  insert into public.transactions (
    user_id, type, description, amount, fee, net_amount, status, payment_method
  )
  values (
    inv.user_id,
    'Return Credit',
    'Investment return credit',
    p_returns, 0, p_returns,
    'Completed',
    'Internal'
  );

  insert into public.notifications (user_id, title, message, category)
  values (
    inv.user_id,
    'Returns Credited',
    '$' || round(p_returns, 2)::text || ' in investment returns have been credited to your account.',
    'Investment'
  );

  return result;
end;
$$;

grant execute on function public.admin_credit_returns(uuid, numeric) to authenticated;

-- 6. admin_mark_investment_matured
create or replace function public.admin_mark_investment_matured(
  p_investment_id uuid
)
returns public.user_investments
language plpgsql security definer set search_path = public as $$
declare
  inv    public.user_investments;
  result public.user_investments;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;

  select * into inv from public.user_investments where id = p_investment_id;
  if inv.id is null then raise exception 'Investment not found'; end if;

  update public.user_investments
  set status = 'Matured'
  where id = p_investment_id
  returning * into result;

  insert into public.notifications (user_id, title, message, category)
  values (
    inv.user_id,
    'Investment Matured',
    'Your investment of $' || round(inv.amount_invested, 2)::text ||
      ' has matured. Your returns have been credited to your balance.',
    'Investment'
  );

  return result;
end;
$$;

grant execute on function public.admin_mark_investment_matured(uuid) to authenticated;

-- 7. admin_update_kyc
create or replace function public.admin_update_kyc(
  p_user_id uuid,
  p_status  text,
  p_note    text default null
)
returns public.profiles
language plpgsql security definer set search_path = public as $$
declare result public.profiles;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;

  if p_status not in ('Unverified', 'Pending', 'Verified', 'Rejected') then
    raise exception 'Invalid KYC status: %', p_status;
  end if;

  update public.profiles
  set kyc_status = p_status
  where id = p_user_id
  returning * into result;

  if result.id is null then raise exception 'User not found'; end if;

  insert into public.notifications (user_id, title, message, category)
  values (
    p_user_id,
    'KYC Status Updated',
    'Your identity verification status has been updated to: ' || p_status ||
      coalesce('. ' || p_note, '.'),
    'Account'
  );

  return result;
end;
$$;

grant execute on function public.admin_update_kyc(uuid, text, text) to authenticated;

-- 8. admin_update_account_status
create or replace function public.admin_update_account_status(
  p_user_id uuid,
  p_status  text
)
returns public.profiles
language plpgsql security definer set search_path = public as $$
declare result public.profiles;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;

  if p_status not in ('Pending', 'Active', 'Suspended', 'Closed') then
    raise exception 'Invalid account status: %', p_status;
  end if;

  update public.profiles
  set account_status = p_status
  where id = p_user_id
  returning * into result;

  if result.id is null then raise exception 'User not found'; end if;

  insert into public.notifications (user_id, title, message, category)
  values (
    p_user_id,
    'Account Status Updated',
    'Your account status has been updated to: ' || p_status || '.',
    'Account'
  );

  return result;
end;
$$;

grant execute on function public.admin_update_account_status(uuid, text) to authenticated;

-- 9. admin_broadcast_notification
create or replace function public.admin_broadcast_notification(
  p_title    text,
  p_message  text,
  p_category text default 'Promotion'
)
returns integer
language plpgsql security definer set search_path = public as $$
declare notified integer;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;

  insert into public.notifications (user_id, title, message, category)
  select id, p_title, p_message, p_category
  from public.profiles
  where role = 'user' and account_status = 'Active';

  get diagnostics notified = row_count;
  return notified;
end;
$$;

grant execute on function public.admin_broadcast_notification(text, text, text) to authenticated;

-- 10. Add admin policy for reading withdrawal_requests with crypto wallet join
drop policy if exists "Admins manage withdrawals" on public.withdrawal_requests;
create policy "Admins manage withdrawals"
  on public.withdrawal_requests for all
  using (public.is_admin())
  with check (public.is_admin());

-- Users can now insert withdrawal requests (via the secure function above,
-- but the RLS insert policy is also needed for the function's invoker context)
drop policy if exists "Users create withdrawal requests" on public.withdrawal_requests;
create policy "Users create withdrawal requests"
  on public.withdrawal_requests for insert
  with check ((select auth.uid()) = user_id);
