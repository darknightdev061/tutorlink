import { Link } from 'react-router-dom';
import { GraduationCap, Twitter, Facebook, Instagram, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-4 gap-10">
        <div>
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg">
            <GraduationCap className="w-7 h-7" /> TutorLink
          </Link>
          <p className="mt-3 text-sm text-slate-400">
            Connecting curious minds with brilliant local tutors. Learn anything, anywhere, anytime.
          </p>
          <div className="flex gap-3 mt-4 text-slate-400">
            <a href="#" className="hover:text-white"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="hover:text-white"><Facebook className="w-5 h-5" /></a>
            <a href="#" className="hover:text-white"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="hover:text-white"><Linkedin className="w-5 h-5" /></a>
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">For Students</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/find-tutors" className="hover:text-white">Find a Tutor</Link></li>
            <li><Link to="/subjects" className="hover:text-white">Browse Subjects</Link></li>
            <li><Link to="/how-it-works" className="hover:text-white">How it Works</Link></li>
            <li><Link to="/student" className="hover:text-white">My Dashboard</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">For Tutors</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/become-tutor" className="hover:text-white">Apply to Teach</Link></li>
            <li><Link to="/tutor" className="hover:text-white">Tutor Dashboard</Link></li>
            <li><a href="#" className="hover:text-white">Tutor Resources</a></li>
            <li><a href="#" className="hover:text-white">Earnings</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Stay in the loop</h4>
          <p className="text-sm text-slate-400 mb-3">Get tips, new subjects, and tutor stories.</p>
          <form className="flex gap-2">
            <input className="input bg-slate-800 border-slate-700 text-white" placeholder="you@email.com" />
            <button className="btn-primary"><Mail className="w-4 h-4" /></button>
          </form>
        </div>
      </div>
      <div className="border-t border-slate-800 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} TutorLink. All rights reserved.
      </div>
    </footer>
  );
}
