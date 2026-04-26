import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, CheckCircle2, XCircle, Search, BookOpen, TrendingUp, Award } from 'lucide-react';

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/student/requests')
      .then(r => setRequests(r.requests || []))
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    pending: requests.filter(r => r.status === 'pending').length,
    accepted: requests.filter(r => r.status === 'accepted').length,
    completed: requests.filter(r => r.status === 'completed').length
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Hi, {profile?.full_name || 'Student'} 👋</h1>
          <p className="text-slate-600">Here's a snapshot of your learning journey.</p>
        </div>
        <Link to="/find-tutors" className="btn-primary"><Search className="w-4 h-4" /> Find a tutor</Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <Stat icon={Clock} label="Pending requests" value={counts.pending} color="amber" />
        <Stat icon={CheckCircle2} label="Accepted" value={counts.accepted} color="emerald" />
        <Stat icon={Award} label="Completed" value={counts.completed} color="brand" />
        <Stat icon={TrendingUp} label="Total bookings" value={requests.length} color="pink" />
      </div>

      <div className="mt-10 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Calendar className="w-5 h-5" /> Recent requests</h2>
          {loading ? <div className="text-slate-500">Loading…</div>
            : requests.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-slate-500 mt-2">No bookings yet. Find your first tutor!</p>
              <Link to="/find-tutors" className="btn-primary mt-4">Browse tutors</Link>
            </div>
          ) : (
            <div className="divide-y">
              {requests.slice(0,5).map(r => (
                <div key={r.id} className="py-3 flex items-center gap-3">
                  <div className="flex-1">
                    <div className="font-medium">{r.tutor?.full_name} — {r.subject}</div>
                    <div className="text-xs text-slate-500">
                      {r.preferred_date ? new Date(r.preferred_date).toLocaleString() : 'No date set'}
                    </div>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))}
              <Link to="/student/requests" className="block text-center text-brand-700 text-sm pt-3">View all →</Link>
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="font-semibold mb-3">Quick actions</h2>
          <div className="space-y-2">
            <Link to="/find-tutors" className="btn-outline w-full justify-start">🔍 Search tutors</Link>
            <Link to="/student/requests" className="btn-outline w-full justify-start">📅 My requests</Link>
            <Link to="/subjects" className="btn-outline w-full justify-start">📚 Browse subjects</Link>
            <Link to="/student/profile" className="btn-outline w-full justify-start">⚙️ Edit profile</Link>
          </div>
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-brand-600 to-pink-500 text-white">
            <div className="font-semibold">💡 Pro tip</div>
            <p className="text-sm text-white/90 mt-1">Set your saved location in your profile so search is one click away.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }) {
  const map = { amber: 'bg-amber-100 text-amber-700', emerald: 'bg-emerald-100 text-emerald-700',
                brand: 'bg-brand-100 text-brand-700', pink: 'bg-pink-100 text-pink-700' };
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${map[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    pending:  'bg-amber-100 text-amber-700',
    accepted: 'bg-emerald-100 text-emerald-700',
    declined: 'bg-red-100 text-red-700',
    completed: 'bg-brand-100 text-brand-700',
    cancelled: 'bg-slate-200 text-slate-700'
  };
  return <span className={`badge ${map[status] || 'bg-slate-100'}`}>{status}</span>;
}
