import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Search, MapPin, BookOpen, ShieldCheck, Star, Users, Calendar,
  MessageSquare, Wallet, Award, Sparkles, ArrowRight, CheckCircle2,
  Target, Zap, Globe, Clock, Video, FileText, Languages, TrendingUp,
  Heart, Smile, Rocket, GraduationCap, BadgeCheck, Lock, Phone,
  PlayCircle, ChevronDown, ChevronRight, Trophy, PenTool, Calculator,
  Atom, FlaskConical, Microscope, Music, Palette, Code2, Globe2,
  Brain, Lightbulb, IndianRupee, HandHeart, Baby, School, Gamepad2,
  CalendarCheck, BookOpenCheck, BarChart3, Headphones, Quote
} from 'lucide-react';

// Unsplash images (stable photo IDs, education / kids / India theme)
const IMG = {
  heroKid:    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
  classroom:  'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=1200&q=80',
  studyKid:   'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80',
  online:     'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=1000&q=80',
  laptopKid:  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1000&q=80',
  reading:    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1000&q=80',
  art:        'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1000&q=80',
  group:      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80',
  primary:    'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1000&q=80',
  middle:     'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80',
  high:       'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=1000&q=80',
  parent:     'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1000&q=80',
  india:      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
  notebook:   'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000&q=80',
  // Tutor avatars (well-known stable Unsplash portraits)
  t1:         'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  t2:         'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  t3:         'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  t4:         'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80'
};
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80';
const onImgErr = (e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; };

const subjects = [
  { name: 'Mathematics',     icon: Calculator,  color: 'bg-brand-100 text-brand-700',  count: 540, blurb: 'From times-tables to calculus' },
  { name: 'Physics',         icon: Atom,        color: 'bg-grape-100 text-grape-700',  count: 312, blurb: 'JEE, NEET & board prep' },
  { name: 'Chemistry',       icon: FlaskConical,color: 'bg-mint-100 text-mint-700',    count: 287, blurb: 'Concepts + numericals' },
  { name: 'Biology',         icon: Microscope,  color: 'bg-coral-100 text-coral-700',  count: 256, blurb: 'NEET-focused & boards' },
  { name: 'English',         icon: BookOpen,    color: 'bg-candy-100 text-candy-700',  count: 421, blurb: 'Grammar, writing, spoken' },
  { name: 'Computer Science',icon: Code2,       color: 'bg-brand-100 text-brand-700',  count: 298, blurb: 'Python, Java, Scratch & more' },
  { name: 'Hindi & Regional',icon: Languages,   color: 'bg-sunny-100 text-sunny-800',  count: 188, blurb: 'Hindi, Tamil, Bengali, Marathi…' },
  { name: 'Social Studies',  icon: Globe2,      color: 'bg-grape-100 text-grape-700',  count: 174, blurb: 'History, Civics, Geography' },
  { name: 'Drawing & Art',   icon: Palette,     color: 'bg-coral-100 text-coral-700',  count: 132, blurb: 'Sketching, painting, crafts' },
  { name: 'Music',           icon: Music,       color: 'bg-candy-100 text-candy-700',  count:  94, blurb: 'Vocals, keyboard, guitar' },
  { name: 'Coding for Kids', icon: Gamepad2,    color: 'bg-mint-100 text-mint-700',    count: 156, blurb: 'Scratch, robotics, games' },
  { name: 'Olympiad Prep',   icon: Trophy,      color: 'bg-sunny-100 text-sunny-800',  count: 109, blurb: 'NSO, IMO, NSTSE, KVPY' }
];

const ageGroups = [
  {
    title: 'Little Learners',
    range: 'Classes 1 – 5',
    img: IMG.primary,
    color: 'from-sunny-400 to-coral-400',
    chip: 'bg-sunny-100 text-sunny-800',
    icon: Baby,
    points: [
      'Story-based, game-style lessons that keep tiny attention spans engaged',
      'Phonics, handwriting, basic maths, EVS, and good-touch / safety chats',
      'Short 30-min sessions twice a week — no burnout for kids',
      'Weekly fun-quiz with stickers, badges and a parent-shared report'
    ]
  },
  {
    title: 'Curious Climbers',
    range: 'Classes 6 – 8',
    img: IMG.middle,
    color: 'from-mint-400 to-brand-500',
    chip: 'bg-mint-100 text-mint-700',
    icon: Lightbulb,
    points: [
      'Concept-first teaching aligned to CBSE, ICSE & all major State Boards',
      'Doubt-clearing within 24 hours over chat — no question is too small',
      'Mental maths, NCERT mastery, science experiments and creative writing',
      'Olympiad foundation tracks (NSO, IMO, NSTSE) bundled into the plan'
    ]
  },
  {
    title: 'Board Warriors',
    range: 'Classes 9 – 10',
    img: IMG.high,
    color: 'from-brand-500 to-grape-600',
    chip: 'bg-brand-100 text-brand-700',
    icon: BookOpenCheck,
    points: [
      'Full board-syllabus coverage with chapter-wise PYQ practice',
      'Pre-board mock tests, error analysis and a custom revision planner',
      'PCM/PCB foundation for JEE / NEET aspirants — early head-start',
      'Career & stream-selection counselling included free at the end of Class 10'
    ]
  },
  {
    title: 'Future Makers',
    range: 'Classes 11 – 12 & Drop-year',
    img: IMG.online,
    color: 'from-candy-500 to-grape-600',
    chip: 'bg-candy-100 text-candy-700',
    icon: Rocket,
    points: [
      'JEE Main + Advanced, NEET, CUET, CA Foundation and CLAT-ready tutors',
      'IIT / AIIMS / NIT alumni mentors available with verified credentials',
      'Daily DPP, weekly tests, all-India rank simulator and detailed analytics',
      'Boards + competitive prep balanced — no more juggling two coachings'
    ]
  }
];

