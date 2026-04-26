import { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

export default function BookingModal({ tutor, onClose }) {
  const [form, setForm] = useState({
    subject: tutor.subjects?.[0] || '',
    message: '',
    preferred_date: '',
    duration_minutes: 60
  });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/api/student/requests', {
        tutor_id: tutor.user_id,
        ...form,
        preferred_date: form.preferred_date ? new Date(form.preferred_date).toISOString() : null
      });
      toast.success('Request sent! The tutor will respond shortly.');
      onClose();
    } catch (err) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 animate-fade-in">
      <div className="card w-full max-w-lg p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded hover:bg-slate-100">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold">Book a session with {tutor.full_name}</h2>
        <p className="text-sm text-slate-500">${Number(tutor.hourly_rate).toFixed(0)}/hr · {tutor.distance_km?.toFixed(1)} km away</p>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label className="label">Subject</label>
            <select required className="input" value={form.subject}
              onChange={e => setForm({...form, subject: e.target.value})}>
              {(tutor.subjects || []).map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Preferred date & time</label>
            <input type="datetime-local" className="input" value={form.preferred_date}
              onChange={e => setForm({...form, preferred_date: e.target.value})} />
          </div>
          <div>
            <label className="label">Duration (minutes)</label>
            <select className="input" value={form.duration_minutes}
              onChange={e => setForm({...form, duration_minutes: Number(e.target.value)})}>
              {[30,45,60,90,120].map(m => <option key={m} value={m}>{m} min</option>)}
            </select>
          </div>
          <div>
            <label className="label">Message to tutor</label>
            <textarea rows={3} className="input" placeholder="What you'd like help with…"
              value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
          </div>
          <button disabled={busy} className="btn-primary w-full">
            {busy ? 'Sending…' : 'Send request'}
          </button>
        </form>
      </div>
    </div>
  );
}
