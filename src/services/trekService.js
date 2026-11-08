import { supabase } from './supabase';
import { IMG_TYPES } from './companyService';
const PUB = ['upcoming', 'active', 'completed'];
const today = () => new Date().toISOString().slice(0, 10);
let catCache;

export const trekService = {
  async categories() {
    if (!catCache) {
      const { data, error } = await supabase.from('categories').select('*').order('created_at');
      if (error) throw error;
      catCache = data;
    }
    return catCache;
  },
  async list({ q, season, difficulty, sort = 'date', page = 1, pageSize = 9, upcoming = false, featured = false } = {}) {
    let s = supabase.from('treks').select('*, categories!inner(name,slug)', { count: 'exact' })
      .in('status', upcoming ? ['upcoming', 'active'] : PUB);
    if (upcoming) s = s.gte('start_date', today());
    if (featured) s = s.eq('is_featured', true);
    if (season) s = s.eq('categories.slug', season);
    if (difficulty) s = s.eq('difficulty', difficulty);
    const k = (q || '').replace(/[%,()]/g, ' ').trim();
    if (k) s = s.or(`title.ilike.%${k}%,destination.ilike.%${k}%`);
    if (sort === 'price_asc') s = s.order('price_per_person');
    else if (sort === 'price_desc') s = s.order('price_per_person', { ascending: false });
    else s = s.order('start_date');
    const from = (page - 1) * pageSize;
    const { data, error, count } = await s.range(from, from + pageSize - 1);
    if (error) throw error;
    return { rows: data, count, pages: Math.max(1, Math.ceil(count / pageSize)) };
  },
  async getBySlug(slug) {
    const { data, error } = await supabase.from('treks').select('*, categories(name,slug), trek_images(id,image_url,created_at)')
      .eq('slug', slug).in('status', PUB).maybeSingle();
    if (error) throw error;
    return data;
  },
  async book(b) {
    const { error } = await supabase.from('bookings').insert({ ...b, booking_status: 'pending' });
    if (error) throw error;
  },

  // ---------- admin ----------
  async adminList({ q, status, page = 1, pageSize = 10 } = {}) {
    let s = supabase.from('treks').select('id,title,slug,destination,start_date,price_per_person,available_seats,status,categories(name)', { count: 'exact' });
    if (status) s = s.eq('status', status);
    const k = (q || '').replace(/[%,()]/g, ' ').trim();
    if (k) s = s.or(`title.ilike.%${k}%,destination.ilike.%${k}%`);
    const from = (page - 1) * pageSize;
    const { data, error, count } = await s.order('created_at', { ascending: false }).range(from, from + pageSize - 1);
    if (error) throw error;
    return { rows: data, count, pages: Math.max(1, Math.ceil(count / pageSize)) };
  },
  async adminGet(id) {
    const { data, error } = await supabase.from('treks').select('*, trek_images(*)').eq('id', id).single();
    if (error) throw error;
    return data;
  },
  async save(values, id) {
    const q = id ? supabase.from('treks').update(values).eq('id', id) : supabase.from('treks').insert(values);
    const { data, error } = await q.select('id').single();
    if (error) throw error.code === '23505' ? new Error('A trek with this title already exists. Use a different title.') : error;
    return data.id;
  },
  async setStatus(id, status) { const { error } = await supabase.from('treks').update({ status }).eq('id', id); if (error) throw error; },
  validateImage(f) {
    if (!IMG_TYPES.includes(f.type)) return `${f.name}: use JPG, PNG or WebP.`;
    if (f.size > 5 * 1024 * 1024) return `${f.name}: must be under 5 MB.`;
    return null;
  },
  async uploadImages(trekId, files) {
    const out = [];
    for (const f of files) {
      const path = `${trekId}/${crypto.randomUUID()}.${f.type.split('/')[1]}`;
      const up = await supabase.storage.from('trek-images').upload(path, f, { cacheControl: '31536000', contentType: f.type });
      if (up.error) throw up.error;
      const image_url = supabase.storage.from('trek-images').getPublicUrl(path).data.publicUrl;
      const { data, error } = await supabase.from('trek_images').insert({ trek_id: trekId, image_url, storage_path: path }).select().single();
      if (error) throw error;
      out.push(data);
    }
    return out;
  },
  async deleteImage(img, wasFeatured) {
    await supabase.storage.from('trek-images').remove([img.storage_path]);
    const { error } = await supabase.from('trek_images').delete().eq('id', img.id);
    if (error) throw error;
    if (wasFeatured) await supabase.from('treks').update({ featured_image: null }).eq('id', img.trek_id);
  },
  async remove(id) {
    const { data: imgs } = await supabase.from('trek_images').select('storage_path').eq('trek_id', id);
    if (imgs?.length) await supabase.storage.from('trek-images').remove(imgs.map((i) => i.storage_path));
    const { error } = await supabase.from('treks').delete().eq('id', id);
    if (error) throw error;
  },
  async stats() {
    const c = (t, f) => { let q = supabase.from(t).select('id', { count: 'exact', head: true }); if (f) q = f(q); return q.then((r) => r.count ?? 0); };
    const [total, upcoming, active, completed, cancelled, enquiries, bookings] = await Promise.all([
      c('treks'), c('treks', (q) => q.eq('status', 'upcoming')), c('treks', (q) => q.eq('status', 'active')),
      c('treks', (q) => q.eq('status', 'completed')), c('treks', (q) => q.eq('status', 'cancelled')),
      c('contact_messages'), c('bookings'),
    ]);
    return { total, upcoming, active, completed, cancelled, enquiries, bookings };
  },
};