const features = [
  {
    icon: MapPin,
    title: 'Hyper-local Match',
    color: 'bg-brand-100 text-brand-700',
    short: 'Find verified tutors within 1 km – 25 km of your home.',
    details: 'Pin your home, set the radius, and see only tutors who can actually reach you. Filters for metro pincodes, gated societies and tier-2 cities.'
  },
  {
    icon: ShieldCheck,
    title: 'Background-Verified',
    color: 'bg-mint-100 text-mint-700',
    short: 'Every tutor passes ID, address & credential checks before going live.',
    details: 'Aadhaar e-KYC, PAN match, address proof, last-employer reference and a manual interview by our academic team. We list only ~14% of applicants.'
  },
  {
    icon: Calendar,
    title: 'Flexible Scheduling',
    color: 'bg-sunny-100 text-sunny-800',
    short: 'Pick weekday evenings, weekend mornings or exam-week intensive blocks.',
    details: 'Reschedule up to 4 hours before any session at zero cost. Tutor pause / handover support if your child or tutor falls ill.'
  },
  {
    icon: MessageSquare,
    title: 'Direct Chat (Hindi + English)',
    color: 'bg-candy-100 text-candy-700',
    short: 'Chat with the tutor before booking — no call-centre middlemen.',
    details: 'In-app messaging with read receipts, file sharing for worksheets, and parent-loop mode so guardians can see all chats with the tutor.'
  },
  {
    icon: IndianRupee,
    title: 'Transparent INR Pricing',
    color: 'bg-coral-100 text-coral-700',
    short: 'Hourly rates from ₹199 — no hidden GST, no surprise charges.',
    details: 'Pay per session, weekly, or monthly with EMI options via Razorpay. UPI, Paytm, cards, net-banking — all supported. Fully refundable first class.'
  },
  {
    icon: Star,
    title: 'Honest, Verified Reviews',
    color: 'bg-grape-100 text-grape-700',
    short: 'Only students who completed sessions can review tutors.',
    details: 'No fake reviews. Reviews tied to verified bookings, with separate sub-ratings for clarity, punctuality, patience-with-kids and homework support.'
  },
  {
    icon: Video,
    title: 'Online + Home Tuitions',
    color: 'bg-brand-100 text-brand-700',
    short: 'Choose Zoom-style live classes or in-person home visits.',
    details: 'Built-in live class with whiteboard, screen-share and recording (recordings stored for 30 days for revision). Or book at-home tutors safely.'
  },
  {
    icon: BarChart3,
    title: 'Progress Dashboard',
    color: 'bg-mint-100 text-mint-700',
    short: 'Track marks, attendance and skill growth in one place.',
    details: 'Subject-wise heatmaps, topic mastery bars, weekly streaks and exportable PDF reports you can share with school teachers or parents.'
  },
  {
    icon: HandHeart,
    title: 'Parent Peace-of-Mind',
    color: 'bg-candy-100 text-candy-700',
    short: 'Live class link, attendance and recordings — visible to parents.',
    details: 'Optional parent-view dashboard. Get SMS / WhatsApp alerts when classes start, end, or are missed. Audit any session whenever you like.'
  },
  {
    icon: Lock,
    title: 'Privacy & Safety First',
    color: 'bg-grape-100 text-grape-700',
    short: 'Children\'s data protected as per India\'s DPDP Act 2023.',
    details: 'No phone numbers shared until you book. Encrypted chats. POSH-compliant tutor onboarding. One-tap report-and-block for any tutor.'
  },
  {
    icon: BookOpenCheck,
    title: 'NCERT + Board-aligned',
    color: 'bg-sunny-100 text-sunny-800',
    short: 'CBSE, ICSE, IB, IGCSE, and every State Board covered.',
    details: 'Tutors tagged by board they teach. Worksheets, PYQs and sample papers shared after every chapter. Aligned to NEP 2020 competencies.'
  },
  {
    icon: Headphones,
    title: '24×7 Support',
    color: 'bg-coral-100 text-coral-700',
    short: 'Real humans on call, chat and WhatsApp — every day of the year.',
    details: 'Average reply time under 4 minutes. Hindi, English, Tamil, Telugu, Bengali and Marathi support. Escalation path for safety concerns.'
  }
];

