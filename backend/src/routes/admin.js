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

module.exports = router;
