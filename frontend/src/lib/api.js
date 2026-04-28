import { supabase } from './supabase';

// Resolve API base. If the env var points at localhost but we're running on a
// deployed origin, ignore it and use relative paths (Vercel routes /api/* to
// the backend function automatically).
function resolveBase() {
  const env = import.meta.env.VITE_API_URL || '';
  if (typeof window !== 'undefined') {
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)/i.test(env);
    const onLocalhost = /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
    if (isLocalhost && !onLocalhost) return '';
  }
  return env;
}
const BASE = resolveBase();

async function request(path, opts = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
    ...(session ? { Authorization: `Bearer ${session.access_token}` } : {})
  };
  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`);
  return json;
}

export const api = {
  get:    (p)        => request(p),
  post:   (p, body)  => request(p, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (p, body)  => request(p, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  (p, body)  => request(p, { method: 'PATCH',  body: JSON.stringify(body) }),
  del:    (p)        => request(p, { method: 'DELETE' })
};
