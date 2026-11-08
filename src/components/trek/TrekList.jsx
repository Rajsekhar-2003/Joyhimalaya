import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { trekService } from '../../services/trekService';
import TrekCard from './TrekCard';
import { CardSkeleton, Empty, ErrorBox, Pagination } from '../common/ui';

const SEASONS = ['autumn', 'monsoon', 'spring', 'summer', 'winter'];
export default function TrekList({ season }) {
  const [sp, setSp] = useSearchParams();
  const q = sp.get('q') || '', difficulty = sp.get('difficulty') || '', sort = sp.get('sort') || 'date';
  const page = Number(sp.get('page') || 1), upcoming = season ? true : sp.get('upcoming') === '1';
  const seasonFilter = season || sp.get('season') || '';
  const set = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); if (k !== 'page') n.delete('page'); setSp(n, { replace: true }); };
  const { data, loading, error } = useAsync(
    () => trekService.list({ q, season: seasonFilter, difficulty, sort, page, upcoming }),
    [q, seasonFilter, difficulty, sort, page, upcoming],
  );
  return (
    <>
      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
        <label className="relative"><span className="sr-only">Search treks</span>
          <Search size={16} className="absolute left-3 top-3 text-stone-400" />
          <input className="input pl-9" placeholder="Search by trek or destination" defaultValue={q} onKeyDown={(e) => e.key === 'Enter' && set('q', e.target.value.trim())} onBlur={(e) => e.target.value.trim() !== q && set('q', e.target.value.trim())} />
        </label>
        {!season && <select aria-label="Season" className="input" value={seasonFilter} onChange={(e) => set('season', e.target.value)}>
          <option value="">All seasons</option>{SEASONS.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}</select>}
        <select aria-label="Difficulty" className="input" value={difficulty} onChange={(e) => set('difficulty', e.target.value)}>
          <option value="">Any difficulty</option><option value="easy">Easy</option><option value="moderate">Moderate</option><option value="difficult">Difficult</option><option value="extreme">Extreme</option></select>
        <select aria-label="Sort" className="input" value={sort} onChange={(e) => set('sort', e.target.value)}>
          <option value="date">Soonest first</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option></select>
      </div>
      {!season && <label className="mb-6 flex items-center gap-2 text-sm"><input type="checkbox" checked={upcoming} onChange={(e) => set('upcoming', e.target.checked ? '1' : '')} />Show only upcoming departures</label>}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? <CardSkeleton n={6} /> : error ? <ErrorBox error={error} /> : data.rows.length === 0
          ? <Empty title="No treks match your search" text="Try a different season, difficulty or keyword." />
          : data.rows.map((t) => <TrekCard key={t.id} trek={t} />)}
      </div>
      {data && <Pagination page={page} pages={data.pages} onChange={(p) => set('page', String(p))} />}
    </>
  );
}
