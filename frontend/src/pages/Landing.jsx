import { Link } from 'react-router-dom';
import {
  Search, MapPin, BookOpen, ShieldCheck, Star, Users, Calendar,
  MessageSquare, Wallet, Award, Sparkles, ArrowRight, CheckCircle2,
  Target, Zap, Globe, Clock, Video, FileText, Languages, TrendingUp
} from 'lucide-react';

const subjects = [
  { name: 'Mathematics', icon: '🧮', count: 240 },
  { name: 'Physics', icon: '⚛️', count: 156 },
  { name: 'Chemistry', icon: '🧪', count: 132 },
  { name: 'Biology', icon: '🧬', count: 118 },
  { name: 'English', icon: '📖', count: 201 },
  { name: 'Computer Science', icon: '💻', count: 184 },
  { name: 'History', icon: '🏛️', count: 89 },
  { name: 'Languages', icon: '🌐', count: 167 }
];

const features = [
  { icon: MapPin, title: 'Local & Verified', desc: 'Find tutors within your chosen radius — every tutor is admin-approved.' },
  { icon: ShieldCheck, title: 'Safe & Secure', desc: 'Background-checked profiles, encrypted messaging, secure payments.' },
  { icon: Calendar, title: 'Smart Scheduling', desc: 'Pick a slot, send a request, get confirmed in minutes.' },
  { icon: MessageSquare, title: 'Direct Messaging', desc: 'Talk to your tutor before booking. No intermediaries.' },
  { icon: Wallet, title: 'Transparent Pricing', desc: 'See hourly rates upfront. No surprise fees, ever.' },
  { icon: Star, title: 'Reviews That Matter', desc: 'Real reviews from real students after every completed session.' },
  { icon: Video, title: 'Online or In-Person', desc: 'Choose what works for you — video sessions or local meetups.' },
  { icon: Languages, title: 'Multi-Language Support', desc: 'Learn in English, Spanish, French, Mandarin & more.' }
];

const studentBenefits = [
  { icon: Target, title: 'Personalized Matching', desc: 'Our location-aware engine ranks tutors by distance, subject fit, and reviews.' },
  { icon: Zap, title: 'Instant Booking', desc: 'Send a session request and most tutors respond within an hour.' },
  { icon: TrendingUp, title: 'Track Your Progress', desc: 'Dashboard shows session history, upcoming bookings, and learning streaks.' },
  { icon: Globe, title: 'Anytime Access', desc: 'Mobile-friendly — manage your sessions on the go, 24/7.' },
  { icon: Award, title: 'Top-Rated Tutors', desc: 'Filter by 4.5+ rated tutors only. Verified credentials displayed.' },
  { icon: FileText, title: 'Session Notes & Recap', desc: 'Tutors share notes after each session so you can review later.' }
];

const steps = [
  { n: 1, title: 'Sign up free', desc: 'Create a student account in 30 seconds.' },
  { n: 2, title: 'Set your location', desc: 'We find approved tutors near you.' },
  { n: 3, title: 'Pick a tutor', desc: 'Compare profiles, ratings, and rates.' },
  { n: 4, title: 'Book & learn', desc: 'Send a request and start learning.' }
];

const stats = [
  { v: '12,000+', l: 'Active Students' },
  { v: '3,400+', l: 'Verified Tutors' },
  { v: '50+',    l: 'Subjects Offered' },
  { v: '4.9/5',  l: 'Average Rating' }
];

const testimonials = [
  { name: 'Aisha R.', role: 'High-school student', text: 'My maths grade went from C to A in 3 months. Loved how easy it was to find a tutor 5 minutes from my house.' },
  { name: 'Daniel P.', role: 'Engineering student', text: 'Booked a physics tutor on Sunday night, had a session Monday morning. The platform is incredibly fast.' },
  { name: 'Priya M.',  role: 'Parent',              text: 'I love that every tutor is admin-approved. I trust TutorLink with my daughter\'s schedule.' }
];

