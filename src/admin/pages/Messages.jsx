import { useState } from 'react';
import { Trash2, Check } from 'lucide-react';
import { Empty, ErrorBox, Spinner, useToast } from '../../components/common/ui';
import { useAsync } from '../../hooks/useAsync';
import { companyService } from '../../services/companyService';
import { fmtDate } from '../../utils/format';

export default function Messages() {
  const toast = useToast();
  const [tick, setTick] = useState(0);
  const { data, loading, error } = useAsync(() => companyService.listMessages(), [tick]);
  const act = async (fn, ok) => { try { await fn(); toast(ok); setTick((t) => t + 1); } catch (e) { toast(e.message, 'err'); } };
  if (loading) return <Spinner />;
  if (error) return <ErrorBox error={error} />;
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-extrabold">Enquiries</h1>
      <div className="mt-6 space-y-3">
        {data.length === 0 && <Empty title="No enquiries yet" text="Messages from the contact form appear here." />}
        {data.map((m) => (
          <article key={m.id} className={`rounded-xl bg-white p-5 ring-1 ${m.status === 'new' ? 'ring-forest-500' : 'ring-stone-200'}`}>
            <div className="flex flex-wrap justify-between gap-2"><p className="font-semibold">{m.name} <span className="font-normal text-stone-500">· {m.email}{m.phone ? ` · ${m.phone}` : ''}</span></p><span className="text-xs text-stone-500">{fmtDate(m.created_at)} · {m.status}</span></div>
            {m.subject && <p className="mt-1 font-semibold">{m.subject}</p>}
            <p className="mt-2 whitespace-pre-line text-sm text-stone-700">{m.message}</p>
            <div className="mt-3 flex gap-2">
              {m.status !== 'replied' && <button className="btn-ghost !py-1.5" onClick={() => act(() => companyService.setMessageStatus(m.id, 'replied'), 'Marked as replied.')}><Check size={14} />Mark replied</button>}
              {m.status === 'new' && <button className="btn-ghost !py-1.5" onClick={() => act(() => companyService.setMessageStatus(m.id, 'read'), 'Marked as read.')}>Mark read</button>}
              <button className="btn-ghost !py-1.5 text-red-600" onClick={() => act(() => companyService.deleteMessage(m.id), 'Message deleted.')} aria-label="Delete message"><Trash2 size={14} /></button>
            </div>
          </article>))}
      </div>
    </div>
  );
}
