import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { MapPin, Save } from 'lucide-react';

export default function StudentProfile() {
  const { profile, refresh } = useAuth();
  const [form, setForm] = useState({
    grade_level: '', preferred_subjects: '', zip_code: '', city: '', latitude: '', longitude: ''
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const e = profile?.extra;
    if (e) setForm({
      grade_level: e.grade_level || '',
      preferred_subjects: (e.preferred_subjects || []).join(', '),
      zip_code: e.zip_code || '',
      city: e.city || '',
      latitude: '', longitude: ''
    });
  }, [profile]);

  const useGps = () => navigator.geolocation.getCurrentPosition(
    p => setForm(f => ({ ...f, latitude: p.coords.latitude.toFixed(6), longitude: p.coords.longitude.toFixed(6) })),
    e => toast.error(e.message)
  );

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        grade_level: form.grade_level,
        preferred_subjects: form.preferred_subjects.split(',').map(s => s.trim()).filter(Boolean),
        zip_code: form.zip_code, city: form.city,
        ...(form.latitude && form.longitude ? { latitude: Number(form.latitude), longitude: Number(form.longitude) } : {})
      };
      await api.put('/api/student/profile', payload);
      await refresh();
      toast.success('Profile saved');
    } catch (err) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold">My profile</h1>
      <form onSubmit={submit} className="card p-6 mt-6 space-y-4">
        <div><label className="label">Grade level</label>
          <input className="input" placeholder="e.g. Grade 11, Undergrad year 2"
            value={form.grade_level} onChange={e => setForm({...form, grade_level: e.target.value})} /></div>
        <div><label className="label">Preferred subjects (comma separated)</label>
          <input className="input" placeholder="Math, Physics"
            value={form.preferred_subjects} onChange={e => setForm({...form, preferred_subjects: e.target.value})} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">City</label>
            <input className="input" value={form.city} onChange={e => setForm({...form, city: e.target.value})} /></div>
          <div><label className="label">Zip code</label>
            <input className="input" value={form.zip_code} onChange={e => setForm({...form, zip_code: e.target.value})} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Latitude</label>
            <input className="input" value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})} /></div>
          <div><label className="label">Longitude</label>
            <input className="input" value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})} /></div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={useGps} className="btn-outline">
            <MapPin className="w-4 h-4" /> Use my location
          </button>
          <button disabled={busy} className="btn-primary ml-auto">
            <Save className="w-4 h-4" /> {busy ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
