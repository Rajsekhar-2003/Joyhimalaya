import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, Mountain, Phone, Mail, MapPin, Instagram, Facebook, Youtube, MessageCircle } from 'lucide-react';
import { useCompany } from '../../hooks/useCompany';
import { waLink } from '../../utils/format';

const seasons = ['autumn', 'monsoon', 'spring', 'summer', 'winter'];
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const link = ({ isActive }) => `text-sm font-semibold transition hover:text-forest-600 ${isActive ? 'text-forest-700' : 'text-charcoal'}`;

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const c = useCompany() || {};
  const name = c.company_name || 'Joyhimalaya';
  const s = c.social_links || {};
  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [pathname]);
  const Brand = () => (
    <Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold text-forest-800" aria-label={`${name} home`}>
      {c.logo_url ? <img src={c.logo_url} alt={name} className="h-9 w-auto" height="36" /> : <Mountain className="text-forest-600" />}{name}
    </Link>
  );
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3">Skip to content</a>
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="wrap flex h-16 items-center justify-between">
          <Brand />
          <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
            <NavLink to="/" end className={link}>Home</NavLink>
            <div className="group relative">
              <NavLink to="/treks" end className={link}>Treks</NavLink>
              <div className="invisible absolute left-0 top-full w-48 rounded-lg bg-white p-2 opacity-0 shadow-lg ring-1 ring-stone-200 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                {seasons.map((x) => <Link key={x} to={`/treks/season/${x}`} className="block rounded px-3 py-2 text-sm hover:bg-forest-50">{cap(x)} treks</Link>)}
              </div>
            </div>
            <NavLink to="/about" className={link}>About</NavLink>
            <NavLink to="/contact" className={link}>Contact</NavLink>
            {c.whatsapp && <a className="btn-primary !py-2" href={waLink(c.whatsapp, `Hi ${name}, I want to enquire about a trek.`)} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} />WhatsApp</a>}
          </nav>
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>{open ? <X /> : <Menu />}</button>
        </div>
        {open && (
          <nav className="wrap flex flex-col gap-1 pb-4 md:hidden" aria-label="Mobile">
            {[['/', 'Home'], ['/treks', 'All treks'], ...seasons.map((x) => [`/treks/season/${x}`, `${cap(x)} treks`]), ['/about', 'About'], ['/contact', 'Contact']].map(([to, l]) => <Link key={to} to={to} className="rounded px-2 py-2 text-sm font-semibold hover:bg-forest-50">{l}</Link>)}
          </nav>
        )}
      </header>
      <main id="main"><Outlet /></main>
      <footer className="mt-24 bg-forest-900 text-forest-100">
        <div className="wrap grid gap-10 py-14 md:grid-cols-4">
          <div className="md:col-span-1">
            <p className="font-display text-xl font-extrabold text-white">{name}</p>
            <p className="mt-3 text-sm leading-relaxed text-forest-200">{c.description || 'Guided Himalayan treks for every season.'}</p>
            <div className="mt-4 flex gap-3">
              {s.instagram && <a href={s.instagram} aria-label="Instagram" target="_blank" rel="noopener noreferrer"><Instagram size={18} /></a>}
              {s.facebook && <a href={s.facebook} aria-label="Facebook" target="_blank" rel="noopener noreferrer"><Facebook size={18} /></a>}
              {s.youtube && <a href={s.youtube} aria-label="YouTube" target="_blank" rel="noopener noreferrer"><Youtube size={18} /></a>}
            </div>
          </div>
          <div><p className="mb-3 font-semibold text-white">Seasons</p><ul className="space-y-2 text-sm">{seasons.map((x) => <li key={x}><Link to={`/treks/season/${x}`} className="hover:text-white">{cap(x)} treks</Link></li>)}</ul></div>
          <div><p className="mb-3 font-semibold text-white">Company</p><ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-white">About us</Link></li><li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-white">Privacy policy</Link></li><li><Link to="/terms" className="hover:text-white">Terms and conditions</Link></li>
            <li><Link to="/cancellation-policy" className="hover:text-white">Cancellation and refunds</Link></li></ul></div>
          <div><p className="mb-3 font-semibold text-white">Contact</p><ul className="space-y-2 text-sm">
            {c.address && <li className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0" />{c.address}</li>}
            {c.phone && <li className="flex gap-2"><Phone size={16} className="mt-0.5" /><a href={`tel:${c.phone}`}>{c.phone}</a></li>}
            {c.email && <li className="flex gap-2"><Mail size={16} className="mt-0.5" /><a href={`mailto:${c.email}`}>{c.email}</a></li>}</ul></div>
        </div>
        <p className="border-t border-forest-800 py-5 text-center text-xs text-forest-300">© {new Date().getFullYear()} {name}. All rights reserved.</p>
      </footer>
      {c.whatsapp && <a href={waLink(c.whatsapp, `Hi ${name}, I want to enquire about a trek.`)} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className="fixed bottom-5 left-5 z-40 grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-lg"><MessageCircle /></a>}
    </>
  );
}
