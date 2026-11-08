import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Trash2, Search } from 'lucide-react';
import { Confirm, Empty, ErrorBox, Pagination, Spinner, useToast } from '../../components/common/ui';
import { useAsync } from '../../hooks/useAsync';
import { trekService } from '../../services/trekService';
import { fmtDate, inr } from '../../utils/format';

export const STATUSES = ['upcoming', 'active', 'completed', 'cancelled', 'draft'];
export default function Treks() {
  const toast = useToast();
  const [q, setQ] = useState(''), [status, setStatus] = useState(''), [page, setPage] = useState(1), [tick, setTick] = useState(0);
  const [del, setDel] = useState(null), [busy, setBusy] = useState(false);
  const { data, loading, error } = useAsync(() => trekService.adminList({ q, status, page }), [q, status, page, tick]);
  const remove = async () => {
    setBusy(true);
    try { await trekService.remove(del.id); toast('Trek and its images deleted.'); setDel(null); setTick((t) => t + 1); }
    catch (e) { toast(e.message, 'err'); }
    setBusy(false);
  };
  const changeStatus = async (id, s) => { try { await trekService.setStatus(id, s); toast('Status updated.'); setTick((t) => t + 1); } catch (e) { toast(e.message, 'err'); } };
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-extrabold">Trek packages</h1><Link to="/admin/treks/new" className="btn-primary">Add new trek</Link></div>
      <div className="mt-6 flex flex-wrap gap-3">
        <label className="relative flex-1"><span className="sr-only">Search</span><Search size={16} className="absolute left-3 top-3 text-stone-400" />
          <input className="input pl-9" placeholder="Search title or destination" onChange={(e) => { setQ(e.target.value); setPage(1); }} /></label>
        <select aria-label="Status" className="input w-44" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}</select>
      </div>
      {loading ? <Spinner /> : error ? <ErrorBox error={error} /> : data.rows.length === 0 ? <div className="mt-6"><Empty title="No treks found" text="Add your first trek to show it on the website." /></div> : (
        <div className="mt-6 overflow-x-auto rounded-xl bg-white ring-1 ring-stone-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-stone-50 text-stone-500"><tr><th className="p-3">Trek</th><th>Category</th><th>Starts</th><th>Price</th><th>Seats</th><th>Status</th><th className="pr-3 text-right">Actions</th></tr></thead>
            <tbody>{data.rows.map((t) => (
              <tr key={t.id} className="border-b last:border-0">
                <td className="p-3 font-semibold">{t.title}<div className="font-normal text-stone-500">{t.destination}</div></td>
                <td>{t.categories?.name?.replace('Upcoming ', '')}</td><td>{fmtDate(t.start_date)}</td><td>{inr(t.price_per_person)}</td><td>{t.available_seats}</td>
                <td><select aria-label={`Status of ${t.title}`} className="input !w-32 capitalize" value={t.status} onChange={(e) => changeStatus(t.id, e.target.value)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></td>
                <td className="pr-3"><div className="flex justify-end gap-1">
                  <a className="btn-ghost !p-2" href={`/treks/${t.slug}`} target="_blank" rel="noopener noreferrer" aria-label="View on site"><Eye size={16} /></a>
                  <Link className="btn-ghost !p-2" to={`/admin/treks/${t.id}`} aria-label="Edit"><Pencil size={16} /></Link>
                  <button className="btn-ghost !p-2 text-red-600" onClick={() => setDel(t)} aria-label="Delete"><Trash2 size={16} /></button></div></td>
              </tr>))}</tbody>
          </table>
        </div>
      )}
      {data && <Pagination page={page} pages={data.pages} onChange={setPage} />}
      {del && <Confirm title="Delete this trek?" text={`"${del.title}" and all its images will be permanently removed from the website.`} onYes={remove} onNo={() => setDel(null)} busy={busy} />}
    </div>
  );
}
