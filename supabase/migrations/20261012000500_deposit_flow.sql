-- ─────────────────────────────────────────────────────────────────────────────
-- Deposit flow fixes
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Storage bucket for deposit proof screenshots / receipts
insert into storage.buckets (id, name, public)
values ('deposit-proofs', 'deposit-proofs', false)
on conflict (id) do nothing;

-- Users can upload their own proof files
create policy "Users upload deposit proofs"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'deposit-proofs'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Users can read their own proof files
create policy "Users read own deposit proofs"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'deposit-proofs'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Admins can read all proof files
create policy "Admins read all deposit proofs"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'deposit-proofs'
    and public.is_admin()
  );

-- 2. Add balance column to profiles so we track available funds explicitly
alter table public.profiles
  add column if not exists balance numeric(14,2) not null default 0
    check (balance >= 0);

-- 3. Replace admin_review_deposit to:
--    a) Create a transactions row when approving (this is what credits the user)
--    b) Update the deposit_request to link to that transaction
--    c) Increment the user's balance on approval
--    d) Send a notification to the user
--    e) Support deleting a deposit request
create or replace function public.admin_review_deposit(
  p_deposit_id uuid,
  p_approve    boolean,
  p_note       text default null
)
returns public.deposit_requests
language plpgsql security definer set search_path = public as $$
declare
  dep    public.deposit_requests;
  tx_id  uuid;
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  -- Lock the deposit row
  select * into dep
  from public.deposit_requests
  where id = p_deposit_id and status = 'Pending Review'
  for update;

  if dep.id is null then
    raise exception 'Deposit not found or already reviewed';
  end if;

  if p_approve then
    -- Create a completed transaction row to officially credit the user
    insert into public.transactions (
      user_id, type, description, amount, fee, net_amount,
      status, payment_method
    )
    values (
      dep.user_id,
      'Deposit',
      'Deposit approved — ' || dep.method,
      dep.amount,
      0,
      dep.amount,
      'Completed',
      dep.method
    )
    returning id into tx_id;

    -- Credit the user's balance
    update public.profiles
    set balance = balance + dep.amount
    where id = dep.user_id;

    -- Notify the user
    insert into public.notifications (user_id, title, message, category)
    values (
      dep.user_id,
      'Deposit Approved',
      'Your deposit of $' || dep.amount::text || ' has been approved and credited to your account.',
      'Deposit'
    );
  else
    -- Notify rejection
    insert into public.notifications (user_id, title, message, category)
    values (
      dep.user_id,
      'Deposit Rejected',
      'Your deposit of $' || dep.amount::text || ' was not approved.' ||
        case when p_note is not null then ' Note: ' || p_note else '' end,
      'Deposit'
    );
  end if;

  -- Update the deposit request itself
  update public.deposit_requests
  set
    status      = case when p_approve then 'Approved' else 'Rejected' end,
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    review_note = p_note,
    transaction_id = case when p_approve then tx_id else null end
  where id = p_deposit_id
  returning * into dep;

  return dep;
end;
$$;

-- 4. Function to delete a deposit request (admin only, only when Pending Review)
create or replace function public.admin_delete_deposit(p_deposit_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  delete from public.deposit_requests
  where id = p_deposit_id and status in ('Pending Review', 'Rejected', 'Failed');

  if not found then
    raise exception 'Deposit not found or cannot be deleted in its current state';
  end if;
end;
$$;

grant execute on function public.admin_review_deposit(uuid, boolean, text) to authenticated;
grant execute on function public.admin_delete_deposit(uuid) to authenticated;
