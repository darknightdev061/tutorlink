import { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Users, GraduationCap, Clock, CheckCircle2, Inbox, Activity, Search,
  Check, X, ChevronDown, ChevronUp, Trash2, Power, UserPlus, BarChart3,
  MessageSquare, IndianRupee, Mail, Phone, MapPin, RefreshCw,
  FileText, Save, Plus, Trash, Settings, LogOut
} from 'lucide-react';

const TABS = [
  { id: 'overview',         label: 'Overview',           icon: BarChart3 },
  { id: 'public_enquiries', label: 'Contact Form Leads', icon: MessageSquare },
  { id: 'tutors',           label: 'Tutor Applications', icon: GraduationCap },
  { id: 'students',         label: 'Students',           icon: Users },
  { id: 'enquiries',        label: 'Bookings',           icon: Inbox },
  { id: 'leads',            label: 'Inactive Students',  icon: Inbox },
  { id: 'register',         label: 'Register Student',   icon: UserPlus },
  { id: 'content',          label: 'Site Content',       icon: FileText }
];

export default function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [statsErr, setStatsErr] = useState('');
  const [me, setMe] = useState(null);

  const refreshStats = async () => {
    setStatsErr('');
    try {
      const r = await api.get('/api/admin/stats');
      setStats(r.stats || {});
    } catch (e) {
      setStatsErr(e.message);
      toast.error('Stats: ' + e.message);
    }
  };

  useEffect(() => {
    // Use the role from AuthContext if available — avoids a second /auth/me round trip.
    // Fall back to a fresh /auth/me only when profile isn't loaded yet (cold reloads).
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setStatsErr('No active session — please log in again.'); return; }

        let role = profile?.role;
        if (!role) {
          try {
            const { user } = await api.get('/api/auth/me');
            setMe(user);
            role = user?.role;
          } catch (e) { /* ignore — fall through and try stats anyway */ }
        } else {
          setMe({ email: profile.email, full_name: profile.full_name, role });
        }

        if (role && role !== 'admin') {
          setStatsErr(`Logged in as ${role} — admin access required.`);
          return;
        }
        await refreshStats();
      } catch (e) { setStatsErr(e.message); }
    })();
  }, [profile?.role]);

  const role = me?.role || profile?.role;
  const email = me?.email || profile?.email;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="h-display text-3xl md:text-4xl font-bold">Admin panel</h1>
          <p className="text-slate-600">Manage tutors, students, enquiries and leads — all in one place.</p>
          <p className="text-xs text-slate-400 mt-1">
            Signed in as <b className="text-slate-700">{email || '—'}</b>
            {' '}· role: <span className={`pill ${role === 'admin' ? 'bg-mint-100 text-mint-700' : 'bg-red-100 text-red-700'}`}>{role || 'unknown'}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={refreshStats} className="btn-outline">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={async () => { await signOut(); window.location.href = '/'; }} className="btn-ghost">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      {statsErr && (
        <div className="card-fun p-4 mb-5 bg-red-50 border-red-200">
          <div className="font-bold text-red-700">Could not load admin data</div>
          <p className="text-sm text-slate-700 mt-1">{statsErr}</p>
          {role && role !== 'admin' && (
            <button onClick={async () => { await signOut(); window.location.href = '/login'; }} className="btn-danger mt-3 py-2 text-sm">
              Sign out and log in as admin
            </button>
          )}
        </div>
      )}

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

      {tab === 'overview'         && <Overview stats={stats} setTab={setTab} />}
      {tab === 'public_enquiries' && <PublicEnquiries />}
      {tab === 'tutors'           && <TutorApplications onChange={refreshStats} />}
      {tab === 'students'         && <UsersTab role="student" onChange={refreshStats} />}
      {tab === 'enquiries'        && <Enquiries />}
      {tab === 'leads'            && <Leads />}
      {tab === 'register'         && <RegisterStudent onCreated={() => { refreshStats(); setTab('students'); }} />}
      {tab === 'content'          && <SiteContent />}
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

/* ------------------------- USERS (Students / Tutors) ------------------------- */
// In-memory cache so flipping tabs doesn't re-fetch
const usersCache = {};

