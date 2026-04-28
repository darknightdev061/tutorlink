import { Link } from 'react-router-dom';
import {
  GraduationCap, Twitter, Facebook, Instagram, Linkedin, Youtube, Mail,
  Phone, MapPin, MessageCircle, Heart, ShieldCheck, Sparkles
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-24 bg-slate-900 text-slate-300 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-candy-500/20 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl h-display">
            <span className="w-10 h-10 rounded-xl gradient-rainbow flex items-center justify-center shadow-playful">
              <GraduationCap className="w-5 h-5" />
            </span>
            TutorLink
          </Link>
          <p className="mt-4 text-sm text-slate-400 max-w-sm leading-relaxed">
            India's friendliest 1-on-1 tutoring platform. Verified tutors, transparent INR pricing,
            and personalised learning for Class 1 to 12 — boards, JEE, NEET, Olympiads & more.
          </p>
          <div className="mt-5 space-y-2 text-sm">
            <a href="mailto:hello@tutorlink.in" className="flex items-center gap-2 hover:text-white">
              <Mail className="w-4 h-4 text-brand-400" /> hello@tutorlink.in
            </a>
            <a href="tel:+919000012345" className="flex items-center gap-2 hover:text-white">
              <Phone className="w-4 h-4 text-mint-400" /> +91 90000 12345
            </a>
            <a href="https://wa.me/919000012345" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white">
              <MessageCircle className="w-4 h-4 text-mint-400" /> WhatsApp us 24×7
            </a>
            <div className="flex items-center gap-2 text-slate-400">
              <MapPin className="w-4 h-4 text-candy-400" /> Bengaluru • Mumbai • Delhi NCR
            </div>
          </div>
          <div className="flex gap-2 mt-5">
            {[
              { Icon: Twitter,   href: 'https://twitter.com',   label: 'Twitter' },
              { Icon: Facebook,  href: 'https://facebook.com',  label: 'Facebook' },
              { Icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
              { Icon: Linkedin,  href: 'https://linkedin.com',  label: 'LinkedIn' },
              { Icon: Youtube,   href: 'https://youtube.com',   label: 'YouTube' }
            ].map(s => (
              <a key={s.label} href={s.href} aria-label={s.label} target="_blank" rel="noreferrer"
                 className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-brand-600 flex items-center justify-center text-slate-300 hover:text-white transition">
                <s.Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4">For Students</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/find-tutors"  className="hover:text-white">Find a Tutor</Link></li>
            <li><Link to="/subjects"     className="hover:text-white">Browse Subjects</Link></li>
            <li><Link to="/how-it-works" className="hover:text-white">How it Works</Link></li>
            <li><Link to="/signup"       className="hover:text-white">Free Demo Class</Link></li>
            <li><Link to="/login"        className="hover:text-white">Student Login</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4">For Tutors</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/become-tutor" className="hover:text-white">Apply to Teach</Link></li>
            <li><Link to="/login"        className="hover:text-white">Tutor Login</Link></li>
            <li><Link to="/how-it-works" className="hover:text-white">Earnings &amp; Payouts</Link></li>
            <li><Link to="/become-tutor" className="hover:text-white">Tutor Code of Conduct</Link></li>
            <li><Link to="/become-tutor" className="hover:text-white">Resources &amp; Training</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4">Stay in the loop</h4>
          <p className="text-sm text-slate-400 mb-3">Tips, success stories &amp; new tutors — straight to your inbox.</p>
          <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
            <input className="input bg-slate-800 border-slate-700 text-white placeholder-slate-500" placeholder="you@email.com" />
            <button className="btn-primary"><Mail className="w-4 h-4" /></button>
          </form>
          <div className="mt-5 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-mint-400" /> DPDP Act 2023 compliant</div>
            <div className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-sunny-400" /> 4.9★ on Google Play &amp; App Store</div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>© {new Date().getFullYear()} TutorLink Edutech Pvt. Ltd. — Made with <Heart className="w-3 h-3 inline text-candy-500 fill-candy-500" /> in India 🇮🇳</div>
          <div className="flex flex-wrap gap-4">
            <Link to="/how-it-works" className="hover:text-white">Privacy</Link>
            <Link to="/how-it-works" className="hover:text-white">Terms</Link>
            <Link to="/how-it-works" className="hover:text-white">Refund Policy</Link>
            <Link to="/how-it-works" className="hover:text-white">Child Safety</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
