import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Star, Trash2, X } from 'lucide-react';
import { Spinner, useToast } from '../../components/common/ui';
import { useAsync } from '../../hooks/useAsync';
import { trekService } from '../../services/trekService';
import { slugify } from '../../utils/format';
import { STATUSES } from './Treks';

const num = z.preprocess((v) => (v === '' || v == null || Number.isNaN(v) ? undefined : Number(v)), z.number({ invalid_type_error: 'Enter a number', required_error: 'Required' }).min(0));
const optNum = z.preprocess((v) => (v === '' || v == null || Number.isNaN(v) ? null : Number(v)), z.number().min(0).nullable());
const txt = z.string().trim().max(8000).optional().or(z.literal(''));
const schema = z.object({
  title: z.string().trim().min(3, 'Enter a trek name').max(150), category_id: z.string().min(1, 'Select a category'),
  destination: z.string().trim().min(2, 'Required'), starting_point: txt, ending_point: txt,
  short_description: z.string().trim().min(10, 'At least 10 characters').max(300), description: z.string().trim().min(20, 'At least 20 characters'),
  start_date: z.string().min(1, 'Required'), end_date: z.string().min(1, 'Required'), booking_deadline: z.string().optional(),
  duration_days: num.pipe(z.number().min(1, 'At least 1')), duration_nights: num,
  original_price: optNum, discounted_price: optNum, price_per_person: num, available_seats: num.pipe(z.number().int()),
  accommodation: txt, room_sharing: txt, difficulty: z.enum(['easy', 'moderate', 'difficult', 'extreme']), maximum_altitude: txt,
  transportation: txt, food_facilities: txt, inclusions: txt, exclusions: txt, things_to_carry: txt, instructions: txt,
  status: z.enum(STATUSES), is_featured: z.boolean().optional(),
}).refine((d) => d.end_date >= d.start_date, { path: ['end_date'], message: 'End date must be on or after start date' });

// [name, label, type, rows]
const SECTIONS = [
  ['Basic information', [['title', 'Trek name'], ['category_id', 'Category', 'category'], ['destination', 'Destination'], ['starting_point', 'Starting point'], ['ending_point', 'Ending point'], ['short_description', 'Short description (shown on cards)', 'area', 2], ['description', 'Full description', 'area', 6]]],
  ['Schedule', [['start_date', 'Starting date', 'date'], ['end_date', 'Ending date', 'date'], ['duration_days', 'Duration (days)', 'number'], ['duration_nights', 'Duration (nights)', 'number'], ['booking_deadline', 'Booking deadline', 'date']]],
  ['Pricing and seats (₹)', [['original_price', 'Original package price', 'number'], ['discounted_price', 'Discounted price (shown if filled)', 'number'], ['price_per_person', 'Price per person', 'number'], ['available_seats', 'Available seats', 'number']]],
  ['Accommodation', [['accommodation', 'Stay details (hotel or campsite)', 'area', 3], ['room_sharing', 'Room-sharing details']]],
  ['Additional details', [['difficulty', 'Difficulty', 'difficulty'], ['maximum_altitude', 'Maximum altitude (e.g. 13,100 ft)'], ['transportation', 'Transportation', 'area', 2], ['food_facilities', 'Food facilities', 'area', 2],
    ['inclusions', 'Included services (one per line)', 'area', 4], ['exclusions', 'Excluded services (one per line)', 'area', 4], ['things_to_carry', 'Things to carry (one per line)', 'area', 4], ['instructions', 'Important instructions', 'area', 4]]],
];
const NUM_FIELDS = ['duration_days', 'duration_nights', 'original_price', 'discounted_price', 'price_per_person', 'available_seats'];

