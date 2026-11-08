import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Map, Mail, Settings, LogOut, ExternalLink } from 'lucide-react';
import Seo from '../../components/common/Seo';
import { authService } from '../../services/authService';

const items = [['/admin/dashboard', 'Dashboard', LayoutDashboard], ['/admin/treks', 'Treks', Map], ['/admin/messages', 'Enquiries', Mail], ['/admin/settings', 'Company settings', Settings]];
export default function AdminLayout() {
  const nav = useNavigate();
  const out = async () => { await authService.signOut(); nav('/admin/login', { replace: true }); };
  const cls = ({ isActive }) => `flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${isActive ? 'bg-forest-700 text-white' : 'text-forest-100 hover:bg-forest-800'}`;
  return (
    <div className="min-h-screen md:flex">
      <Seo title="Admin" noindex />
      <aside className="bg-forest-900 p-4 md:w-60 md:shrink-0">
        <p className="mb-4 font-display text-lg font-extrabold text-white">Joyhimalaya admin</p>
        <nav className="flex gap-1 overflow-x-auto md:flex-col" aria-label="Admin">
          {items.map(([to, l, I]) => <NavLink key={to} to={to} className={cls}><I size={16} />{l}</NavLink>)}
          <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 text-sm text-forest-200"><ExternalLink size={16} />View site</a>
          <button onClick={out} className="flex items-center gap-2 px-3 py-2 text-sm text-forest-200"><LogOut size={16} />Log out</button>
        </nav>
      </aside>
      <main className="flex-1 bg-snow p-4 sm:p-8"><Outlet /></main>
    </div>
  );
}
