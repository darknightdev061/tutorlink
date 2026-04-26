import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { StatusBadge } from '../student/Dashboard';
import { Check, X, Award } from 'lucide-react';

export default function TutorRequests() {
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState('all');

  const load = () => api.get('/api/tutor/requests').then(r => setList(r.requests || []));
  useEffect(() => { load(); }, []);

  const update = async (id, status) => {
    try { await api.patch(`/api/tutor/requests/${id}`, { status }); toast.success(`Marked ${status}`); load(); }
    catch (e) { toast.error(e.message); }
  };

  const filtered = filter === 'all' ? list : list.filter(r => r.status === filter);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold">Booking requests</h1>
      <div className="flex gap-2 mt-5 flex-wrap">
        {['all','pending','accepted','declined','completed','cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm capitalize border
              ${filter === f ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-300 hover:border-brand-400'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {filtered.length === 0 ? <div className="text-slate-500">No requests.</div> :
          filtered.map(r => (
          <div key={r.id} className="card p-5 flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[220px]">
              <div className="font-semibold">{r.student?.full_name || 'Student'}</div>
              <div className="text-sm text-slate-600">{r.subject} · {r.duration_minutes} min</div>
              <div className="text-xs text-slate-500 mt-1">
                {r.preferred_date ? new Date(r.preferred_date).toLocaleString() : 'No date'}
              </div>
              {r.message && <div className="text-sm text-slate-600 mt-2 italic">"{r.message}"</div>}
            </div>
            <StatusBadge status={r.status} />
            {r.status === 'pending' && (
              <div className="flex gap-2">
                <button onClick={() => update(r.id, 'accepted')} className="btn-primary"><Check className="w-4 h-4" /> Accept</button>
                <button onClick={() => update(r.id, 'declined')} className="btn-ghost text-red-600"><X className="w-4 h-4" /> Decline</button>
              </div>
            )}
            {r.status === 'accepted' && (
              <button onClick={() => update(r.id, 'completed')} className="btn-outline"><Award className="w-4 h-4" /> Mark completed</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
