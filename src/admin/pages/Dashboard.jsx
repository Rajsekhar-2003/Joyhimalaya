import { Link } from 'react-router-dom';
import { Spinner, ErrorBox } from '../../components/common/ui';
import { useAsync } from '../../hooks/useAsync';
import { trekService } from '../../services/trekService';
export default function Dashboard() {
  const { data: s, loading, error } = useAsync(() => trekService.stats(), []);
  if (loading) return <Spinner />;
  if (error) return <ErrorBox error={error} />;
  const cards = [['Total packages', s.total], ['Upcoming', s.upcoming], ['Active', s.active], ['Completed', s.completed], ['Cancelled', s.cancelled], ['Enquiries', s.enquiries], ['Booking requests', s.bookings]];
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-extrabold">Dashboard</h1><Link to="/admin/treks/new" className="btn-primary">Add new trek</Link></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([l, v]) => <div key={l} className="rounded-xl bg-white p-5 ring-1 ring-stone-200"><p className="text-sm text-stone-500">{l}</p><p className="mt-1 text-3xl font-extrabold text-forest-700">{v}</p></div>)}
      </div>
    </div>
  );
}
