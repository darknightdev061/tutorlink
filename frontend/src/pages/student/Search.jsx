import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { MapPin, Search as SearchIcon, Star, Loader2, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import BookingModal from '../../components/BookingModal';

const SUBJECTS = ['Mathematics','Physics','Chemistry','Biology','English','Computer Science',
  'History','Spanish','French','SAT','ACT','Piano','Guitar'];

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [coords, setCoords] = useState({ lat: '', lng: '' });
  const [radius, setRadius] = useState(10);
  const [subject, setSubject] = useState(params.get('subject') || '');
  const [minRating, setMinRating] = useState(0);
  const [maxRate, setMaxRate] = useState('');
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState(null);

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(
      p => setCoords({ lat: p.coords.latitude.toFixed(6), lng: p.coords.longitude.toFixed(6) }),
      e => toast.error(e.message)
    );
  };

  const search = async (e) => {
    e?.preventDefault();
    if (!coords.lat || !coords.lng) return toast.error('Enter or detect a location first');
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        lat: coords.lat, lng: coords.lng, radius_km: radius,
        ...(subject ? { subject } : {})
      });
      const res = await api.get(`/api/student/search?${qs}`);
      setTutors(res.tutors || []);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (subject) setParams({ subject });
    else setParams({});
  }, [subject, setParams]);

  const filtered = tutors.filter(t =>
    t.rating >= minRating &&
    (maxRate === '' || Number(t.hourly_rate) <= Number(maxRate))
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold flex items-center gap-2"><SearchIcon className="w-7 h-7" /> Find tutors near you</h1>
      <p className="text-slate-600 mt-1">Set your location and filters — we'll show approved tutors within your radius.</p>

      <form onSubmit={search} className="card p-6 mt-6 grid md:grid-cols-5 gap-3">
        <div>
          <label className="label">Latitude</label>
          <input className="input" value={coords.lat}
            onChange={e => setCoords({...coords, lat: e.target.value})} placeholder="40.7128" />
        </div>
        <div>
          <label className="label">Longitude</label>
          <input className="input" value={coords.lng}
            onChange={e => setCoords({...coords, lng: e.target.value})} placeholder="-74.0060" />
        </div>
        <div>
          <label className="label">Radius (km)</label>
          <input className="input" type="number" min="1" max="100" value={radius}
            onChange={e => setRadius(e.target.value)} />
        </div>
        <div>
          <label className="label">Subject</label>
          <select className="input" value={subject} onChange={e => setSubject(e.target.value)}>
            <option value="">Any subject</option>
            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button type="button" onClick={useMyLocation} className="btn-outline flex-1">
            <MapPin className="w-4 h-4" /> My location
          </button>
          <button className="btn-primary flex-1">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SearchIcon className="w-4 h-4" />}
            Search
          </button>
        </div>
      </form>

      {tutors.length > 0 && (
        <div className="card p-4 mt-4 flex flex-wrap items-center gap-4 text-sm">
          <span className="flex items-center gap-1 text-slate-500"><Filter className="w-4 h-4" /> Refine:</span>
          <label>Min rating
            <select value={minRating} onChange={e => setMinRating(Number(e.target.value))}
              className="ml-2 px-2 py-1 border rounded">
              <option value={0}>Any</option><option value={3}>3+</option>
              <option value={4}>4+</option><option value={4.5}>4.5+</option>
            </select>
          </label>
          <label>Max rate $
            <input type="number" value={maxRate} onChange={e => setMaxRate(e.target.value)}
              className="ml-2 w-20 px-2 py-1 border rounded" placeholder="∞" />
          </label>
          <span className="ml-auto text-slate-500">{filtered.length} of {tutors.length} match filters</span>
        </div>
      )}

      <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(t => (
          <div key={t.user_id} className="card p-6 hover:border-brand-400 transition flex flex-col">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-pink-500 text-white flex items-center justify-center font-bold">
                {(t.full_name || '?').slice(0,2).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-semibold">{t.full_name}</div>
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {t.distance_km?.toFixed(1)} km · {t.city || '—'}
                </div>
              </div>
              <div className="flex items-center gap-1 text-amber-500 text-sm">
                <Star className="w-4 h-4 fill-amber-500" />
                <span className="font-semibold text-slate-900">{Number(t.rating || 0).toFixed(1)}</span>
                <span className="text-slate-400">({t.total_reviews})</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {(t.subjects || []).slice(0,4).map(s => <span key={s} className="chip">{s}</span>)}
            </div>
            <p className="text-sm text-slate-600 mt-3 line-clamp-3 flex-1">{t.bio || 'No bio yet.'}</p>
            <div className="flex items-center justify-between mt-4">
              <div className="font-bold text-lg">${Number(t.hourly_rate || 0).toFixed(0)}<span className="text-sm font-normal text-slate-500">/hr</span></div>
              <button onClick={() => setPicked(t)} className="btn-primary">Book session</button>
            </div>
          </div>
        ))}
      </div>

      {tutors.length > 0 && filtered.length === 0 && (
        <div className="text-center py-14 text-slate-500">No tutors match your filters. Try widening the rating or rate.</div>
      )}
      {!loading && tutors.length === 0 && coords.lat && (
        <div className="text-center py-14 text-slate-500">No tutors found in this area. Try increasing the radius.</div>
      )}

      {picked && <BookingModal tutor={picked} onClose={() => setPicked(null)} />}
    </div>
  );
}
