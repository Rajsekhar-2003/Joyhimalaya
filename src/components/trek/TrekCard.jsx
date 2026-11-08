import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Mountain } from 'lucide-react';
import { inr, fmtDate, payable } from '../../utils/format';
export default function TrekCard({ trek: t }) {
  const price = payable(t);
  return (
    <Link to={`/treks/${t.slug}`} className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-stone-200 transition hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-forest-100">
        {t.featured_image
          ? <img src={t.featured_image} alt={`${t.title} trek in ${t.destination}`} width="640" height="480" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          : <div className="grid h-full place-items-center text-forest-400"><Mountain size={40} /></div>}
        {t.categories?.name && <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2 py-1 text-xs font-semibold text-forest-800">{t.categories.name.replace('Upcoming ', '')}</span>}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug">{t.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-stone-600"><MapPin size={14} />{t.destination}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-600">
          <span className="flex items-center gap-1"><Clock size={14} />{t.duration_days}D/{t.duration_nights}N</span>
          <span className="flex items-center gap-1"><Calendar size={14} />{fmtDate(t.start_date)}</span>
          <span className="capitalize">{t.difficulty}</span>
        </div>
        <div className="mt-auto flex items-end justify-between pt-5">
          <div>
            {t.original_price > price && <span className="mr-2 text-sm text-stone-400 line-through">{inr(t.original_price)}</span>}
            <span className="text-xl font-bold text-forest-700">{inr(price)}</span><span className="text-xs text-stone-500"> /person</span>
          </div>
          <span className={`text-xs font-semibold ${t.available_seats > 0 ? 'text-forest-700' : 'text-red-600'}`}>{t.available_seats > 0 ? `${t.available_seats} seats left` : 'Sold out'}</span>
        </div>
      </div>
    </Link>
  );
}
