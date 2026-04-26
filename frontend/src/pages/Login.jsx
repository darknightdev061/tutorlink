import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LogIn, GraduationCap } from 'lucide-react';

export default function Login() {
  const { signIn } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await signIn(form);
      toast.success('Welcome back!');
      nav('/');
    } catch (err) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="card p-8">
        <div className="text-center mb-6">
          <GraduationCap className="w-10 h-10 mx-auto text-brand-600" />
          <h1 className="text-2xl font-bold mt-2">Welcome back</h1>
          <p className="text-sm text-slate-500">Log in to continue learning.</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" required minLength={6}
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          <button disabled={busy} className="btn-primary w-full">
            <LogIn className="w-4 h-4" /> {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="text-center text-sm text-slate-600 mt-6">
          New here? <Link to="/signup" className="text-brand-700 font-medium">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
