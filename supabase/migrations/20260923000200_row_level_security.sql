-- Clients use the anon key; every public table therefore needs RLS enabled.
alter table public.profiles enable row level security;
alter table public.investment_plans enable row level security;
alter table public.user_investments enable row level security;
alter table public.transactions enable row level security;
alter table public.bank_accounts enable row level security;
alter table public.withdrawal_requests enable row level security;
alter table public.notifications enable row level security;
alter table public.documents enable row level security;
alter table public.login_sessions enable row level security;

create policy "Users read own profile" on public.profiles for select using ((select auth.uid()) = id);
create policy "Users update own profile" on public.profiles for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "Anyone authenticated reads active plans" on public.investment_plans for select to authenticated using (is_active = true);
create policy "Users read own investments" on public.user_investments for select using ((select auth.uid()) = user_id);
create policy "Users read own transactions" on public.transactions for select using ((select auth.uid()) = user_id);
create policy "Users manage own bank accounts" on public.bank_accounts for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users read own withdrawal requests" on public.withdrawal_requests for select using ((select auth.uid()) = user_id);
create policy "Users read own notifications" on public.notifications for select using ((select auth.uid()) = user_id);
create policy "Users update own notifications" on public.notifications for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users read own documents" on public.documents for select using ((select auth.uid()) = user_id);
create policy "Users read own login sessions" on public.login_sessions for select using ((select auth.uid()) = user_id);

-- Files are stored under documents/<user-id>/... and are private by default.
create policy "Users read own document files" on storage.objects for select to authenticated using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users upload own document files" on storage.objects for insert to authenticated with check (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users delete own document files" on storage.objects for delete to authenticated using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
