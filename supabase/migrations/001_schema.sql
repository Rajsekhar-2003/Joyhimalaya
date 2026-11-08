-- Joyhimalaya schema
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role) values (new.id, new.raw_user_meta_data->>'full_name', 'user');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
$$;

create function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table public.treks (
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
create index treks_category_idx on public.treks(category_id);
create index treks_status_start_idx on public.treks(status, start_date);
create trigger treks_updated before update on public.treks for each row execute function public.set_updated_at();

create table public.trek_images (
  id uuid primary key default gen_random_uuid(),
  trek_id uuid not null references public.treks(id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);
create index trek_images_trek_idx on public.trek_images(trek_id);

create table public.company_settings (
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
create trigger company_updated before update on public.company_settings for each row execute function public.set_updated_at();

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 200),
  phone text check (char_length(phone) <= 30),
  subject text check (char_length(subject) <= 200),
  message text not null check (char_length(message) between 1 and 5000),
  status text not null default 'new' check (status in ('new','read','replied')),
  created_at timestamptz not null default now()
);

create table public.bookings (
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
create index bookings_trek_idx on public.bookings(trek_id);

insert into public.categories (name, slug, description) values
 ('Upcoming Autumn Trek','autumn','Clear skies and crisp mountain views, September to November.'),
 ('Upcoming Monsoon Trek','monsoon','Green valleys and waterfalls, June to August.'),
 ('Upcoming Spring Trek','spring','Rhododendron blooms and mild weather, March to May.'),
 ('Upcoming Summer Trek','summer','High-altitude passes and alpine meadows, May to June.'),
 ('Upcoming Winter Trek','winter','Snow trails and frozen lakes, December to February.');
