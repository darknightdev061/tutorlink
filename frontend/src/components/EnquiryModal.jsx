import { useEffect, useState } from 'react';
import { X, Send, CheckCircle2, Phone, Mail, GraduationCap, MapPin, MessageSquare, User } from 'lucide-react';
import toast from 'react-hot-toast';

// Public, no-login enquiry form. Pass `type='student' | 'tutor'` and an
// optional `source` label so the admin can see where the lead came from.
export default function EnquiryModal({ open, onClose, type = 'student', source, title }) {
  const empty = {
    full_name: '', phone: '', email: '',
    grade_level: '', subjects: '', city: '', message: ''
  };
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => { if (open) { setForm(empty); setDone(false); } }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;
  const set = (k, v) => setForm({ ...form, [k]: v });
  const isTutor = type === 'tutor';

  const submit = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) return toast.error('Please enter your name');
    if (!form.phone.trim() && !form.email.trim()) return toast.error('Phone or email is required so we can reach you');
    setBusy(true);
    try {
      const r = await fetch('/api/site/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          source: source || (isTutor ? 'become_tutor' : 'find_tutor'),
          full_name: form.full_name,
          phone: form.phone,
          email: form.email,
          grade_level: form.grade_level,
          subjects: form.subjects.split(',').map(s => s.trim()).filter(Boolean),
          city: form.city,
          message: form.message
        })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || `Submit failed (${r.status})`);
      setDone(true);
    } catch (err) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-playful overflow-hidden animate-pop max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="relative gradient-rainbow text-white px-6 py-5">
          <button onClick={onClose} aria-label="Close"
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
          <h2 className="h-display text-2xl font-bold">
            {title || (isTutor ? 'Apply to teach with TutorLink' : 'Find the right tutor for your child')}
          </h2>
          <p className="text-white/85 text-sm mt-1">
            {isTutor
              ? 'Fill the form and our team will call you back within a few hours.'
              : "Just fill the form — we'll WhatsApp / call you back with hand-picked tutors. No login, no payment, no commitment."}
          </p>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6">
          {done ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-mint-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-9 h-9 text-mint-600" />
              </div>
              <h3 className="h-display text-2xl font-bold">Thank you, {form.full_name.split(' ')[0]}!</h3>
              <p className="text-slate-600 mt-2">
                Our admin team has received your enquiry and will reach out via {form.phone ? 'phone / WhatsApp' : 'email'} within a few hours.
              </p>
              <button onClick={onClose} className="btn-primary mt-6">Close</button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {isTutor ? 'Your name' : "Parent / student name"} *</label>
                  <input className="input" value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="e.g. Rohan Sharma" required autoFocus />
                </div>
                <div>
                  <label className="label flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone / WhatsApp</label>
                  <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 90000 12345" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email <span className="text-slate-400 font-normal">(optional if you gave phone)</span></label>
                  <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" />
                </div>
                {!isTutor && (
                  <>
                    <div>
                      <label className="label flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" /> Child's class</label>
                      <input className="input" value={form.grade_level} onChange={e => set('grade_level', e.target.value)} placeholder="e.g. Class 9, JEE aspirant" />
                    </div>
                    <div>
                      <label className="label flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> City</label>
                      <input className="input" value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Bengaluru" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label">Subject(s) needed <span className="text-slate-400 font-normal">comma separated</span></label>
                      <input className="input" value={form.subjects} onChange={e => set('subjects', e.target.value)} placeholder="Mathematics, Physics" />
                    </div>
                  </>
                )}
                {isTutor && (
                  <>
                    <div>
                      <label className="label flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> City</label>
                      <input className="input" value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Mumbai" />
                    </div>
                    <div>
                      <label className="label">Subjects you can teach <span className="text-slate-400 font-normal">comma separated</span></label>
                      <input className="input" value={form.subjects} onChange={e => set('subjects', e.target.value)} placeholder="Maths, Physics" />
                    </div>
                  </>
                )}
                <div className="sm:col-span-2">
                  <label className="label flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Anything else? <span className="text-slate-400 font-normal">(optional)</span></label>
                  <textarea className="input min-h-[90px]" value={form.message} onChange={e => set('message', e.target.value)}
                    placeholder={isTutor ? 'Qualifications, experience, hourly rate expectation…' : 'Preferred mode (online / home), timing, weak topics…'} />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <p className="text-xs text-slate-500">By submitting, you agree to be contacted by TutorLink.</p>
                <button disabled={busy} className="btn-primary w-full sm:w-auto">
                  <Send className="w-4 h-4" /> {busy ? 'Submitting…' : (isTutor ? 'Apply to teach' : 'Get tutor recommendations')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
