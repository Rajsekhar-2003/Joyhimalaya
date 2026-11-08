# Joyhimalaya – Tour & Trekking website (joyhimalaya.in)

React + Vite + Tailwind frontend talking directly to Supabase (Postgres, Auth, Storage, RLS). No separate backend.

## 1. Supabase setup
1. Create a project at supabase.com.
2. SQL Editor → run `supabase/setup.sql` (one file, safe to re-run; it also makes the owner admin).
   (002 also creates the `trek-images` and `company-assets` buckets: public read, admin-only write, JPG/PNG/WebP, 5 MB / 2 MB limits.)
3. Authentication → Providers → Email: **turn off "Allow new users to sign up"** (admins are created manually).
4. Project Settings → API: copy the Project URL and the **publishable (anon) key**. Never use the service-role/secret key in this app.

## 2. Create the first admin
1. Authentication → Users → **Add user** (email + password, tick auto-confirm).
2. SQL Editor:
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'you@example.com');
   ```
Users can never change their own role (column-level grant + RLS). Log in at `/admin/login`.

## 3. Run locally
```bash
cp .env.example .env   # fill in values
npm install
npm run dev
```

## 4. Deploy on Coolify (Docker)
1. Push to Git, create a Coolify app from the repo with **Dockerfile** build pack, port 80.
2. Set **build arguments** (Vite bakes them at build time): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SITE_URL=https://joyhimalaya.in`.
3. Attach domain `joyhimalaya.in` (+ `www` redirect) with HTTPS.
Vercel also works: Vite preset, same three env vars, add a rewrite of `/(.*)` → `/index.html`.

## 5. SEO
- Per-page title, description, canonical, Open Graph, Twitter Card (`components/common/Seo.jsx`).
- JSON-LD: `TravelAgency` (home), `Product` + `TouristTrip` + `BreadcrumbList` (each trek).
- `public/robots.txt` (admin blocked) and `sitemap.xml` generated from the database on every build (`scripts/generate-sitemap.mjs`).
  New treks appear in the sitemap after the next build/redeploy: trigger a Coolify redeploy (webhook or schedule) weekly or after adding treks.
- Submit `https://joyhimalaya.in/sitemap.xml` in Google Search Console.
- Googlebot renders this client-side app. For stronger indexing of trek pages, add a prerender step (e.g. Prerender.io or `vite-react-ssg`) later.

## 6. How data flows
Admin edits → Supabase Postgres → public pages read it live. No redeploy needed for content changes (only the sitemap refreshes on build).
Pricing: price shown = `discounted_price` if set, otherwise `price_per_person`; `original_price` is shown struck through when higher.
Draft and cancelled treks are hidden by RLS. Deleting a trek also removes its images from Storage.
