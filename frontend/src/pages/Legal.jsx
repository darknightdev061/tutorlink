import { Link, useLocation } from 'react-router-dom';
import {
  ShieldCheck, ScrollText, RefreshCcw, BabyIcon, IndianRupee, BookOpenCheck,
  GraduationCap, HeartHandshake
} from 'lucide-react';

const TOPICS = {
  '/privacy': {
    icon: ShieldCheck,
    title: 'Privacy Policy',
    intro: 'We respect your privacy and handle your data in line with the Digital Personal Data Protection Act, 2023 (DPDP).',
    sections: [
      ['What we collect',
        'Account details (name, email, phone), profile information you choose to add, and session/booking history. For tutor applicants we also collect qualifications and a location point used to surface you to nearby students.'],
      ['How we use it',
        'To match students with tutors, send booking notifications, prevent fraud, and improve the platform. We never sell personal data.'],
      ['Children & minors',
        'Students under 18 use the platform under the consent and supervision of a parent or guardian. Guardians can request a copy or deletion of their child\'s data at any time.'],
      ['Your rights',
        'You can access, correct, port, or delete your data by writing to hello@tutorlink.in. We respond within 30 days.']
    ]
  },
  '/terms': {
    icon: ScrollText,
    title: 'Terms of Service',
    intro: 'These terms govern your use of TutorLink. By signing up, you agree to them.',
    sections: [
      ['Accounts',
        'You must provide accurate information and keep your password secure. Accounts are personal and non-transferable.'],
      ['Tutors',
        'Tutors are independent professionals, not employees of TutorLink. You are responsible for the quality of sessions you deliver and for any local taxes on your earnings.'],
      ['Students',
        'Booking a session is a contract between you and the tutor. You agree to pay the agreed rate and to behave respectfully during sessions.'],
      ['Prohibited',
        'No harassment, no off-platform payments, no sharing of contact details before a booking is confirmed, and no impersonation.'],
      ['Liability',
        'TutorLink facilitates introductions and does not guarantee outcomes. Our liability is capped at the fees you have paid us in the last 3 months.']
    ]
  },
  '/refund-policy': {
    icon: RefreshCcw,
    title: 'Refund Policy',
    intro: 'We want every learning journey to start with confidence. Here\'s how refunds work.',
    sections: [
      ['Free demo class',
        'Your first demo class is always free. If you don\'t love it, you owe nothing.'],
      ['Monthly plans',
        'Pro-rata refund of unused sessions if you cancel within the first 7 days. After that, refunds are issued only for technical failures or tutor-no-shows.'],
      ['Pay-per-class',
        'Full refund if you cancel at least 4 hours before the scheduled session. Less than 4 hours: 50% refund. No-show: no refund.'],
      ['Processing time',
        'Refunds reach the original payment source within 5–7 business days of approval.']
    ]
  },
  '/child-safety': {
    icon: BabyIcon,
    title: 'Child Safety',
    intro: 'Every tutor on TutorLink is verified, and every classroom is monitored. Here\'s our commitment.',
    sections: [
      ['Tutor verification',
        'Government-ID verification, education proof, and a police-record self-declaration for every approved tutor.'],
      ['Recorded sessions',
        'All online classes can be recorded for parent review. Recordings are retained for 30 days and never shared outside the family + tutor.'],
      ['Open-door policy',
        'Parents are welcome to attend or audit any in-home or online session.'],
      ['Report a concern',
        'Write to safety@tutorlink.in or call our 24×7 helpline at +91 90000 12345. We act within 24 hours.']
    ]
  },
  '/earnings': {
    icon: IndianRupee,
    title: 'Earnings & Payouts',
    intro: 'How tutors get paid on TutorLink.',
    sections: [
      ['Set your own rate',
        'You decide your hourly rate during application. Most tutors charge between ₹250 and ₹1,200 / hour.'],
      ['Weekly payouts',
        'Earnings are paid directly to your bank account every Tuesday for the previous week\'s completed sessions.'],
      ['Platform fee',
        'TutorLink takes a 15% service fee on completed sessions — that covers payments, support, marketing and recordings.'],
      ['Tax',
        'You receive a year-end statement of earnings for your ITR. GST collection (if applicable) is handled automatically.']
    ]
  },
  '/code-of-conduct': {
    icon: HeartHandshake,
    title: 'Tutor Code of Conduct',
    intro: 'A short, clear charter for every tutor on the platform.',
    sections: [
      ['Be on time',
        'Join 2 minutes before the session. Reschedule politely if something urgent comes up — never ghost a student.'],
      ['Be respectful',
        'No discrimination, harassment, or inappropriate contact. Treat every student and parent with dignity.'],
      ['Stay on platform',
        'All communications, bookings and payments happen on TutorLink. Sharing personal contact for off-platform classes is grounds for suspension.'],
      ['Quality matters',
        'Prepare for each session, share notes after class, and respond to doubts within 24 hours.'],
      ['Safety first',
        'Never meet a student outside a confirmed booking. Online sessions are camera-on for both sides.']
    ]
  },
  '/resources': {
    icon: BookOpenCheck,
    title: 'Tutor Resources & Training',
    intro: 'Free training, templates and tools to help you teach better and earn more.',
    sections: [
      ['Onboarding masterclass',
        'A 90-minute live class every Saturday for newly-approved tutors — covers profile setup, demo class tips and parent communication.'],
      ['Lesson planning templates',
        'Class-wise lesson plans aligned with CBSE, ICSE and major state boards. Available in your tutor dashboard.'],
      ['Doubt-bot for tutors',
        'AI assistant that helps you generate worksheets, MCQs and parent reports in seconds.'],
      ['Community',
        'Join 3,400+ verified tutors on our private WhatsApp community for peer Q&A, referrals and monthly events.']
    ]
  }
};

export default function Legal() {
  const { pathname } = useLocation();
  const data = TOPICS[pathname] || TOPICS['/privacy'];
  const Icon = data.icon;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="card-fun p-6 sm:p-10">
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-2xl gradient-rainbow flex items-center justify-center text-white">
            <Icon className="w-6 h-6" />
          </span>
          <h1 className="h-display text-3xl sm:text-4xl font-bold">{data.title}</h1>
        </div>
        <p className="text-slate-600 mt-4 text-base sm:text-lg leading-relaxed">{data.intro}</p>

        <div className="mt-8 space-y-6">
          {data.sections.map(([title, body]) => (
            <section key={title} className="border-l-4 border-brand-200 pl-4 sm:pl-5">
              <h2 className="font-bold text-lg text-slate-900">{title}</h2>
              <p className="text-slate-600 mt-1.5 leading-relaxed">{body}</p>
            </section>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-wrap gap-3 text-sm">
          <Link to="/" className="btn-ghost"><GraduationCap className="w-4 h-4" /> Back home</Link>
          <a href="mailto:hello@tutorlink.in" className="btn-outline">Email us</a>
          <Link to="/signup" className="btn-primary">Get started</Link>
        </div>
      </div>
    </div>
  );
}
