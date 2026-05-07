import { useState } from 'react';
import {
  Calculator, FlaskConical, BookOpen, Globe2, Atom, TestTube,
  Code2, GraduationCap, ArrowRight
} from 'lucide-react';
import EnquiryModal from '../components/EnquiryModal';

const subjects = [
  { name: 'Mathematics',          icon: Calculator,    color: 'bg-brand-100 text-brand-700',  blurb: 'From basic arithmetic to advanced calculus' },
  { name: 'Science',              icon: FlaskConical,  color: 'bg-mint-100 text-mint-700',    blurb: 'General science for school students' },
  { name: 'History',              icon: BookOpen,      color: 'bg-coral-100 text-coral-700',  blurb: 'Indian and world history' },
  { name: 'Geography',            icon: Globe2,        color: 'bg-sunny-100 text-sunny-800',  blurb: 'Physical, human and Indian geography' },
  { name: 'Physics',              icon: Atom,          color: 'bg-grape-100 text-grape-700',  blurb: 'Mechanics, electricity, JEE / NEET prep' },
  { name: 'Chemistry',            icon: TestTube,      color: 'bg-candy-100 text-candy-700',  blurb: 'Organic, inorganic, physical chemistry' },
  { name: 'Computer Science',     icon: Code2,         color: 'bg-brand-100 text-brand-700',  blurb: 'Python, Java, basics of programming' },
  { name: 'Elementary Education', icon: GraduationCap, color: 'bg-mint-100 text-mint-700',    blurb: 'Foundational learning for Class 1 – 5' }
];

export default function Subjects() {
  const [enquiry, setEnquiry] = useState({ open: false, subject: '' });
  const openForm = (subject) => setEnquiry({ open: true, subject });

  return (
    <div className="max-w-7xl mx-auto px-6 py-14">
      <h1 className="text-4xl font-bold">Browse subjects</h1>
      <p className="text-slate-600 mt-2">Pick a subject and our team will get in touch with the right tutor for you.</p>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {subjects.map(s => (
          <button
            key={s.name}
            onClick={() => openForm(s.name)}
            className="card-fun p-6 text-left group"
          >
            <div className={`w-12 h-12 rounded-2xl ${s.color} flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
              <s.icon className="w-6 h-6" />
            </div>
            <div className="font-bold text-slate-900 group-hover:text-brand-700">{s.name}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.blurb}</div>
            <div className="mt-3 text-xs font-bold text-brand-600 flex items-center gap-1">
              Get a tutor <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </div>
          </button>
        ))}
      </div>

      <EnquiryModal
        open={enquiry.open}
        type="student"
        source={`subject_${enquiry.subject}`}
        title={enquiry.subject ? `Find a ${enquiry.subject} tutor` : undefined}
        initialSubjects={enquiry.subject}
        onClose={() => setEnquiry(s => ({ ...s, open: false }))}
      />
    </div>
  );
}
