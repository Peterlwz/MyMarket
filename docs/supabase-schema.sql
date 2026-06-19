-- Nest Market / 卖东西应用
-- Supabase Backend MVP schema for Auth + listings + listing_images + favorites.
-- Run this in the Supabase SQL editor after creating a Supabase project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) not null,
  type text not null check (type in ('product', 'rent')),
  title text not null,
  description text,
  category text,
  price numeric,
  monthly_rent numeric,
  condition text,
  location text,
  area text,
  room_type text,
  available_date text,
  lease_term text,
  status text not null default 'active' check (status in ('active', 'reserved', 'sold', 'removed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete cascade,
  image_url text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists public.favorites (
  user_id uuid references auth.users(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, listing_id)
);

create index if not exists listings_status_created_at_idx on public.listings(status, created_at desc);
create index if not exists listings_owner_created_at_idx on public.listings(owner_id, created_at desc);
create index if not exists listing_images_listing_sort_idx on public.listing_images(listing_id, sort_order);
create index if not exists favorites_user_created_at_idx on public.favorites(user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists listings_set_updated_at on public.listings;
create trigger listings_set_updated_at
before update on public.listings
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.favorites enable row level security;

drop policy if exists "Profiles are readable" on public.profiles;
create policy "Profiles are readable"
on public.profiles for select
using (true);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Public can read visible listings and owners can read own listings" on public.listings;
create policy "Public can read visible listings and owners can read own listings"
on public.listings for select
using (
  status in ('active', 'reserved', 'sold')
  or owner_id = auth.uid()
);

drop policy if exists "Authenticated users can create own listings" on public.listings;
create policy "Authenticated users can create own listings"
on public.listings for insert
with check (auth.uid() = owner_id);

drop policy if exists "Users can update own listings" on public.listings;
create policy "Users can update own listings"
on public.listings for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Users can delete own listings" on public.listings;
create policy "Users can delete own listings"
on public.listings for delete
using (auth.uid() = owner_id);

drop policy if exists "Public can read visible listing images and owners can read own listing images" on public.listing_images;
create policy "Public can read visible listing images and owners can read own listing images"
on public.listing_images for select
using (
  exists (
    select 1
    from public.listings
    where listings.id = listing_images.listing_id
      and (
        listings.status in ('active', 'reserved', 'sold')
        or listings.owner_id = auth.uid()
      )
  )
);

drop policy if exists "Users can insert images for own listings" on public.listing_images;
create policy "Users can insert images for own listings"
on public.listing_images for insert
with check (
  exists (
    select 1
    from public.listings
    where listings.id = listing_images.listing_id
      and listings.owner_id = auth.uid()
  )
);

drop policy if exists "Users can delete images for own listings" on public.listing_images;
create policy "Users can delete images for own listings"
on public.listing_images for delete
using (
  exists (
    select 1
    from public.listings
    where listings.id = listing_images.listing_id
      and listings.owner_id = auth.uid()
  )
);

drop policy if exists "Users can read own favorites" on public.favorites;
create policy "Users can read own favorites"
on public.favorites for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own favorites" on public.favorites;
create policy "Users can insert own favorites"
on public.favorites for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own favorites" on public.favorites;
create policy "Users can delete own favorites"
on public.favorites for delete
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public can read listing image files" on storage.objects;
create policy "Public can read listing image files"
on storage.objects for select
using (bucket_id = 'listing-images');

drop policy if exists "Users can upload own listing image files" on storage.objects;
create policy "Users can upload own listing image files"
on storage.objects for insert
with check (
  bucket_id = 'listing-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can update own listing image files" on storage.objects;
create policy "Users can update own listing image files"
on storage.objects for update
using (
  bucket_id = 'listing-images'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'listing-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can delete own listing image files" on storage.objects;
create policy "Users can delete own listing image files"
on storage.objects for delete
using (
  bucket_id = 'listing-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);
