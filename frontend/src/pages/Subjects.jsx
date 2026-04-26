import { Link } from 'react-router-dom';

const groups = [
  { title: 'STEM', items: ['Mathematics','Physics','Chemistry','Biology','Computer Science','Statistics','Engineering','Astronomy'] },
  { title: 'Humanities', items: ['English','History','Geography','Philosophy','Sociology','Psychology','Political Science'] },
  { title: 'Languages', items: ['Spanish','French','German','Mandarin','Japanese','Hindi','Arabic'] },
  { title: 'Test Prep',  items: ['SAT','ACT','GRE','GMAT','TOEFL','IELTS','MCAT'] },
  { title: 'Arts & Music', items: ['Piano','Guitar','Vocals','Drawing','Painting','Photography','Drama'] },
  { title: 'Business & Tech', items: ['Accounting','Economics','Finance','Marketing','Excel','Web Development','Data Science'] }
];

export default function Subjects() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-14">
      <h1 className="text-4xl font-bold">Browse subjects</h1>
      <p className="text-slate-600 mt-2">Find a tutor for any topic — from algebra to advanced ML.</p>
      <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map(g => (
          <div key={g.title} className="card p-6">
            <h3 className="font-semibold text-lg mb-3">{g.title}</h3>
            <div className="flex flex-wrap gap-2">
              {g.items.map(s => (
                <Link key={s} to={`/find-tutors?subject=${encodeURIComponent(s)}`}
                  className="chip hover:bg-brand-100">{s}</Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
