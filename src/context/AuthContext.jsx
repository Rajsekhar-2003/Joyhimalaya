import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { authService } from '../services/authService';
const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      // defer: calling supabase inside this callback can deadlock
      setTimeout(async () => {
        setUser(session?.user ?? null);
        setAdmin(session ? await authService.isAdmin(session.user.id) : false);
        setLoading(false);
      }, 0);
    });
    return () => subscription.unsubscribe();
  }, []);
  return <Ctx.Provider value={{ user, isAdmin, loading }}>{children}</Ctx.Provider>;
}
