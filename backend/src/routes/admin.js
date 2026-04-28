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
  const { data: users, error } = await q;
  if (error) return res.status(400).json({ error: error.message });
  if (!users?.length) return res.json({ users: [] });

  // Batch-fetch role-specific profile data so the admin can see roll, class,
  // subjects, guardian info etc in the same row.
  const studentIds = users.filter(u => u.role === 'student').map(u => u.id);
  const tutorIds   = users.filter(u => u.role === 'tutor').map(u => u.id);

  const [studentProfsRes, tutorProfsRes] = await Promise.all([
    studentIds.length
      ? supabaseAdmin.from('student_profiles')
          .select('user_id, roll_number, grade_level, preferred_subjects, city, zip_code, state, address_line1, address_line2, guardian_name, guardian_relation, guardian_phone, guardian_email, alternate_phone')
          .in('user_id', studentIds)
      : Promise.resolve({ data: [] }),
    tutorIds.length
      ? supabaseAdmin.from('tutor_profiles')
          .select('user_id, subjects, qualifications, bio, hourly_rate, experience_years, city, languages, approval_status, rating, total_reviews')
          .in('user_id', tutorIds)
      : Promise.resolve({ data: [] })
  ]);
  const sp = Object.fromEntries((studentProfsRes.data || []).map(p => [p.user_id, p]));
  const tp = Object.fromEntries((tutorProfsRes.data || []).map(p => [p.user_id, p]));
  users.forEach(u => {
    if (u.role === 'student') u.student = sp[u.id] || null;
    if (u.role === 'tutor')   u.tutor   = tp[u.id] || null;
  });
  res.json({ users });
});

router.patch('/users/:id/active', async (req, res) => {
  const { is_active } = req.body;
  const { data, error } = await supabaseAdmin
    .from('users').update({ is_active: !!is_active }).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ user: data });
});

// Generic edit — admin can update name, email and (for students) every profile
// field EXCEPT roll_number (which is set at registration and immutable).
router.patch('/users/:id', async (req, res) => {
  const id = req.params.id;
  const b = req.body || {};

  // 1. Look up role so we know which profile table to touch
  const { data: u, error: ue } = await supabaseAdmin
    .from('users').select('id, role').eq('id', id).maybeSingle();
  if (ue) return res.status(400).json({ error: ue.message });
  if (!u) return res.status(404).json({ error: 'User not found' });

  // 2. Update users table (full_name + email if provided)
  const userPatch = {};
  if (typeof b.full_name === 'string') userPatch.full_name = b.full_name;
  if (typeof b.email === 'string')     userPatch.email     = b.email;
  if (Object.keys(userPatch).length) {
    const { error } = await supabaseAdmin.from('users').update(userPatch).eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    if (b.email) {
      // Keep auth.users in sync so login still works
      await supabaseAdmin.auth.admin.updateUserById(id, { email: b.email, email_confirm: true }).catch(() => {});
    }
  }

  // 3. Update role-specific profile (skip roll_number — read-only)
  if (u.role === 'student') {
    const studentFields = [
      'grade_level', 'preferred_subjects',
      'address_line1', 'address_line2', 'city', 'state', 'zip_code',
      'guardian_name', 'guardian_relation', 'guardian_phone', 'guardian_email', 'alternate_phone'
    ];
    const sp = { user_id: id };
    let hasField = false;
    for (const f of studentFields) {
      if (Object.prototype.hasOwnProperty.call(b, f)) { sp[f] = b[f]; hasField = true; }
    }
    if (hasField) {
      const { error } = await supabaseAdmin.from('student_profiles').upsert(sp, { onConflict: 'user_id' });
      if (error) return res.status(400).json({ error: error.message });
    }
  }
  if (u.role === 'tutor') {
    const tutorFields = ['subjects', 'qualifications', 'bio', 'hourly_rate', 'experience_years', 'languages', 'service_radius_km', 'city', 'zip_code'];
    const tp = { user_id: id };
    let hasField = false;
    for (const f of tutorFields) {
      if (Object.prototype.hasOwnProperty.call(b, f)) { tp[f] = b[f]; hasField = true; }
    }
    if (hasField) {
      const { error } = await supabaseAdmin.from('tutor_profiles').upsert(tp, { onConflict: 'user_id' });
      if (error) return res.status(400).json({ error: error.message });
    }
  }

  res.json({ ok: true });
});

