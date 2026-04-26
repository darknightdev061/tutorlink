import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { Trash2, Power } from 'lucide-react';

export default function AdminUsers() {
  const [list, setList] = useState([]);
  const [role, setRole] = useState('');

  const load = () => {
    const qs = role ? `?role=${role}` : '';
    api.get(`/api/admin/users${qs}`).then(r => setList(r.users || []));
  };
  useEffect(() => { load(); }, [role]);

  const toggleActive = async (u) => {
    try { await api.patch(`/api/admin/users/${u.id}/active`, { is_active: !u.is_active });
      toast.success(`${u.is_active ? 'Suspended' : 'Reactivated'}`); load(); }
    catch (e) { toast.error(e.message); }
  };

  const del = async (u) => {
    if (!confirm(`Delete ${u.email}? This cannot be undone.`)) return;
    try { await api.del(`/api/admin/users/${u.id}`); toast.success('Deleted'); load(); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold">All users</h1>
      <div className="flex gap-2 mt-5">
        {['','student','tutor','admin'].map(r => (
          <button key={r} onClick={() => setRole(r)}
            className={`px-3 py-1.5 rounded-full text-sm capitalize border
              ${role === r ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-300'}`}>
            {r || 'all'}
          </button>
        ))}
      </div>
      <div className="card p-0 mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {list.map(u => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-3">{u.full_name || '—'}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3 capitalize">{u.role}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${u.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {u.is_active ? 'active' : 'suspended'}
                  </span>
                </td>
                <td className="px-4 py-3">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 flex gap-1 justify-end">
                  <button onClick={() => toggleActive(u)} className="btn-ghost"><Power className="w-4 h-4" /></button>
                  <button onClick={() => del(u)} className="btn-ghost text-red-600"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