const steps = [
  { n: 1, title: 'Sign up free',  desc: 'Create a parent or student account in under 60 seconds — no credit card needed.', icon: Users,        color: 'bg-brand-100 text-brand-700' },
  { n: 2, title: 'Tell us about your child', desc: 'Class, board, subjects, weak topics and how often you\'d like sessions.', icon: PenTool,    color: 'bg-candy-100 text-candy-700' },
  { n: 3, title: 'Match with a tutor', desc: 'Browse hand-picked, ranked tutors and chat free with up to 5 of them.',     icon: Sparkles,    color: 'bg-sunny-100 text-sunny-800' },
  { n: 4, title: 'Book your free demo', desc: 'Every tutor offers a free 30-min demo. Like it? Continue. Don\'t? Switch.',  icon: PlayCircle,  color: 'bg-mint-100 text-mint-700' },
  { n: 5, title: 'Learn & track progress', desc: 'Daily DPPs, weekly tests, monthly reports — and watch the grades climb.', icon: TrendingUp, color: 'bg-grape-100 text-grape-700' }
];

const stats = [
  { v: '12,000+',  l: 'Happy students',     icon: Smile,       color: 'text-brand-700' },
  { v: '3,400+',   l: 'Verified tutors',    icon: BadgeCheck,  color: 'text-mint-600' },
  { v: '50+',      l: 'Subjects offered',   icon: BookOpen,    color: 'text-candy-600' },
  { v: '4.9 ★',    l: 'Average rating',     icon: Star,        color: 'text-sunny-600' },
  { v: '98%',      l: 'Parents recommend',  icon: Heart,       color: 'text-coral-600' },
  { v: '120+',     l: 'Cities covered',     icon: MapPin,      color: 'text-grape-600' }
];

const sampleTutors = [
  { name: 'Priya Sharma',  city: 'Bengaluru',   subj: ['Maths','Physics'], price: 499, rate: 4.9, sessions: 412, exp: 'IIT-Madras • 6 yrs', avatar: IMG.t1, badge: 'JEE Mentor' },
  { name: 'Arjun Verma',   city: 'Delhi NCR',   subj: ['Chemistry','Biology'], price: 599, rate: 4.8, sessions: 286, exp: 'AIIMS-Delhi • 5 yrs', avatar: IMG.t2, badge: 'NEET Expert' },
  { name: 'Meera Iyer',    city: 'Chennai',     subj: ['English','Hindi'], price: 349, rate: 5.0, sessions: 521, exp: 'Loyola • 9 yrs', avatar: IMG.t3, badge: 'Loved by kids' },
  { name: 'Rohit Khanna',  city: 'Mumbai',      subj: ['Coding','Robotics'], price: 449, rate: 4.9, sessions: 198, exp: 'BITS Pilani • 4 yrs', avatar: IMG.t4, badge: 'Coding Coach' }
];

const plans = [
  {
    name: 'Starter',
    price: 1999, per: 'month',
    color: 'border-slate-200',
    btn: 'btn-outline',
    desc: 'Perfect to try out — for one subject, 8 sessions a month.',
    features: [
      '8 sessions / month (45 mins each)',
      '1 subject of your choice',
      'Free demo session',
      'WhatsApp doubt support',
      'Cancel anytime'
    ],
    badge: null
  },
  {
    name: 'Smart',
    price: 3499, per: 'month',
    color: 'border-brand-500 ring-4 ring-brand-100',
    btn: 'btn-primary',
    desc: 'Most-loved plan — covers two subjects with weekly tests.',
    features: [
      '16 sessions / month',
      'Up to 2 subjects',
      'Weekly mock tests + analysis',
      'Monthly parent report card',
      'Priority tutor matching',
      'Class recordings (30-day access)'
    ],
    badge: 'Most Popular'
  },
  {
    name: 'Champion',
    price: 5999, per: 'month',
    color: 'border-candy-500 ring-4 ring-candy-100',
    btn: 'btn-candy',
    desc: 'For boards & competitive prep — unlimited subjects + mentor.',
    features: [
      'Unlimited sessions (Mon–Sat)',
      'All subjects + Olympiad prep',
      'Daily DPPs + AI doubt-bot',
      'Dedicated academic mentor',
      'JEE / NEET / CUET test series',
      '1-on-1 career counselling'
    ],
    badge: 'Best Value'
  }
];

const testimonials = [
  { name: 'Anjali R.',     role: 'Parent of Class 7 student • Pune',  text: 'My son went from struggling in maths to topping his class. The tutor we got was patient, kind, and explained things in Hindi when he got stuck.', img: IMG.parent, stars: 5 },
  { name: 'Kabir S.',      role: 'Class 10 student • Hyderabad',     text: 'I found a physics tutor 2 km from my home in 10 minutes. We had a free demo the next evening — booked him immediately. Boards went amazing!', img: IMG.studyKid, stars: 5 },
  { name: 'Mrs. Banerjee', role: 'Parent of Class 4 twins • Kolkata', text: 'I love the parent dashboard. I can see exactly what my daughters learnt every week, and the tutor sends me a tiny WhatsApp note after each class.', img: IMG.group, stars: 5 },
  { name: 'Rajesh K.',     role: 'Drop-year aspirant • Kota',         text: 'Tried 3 expensive coachings. TutorLink gave me a 1-on-1 IIT-alum mentor at a fraction of the cost. Cleared JEE Mains 99.4 percentile!',         img: IMG.high,    stars: 5 }
];

