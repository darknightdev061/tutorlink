// End-to-end smoke test:
//  1. Sign up a fresh student via Supabase Auth
//  2. Hit GET /api/auth/me with that JWT to prove the API + RLS pipeline works
//  3. Hit GET /api/student/search to prove the PostGIS RPC route works
const { createClient } = require('@supabase/supabase-js');

const URL  = 'https://qdaccndowszbytbwkybs.supabase.co';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkYWNjbmRvd3N6Ynl0YndreWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMDkxNjIsImV4cCI6MjA5Mjc4NTE2Mn0.kA89zYlOAa_SunYIeN_2akFTHZGLJeV1Vur-Upu0jlc';
const API  = 'http://localhost:5000';

(async () => {
  const sb = createClient(URL, ANON);
  const email = `smoke-${Date.now()}@test.dev`;
  const password = 'TestPass123!';

  console.log('1. Signing up', email);
  const { data: signup, error: e1 } = await sb.auth.signUp({
    email, password, options: { data: { full_name: 'Smoke Test', role: 'student' } }
  });
  if (e1) { console.error('signup failed:', e1.message); process.exit(1); }
  let token = signup.session?.access_token;
  if (!token) {
    const { data: si, error: e2 } = await sb.auth.signInWithPassword({ email, password });
    if (e2) { console.error('signin failed:', e2.message); process.exit(1); }
    token = si.session.access_token;
  }
  console.log('   ✓ token acquired');

  console.log('2. GET /api/auth/me');
  const me = await fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
  const meJson = await me.json();
  console.log('   status:', me.status, 'role:', meJson.user?.role, 'email:', meJson.user?.email);

  console.log('3. GET /api/student/search?lat=40.71&lng=-74.00&radius_km=25');
  const sr = await fetch(`${API}/api/student/search?lat=40.71&lng=-74.00&radius_km=25`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const srJson = await sr.json();
  console.log('   status:', sr.status, 'tutors found:', srJson.tutors?.length ?? 'error', srJson.error || '');

  console.log('\n✅ Smoke test complete. user_id =', signup.user?.id);
})().catch(e => { console.error(e); process.exit(1); });
