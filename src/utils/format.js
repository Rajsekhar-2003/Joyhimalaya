export const inr = (n) => (n == null ? '' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n));
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
export const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
export const waLink = (num, text) => `https://wa.me/${(num || '').replace(/\D/g, '')}?text=${encodeURIComponent(text || '')}`;
export const lines = (t) => (t || '').split('\n').map((s) => s.trim()).filter(Boolean);
export const payable = (t) => Number(t.discounted_price ?? t.price_per_person);
