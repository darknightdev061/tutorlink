import { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import {
  Users, GraduationCap, Clock, CheckCircle2, Inbox, Activity, Search,
  Check, X, ChevronDown, ChevronUp, Trash2, Power, UserPlus, BarChart3,
  MessageSquare, IndianRupee, Mail, Phone, MapPin, RefreshCw
} from 'lucide-react';

const TABS = [
  { id: 'overview',  label: 'Overview',          icon: BarChart3 },
  { id: 'tutors',    label: 'Tutor Applications',icon: GraduationCap },
  { id: 'students',  label: 'Students',          icon: Users },
  { id: 'enquiries', label: 'Enquiries',         icon: MessageSquare },
  { id: 'leads',     label: 'Leads',             icon: Inbox },
  { id: 'register',  label: 'Register Student',  icon: UserPlus }
];

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState({});

  const refreshStats = () => api.get('/api/admin/stats').then(r => setStats(r.stats || {})).catch(()=>{});
  useEffect(() => { refreshStats(); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="h-display text-3xl md:text-4xl font-bold">Admin panel</h1>
          <p className="text-slate-600">Manage tutors, students, enquiries and leads — all in one place.</p>
        </div>
        <button onClick={refreshStats} className="btn-outline">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-2">
        {TABS.map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition
                ${active ? 'bg-brand-600 text-white shadow-playful' : 'text-slate-600 hover:bg-slate-100'}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'overview'  && <Overview stats={stats} setTab={setTab} />}
      {tab === 'tutors'    && <TutorApplications onChange={refreshStats} />}
      {tab === 'students'  && <UsersTab role="student" onChange={refreshStats} />}
      {tab === 'enquiries' && <Enquiries />}
      {tab === 'leads'     && <Leads />}
      {tab === 'register'  && <RegisterStudent onCreated={() => { refreshStats(); setTab('students'); }} />}
    </div>
  );
}

/* ------------------------- OVERVIEW ------------------------- */
function Overview({ stats, setTab }) {
  const cards = [
    { icon: Users,          label: 'Students',           value: stats.total_students    || 0, color: 'bg-brand-100 text-brand-700',  goto: 'students'  },
    { icon: GraduationCap,  label: 'Tutors',             value: stats.total_tutors      || 0, color: 'bg-candy-100 text-candy-700',  goto: 'tutors'    },
    { icon: Clock,          label: 'Pending tutor apps', value: stats.pending_tutors    || 0, color: 'bg-sunny-100 text-sunny-800',  goto: 'tutors'    },
    { icon: CheckCircle2,   label: 'Approved tutors',    value: stats.approved_tutors   || 0, color: 'bg-mint-100 text-mint-700',    goto: 'tutors'    },
    { icon: Inbox,          label: 'Total enquiries',    value: stats.total_requests    || 0, color: 'bg-grape-100 text-grape-700',  goto: 'enquiries' },
    { icon: Activity,       label: 'Pending enquiries',  value: stats.pending_requests  || 0, color: 'bg-coral-100 text-coral-700',  goto: 'enquiries' }
  ];

  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(c => (
          <button key={c.label} onClick={() => setTab(c.goto)}
            className="card-fun p-5 flex items-center gap-4 text-left">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${c.color}`}>
              <c.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-900">{c.value}</div>
              <div className="text-sm text-slate-500 font-semibold">{c.label}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <button onClick={() => setTab('tutors')} className="card-fun p-5 text-left">
          <div className="font-bold">Approve tutors</div>
          <p className="text-sm text-slate-600 mt-1">{stats.pending_tutors || 0} applications waiting.</p>
        </button>
        <button onClick={() => setTab('register')} className="card-fun p-5 text-left">
          <div className="font-bold">Register a new student</div>
          <p className="text-sm text-slate-600 mt-1">Onboard a family directly from here.</p>
        </button>
        <button onClick={() => setTab('enquiries')} className="card-fun p-5 text-left">
          <div className="font-bold">View enquiries</div>
          <p className="text-sm text-slate-600 mt-1">All booking requests across the platform.</p>
        </button>
      </div>
    </div>
  );
}

/* ------------------------- TUTOR APPS ------------------------- */
function TutorApplications({ onChange }) {
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setBusy(true);
    const qs = filter ? `?status=${filter}` : '';
    api.get(`/api/admin/tutors${qs}`).then(r => setList(r.tutors || [])).catch(e => toast.error(e.message)).finally(() => setBusy(false));
  };
  useEffect(() => { load(); }, [filter]);

  const decide = async (id, status, reason) => {
    try { await api.patch(`/api/admin/tutors/${id}/approval`, { status, reason });
      toast.success(`Tutor ${status}`); load(); onChange?.(); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <div>
      <div className="flex gap-2 mb-5 flex-wrap">
        {['pending','approved','rejected','suspended',''].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-sm capitalize font-semibold border-2
              ${filter === f ? 'bg-brand-600 text-white border-brand-600' : 'bg-white border-slate-200 hover:border-brand-400'}`}>
            {f || 'all'}
          </button>
        ))}
      </div>

      {busy && <div className="text-slate-500">Loading…</div>}

      <div className="space-y-3">
        {!busy && list.length === 0 && <div className="text-slate-500">No tutors in this category.</div>}
        {list.map(t => (
          <div key={t.user_id} className="card-fun p-5">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="font-bold">{t.user?.full_name || 'Unnamed'}
                  <span className="text-slate-400 text-sm font-normal ml-2">{t.user?.email}</span>
                </div>
                <div className="text-sm text-slate-600 mt-0.5">
                  {(t.subjects || []).join(', ') || '—'} · <span className="inline-flex items-center"><IndianRupee className="w-3 h-3" />{t.hourly_rate}/hr</span> · {t.city || '—'}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Applied {new Date(t.created_at).toLocaleDateString('en-IN')}</div>
              </div>
              <span className={`badge capitalize
                ${t.approval_status === 'pending'   ? 'bg-sunny-100 text-sunny-800'
                : t.approval_status === 'approved'  ? 'bg-mint-100 text-mint-700'
                : t.approval_status === 'rejected'  ? 'bg-red-100 text-red-700'
                                                   : 'bg-slate-200 text-slate-700'}`}>{t.approval_status}</span>
              <button onClick={() => setOpen(open === t.user_id ? null : t.user_id)} className="btn-ghost">
                {open === t.user_id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {t.approval_status !== 'approved' && (
                <button onClick={() => decide(t.user_id, 'approved')} className="btn-primary">
                  <Check className="w-4 h-4" /> Approve
                </button>
              )}
              {t.approval_status !== 'rejected' && (
                <button onClick={() => {
                  const reason = prompt('Rejection reason?');
                  if (reason !== null) decide(t.user_id, 'rejected', reason);
                }} className="btn-ghost text-red-600">
                  <X className="w-4 h-4" /> Reject
                </button>
              )}
            </div>
            {open === t.user_id && (
              <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-700 grid sm:grid-cols-2 gap-3">
                <div><strong>Bio:</strong> {t.bio || '—'}</div>
                <div><strong>Qualifications:</strong> {t.qualifications || '—'}</div>
                <div><strong>Experience:</strong> {t.experience_years || 0} yrs</div>
                <div><strong>Languages:</strong> {(t.languages || []).join(', ') || '—'}</div>
                <div><strong>Service radius:</strong> {t.service_radius_km || 0} km</div>
                <div><strong>Rating:</strong> {t.rating || 0} ({t.total_reviews || 0} reviews)</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------- USERS (Students) ------------------------- */
function UsersTab({ role: initialRole, onChange }) {
  const [list, setList] = useState([]);
  const [role, setRole] = useState(initialRole || '');
  const [q, setQ] = useState('');

  const load = () => {
    const qs = role ? `?role=${role}` : '';
    api.get(`/api/admin/users${qs}`).then(r => setList(r.users || [])).catch(e => toast.error(e.message));
  };
  useEffect(() => { load(); }, [role]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter(u => (u.email || '').toLowerCase().includes(s) || (u.full_name || '').toLowerCase().includes(s));
  }, [list, q]);

  const toggleActive = async (u) => {
    try { await api.patch(`/api/admin/users/${u.id}/active`, { is_active: !u.is_active });
      toast.success(`${u.is_active ? 'Suspended' : 'Reactivated'}`); load(); onChange?.(); }
    catch (e) { toast.error(e.message); }
  };
  const del = async (u) => {
    if (!confirm(`Delete ${u.email}? This cannot be undone.`)) return;
    try { await api.del(`/api/admin/users/${u.id}`); toast.success('Deleted'); load(); onChange?.(); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5 items-center">
        {['','student','tutor','admin'].map(r => (
          <button key={r} onClick={() => setRole(r)}
            className={`px-3.5 py-1.5 rounded-full text-sm capitalize font-semibold border-2
              ${role === r ? 'bg-brand-600 text-white border-brand-600' : 'bg-white border-slate-200 hover:border-brand-400'}`}>
            {r || 'all'}
          </button>
        ))}
        <div className="ml-auto relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name or email…"
            className="input pl-9 py-2 w-72" />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500">No users.</td></tr>
              )}
              {filtered.map(u => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-semibold">{u.full_name || '—'}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.is_active ? 'bg-mint-100 text-mint-700' : 'bg-red-100 text-red-700'}`}>
                      {u.is_active ? 'active' : 'suspended'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3 flex gap-1 justify-end">
                    <button onClick={() => toggleActive(u)} title={u.is_active ? 'Suspend' : 'Reactivate'} className="btn-ghost"><Power className="w-4 h-4" /></button>
                    <button onClick={() => del(u)} title="Delete" className="btn-ghost text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ------------------------- ENQUIRIES ------------------------- */
function Enquiries() {
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const load = () => {
    setBusy(true); setErr('');
    const qs = filter ? `?status=${filter}` : '';
    api.get(`/api/admin/requests${qs}`)
      .then(r => setList(r.requests || []))
      .catch(e => { setErr(e.message); setList([]); })
      .finally(() => setBusy(false));
  };
  useEffect(() => { load(); }, [filter]);

  return (
    <div>
      <div className="flex gap-2 mb-5 flex-wrap">
        {['pending','accepted','declined','cancelled','completed',''].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-sm capitalize font-semibold border-2
              ${filter === f ? 'bg-brand-600 text-white border-brand-600' : 'bg-white border-slate-200 hover:border-brand-400'}`}>
            {f || 'all'}
          </button>
        ))}
      </div>

      {busy && <div className="text-slate-500">Loading…</div>}
      {err && <div className="card-fun p-5 text-sm text-slate-600">
        <div className="font-bold text-red-600 mb-1">Could not load enquiries</div>
        {err}. The endpoint may need to be deployed. Once the latest backend is live, this list will populate automatically.
      </div>}

      <div className="space-y-3">
        {!busy && !err && list.length === 0 && <div className="text-slate-500">No enquiries in this category.</div>}
        {list.map(r => (
          <div key={r.id} className="card-fun p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-[260px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold">{r.student?.full_name || r.student?.email || 'Student'}</span>
                  <span className="text-slate-400">→</span>
                  <span className="font-bold text-brand-700">{r.tutor?.full_name || r.tutor?.email || 'Tutor'}</span>
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  <b>{r.subject || 'General'}</b> · {r.mode || 'online'} · {r.duration_minutes || 60} min
                </div>
                {r.message && <p className="text-sm text-slate-600 mt-2 bg-slate-50 rounded-lg p-3">"{r.message}"</p>}
                <div className="text-xs text-slate-500 mt-2 flex flex-wrap gap-3">
                  {r.student?.phone && <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" />{r.student.phone}</span>}
                  {r.student?.email && <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3" />{r.student.email}</span>}
                  {r.student?.city && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{r.student.city}</span>}
                  <span>Sent {new Date(r.created_at).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
              <span className={`badge capitalize
                ${r.status === 'pending'   ? 'bg-sunny-100 text-sunny-800'
                : r.status === 'accepted'  ? 'bg-mint-100 text-mint-700'
                : r.status === 'declined'  ? 'bg-red-100 text-red-700'
                : r.status === 'cancelled' ? 'bg-slate-200 text-slate-700'
                                           : 'bg-brand-100 text-brand-700'}`}>{r.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------- LEADS ------------------------- */
function Leads() {
  const [list, setList] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    setBusy(true); setErr('');
    api.get('/api/admin/leads')
      .then(r => setList(r.leads || []))
      .catch(e => { setErr(e.message); setList([]); })
      .finally(() => setBusy(false));
  }, []);

  return (
    <div>
      <p className="text-slate-600 mb-5">Students who signed up but haven't booked their first session yet — perfect candidates for a follow-up call or WhatsApp message.</p>
      {busy && <div className="text-slate-500">Loading…</div>}
      {err && <div className="card-fun p-5 text-sm text-slate-600">
        <div className="font-bold text-red-600 mb-1">Could not load leads</div>
        {err}. The endpoint may need to be deployed.
      </div>}
      {!busy && !err && list.length === 0 && <div className="text-slate-500">No outstanding leads — everyone has booked.</div>}

      <div className="grid md:grid-cols-2 gap-3">
        {list.map(u => (
          <div key={u.id} className="card-fun p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-bold">{u.full_name || 'Unnamed student'}</div>
                <div className="text-sm text-slate-600">{u.email}</div>
                <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-3">
                  {u.phone && <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" />{u.phone}</span>}
                  {u.city  && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{u.city}</span>}
                  <span>Joined {new Date(u.created_at).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                {u.email && <a href={`mailto:${u.email}`} className="btn-outline py-1.5 px-3 text-xs"><Mail className="w-3.5 h-3.5" /> Email</a>}
                {u.phone && <a href={`https://wa.me/${u.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="btn-mint py-1.5 px-3 text-xs"><MessageSquare className="w-3.5 h-3.5" /> WA</a>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------- REGISTER STUDENT ------------------------- */
function RegisterStudent({ onCreated }) {
  const [form, setForm] = useState({ email: '', password: '', full_name: '', phone: '', city: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setBusy(true);
    try {
      await api.post('/api/admin/users/register', { ...form, role: 'student' });
      toast.success(`Student ${form.full_name || form.email} registered`);
      setForm({ email: '', password: '', full_name: '', phone: '', city: '' });
      onCreated?.();
    } catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="max-w-2xl">
      <p className="text-slate-600 mb-5">Onboard a student directly. They'll receive login credentials by email and can log in immediately.</p>
      <form onSubmit={submit} className="card-fun p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Aarav Sharma" required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} placeholder="parent@example.com" required />
          </div>
          <div>
            <label className="label">Temporary password</label>
            <input className="input" type="text" value={form.password} minLength={6}
              onChange={e => setForm({ ...form, password: e.target.value })} placeholder="min 6 characters" required />
          </div>
          <div>
            <label className="label">Phone (with country code)</label>
            <input className="input" value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 90000 12345" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">City</label>
            <input className="input" value={form.city}
              onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Bengaluru" />
          </div>
        </div>
        <button disabled={busy} className="btn-primary"><UserPlus className="w-4 h-4" /> {busy ? 'Registering…' : 'Register student'}</button>
      </form>
    </div>
  );
}
