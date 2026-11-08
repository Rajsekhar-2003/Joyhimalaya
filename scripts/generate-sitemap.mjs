// Generates public/sitemap.xml from the live Supabase database at build time.
import fs from 'fs';
const env = { ...process.env };
if (fs.existsSync('.env')) for (const l of fs.readFileSync('.env', 'utf8').split('\n')) {
  const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/); if (m && !env[m[1]]) env[m[1]] = m[2];
}
const site = (env.VITE_SITE_URL || 'https://joyhimalaya.in').replace(/\/$/, '');
const paths = ['', '/treks', '/about', '/contact', '/privacy-policy', '/terms', '/cancellation-policy',
  ...['autumn', 'monsoon', 'spring', 'summer', 'winter'].map((s) => `/treks/season/${s}`)];
let treks = [];
try {
  const r = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/treks?select=slug,updated_at&status=in.(upcoming,active,completed)`,
    { headers: { apikey: (env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY) } });
  if (r.ok) treks = await r.json(); else console.warn('sitemap: could not read treks', r.status);
} catch (e) { console.warn('sitemap: skipped trek URLs', e.message); }
const url = (loc, lastmod, p = '0.7') => `  <url><loc>${site}${loc}</loc>${lastmod ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>` : ''}<priority>${p}</priority></url>`;
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[
  ...paths.map((p) => url(p, null, p === '' ? '1.0' : '0.6')),
  ...treks.map((t) => url(`/treks/${t.slug}`, t.updated_at, '0.9')),
].join('\n')}\n</urlset>\n`;
fs.writeFileSync('public/sitemap.xml', xml);
console.log(`sitemap.xml written (${paths.length + treks.length} URLs)`);
