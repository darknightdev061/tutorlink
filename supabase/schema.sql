-- ============================================================
--  TUTORLINK — Supabase / PostgreSQL schema
--  Includes: enums, tables, PostGIS, RLS, RPC, triggers
-- ============================================================

-- 1. EXTENSIONS ------------------------------------------------
create extension if not exists postgis;
create extension if not exists "uuid-ossp";

-- 2. ENUMS -----------------------------------------------------
do $$ begin
  create type user_role as enum ('admin', 'tutor', 'student');
exception when duplicate_object then null; end $$;

do $$ begin
  create type approval_status as enum ('pending', 'approved', 'rejected', 'suspended');
exception when duplicate_object then null; end $$;

do $$ begin
  create type request_status as enum ('pending', 'accepted', 'declined', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

-- 3. CORE TABLES ----------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  role user_role not null default 'student',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.tutor_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  subjects text[] not null default '{}',
  qualifications text,
  bio text,
  hourly_rate numeric(10,2) default 0,
  experience_years int default 0,
  languages text[] default '{}',
  service_radius_km int not null default 10,
  zip_code text,
  city text,
  location geography(Point, 4326),                 -- PostGIS point
  approval_status approval_status not null default 'pending',
  rejection_reason text,
  rating numeric(3,2) default 0,
  total_reviews int default 0,
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists tutor_profiles_location_gix
  on public.tutor_profiles using gist (location);
create index if not exists tutor_profiles_status_idx
  on public.tutor_profiles (approval_status);

create table if not exists public.student_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  grade_level text,
  preferred_subjects text[] default '{}',
  zip_code text,
  city text,
  location geography(Point, 4326),
  created_at timestamptz not null default now()
);

create table if not exists public.requests (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.users(id) on delete cascade,
  tutor_id  uuid not null references public.users(id) on delete cascade,
  subject text not null,
  message text,
  preferred_date timestamptz,
  duration_minutes int default 60,
  status request_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists requests_student_idx on public.requests(student_id);
create index if not exists requests_tutor_idx   on public.requests(tutor_id);
create index if not exists requests_status_idx  on public.requests(status);

create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  request_id uuid not null references public.requests(id) on delete cascade,
  student_id uuid not null references public.users(id) on delete cascade,
  tutor_id   uuid not null references public.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique(request_id)
);

-- 4. TRIGGERS --------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'student')
  );
  if (coalesce(new.raw_user_meta_data->>'role','student') = 'student') then
    insert into public.student_profiles (user_id) values (new.id);
  end if;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists requests_touch on public.requests;
create trigger requests_touch before update on public.requests
  for each row execute function public.touch_updated_at();

-- 5. RPC: nearby tutors ---------------------------------------
create or replace function public.search_nearby_tutors(
  in_lat double precision,
  in_lng double precision,
  in_radius_km int default 10,
  in_subject text default null
)
returns table (
  user_id uuid,
  full_name text,
  subjects text[],
  bio text,
  hourly_rate numeric,
  rating numeric,
  total_reviews int,
  city text,
  distance_km double precision
)
language sql stable security definer set search_path = public as $$
  select
    tp.user_id,
    u.full_name,
    tp.subjects,
    tp.bio,
    tp.hourly_rate,
    tp.rating,
    tp.total_reviews,
    tp.city,
    st_distance(tp.location, st_setsrid(st_makepoint(in_lng, in_lat), 4326)::geography) / 1000.0 as distance_km
  from public.tutor_profiles tp
  join public.users u on u.id = tp.user_id
  where tp.approval_status = 'approved'
    and u.is_active = true
    and tp.location is not null
    and st_dwithin(
      tp.location,
      st_setsrid(st_makepoint(in_lng, in_lat), 4326)::geography,
      in_radius_km * 1000
    )
    and (in_subject is null or in_subject = any(tp.subjects))
  order by distance_km asc;
$$;

-- 6. RLS -------------------------------------------------------
alter table public.users           enable row level security;
alter table public.tutor_profiles  enable row level security;
alter table public.student_profiles enable row level security;
alter table public.requests        enable row level security;
alter table public.reviews         enable row level security;

-- helper: am I admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.users where id = auth.uid() and role = 'admin');
$$;

-- USERS table
drop policy if exists users_self_select on public.users;
create policy users_self_select on public.users
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists users_self_update on public.users;
create policy users_self_update on public.users
  for update using (auth.uid() = id or public.is_admin());

drop policy if exists users_admin_all on public.users;
create policy users_admin_all on public.users
  for all using (public.is_admin()) with check (public.is_admin());

-- TUTOR_PROFILES
drop policy if exists tp_public_read_approved on public.tutor_profiles;
create policy tp_public_read_approved on public.tutor_profiles
  for select using (approval_status = 'approved' or auth.uid() = user_id or public.is_admin());

drop policy if exists tp_self_insert on public.tutor_profiles;
create policy tp_self_insert on public.tutor_profiles
  for insert with check (auth.uid() = user_id);

drop policy if exists tp_self_update on public.tutor_profiles;
create policy tp_self_update on public.tutor_profiles
  for update using (auth.uid() = user_id or public.is_admin());

drop policy if exists tp_admin_delete on public.tutor_profiles;
create policy tp_admin_delete on public.tutor_profiles
  for delete using (public.is_admin());

-- STUDENT_PROFILES
drop policy if exists sp_self on public.student_profiles;
create policy sp_self on public.student_profiles
  for all using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- REQUESTS
drop policy if exists req_participants_read on public.requests;
create policy req_participants_read on public.requests
  for select using (auth.uid() in (student_id, tutor_id) or public.is_admin());

drop policy if exists req_student_create on public.requests;
create policy req_student_create on public.requests
  for insert with check (auth.uid() = student_id);

drop policy if exists req_participants_update on public.requests;
create policy req_participants_update on public.requests
  for update using (auth.uid() in (student_id, tutor_id) or public.is_admin());

-- REVIEWS
drop policy if exists rv_read_all on public.reviews;
create policy rv_read_all on public.reviews for select using (true);

drop policy if exists rv_student_create on public.reviews;
create policy rv_student_create on public.reviews
  for insert with check (auth.uid() = student_id);

-- 7. helper view for admin dashboard ---------------------------
create or replace view public.admin_stats as
select
  (select count(*) from public.users where role='student') as total_students,
  (select count(*) from public.users where role='tutor')   as total_tutors,
  (select count(*) from public.tutor_profiles where approval_status='pending')  as pending_tutors,
  (select count(*) from public.tutor_profiles where approval_status='approved') as approved_tutors,
  (select count(*) from public.requests) as total_requests,
  (select count(*) from public.requests where status='pending') as pending_requests;