const safety = [
  { icon: BadgeCheck, title: 'ID + Address Verified', text: 'Aadhaar e-KYC and PAN match for every single tutor.' },
  { icon: ShieldCheck, title: 'Police Verification',  text: 'Mandatory police check for all home-tuition tutors.' },
  { icon: Lock,        title: 'Encrypted Chats',      text: 'End-to-end encrypted messages and call masking.' },
  { icon: HandHeart,   title: 'POSH Compliant',       text: 'Internal committee for any concern — replies in 24h.' },
  { icon: Phone,       title: 'Parent Loop-In',       text: 'Parents auto-added to chats for kids under 13.' },
  { icon: BookOpen,    title: 'Code of Conduct',      text: 'Every tutor signs and is trained on child-safety policy.' }
];

const faqs = [
  { q: 'Is TutorLink only for online tuitions?', a: 'No — you can choose online live classes (built-in whiteboard) or invite a verified tutor to your home. We support both, and your child can switch between modes any time.' },
  { q: 'Which boards and exams are covered?', a: 'CBSE, ICSE, IB, IGCSE and all State Boards (Maharashtra, Tamil Nadu, Karnataka, Telangana, Andhra, Kerala, West Bengal, Bihar, UP, Rajasthan and more). Competitive: JEE Main + Advanced, NEET, CUET, NTSE, KVPY, Olympiads, CLAT and CA Foundation.' },
  { q: 'Are tutors really verified?', a: 'Yes. Every tutor goes through Aadhaar e-KYC, PAN matching, address proof, qualification verification, a manual subject-matter interview and a child-safety briefing. Only about 14% of applicants make it onto the platform.' },
  { q: 'What does it cost in INR?', a: 'Hourly rates start at ₹199 for primary classes and average ₹350–₹600 for senior classes. Monthly plans begin at ₹1,999. You can pay via UPI, cards, net-banking, Paytm or no-cost EMI on Razorpay.' },
  { q: 'What if my child doesn\'t like the tutor?', a: 'Every tutor offers a free 30-minute demo. If you don\'t love it, switch tutors instantly at zero cost — even mid-month. Your remaining sessions transfer to the new tutor automatically.' },
  { q: 'How do I trust the tutor with my young child?', a: 'For students under 13, parents are auto-added to all chats and receive class start/end SMS alerts. All home-tuition tutors are police-verified. You can also choose female-only tutors for daughters.' },
  { q: 'Do you teach in Hindi or regional languages?', a: 'Absolutely. You can filter tutors by teaching language — Hindi, Tamil, Telugu, Bengali, Marathi, Kannada, Malayalam, Gujarati, Punjabi and more. Many tutors switch fluidly between English and the home language.' },
  { q: 'How is TutorLink different from BYJU\'S, Vedantu or Unacademy?', a: 'They sell pre-recorded courses to crowds. We connect your child to ONE specific human tutor, who teaches them live, knows their weak chapters, sends personalised homework and stays accountable for their grades.' }
];

