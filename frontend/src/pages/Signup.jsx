import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { UserPlus, GraduationCap } from 'lucide-react';

export default function Signup() {
  const { signUp } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    full_name: '', email: '', password: '',
    role: params.get('as') === 'tutor' ? 'tutor' : 'student'
  });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await signUp(form);
      toast.success('Account created — check email to verify (if enabled).');
      nav('/login');
    } catch (err) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="card p-8">
        <div className="text-center mb-6">
          <GraduationCap className="w-10 h-10 mx-auto text-brand-600" />
          <h1 className="text-2xl font-bold mt-2">Join TutorLink</h1>
          <p className="text-sm text-slate-500">Free for students — apply to teach as a tutor.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {['student','tutor'].map(r => (
            <button key={r} type="button"
              onClick={() => setForm({...form, role: r})}
              className={`py-2.5 rounded-lg border font-medium capitalize transition
                ${form.role === r ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-300 hover:border-brand-400'}`}>
              I'm a {r}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div><label className="label">Full name</label>
            <input className="input" required value={form.full_name}
              onChange={e => setForm({...form, full_name: e.target.value})} /></div>
          <div><label className="label">Email</label>
            <input className="input" type="email" required value={form.email}
              onChange={e => setForm({...form, email: e.target.value})} /></div>
          <div><label className="label">Password</label>
            <input className="input" type="password" required minLength={6} value={form.password}
              onChange={e => setForm({...form, password: e.target.value})} /></div>
          <button disabled={busy} className="btn-primary w-full">
            <UserPlus className="w-4 h-4" /> {busy ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <p className="text-center text-sm text-slate-600 mt-6">
          Already have an account? <Link to="/login" className="text-brand-700 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
