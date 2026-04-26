import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { session, profile, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="p-10 text-center text-slate-500">Loading…</div>;
  if (!session) return <Navigate to="/login" state={{ from: loc }} replace />;
  if (roles && profile && !roles.includes(profile.role))
    return <Navigate to="/" replace />;
  return children;
}
