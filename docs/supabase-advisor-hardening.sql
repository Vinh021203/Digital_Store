-- ============================================================
-- SHOP WEB RE - SUPABASE ADVISOR HARDENING
-- Purpose:
--   Run after the main schema if Supabase Advisors reports:
--   - RLS Policy Always True
--   - SECURITY DEFINER functions executable by anon/authenticated
--
-- Safe scope:
--   - Does not delete data.
--   - Does not remove public SELECT policies for storefront tables.
--   - Does not revoke table SELECT grants globally because the client app
--     may still read products/categories/blogs through Supabase.
--
-- Run in Supabase SQL Editor, then click Advisors > Rerun linter.
-- ============================================================

-- ------------------------------------------------------------
-- 0. Required helper.
-- Some older database versions do not have public.is_admin() yet.
-- This checks the current user's profile role.
-- ------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke execute on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;

-- ------------------------------------------------------------
-- 1. Prevent exposed RPC calls to trigger/helper functions.
-- These functions should run from triggers/server code, not from /rest/v1/rpc.
-- ------------------------------------------------------------
do $$
begin
  if to_regprocedure('public.create_licenses_on_order_paid()') is not null then
    execute 'revoke execute on function public.create_licenses_on_order_paid() from anon, authenticated';
  end if;

  if to_regprocedure('public.generate_affiliate_code()') is not null then
    execute 'revoke execute on function public.generate_affiliate_code() from anon, authenticated';
  end if;

  if to_regprocedure('public.handle_new_user()') is not null then
    execute 'revoke execute on function public.handle_new_user() from anon, authenticated';
  end if;

  if to_regprocedure('public.notify_license_created()') is not null then
    execute 'revoke execute on function public.notify_license_created() from anon, authenticated';
  end if;

  if to_regprocedure('public.notify_product_update()') is not null then
    execute 'revoke execute on function public.notify_product_update() from anon, authenticated';
  end if;

  if to_regprocedure('public.prevent_profile_role_escalation()') is not null then
    execute 'revoke execute on function public.prevent_profile_role_escalation() from anon, authenticated';
  end if;
end $$;

-- ------------------------------------------------------------
-- 2. Replace overly permissive INSERT/UPDATE policies.
-- These policy names are from the current Advisor report and older schema.
-- ------------------------------------------------------------

-- activity_logs
drop policy if exists "Anyone can insert activity logs" on public.activity_logs;
drop policy if exists "activity_logs_insert_authenticated" on public.activity_logs;
create policy "activity_logs_insert_authenticated"
on public.activity_logs
for insert
to authenticated
with check (
  (user_id is null or user_id = auth.uid())
  and length(trim(action)) > 0
  and length(trim(entity)) > 0
);

-- affiliate_referrals
drop policy if exists "Anyone can insert referrals" on public.affiliate_referrals;
drop policy if exists "affiliate_referrals_insert_authenticated" on public.affiliate_referrals;
create policy "affiliate_referrals_insert_authenticated"
on public.affiliate_referrals
for insert
to authenticated
with check (
  referrer_id = auth.uid()
  or referred_id = auth.uid()
  or public.is_admin()
);

-- blog_comments
-- Keep public comments possible, but do not leave WITH CHECK as literal true.
drop policy if exists "Anyone can insert comments" on public.blog_comments;
drop policy if exists "blog_comments_insert_public" on public.blog_comments;
create policy "blog_comments_insert_public_valid"
on public.blog_comments
for insert
to anon, authenticated
with check (
  length(trim(content)) between 3 and 5000
  and (user_id is null or user_id = auth.uid() or public.is_admin())
  and (guest_name is null or length(trim(guest_name)) between 2 and 120)
  and (guest_email is null or guest_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$')
);

-- coupon_usages
drop policy if exists "System can insert coupon usages" on public.coupon_usages;
drop policy if exists "coupon_usages_insert_authenticated" on public.coupon_usages;
create policy "coupon_usages_insert_own"
on public.coupon_usages
for insert
to authenticated
with check (
  user_id = auth.uid()
  and discount_amount >= 0
);

-- downloads
drop policy if exists "Service can insert downloads" on public.downloads;
drop policy if exists "downloads_insert_own" on public.downloads;
create policy "downloads_insert_own"
on public.downloads
for insert
to authenticated
with check (user_id = auth.uid());

-- licenses
drop policy if exists "System can create licenses" on public.licenses;
drop policy if exists "Service can update licenses" on public.licenses;
drop policy if exists "licenses_update_own_activation" on public.licenses;

create policy "licenses_insert_admin_only"
on public.licenses
for insert
to authenticated
with check (public.is_admin());

create policy "licenses_update_own_activation"
on public.licenses
for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

-- notifications
drop policy if exists "System can insert notifications" on public.notifications;
drop policy if exists "notifications_insert_system_or_own" on public.notifications;
create policy "notifications_insert_system_or_own"
on public.notifications
for insert
to authenticated
with check (
  public.is_admin()
  or user_id = auth.uid()
);

-- order_items
drop policy if exists "Anyone can insert order items" on public.order_items;
drop policy if exists "order_items_insert_owner" on public.order_items;
create policy "order_items_insert_owner"
on public.order_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and o.user_id = auth.uid()
      and o.status = 'pending'
  )
);

-- ------------------------------------------------------------
-- 3. Optional cleanup for old seller-era leftovers.
-- Only run these manually if you are 100% sure the tables are no longer used.
-- Advisor still mentioned public.transactions, which looks like old seller logic.
-- ------------------------------------------------------------
-- drop table if exists public.transactions cascade;
-- drop table if exists public.seller_payouts cascade;
-- drop table if exists public.sellers cascade;

-- ------------------------------------------------------------
-- 4. GraphQL exposure notes.
-- Supabase warns because anon/authenticated can see table names in GraphQL.
-- If you do NOT use Supabase GraphQL at all, the cleanest fix is:
--   Dashboard > Integrations/API/GraphQL, disable GraphQL if available.
--
-- Do not blindly run global revoke on products/categories/blog_posts, because
-- the storefront may need public reads through Supabase REST.
--
-- For private tables only, you may later revoke grants table-by-table after
-- confirming the app reads them through server routes:
--   revoke select on public.activity_logs from anon, authenticated;
--   revoke select on public.payments from anon, authenticated;
--   revoke select on public.downloads from anon, authenticated;
--   revoke select on public.product_files from anon, authenticated;
-- ------------------------------------------------------------

-- ------------------------------------------------------------
-- 5. Dashboard-only fix.
-- Leaked password protection cannot be fixed by SQL:
--   Supabase Dashboard > Authentication > Settings > Password Security
--   Enable "Leaked password protection".
-- ------------------------------------------------------------

-- ============================================================
-- END
-- ============================================================
