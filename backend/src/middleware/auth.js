const { supabaseAdmin, userClient } = require('../config/supabase');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing bearer token' });

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: 'Invalid token' });

    const { data: profile, error: pErr } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, role, is_active')
      .eq('id', data.user.id)
      .single();
    if (pErr || !profile) return res.status(401).json({ error: 'User profile missing' });
    if (!profile.is_active) return res.status(403).json({ error: 'Account disabled' });

    req.user = profile;
    req.accessToken = token;
    req.db = userClient(token); // RLS-respecting client
    next();
  } catch (err) {
    console.error('auth error', err);
    res.status(500).json({ error: 'Auth middleware failure' });
  }
}

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  if (!roles.includes(req.user.role))
    return res.status(403).json({ error: 'Forbidden — role required: ' + roles.join('/') });
  next();
};

module.exports = { requireAuth, requireRole };
