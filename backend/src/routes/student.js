const router = require('express').Router();
const { supabaseAdmin } = require('../config/supabase');
const { requireAuth, requireRole } = require('../middleware/auth');

// Update student profile + saved location
router.put('/profile', requireAuth, requireRole('student'), async (req, res) => {
  const { grade_level, preferred_subjects = [], zip_code, city, latitude, longitude } = req.body;
  const payload = { user_id: req.user.id, grade_level, preferred_subjects, zip_code, city };
  if (latitude != null && longitude != null) {
    payload.location = `SRID=4326;POINT(${Number(longitude)} ${Number(latitude)})`;
  }
  const { data, error } = await supabaseAdmin
    .from('student_profiles').upsert(payload, { onConflict: 'user_id' }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ profile: data });
});

// Search nearby tutors via PostGIS RPC
router.get('/search', requireAuth, requireRole('student'), async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radius = Math.min(Number(req.query.radius_km) || 10, 100);
  const subject = req.query.subject || null;

  if (!isFinite(lat) || !isFinite(lng))
    return res.status(400).json({ error: 'lat & lng query params required' });

  const { data, error } = await supabaseAdmin.rpc('search_nearby_tutors', {
    in_lat: lat, in_lng: lng, in_radius_km: radius, in_subject: subject
  });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ tutors: data });
});

// Create a session request
router.post('/requests', requireAuth, requireRole('student'), async (req, res) => {
  const { tutor_id, subject, message, preferred_date, duration_minutes = 60 } = req.body;
  if (!tutor_id || !subject) return res.status(400).json({ error: 'tutor_id and subject required' });

  const { data, error } = await supabaseAdmin
    .from('requests')
    .insert({
      student_id: req.user.id, tutor_id, subject, message,
      preferred_date, duration_minutes, status: 'pending'
    })
    .select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ request: data });
});

// List my requests
router.get('/requests', requireAuth, requireRole('student'), async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('requests')
    .select('*, tutor:tutor_id(id, full_name, email)')
    .eq('student_id', req.user.id)
    .order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ requests: data });
});

// Cancel my request
router.patch('/requests/:id/cancel', requireAuth, requireRole('student'), async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('requests').update({ status: 'cancelled' })
    .eq('id', req.params.id).eq('student_id', req.user.id)
    .select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ request: data });
});

// Leave a review for a completed session
router.post('/reviews', requireAuth, requireRole('student'), async (req, res) => {
  const { request_id, rating, comment } = req.body;
  if (!request_id || !rating) return res.status(400).json({ error: 'request_id and rating required' });

  const { data: reqRow, error: rErr } = await supabaseAdmin
    .from('requests').select('id, tutor_id, status, student_id')
    .eq('id', request_id).single();
  if (rErr || !reqRow) return res.status(404).json({ error: 'Request not found' });
  if (reqRow.student_id !== req.user.id) return res.status(403).json({ error: 'Not your request' });
  if (reqRow.status !== 'completed') return res.status(400).json({ error: 'Session not completed' });

  const { data, error } = await supabaseAdmin
    .from('reviews').insert({
      request_id, student_id: req.user.id, tutor_id: reqRow.tutor_id, rating, comment
    }).select().single();
  if (error) return res.status(400).json({ error: error.message });

  // recompute tutor rating
  const { data: agg } = await supabaseAdmin
    .from('reviews').select('rating').eq('tutor_id', reqRow.tutor_id);
  if (agg?.length) {
    const avg = agg.reduce((s, r) => s + r.rating, 0) / agg.length;
    await supabaseAdmin.from('tutor_profiles')
      .update({ rating: avg.toFixed(2), total_reviews: agg.length })
      .eq('user_id', reqRow.tutor_id);
  }
  res.json({ review: data });
});

module.exports = router;
