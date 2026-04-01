-- ==========================================
-- まるぱか Supabase Schema
-- ==========================================

-- Products table
create table if not exists public.products (
  id bigint primary key,
  name text not null,
  price integer not null,
  release_month text not null,
  genre text not null,
  maker text not null,
  lineup integer not null default 5,
  description text not null default '',
  is_new boolean not null default false,
  image_url text not null default '',
  created_at timestamptz not null default now()
);

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  avatar_url text,
  onboarding_done boolean not null default false,
  gender text,
  age_group text
);

-- User interests (favorites)
create table if not exists public.user_interests (
  user_id uuid not null references auth.users on delete cascade,
  product_id bigint not null references public.products on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- User purchases
create table if not exists public.user_purchases (
  user_id uuid not null references auth.users on delete cascade,
  product_id bigint not null references public.products on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- Product stats (denormalized counts for ranking)
create table if not exists public.product_stats (
  product_id bigint primary key references public.products on delete cascade,
  interest_count integer not null default 0,
  purchased_count integer not null default 0
);

-- Articles
create table if not exists public.articles (
  id text primary key,
  title text not null,
  tag text not null default '',
  lede text not null default '',
  cover_product_id bigint references public.products,
  blocks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- ==========================================
-- Indexes
-- ==========================================
create index if not exists idx_products_genre on public.products (genre);
create index if not exists idx_products_maker on public.products (maker);
create index if not exists idx_products_release_month on public.products (release_month);
create index if not exists idx_products_price on public.products (price);
create index if not exists idx_user_interests_user on public.user_interests (user_id);
create index if not exists idx_user_purchases_user on public.user_purchases (user_id);
create index if not exists idx_product_stats_interest on public.product_stats (interest_count desc);

-- ==========================================
-- RLS Policies
-- ==========================================
alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.user_interests enable row level security;
alter table public.user_purchases enable row level security;
alter table public.product_stats enable row level security;
alter table public.articles enable row level security;

-- Products: public read
create policy "Products are viewable by everyone"
  on public.products for select using (true);

-- Profiles: public read, self update
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- User interests: self only
create policy "Users can view own interests"
  on public.user_interests for select using (auth.uid() = user_id);

create policy "Users can insert own interests"
  on public.user_interests for insert with check (auth.uid() = user_id);

create policy "Users can delete own interests"
  on public.user_interests for delete using (auth.uid() = user_id);

-- User purchases: self only
create policy "Users can view own purchases"
  on public.user_purchases for select using (auth.uid() = user_id);

create policy "Users can insert own purchases"
  on public.user_purchases for insert with check (auth.uid() = user_id);

-- Product stats: public read
create policy "Product stats are viewable by everyone"
  on public.product_stats for select using (true);

-- Articles: public read
create policy "Articles are viewable by everyone"
  on public.articles for select using (true);

-- ==========================================
-- Triggers: auto-update product_stats
-- ==========================================

-- Ensure product_stats row exists
create or replace function public.ensure_product_stats()
returns trigger as $$
begin
  insert into public.product_stats (product_id, interest_count, purchased_count)
  values (NEW.product_id, 0, 0)
  on conflict (product_id) do nothing;
  return NEW;
end;
$$ language plpgsql security definer;

-- Increment interest count
create or replace function public.increment_interest()
returns trigger as $$
begin
  update public.product_stats
  set interest_count = interest_count + 1
  where product_id = NEW.product_id;
  return NEW;
end;
$$ language plpgsql security definer;

-- Decrement interest count
create or replace function public.decrement_interest()
returns trigger as $$
begin
  update public.product_stats
  set interest_count = greatest(0, interest_count - 1)
  where product_id = OLD.product_id;
  return OLD;
end;
$$ language plpgsql security definer;

-- Increment purchased count
create or replace function public.increment_purchased()
returns trigger as $$
begin
  update public.product_stats
  set purchased_count = purchased_count + 1
  where product_id = NEW.product_id;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_interest_ensure_stats
  before insert on public.user_interests
  for each row execute function public.ensure_product_stats();

create trigger on_interest_insert
  after insert on public.user_interests
  for each row execute function public.increment_interest();

create trigger on_interest_delete
  after delete on public.user_interests
  for each row execute function public.decrement_interest();

create trigger on_purchase_ensure_stats
  before insert on public.user_purchases
  for each row execute function public.ensure_product_stats();

create trigger on_purchase_insert
  after insert on public.user_purchases
  for each row execute function public.increment_purchased();

-- ==========================================
-- Auto-create profile on signup
-- ==========================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url, onboarding_done)
  values (
    NEW.id,
    coalesce(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    false
  );
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
