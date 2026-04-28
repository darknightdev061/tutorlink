const router = require('express').Router();
const { supabaseAdmin } = require('../config/supabase');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth, requireRole('admin'));

router.get('/stats', async (_req, res) => {
  const { data, error } = await supabaseAdmin.from('admin_stats').select('*').single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ stats: data });
});

router.get('/tutors', async (req, res) => {
  const status = req.query.status;
  let q = supabaseAdmin
    .from('tutor_profiles')
    .select('*, user:user_id(id, email, full_name, is_active, created_at)')
    .order('created_at', { ascending: false });
  if (status) q = q.eq('approval_status', status);
  const { data, error } = await q;
  if (error) return res.status(400).json({ error: error.message });
  res.json({ tutors: data });
});

router.patch('/tutors/:id/approval', async (req, res) => {
  const { status, reason } = req.body;
  if (!['approved', 'rejected', 'pending', 'suspended'].includes(status))
    return res.status(400).json({ error: 'Invalid status' });
  const update = { approval_status: status, rejection_reason: reason || null };
  if (status === 'approved') update.approved_at = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from('tutor_profiles').update(update).eq('user_id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ profile: data });
});

router.get('/users', async (req, res) => {
  const role = req.query.role;
  let q = supabaseAdmin.from('users').select('*').order('created_at', { ascending: false });
  if (role) q = q.eq('role', role);
  const { data, error } = await q;
  if (error) return res.status(400).json({ error: error.message });
  res.json({ users: data });
});

router.patch('/users/:id/active', async (req, res) => {
  const { is_active } = req.body;
  const { data, error } = await supabaseAdmin
    .from('users').update({ is_active: !!is_active }).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ user: data });
});

router.delete('/users/:id', async (req, res) => {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true });
});

// Admin-driven user registration (e.g. register a student on the family's behalf)
router.post('/users/register', async (req, res) => {
  const { email, password, full_name, role = 'student', phone, city, grade_level, preferred_subjects } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  if (!['student', 'tutor'].includes(role)) return res.status(400).json({ error: 'role must be student or tutor' });

  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { full_name, role, phone }
  });
  if (createErr) return res.status(400).json({ error: createErr.message });

  // public.users only has id, email, full_name, role, is_active, created_at
  await supabaseAdmin.from('users').upsert({
    id: created.user.id, email, full_name: full_name || null, role, is_active: true
  }, { onConflict: 'id' });

  // Phone/city/grade live on the role-specific profile table
  if (role === 'student') {
    await supabaseAdmin.from('student_profiles').upsert({
      user_id: created.user.id, grade_level: grade_level || null,
      preferred_subjects: preferred_subjects || [], city: city || null
    }, { onConflict: 'user_id' });
  }

  res.json({ user: created.user });
});

// Admin: read/write site content (landing JSON)
router.get('/site/content/:id', async (req, res) => {
  const id = req.params.id || 'landing';
  const { data, error } = await supabaseAdmin
    .from('site_content').select('data, updated_at').eq('id', id).maybeSingle();
  if (error) {
    if (/does not exist|schema cache/i.test(error.message)) return res.json({ data: {}, missing_table: true });
    return res.status(400).json({ error: error.message });
  }
  res.json({ data: data?.data || {}, updated_at: data?.updated_at });
});

router.patch('/site/content/:id', async (req, res) => {
  const id = req.params.id || 'landing';
  const { data: incoming } = req.body || {};
  if (!incoming || typeof incoming !== 'object') return res.status(400).json({ error: 'data object required' });
  const { data, error } = await supabaseAdmin
    .from('site_content').upsert({ id, data: incoming, updated_at: new Date().toISOString() }, { onConflict: 'id' })
    .select().single();
  if (error) {
    if (/does not exist|schema cache/i.test(error.message)) {
      return res.status(412).json({ error: 'site_content table missing — run supabase/site_content.sql in the Supabase SQL editor.' });
    }
    return res.status(400).json({ error: error.message });
  }
  res.json({ data: data.data, updated_at: data.updated_at });
});

// All booking enquiries / requests across the platform
router.get('/requests', async (req, res) => {
  const status = req.query.status;
  let q = supabaseAdmin
    .from('requests')
    .select('*, student:student_id(id, email, full_name), tutor:tutor_id(id, email, full_name)')
    .order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) return res.status(400).json({ error: error.message });

  // Enrich with student city (from student_profiles) so admin can route follow-up by location
  if (data?.length) {
    const ids = [...new Set(data.map(r => r.student_id))];
    const { data: profs } = await supabaseAdmin
      .from('student_profiles').select('user_id, city, grade_level').in('user_id', ids);
    const byId = Object.fromEntries((profs || []).map(p => [p.user_id, p]));
    data.forEach(r => {
      if (r.student) {
        r.student.city = byId[r.student_id]?.city || null;
        r.student.grade_level = byId[r.student_id]?.grade_level || null;
      }
    });
  }
  res.json({ requests: data });
});

// Leads: students who signed up but never booked anything (helps admin follow up)
router.get('/leads', async (_req, res) => {
  const { data: users, error: ue } = await supabaseAdmin
    .from('users').select('*').eq('role', 'student').order('created_at', { ascending: false });
  if (ue) return res.status(400).json({ error: ue.message });
  const { data: reqs, error: re } = await supabaseAdmin.from('requests').select('student_id');
  if (re) return res.status(400).json({ error: re.message });
  const booked = new Set((reqs || []).map(r => r.student_id));
  const leads = (users || []).filter(u => !booked.has(u.id));

  if (leads.length) {
    const { data: profs } = await supabaseAdmin
      .from('student_profiles').select('user_id, city, grade_level, preferred_subjects')
      .in('user_id', leads.map(l => l.id));
    const byId = Object.fromEntries((profs || []).map(p => [p.user_id, p]));
    leads.forEach(l => {
      l.city = byId[l.id]?.city || null;
      l.grade_level = byId[l.id]?.grade_level || null;
      l.preferred_subjects = byId[l.id]?.preferred_subjects || [];
    });
  }

  res.json({ leads });
});

module.exports = router;
