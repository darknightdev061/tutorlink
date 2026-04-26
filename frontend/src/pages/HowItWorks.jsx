import { CheckCircle2, Search, Calendar, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HowItWorks() {
  const steps = [
    { icon: CheckCircle2, t: 'Sign up free',         d: 'Create a student account in 30 seconds. No credit card required.' },
    { icon: Search,       t: 'Search by location',   d: 'We use PostGIS geo-search to surface tutors within your chosen radius.' },
    { icon: Calendar,     t: 'Book a session',       d: 'Send a request with your preferred date — most tutors respond within an hour.' },
    { icon: Star,         t: 'Learn & review',       d: 'After your session, leave a review to help the next student.' }
  ];
  return (
    <div className="max-w-5xl mx-auto px-6 py-14">
      <h1 className="text-4xl font-bold text-center">How TutorLink works</h1>
      <p className="text-slate-600 text-center mt-2">From signup to first session in under 5 minutes.</p>
      <div className="mt-12 grid md:grid-cols-2 gap-6">
        {steps.map(s => (
          <div key={s.t} className="card p-6">
            <s.icon className="w-7 h-7 text-brand-600 mb-3" />
            <h3 className="font-semibold text-lg">{s.t}</h3>
            <p className="text-slate-600 mt-1">{s.d}</p>
          </div>
        ))}
      </div>
      <div className="text-center mt-12">
        <Link to="/signup" className="btn-primary">Get started</Link>
      </div>
    </div>
  );
}
