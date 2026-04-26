import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Inbox, Clock, CheckCircle2, Star, FileText, AlertTriangle } from 'lucide-react';
import { StatusBadge } from '../student/Dashboard';

export default function TutorDashboard() {
  const { profile } = useAuth();
  const [data, setData] = useState({ profile: null, requests: [] });

  useEffect(() => {
    Promise.all([api.get('/api/tutor/me'), api.get('/api/tutor/requests')])
      .then(([p, r]) => setData({ profile: p.profile, requests: r.requests || [] }))
      .catch(() => {});
  }, []);

  const status = data.profile?.approval_status;
  const counts = {
    pending: data.requests.filter(r => r.status === 'pending').length,
    accepted: data.requests.filter(r => r.status === 'accepted').length,
    completed: data.requests.filter(r => r.status === 'completed').length
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold">Welcome, {profile?.full_name} 👋</h1>

      {!data.profile && (
        <div className="card p-6 mt-6 bg-amber-50 border-amber-200">
          <h3 className="font-semibold flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-600" />
            Complete your application</h3>
          <p className="text-sm text-slate-600 mt-1">Submit your tutor profile to start getting requests.</p>
          <Link to="/tutor/apply" className="btn-primary mt-3">Apply now</Link>
        </div>
      )}

      {data.profile && status !== 'approved' && (
        <div className={`card p-6 mt-6 ${status === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
          <h3 className="font-semibold capitalize">Application: {status}</h3>
          {status === 'pending' && <p className="text-sm text-slate-600 mt-1">An admin is reviewing your application.</p>}
          {status === 'rejected' && (
            <>
              <p className="text-sm text-slate-600 mt-1">Reason: {data.profile.rejection_reason || 'Not specified'}</p>
              <Link to="/tutor/apply" className="btn-primary mt-3">Update application</Link>
            </>
          )}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <Stat icon={Inbox} label="Total requests" value={data.requests.length} />
        <Stat icon={Clock} label="Pending" value={counts.pending} />
        <Stat icon={CheckCircle2} label="Accepted" value={counts.accepted} />
        <Stat icon={Star} label="Rating" value={data.profile?.rating ? Number(data.profile.rating).toFixed(1) : '—'} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-semibold mb-4">Recent requests</h2>
          {data.requests.length === 0 ? <div className="text-slate-500 text-sm">No requests yet.</div>
            : <div className="divide-y">
                {data.requests.slice(0,5).map(r => (
                  <div key={r.id} className="py-3 flex items-center gap-3">
                    <div className="flex-1">
                      <div className="font-medium">{r.student?.full_name} — {r.subject}</div>
                      <div className="text-xs text-slate-500">{r.preferred_date ? new Date(r.preferred_date).toLocaleString() : 'No date'}</div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))}
                <Link to="/tutor/requests" className="block text-center text-brand-700 text-sm pt-3">View all →</Link>
              </div>}
        </div>
        <div className="card p-6">
          <h2 className="font-semibold mb-3">Profile snapshot</h2>
          {data.profile ? (
            <div className="text-sm space-y-2">
              <div><span className="text-slate-500">Subjects:</span> {(data.profile.subjects || []).join(', ') || '—'}</div>
              <div><span className="text-slate-500">Rate:</span> ${data.profile.hourly_rate}/hr</div>
              <div><span className="text-slate-500">Radius:</span> {data.profile.service_radius_km} km</div>
              <div><span className="text-slate-500">Reviews:</span> {data.profile.total_reviews}</div>
              <Link to="/tutor/apply" className="btn-outline w-full mt-3"><FileText className="w-4 h-4" /> Edit profile</Link>
            </div>
          ) : <div className="text-slate-500 text-sm">No profile yet.</div>}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center"><Icon className="w-6 h-6" /></div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </div>
  );
}