function FaqItem({ q, a, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card-fun p-5">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between gap-4 text-left">
        <span className="font-bold text-slate-900">{q}</span>
        <ChevronDown className={`w-5 h-5 text-brand-600 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="mt-3 text-slate-600 leading-relaxed">{a}</p>}
    </div>
  );
}

export default function Landing() {
  // Tiny live counters for fun
  const [studentCount, setStudentCount] = useState(11842);
  useEffect(() => {
    const id = setInterval(() => setStudentCount(c => c + Math.floor(Math.random() * 3)), 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* ANNOUNCEMENT BAR */}
      <div className="gradient-rainbow text-white text-sm">
        <div className="container-x py-2.5 flex flex-wrap items-center justify-center gap-2 text-center">
          <Sparkles className="w-4 h-4 animate-wiggle" />
          <span className="font-semibold">India's most-loved 1-on-1 tuition platform</span>
          <span className="opacity-80">•</span>
          <span>First demo class is <span className="font-bold underline underline-offset-2">100% FREE</span> — sign up in 60 seconds.</span>
        </div>
      </div>

      {/* HERO */}
      <section className="relative gradient-hero overflow-hidden">
        <div className="blob bg-brand-300 w-72 h-72 -top-20 -left-20" />
        <div className="blob bg-candy-300 w-96 h-96 -bottom-32 right-0" />
        <div className="absolute inset-0 bg-dots opacity-40 pointer-events-none" />

        <div className="container-x relative pt-12 pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <span className="badge bg-white/80 text-brand-700 mb-4 shadow-sm border border-brand-100">
              <Sparkles className="w-3.5 h-3.5" /> Made in India 🇮🇳 • For every Indian child
            </span>
            <h1 className="h-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.05]">
              Learning that feels<br />
              like <span className="kid-underline text-gradient">play time</span> 🎉<br />
              not <span className="line-through text-slate-400">homework</span>
            </h1>
            <p className="mt-6 text-lg text-slate-700 max-w-xl leading-relaxed">
              India's friendliest 1-on-1 tutoring platform — connect with a <b>verified, hand-picked tutor</b> for
              your child, from <b>Class 1 to Class 12</b>. Boards, JEE, NEET, Olympiads, coding, music & more —
              all from <b>₹199 / hour</b>.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup" className="btn-primary text-base px-6 py-3.5">
                <Rocket className="w-4 h-4" /> Start free — book a demo
              </Link>
              <Link to="/find-tutors" className="btn-outline text-base px-6 py-3.5">
                <Search className="w-4 h-4" /> Browse 3,400+ tutors
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl">
              {[
                { ic: CheckCircle2, t: 'Free demo', c: 'text-mint-600' },
                { ic: IndianRupee,  t: 'From ₹199/hr', c: 'text-brand-600' },
                { ic: ShieldCheck,  t: 'KYC-verified', c: 'text-grape-600' },
                { ic: Heart,        t: 'Loved in 120+ cities', c: 'text-candy-600' }
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <f.ic className={`w-4 h-4 ${f.c}`} /> {f.t}
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3 text-sm text-slate-600">
              <div className="flex -space-x-2">
                {[IMG.t1, IMG.t2, IMG.t3, IMG.t4].map((u,i) => (
                  <img onError={onImgErr} key={i} src={u} alt="" className="w-9 h-9 rounded-full border-2 border-white object-cover" />
                ))}
              </div>
              <div>
                <div className="font-bold text-slate-900">{studentCount.toLocaleString('en-IN')}+ students</div>
                <div>learning live on TutorLink right now</div>
              </div>
            </div>
          </div>

          {/* HERO IMAGE COLLAGE */}
          <div className="relative h-[500px] hidden lg:block">
            <img onError={onImgErr} src={IMG.heroKid} alt="Happy student" loading="lazy"
              className="absolute top-0 right-0 w-[78%] h-[58%] object-cover rounded-3xl shadow-playful animate-float" />
            <img onError={onImgErr} src={IMG.online} alt="Online tutor" loading="lazy"
              className="absolute bottom-0 left-0 w-[62%] h-[48%] object-cover rounded-3xl shadow-candy animate-float [animation-delay:1.2s]" />

            {/* Floating tutor card */}
            <div className="absolute top-4 -left-2 card p-4 w-64 animate-pop bg-white">
              <div className="flex items-center gap-3">
                <img onError={onImgErr} src={IMG.t1} className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-200" alt="" />
                <div>
                  <div className="font-bold text-slate-900">Priya Sharma</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> 1.4 km away • Indiranagar
                  </div>
                </div>
              </div>
              <div className="flex gap-1.5 mt-3 flex-wrap">
                <span className="chip">Maths</span>
                <span className="chip">JEE</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-bold text-brand-700 flex items-center"><IndianRupee className="w-4 h-4" />499 / hr</span>
                <span className="flex items-center text-sunny-600 font-bold"><Star className="w-4 h-4 fill-sunny-500" /> 4.9</span>
              </div>
            </div>

            {/* Floating session-confirmed */}
            <div className="absolute bottom-4 right-2 card p-4 w-60 bg-white animate-pop [animation-delay:.3s]">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-mint-100 flex items-center justify-center">
                  <CalendarCheck className="w-5 h-5 text-mint-600" />
                </div>
                <div>
                  <div className="font-bold text-sm">Class confirmed!</div>
                  <div className="text-xs text-slate-500">Tomorrow 5:00 PM IST</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-slate-600">Topic: Quadratic Equations</div>
            </div>

            {/* Floating progress */}
            <div className="absolute top-1/2 right-0 card p-4 bg-white animate-bounce-soft">
              <div className="text-xs text-slate-500">Score boost</div>
              <div className="text-2xl font-extrabold text-mint-600">+24%</div>
              <div className="text-xs text-mint-700">↑ in 8 weeks</div>
            </div>
          </div>
        </div>

        {/* trust marquee */}
        <div className="border-t border-slate-200/70 bg-white/60 backdrop-blur">
          <div className="container-x py-5">
            <div className="text-center text-xs font-bold tracking-widest text-slate-500 mb-3">
              TRUSTED BY PARENTS ACROSS INDIA
            </div>
            <div className="scroll-fade-x overflow-hidden">
              <div className="flex gap-10 animate-marquee whitespace-nowrap text-slate-500 font-bold text-lg">
                {['Bengaluru','Delhi NCR','Mumbai','Chennai','Hyderabad','Kolkata','Pune','Ahmedabad','Jaipur','Lucknow','Kochi','Chandigarh','Bhopal','Indore','Patna','Coimbatore'].concat(['Bengaluru','Delhi NCR','Mumbai','Chennai','Hyderabad','Kolkata','Pune','Ahmedabad','Jaipur','Lucknow','Kochi','Chandigarh','Bhopal','Indore','Patna','Coimbatore']).map((c,i) => (
                  <span key={i} className="flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-500" /> {c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-white border-y border-slate-100">
        <div className="container-x py-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map(s => (
            <div key={s.l} className="text-center">
              <s.icon className={`w-7 h-7 mx-auto mb-2 ${s.color}`} />
              <div className="text-2xl md:text-3xl font-extrabold text-slate-900">{s.v}</div>
              <div className="text-xs md:text-sm text-slate-500 mt-1 font-semibold">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* AGE GROUPS — kid-focused */}
      <section className="section-pad bg-gradient-to-b from-white to-brand-50/40">
        <div className="container-x">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="badge bg-sunny-100 text-sunny-800 mb-3"><School className="w-3.5 h-3.5" /> For every age, every stage</span>
            <h2 className="h-display text-3xl md:text-5xl font-bold">A track designed for <span className="text-gradient">your child's class</span></h2>
            <p className="text-slate-600 mt-4 text-lg">From the wide-eyed wonder of Class 1 to the stress of Class 12 boards — we have a tutor, a plan, and a vibe that fits.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {ageGroups.map(g => (
              <div key={g.title} className="card-fun overflow-hidden group">
                <div className="relative h-52 overflow-hidden">
                  <img onError={onImgErr} src={g.img} alt={g.title} loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className={`absolute inset-0 bg-gradient-to-tr ${g.color} opacity-70 mix-blend-multiply`} />
                  <div className="absolute top-4 left-4">
                    <span className={`pill ${g.chip}`}><g.icon className="w-3.5 h-3.5" /> {g.range}</span>
                  </div>
                  <h3 className="absolute bottom-4 left-4 right-4 text-2xl font-bold text-white h-display drop-shadow">{g.title}</h3>
                </div>
                <div className="p-6">
                  <ul className="space-y-2.5">
                    {g.points.map((p,i) => (
                      <li key={i} className="flex gap-2 text-slate-700">
                        <CheckCircle2 className="w-5 h-5 text-mint-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm leading-relaxed">{p}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup" className="mt-5 inline-flex items-center gap-1.5 font-bold text-brand-700 hover:text-brand-800 group/link">
                    Find a tutor for {g.range} <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUBJECTS */}
      <section className="section-pad container-x">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="badge bg-candy-100 text-candy-700 mb-3"><BookOpen className="w-3.5 h-3.5" /> 50+ subjects</span>
          <h2 className="h-display text-3xl md:text-5xl font-bold">Whatever they want to learn — <span className="text-gradient">we've got the right teacher</span></h2>
          <p className="text-slate-600 mt-4 text-lg">From multiplication tables to thermodynamics, sketching to Scratch — explore every subject your child could ever ask for.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {subjects.map(s => (
            <Link to={`/find-tutors?subject=${encodeURIComponent(s.name)}`} key={s.name}
              className="card-fun p-5 group">
              <div className={`w-12 h-12 rounded-2xl ${s.color} flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div className="font-bold text-slate-900 group-hover:text-brand-700">{s.name}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.blurb}</div>
              <div className="mt-3 text-xs font-bold text-brand-600 flex items-center gap-1">
                {s.count}+ tutors <ChevronRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/subjects" className="btn-outline">See all subjects <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </section>

      {/* FEATURES — every feature described */}
      <section className="section-pad bg-gradient-to-b from-brand-50/40 to-candy-50/30">
        <div className="container-x">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="badge bg-brand-100 text-brand-700 mb-3"><Sparkles className="w-3.5 h-3.5" /> 12 things you'll love</span>
            <h2 className="h-display text-3xl md:text-5xl font-bold">Built for Indian students, <span className="text-gradient">not generic ed-tech</span></h2>
            <p className="text-slate-600 mt-4 text-lg">Every detail of TutorLink is designed around how Indian families actually learn — boards, language, budget and safety. Tap any card to learn more.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => (
              <div key={f.title} className="card-fun p-6 group">
                <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">{f.title}</h3>
                <p className="text-sm text-slate-700 mt-2 font-semibold">{f.short}</p>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">{f.details}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section-pad container-x">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="badge bg-mint-100 text-mint-700 mb-3"><Rocket className="w-3.5 h-3.5" /> Get started in minutes</span>
          <h2 className="h-display text-3xl md:text-5xl font-bold">From <span className="text-gradient">"hmm, maybe"</span> to first class — in 5 simple steps</h2>
        </div>

        <div className="grid md:grid-cols-5 gap-4 relative">
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-1 bg-gradient-to-r from-brand-200 via-candy-200 to-sunny-200 rounded-full" />
          {steps.map(s => (
            <div key={s.n} className="relative card-fun p-5 text-center">
              <div className={`w-14 h-14 mx-auto rounded-2xl ${s.color} flex items-center justify-center mb-3`}>
                <s.icon className="w-7 h-7" />
              </div>
              <div className="text-xs font-bold text-slate-400">STEP {s.n}</div>
              <div className="font-bold text-slate-900 mt-1">{s.title}</div>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SAMPLE TUTORS */}
      <section className="section-pad bg-slate-50">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <span className="badge bg-grape-100 text-grape-700 mb-3"><GraduationCap className="w-3.5 h-3.5" /> Meet a few of our stars</span>
              <h2 className="h-display text-3xl md:text-4xl font-bold">Top-rated tutors — <span className="text-gradient">all over India</span></h2>
            </div>
            <Link to="/find-tutors" className="btn-primary">Browse all <ArrowRight className="w-4 h-4" /></Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {sampleTutors.map(t => (
              <div key={t.name} className="card-fun overflow-hidden">
                <div className="relative h-44">
                  <img onError={onImgErr} src={t.avatar} alt={t.name} loading="lazy" className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 pill bg-white/95 text-brand-700"><BadgeCheck className="w-3.5 h-3.5 text-mint-500" /> {t.badge}</span>
                  <span className="absolute bottom-3 right-3 pill bg-sunny-400 text-slate-900"><Star className="w-3.5 h-3.5 fill-current" /> {t.rate}</span>
                </div>
                <div className="p-5">
                  <div className="font-bold text-lg">{t.name}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {t.city}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {t.subj.map(x => <span key={x} className="chip">{x}</span>)}
                  </div>
                  <div className="text-xs text-slate-600 mt-3">{t.exp} • {t.sessions} sessions</div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-extrabold text-brand-700 flex items-center text-lg">
                      <IndianRupee className="w-4 h-4" />{t.price}<span className="text-xs text-slate-500 font-semibold ml-1">/hr</span>
                    </span>
                    <button className="btn-primary py-2 px-4 text-sm">Book demo</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY INDIA */}
      <section className="section-pad container-x">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <img onError={onImgErr} src={IMG.india} alt="Indian classroom" loading="lazy"
              className="rounded-3xl shadow-playful w-full h-[480px] object-cover" />
            <div className="absolute -bottom-6 -right-6 card p-5 hidden md:block w-64">
              <div className="flex items-center gap-2 text-mint-600 font-bold mb-1">
                <Trophy className="w-5 h-5" /> Olympiad ready
              </div>
              <p className="text-sm text-slate-600">NSO, IMO, NSTSE, KVPY, NTSE — coached by past winners.</p>
            </div>
          </div>
          <div>
            <span className="badge bg-coral-100 text-coral-700 mb-3"><Heart className="w-3.5 h-3.5" /> Made in India</span>
            <h2 className="h-display text-3xl md:text-5xl font-bold leading-tight">Built around <span className="text-gradient">Indian curriculum, Indian timings, Indian budgets</span></h2>
            <p className="text-slate-600 mt-4 text-lg">We don't just translate Western ed-tech for India. TutorLink was designed from day one for the way Indian families learn.</p>

            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {[
                { ic: BookOpenCheck, t: 'CBSE • ICSE • IB • All State Boards', d: 'Tutors tagged by board they teach' },
                { ic: IndianRupee,   t: 'UPI, Paytm, EMI all accepted',          d: 'No-cost EMI on plans above ₹3,000' },
                { ic: Languages,     t: '12 Indian languages',                  d: 'Switch fluidly between English & home-tongue' },
                { ic: Trophy,        t: 'JEE • NEET • CUET • Olympiads',         d: 'Mentors are IIT, NIT and AIIMS alumni' },
                { ic: Clock,         t: 'Indian timings (5–10 PM rush)',         d: 'Highest tutor availability in evening slots' },
                { ic: Phone,         t: 'WhatsApp-first communication',          d: 'Class reminders, reports, doubts — all on WA' }
              ].map((x,i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center flex-shrink-0">
                    <x.ic className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{x.t}</div>
                    <div className="text-sm text-slate-600">{x.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section-pad bg-gradient-to-b from-white to-brand-50/50">
        <div className="container-x">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="badge bg-brand-100 text-brand-700 mb-3"><IndianRupee className="w-3.5 h-3.5" /> Honest, INR pricing</span>
            <h2 className="h-display text-3xl md:text-5xl font-bold">Plans that fit <span className="text-gradient">every Indian family</span></h2>
            <p className="text-slate-600 mt-4 text-lg">No hidden GST, no auto-debits, no surprise charges. Cancel anytime, refund unused sessions in 24 hours.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map(p => (
              <div key={p.name} className={`card p-7 border-2 ${p.color} relative`}>
                {p.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 pill bg-sunny-400 text-slate-900 shadow-sunny">
                    <Sparkles className="w-3.5 h-3.5" /> {p.badge}
                  </span>
                )}
                <h3 className="h-display text-2xl font-bold">{p.name}</h3>
                <p className="text-sm text-slate-600 mt-1">{p.desc}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <IndianRupee className="w-6 h-6 text-slate-700" />
                  <span className="text-5xl font-extrabold text-slate-900">{p.price.toLocaleString('en-IN')}</span>
                  <span className="text-slate-500">/ {p.per}</span>
                </div>
                <Link to="/signup" className={`${p.btn} w-full mt-5 justify-center`}>Choose {p.name}</Link>
                <ul className="mt-6 space-y-2.5">
                  {p.features.map((f,i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-mint-500 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-slate-500 mt-8">
            Or pay-per-class from <b className="text-brand-700">₹199 / hour</b> — no commitment.
            All prices include GST. <Link to="/how-it-works" className="text-brand-700 underline font-semibold">See pricing details</Link>.
          </p>
        </div>
      </section>

      {/* SAFETY */}
      <section className="section-pad container-x">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="badge bg-mint-100 text-mint-700 mb-3"><ShieldCheck className="w-3.5 h-3.5" /> Safety first, always</span>
            <h2 className="h-display text-3xl md:text-5xl font-bold leading-tight">A platform parents <span className="text-gradient">actually trust</span></h2>
            <p className="text-slate-600 mt-4 text-lg">Your child's safety isn't a checkbox — it's the foundation of TutorLink. Every tutor, every chat, every class is monitored, encrypted and policy-bound.</p>
            <div className="mt-7 grid sm:grid-cols-2 gap-4">
              {safety.map(s => (
                <div key={s.title} className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-mint-100 text-mint-700 flex items-center justify-center flex-shrink-0">
                    <s.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{s.title}</div>
                    <div className="text-sm text-slate-600">{s.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img onError={onImgErr} src={IMG.parent} alt="Parent and child" loading="lazy"
              className="rounded-3xl shadow-mint w-full h-[480px] object-cover" />
            <div className="absolute top-6 -left-4 card p-4 w-56 animate-bounce-soft">
              <div className="text-xs text-slate-500">Class started</div>
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-mint-400 opacity-75 animate-ping-soft" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-mint-500" />
                </span>
                Aarav is in class
              </div>
              <div className="text-xs text-slate-500 mt-1">SMS sent to mom</div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section-pad bg-gradient-to-b from-candy-50/30 to-white">
        <div className="container-x">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="badge bg-candy-100 text-candy-700 mb-3"><Quote className="w-3.5 h-3.5" /> Real stories</span>
            <h2 className="h-display text-3xl md:text-5xl font-bold">Loved by <span className="text-gradient">parents and students</span> across India</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="card-fun p-6 flex gap-4">
                <img onError={onImgErr} src={t.img} className="w-20 h-20 rounded-2xl object-cover flex-shrink-0" alt={t.name} loading="lazy" />
                <div>
                  <div className="flex gap-0.5 text-sunny-500 mb-2">
                    {Array.from({length: t.stars}).map((_,i) => <Star key={i} className="w-4 h-4 fill-sunny-500" />)}
                  </div>
                  <p className="text-slate-700 leading-relaxed">"{t.text}"</p>
                  <div className="mt-3">
                    <div className="font-bold">{t.name}</div>
                    <div className="text-sm text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BECOME A TUTOR */}
      <section className="section-pad container-x">
        <div className="card-fun overflow-hidden grid lg:grid-cols-2 gap-0">
          <div className="p-8 md:p-12">
            <span className="badge bg-grape-100 text-grape-700 mb-3"><Wallet className="w-3.5 h-3.5" /> For tutors</span>
            <h2 className="h-display text-3xl md:text-4xl font-bold leading-tight">Earn up to <span className="text-gradient">₹80,000 / month</span> teaching what you love</h2>
            <p className="text-slate-600 mt-4 leading-relaxed">Whether you're a college student, a working professional, or a retired teacher — share your knowledge, set your own rates and schedule. Indian-payment-friendly payouts every Friday.</p>
            <ul className="mt-5 space-y-2.5">
              {[
                'Free signup — only 18% commission per session, lower than the industry',
                'Set your own ₹/hour, weekday & weekend timings, online vs home',
                'Weekly UPI / bank transfer payouts every Friday — no waiting',
                'Free training, lesson templates and parent-handling masterclass',
                'Featured profile boost when you cross 4.8★ and 50 sessions'
              ].map((x,i) => (
                <li key={i} className="flex gap-2 text-slate-700"><CheckCircle2 className="w-5 h-5 text-mint-500 flex-shrink-0" /> {x}</li>
              ))}
            </ul>
            <Link to="/become-tutor" className="btn-primary mt-7">Become a tutor — apply free <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="relative min-h-[320px]">
            <img onError={onImgErr} src={IMG.classroom} className="absolute inset-0 w-full h-full object-cover" alt="Tutor" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/70 via-grape-700/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <div className="text-3xl font-bold h-display">3,400+ tutors</div>
              <div className="opacity-90">already earning on TutorLink</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-pad bg-slate-50">
        <div className="container-x max-w-4xl">
          <div className="text-center mb-12">
            <span className="badge bg-brand-100 text-brand-700 mb-3"><Lightbulb className="w-3.5 h-3.5" /> Got questions?</span>
            <h2 className="h-display text-3xl md:text-5xl font-bold">Frequently asked questions</h2>
            <p className="text-slate-600 mt-3">Can't find what you need? <a href="mailto:hello@tutorlink.in" className="text-brand-700 font-semibold underline">Email us</a> or WhatsApp <b>+91-90000-12345</b>.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((f,i) => <FaqItem key={i} q={f.q} a={f.a} defaultOpen={i === 0} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad container-x">
        <div className="relative rounded-3xl overflow-hidden p-10 md:p-16 text-white text-center gradient-sunset shadow-candy">
          <div className="absolute inset-0 bg-dots opacity-20" />
          <div className="relative">
            <div className="flex justify-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-sunny-200 animate-wiggle" />
              <Heart className="w-8 h-8 text-white fill-white animate-bounce-soft" />
              <Sparkles className="w-8 h-8 text-sunny-200 animate-wiggle [animation-delay:.4s]" />
            </div>
            <h2 className="h-display text-3xl md:text-5xl font-bold">Your child's <span className="kid-underline text-slate-900">aha! moment</span> is just one click away</h2>
            <p className="text-white/90 mt-4 max-w-2xl mx-auto text-lg">Join 12,000+ Indian families. First demo class is on us — no card, no commitment, no awkward sales call.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/signup" className="btn bg-white text-candy-700 hover:bg-slate-100 px-7 py-3.5 text-base">
                <Smile className="w-4 h-4" /> Get my child a tutor
              </Link>
              <Link to="/become-tutor" className="btn border-2 border-white/60 text-white hover:bg-white/10 px-7 py-3.5 text-base">
                <GraduationCap className="w-4 h-4" /> I want to teach
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-white/85">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> 100% free signup</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> ₹0 demo class</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> 24h refund guarantee</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