function UsersTab({ role: initialRole, onChange }) {
  const [list, setList] = useState(() => usersCache[initialRole || ''] || []);
  const [role, setRole] = useState(initialRole || '');
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(!usersCache[initialRole || '']);
  const [err, setErr] = useState('');

  const load = async () => {
    setErr(''); setBusy(true);
    try {
      const qs = role ? `?role=${role}` : '';
      const r = await api.get(`/api/admin/users${qs}`);
      const users = r.users || [];
      usersCache[role] = users;
      setList(users);
    } catch (e) { setErr(e.message); toast.error(e.message); }
    finally { setBusy(false); }
  };
  useEffect(() => { load(); }, [role]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter(u =>
      (u.email || '').toLowerCase().includes(s) ||
      (u.full_name || '').toLowerCase().includes(s) ||
      (u.student?.roll_number || '').toLowerCase().includes(s) ||
      (u.student?.preferred_subjects || []).join(' ').toLowerCase().includes(s) ||
      (u.tutor?.subjects || []).join(' ').toLowerCase().includes(s)
    );
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
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, email, roll, subject…"
            className="input pl-9 py-2 w-72" />
        </div>
      </div>

      {busy && list.length === 0 && <div className="text-slate-500 py-4">Loading…</div>}
      {err && !list.length && <div className="card-fun p-4 bg-red-50 border-red-200 text-red-700 text-sm">{err}</div>}

      <div className="space-y-3">
        {filtered.length === 0 && !busy && <div className="text-slate-500">No users.</div>}
        {filtered.map(u => (
          <UserRow key={u.id} u={u} onToggle={toggleActive} onDelete={del} />
        ))}
      </div>
    </div>
  );
}

