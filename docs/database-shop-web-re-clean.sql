-- ============================================================
-- SHOP WEB RE - CLEAN DATABASE SCHEMA
-- Version: 3.0
-- Last updated: 2026-06-28
-- Purpose: clean backup schema without seller / marketplace logic.
-- Run order: extensions -> helper functions -> tables -> triggers -> indexes -> RLS policies.
-- Notes:
-- - This file is intended for backup / rebuild reference.
-- - It does not include seed data.
-- - Service role bypasses RLS and is used by server routes / webhooks.
-- ============================================================

-- ============================================================
-- 1. EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "unaccent";

create schema if not exists extensions;
create extension if not exists pg_net schema extensions;

-- ============================================================
-- 2. HELPERS
-- ============================================================
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

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.generate_slug(input text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(lower(unaccent(coalesce(input, ''))), '[^a-z0-9]+', '-', 'g'));
$$;

-- ============================================================
-- 3. CORE TABLES
-- ============================================================

-- ------------------------------------------------------------
-- 3.1 profiles
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text not null,
  avatar text,
  cover_image text,
  role text not null default 'user' check (role in ('user', 'admin')),
  is_affiliate boolean not null default false,
  affiliate_code text unique,
  phone text,
  address text,
  profile_text_color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3.2 categories
-- ------------------------------------------------------------
create table if not exists public.categories (
  id serial primary key,
  name text not null,
  slug text unique not null,
  icon text,
  description text,
  parent_id integer references public.categories(id) on delete set null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3.3 products
-- ------------------------------------------------------------
create table if not exists public.products (
  id serial primary key,
  name text not null,
  slug text unique not null,
  description text,
  price numeric(12,2) not null check (price >= 0),
  original_price numeric(12,2) check (original_price is null or original_price >= 0),
  image text not null,
  images text[] not null default '{}',
  format text not null default 'Template' check (format in ('Theme', 'Template', 'Landing', 'MiniApp', 'Bundle', 'Course', 'Ebook')),
  category_id integer references public.categories(id) on delete set null,
  author text not null default 'Shop Web re',
  rating numeric(2,1) not null default 0 check (rating >= 0 and rating <= 5),
  reviews_count integer not null default 0 check (reviews_count >= 0),
  downloads_count integer not null default 0 check (downloads_count >= 0),
  commission_rate numeric(5,2) not null default 10.00 check (commission_rate >= 0 and commission_rate <= 100),
  is_new boolean not null default true,
  is_featured boolean not null default false,
  is_bestseller boolean not null default false,
  status text not null default 'draft' check (status in ('active', 'pending', 'rejected', 'draft')),
  demo_url text,
  file_format text,
  compatibility text,
  tags text[] not null default '{}',
  features text[] not null default '{}',
  tech_stack text[] not null default '{}',
  rejection_reason text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3.4 product_files
-- file_url stores private storage object path, for example:
-- products/15/v1.0.0/Barab_Html.zip
-- ------------------------------------------------------------
create table if not exists public.product_files (
  id serial primary key,
  product_id integer not null references public.products(id) on delete cascade,
  version text not null,
  file_url text not null,
  file_size bigint not null default 0 check (file_size >= 0),
  changelog text,
  is_current boolean not null default true,
  created_at timestamptz not null default now(),
  unique (product_id, version)
);

-- ============================================================
-- 4. PROMOTION / CART / ORDER TABLES
-- ============================================================

-- ------------------------------------------------------------
-- 4.1 coupons
-- ------------------------------------------------------------
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  description text,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(12,2) not null check (discount_value >= 0),
  min_purchase numeric(12,2) not null default 0,
  max_discount numeric(12,2),
  usage_limit integer,
  used_count integer not null default 0,
  start_date timestamptz,
  end_date timestamptz,
  is_active boolean not null default true,
  applicable_products integer[] not null default '{}',
  applicable_categories integer[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 4.2 coupon_usages
-- ------------------------------------------------------------
create table if not exists public.coupon_usages (
  id serial primary key,
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  order_id integer,
  discount_amount numeric(12,2) not null default 0,
  used_at timestamptz not null default now(),
  unique (coupon_id, order_id)
);

-- ------------------------------------------------------------
-- 4.3 carts
-- ------------------------------------------------------------
create table if not exists public.carts (
  id serial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id integer not null references public.products(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  license_type text not null default 'Regular' check (license_type in ('Regular', 'Extended', 'Unlimited')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id, license_type)
);

-- ------------------------------------------------------------
-- 4.4 wishlists
-- ------------------------------------------------------------
create table if not exists public.wishlists (
  id serial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id integer not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ------------------------------------------------------------
-- 4.5 orders
-- ------------------------------------------------------------
create table if not exists public.orders (
  id serial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'completed', 'cancelled', 'refunded')),
  subtotal numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  payment_method text not null default 'bank_transfer',
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  payment_id text,
  payment_content text,
  coupon_code text,
  affiliate_code text,
  note text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 4.6 order_items
-- ------------------------------------------------------------
create table if not exists public.order_items (
  id serial primary key,
  order_id integer not null references public.orders(id) on delete cascade,
  product_id integer not null references public.products(id) on delete restrict,
  product_name text not null,
  product_image text,
  product_format text,
  quantity integer not null default 1 check (quantity > 0),
  price numeric(12,2) not null default 0,
  license_type text not null default 'Regular' check (license_type in ('Regular', 'Extended', 'Unlimited')),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 4.7 payments
-- ------------------------------------------------------------
create table if not exists public.payments (
  id serial primary key,
  order_id integer references public.orders(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  provider text not null default 'sepay',
  amount numeric(12,2) not null default 0,
  currency text not null default 'VND',
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  transaction_id text,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 5. LICENSE / DOWNLOAD TABLES
-- ============================================================

-- ------------------------------------------------------------
-- 5.1 licenses
-- ------------------------------------------------------------
create table if not exists public.licenses (
  id serial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id integer not null references public.products(id) on delete cascade,
  order_id integer references public.orders(id) on delete set null,
  order_item_id integer references public.order_items(id) on delete set null,
  product_name text not null,
  license_key text unique not null,
  type text not null default 'Regular' check (type in ('Regular', 'Extended', 'Unlimited')),
  status text not null default 'active' check (status in ('active', 'expired', 'revoked')),
  activations_used integer not null default 0 check (activations_used >= 0),
  activations_limit integer not null default 1 check (activations_limit >= 0),
  domain text,
  activated_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 5.2 downloads
-- ------------------------------------------------------------
create table if not exists public.downloads (
  id serial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id integer not null references public.products(id) on delete cascade,
  license_id integer references public.licenses(id) on delete set null,
  product_file_id integer references public.product_files(id) on delete set null,
  file_version text,
  ip_address text,
  user_agent text,
  downloaded_at timestamptz not null default now()
);

-- ============================================================
-- 6. AFFILIATE TABLES
-- ============================================================

-- ------------------------------------------------------------
-- 6.1 affiliate_referrals
-- ------------------------------------------------------------
create table if not exists public.affiliate_referrals (
  id serial primary key,
  referrer_id uuid not null references public.profiles(id) on delete cascade,
  referred_id uuid references public.profiles(id) on delete set null,
  referred_name text,
  order_id integer references public.orders(id) on delete set null,
  commission numeric(12,2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'approved', 'paid', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 6.2 affiliate_withdrawals
-- ------------------------------------------------------------
create table if not exists public.affiliate_withdrawals (
  id serial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  method text not null,
  account_info text not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  notes text,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

-- ============================================================
-- 7. CONTENT / COMMUNITY TABLES
-- ============================================================

-- ------------------------------------------------------------
-- 7.1 reviews
-- ------------------------------------------------------------
create table if not exists public.reviews (
  id serial primary key,
  product_id integer not null references public.products(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  images text[] not null default '{}',
  is_approved boolean not null default false,
  is_verified_purchase boolean not null default false,
  reply text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 7.2 tickets
-- ------------------------------------------------------------
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id integer references public.products(id) on delete set null,
  product_name text,
  subject text not null,
  status text not null default 'open' check (status in ('open', 'pending', 'resolved', 'closed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  messages_count integer not null default 0,
  last_reply timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 7.3 ticket_messages
-- ------------------------------------------------------------
create table if not exists public.ticket_messages (
  id serial primary key,
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  sender_name text not null,
  sender_avatar text,
  is_staff boolean not null default false,
  message text not null,
  attachments text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 7.4 blog_posts
-- ------------------------------------------------------------
create table if not exists public.blog_posts (
  id serial primary key,
  title text not null,
  slug text unique not null,
  excerpt text,
  content text not null,
  image text,
  author_id uuid references public.profiles(id) on delete set null,
  category text,
  tags text[] not null default '{}',
  read_time text,
  views integer not null default 0,
  likes integer not null default 0,
  featured boolean not null default false,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 7.5 blog_comments
-- ------------------------------------------------------------
create table if not exists public.blog_comments (
  id serial primary key,
  post_id integer not null references public.blog_posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text,
  content text not null,
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 7.6 community_posts
-- ------------------------------------------------------------
create table if not exists public.community_posts (
  id serial primary key,
  author_id uuid not null references public.profiles(id) on delete cascade,
  author_name text not null,
  author_avatar text,
  title text not null,
  content text not null,
  image text,
  tags text[] not null default '{}',
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 7.7 community_comments
-- ------------------------------------------------------------
create table if not exists public.community_comments (
  id serial primary key,
  post_id integer not null references public.community_posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  author_name text not null,
  author_avatar text,
  content text not null,
  likes_count integer not null default 0,
  parent_id integer references public.community_comments(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 7.8 community_likes
-- ------------------------------------------------------------
create table if not exists public.community_likes (
  id serial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id integer references public.community_posts(id) on delete cascade,
  comment_id integer references public.community_comments(id) on delete cascade,
  created_at timestamptz not null default now(),
  check ((post_id is not null and comment_id is null) or (post_id is null and comment_id is not null))
);

-- ============================================================
-- 8. SYSTEM TABLES
-- ============================================================

-- ------------------------------------------------------------
-- 8.1 notifications
-- ------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  type text not null default 'system',
  title text not null,
  message text not null,
  link text,
  icon text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 8.2 system_announcements
-- ------------------------------------------------------------
create table if not exists public.system_announcements (
  id serial primary key,
  title text not null,
  message text not null,
  type text not null default 'info' check (type in ('info', 'success', 'warning', 'error')),
  link text,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 8.3 activity_logs
-- ------------------------------------------------------------
create table if not exists public.activity_logs (
  id serial primary key,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  entity_name text,
  details text,
  ip_address text,
  severity text not null default 'info' check (severity in ('info', 'warning', 'error', 'success')),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 8.4 site_settings
-- ------------------------------------------------------------
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  is_public boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 9. STORAGE BUCKET REFERENCE
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-files',
  'product-files',
  false,
  52428800,
  array['application/zip', 'application/x-zip-compressed', 'application/octet-stream']::text[]
)
on conflict (id) do nothing;

-- ============================================================
-- 10. BUSINESS FUNCTIONS
-- ============================================================

-- ------------------------------------------------------------
-- 10.1 create profile on auth signup
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, avatar, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(coalesce(new.email, 'User'), '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    'user'
  )
  on conflict (id) do update set
    email = excluded.email,
    name = coalesce(public.profiles.name, excluded.name),
    avatar = coalesce(public.profiles.avatar, excluded.avatar),
    updated_at = now();

  return new;
end;
$$;

-- ------------------------------------------------------------
-- 10.2 prevent normal users from changing role
-- ------------------------------------------------------------
create or replace function public.prevent_profile_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role is distinct from new.role and not public.is_admin() then
    raise exception 'Only admin can change profile role';
  end if;
  return new;
end;
$$;

-- ------------------------------------------------------------
-- 10.3 affiliate code
-- ------------------------------------------------------------
create or replace function public.generate_affiliate_code()
returns trigger
language plpgsql
as $$
begin
  if new.is_affiliate = true and new.affiliate_code is null then
    new.affiliate_code := 'AFF' || upper(substr(replace(new.id::text, '-', ''), 1, 8));
  end if;
  return new;
end;
$$;

-- ------------------------------------------------------------
-- 10.4 product file current version
-- ------------------------------------------------------------
create or replace function public.set_current_product_file()
returns trigger
language plpgsql
as $$
begin
  if new.is_current = true then
    update public.product_files
    set is_current = false
    where product_id = new.product_id
      and id is distinct from new.id;
  end if;
  return new;
end;
$$;

-- ------------------------------------------------------------
-- 10.5 license key generation
-- ------------------------------------------------------------
create or replace function public.generate_license_key()
returns trigger
language plpgsql
as $$
begin
  if new.license_key is null or new.license_key = '' then
    new.license_key := 'SWRE-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4)) || '-' ||
                       upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4)) || '-' ||
                       upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4));
  end if;
  return new;
end;
$$;

-- ------------------------------------------------------------
-- 10.6 create licenses when an order becomes paid/completed
-- ------------------------------------------------------------
create or replace function public.create_licenses_on_order_paid()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  item record;
  activation_limit integer;
begin
  if old.status = new.status then
    return new;
  end if;

  if new.status not in ('paid', 'completed') then
    return new;
  end if;

  for item in
    select *
    from public.order_items
    where order_id = new.id
  loop
    activation_limit := case item.license_type
      when 'Extended' then 3
      when 'Unlimited' then 999
      else 1
    end;

    insert into public.licenses (
      user_id,
      product_id,
      order_id,
      order_item_id,
      product_name,
      license_key,
      type,
      status,
      activations_limit
    )
    values (
      new.user_id,
      item.product_id,
      new.id,
      item.id,
      item.product_name,
      '',
      item.license_type,
      'active',
      activation_limit
    )
    on conflict do nothing;
  end loop;

  return new;
end;
$$;

-- ------------------------------------------------------------
-- 10.7 rating aggregation
-- ------------------------------------------------------------
create or replace function public.update_product_rating()
returns trigger
language plpgsql
as $$
declare
  target_product_id integer;
begin
  target_product_id := coalesce(new.product_id, old.product_id);

  update public.products
  set
    rating = coalesce((select round(avg(rating)::numeric, 1) from public.reviews where product_id = target_product_id and is_approved = true), 0),
    reviews_count = (select count(*) from public.reviews where product_id = target_product_id and is_approved = true),
    updated_at = now()
  where id = target_product_id;

  return coalesce(new, old);
end;
$$;

-- ------------------------------------------------------------
-- 10.8 download counter
-- ------------------------------------------------------------
create or replace function public.increment_product_downloads()
returns trigger
language plpgsql
as $$
begin
  update public.products
  set downloads_count = downloads_count + 1,
      updated_at = now()
  where id = new.product_id;

  return new;
end;
$$;

-- ------------------------------------------------------------
-- 10.9 ticket message counter
-- ------------------------------------------------------------
create or replace function public.update_ticket_on_message()
returns trigger
language plpgsql
as $$
begin
  update public.tickets
  set messages_count = messages_count + 1,
      last_reply = now(),
      updated_at = now()
  where id = new.ticket_id;

  return new;
end;
$$;

-- ------------------------------------------------------------
-- 10.10 community comment counter
-- ------------------------------------------------------------
create or replace function public.update_community_comment_count()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update public.community_posts
    set comments_count = comments_count + 1,
        updated_at = now()
    where id = new.post_id;
    return new;
  end if;

  if tg_op = 'DELETE' then
    update public.community_posts
    set comments_count = greatest(comments_count - 1, 0),
        updated_at = now()
    where id = old.post_id;
    return old;
  end if;

  return null;
end;
$$;

-- ============================================================
-- 11. TRIGGERS
-- ============================================================

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists prevent_profile_role_escalation on public.profiles;
create trigger prevent_profile_role_escalation
before update on public.profiles
for each row execute function public.prevent_profile_role_escalation();

drop trigger if exists auto_generate_affiliate_code on public.profiles;
create trigger auto_generate_affiliate_code
before insert or update on public.profiles
for each row execute function public.generate_affiliate_code();

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists coupons_updated_at on public.coupons;
create trigger coupons_updated_at
before update on public.coupons
for each row execute function public.set_updated_at();

drop trigger if exists carts_updated_at on public.carts;
create trigger carts_updated_at
before update on public.carts
for each row execute function public.set_updated_at();

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists payments_updated_at on public.payments;
create trigger payments_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

drop trigger if exists licenses_updated_at on public.licenses;
create trigger licenses_updated_at
before update on public.licenses
for each row execute function public.set_updated_at();

drop trigger if exists reviews_updated_at on public.reviews;
create trigger reviews_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

drop trigger if exists tickets_updated_at on public.tickets;
create trigger tickets_updated_at
before update on public.tickets
for each row execute function public.set_updated_at();

drop trigger if exists blog_posts_updated_at on public.blog_posts;
create trigger blog_posts_updated_at
before update on public.blog_posts
for each row execute function public.set_updated_at();

drop trigger if exists blog_comments_updated_at on public.blog_comments;
create trigger blog_comments_updated_at
before update on public.blog_comments
for each row execute function public.set_updated_at();

drop trigger if exists community_posts_updated_at on public.community_posts;
create trigger community_posts_updated_at
before update on public.community_posts
for each row execute function public.set_updated_at();

drop trigger if exists system_announcements_updated_at on public.system_announcements;
create trigger system_announcements_updated_at
before update on public.system_announcements
for each row execute function public.set_updated_at();

drop trigger if exists site_settings_updated_at on public.site_settings;
create trigger site_settings_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

drop trigger if exists auto_set_current_product_file on public.product_files;
create trigger auto_set_current_product_file
after insert or update on public.product_files
for each row execute function public.set_current_product_file();

drop trigger if exists auto_generate_license_key on public.licenses;
create trigger auto_generate_license_key
before insert on public.licenses
for each row execute function public.generate_license_key();

drop trigger if exists auto_create_licenses on public.orders;
create trigger auto_create_licenses
after update on public.orders
for each row execute function public.create_licenses_on_order_paid();

drop trigger if exists update_rating_on_review on public.reviews;
create trigger update_rating_on_review
after insert or update or delete on public.reviews
for each row execute function public.update_product_rating();

drop trigger if exists increment_downloads on public.downloads;
create trigger increment_downloads
after insert on public.downloads
for each row execute function public.increment_product_downloads();

drop trigger if exists update_ticket_on_new_message on public.ticket_messages;
create trigger update_ticket_on_new_message
after insert on public.ticket_messages
for each row execute function public.update_ticket_on_message();

drop trigger if exists update_comment_count_insert on public.community_comments;
create trigger update_comment_count_insert
after insert on public.community_comments
for each row execute function public.update_community_comment_count();

drop trigger if exists update_comment_count_delete on public.community_comments;
create trigger update_comment_count_delete
after delete on public.community_comments
for each row execute function public.update_community_comment_count();

-- ============================================================
-- 12. INDEXES
-- ============================================================
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_affiliate on public.profiles(is_affiliate);
create index if not exists idx_categories_slug on public.categories(slug);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_featured on public.products(is_featured);
create index if not exists idx_products_bestseller on public.products(is_bestseller);
create index if not exists idx_products_tags on public.products using gin(tags);
create index if not exists idx_products_tech_stack on public.products using gin(tech_stack);
create index if not exists idx_product_files_product on public.product_files(product_id);
create index if not exists idx_product_files_current on public.product_files(product_id, is_current);
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_payment_id on public.orders(payment_id);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_order_items_product on public.order_items(product_id);
create index if not exists idx_licenses_user on public.licenses(user_id);
create index if not exists idx_licenses_product on public.licenses(product_id);
create index if not exists idx_licenses_key on public.licenses(license_key);
create index if not exists idx_downloads_user on public.downloads(user_id);
create index if not exists idx_downloads_product on public.downloads(product_id);
create index if not exists idx_reviews_product on public.reviews(product_id);
create index if not exists idx_reviews_user on public.reviews(user_id);
create index if not exists idx_tickets_user on public.tickets(user_id);
create index if not exists idx_ticket_messages_ticket on public.ticket_messages(ticket_id);
create index if not exists idx_affiliate_referrals_referrer on public.affiliate_referrals(referrer_id);
create index if not exists idx_blog_posts_slug on public.blog_posts(slug);
create index if not exists idx_blog_posts_published on public.blog_posts(is_published, published_at);
create index if not exists idx_blog_comments_post on public.blog_comments(post_id);
create index if not exists idx_community_posts_author on public.community_posts(author_id);
create index if not exists idx_community_comments_post on public.community_comments(post_id);
create index if not exists idx_notifications_user on public.notifications(user_id, is_read);
create index if not exists idx_activity_logs_user on public.activity_logs(user_id);
create index if not exists idx_activity_logs_created on public.activity_logs(created_at desc);
create index if not exists idx_carts_user on public.carts(user_id);
create index if not exists idx_wishlists_user on public.wishlists(user_id);
create index if not exists idx_payments_order on public.payments(order_id);

-- ============================================================
-- 13. RLS ENABLE
-- ============================================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_files enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_usages enable row level security;
alter table public.carts enable row level security;
alter table public.wishlists enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.licenses enable row level security;
alter table public.downloads enable row level security;
alter table public.affiliate_referrals enable row level security;
alter table public.affiliate_withdrawals enable row level security;
alter table public.reviews enable row level security;
alter table public.tickets enable row level security;
alter table public.ticket_messages enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_comments enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;
alter table public.community_likes enable row level security;
alter table public.notifications enable row level security;
alter table public.system_announcements enable row level security;
alter table public.activity_logs enable row level security;
alter table public.site_settings enable row level security;

-- ============================================================
-- 14. RLS POLICIES
-- ============================================================

-- ------------------------------------------------------------
-- 14.1 profiles
-- ------------------------------------------------------------
drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public"
on public.profiles for select
using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "profiles_update_own_basic" on public.profiles;
create policy "profiles_update_own_basic"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all"
on public.profiles for all
using (public.is_admin())
with check (public.is_admin());

-- ------------------------------------------------------------
-- 14.2 categories
-- ------------------------------------------------------------
drop policy if exists "categories_select_public" on public.categories;
create policy "categories_select_public"
on public.categories for select
using (true);

drop policy if exists "categories_admin_all" on public.categories;
create policy "categories_admin_all"
on public.categories for all
using (public.is_admin())
with check (public.is_admin());

-- ------------------------------------------------------------
-- 14.3 products
-- ------------------------------------------------------------
drop policy if exists "products_select_active_public" on public.products;
create policy "products_select_active_public"
on public.products for select
using (status = 'active' or public.is_admin());

drop policy if exists "products_admin_all" on public.products;
create policy "products_admin_all"
on public.products for all
using (public.is_admin())
with check (public.is_admin());

-- ------------------------------------------------------------
-- 14.4 product_files
-- Public users should not receive file paths directly.
-- App download API uses service role and signed storage URLs.
-- ------------------------------------------------------------
drop policy if exists "product_files_admin_all" on public.product_files;
create policy "product_files_admin_all"
on public.product_files for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "product_files_owner_select_after_purchase" on public.product_files;
create policy "product_files_owner_select_after_purchase"
on public.product_files for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.licenses l
    where l.product_id = product_files.product_id
      and l.user_id = auth.uid()
      and l.status = 'active'
  )
);

-- ------------------------------------------------------------
-- 14.5 coupons / coupon_usages
-- ------------------------------------------------------------
drop policy if exists "coupons_select_active_public" on public.coupons;
create policy "coupons_select_active_public"
on public.coupons for select
using (is_active = true or public.is_admin());

drop policy if exists "coupons_admin_all" on public.coupons;
create policy "coupons_admin_all"
on public.coupons for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "coupon_usages_select_own" on public.coupon_usages;
create policy "coupon_usages_select_own"
on public.coupon_usages for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "coupon_usages_insert_authenticated" on public.coupon_usages;
create policy "coupon_usages_insert_authenticated"
on public.coupon_usages for insert
with check (auth.role() = 'authenticated');

drop policy if exists "coupon_usages_admin_all" on public.coupon_usages;
create policy "coupon_usages_admin_all"
on public.coupon_usages for all
using (public.is_admin())
with check (public.is_admin());

-- ------------------------------------------------------------
-- 14.6 carts / wishlists
-- ------------------------------------------------------------
drop policy if exists "carts_select_own" on public.carts;
create policy "carts_select_own"
on public.carts for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "carts_insert_own" on public.carts;
create policy "carts_insert_own"
on public.carts for insert
with check (auth.uid() = user_id);

drop policy if exists "carts_update_own" on public.carts;
create policy "carts_update_own"
on public.carts for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "carts_delete_own" on public.carts;
create policy "carts_delete_own"
on public.carts for delete
using (auth.uid() = user_id);

drop policy if exists "wishlists_select_own" on public.wishlists;
create policy "wishlists_select_own"
on public.wishlists for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "wishlists_insert_own" on public.wishlists;
create policy "wishlists_insert_own"
on public.wishlists for insert
with check (auth.uid() = user_id);

drop policy if exists "wishlists_delete_own" on public.wishlists;
create policy "wishlists_delete_own"
on public.wishlists for delete
using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 14.7 orders / order_items / payments
-- ------------------------------------------------------------
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
on public.orders for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own"
on public.orders for insert
with check (auth.uid() = user_id);

drop policy if exists "orders_update_own_pending" on public.orders;
create policy "orders_update_own_pending"
on public.orders for update
using (auth.uid() = user_id and status = 'pending')
with check (auth.uid() = user_id);

drop policy if exists "orders_admin_all" on public.orders;
create policy "orders_admin_all"
on public.orders for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "order_items_select_owner" on public.order_items;
create policy "order_items_select_owner"
on public.order_items for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and o.user_id = auth.uid()
  )
);

drop policy if exists "order_items_insert_owner" on public.order_items;
create policy "order_items_insert_owner"
on public.order_items for insert
with check (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and o.user_id = auth.uid()
      and o.status = 'pending'
  )
);

drop policy if exists "order_items_admin_all" on public.order_items;
create policy "order_items_admin_all"
on public.order_items for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own"
on public.payments for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "payments_admin_all" on public.payments;
create policy "payments_admin_all"
on public.payments for all
using (public.is_admin())
with check (public.is_admin());

-- ------------------------------------------------------------
-- 14.8 licenses / downloads
-- ------------------------------------------------------------
drop policy if exists "licenses_select_own" on public.licenses;
create policy "licenses_select_own"
on public.licenses for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "licenses_update_own_activation" on public.licenses;
create policy "licenses_update_own_activation"
on public.licenses for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "licenses_admin_all" on public.licenses;
create policy "licenses_admin_all"
on public.licenses for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "downloads_select_own" on public.downloads;
create policy "downloads_select_own"
on public.downloads for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "downloads_insert_own" on public.downloads;
create policy "downloads_insert_own"
on public.downloads for insert
with check (auth.uid() = user_id);

drop policy if exists "downloads_admin_all" on public.downloads;
create policy "downloads_admin_all"
on public.downloads for all
using (public.is_admin())
with check (public.is_admin());

-- ------------------------------------------------------------
-- 14.9 affiliate
-- ------------------------------------------------------------
drop policy if exists "affiliate_referrals_select_own" on public.affiliate_referrals;
create policy "affiliate_referrals_select_own"
on public.affiliate_referrals for select
using (auth.uid() = referrer_id or public.is_admin());

drop policy if exists "affiliate_referrals_insert_authenticated" on public.affiliate_referrals;
create policy "affiliate_referrals_insert_authenticated"
on public.affiliate_referrals for insert
with check (auth.role() = 'authenticated');

drop policy if exists "affiliate_referrals_admin_all" on public.affiliate_referrals;
create policy "affiliate_referrals_admin_all"
on public.affiliate_referrals for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "affiliate_withdrawals_select_own" on public.affiliate_withdrawals;
create policy "affiliate_withdrawals_select_own"
on public.affiliate_withdrawals for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "affiliate_withdrawals_insert_own" on public.affiliate_withdrawals;
create policy "affiliate_withdrawals_insert_own"
on public.affiliate_withdrawals for insert
with check (auth.uid() = user_id);

drop policy if exists "affiliate_withdrawals_admin_all" on public.affiliate_withdrawals;
create policy "affiliate_withdrawals_admin_all"
on public.affiliate_withdrawals for all
using (public.is_admin())
with check (public.is_admin());

-- ------------------------------------------------------------
-- 14.10 reviews / tickets
-- ------------------------------------------------------------
drop policy if exists "reviews_select_approved_public" on public.reviews;
create policy "reviews_select_approved_public"
on public.reviews for select
using (is_approved = true or auth.uid() = user_id or public.is_admin());

drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own"
on public.reviews for insert
with check (auth.uid() = user_id);

drop policy if exists "reviews_update_own" on public.reviews;
create policy "reviews_update_own"
on public.reviews for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "reviews_delete_own" on public.reviews;
create policy "reviews_delete_own"
on public.reviews for delete
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "reviews_admin_all" on public.reviews;
create policy "reviews_admin_all"
on public.reviews for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "tickets_select_own" on public.tickets;
create policy "tickets_select_own"
on public.tickets for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "tickets_insert_own" on public.tickets;
create policy "tickets_insert_own"
on public.tickets for insert
with check (auth.uid() = user_id);

drop policy if exists "tickets_update_own" on public.tickets;
create policy "tickets_update_own"
on public.tickets for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "tickets_admin_all" on public.tickets;
create policy "tickets_admin_all"
on public.tickets for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "ticket_messages_select_related" on public.ticket_messages;
create policy "ticket_messages_select_related"
on public.ticket_messages for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.tickets t
    where t.id = ticket_messages.ticket_id
      and t.user_id = auth.uid()
  )
);

drop policy if exists "ticket_messages_insert_related" on public.ticket_messages;
create policy "ticket_messages_insert_related"
on public.ticket_messages for insert
with check (
  public.is_admin()
  or exists (
    select 1
    from public.tickets t
    where t.id = ticket_messages.ticket_id
      and t.user_id = auth.uid()
  )
);

drop policy if exists "ticket_messages_admin_all" on public.ticket_messages;
create policy "ticket_messages_admin_all"
on public.ticket_messages for all
using (public.is_admin())
with check (public.is_admin());

-- ------------------------------------------------------------
-- 14.11 blog / community
-- ------------------------------------------------------------
drop policy if exists "blog_posts_select_public" on public.blog_posts;
create policy "blog_posts_select_public"
on public.blog_posts for select
using (is_published = true or public.is_admin());

drop policy if exists "blog_posts_admin_all" on public.blog_posts;
create policy "blog_posts_admin_all"
on public.blog_posts for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "blog_comments_select_approved" on public.blog_comments;
create policy "blog_comments_select_approved"
on public.blog_comments for select
using (is_approved = true or public.is_admin());

drop policy if exists "blog_comments_insert_public" on public.blog_comments;
create policy "blog_comments_insert_public_valid"
on public.blog_comments for insert
with check (
  length(trim(name)) between 2 and 120
  and length(trim(content)) between 3 and 5000
  and (email is null or email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$')
  and is_approved = false
);

drop policy if exists "blog_comments_update_own" on public.blog_comments;
create policy "blog_comments_update_own"
on public.blog_comments for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "blog_comments_admin_all" on public.blog_comments;
create policy "blog_comments_admin_all"
on public.blog_comments for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "community_posts_select_public" on public.community_posts;
create policy "community_posts_select_public"
on public.community_posts for select
using (true);

drop policy if exists "community_posts_insert_own" on public.community_posts;
create policy "community_posts_insert_own"
on public.community_posts for insert
with check (auth.uid() = author_id);

drop policy if exists "community_posts_update_own" on public.community_posts;
create policy "community_posts_update_own"
on public.community_posts for update
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

drop policy if exists "community_posts_delete_own" on public.community_posts;
create policy "community_posts_delete_own"
on public.community_posts for delete
using (auth.uid() = author_id or public.is_admin());

drop policy if exists "community_posts_admin_all" on public.community_posts;
create policy "community_posts_admin_all"
on public.community_posts for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "community_comments_select_public" on public.community_comments;
create policy "community_comments_select_public"
on public.community_comments for select
using (true);

drop policy if exists "community_comments_insert_own" on public.community_comments;
create policy "community_comments_insert_own"
on public.community_comments for insert
with check (auth.uid() = author_id);

drop policy if exists "community_comments_update_own" on public.community_comments;
create policy "community_comments_update_own"
on public.community_comments for update
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

drop policy if exists "community_comments_delete_own" on public.community_comments;
create policy "community_comments_delete_own"
on public.community_comments for delete
using (auth.uid() = author_id or public.is_admin());

drop policy if exists "community_likes_select_public" on public.community_likes;
create policy "community_likes_select_public"
on public.community_likes for select
using (true);

drop policy if exists "community_likes_insert_own" on public.community_likes;
create policy "community_likes_insert_own"
on public.community_likes for insert
with check (auth.uid() = user_id);

drop policy if exists "community_likes_delete_own" on public.community_likes;
create policy "community_likes_delete_own"
on public.community_likes for delete
using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 14.12 system tables
-- ------------------------------------------------------------
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
on public.notifications for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
on public.notifications for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "notifications_delete_own" on public.notifications;
create policy "notifications_delete_own"
on public.notifications for delete
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "notifications_admin_all" on public.notifications;
create policy "notifications_admin_all"
on public.notifications for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "announcements_select_active_public" on public.system_announcements;
create policy "announcements_select_active_public"
on public.system_announcements for select
using (
  (
    is_active = true
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  )
  or public.is_admin()
);

drop policy if exists "announcements_admin_all" on public.system_announcements;
create policy "announcements_admin_all"
on public.system_announcements for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "activity_logs_insert_authenticated" on public.activity_logs;
create policy "activity_logs_insert_authenticated"
on public.activity_logs for insert
with check (auth.role() = 'authenticated' or public.is_admin());

drop policy if exists "activity_logs_admin_select" on public.activity_logs;
create policy "activity_logs_admin_select"
on public.activity_logs for select
using (public.is_admin());

drop policy if exists "activity_logs_admin_delete" on public.activity_logs;
create policy "activity_logs_admin_delete"
on public.activity_logs for delete
using (public.is_admin());

drop policy if exists "site_settings_select_public" on public.site_settings;
create policy "site_settings_select_public"
on public.site_settings for select
using (is_public = true or public.is_admin());

drop policy if exists "site_settings_admin_all" on public.site_settings;
create policy "site_settings_admin_all"
on public.site_settings for all
using (public.is_admin())
with check (public.is_admin());

-- ------------------------------------------------------------
-- 14.13 storage.objects for private product-files bucket
-- Admin can manage files. Users never read objects directly from RLS;
-- server creates short-lived signed URLs after purchase/license checks.
-- ------------------------------------------------------------
drop policy if exists "product_files_storage_admin_all" on storage.objects;
create policy "product_files_storage_admin_all"
on storage.objects for all
using (bucket_id = 'product-files' and public.is_admin())
with check (bucket_id = 'product-files' and public.is_admin());

-- ============================================================
-- END
-- ============================================================
