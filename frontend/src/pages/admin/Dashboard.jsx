import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { Users, GraduationCap, Clock, CheckCircle2, Inbox, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  useEffect(() => { api.get('/api/admin/stats').then(r => setStats(r.stats || {})).catch(()=>{}); }, []);

  const cards = [
    { icon: Users, label: 'Students', value: stats.total_students || 0, color: 'brand' },
    { icon: GraduationCap, label: 'Tutors', value: stats.total_tutors || 0, color: 'pink' },
    { icon: Clock, label: 'Pending tutor apps', value: stats.pending_tutors || 0, color: 'amber' },
    { icon: CheckCircle2, label: 'Approved tutors', value: stats.approved_tutors || 0, color: 'emerald' },
    { icon: Inbox, label: 'Total requests', value: stats.total_requests || 0, color: 'brand' },
    { icon: Activity, label: 'Pending requests', value: stats.pending_requests || 0, color: 'pink' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold">Admin dashboard</h1>
      <p className="text-slate-600">Live snapshot of the platform.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {cards.map(c => {
          const map = { amber: 'bg-amber-100 text-amber-700', emerald: 'bg-emerald-100 text-emerald-700',
                        brand: 'bg-brand-100 text-brand-700', pink: 'bg-pink-100 text-pink-700' };
          return (
            <div key={c.label} className="card p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${map[c.color]}`}>
                <c.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">{c.value}</div>
                <div className="text-xs text-slate-500">{c.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-8">
        <Link to="/admin/tutors" className="card p-6 hover:border-brand-400 transition">
          <h3 className="font-semibold text-lg">Review tutor applications</h3>
          <p className="text-sm text-slate-600 mt-1">{stats.pending_tutors || 0} waiting for approval.</p>
        </Link>
        <Link to="/admin/users" className="card p-6 hover:border-brand-400 transition">
          <h3 className="font-semibold text-lg">Manage users</h3>
          <p className="text-sm text-slate-600 mt-1">Suspend or remove accounts.</p>
        </Link>
      </div>
    </div>
  );
}
