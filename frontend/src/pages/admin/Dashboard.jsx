import { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Users, GraduationCap, Clock, CheckCircle2, Inbox, Activity, Search,
  Check, X, ChevronDown, ChevronUp, Trash2, Power, UserPlus, BarChart3,
  MessageSquare, IndianRupee, Mail, Phone, MapPin, RefreshCw,
  FileText, Save, Plus, Trash, Settings, LogOut, Pencil
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
  const [editing, setEditing] = useState(null); // user being edited

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
          <UserRow key={u.id} u={u} onToggle={toggleActive} onDelete={del} onEdit={() => setEditing(u)} />
        ))}
      </div>

      {editing && (
        <EditUserModal user={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); onChange?.(); }} />
      )}
    </div>
  );
}

function UserRow({ u, onToggle, onDelete, onEdit }) {
  const isStudent = u.role === 'student';
  const isTutor   = u.role === 'tutor';
  const [showAddr, setShowAddr] = useState(false);
  const [showGuardian, setShowGuardian] = useState(false);

  const hasAddress  = isStudent && u.student && (u.student.address_line1 || u.student.address_line2 || u.student.city || u.student.state || u.student.zip_code);
  const hasGuardian = isStudent && u.student && (u.student.guardian_name || u.student.guardian_phone || u.student.alternate_phone || u.student.guardian_email);

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

              <div className="flex flex-wrap gap-2 pt-1">
                {hasAddress && (
                  <button type="button" onClick={() => setShowAddr(s => !s)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-slate-200 hover:border-brand-400 bg-white text-xs font-semibold text-slate-700 hover:text-brand-700 transition">
                    <MapPin className="w-3.5 h-3.5" /> Address
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAddr ? 'rotate-180' : ''}`} />
                  </button>
                )}
                {hasGuardian && (
                  <button type="button" onClick={() => setShowGuardian(s => !s)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-slate-200 hover:border-brand-400 bg-white text-xs font-semibold text-slate-700 hover:text-brand-700 transition">
                    <Users className="w-3.5 h-3.5" /> Guardian details
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showGuardian ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>

              {showAddr && hasAddress && (
                <div className="bg-slate-50 rounded-xl p-3 animate-fade-in">
                  <div className="font-bold text-slate-700 text-xs uppercase tracking-wide mb-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Address</div>
                  <div className="text-slate-700">
                    {[u.student.address_line1, u.student.address_line2].filter(Boolean).join(', ')}
                    {(u.student.address_line1 || u.student.address_line2) && <br />}
                    {[u.student.city, u.student.state, u.student.zip_code].filter(Boolean).join(' · ')}
                  </div>
                </div>
              )}

              {showGuardian && hasGuardian && (
                <div className="bg-brand-50/60 rounded-xl p-3 animate-fade-in">
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

        <div className="flex flex-col gap-1.5">
          <button onClick={() => onEdit?.(u)} className="btn-primary py-1.5 px-3 text-xs">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
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

/* ------------------------- EDIT USER MODAL ------------------------- */
function EditUserModal({ user, onClose, onSaved }) {
  const isStudent = user.role === 'student';
  const isTutor   = user.role === 'tutor';
  const sp = user.student || {};
  const tp = user.tutor   || {};

  const [form, setForm] = useState(() => ({
    full_name: user.full_name || '',
    email: user.email || '',
    // student fields
    grade_level:        sp.grade_level || '',
    preferred_subjects: (sp.preferred_subjects || []).join(', '),
    address_line1:      sp.address_line1 || '',
    address_line2:      sp.address_line2 || '',
    city:               sp.city || '',
    state:              sp.state || '',
    zip_code:           sp.zip_code || '',
    guardian_name:      sp.guardian_name || '',
    guardian_relation:  sp.guardian_relation || '',
    guardian_phone:     sp.guardian_phone || '',
    guardian_email:     sp.guardian_email || '',
    alternate_phone:    sp.alternate_phone || '',
    // tutor fields
    subjects:           (tp.subjects || []).join(', '),
    qualifications:     tp.qualifications || '',
    bio:                tp.bio || '',
    hourly_rate:        tp.hourly_rate ?? '',
    experience_years:   tp.experience_years ?? '',
    languages:          (tp.languages || []).join(', '),
    service_radius_km:  tp.service_radius_km ?? ''
  }));
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm({ ...form, [k]: v });

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { full_name: form.full_name, email: form.email };
      if (isStudent) {
        Object.assign(payload, {
          grade_level: form.grade_level,
          preferred_subjects: form.preferred_subjects.split(',').map(s => s.trim()).filter(Boolean),
          address_line1: form.address_line1, address_line2: form.address_line2,
          city: form.city, state: form.state, zip_code: form.zip_code,
          guardian_name: form.guardian_name, guardian_relation: form.guardian_relation,
          guardian_phone: form.guardian_phone, guardian_email: form.guardian_email,
          alternate_phone: form.alternate_phone
        });
      }
      if (isTutor) {
        Object.assign(payload, {
          subjects: form.subjects.split(',').map(s => s.trim()).filter(Boolean),
          qualifications: form.qualifications, bio: form.bio,
          hourly_rate: form.hourly_rate === '' ? null : Number(form.hourly_rate),
          experience_years: form.experience_years === '' ? null : Number(form.experience_years),
          languages: form.languages.split(',').map(s => s.trim()).filter(Boolean),
          service_radius_km: form.service_radius_km === '' ? null : Number(form.service_radius_km),
          city: form.city
        });
      }
      await api.patch(`/api/admin/users/${user.id}`, payload);
      // Bust any cached lists so the change shows on refresh
      Object.keys(usersCache).forEach(k => delete usersCache[k]);
      toast.success('Saved');
      onSaved?.();
    } catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-playful overflow-hidden animate-pop max-h-[92vh] flex flex-col">
        <div className="relative gradient-rainbow text-white px-6 py-5">
          <button onClick={onClose} aria-label="Close" className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
          <h2 className="h-display text-2xl font-bold">Edit {isStudent ? 'student' : isTutor ? 'tutor' : 'user'}</h2>
          <p className="text-white/85 text-sm mt-1">
            {user.full_name || user.email}
            {isStudent && sp.roll_number && <> · roll <b>{sp.roll_number}</b> <span className="text-white/70">(read-only)</span></>}
          </p>
        </div>

        <form onSubmit={submit} className="overflow-y-auto p-6 space-y-6">
          {/* Basic */}
          <section>
            <h3 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wide">Basic</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="label">Full name</label>
                <input className="input" value={form.full_name} onChange={e => set('full_name', e.target.value)} /></div>
              <div><label className="label">Email</label>
                <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} /></div>
            </div>
          </section>

          {isStudent && (
            <>
              <section>
                <h3 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wide">Academics</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="label">Class / Grade</label>
                    <input className="input" value={form.grade_level} onChange={e => set('grade_level', e.target.value)} /></div>
                  <div className="sm:col-span-2"><label className="label">Subjects taking tuition for (comma-separated)</label>
                    <input className="input" value={form.preferred_subjects} onChange={e => set('preferred_subjects', e.target.value)} /></div>
                </div>
              </section>

              <section>
                <h3 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wide">Address</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2"><label className="label">Address line 1</label>
                    <input className="input" value={form.address_line1} onChange={e => set('address_line1', e.target.value)} /></div>
                  <div className="sm:col-span-2"><label className="label">Address line 2</label>
                    <input className="input" value={form.address_line2} onChange={e => set('address_line2', e.target.value)} /></div>
                  <div><label className="label">City</label><input className="input" value={form.city} onChange={e => set('city', e.target.value)} /></div>
                  <div><label className="label">State</label><input className="input" value={form.state} onChange={e => set('state', e.target.value)} /></div>
                  <div><label className="label">PIN / Zip</label><input className="input" value={form.zip_code} onChange={e => set('zip_code', e.target.value)} /></div>
                </div>
              </section>

              <section>
                <h3 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wide">Guardian / contact</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="label">Guardian name</label><input className="input" value={form.guardian_name} onChange={e => set('guardian_name', e.target.value)} /></div>
                  <div><label className="label">Relation</label><input className="input" value={form.guardian_relation} onChange={e => set('guardian_relation', e.target.value)} /></div>
                  <div><label className="label">Guardian phone</label><input className="input" value={form.guardian_phone} onChange={e => set('guardian_phone', e.target.value)} /></div>
                  <div><label className="label">Alternate phone</label><input className="input" value={form.alternate_phone} onChange={e => set('alternate_phone', e.target.value)} /></div>
                  <div className="sm:col-span-2"><label className="label">Guardian email</label><input className="input" type="email" value={form.guardian_email} onChange={e => set('guardian_email', e.target.value)} /></div>
                </div>
              </section>
            </>
          )}

          {isTutor && (
            <>
              <section>
                <h3 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wide">Teaching profile</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2"><label className="label">Subjects (comma-separated)</label>
                    <input className="input" value={form.subjects} onChange={e => set('subjects', e.target.value)} /></div>
                  <div className="sm:col-span-2"><label className="label">Qualifications</label>
                    <input className="input" value={form.qualifications} onChange={e => set('qualifications', e.target.value)} /></div>
                  <div className="sm:col-span-2"><label className="label">Bio</label>
                    <textarea className="input min-h-[90px]" value={form.bio} onChange={e => set('bio', e.target.value)} /></div>
                  <div><label className="label">Hourly rate (₹)</label>
                    <input className="input" type="number" value={form.hourly_rate} onChange={e => set('hourly_rate', e.target.value)} /></div>
                  <div><label className="label">Experience (years)</label>
                    <input className="input" type="number" value={form.experience_years} onChange={e => set('experience_years', e.target.value)} /></div>
                  <div><label className="label">Languages (comma-separated)</label>
                    <input className="input" value={form.languages} onChange={e => set('languages', e.target.value)} /></div>
                  <div><label className="label">Service radius (km)</label>
                    <input className="input" type="number" value={form.service_radius_km} onChange={e => set('service_radius_km', e.target.value)} /></div>
                  <div className="sm:col-span-2"><label className="label">City</label>
                    <input className="input" value={form.city} onChange={e => set('city', e.target.value)} /></div>
                </div>
              </section>
            </>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 sticky bottom-0 bg-white pb-1">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button disabled={busy} className="btn-primary"><Save className="w-4 h-4" /> {busy ? 'Saving…' : 'Save changes'}</button>
          </div>
        </form>
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
    subtitle: "India's friendliest 1-on-1 tutoring platform — connect with a verified, hand-picked tutor for your child, from Class 1 to Class 12. Boards, coding, music, art & more — all from ₹199 / hour.",
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
    { name: 'Champion', price: 5999, per: 'month', badge: 'Best Value',   desc: 'For boards & all-round prep — unlimited subjects + mentor.',
      features: ['Unlimited sessions (Mon–Sat)','All subjects covered (Class 1–12)','Daily DPPs + AI doubt-bot','Dedicated academic mentor','Weekly chapter tests + analysis','1-on-1 career counselling'] }
  ],
  hourly_starts_at: 199,
  contact: {
    email: 'hello@tutorlink.in',
    phone: '+91 90000 12345',
    whatsapp: '+919000012345'
  },
  // Admin-managed testimonials shown on the landing page.
  testimonials: [
    { name: 'Anjali R.',     role: 'Parent of Class 7 student • Pune',  stars: 5,
      text: 'My son went from struggling in maths to topping his class. The tutor we got was patient, kind, and explained things in Hindi when he got stuck.',
      img: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1000&q=80' },
    { name: 'Kabir S.',      role: 'Class 10 student • Hyderabad',     stars: 5,
      text: 'I found a physics tutor 2 km from my home in 10 minutes. We had a free demo the next evening — booked him immediately. Boards went amazing!',
      img: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80' },
    { name: 'Mrs. Banerjee', role: 'Parent of Class 4 twins • Kolkata', stars: 5,
      text: 'I love the parent dashboard. I can see exactly what my daughters learnt every week, and the tutor sends me a tiny WhatsApp note after each class.',
      img: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80' },
    { name: 'Rajesh K.',     role: 'Parent • Kota',                     stars: 5,
      text: 'TutorLink gave us a 1-on-1 mentor at a fraction of the cost of expensive coachings. My child\'s confidence and grades have both gone up.',
      img: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=1000&q=80' }
  ],
  // Hero / collage / section images. Empty string falls back to defaults.
  images: {
    heroKid:   'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
    classroom: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=1200&q=80',
    online:    'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=1000&q=80',
    primary:   'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1000&q=80',
    middle:    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80',
    high:      'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=1000&q=80',
    parent:    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1000&q=80',
    india:     'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80'
  },
  // Subjects list — admin can add / remove / rename. Icon is a free-text label
  // that maps to a lucide-react icon on the landing page (falls back to BookOpen).
  subjects: [
    { name: 'Mathematics',      icon: 'Calculator',   color: 'bg-brand-100 text-brand-700',  count: 540, blurb: 'From times-tables to calculus' },
    { name: 'Physics',          icon: 'Atom',         color: 'bg-grape-100 text-grape-700',  count: 312, blurb: 'Concepts + numericals for boards' },
    { name: 'Chemistry',        icon: 'FlaskConical', color: 'bg-mint-100 text-mint-700',    count: 287, blurb: 'Concepts + numericals' },
    { name: 'Biology',          icon: 'Microscope',   color: 'bg-coral-100 text-coral-700',  count: 256, blurb: 'Boards-aligned, concept-first' },
    { name: 'English',          icon: 'BookOpen',     color: 'bg-candy-100 text-candy-700',  count: 421, blurb: 'Grammar, writing, spoken' },
    { name: 'Computer Science', icon: 'Code2',        color: 'bg-brand-100 text-brand-700',  count: 298, blurb: 'Python, Java, Scratch & more' },
    { name: 'Hindi & Regional', icon: 'Languages',    color: 'bg-sunny-100 text-sunny-800',  count: 188, blurb: 'Hindi, Tamil, Bengali, Marathi…' },
    { name: 'Social Studies',   icon: 'Globe2',       color: 'bg-grape-100 text-grape-700',  count: 174, blurb: 'History, Civics, Geography' },
    { name: 'Drawing & Art',    icon: 'Palette',      color: 'bg-coral-100 text-coral-700',  count: 132, blurb: 'Sketching, painting, crafts' },
    { name: 'Music',            icon: 'Music',        color: 'bg-candy-100 text-candy-700',  count:  94, blurb: 'Vocals, keyboard, guitar' },
    { name: 'Coding for Kids',  icon: 'Gamepad2',     color: 'bg-mint-100 text-mint-700',    count: 156, blurb: 'Scratch, robotics, games' }
  ],
  // Cities for marquee + cities-covered count.
  cities: [
    'Bengaluru','Delhi NCR','Mumbai','Chennai','Hyderabad','Kolkata','Pune','Ahmedabad',
    'Jaipur','Lucknow','Kochi','Chandigarh','Bhopal','Indore','Patna','Coimbatore'
  ]
};

// Allowed Tailwind color presets for the subject cards (kept short so admin
// picks from a known list — Tailwind purges unknown class strings).
const SUBJECT_COLORS = [
  'bg-brand-100 text-brand-700',
  'bg-grape-100 text-grape-700',
  'bg-mint-100 text-mint-700',
  'bg-coral-100 text-coral-700',
  'bg-candy-100 text-candy-700',
  'bg-sunny-100 text-sunny-800'
];
const SUBJECT_ICONS = [
  'Calculator','Atom','FlaskConical','Microscope','BookOpen','Code2','Languages',
  'Globe2','Palette','Music','Gamepad2','Trophy','PenTool','Brain','Lightbulb',
  'Rocket','GraduationCap','Heart'
];

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

  // Testimonials helpers
  const tList = content.testimonials || [];
  const setT = (i, k, v) => setContent({ ...content, testimonials: tList.map((t, idx) => idx === i ? { ...t, [k]: v } : t) });
  const addT = () => setContent({ ...content, testimonials: [...tList, { name: 'New parent', role: 'Parent • City', text: 'Loved the experience.', img: '', stars: 5 }] });
  const delT = (i) => setContent({ ...content, testimonials: tList.filter((_, idx) => idx !== i) });

  // Images helpers
  const imgs = content.images || {};
  const setImg = (k, v) => setContent({ ...content, images: { ...imgs, [k]: v } });

  // Subjects helpers
  const sList = content.subjects || [];
  const setSubj = (i, k, v) => setContent({ ...content, subjects: sList.map((s, idx) => idx === i ? { ...s, [k]: v } : s) });
  const addSubj = () => setContent({ ...content, subjects: [...sList, { name: 'New subject', blurb: 'Short tagline', count: 0, icon: 'BookOpen', color: SUBJECT_COLORS[0] }] });
  const delSubj = (i) => setContent({ ...content, subjects: sList.filter((_, idx) => idx !== i) });

  // Cities helpers
  const cList = content.cities || [];
  const setCity = (i, v) => setContent({ ...content, cities: cList.map((c, idx) => idx === i ? v : c) });
  const addCity = () => setContent({ ...content, cities: [...cList, 'New city'] });
  const delCity = (i) => setContent({ ...content, cities: cList.filter((_, idx) => idx !== i) });

  // Generic list-of-objects helpers — keeps the rest of this file short.
  const listSet = (key, defaults) => ({
    list: content[key] || defaults,
    setItem: (i, k, v) => setContent({ ...content, [key]: (content[key] || defaults).map((x, idx) => idx === i ? { ...x, [k]: v } : x) }),
    add:     (seed) => setContent({ ...content, [key]: [...(content[key] || defaults), seed] }),
    del:     (i) => setContent({ ...content, [key]: (content[key] || defaults).filter((_, idx) => idx !== i) })
  });

  // Bullet-list-of-strings helpers (e.g. ageGroup points, becomeTutor bullets).
  const setBullets = (parentKey, idx, bullets) => {
    const arr = (content[parentKey] || []).map((x, i) => i === idx ? { ...x, points: bullets } : x);
    setContent({ ...content, [parentKey]: arr });
  };

  const ageGroupsHelp = listSet('ageGroups', []);
  const featuresHelp  = listSet('features', []);
  const stepsHelp     = listSet('steps', []);
  const tutorsHelp    = listSet('sampleTutors', []);
  const safetyHelp    = listSet('safety', []);
  const whyIndiaHelp  = listSet('whyIndia', []);
  const faqsHelp      = listSet('faqs', []);

  const setBecome = (k, v) => setContent({ ...content, becomeTutor: { ...(content.becomeTutor || {}), [k]: v } });
  const become    = content.becomeTutor || {};
  const setBecomeBullet = (i, v) => setBecome('bullets', (become.bullets || []).map((b, idx) => idx === i ? v : b));
  const addBecomeBullet = () => setBecome('bullets', [...(become.bullets || []), 'New benefit']);
  const delBecomeBullet = (i) => setBecome('bullets', (become.bullets || []).filter((_, idx) => idx !== i));

  const setFinal  = (k, v) => setContent({ ...content, finalCta: { ...(content.finalCta || {}), [k]: v } });
  const finalCta  = content.finalCta || {};

  const setAnnounce = (k, v) => setContent({ ...content, announcement: { ...(content.announcement || {}), [k]: v } });
  const announce  = content.announcement || {};

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

      {/* TESTIMONIALS */}
      <section className="card-fun p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="h-display text-xl font-bold">Testimonials</h3>
            <p className="text-sm text-slate-500">Add, edit or remove the parent / student stories on the landing page.</p>
          </div>
          <button type="button" onClick={addT} className="btn-outline py-2 px-3 text-sm"><Plus className="w-4 h-4" /> Add testimonial</button>
        </div>
        <div className="space-y-4">
          {tList.length === 0 && (
            <div className="text-sm text-slate-500 italic">No testimonials yet — landing page will hide this section.</div>
          )}
          {tList.map((t, i) => (
            <div key={i} className="border-2 border-slate-100 rounded-2xl p-4 bg-slate-50/40">
              <div className="flex items-start gap-4">
                {t.img ? (
                  <img src={t.img} alt="" className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 ring-2 ring-white shadow"
                    onError={(e) => { e.currentTarget.style.opacity = 0.3; }} />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center flex-shrink-0 text-slate-400 text-xs">No image</div>
                )}
                <div className="flex-1 grid sm:grid-cols-2 gap-3">
                  <div><label className="label">Name</label>
                    <input className="input" value={t.name || ''} onChange={e => setT(i, 'name', e.target.value)} /></div>
                  <div><label className="label">Role / city</label>
                    <input className="input" value={t.role || ''} onChange={e => setT(i, 'role', e.target.value)} placeholder="Parent of Class 7 • Pune" /></div>
                  <div className="sm:col-span-2"><label className="label">Image URL</label>
                    <input className="input" value={t.img || ''} onChange={e => setT(i, 'img', e.target.value)} placeholder="https://..." /></div>
                  <div className="sm:col-span-2"><label className="label">Quote</label>
                    <textarea className="input min-h-[80px]" value={t.text || ''} onChange={e => setT(i, 'text', e.target.value)} /></div>
                  <div><label className="label">Stars (1–5)</label>
                    <input className="input" type="number" min={1} max={5} value={t.stars || 5}
                      onChange={e => setT(i, 'stars', Math.max(1, Math.min(5, Number(e.target.value) || 5)))} /></div>
                </div>
                <button type="button" onClick={() => delT(i)} className="btn-ghost text-red-600 px-2"><Trash className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WEBSITE IMAGES */}
      <section className="card-fun p-6">
        <h3 className="h-display text-xl font-bold mb-2">Website images</h3>
        <p className="text-sm text-slate-500 mb-4">Paste any public image URL (Unsplash, your CDN, etc). Leave blank to use the default.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { k: 'heroKid',   label: 'Hero — student photo (top right)' },
            { k: 'online',    label: 'Hero — online tutor photo (bottom left)' },
            { k: 'classroom', label: '"Become a tutor" banner background' },
            { k: 'india',     label: '"Made in India" section image' },
            { k: 'parent',    label: '"Safety first" section image' },
            { k: 'primary',   label: 'Age group: Classes 1–5' },
            { k: 'middle',    label: 'Age group: Classes 6–8' },
            { k: 'high',      label: 'Age group: Classes 9–10' }
          ].map(({ k, label }) => (
            <div key={k}>
              <label className="label">{label}</label>
              <div className="flex gap-3 items-start">
                {imgs[k] ? (
                  <img src={imgs[k]} alt="" className="w-16 h-16 object-cover rounded-xl ring-1 ring-slate-200"
                    onError={(e) => { e.currentTarget.style.opacity = 0.3; }} />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-xs text-slate-400">empty</div>
                )}
                <input className="input flex-1" value={imgs[k] || ''} onChange={e => setImg(k, e.target.value)} placeholder="https://..." />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SUBJECTS */}
      <section className="card-fun p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="h-display text-xl font-bold">Subjects ({sList.length})</h3>
            <p className="text-sm text-slate-500">Add or remove subjects shown in the "what they want to learn" grid. Olympiad / NEET / JEE can be added here when you're ready.</p>
          </div>
          <button type="button" onClick={addSubj} className="btn-outline py-2 px-3 text-sm"><Plus className="w-4 h-4" /> Add subject</button>
        </div>
        <div className="space-y-3">
          {sList.map((s, i) => (
            <div key={i} className="border-2 border-slate-100 rounded-2xl p-4 bg-slate-50/40 grid sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-3"><label className="label">Name</label>
                <input className="input" value={s.name || ''} onChange={e => setSubj(i, 'name', e.target.value)} /></div>
              <div className="sm:col-span-4"><label className="label">Tagline</label>
                <input className="input" value={s.blurb || ''} onChange={e => setSubj(i, 'blurb', e.target.value)} /></div>
              <div className="sm:col-span-2"><label className="label">Tutor count</label>
                <input className="input" type="number" value={s.count || 0} onChange={e => setSubj(i, 'count', Number(e.target.value) || 0)} /></div>
              <div className="sm:col-span-1"><label className="label">Icon</label>
                <select className="input" value={s.icon || 'BookOpen'} onChange={e => setSubj(i, 'icon', e.target.value)}>
                  {SUBJECT_ICONS.map(n => <option key={n} value={n}>{n}</option>)}
                </select></div>
              <div className="sm:col-span-1"><label className="label">Color</label>
                <select className="input" value={s.color || SUBJECT_COLORS[0]} onChange={e => setSubj(i, 'color', e.target.value)}>
                  {SUBJECT_COLORS.map(c => <option key={c} value={c}>{c.split(' ')[0].replace('bg-', '').replace('-100', '')}</option>)}
                </select></div>
              <div className="sm:col-span-1 flex justify-end">
                <button type="button" onClick={() => delSubj(i)} className="btn-ghost text-red-600 px-2"><Trash className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CITIES */}
      <section className="card-fun p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="h-display text-xl font-bold">Cities covered ({cList.length})</h3>
            <p className="text-sm text-slate-500">The "Cities covered" stat on the landing page updates automatically when you change this list.</p>
          </div>
          <button type="button" onClick={addCity} className="btn-outline py-2 px-3 text-sm"><Plus className="w-4 h-4" /> Add city</button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {cList.map((c, i) => (
            <div key={i} className="flex gap-2">
              <input className="input flex-1" value={c} onChange={e => setCity(i, e.target.value)} />
              <button type="button" onClick={() => delCity(i)} className="btn-ghost text-red-600 px-2"><Trash className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </section>

      {/* ANNOUNCEMENT BAR */}
      <section className="card-fun p-6">
        <h3 className="h-display text-xl font-bold mb-2">Top announcement bar</h3>
        <p className="text-sm text-slate-500 mb-4">The thin colorful bar at the very top of the landing page.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">
            <input type="checkbox" checked={announce.enabled !== false}
              onChange={e => setAnnounce('enabled', e.target.checked)} /> Show announcement bar
          </label>
          <div><label className="label">Left text</label>
            <input className="input" value={announce.text1 || ''} onChange={e => setAnnounce('text1', e.target.value)} placeholder="India's most-loved 1-on-1 tuition platform" /></div>
          <div><label className="label">Right text</label>
            <input className="input" value={announce.text2 || ''} onChange={e => setAnnounce('text2', e.target.value)} placeholder="First demo class is 100% FREE — sign up in 60 seconds." /></div>
        </div>
      </section>

      {/* AGE GROUPS */}
      <CardListEditor
        title="Age-group cards" subtitle={`The "track designed for your child's class" section.`}
        list={ageGroupsHelp.list} onAdd={() => ageGroupsHelp.add({ title: 'New group', range: 'Classes X – Y', points: ['Bullet 1','Bullet 2'] })} onDel={ageGroupsHelp.del}
        renderItem={(g, i) => (
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="label">Title</label>
              <input className="input" value={g.title || ''} onChange={e => ageGroupsHelp.setItem(i, 'title', e.target.value)} /></div>
            <div><label className="label">Class range</label>
              <input className="input" value={g.range || ''} onChange={e => ageGroupsHelp.setItem(i, 'range', e.target.value)} placeholder="Classes 1 – 5" /></div>
            <div className="sm:col-span-2">
              <BulletList label="Bullet points"
                items={g.points || []}
                onSet={(j, v) => ageGroupsHelp.setItem(i, 'points', (g.points || []).map((p, k) => k === j ? v : p))}
                onAdd={() => ageGroupsHelp.setItem(i, 'points', [...(g.points || []), 'New point'])}
                onDel={(j) => ageGroupsHelp.setItem(i, 'points', (g.points || []).filter((_, k) => k !== j))} />
            </div>
          </div>
        )} />

      {/* FEATURES */}
      <CardListEditor
        title="Why-you'll-love-us features" subtitle="Cards in the “12 things you'll love” grid."
        list={featuresHelp.list} onAdd={() => featuresHelp.add({ title: 'New feature', short: 'Short tagline', details: 'Longer description' })} onDel={featuresHelp.del}
        renderItem={(f, i) => (
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="label">Title</label>
              <input className="input" value={f.title || ''} onChange={e => featuresHelp.setItem(i, 'title', e.target.value)} /></div>
            <div><label className="label">Short tagline</label>
              <input className="input" value={f.short || ''} onChange={e => featuresHelp.setItem(i, 'short', e.target.value)} /></div>
            <div className="sm:col-span-2"><label className="label">Long description</label>
              <textarea className="input min-h-[80px]" value={f.details || ''} onChange={e => featuresHelp.setItem(i, 'details', e.target.value)} /></div>
          </div>
        )} />

      {/* HOW IT WORKS STEPS */}
      <CardListEditor
        title="How it works — steps" subtitle="The 5-step strip below the features."
        list={stepsHelp.list} onAdd={() => stepsHelp.add({ title: 'New step', desc: 'What happens here' })} onDel={stepsHelp.del}
        renderItem={(s, i) => (
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="label">Title</label>
              <input className="input" value={s.title || ''} onChange={e => stepsHelp.setItem(i, 'title', e.target.value)} /></div>
            <div><label className="label">Description</label>
              <input className="input" value={s.desc || ''} onChange={e => stepsHelp.setItem(i, 'desc', e.target.value)} /></div>
          </div>
        )} />

      {/* SAMPLE TUTORS STRIP */}
      <CardListEditor
        title='"Meet our stars" tutor cards' subtitle="The 4 sample tutor cards on the landing page."
        list={tutorsHelp.list} onAdd={() => tutorsHelp.add({ name: 'New Tutor', city: 'Bengaluru', subj: ['Maths'], price: 499, rate: 4.9, sessions: 100, exp: 'IIT • 5 yrs', avatar: '', badge: 'Top tutor' })} onDel={tutorsHelp.del}
        renderItem={(t, i) => (
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="label">Name</label>
              <input className="input" value={t.name || ''} onChange={e => tutorsHelp.setItem(i, 'name', e.target.value)} /></div>
            <div><label className="label">City</label>
              <input className="input" value={t.city || ''} onChange={e => tutorsHelp.setItem(i, 'city', e.target.value)} /></div>
            <div><label className="label">Subjects (comma-separated)</label>
              <input className="input" value={(t.subj || []).join(', ')} onChange={e => tutorsHelp.setItem(i, 'subj', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} /></div>
            <div><label className="label">Hourly rate (₹)</label>
              <input className="input" type="number" value={t.price || 0} onChange={e => tutorsHelp.setItem(i, 'price', Number(e.target.value) || 0)} /></div>
            <div><label className="label">Rating (e.g. 4.9)</label>
              <input className="input" type="number" step="0.1" value={t.rate || 0} onChange={e => tutorsHelp.setItem(i, 'rate', Number(e.target.value) || 0)} /></div>
            <div><label className="label">Sessions</label>
              <input className="input" type="number" value={t.sessions || 0} onChange={e => tutorsHelp.setItem(i, 'sessions', Number(e.target.value) || 0)} /></div>
            <div><label className="label">Experience badge text</label>
              <input className="input" value={t.exp || ''} onChange={e => tutorsHelp.setItem(i, 'exp', e.target.value)} placeholder="IIT-Madras • 6 yrs" /></div>
            <div><label className="label">Pill badge</label>
              <input className="input" value={t.badge || ''} onChange={e => tutorsHelp.setItem(i, 'badge', e.target.value)} placeholder="JEE Mentor / Loved by kids" /></div>
            <div className="sm:col-span-2"><label className="label">Avatar image URL</label>
              <input className="input" value={t.avatar || ''} onChange={e => tutorsHelp.setItem(i, 'avatar', e.target.value)} placeholder="https://..." /></div>
          </div>
        )} />

      {/* WHY-INDIA TILES */}
      <CardListEditor
        title='"Made in India" tiles' subtitle="The 6 tiles next to the India image."
        list={whyIndiaHelp.list} onAdd={() => whyIndiaHelp.add({ t: 'New tile', d: 'Short detail' })} onDel={whyIndiaHelp.del}
        renderItem={(x, i) => (
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="label">Title</label>
              <input className="input" value={x.t || ''} onChange={e => whyIndiaHelp.setItem(i, 't', e.target.value)} /></div>
            <div><label className="label">Detail</label>
              <input className="input" value={x.d || ''} onChange={e => whyIndiaHelp.setItem(i, 'd', e.target.value)} /></div>
          </div>
        )} />

      {/* SAFETY ITEMS */}
      <CardListEditor
        title="Safety section bullets" subtitle="The 6 safety tiles next to the parent image."
        list={safetyHelp.list} onAdd={() => safetyHelp.add({ title: 'New safety pillar', text: 'Detail' })} onDel={safetyHelp.del}
        renderItem={(s, i) => (
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="label">Title</label>
              <input className="input" value={s.title || ''} onChange={e => safetyHelp.setItem(i, 'title', e.target.value)} /></div>
            <div><label className="label">Detail</label>
              <input className="input" value={s.text || ''} onChange={e => safetyHelp.setItem(i, 'text', e.target.value)} /></div>
          </div>
        )} />

      {/* BECOME A TUTOR */}
      <section className="card-fun p-6">
        <h3 className="h-display text-xl font-bold mb-4">"Become a tutor" section</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><label className="label">Title (use plain text — gradient styling is automatic)</label>
            <input className="input" value={become.title || ''} onChange={e => setBecome('title', e.target.value)} placeholder="Earn up to ₹80,000 / month teaching what you love" /></div>
          <div className="sm:col-span-2"><label className="label">Description paragraph</label>
            <textarea className="input min-h-[80px]" value={become.desc || ''} onChange={e => setBecome('desc', e.target.value)} /></div>
          <div><label className="label">Big badge (over photo)</label>
            <input className="input" value={become.badgeBig || ''} onChange={e => setBecome('badgeBig', e.target.value)} placeholder="3,400+ tutors" /></div>
          <div><label className="label">Small badge (over photo)</label>
            <input className="input" value={become.badgeSmall || ''} onChange={e => setBecome('badgeSmall', e.target.value)} placeholder="already earning on TutorLink" /></div>
          <div className="sm:col-span-2"><label className="label">Button text</label>
            <input className="input" value={become.cta || ''} onChange={e => setBecome('cta', e.target.value)} placeholder="Become a tutor — apply free" /></div>
        </div>
        <div className="mt-4">
          <BulletList label="Bullet points"
            items={become.bullets || []}
            onSet={(i, v) => setBecomeBullet(i, v)}
            onAdd={addBecomeBullet}
            onDel={delBecomeBullet} />
        </div>
      </section>

      {/* FAQs */}
      <CardListEditor
        title="FAQs" subtitle="Frequently asked questions accordion."
        list={faqsHelp.list} onAdd={() => faqsHelp.add({ q: 'New question?', a: 'Answer here.' })} onDel={faqsHelp.del}
        renderItem={(f, i) => (
          <div className="grid gap-3">
            <div><label className="label">Question</label>
              <input className="input" value={f.q || ''} onChange={e => faqsHelp.setItem(i, 'q', e.target.value)} /></div>
            <div><label className="label">Answer</label>
              <textarea className="input min-h-[80px]" value={f.a || ''} onChange={e => faqsHelp.setItem(i, 'a', e.target.value)} /></div>
          </div>
        )} />

      {/* FINAL CTA */}
      <section className="card-fun p-6">
        <h3 className="h-display text-xl font-bold mb-4">Final call-to-action banner</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><label className="label">Title</label>
            <input className="input" value={finalCta.title || ''} onChange={e => setFinal('title', e.target.value)} placeholder="Your child's aha! moment is just one click away" /></div>
          <div className="sm:col-span-2"><label className="label">Subtitle</label>
            <textarea className="input min-h-[70px]" value={finalCta.subtitle || ''} onChange={e => setFinal('subtitle', e.target.value)} /></div>
          <div><label className="label">Primary button</label>
            <input className="input" value={finalCta.primary || ''} onChange={e => setFinal('primary', e.target.value)} placeholder="Get my child a tutor" /></div>
          <div><label className="label">Tutor button</label>
            <input className="input" value={finalCta.tutor || ''} onChange={e => setFinal('tutor', e.target.value)} placeholder="I want to teach" /></div>
        </div>
      </section>

      <div className="sticky bottom-4 flex justify-end">
        <button onClick={save} disabled={busy} className="btn-primary shadow-playful"><Save className="w-4 h-4" /> {busy ? 'Saving…' : 'Save all changes'}</button>
      </div>
    </div>
  );
}

/* Reusable collapsible editor for an array of similar items. */
function CardListEditor({ title, subtitle, list, onAdd, onDel, renderItem }) {
  return (
    <section className="card-fun p-6">
      <details>
        <summary className="cursor-pointer flex items-center justify-between gap-3 select-none">
          <div>
            <h3 className="h-display text-xl font-bold">{title} ({list.length})</h3>
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
          </div>
          <span className="text-xs text-slate-400 font-semibold">click to expand</span>
        </summary>
        <div className="mt-4 space-y-3">
          {list.map((item, i) => (
            <div key={i} className="border-2 border-slate-100 rounded-2xl p-4 bg-slate-50/40">
              <div className="flex items-start gap-3">
                <div className="flex-1">{renderItem(item, i)}</div>
                <button type="button" onClick={() => onDel(i)} className="btn-ghost text-red-600 px-2"><Trash className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          <button type="button" onClick={onAdd} className="btn-outline py-2 px-3 text-sm"><Plus className="w-4 h-4" /> Add item</button>
        </div>
      </details>
    </section>
  );
}

/* Reusable bullet-list (string array) editor — used inside other editors. */
function BulletList({ label, items, onSet, onAdd, onDel }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="label !mb-0">{label}</label>
        <button type="button" onClick={onAdd} className="btn-ghost py-1 px-2 text-xs"><Plus className="w-3.5 h-3.5" /> Add</button>
      </div>
      <div className="space-y-2">
        {(items || []).map((it, i) => (
          <div key={i} className="flex gap-2">
            <input className="input flex-1" value={it} onChange={e => onSet(i, e.target.value)} />
            <button type="button" onClick={() => onDel(i)} className="btn-ghost text-red-600 px-2"><Trash className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
