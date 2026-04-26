import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { StatusBadge } from './Dashboard';
import { X, Star } from 'lucide-react';

export default function StudentRequests() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [reviewing, setReviewing] = useState(null);

  const load = () => api.get('/api/student/requests').then(r => setList(r.requests || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!confirm('Cancel this request?')) return;
    try { await api.patch(`/api/student/requests/${id}/cancel`); toast.success('Cancelled'); load(); }
    catch (e) { toast.error(e.message); }
  };

  const filtered = filter === 'all' ? list : list.filter(r => r.status === filter);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold">My session requests</h1>
      <div className="flex gap-2 mt-5 flex-wrap">
        {['all','pending','accepted','declined','completed','cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm capitalize border
              ${filter === f ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-300 hover:border-brand-400'}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? <div className="mt-8 text-slate-500">Loading…</div>
        : filtered.length === 0 ? <div className="mt-8 text-slate-500">No requests in this category.</div>
        : (
        <div className="mt-6 space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="card p-5 flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="font-semibold">{r.tutor?.full_name || 'Tutor'}</div>
                <div className="text-sm text-slate-600">{r.subject} · {r.duration_minutes} min</div>
                <div className="text-xs text-slate-500 mt-1">
                  {r.preferred_date ? new Date(r.preferred_date).toLocaleString() : 'No date set'}
                  · created {new Date(r.created_at).toLocaleDateString()}
                </div>
                {r.message && <div className="text-sm text-slate-600 mt-2 italic">"{r.message}"</div>}
              </div>
              <StatusBadge status={r.status} />
              <div className="flex gap-2">
                {r.status === 'pending' && (
                  <button onClick={() => cancel(r.id)} className="btn-ghost text-red-600">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                )}
                {r.status === 'completed' && (
                  <button onClick={() => setReviewing(r)} className="btn-outline">
                    <Star className="w-4 h-4" /> Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {reviewing && <ReviewModal req={reviewing} onClose={() => { setReviewing(null); load(); }} />}
    </div>
  );
}

function ReviewModal({ req, onClose }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/api/student/reviews', { request_id: req.id, rating, comment });
      toast.success('Review submitted!');
      onClose();
    } catch (err) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 p-1 hover:bg-slate-100 rounded"><X className="w-5 h-5" /></button>
        <h3 className="font-bold text-lg">Review {req.tutor?.full_name}</h3>
        <form onSubmit={submit} className="mt-4 space-y-4">
          <div className="flex justify-center gap-1">
            {[1,2,3,4,5].map(n => (
              <button type="button" key={n} onClick={() => setRating(n)}>
                <Star className={`w-8 h-8 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
              </button>
            ))}
          </div>
          <textarea rows={4} className="input" placeholder="Share your experience…"
            value={comment} onChange={e => setComment(e.target.value)} />
          <button disabled={busy} className="btn-primary w-full">Submit review</button>
        </form>
      </div>
    </div>
  );
}
