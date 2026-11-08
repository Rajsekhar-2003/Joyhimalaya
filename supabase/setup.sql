-- Joyhimalaya: ONE-FILE SETUP. Safe to run more than once.
-- Joyhimalaya schema
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role) values (new.id, new.raw_user_meta_data->>'full_name', 'user');
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
$$;

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.treks (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 150),
  slug text not null unique,
  category_id uuid not null references public.categories(id) on delete restrict,
  destination text not null,
  starting_point text,
  ending_point text,
  short_description text,
  description text,
  start_date date not null,
  end_date date not null,
  booking_deadline date,
  duration_days int not null check (duration_days > 0),
  duration_nights int not null check (duration_nights >= 0),
  accommodation text,
  room_sharing text,
  original_price numeric(10,2) check (original_price >= 0),
  discounted_price numeric(10,2) check (discounted_price >= 0),
  price_per_person numeric(10,2) not null check (price_per_person >= 0),
  available_seats int not null default 0 check (available_seats >= 0),
  difficulty text not null default 'moderate' check (difficulty in ('easy','moderate','difficult','extreme')),
  maximum_altitude text,
  transportation text,
  food_facilities text,
  inclusions text,
  exclusions text,
  things_to_carry text,
  instructions text,
  featured_image text,
  is_featured boolean not null default false,
  status text not null default 'draft' check (status in ('upcoming','active','completed','cancelled','draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);
create index if not exists treks_category_idx on public.treks(category_id);
create index if not exists treks_status_start_idx on public.treks(status, start_date);
drop trigger if exists treks_updated on public.treks;
create trigger treks_updated before update on public.treks for each row execute function public.set_updated_at();

create table if not exists public.trek_images (
  id uuid primary key default gen_random_uuid(),
  trek_id uuid not null references public.treks(id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);
create index if not exists trek_images_trek_idx on public.trek_images(trek_id);

create table if not exists public.company_settings (
  id int primary key default 1 check (id = 1),
  company_name text not null default 'Joyhimalaya',
  logo_url text,
  logo_path text,
  description text,
  address text,
  phone text,
  whatsapp text,
  email text,
  website_url text,
  location text,
  social_links jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
drop trigger if exists company_updated on public.company_settings;
create trigger company_updated before update on public.company_settings for each row execute function public.set_updated_at();

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 200),
  phone text check (char_length(phone) <= 30),
  subject text check (char_length(subject) <= 200),
  message text not null check (char_length(message) between 1 and 5000),
  status text not null default 'new' check (status in ('new','read','replied')),
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  trek_id uuid not null references public.treks(id) on delete cascade,
  customer_name text not null check (char_length(customer_name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 200),
  phone text not null check (char_length(phone) between 6 and 30),
  number_of_people int not null check (number_of_people between 1 and 50),
  total_amount numeric(12,2) not null check (total_amount >= 0),
  booking_status text not null default 'pending' check (booking_status in ('pending','confirmed','cancelled')),
  created_at timestamptz not null default now()
);
create index if not exists bookings_trek_idx on public.bookings(trek_id);

insert into public.categories (name, slug, description) values
 ('Upcoming Autumn Trek','autumn','Clear skies and crisp mountain views, September to November.'),
 ('Upcoming Monsoon Trek','monsoon','Green valleys and waterfalls, June to August.'),
 ('Upcoming Spring Trek','spring','Rhododendron blooms and mild weather, March to May.'),
 ('Upcoming Summer Trek','summer','High-altitude passes and alpine meadows, May to June.'),
 ('Upcoming Winter Trek','winter','Snow trails and frozen lakes, December to February.')
on conflict (slug) do nothing;

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.treks enable row level security;
alter table public.trek_images enable row level security;
alter table public.company_settings enable row level security;
alter table public.contact_messages enable row level security;
alter table public.bookings enable row level security;

-- profiles: users can never change their own role
revoke update on public.profiles from anon, authenticated;
grant update (full_name) on public.profiles to authenticated;
drop policy if exists "read own profile or admin" on public.profiles;
create policy "read own profile or admin" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
drop policy if exists "update own name" on public.profiles;
create policy "update own name" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories for select using (true);
drop policy if exists "admin manage categories" on public.categories;
create policy "admin manage categories" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read published treks" on public.treks;
create policy "public read published treks" on public.treks for select using (status in ('upcoming','active','completed'));
drop policy if exists "admin read all treks" on public.treks;
create policy "admin read all treks" on public.treks for select to authenticated using (public.is_admin());
drop policy if exists "admin insert treks" on public.treks;
create policy "admin insert treks" on public.treks for insert to authenticated with check (public.is_admin());
drop policy if exists "admin update treks" on public.treks;
create policy "admin update treks" on public.treks for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin delete treks" on public.treks;
create policy "admin delete treks" on public.treks for delete to authenticated using (public.is_admin());

drop policy if exists "public read images of published treks" on public.trek_images;
create policy "public read images of published treks" on public.trek_images for select
  using (exists (select 1 from public.treks t where t.id = trek_id and t.status in ('upcoming','active','completed')));
drop policy if exists "admin manage trek images" on public.trek_images;
create policy "admin manage trek images" on public.trek_images for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read company" on public.company_settings;
create policy "public read company" on public.company_settings for select using (true);
drop policy if exists "admin insert company" on public.company_settings;
create policy "admin insert company" on public.company_settings for insert to authenticated with check (public.is_admin());
drop policy if exists "admin update company" on public.company_settings;
create policy "admin update company" on public.company_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "anyone can send a message" on public.contact_messages;
create policy "anyone can send a message" on public.contact_messages for insert to anon, authenticated with check (status = 'new');
drop policy if exists "admin read messages" on public.contact_messages;
create policy "admin read messages" on public.contact_messages for select to authenticated using (public.is_admin());
drop policy if exists "admin update messages" on public.contact_messages;
create policy "admin update messages" on public.contact_messages for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin delete messages" on public.contact_messages;
create policy "admin delete messages" on public.contact_messages for delete to authenticated using (public.is_admin());

drop policy if exists "anyone can request booking" on public.bookings;
create policy "anyone can request booking" on public.bookings for insert to anon, authenticated with check (booking_status = 'pending');
drop policy if exists "admin manage bookings" on public.bookings;
create policy "admin manage bookings" on public.bookings for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Storage buckets (public read, admin-only write, type + size limits)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
 ('trek-images','trek-images', true, 5242880, array['image/jpeg','image/png','image/webp']),
 ('company-assets','company-assets', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "admin read site files" on storage.objects;
create policy "admin read site files" on storage.objects for select to authenticated using (bucket_id in ('trek-images','company-assets') and public.is_admin());
drop policy if exists "admin upload site files" on storage.objects;
create policy "admin upload site files" on storage.objects for insert to authenticated with check (bucket_id in ('trek-images','company-assets') and public.is_admin());
drop policy if exists "admin update site files" on storage.objects;
create policy "admin update site files" on storage.objects for update to authenticated using (bucket_id in ('trek-images','company-assets') and public.is_admin());
drop policy if exists "admin delete site files" on storage.objects;
create policy "admin delete site files" on storage.objects for delete to authenticated using (bucket_id in ('trek-images','company-assets') and public.is_admin());

-- Company row
insert into public.company_settings (id, company_name, description, email, social_links)
values (1, 'Joyhimalaya', 'Joyhimalaya organises guided Himalayan treks and tours for beginners and experienced trekkers.', 'info@joyhimalaya.in', '{}'::jsonb)
on conflict (id) do nothing;

-- Create profile rows for users that already exist, then make the owner an admin
insert into public.profiles (id, role) select id, 'user' from auth.users on conflict (id) do nothing;
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'maityrajsekhar210@gmail.com');
