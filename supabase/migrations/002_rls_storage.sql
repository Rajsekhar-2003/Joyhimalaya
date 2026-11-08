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
create policy "read own profile or admin" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "update own name" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "public read categories" on public.categories for select using (true);
create policy "admin manage categories" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public read published treks" on public.treks for select using (status in ('upcoming','active','completed'));
create policy "admin read all treks" on public.treks for select to authenticated using (public.is_admin());
create policy "admin insert treks" on public.treks for insert to authenticated with check (public.is_admin());
create policy "admin update treks" on public.treks for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete treks" on public.treks for delete to authenticated using (public.is_admin());

create policy "public read images of published treks" on public.trek_images for select
  using (exists (select 1 from public.treks t where t.id = trek_id and t.status in ('upcoming','active','completed')));
create policy "admin manage trek images" on public.trek_images for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public read company" on public.company_settings for select using (true);
create policy "admin insert company" on public.company_settings for insert to authenticated with check (public.is_admin());
create policy "admin update company" on public.company_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "anyone can send a message" on public.contact_messages for insert to anon, authenticated with check (status = 'new');
create policy "admin read messages" on public.contact_messages for select to authenticated using (public.is_admin());
create policy "admin update messages" on public.contact_messages for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete messages" on public.contact_messages for delete to authenticated using (public.is_admin());

create policy "anyone can request booking" on public.bookings for insert to anon, authenticated with check (booking_status = 'pending');
create policy "admin manage bookings" on public.bookings for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Storage buckets (public read, admin-only write, type + size limits)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
 ('trek-images','trek-images', true, 5242880, array['image/jpeg','image/png','image/webp']),
 ('company-assets','company-assets', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "admin read site files" on storage.objects for select to authenticated using (bucket_id in ('trek-images','company-assets') and public.is_admin());
create policy "admin upload site files" on storage.objects for insert to authenticated with check (bucket_id in ('trek-images','company-assets') and public.is_admin());
create policy "admin update site files" on storage.objects for update to authenticated using (bucket_id in ('trek-images','company-assets') and public.is_admin());
create policy "admin delete site files" on storage.objects for delete to authenticated using (bucket_id in ('trek-images','company-assets') and public.is_admin());