export default function TrekForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const cats = useAsync(() => trekService.categories(), []);
  const trek = useAsync(() => (id ? trekService.adminGet(id) : Promise.resolve(null)), [id]);
  const [files, setFiles] = useState([]), [images, setImages] = useState([]), [featured, setFeatured] = useState(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema), defaultValues: { difficulty: 'moderate', status: 'draft', duration_nights: 0, available_seats: 0 } });

  useEffect(() => {
    const t = trek.data; if (!t) return;
    const v = Object.fromEntries(Object.entries(t).map(([k, x]) => [k, x ?? '']));
    reset({ ...v, booking_deadline: t.booking_deadline || '' });
    setImages(t.trek_images || []); setFeatured(t.featured_image);
  }, [trek.data, reset]);

  const pick = (e) => {
    const picked = [...e.target.files], bad = picked.map(trekService.validateImage).filter(Boolean);
    bad.forEach((m) => toast(m, 'err'));
    setFiles((f) => [...f, ...picked.filter((x) => !trekService.validateImage(x)).map((file) => ({ file, url: URL.createObjectURL(file) }))]);
    e.target.value = '';
  };
  const delImage = async (img) => {
    try { await trekService.deleteImage(img, featured === img.image_url); setImages((l) => l.filter((x) => x.id !== img.id)); if (featured === img.image_url) setFeatured(null); toast('Image deleted.'); }
    catch (e) { toast(e.message, 'err'); }
  };
  const submit = async (v) => {
    try {
      const clean = Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x === '' ? null : x]));
      NUM_FIELDS.forEach((k) => { if (clean[k] === undefined) clean[k] = null; });
      let slug = trek.data?.slug;
      if (!slug) slug = `${slugify(v.title)}-${v.start_date}`;
      const trekId = await trekService.save({ ...clean, slug, featured_image: featured }, id);
      let feat = featured;
      if (files.length) {
        const up = await trekService.uploadImages(trekId, files.map((f) => f.file));
        if (!feat) { feat = up[0].image_url; await trekService.save({ featured_image: feat }, trekId); }
      }
      toast('Trek saved. It is live on the website now.'); nav('/admin/treks');
    } catch (e) { toast(e.message || 'Could not save the trek.', 'err'); }
  };

  if (trek.loading || cats.loading) return <Spinner />;
  const field = ([n, l, type, rows]) => (
    <div key={n} className={type === 'area' ? 'sm:col-span-2' : ''}>
      <label className="label" htmlFor={n}>{l}</label>
      {type === 'area' ? <textarea id={n} rows={rows} className="input" {...register(n)} />
        : type === 'category' ? <select id={n} className="input" {...register(n)}><option value="">Select category</option>{cats.data.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        : type === 'difficulty' ? <select id={n} className="input capitalize" {...register(n)}>{['easy', 'moderate', 'difficult', 'extreme'].map((d) => <option key={d}>{d}</option>)}</select>
        : <input id={n} type={type || 'text'} step={type === 'number' ? 'any' : undefined} className="input" {...register(n)} />}
      {errors[n] && <p className="err">{errors[n].message}</p>}
    </div>
  );
  return (
    <form onSubmit={handleSubmit(submit)} className="max-w-4xl space-y-8" noValidate>
      <h1 className="text-3xl font-extrabold">{id ? 'Edit trek' : 'Add new trek'}</h1>
      {SECTIONS.map(([h, fs]) => <fieldset key={h} className="rounded-xl bg-white p-6 ring-1 ring-stone-200"><legend className="px-2 font-display text-lg font-bold">{h}</legend><div className="grid gap-4 sm:grid-cols-2">{fs.map(field)}</div></fieldset>)}
      <fieldset className="rounded-xl bg-white p-6 ring-1 ring-stone-200"><legend className="px-2 font-display text-lg font-bold">Images</legend>
        <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={pick} aria-label="Upload trek images" />
        <p className="mt-1 text-xs text-stone-500">JPG, PNG or WebP, up to 5 MB each. Click the star to choose the featured image.</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((i) => (
            <div key={i.id} className="relative">
              <img src={i.image_url} alt="" className={`aspect-[4/3] w-full rounded-lg object-cover ring-2 ${featured === i.image_url ? 'ring-forest-600' : 'ring-transparent'}`} />
              <button type="button" onClick={() => setFeatured(i.image_url)} aria-label="Set as featured image" className="absolute left-1 top-1 rounded bg-white p-1"><Star size={14} className={featured === i.image_url ? 'fill-amber-400 text-amber-500' : ''} /></button>
              <button type="button" onClick={() => delImage(i)} aria-label="Delete image" className="absolute right-1 top-1 rounded bg-white p-1 text-red-600"><Trash2 size={14} /></button>
            </div>))}
          {files.map((f, n) => (
            <div key={f.url} className="relative"><img src={f.url} alt="" className="aspect-[4/3] w-full rounded-lg object-cover opacity-80" />
              <span className="absolute bottom-1 left-1 rounded bg-white px-1 text-xs">Pending</span>
              <button type="button" onClick={() => setFiles((l) => l.filter((_, j) => j !== n))} aria-label="Remove" className="absolute right-1 top-1 rounded bg-white p-1"><X size={14} /></button></div>))}
        </div>
      </fieldset>
      <fieldset className="rounded-xl bg-white p-6 ring-1 ring-stone-200"><legend className="px-2 font-display text-lg font-bold">Status</legend>
        <div className="grid gap-4 sm:grid-cols-2"><div><label className="label" htmlFor="status">Package status</label><select id="status" className="input capitalize" {...register('status')}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
          <p className="mt-1 text-xs text-stone-500">Draft and cancelled treks are hidden from the website.</p></div>
          <label className="flex items-center gap-2 pt-7 text-sm font-semibold"><input type="checkbox" {...register('is_featured')} />Show in featured treks</label></div>
      </fieldset>
      <div className="flex gap-3"><button className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save trek'}</button><button type="button" className="btn-ghost" onClick={() => nav('/admin/treks')}>Cancel</button></div>
    </form>
  );
}
