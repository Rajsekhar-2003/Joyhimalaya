import { createContext, useContext, useState, useCallback } from 'react';
import { Loader2, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const T = createContext(() => {});
export const useToast = () => useContext(T);
export function ToastProvider({ children }) {
  const [list, set] = useState([]);
  const push = useCallback((msg, type = 'ok') => {
    const id = Math.random();
    set((l) => [...l, { id, msg, type }]);
    setTimeout(() => set((l) => l.filter((x) => x.id !== id)), 4500);
  }, []);
  return (
    <T.Provider value={push}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2" role="status" aria-live="polite">
        {list.map((t) => (
          <div key={t.id} className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${t.type === 'ok' ? 'bg-forest-700' : 'bg-red-600'}`}>
            {t.type === 'ok' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}{t.msg}
          </div>
        ))}
      </div>
    </T.Provider>
  );
}
export const Spinner = () => <div className="flex justify-center py-16"><Loader2 className="animate-spin text-forest-700" aria-label="Loading" /></div>;
export const CardSkeleton = ({ n = 3 }) => (
  <>{Array.from({ length: n }).map((_, i) => (
    <div key={i} className="animate-pulse overflow-hidden rounded-xl bg-white shadow-sm">
      <div className="h-48 bg-stone-200" />
      <div className="space-y-3 p-5"><div className="h-4 w-2/3 rounded bg-stone-200" /><div className="h-3 w-full rounded bg-stone-200" /><div className="h-3 w-1/2 rounded bg-stone-200" /></div>
    </div>))}</>
);
export const Empty = ({ title = 'Nothing here yet', text }) => (
  <div className="col-span-full rounded-xl border border-dashed border-stone-300 p-12 text-center">
    <p className="font-semibold">{title}</p>{text && <p className="mt-1 text-sm text-stone-500">{text}</p>}
  </div>
);
export const ErrorBox = ({ error }) => <div className="col-span-full rounded-lg bg-red-50 p-4 text-sm text-red-700">{error?.message || 'Something went wrong. Please try again.'}</div>;
export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Pagination">
      <button className="btn-ghost" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><ChevronLeft size={16} /></button>
      <span className="text-sm">Page {page} of {pages}</span>
      <button className="btn-ghost" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page"><ChevronRight size={16} /></button>
    </nav>
  );
}
export function Confirm({ title, text, onYes, onNo, busy }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="w-full max-w-sm rounded-xl bg-white p-6">
        <h3 className="text-lg font-bold">{title}</h3><p className="mt-2 text-sm text-stone-600">{text}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-ghost" onClick={onNo} disabled={busy}>Keep it</button>
          <button className="btn-danger" onClick={onYes} disabled={busy}>{busy ? 'Deleting…' : 'Delete'}</button>
        </div>
      </div>
    </div>
  );
}
