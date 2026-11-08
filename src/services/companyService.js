import { supabase } from './supabase';
export const IMG_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const companyService = {
  async get() {
    const { data, error } = await supabase.from('company_settings').select('*').eq('id', 1).maybeSingle();
    if (error) throw error;
    return data;
  },
  async save(values) {
    const { error } = await supabase.from('company_settings').upsert({ ...values, id: 1 });
    if (error) throw error;
  },
  async uploadLogo(file, oldPath) {
    if (!IMG_TYPES.includes(file.type)) throw new Error('Logo must be JPG, PNG or WebP.');
    if (file.size > 2 * 1024 * 1024) throw new Error('Logo must be under 2 MB.');
    const path = `logo/${crypto.randomUUID()}.${file.type.split('/')[1]}`;
    const { error } = await supabase.storage.from('company-assets').upload(path, file, { contentType: file.type });
    if (error) throw error;
    if (oldPath) await supabase.storage.from('company-assets').remove([oldPath]);
    return { logo_url: supabase.storage.from('company-assets').getPublicUrl(path).data.publicUrl, logo_path: path };
  },
  async sendMessage(m) {
    const { error } = await supabase.from('contact_messages').insert({ ...m, status: 'new' });
    if (error) throw error;
  },
  async listMessages() {
    const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(200);
    if (error) throw error;
    return data;
  },
  async setMessageStatus(id, status) { const { error } = await supabase.from('contact_messages').update({ status }).eq('id', id); if (error) throw error; },
  async deleteMessage(id) { const { error } = await supabase.from('contact_messages').delete().eq('id', id); if (error) throw error; },
};
