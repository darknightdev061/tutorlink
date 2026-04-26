const router = require('express').Router();
const { supabaseAdmin } = require('../config/supabase');
const { requireAuth, requireRole } = require('../middleware/auth');

// Submit / update tutor application
router.post('/apply', requireAuth, requireRole('tutor'), async (req, res) => {
  const {
    subjects = [], qualifications, bio, hourly_rate = 0,
    experience_years = 0, languages = [], service_radius_km = 10,
    zip_code, city, latitude, longitude
  } = req.body;

  if (!subjects.length) return res.status(400).json({ error: 'At least one subject required' });
  if (latitude == null || longitude == null)
    return res.status(400).json({ error: 'Location (latitude, longitude) required' });

  const location = `SRID=4326;POINT(${Number(longitude)} ${Number(latitude)})`;

  const { data, error } = await supabaseAdmin
    .from('tutor_profiles')
    .upsert({
      user_id: req.user.id,
      subjects, qualifications, bio,
      hourly_rate, experience_years, languages,
      service_radius_km, zip_code, city, location,
      approval_status: 'pending'
    }, { onConflict: 'user_id' })
    .select().single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ profile: data });
});

// Tutor: my profile + status
router.get('/me', requireAuth, requireRole('tutor'), async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('tutor_profiles').select('*').eq('user_id', req.user.id).maybeSingle();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ profile: data });
});

// Tutor: list incoming requests
router.get('/requests', requireAuth, requireRole('tutor'), async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('requests')
    .select('*, student:student_id(id, full_name, email)')
    .eq('tutor_id', req.user.id)
    .order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ requests: data });
});

// Tutor: accept / decline a request
router.patch('/requests/:id', requireAuth, requireRole('tutor'), async (req, res) => {
  const { status } = req.body;
  if (!['accepted', 'declined', 'completed'].includes(status))
    return res.status(400).json({ error: 'Invalid status' });

  const { data, error } = await supabaseAdmin
    .from('requests').update({ status })
    .eq('id', req.params.id).eq('tutor_id', req.user.id)
    .select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ request: data });
});

module.exports = router;
