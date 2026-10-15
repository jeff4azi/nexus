-- ─────────────────────────────────────────────────────────────────────────────
-- Transaction PIN & deposit SSN gate
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add transaction_pin_hash to profiles (distinct from the old withdrawal_pin_hash)
alter table public.profiles
  add column if not exists transaction_pin_hash text;

-- 2. set_transaction_pin
--    If the user already has a PIN, they must supply the correct old one.
--    First-time setup: old_pin can be NULL.
create or replace function public.set_transaction_pin(
  p_new_pin text,
  p_old_pin text default null
)
returns void
language plpgsql security definer set search_path = public as $$
declare
  current_hash text;
begin
  -- Validate new PIN
  if p_new_pin !~ '^[0-9]{4}$' then
    raise exception 'PIN must be exactly 4 digits';
  end if;

  select transaction_pin_hash into current_hash
  from public.profiles
  where id = auth.uid();

  -- If a PIN is already set, verify the old one before allowing a change
  if current_hash is not null then
    if p_old_pin is null then
      raise exception 'Current PIN is required to set a new one';
    end if;
    if current_hash != crypt(p_old_pin, current_hash) then
      raise exception 'Current PIN is incorrect';
    end if;
  end if;

  update public.profiles
  set transaction_pin_hash = crypt(p_new_pin, gen_salt('bf'))
  where id = auth.uid();
end;
$$;

grant execute on function public.set_transaction_pin(text, text) to authenticated;

-- 3. verify_transaction_pin — returns true/false (used client-side to pre-check)
create or replace function public.verify_transaction_pin(p_pin text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare
  current_hash text;
begin
  select transaction_pin_hash into current_hash
  from public.profiles
  where id = auth.uid();

  if current_hash is null then
    return false;
  end if;

  return current_hash = crypt(p_pin, current_hash);
end;
$$;

grant execute on function public.verify_transaction_pin(text) to authenticated;

-- 4. Replace submit_withdrawal to require PIN verification inline
create or replace function public.submit_withdrawal(
  p_amount           numeric,
  p_crypto_wallet_id uuid,
  p_pin              text
)
returns public.withdrawal_requests
language plpgsql security definer set search_path = public as $$
declare
  current_balance  numeric;
  current_pin_hash text;
  tx_id            uuid;
  result           public.withdrawal_requests;
begin
  -- Verify transaction PIN first
  select balance, transaction_pin_hash
  into current_balance, current_pin_hash
  from public.profiles
  where id = auth.uid()
  for update;

  if current_balance is null then
    raise exception 'Profile not found';
  end if;

  if current_pin_hash is null then
    raise exception 'No transaction PIN set. Please set a PIN in Settings before withdrawing.';
  end if;

  if current_pin_hash != crypt(p_pin, current_pin_hash) then
    raise exception 'Incorrect transaction PIN';
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

  -- Reserve funds immediately
  update public.profiles
  set balance = balance - p_amount
  where id = auth.uid();

  insert into public.transactions (
    user_id, type, description, amount, fee, net_amount, status, payment_method
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

  insert into public.withdrawal_requests (
    user_id, crypto_wallet_id, transaction_id, amount, status
  )
  values (
    auth.uid(), p_crypto_wallet_id, tx_id, p_amount, 'Pending'
  )
  returning * into result;

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

grant execute on function public.submit_withdrawal(numeric, uuid, text) to authenticated;
