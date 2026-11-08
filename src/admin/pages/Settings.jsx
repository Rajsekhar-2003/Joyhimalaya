import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Spinner, useToast } from '../../components/common/ui';
import { useAsync } from '../../hooks/useAsync';
import { companyService } from '../../services/companyService';
import { clearCompanyCache } from '../../hooks/useCompany';

const url = z.string().trim().url('Enter a full URL starting with https://').or(z.literal(''));
const schema = z.object({
  company_name: z.string().trim().min(2, 'Required').max(120), description: z.string().trim().max(1000),
  address: z.string().trim().max(500), phone: z.string().trim().max(30), whatsapp: z.string().trim().max(30),
  email: z.string().trim().email('Enter a valid email').or(z.literal('')), website_url: url, location: z.string().trim().max(300),
  instagram: url, facebook: url, youtube: url,
});
const FIELDS = [['company_name', 'Company name'], ['description', 'Company description', 'area'], ['address', 'Company address', 'area'], ['phone', 'Contact phone'], ['whatsapp', 'WhatsApp number (with country code, e.g. 919876543210)'],
  ['email', 'Email address'], ['website_url', 'Website URL'], ['instagram', 'Instagram URL'], ['facebook', 'Facebook URL'], ['youtube', 'YouTube URL'], ['location', 'Company location for the map (address or "lat,lng")']];

export default function Settings() {
  const toast = useToast();
  const { data, loading } = useAsync(() => companyService.get(), []);
  const [logo, setLogo] = useState(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });
  useEffect(() => {
    const d = data || {}, s = d.social_links || {};
    reset({ company_name: d.company_name || 'Joyhimalaya', description: d.description || '', address: d.address || '', phone: d.phone || '', whatsapp: d.whatsapp || '', email: d.email || '', website_url: d.website_url || '', location: d.location || '', instagram: s.instagram || '', facebook: s.facebook || '', youtube: s.youtube || '' });
  }, [data, reset]);
  const submit = async ({ instagram, facebook, youtube, ...v }) => {
    try {
      const extra = logo ? await companyService.uploadLogo(logo, data?.logo_path) : {};
      await companyService.save({ ...v, ...extra, social_links: { instagram, facebook, youtube } });
      clearCompanyCache(); toast('Company settings saved.');
    } catch (e) { toast(e.message, 'err'); }
  };
  if (loading) return <Spinner />;
  return (
    <form onSubmit={handleSubmit(submit)} className="max-w-2xl space-y-4" noValidate>
      <h1 className="text-3xl font-extrabold">Company settings</h1>
      <div><label className="label" htmlFor="logo">Company logo</label>
        {data?.logo_url && <img src={data.logo_url} alt="Current logo" className="mb-2 h-14" />}
        <input id="logo" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setLogo(e.target.files[0] || null)} /><p className="mt-1 text-xs text-stone-500">JPG, PNG or WebP, up to 2 MB.</p></div>
      {FIELDS.map(([n, l, t]) => <div key={n}><label className="label" htmlFor={n}>{l}</label>{t ? <textarea id={n} rows={3} className="input" {...register(n)} /> : <input id={n} className="input" {...register(n)} />}{errors[n] && <p className="err">{errors[n].message}</p>}</div>)}
      <button className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save settings'}</button>
    </form>
  );
}
