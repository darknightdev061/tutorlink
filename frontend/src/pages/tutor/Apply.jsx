import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { MapPin, Save } from 'lucide-react';

export default function TutorApply() {
  const [form, setForm] = useState({
    subjects: '', qualifications: '', bio: '',
    hourly_rate: 30, experience_years: 1, languages: 'English',
    service_radius_km: 10, zip_code: '', city: '',
    latitude: '', longitude: ''
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/api/tutor/me').then(({ profile: p }) => {
      if (!p) return;
      setForm({
        subjects: (p.subjects || []).join(', '),
        qualifications: p.qualifications || '',
        bio: p.bio || '',
        hourly_rate: p.hourly_rate || 30,
        experience_years: p.experience_years || 0,
        languages: (p.languages || []).join(', ') || 'English',
        service_radius_km: p.service_radius_km || 10,
        zip_code: p.zip_code || '',
        city: p.city || '',
        latitude: '', longitude: ''
      });
    }).catch(() => {});
  }, []);

  const useGps = () => navigator.geolocation.getCurrentPosition(
    p => setForm(f => ({ ...f, latitude: p.coords.latitude.toFixed(6), longitude: p.coords.longitude.toFixed(6) })),
    e => toast.error(e.message)
  );

  const submit = async (e) => {
    e.preventDefault();
    if (!form.latitude || !form.longitude) return toast.error('Set your location (use GPS or enter coords).');
    setBusy(true);
    try {
      await api.post('/api/tutor/apply', {
        subjects: form.subjects.split(',').map(s => s.trim()).filter(Boolean),
        qualifications: form.qualifications,
        bio: form.bio,
        hourly_rate: Number(form.hourly_rate),
        experience_years: Number(form.experience_years),
        languages: form.languages.split(',').map(s => s.trim()).filter(Boolean),
        service_radius_km: Number(form.service_radius_km),
        zip_code: form.zip_code, city: form.city,
        latitude: Number(form.latitude), longitude: Number(form.longitude)
      });
      toast.success('Application submitted!');
    } catch (err) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold">Tutor application</h1>
      <p className="text-slate-600 mt-1">Submit your profile for admin review. You can edit it anytime.</p>
      <form onSubmit={submit} className="card p-6 mt-6 space-y-4">
        <div><label className="label">Subjects (comma separated) *</label>
          <input className="input" required value={form.subjects} placeholder="Calculus, Algebra, SAT Math"
            onChange={e => setForm({...form, subjects: e.target.value})} /></div>
        <div><label className="label">Qualifications</label>
          <input className="input" placeholder="e.g. M.Sc Mathematics, IIT Delhi"
            value={form.qualifications} onChange={e => setForm({...form, qualifications: e.target.value})} /></div>
        <div><label className="label">Bio</label>
          <textarea rows={4} className="input" placeholder="Tell students about your teaching style…"
            value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} /></div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div><label className="label">Hourly rate ($)</label>
            <input className="input" type="number" min="1" value={form.hourly_rate}
              onChange={e => setForm({...form, hourly_rate: e.target.value})} /></div>
          <div><label className="label">Experience (years)</label>
            <input className="input" type="number" min="0" value={form.experience_years}
              onChange={e => setForm({...form, experience_years: e.target.value})} /></div>
          <div><label className="label">Service radius (km)</label>
            <input className="input" type="number" min="1" max="100" value={form.service_radius_km}
              onChange={e => setForm({...form, service_radius_km: e.target.value})} /></div>
        </div>
        <div><label className="label">Languages (comma separated)</label>
          <input className="input" value={form.languages}
            onChange={e => setForm({...form, languages: e.target.value})} /></div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className="label">City</label>
            <input className="input" value={form.city} onChange={e => setForm({...form, city: e.target.value})} /></div>
          <div><label className="label">Zip code</label>
            <input className="input" value={form.zip_code} onChange={e => setForm({...form, zip_code: e.target.value})} /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className="label">Latitude *</label>
            <input className="input" required value={form.latitude}
              onChange={e => setForm({...form, latitude: e.target.value})} /></div>
          <div><label className="label">Longitude *</label>
            <input className="input" required value={form.longitude}
              onChange={e => setForm({...form, longitude: e.target.value})} /></div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={useGps} className="btn-outline">
            <MapPin className="w-4 h-4" /> Use my location
          </button>
          <button disabled={busy} className="btn-primary ml-auto">
            <Save className="w-4 h-4" /> {busy ? 'Submitting…' : 'Submit application'}
          </button>
        </div>
      </form>
    </div>
  );
}
