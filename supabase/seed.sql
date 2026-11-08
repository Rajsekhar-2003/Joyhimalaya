-- Run after migrations. Edit all values later in Admin > Company Settings.
insert into public.company_settings (id, company_name, description, email, social_links)
values (1, 'Joyhimalaya', 'Joyhimalaya organises guided Himalayan treks and tours for beginners and experienced trekkers.', 'info@joyhimalaya.in', '{}'::jsonb)
on conflict (id) do nothing;

-- Make your admin. Run this AFTER creating the user in Supabase Dashboard > Authentication > Users.
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'maityrajsekhar210@gmail.com');
