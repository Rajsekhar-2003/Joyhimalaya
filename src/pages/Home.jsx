import { Link } from 'react-router-dom';
import { ArrowRight, Compass, ShieldCheck, Users, HeartHandshake, MessageCircle } from 'lucide-react';
import Seo, { SITE } from '../components/common/Seo';
import Mountains from '../components/common/Mountains';
import TrekCard from '../components/trek/TrekCard';
import { CardSkeleton, Empty, ErrorBox } from '../components/common/ui';
import { useAsync } from '../hooks/useAsync';
import { useCompany } from '../hooks/useCompany';
import { trekService } from '../services/trekService';
import { waLink } from '../utils/format';

const why = [
  [Compass, 'Local route knowledge', 'Our trek leaders walk these trails every season and know the weather, water and campsites.'],
  [ShieldCheck, 'Safety first', 'Trained guides, first-aid kits and clear turn-around rules on every departure.'],
  [Users, 'Small groups', 'Limited seats per batch so you get attention from the team and room on the trail.'],
  [HeartHandshake, 'Fair, clear pricing', 'Inclusions and exclusions are listed on every trek page before you book.'],
];

export default function Home() {
  const c = useCompany() || {};
  const upcoming = useAsync(() => trekService.list({ upcoming: true, pageSize: 6 }), []);
  const featured = useAsync(() => trekService.list({ upcoming: true, featured: true, pageSize: 3 }), []);
  const cats = useAsync(() => trekService.categories(), []);
  const dests = [...new Map((upcoming.data?.rows || []).map((t) => [t.destination, t])).values()].slice(0, 4);
  const jsonLd = { '@context': 'https://schema.org', '@type': 'TravelAgency', name: 'Joyhimalaya', url: SITE, logo: c.logo_url, description: c.description,
    telephone: c.phone, email: c.email, address: c.address, sameAs: Object.values(c.social_links || {}).filter(Boolean) };
  return (
    <>
      <Seo description="Joyhimalaya runs guided Himalayan treks in autumn, monsoon, spring, summer and winter. See upcoming dates, prices and book your seat." jsonLd={jsonLd} />
      <section className="relative overflow-hidden bg-forest-900 text-white">
        <Mountains className="absolute inset-x-0 bottom-0 h-3/4 w-full" />
        <div className="wrap relative py-24 md:py-36">
          <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] sm:text-6xl">Discover Your Next Adventure</h1>
          <p className="mt-5 max-w-xl text-lg text-forest-100">Guided Himalayan treks for every season, led by people who know the trail. Pick a departure, read what is included, and book your seat.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/treks" className="btn-light">Explore treks <ArrowRight size={16} /></Link>
            {c.whatsapp && <a className="btn border border-white/40 text-white hover:bg-white/10" href={waLink(c.whatsapp, 'Hi Joyhimalaya, I want to book a trek.')} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} />Book on WhatsApp</a>}
          </div>
        </div>
      </section>

      <section className="wrap py-20">
        <div className="mb-8 flex items-end justify-between"><h2 className="text-3xl font-extrabold">Upcoming treks</h2><Link to="/treks?upcoming=1" className="text-sm font-semibold text-forest-700">View all</Link></div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.loading ? <CardSkeleton /> : upcoming.error ? <ErrorBox error={upcoming.error} /> : upcoming.data.rows.length === 0
            ? <Empty title="No upcoming departures right now" text="New dates are added regularly. Message us on WhatsApp to be told first." />
            : upcoming.data.rows.map((t) => <TrekCard key={t.id} trek={t} />)}
        </div>
      </section>

      {featured.data?.rows.length > 0 && (
        <section className="bg-forest-50 py-20"><div className="wrap">
          <h2 className="mb-8 text-3xl font-extrabold">Featured treks</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{featured.data.rows.map((t) => <TrekCard key={t.id} trek={t} />)}</div>
        </div></section>
      )}

      <section className="wrap py-20">
        <h2 className="mb-8 text-3xl font-extrabold">Find a trek by season</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {(cats.data || []).map((k) => (
            <Link key={k.id} to={`/treks/season/${k.slug}`} className="rounded-xl bg-white p-5 ring-1 ring-stone-200 transition hover:ring-forest-500">
              <p className="font-display text-lg font-bold capitalize">{k.slug}</p><p className="mt-1 text-sm text-stone-600">{k.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {dests.length > 0 && (
        <section className="wrap pb-20">
          <h2 className="mb-8 text-3xl font-extrabold">Featured destinations</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {dests.map((t) => (
              <Link key={t.destination} to={`/treks?q=${encodeURIComponent(t.destination)}`} className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-forest-800">
                {t.featured_image && <img src={t.featured_image} alt={`${t.destination} trekking`} loading="lazy" width="480" height="640" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 p-4 font-display text-xl font-bold text-white">{t.destination}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="bg-forest-900 py-20 text-white"><div className="wrap">
        <h2 className="mb-10 text-3xl font-extrabold">Why trek with {c.company_name || 'Joyhimalaya'}</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {why.map(([I, t, d]) => <div key={t}><I className="text-forest-300" /><h3 className="mt-3 text-lg font-bold">{t}</h3><p className="mt-1 text-sm text-forest-200">{d}</p></div>)}
        </div>
      </div></section>

      <section className="wrap py-20 text-center">
        <h2 className="text-3xl font-extrabold">Not sure which trek suits you?</h2>
        <p className="mx-auto mt-3 max-w-lg text-stone-600">Tell us your dates and fitness level and we will suggest a route.</p>
        <div className="mt-6 flex justify-center gap-3"><Link to="/contact" className="btn-primary">Send an enquiry</Link>
          {c.whatsapp && <a className="btn-ghost" href={waLink(c.whatsapp, 'Hi, can you suggest a trek for me?')} target="_blank" rel="noopener noreferrer">WhatsApp us</a>}</div>
      </section>
    </>
  );
}