router.delete('/users/:id', async (req, res) => {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true });
});

// Admin-driven user registration (e.g. register a student on the family's behalf)
router.post('/users/register', async (req, res) => {
  const {
    email, password, full_name, role = 'student',
    phone, city, zip_code, state, address_line1, address_line2,
    grade_level, preferred_subjects, roll_number,
    guardian_name, guardian_relation, guardian_phone, guardian_email, alternate_phone
  } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  if (!['student', 'tutor'].includes(role)) return res.status(400).json({ error: 'role must be student or tutor' });

  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { full_name, role, phone }
  });
  if (createErr) return res.status(400).json({ error: createErr.message });

  await supabaseAdmin.from('users').upsert({
    id: created.user.id, email, full_name: full_name || null, role, is_active: true
  }, { onConflict: 'id' });

  if (role === 'student') {
    // Auto-generate a TL-XXXX roll number if admin didn't specify one
    let roll = roll_number;
    if (!roll) {
      const { data: max } = await supabaseAdmin
        .from('student_profiles').select('roll_number')
        .not('roll_number', 'is', null);
      const n = (max || []).reduce((m, r) => {
        const v = parseInt((r.roll_number || '').replace(/\D/g, ''), 10);
        return isFinite(v) && v > m ? v : m;
      }, 0);
      roll = 'TL-' + String(n + 1).padStart(4, '0');
    }
    await supabaseAdmin.from('student_profiles').upsert({
      user_id: created.user.id,
      roll_number: roll,
      grade_level: grade_level || null,
      preferred_subjects: preferred_subjects || [],
      address_line1: address_line1 || null,
      address_line2: address_line2 || null,
      city: city || null,
      state: state || null,
      zip_code: zip_code || null,
      guardian_name: guardian_name || null,
      guardian_relation: guardian_relation || null,
      guardian_phone: guardian_phone || null,
      guardian_email: guardian_email || null,
      alternate_phone: alternate_phone || null
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

// Admin can update or delete any booking (request) — used by Bookings tab
router.patch('/requests/:id', async (req, res) => {
  const allowed = ['pending', 'accepted', 'declined', 'completed', 'cancelled'];
  const { status } = req.body || {};
  if (!allowed.includes(status)) return res.status(400).json({ error: `status must be one of ${allowed.join(', ')}` });
  const { data, error } = await supabaseAdmin
    .from('requests').update({ status, updated_at: new Date().toISOString() })
    .eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ request: data });
});

router.delete('/requests/:id', async (req, res) => {
  const { error } = await supabaseAdmin.from('requests').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true });
});

// Public enquiries collected from the landing page (no-login contact form)
router.get('/public-enquiries', async (req, res) => {
  const status = req.query.status;
  let q = supabaseAdmin.from('public_enquiries').select('*').order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) {
    if (/does not exist|schema cache/i.test(error.message)) return res.json({ enquiries: [] });
    return res.status(400).json({ error: error.message });
  }
  res.json({ enquiries: data });
});

router.patch('/public-enquiries/:id', async (req, res) => {
  const allowed = ['new', 'contacted', 'converted', 'junk'];
  const { status } = req.body || {};
  if (!allowed.includes(status)) return res.status(400).json({ error: `status must be one of ${allowed.join(', ')}` });
  const { data, error } = await supabaseAdmin
    .from('public_enquiries').update({ status, updated_at: new Date().toISOString() })
    .eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ enquiry: data });
});

router.delete('/public-enquiries/:id', async (req, res) => {
  const { error } = await supabaseAdmin.from('public_enquiries').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true });
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