function UserRow({ u, onToggle, onDelete }) {
  const isStudent = u.role === 'student';
  const isTutor   = u.role === 'tutor';
  return (
    <div className="card-fun p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[280px]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-lg">{u.full_name || '— unnamed —'}</span>
            <span className={`pill capitalize ${isStudent ? 'bg-brand-100 text-brand-700' : isTutor ? 'bg-candy-100 text-candy-700' : 'bg-slate-200 text-slate-700'}`}>{u.role}</span>
            {isStudent && u.student?.roll_number && (
              <span className="pill bg-sunny-100 text-sunny-800">Roll {u.student.roll_number}</span>
            )}
            <span className={`pill ${u.is_active ? 'bg-mint-100 text-mint-700' : 'bg-red-100 text-red-700'}`}>{u.is_active ? 'active' : 'suspended'}</span>
            {isTutor && u.tutor?.approval_status && (
              <span className={`pill capitalize ${u.tutor.approval_status === 'approved' ? 'bg-mint-100 text-mint-700' : u.tutor.approval_status === 'pending' ? 'bg-sunny-100 text-sunny-800' : 'bg-red-100 text-red-700'}`}>{u.tutor.approval_status}</span>
            )}
          </div>
          <div className="text-sm text-slate-500 mt-1 flex flex-wrap gap-x-3">
            <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3" />{u.email}</span>
            <span>Joined {new Date(u.created_at).toLocaleDateString('en-IN')}</span>
          </div>

          {isStudent && u.student && (
            <div className="mt-3 space-y-3 text-sm">
              <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1">
                {u.student.grade_level && <div><b>Class:</b> {u.student.grade_level}</div>}
                {u.student.preferred_subjects?.length > 0 && (
                  <div className="sm:col-span-2">
                    <b>Tuition for:</b>{' '}
                    {u.student.preferred_subjects.map((s,i) => <span key={i} className="chip mr-1.5">{s}</span>)}
                  </div>
                )}
              </div>

              {(u.student.address_line1 || u.student.city || u.student.state) && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="font-bold text-slate-700 text-xs uppercase tracking-wide mb-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Address</div>
                  <div className="text-slate-700">
                    {[u.student.address_line1, u.student.address_line2].filter(Boolean).join(', ')}
                    {(u.student.address_line1 || u.student.address_line2) && <br />}
                    {[u.student.city, u.student.state, u.student.zip_code].filter(Boolean).join(' · ')}
                  </div>
                </div>
              )}

              {(u.student.guardian_name || u.student.guardian_phone || u.student.alternate_phone || u.student.guardian_email) && (
                <div className="bg-brand-50/60 rounded-xl p-3">
                  <div className="font-bold text-brand-700 text-xs uppercase tracking-wide mb-1">Guardian / contact</div>
                  <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-slate-700">
                    {u.student.guardian_name     && <div><b>{u.student.guardian_relation || 'Guardian'}:</b> {u.student.guardian_name}</div>}
                    {u.student.guardian_phone    && <div className="inline-flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> <a href={`tel:${u.student.guardian_phone}`} className="hover:text-brand-700">{u.student.guardian_phone}</a></div>}
                    {u.student.alternate_phone   && <div className="inline-flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> <a href={`tel:${u.student.alternate_phone}`} className="hover:text-brand-700">{u.student.alternate_phone}</a> <span className="text-slate-400 text-xs">(alt)</span></div>}
                    {u.student.guardian_email    && <div className="inline-flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> <a href={`mailto:${u.student.guardian_email}`} className="hover:text-brand-700">{u.student.guardian_email}</a></div>}
                  </div>
                </div>
              )}
            </div>
          )}

          {isTutor && u.tutor && (
            <div className="mt-3 grid sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
              {u.tutor.subjects?.length > 0 && (
                <div className="sm:col-span-2">
                  <b>Teaches:</b>{' '}
                  {u.tutor.subjects.map((s,i) => <span key={i} className="chip mr-1.5">{s}</span>)}
                </div>
              )}
              {u.tutor.qualifications && <div className="sm:col-span-2"><b>Qualifications:</b> <span className="text-slate-600">{u.tutor.qualifications}</span></div>}
              {u.tutor.bio            && <div className="sm:col-span-2 text-slate-600 italic">"{u.tutor.bio}"</div>}
              {typeof u.tutor.hourly_rate === 'number' && <div className="inline-flex items-center"><b>Rate:</b><IndianRupee className="w-3 h-3 mx-0.5 text-slate-500" />{u.tutor.hourly_rate}/hr</div>}
              {typeof u.tutor.experience_years === 'number' && <div><b>Experience:</b> {u.tutor.experience_years} yrs</div>}
              {u.tutor.city           && <div className="inline-flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {u.tutor.city}</div>}
              {u.tutor.languages?.length > 0 && <div><b>Languages:</b> {u.tutor.languages.join(', ')}</div>}
              {(u.tutor.rating > 0 || u.tutor.total_reviews > 0) && (
                <div><b>Rating:</b> {u.tutor.rating} ★ ({u.tutor.total_reviews} reviews)</div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-1.5">
          <button onClick={() => onToggle(u)} title={u.is_active ? 'Suspend' : 'Reactivate'} className="btn-outline py-1.5 px-3 text-xs">
            <Power className="w-3.5 h-3.5" /> {u.is_active ? 'Suspend' : 'Reactivate'}
          </button>
          <button onClick={() => onDelete(u)} title="Delete" className="btn-ghost text-red-600 py-1.5 px-3 text-xs">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------- BOOKINGS (logged-in student requests) ------------------------- */
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

  const setStatus = async (id, status) => {
    try { await api.patch(`/api/admin/requests/${id}`, { status });
      toast.success(`Marked ${status}`); load(); }
    catch (e) { toast.error(e.message); }
  };
  const remove = async (id) => {
    if (!confirm('Delete this booking? This cannot be undone.')) return;
    try { await api.del(`/api/admin/requests/${id}`); toast.success('Deleted'); load(); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <div>
      <p className="text-slate-600 mb-4">Booking requests from logged-in students to tutors. Use the action buttons to confirm, decline, complete or cancel.</p>
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
      {err && <div className="card-fun p-5 text-sm text-slate-600 bg-red-50 border-red-200">
        <div className="font-bold text-red-700 mb-1">Could not load bookings</div>{err}
      </div>}

      <div className="space-y-3">
        {!busy && !err && list.length === 0 && <div className="text-slate-500">No bookings in this category.</div>}
        {list.map(r => {
          const stu = r.student || {};
          const tut = r.tutor || {};
          const phone = stu.phone || stu.guardian_phone;
          return (
            <div key={r.id} className="card-fun p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-[260px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold">{stu.full_name || stu.email || 'Student'}</span>
                    <span className="text-slate-400">→</span>
                    <span className="font-bold text-brand-700">{tut.full_name || tut.email || 'Tutor'}</span>
                    <span className={`pill capitalize
                      ${r.status === 'pending'   ? 'bg-sunny-100 text-sunny-800'
                      : r.status === 'accepted'  ? 'bg-mint-100 text-mint-700'
                      : r.status === 'declined'  ? 'bg-red-100 text-red-700'
                      : r.status === 'cancelled' ? 'bg-slate-200 text-slate-700'
                                                 : 'bg-brand-100 text-brand-700'}`}>{r.status}</span>
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    <b>{r.subject || 'General'}</b> · {r.duration_minutes || 60} min
                    {r.preferred_date && <> · {new Date(r.preferred_date).toLocaleString('en-IN')}</>}
                  </div>
                  {r.message && <p className="text-sm text-slate-600 mt-2 bg-slate-50 rounded-lg p-3 italic">"{r.message}"</p>}
                  <div className="text-xs text-slate-500 mt-2 flex flex-wrap gap-3">
                    {stu.email && <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3" />{stu.email}</span>}
                    {phone     && <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" />{phone}</span>}
                    {stu.city  && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{stu.city}</span>}
                    {stu.grade_level && <span><b>Class:</b> {stu.grade_level}</span>}
                    <span>Sent {new Date(r.created_at).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-1.5">
                  {phone && <a href={`https://wa.me/${phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="btn-mint py-1.5 px-3 text-xs"><MessageSquare className="w-3.5 h-3.5" /> WhatsApp</a>}
                  {phone && <a href={`tel:${phone}`} className="btn-outline py-1.5 px-3 text-xs"><Phone className="w-3.5 h-3.5" /> Call</a>}
                  {r.status !== 'accepted'  && <button onClick={() => setStatus(r.id, 'accepted')}  className="btn-primary py-1.5 px-3 text-xs"><Check className="w-3.5 h-3.5" /> Accept</button>}
                  {r.status !== 'declined' && r.status !== 'cancelled' && <button onClick={() => setStatus(r.id, 'declined')} className="btn-ghost py-1.5 px-3 text-xs text-red-600"><X className="w-3.5 h-3.5" /> Decline</button>}
                  {r.status === 'accepted' && <button onClick={() => setStatus(r.id, 'completed')} className="btn-ghost py-1.5 px-3 text-xs text-mint-700"><CheckCircle2 className="w-3.5 h-3.5" /> Mark completed</button>}
                  {r.status !== 'cancelled' && r.status !== 'completed' && <button onClick={() => setStatus(r.id, 'cancelled')} className="btn-ghost py-1.5 px-3 text-xs text-slate-500">Cancel</button>}
                  <button onClick={() => remove(r.id)} className="btn-ghost py-1.5 px-3 text-xs text-red-600"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------- PUBLIC ENQUIRIES (no-login contact form) ------------------------- */
function PublicEnquiries() {
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState('new');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const load = async () => {
    setBusy(true); setErr('');
    try {
      const qs = filter ? `?status=${filter}` : '';
      const r = await api.get(`/api/admin/public-enquiries${qs}`);
      setList(r.enquiries || []);
    } catch (e) { setErr(e.message); setList([]); }
    finally { setBusy(false); }
  };
  useEffect(() => { load(); }, [filter]);

  const setStatus = async (id, status) => {
    try { await api.patch(`/api/admin/public-enquiries/${id}`, { status });
      toast.success(status); load(); }
    catch (e) { toast.error(e.message); }
  };
  const remove = async (id) => {
    if (!confirm('Delete this enquiry?')) return;
    try { await api.del(`/api/admin/public-enquiries/${id}`); toast.success('Deleted'); load(); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <div>
      <p className="text-slate-600 mb-4">Leads from the public contact form (no login required). Mark as <b>contacted</b> after you call them, <b>converted</b> when they sign up, or <b>junk</b> for spam.</p>
      <div className="flex gap-2 mb-5 flex-wrap">
        {['new','contacted','converted','junk',''].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-sm capitalize font-semibold border-2
              ${filter === f ? 'bg-brand-600 text-white border-brand-600' : 'bg-white border-slate-200 hover:border-brand-400'}`}>
            {f || 'all'}
          </button>
        ))}
      </div>

      {busy && <div className="text-slate-500">Loading…</div>}
      {err && <div className="card-fun p-5 text-sm text-slate-600 bg-red-50 border-red-200">
        <div className="font-bold text-red-700">Could not load</div>{err}
      </div>}
      {!busy && !err && list.length === 0 && <div className="text-slate-500">No enquiries in this category.</div>}

      <div className="space-y-3">
        {list.map(e => (
          <div key={e.id} className="card-fun p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-[260px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-lg">{e.full_name}</span>
                  <span className={`pill capitalize ${e.type === 'tutor' ? 'bg-candy-100 text-candy-700' : 'bg-brand-100 text-brand-700'}`}>{e.type === 'tutor' ? 'Wants to teach' : 'Wants a tutor'}</span>
                  <span className={`pill capitalize
                    ${e.status === 'new'        ? 'bg-sunny-100 text-sunny-800'
                    : e.status === 'contacted'  ? 'bg-brand-100 text-brand-700'
                    : e.status === 'converted'  ? 'bg-mint-100 text-mint-700'
                    :                              'bg-slate-200 text-slate-700'}`}>{e.status}</span>
                </div>

                <div className="mt-2 grid sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  {e.phone       && <div className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> <a href={`tel:${e.phone}`} className="hover:text-brand-700">{e.phone}</a></div>}
                  {e.email       && <div className="inline-flex items-center gap-1"><Mail  className="w-3.5 h-3.5 text-slate-400" /> <a href={`mailto:${e.email}`} className="hover:text-brand-700">{e.email}</a></div>}
                  {e.city        && <div className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {e.city}</div>}
                  {e.grade_level && <div><b>Class:</b> {e.grade_level}</div>}
                </div>

                {e.subjects?.length > 0 && (
                  <div className="mt-2 text-sm">
                    <b>Subjects:</b> {e.subjects.map((s,i) => <span key={i} className="chip mr-1.5">{s}</span>)}
                  </div>
                )}

                {e.message && <p className="text-sm text-slate-600 mt-2 bg-slate-50 rounded-lg p-3 italic">"{e.message}"</p>}

                <div className="text-xs text-slate-400 mt-2">
                  Source: {e.source || '—'} · Submitted {new Date(e.created_at).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                {e.phone && <a href={`https://wa.me/${e.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="btn-mint py-1.5 px-3 text-xs"><MessageSquare className="w-3.5 h-3.5" /> WhatsApp</a>}
                {e.phone && <a href={`tel:${e.phone}`} className="btn-outline py-1.5 px-3 text-xs"><Phone className="w-3.5 h-3.5" /> Call</a>}
                {e.status !== 'contacted' && <button onClick={() => setStatus(e.id, 'contacted')} className="btn-ghost py-1.5 px-3 text-xs">Mark contacted</button>}
                {e.status !== 'converted' && <button onClick={() => setStatus(e.id, 'converted')} className="btn-ghost py-1.5 px-3 text-xs text-mint-700">Mark converted</button>}
                {e.status !== 'junk'      && <button onClick={() => setStatus(e.id, 'junk')}      className="btn-ghost py-1.5 px-3 text-xs text-slate-500">Mark junk</button>}
                <button onClick={() => remove(e.id)} className="btn-ghost py-1.5 px-3 text-xs text-red-600"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
              </div>
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
  const empty = {
    full_name: '', email: '', password: '',
    roll_number: '', grade_level: '',
    preferred_subjects: '',
    address_line1: '', address_line2: '',
    city: '', state: '', zip_code: '',
    guardian_name: '', guardian_relation: '', guardian_phone: '',
    guardian_email: '', alternate_phone: ''
  };
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setBusy(true);
    try {
      const subjects = form.preferred_subjects.split(',').map(s => s.trim()).filter(Boolean);
      await api.post('/api/admin/users/register', {
        role: 'student',
        full_name: form.full_name, email: form.email, password: form.password,
        roll_number: form.roll_number || undefined,
        grade_level: form.grade_level,
        preferred_subjects: subjects,
        address_line1: form.address_line1, address_line2: form.address_line2,
        city: form.city, state: form.state, zip_code: form.zip_code,
        guardian_name: form.guardian_name,
        guardian_relation: form.guardian_relation,
        guardian_phone: form.guardian_phone,
        guardian_email: form.guardian_email,
        alternate_phone: form.alternate_phone
      });
      toast.success(`Student ${form.full_name || form.email} registered`);
      setForm(empty);
      onCreated?.();
    } catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  };
  const set = (k, v) => setForm({ ...form, [k]: v });

  return (
    <div className="max-w-3xl">
      <p className="text-slate-600 mb-5">Onboard a student directly. They'll receive login credentials by email and can log in immediately. Roll number is auto-generated (TL-XXXX) if you leave it blank.</p>
      <form onSubmit={submit} className="card-fun p-6 space-y-6">

        <div>
          <h3 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wide">Student details</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Full name *</label>
              <input className="input" value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Aarav Sharma" required /></div>
            <div><label className="label">Roll number (optional)</label>
              <input className="input" value={form.roll_number} onChange={e => set('roll_number', e.target.value)} placeholder="TL-0042 (auto if blank)" /></div>
            <div><label className="label">Email *</label>
              <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="parent@example.com" required /></div>
            <div><label className="label">Temporary password *</label>
              <input className="input" type="text" value={form.password} minLength={6} onChange={e => set('password', e.target.value)} placeholder="min 6 characters" required /></div>
            <div><label className="label">Class / Grade</label>
              <input className="input" value={form.grade_level} onChange={e => set('grade_level', e.target.value)} placeholder="Class 7" /></div>
            <div className="sm:col-span-2"><label className="label">Subjects taking tuition for (comma-separated)</label>
              <input className="input" value={form.preferred_subjects} onChange={e => set('preferred_subjects', e.target.value)} placeholder="Mathematics, Science, English" /></div>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wide">Address</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><label className="label">Address line 1</label>
              <input className="input" value={form.address_line1} onChange={e => set('address_line1', e.target.value)} placeholder="Flat 402, Symphony Apartments, Baner Road" /></div>
            <div className="sm:col-span-2"><label className="label">Address line 2 (optional)</label>
              <input className="input" value={form.address_line2} onChange={e => set('address_line2', e.target.value)} placeholder="Aundh, near Westend Mall" /></div>
            <div><label className="label">City</label>
              <input className="input" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Bengaluru" /></div>
            <div><label className="label">State</label>
              <input className="input" value={form.state} onChange={e => set('state', e.target.value)} placeholder="Karnataka" /></div>
            <div><label className="label">PIN / Zip</label>
              <input className="input" value={form.zip_code} onChange={e => set('zip_code', e.target.value)} placeholder="560038" /></div>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wide">Guardian / contact</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Guardian name</label>
              <input className="input" value={form.guardian_name} onChange={e => set('guardian_name', e.target.value)} placeholder="Rohan Sharma" /></div>
            <div><label className="label">Relation</label>
              <input className="input" value={form.guardian_relation} onChange={e => set('guardian_relation', e.target.value)} placeholder="Father / Mother / Guardian" /></div>
            <div><label className="label">Guardian phone</label>
              <input className="input" value={form.guardian_phone} onChange={e => set('guardian_phone', e.target.value)} placeholder="+91 90000 11111" /></div>
            <div><label className="label">Alternate phone</label>
              <input className="input" value={form.alternate_phone} onChange={e => set('alternate_phone', e.target.value)} placeholder="+91 90000 22222" /></div>
            <div className="sm:col-span-2"><label className="label">Guardian email</label>
              <input className="input" type="email" value={form.guardian_email} onChange={e => set('guardian_email', e.target.value)} placeholder="parent@example.com" /></div>
          </div>
        </div>

        <button disabled={busy} className="btn-primary"><UserPlus className="w-4 h-4" /> {busy ? 'Registering…' : 'Register student'}</button>
      </form>
    </div>
  );
}

/* ------------------------- SITE CONTENT ------------------------- */
const DEFAULT_CONTENT = {
  hero: {
    badge: 'Made in India 🇮🇳 • For every Indian child',
    title_part1: 'Learning that feels',
    title_highlight: 'play time',
    title_part2: 'not homework',
    subtitle: "India's friendliest 1-on-1 tutoring platform — connect with a verified, hand-picked tutor for your child, from Class 1 to Class 12. Boards, JEE, NEET, Olympiads, coding, music & more — all from ₹199 / hour.",
    cta_primary: 'Start free — book a demo',
    cta_secondary: 'Browse 3,400+ tutors'
  },
  stats: [
    { value: '12,000+', label: 'Happy students' },
    { value: '3,400+',  label: 'Verified tutors' },
    { value: '50+',     label: 'Subjects offered' },
    { value: '4.9 ★',   label: 'Average rating' },
    { value: '98%',     label: 'Parents recommend' },
    { value: '120+',    label: 'Cities covered' }
  ],
  plans: [
    { name: 'Starter',  price: 1999, per: 'month', badge: '',             desc: 'Perfect to try out — for one subject, 8 sessions a month.',
      features: ['8 sessions / month (45 mins each)','1 subject of your choice','Free demo session','WhatsApp doubt support','Cancel anytime'] },
    { name: 'Smart',    price: 3499, per: 'month', badge: 'Most Popular', desc: 'Most-loved plan — covers two subjects with weekly tests.',
      features: ['16 sessions / month','Up to 2 subjects','Weekly mock tests + analysis','Monthly parent report card','Priority tutor matching','Class recordings (30-day access)'] },
    { name: 'Champion', price: 5999, per: 'month', badge: 'Best Value',   desc: 'For boards & competitive prep — unlimited subjects + mentor.',
      features: ['Unlimited sessions (Mon–Sat)','All subjects + Olympiad prep','Daily DPPs + AI doubt-bot','Dedicated academic mentor','JEE / NEET / CUET test series','1-on-1 career counselling'] }
  ],
  hourly_starts_at: 199,
  contact: {
    email: 'hello@tutorlink.in',
    phone: '+91 90000 12345',
    whatsapp: '+919000012345'
  }
};

function SiteContent() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [busy, setBusy] = useState(false);
  const [missingTable, setMissingTable] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    api.get('/api/admin/site/content/landing')
      .then(r => {
        if (r.missing_table) setMissingTable(true);
        if (r.data && Object.keys(r.data).length) setContent({ ...DEFAULT_CONTENT, ...r.data });
        if (r.updated_at) setSavedAt(r.updated_at);
      })
      .catch(e => toast.error(e.message));
  }, []);

  const save = async () => {
    setBusy(true);
    try {
      const r = await api.patch('/api/admin/site/content/landing', { data: content });
      setSavedAt(r.updated_at);
      toast.success('Saved — live on the site in seconds');
    } catch (e) {
      if (/site_content table missing/i.test(e.message)) setMissingTable(true);
      toast.error(e.message);
    } finally { setBusy(false); }
  };

  const setHero  = (k, v) => setContent({ ...content, hero: { ...content.hero, [k]: v } });
  const setStat  = (i, k, v) => setContent({ ...content, stats: content.stats.map((s, idx) => idx === i ? { ...s, [k]: v } : s) });
  const setPlan  = (i, k, v) => setContent({ ...content, plans: content.plans.map((p, idx) => idx === i ? { ...p, [k]: v } : p) });
  const setPlanFeat = (pi, fi, v) => setContent({ ...content, plans: content.plans.map((p, idx) =>
    idx === pi ? { ...p, features: p.features.map((f, j) => j === fi ? v : f) } : p) });
  const addPlanFeat = (pi) => setContent({ ...content, plans: content.plans.map((p, idx) =>
    idx === pi ? { ...p, features: [...p.features, 'New feature'] } : p) });
  const delPlanFeat = (pi, fi) => setContent({ ...content, plans: content.plans.map((p, idx) =>
    idx === pi ? { ...p, features: p.features.filter((_, j) => j !== fi) } : p) });
  const setContact = (k, v) => setContent({ ...content, contact: { ...content.contact, [k]: v } });

  return (
    <div className="space-y-8 max-w-4xl">
      {missingTable && (
        <div className="card-fun p-5 bg-coral-50 border-coral-200">
          <div className="font-bold text-coral-700 mb-2 flex items-center gap-2"><Settings className="w-4 h-4" /> One-time setup needed</div>
          <p className="text-sm text-slate-700">The <code className="bg-white px-1.5 rounded">site_content</code> table doesn't exist yet. Open the Supabase SQL editor and run the contents of <code className="bg-white px-1.5 rounded">supabase/site_content.sql</code> from the repo. Saving below will work as soon as the table is created.</p>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="h-display text-2xl font-bold">Edit landing-page content</h2>
          <p className="text-sm text-slate-500">{savedAt ? `Last saved ${new Date(savedAt).toLocaleString('en-IN')}` : 'No saves yet — current values come from defaults.'}</p>
        </div>
        <button onClick={save} disabled={busy} className="btn-primary"><Save className="w-4 h-4" /> {busy ? 'Saving…' : 'Save changes'}</button>
      </div>

      {/* HERO */}
      <section className="card-fun p-6">
        <h3 className="h-display text-xl font-bold mb-4">Hero section</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Badge text</label>
            <input className="input" value={content.hero.badge} onChange={e => setHero('badge', e.target.value)} />
          </div>
          <div><label className="label">Title — first line</label>
            <input className="input" value={content.hero.title_part1} onChange={e => setHero('title_part1', e.target.value)} /></div>
          <div><label className="label">Title — highlighted word</label>
            <input className="input" value={content.hero.title_highlight} onChange={e => setHero('title_highlight', e.target.value)} /></div>
          <div className="sm:col-span-2"><label className="label">Title — last line</label>
            <input className="input" value={content.hero.title_part2} onChange={e => setHero('title_part2', e.target.value)} /></div>
          <div className="sm:col-span-2"><label className="label">Subtitle</label>
            <textarea className="input min-h-[110px]" value={content.hero.subtitle} onChange={e => setHero('subtitle', e.target.value)} /></div>
          <div><label className="label">Primary CTA text</label>
            <input className="input" value={content.hero.cta_primary} onChange={e => setHero('cta_primary', e.target.value)} /></div>
          <div><label className="label">Secondary CTA text</label>
            <input className="input" value={content.hero.cta_secondary} onChange={e => setHero('cta_secondary', e.target.value)} /></div>
        </div>
      </section>

      {/* STATS */}
      <section className="card-fun p-6">
        <h3 className="h-display text-xl font-bold mb-4">Stats strip (6 numbers)</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {content.stats.map((s, i) => (
            <div key={i} className="grid grid-cols-2 gap-2">
              <input className="input" placeholder="Value" value={s.value} onChange={e => setStat(i, 'value', e.target.value)} />
              <input className="input" placeholder="Label" value={s.label} onChange={e => setStat(i, 'label', e.target.value)} />
            </div>
          ))}
        </div>
      </section>

      {/* PRICING PLANS */}
      <section className="card-fun p-6">
        <h3 className="h-display text-xl font-bold mb-2">Pricing plans (INR)</h3>
        <p className="text-sm text-slate-500 mb-5">All prices in ₹ (INR). Leave badge blank if you don't want a sticker on the card.</p>
        <div className="space-y-5">
          {content.plans.map((p, pi) => (
            <div key={pi} className="border-2 border-slate-100 rounded-2xl p-5 bg-slate-50/40">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div><label className="label">Name</label>
                  <input className="input" value={p.name} onChange={e => setPlan(pi, 'name', e.target.value)} /></div>
                <div><label className="label">Price (₹)</label>
                  <input className="input" type="number" value={p.price} onChange={e => setPlan(pi, 'price', Number(e.target.value) || 0)} /></div>
                <div><label className="label">Per</label>
                  <input className="input" value={p.per} onChange={e => setPlan(pi, 'per', e.target.value)} placeholder="month / hour" /></div>
                <div><label className="label">Badge (optional)</label>
                  <input className="input" value={p.badge || ''} onChange={e => setPlan(pi, 'badge', e.target.value)} placeholder="e.g. Most Popular" /></div>
                <div className="sm:col-span-2 lg:col-span-4"><label className="label">Description</label>
                  <input className="input" value={p.desc} onChange={e => setPlan(pi, 'desc', e.target.value)} /></div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="label !mb-0">Features</label>
                  <button type="button" onClick={() => addPlanFeat(pi)} className="btn-ghost py-1 px-2 text-xs"><Plus className="w-3.5 h-3.5" /> Add</button>
                </div>
                <div className="space-y-2">
                  {p.features.map((f, fi) => (
                    <div key={fi} className="flex gap-2">
                      <input className="input flex-1" value={f} onChange={e => setPlanFeat(pi, fi, e.target.value)} />
                      <button type="button" onClick={() => delPlanFeat(pi, fi)} className="btn-ghost text-red-600 px-2"><Trash className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <label className="label">Pay-per-class hourly rate (₹)</label>
          <input className="input max-w-xs" type="number" value={content.hourly_starts_at}
            onChange={e => setContent({ ...content, hourly_starts_at: Number(e.target.value) || 0 })} />
        </div>
      </section>

      {/* CONTACT */}
      <section className="card-fun p-6">
        <h3 className="h-display text-xl font-bold mb-4">Contact details</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div><label className="label">Email</label>
            <input className="input" value={content.contact.email} onChange={e => setContact('email', e.target.value)} /></div>
          <div><label className="label">Phone (display)</label>
            <input className="input" value={content.contact.phone} onChange={e => setContact('phone', e.target.value)} /></div>
          <div><label className="label">WhatsApp number (no spaces)</label>
            <input className="input" value={content.contact.whatsapp} onChange={e => setContact('whatsapp', e.target.value)} placeholder="+919000012345" /></div>
        </div>
      </section>

      <div className="sticky bottom-4 flex justify-end">
        <button onClick={save} disabled={busy} className="btn-primary shadow-playful"><Save className="w-4 h-4" /> {busy ? 'Saving…' : 'Save all changes'}</button>
      </div>
    </div>
  );
}
