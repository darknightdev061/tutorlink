import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';

export default function AdminTutors() {
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [open, setOpen] = useState(null);

  const load = () => {
    const qs = filter ? `?status=${filter}` : '';
    api.get(`/api/admin/tutors${qs}`).then(r => setList(r.tutors || []));
  };
  useEffect(() => { load(); }, [filter]);

  const decide = async (id, status, reason) => {
    try { await api.patch(`/api/admin/tutors/${id}/approval`, { status, reason });
      toast.success(`Tutor ${status}`); load(); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold">Tutor applications</h1>
      <div className="flex gap-2 mt-5 flex-wrap">
        {['pending','approved','rejected','suspended',''].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm capitalize border
              ${filter === f ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-300 hover:border-brand-400'}`}>
            {f || 'all'}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {list.length === 0 ? <div className="text-slate-500">No tutors in this category.</div> :
          list.map(t => (
          <div key={t.user_id} className="card p-5">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1">
                <div className="font-semibold">{t.user?.full_name || 'Unnamed'} <span className="text-slate-400 text-sm font-normal">· {t.user?.email}</span></div>
                <div className="text-sm text-slate-600">{(t.subjects || []).join(', ')} · ${t.hourly_rate}/hr · {t.city || '—'}</div>
                <div className="text-xs text-slate-500">Applied {new Date(t.created_at).toLocaleDateString()}</div>
              </div>
              <span className={`badge capitalize
                ${t.approval_status === 'pending' ? 'bg-amber-100 text-amber-700'
                  : t.approval_status === 'approved' ? 'bg-emerald-100 text-emerald-700'
                  : t.approval_status === 'rejected' ? 'bg-red-100 text-red-700'
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
              <div className="mt-4 pt-4 border-t text-sm text-slate-700 grid sm:grid-cols-2 gap-3">
                <div><strong>Bio:</strong> {t.bio || '—'}</div>
                <div><strong>Qualifications:</strong> {t.qualifications || '—'}</div>
                <div><strong>Experience:</strong> {t.experience_years} yrs</div>
                <div><strong>Languages:</strong> {(t.languages || []).join(', ') || '—'}</div>
                <div><strong>Service radius:</strong> {t.service_radius_km} km</div>
                <div><strong>Rating:</strong> {t.rating || 0} ({t.total_reviews} reviews)</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
