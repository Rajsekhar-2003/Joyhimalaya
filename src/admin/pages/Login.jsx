import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Mountain } from 'lucide-react';
import Seo from '../../components/common/Seo';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

export default function Login() {
  const nav = useNavigate();
  const { isAdmin, loading } = useAuth();
  const [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  if (!loading && isAdmin) return <Navigate to="/admin/dashboard" replace />;
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    const f = new FormData(e.target);
    try {
      const user = await authService.signIn(f.get('email'), f.get('password'));
      if (!(await authService.isAdmin(user.id))) { await authService.signOut(); throw new Error('This account is not an administrator.'); }
      nav('/admin/dashboard', { replace: true });
    } catch (x) { setErr(x.message === 'Invalid login credentials' ? 'Wrong email or password.' : x.message); }
    setBusy(false);
  };
  return (
    <div className="grid min-h-screen place-items-center bg-forest-900 p-4">
      <Seo title="Admin login" path="/admin/login" noindex />
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-xl bg-white p-8">
        <div className="flex items-center gap-2 font-display text-xl font-extrabold text-forest-800"><Mountain className="text-forest-600" />Joyhimalaya admin</div>
        <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="username" className="input" /></div>
        <div><label className="label" htmlFor="password">Password</label><input id="password" name="password" type="password" required autoComplete="current-password" className="input" /></div>
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}
