import { supabase } from './supabase';
export const authService = {
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  },
  signOut: () => supabase.auth.signOut(),
  async isAdmin(id) {
    const { data } = await supabase.from('profiles').select('role').eq('id', id).maybeSingle();
    return data?.role === 'admin';
  },
};
