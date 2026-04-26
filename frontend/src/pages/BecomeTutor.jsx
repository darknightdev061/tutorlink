import { Link } from 'react-router-dom';
import { Wallet, Users, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

export default function BecomeTutor() {
  return (
    <div>
      <section className="gradient-hero">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold">Teach what you love. Earn on your terms.</h1>
          <p className="text-lg text-slate-600 mt-4 max-w-2xl mx-auto">
            Join 3,400+ verified tutors helping students level up. Set your own rates,
            choose your hours, and reach students in your area.
          </p>
          <Link to="/signup?as=tutor" className="btn-primary mt-8 px-6 py-3">
            Apply to teach <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-5">
        {[
          { icon: Wallet, t: 'Earn $25–$80/hr', d: 'You set the rate. Get paid promptly after each session.' },
          { icon: Clock,  t: 'Flexible schedule', d: 'Teach evenings, weekends, or full-time — your call.' },
          { icon: Users,  t: 'Local students',    d: 'Get matched with learners in your service radius.' },
          { icon: ShieldCheck, t: 'Verified profile', d: 'Stand out as an admin-approved, trusted tutor.' }
        ].map(b => (
          <div key={b.t} className="card p-6">
            <b.icon className="w-7 h-7 text-brand-600 mb-3" />
            <div className="font-semibold">{b.t}</div>
            <div className="text-sm text-slate-600 mt-1">{b.d}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
