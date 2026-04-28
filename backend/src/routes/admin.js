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
  const { email, password, full_name, role = 'student', phone, city } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  if (!['student', 'tutor'].includes(role)) return res.status(400).json({ error: 'role must be student or tutor' });

  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { full_name, role, phone, city }
  });
  if (createErr) return res.status(400).json({ error: createErr.message });

  // Mirror into public.users (handle both schemas where trigger may or may not exist)
  await supabaseAdmin.from('users').upsert({
    id: created.user.id, email, full_name: full_name || null, role,
    phone: phone || null, city: city || null, is_active: true
  }, { onConflict: 'id' });

  res.json({ user: created.user });
});

// All booking enquiries / requests across the platform
router.get('/requests', async (req, res) => {
  const status = req.query.status;
  let q = supabaseAdmin
    .from('requests')
    .select('*, student:student_id(id, email, full_name, phone, city), tutor:tutor_id(id, email, full_name)')
    .order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) return res.status(400).json({ error: error.message });
  res.json({ requests: data });
});

// Leads: users who signed up but never booked anything (helps admin follow up)
router.get('/leads', async (_req, res) => {
  const { data: users, error: ue } = await supabaseAdmin
    .from('users').select('*').eq('role', 'student').order('created_at', { ascending: false });
  if (ue) return res.status(400).json({ error: ue.message });
  const { data: reqs, error: re } = await supabaseAdmin.from('requests').select('student_id');
  if (re) return res.status(400).json({ error: re.message });
  const booked = new Set((reqs || []).map(r => r.student_id));
  const leads = (users || []).filter(u => !booked.has(u.id));
  res.json({ leads });
});

module.exports = router;
