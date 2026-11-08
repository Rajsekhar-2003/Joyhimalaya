import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import Seo from '../components/common/Seo';
import { useToast } from '../components/common/ui';
import { useCompany } from '../hooks/useCompany';
import { companyService } from '../services/companyService';
import { waLink } from '../utils/format';

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(120),
  email: z.string().trim().email('Enter a valid email').max(200),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  subject: z.string().trim().max(200).optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Write at least 10 characters').max(5000),
});

export default function Contact() {
  const c = useCompany() || {};
  const toast = useToast();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });
  const onSubmit = async (v) => {
    try { await companyService.sendMessage(v); reset(); toast('Message sent. We will reply soon.'); }
    catch { toast('Could not send your message. Please try again or use WhatsApp.', 'err'); }
  };
  const map = c.location || c.address;
  const F = ({ n, l, ...p }) => <div><label className="label" htmlFor={n}>{l}</label>{p.rows ? <textarea id={n} className="input" {...p} {...register(n)} /> : <input id={n} className="input" {...p} {...register(n)} />}{errors[n] && <p className="err">{errors[n].message}</p>}</div>;
  return (
    <div className="wrap py-14">
      <Seo title="Contact Us" path="/contact" description="Contact Joyhimalaya by phone, WhatsApp, email or the enquiry form to plan your Himalayan trek." />
      <h1 className="text-4xl font-extrabold">Contact us</h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div className="space-y-5">
          <ul className="space-y-4 text-stone-700">
            {c.address && <li className="flex gap-3"><MapPin className="shrink-0 text-forest-600" />{c.address}</li>}
            {c.phone && <li className="flex gap-3"><Phone className="text-forest-600" /><a href={`tel:${c.phone}`}>{c.phone}</a></li>}
            {c.email && <li className="flex gap-3"><Mail className="text-forest-600" /><a href={`mailto:${c.email}`}>{c.email}</a></li>}
            {c.whatsapp && <li className="flex gap-3"><MessageCircle className="text-forest-600" /><a href={waLink(c.whatsapp, 'Hi Joyhimalaya')} target="_blank" rel="noopener noreferrer">{c.whatsapp} (WhatsApp)</a></li>}
          </ul>
          {map && <iframe title="Our location" loading="lazy" className="h-72 w-full rounded-xl border-0" referrerPolicy="no-referrer-when-downgrade" src={`https://maps.google.com/maps?q=${encodeURIComponent(map)}&output=embed`} />}
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl bg-white p-6 ring-1 ring-stone-200" noValidate>
          <F n="name" l="Your name" autoComplete="name" /><F n="email" l="Email" type="email" autoComplete="email" />
          <F n="phone" l="Phone (optional)" type="tel" autoComplete="tel" /><F n="subject" l="Subject (optional)" />
          <F n="message" l="Message" rows={5} />
          <button className="btn-primary w-full" disabled={isSubmitting}>{isSubmitting ? 'Sending…' : 'Send message'}</button>
        </form>
      </div>
    </div>
  );
}
