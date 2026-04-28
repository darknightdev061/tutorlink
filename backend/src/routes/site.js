const router = require('express').Router();
const { supabaseAdmin } = require('../config/supabase');

// Public read of the landing-page content. Returns {} if the table or row is missing
// so the frontend can fall back to its hardcoded defaults without breaking.
router.get('/content/:id', async (req, res) => {
  const id = req.params.id || 'landing';
  const { data, error } = await supabaseAdmin
    .from('site_content').select('data').eq('id', id).maybeSingle();
  if (error) {
    if (/does not exist|schema cache/i.test(error.message)) return res.json({ data: {} });
    return res.status(400).json({ error: error.message });
  }
  res.json({ data: data?.data || {} });
});

// Public enquiry submission — no auth required. Anti-spam: trim, length cap.
router.post('/enquiry', async (req, res) => {
  const b = req.body || {};
  const clean = (v, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : null);
  const full_name = clean(b.full_name, 120);
  const phone     = clean(b.phone, 30);
  const email     = clean(b.email, 200);
  if (!full_name) return res.status(400).json({ error: 'Name is required' });
  if (!phone && !email) return res.status(400).json({ error: 'Phone or email required so we can contact you' });

  const subjects = Array.isArray(b.subjects)
    ? b.subjects.map(s => clean(s, 80)).filter(Boolean).slice(0, 12)
    : (typeof b.subjects === 'string' ? b.subjects.split(',').map(s => s.trim()).filter(Boolean).slice(0, 12) : []);

  const row = {
    type:        ['student','tutor'].includes(b.type) ? b.type : 'student',
    full_name,
    phone, email,
    city:        clean(b.city, 80),
    grade_level: clean(b.grade_level, 40),
    subjects,
    message:     clean(b.message, 2000),
    source:      clean(b.source, 80) || 'landing',
    status: 'new'
  };

  const { data, error } = await supabaseAdmin
    .from('public_enquiries').insert(row).select().single();
  if (error) {
    if (/does not exist|schema cache/i.test(error.message))
      return res.status(412).json({ error: 'Enquiry table missing — contact admin.' });
    return res.status(400).json({ error: error.message });
  }
  res.json({ ok: true, id: data.id });
});

module.exports = router;
