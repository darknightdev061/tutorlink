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

module.exports = router;
