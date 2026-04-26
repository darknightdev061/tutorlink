const router = require('express').Router();
const { supabaseAdmin } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');

// Returns the current user's profile + role-specific extension
router.get('/me', requireAuth, async (req, res) => {
  const { user } = req;
  let extra = null;
  if (user.role === 'tutor') {
    const { data } = await supabaseAdmin
      .from('tutor_profiles').select('*').eq('user_id', user.id).maybeSingle();
    extra = data;
  } else if (user.role === 'student') {
    const { data } = await supabaseAdmin
      .from('student_profiles').select('*').eq('user_id', user.id).maybeSingle();
    extra = data;
  }
  res.json({ user, profile: extra });
});

module.exports = router;
