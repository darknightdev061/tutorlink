import { supabase } from './supabase';

const BASE = import.meta.env.VITE_API_URL || '';

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
