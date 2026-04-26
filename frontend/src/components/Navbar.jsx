import { Link, NavLink, useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { session, profile, signOut } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  const dashHref = profile?.role === 'admin'  ? '/admin'
                 : profile?.role === 'tutor'  ? '/tutor'
                 : '/student';

  const links = [
    { to: '/', label: 'Home' },
    { to: '/find-tutors', label: 'Find Tutors' },
    { to: '/subjects', label: 'Subjects' },
    { to: '/how-it-works', label: 'How it Works' },
    { to: '/become-tutor', label: 'Become a Tutor' }
  ];

  return (
    <header className="sticky top-0 z-40 glass border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-brand-700">
          <GraduationCap className="w-7 h-7" />
          TutorLink
        </Link>
        <nav className="hidden lg:flex items-center gap-1 ml-4">
          {links.map(l => (
            <NavLink key={l.to} to={l.to}
              className={({isActive}) =>
                `px-3 py-2 text-sm rounded-md transition ${isActive ? 'text-brand-700 bg-brand-50' : 'text-slate-600 hover:text-brand-700'}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex-1" />
        <div className="hidden md:flex items-center gap-2">
          {session ? (
            <>
              <Link to={dashHref} className="btn-outline">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <button onClick={async () => { await signOut(); nav('/'); }} className="btn-ghost">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Login</Link>
              <Link to="/signup" className="btn-primary">Get Started</Link>
            </>
          )}
        </div>
        <button onClick={() => setOpen(o => !o)} className="md:hidden p-2 rounded-md hover:bg-slate-100">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)}
              className="block px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100">
              {l.label}
            </NavLink>
          ))}
          <div className="border-t pt-2 mt-2 flex gap-2">
            {session ? (
              <>
                <Link onClick={() => setOpen(false)} to={dashHref} className="btn-outline flex-1">Dashboard</Link>
                <button onClick={async () => { setOpen(false); await signOut(); nav('/'); }} className="btn-ghost">Logout</button>
              </>
            ) : (
              <>
                <Link onClick={() => setOpen(false)} to="/login" className="btn-ghost flex-1">Login</Link>
                <Link onClick={() => setOpen(false)} to="/signup" className="btn-primary flex-1">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
