-- ============================================================
--  TUTORLINK — site_content table
--  Stores admin-editable JSON content for the public landing page.
--  Run ONCE in the Supabase SQL editor (or `psql -f`).
-- ============================================================

create table if not exists public.site_content (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Anyone can read landing content; only authenticated admins can write.
alter table public.site_content enable row level security;

drop policy if exists site_content_read on public.site_content;
create policy site_content_read on public.site_content
  for select using (true);

drop policy if exists site_content_write on public.site_content;
create policy site_content_write on public.site_content
  for all using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  ) with check (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

-- Seed an empty landing row so the API has something to read
insert into public.site_content (id, data) values ('landing', '{}'::jsonb)
on conflict (id) do nothing;
