import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MessageCircle, Share2, Calendar, Clock, MapPin, Mountain, Gauge, Users, Bus, Utensils, BedDouble } from 'lucide-react';
import Seo, { SITE } from '../components/common/Seo';
import BookingForm from '../components/trek/BookingForm';
import { Spinner, useToast } from '../components/common/ui';
import { useAsync } from '../hooks/useAsync';
import { useCompany } from '../hooks/useCompany';
import { trekService } from '../services/trekService';
import { fmtDate, inr, lines, payable, waLink } from '../utils/format';

const List = ({ t, items, cls }) => items.length > 0 && <section className="mt-10"><h2 className="text-2xl font-extrabold">{t}</h2><ul className={`mt-3 list-disc space-y-1 pl-5 ${cls || ''}`}>{items.map((i) => <li key={i}>{i}</li>)}</ul></section>;
const Text = ({ t, v }) => v && <section className="mt-10"><h2 className="text-2xl font-extrabold">{t}</h2><p className="mt-3 whitespace-pre-line leading-relaxed text-stone-700">{v}</p></section>;

export default function TrekDetails() {
  const { slug } = useParams();
  const c = useCompany() || {};
  const toast = useToast();
  const [idx, setIdx] = useState(0);
  const { data: t, loading, error } = useAsync(() => trekService.getBySlug(slug), [slug]);
  if (loading) return <Spinner />;
  if (error || !t) return <div className="wrap py-32 text-center"><Seo title="Trek not found" noindex /><h1 className="text-3xl font-extrabold">Trek not found</h1><p className="mt-2 text-stone-600">It may have been removed or is not published yet.</p><Link to="/treks" className="btn-primary mt-6">Browse treks</Link></div>;

  const imgs = [...new Set([t.featured_image, ...t.trek_images.map((i) => i.image_url)].filter(Boolean))];
  const price = payable(t), url = `${SITE}/treks/${t.slug}`;
  const msg = `Hi, I want to enquire about "${t.title}" starting ${fmtDate(t.start_date)}.`;
  const share = async () => {
    try { if (navigator.share) await navigator.share({ title: t.title, url }); else { await navigator.clipboard.writeText(url); toast('Link copied.'); } } catch { /* cancelled */ }
  };
  const offers = { '@type': 'Offer', price, priceCurrency: 'INR', url, availability: t.available_seats > 0 ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut', validThrough: t.booking_deadline || t.start_date };
  const jsonLd = [
    { '@context': 'https://schema.org', '@type': 'Product', name: t.title, description: t.short_description, image: imgs, category: t.categories?.name, brand: { '@type': 'Brand', name: 'Joyhimalaya' }, offers },
    { '@context': 'https://schema.org', '@type': 'TouristTrip', name: t.title, description: t.short_description, touristType: 'Adventure', offers },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['Home', SITE], ['Treks', `${SITE}/treks`], [t.title, url]].map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })) },
  ];
  const facts = [[Calendar, 'Dates', `${fmtDate(t.start_date)} to ${fmtDate(t.end_date)}`], [Clock, 'Duration', `${t.duration_days} days / ${t.duration_nights} nights`], [MapPin, 'Route', `${t.starting_point || '-'} to ${t.ending_point || '-'}`],
    [Gauge, 'Difficulty', t.difficulty], [Mountain, 'Max altitude', t.maximum_altitude], [Users, 'Seats left', t.available_seats]].filter((f) => f[2] !== '' && f[2] != null);

  return (
    <div className="wrap py-10">
      <Seo title={t.title} path={`/treks/${t.slug}`} type="article" image={imgs[0]} description={t.short_description || `${t.title} in ${t.destination}. ${t.duration_days} days, from ${inr(price)} per person.`} jsonLd={jsonLd} />
      <nav className="mb-4 text-sm text-stone-500" aria-label="Breadcrumb"><Link to="/">Home</Link> / <Link to="/treks">Treks</Link> / {t.title}</nav>
      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <p className="text-sm font-semibold text-forest-700">{t.categories?.name} · {t.destination}</p>
          <h1 className="mt-1 text-4xl font-extrabold">{t.title}</h1>
          {imgs.length > 0 && <div className="mt-6">
            <img src={imgs[idx]} alt={`${t.title} photo ${idx + 1}`} width="1200" height="800" className="aspect-[3/2] w-full rounded-xl object-cover" />
            {imgs.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto">{imgs.map((src, i) => <button key={src} onClick={() => setIdx(i)} aria-label={`Show photo ${i + 1}`} className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-2 ${i === idx ? 'ring-forest-600' : 'ring-transparent'}`}><img src={src} alt="" loading="lazy" width="96" height="64" className="h-full w-full object-cover" /></button>)}</div>}
          </div>}
          <dl className="mt-8 grid gap-4 rounded-xl bg-white p-5 ring-1 ring-stone-200 sm:grid-cols-2">
            {facts.map(([I, l, v]) => <div key={l} className="flex gap-3"><I size={18} className="mt-1 text-forest-600" /><div><dt className="text-xs text-stone-500">{l}</dt><dd className="font-semibold capitalize">{v}</dd></div></div>)}
          </dl>
          <Text t="About this trek" v={t.description} />
          {(t.accommodation || t.room_sharing) && <section className="mt-10"><h2 className="flex items-center gap-2 text-2xl font-extrabold"><BedDouble size={22} />Stay</h2><p className="mt-3 whitespace-pre-line text-stone-700">{t.accommodation}</p>{t.room_sharing && <p className="mt-2 text-stone-700">Room sharing: {t.room_sharing}</p>}</section>}
          {t.transportation && <section className="mt-10"><h2 className="flex items-center gap-2 text-2xl font-extrabold"><Bus size={22} />Transportation</h2><p className="mt-3 whitespace-pre-line text-stone-700">{t.transportation}</p></section>}
          {t.food_facilities && <section className="mt-10"><h2 className="flex items-center gap-2 text-2xl font-extrabold"><Utensils size={22} />Food</h2><p className="mt-3 whitespace-pre-line text-stone-700">{t.food_facilities}</p></section>}
          <List t="Included" items={lines(t.inclusions)} /><List t="Not included" items={lines(t.exclusions)} />
          <List t="Things to carry" items={lines(t.things_to_carry)} /><Text t="Important instructions" v={t.instructions} />
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
            <div>{t.original_price > price && <span className="mr-2 text-stone-400 line-through">{inr(t.original_price)}</span>}<span className="text-3xl font-extrabold text-forest-700">{inr(price)}</span><span className="text-sm text-stone-500"> per person</span></div>
            {t.booking_deadline && <p className="text-sm text-stone-600">Book by {fmtDate(t.booking_deadline)}</p>}
            <BookingForm trek={t} />
            {c.whatsapp && <a className="btn-ghost w-full" href={waLink(c.whatsapp, msg)} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} />WhatsApp enquiry</a>}
            <button className="btn-ghost w-full" onClick={share}><Share2 size={16} />Share this trek</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