export default function Landing() {
  return (
    <div>
      {/* HERO */}
      <section className="gradient-hero">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <span className="badge bg-brand-100 text-brand-700 mb-4">
              <Sparkles className="w-3.5 h-3.5" /> New tutors approved daily
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Find the perfect tutor —<br />
              <span className="bg-gradient-to-r from-brand-600 to-pink-500 bg-clip-text text-transparent">
                right in your neighborhood.
              </span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 max-w-xl">
              Connect with verified, local tutors for any subject. Book a session in minutes,
              learn at your pace, and watch your grades soar.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup" className="btn-primary text-base px-6 py-3">
                Get Started — it's free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/find-tutors" className="btn-outline text-base px-6 py-3">
                <Search className="w-4 h-4" /> Browse Tutors
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> No credit card</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Cancel anytime</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 24/7 access</div>
            </div>
          </div>
          <div className="relative">
            <div className="card p-6 animate-float">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-pink-500 flex items-center justify-center text-white font-bold">SM</div>
                <div>
                  <div className="font-semibold">Sarah M.</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> 1.2 km away • Brooklyn
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span className="font-semibold text-slate-900">4.9</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="chip">Calculus</span>
                <span className="chip">Algebra</span>
                <span className="chip">SAT Math</span>
              </div>
              <p className="text-sm text-slate-600">Stanford grad • 8 yrs experience • $35/hr</p>
              <button className="btn-primary w-full mt-4">Book Session</button>
            </div>
            <div className="card p-4 absolute -bottom-6 -left-6 animate-float [animation-delay:1s] hidden sm:block">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-sm">
                  <div className="font-semibold">Session confirmed</div>
                  <div className="text-slate-500 text-xs">Tomorrow, 4:00 PM</div>
                </div>
              </div>
            </div>
            <div className="card p-4 absolute -top-4 -right-4 animate-float [animation-delay:2s] hidden sm:block">
              <div className="text-xs text-slate-500">Your progress</div>
              <div className="font-bold text-2xl text-brand-700">+18%</div>
              <div className="text-xs text-emerald-600">↑ this month</div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(s => (
            <div key={s.l} className="text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-brand-700">{s.v}</div>
              <div className="text-sm text-slate-500 mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SUBJECTS */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Popular subjects</h2>
          <p className="text-slate-600 mt-3">Find expert help across STEM, humanities, languages, and more.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {subjects.map(s => (
            <Link to={`/find-tutors?subject=${encodeURIComponent(s.name)}`} key={s.name}
              className="card p-6 hover:border-brand-400 hover:-translate-y-1 transition group">
              <div className="text-4xl mb-3">{s.icon}</div>
              <div className="font-semibold group-hover:text-brand-700">{s.name}</div>
              <div className="text-sm text-slate-500">{s.count}+ tutors</div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-slate-100 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl md:text-4xl font-bold">Everything you need to succeed</h2>
            <p className="text-slate-600 mt-3">A complete platform built around how students actually learn.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(f => (
              <div key={f.title} className="card p-6">
                <div className="w-11 h-11 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-slate-600 mt-1.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STUDENT BENEFITS */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="badge bg-pink-100 text-pink-700 mb-3"><Users className="w-3.5 h-3.5" /> For students</span>
            <h2 className="text-3xl md:text-4xl font-bold">Built for the way you learn</h2>
            <p className="text-slate-600 mt-3">
              Whether you're prepping for an exam or exploring a new hobby, TutorLink gives you
              the tools, transparency, and trust to learn faster.
            </p>
            <Link to="/signup" className="btn-primary mt-6">
              Create free account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {studentBenefits.map(b => (
              <div key={b.title} className="card p-5">
                <b.icon className="w-6 h-6 text-brand-600 mb-3" />
                <div className="font-semibold">{b.title}</div>
                <div className="text-sm text-slate-600 mt-1">{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-gradient-to-br from-brand-600 to-pink-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">How TutorLink works</h2>
          <p className="text-center text-white/80 mb-12">From signup to session in 4 easy steps.</p>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map(s => (
              <div key={s.n} className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
                <div className="w-10 h-10 rounded-full bg-white text-brand-700 font-bold flex items-center justify-center mb-3">{s.n}</div>
                <div className="font-semibold text-lg">{s.title}</div>
                <div className="text-white/80 text-sm mt-1">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Loved by students everywhere</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <div key={t.name} className="card p-6">
              <div className="flex gap-1 text-amber-500 mb-3">
                {Array.from({length:5}).map((_,i) => <Star key={i} className="w-4 h-4 fill-amber-500" />)}
              </div>
              <p className="text-slate-700">"{t.text}"</p>
              <div className="mt-4 text-sm">
                <div className="font-semibold">{t.name}</div>
                <div className="text-slate-500">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="card p-10 md:p-14 text-center bg-gradient-to-br from-slate-900 to-brand-800 text-white border-none">
          <Sparkles className="w-10 h-10 mx-auto mb-4 text-amber-300" />
          <h2 className="text-3xl md:text-4xl font-bold">Ready to get started?</h2>
          <p className="text-white/80 mt-3 max-w-xl mx-auto">
            Join thousands of learners. First lesson on us — sign up now.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/signup" className="btn bg-white text-brand-700 hover:bg-slate-100 px-6 py-3">
              I'm a Student <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/become-tutor" className="btn border border-white/40 hover:bg-white/10 px-6 py-3">
              I'm a Tutor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
