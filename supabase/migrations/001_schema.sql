-- AgriTrace schema (PRD section 7)

create extension if not exists "pgcrypto";

create table if not exists public.farmers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.farms (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references public.farmers (id) on delete cascade,
  farm_name text not null,
  village text,
  district text,
  state text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now()
);

create index if not exists farms_farmer_id_idx on public.farms (farmer_id);

create table if not exists public.batches (
  id uuid primary key default gen_random_uuid(),
  batch_code text not null unique,
  farm_id uuid not null references public.farms (id) on delete cascade,
  crop_name text not null,
  variety text,
  sowing_date date not null,
  expected_harvest_date date,
  harvest_date date,
  quantity numeric not null check (quantity > 0),
  unit text not null,
  status text not null default 'Growing',
  created_at timestamptz not null default now(),
  constraint batches_harvest_after_sowing check (
    harvest_date is null or harvest_date >= sowing_date
  ),
  constraint batches_expected_after_sowing check (
    expected_harvest_date is null or expected_harvest_date >= sowing_date
  )
);

create index if not exists batches_farm_id_idx on public.batches (farm_id);
create index if not exists batches_batch_code_idx on public.batches (batch_code);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.batches (id) on delete cascade,
  activity_type text not null,
  description text,
  activity_date date not null,
  latitude double precision,
  longitude double precision,
  photo_url text,
  created_at timestamptz not null default now()
);

create index if not exists activities_batch_id_idx on public.activities (batch_id);

create table if not exists public.verifications (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.batches (id) on delete cascade,
  verified_by text,
  organization text,
  status text not null default 'UNVERIFIED'
    check (status in ('UNVERIFIED', 'PENDING', 'VERIFIED')),
  remarks text,
  verified_at timestamptz
);

create index if not exists verifications_batch_id_idx on public.verifications (batch_id);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.batches (id) on delete cascade,
  action text not null,
  field_name text,
  old_value text,
  new_value text,
  edited_by text,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_batch_id_idx on public.audit_logs (batch_id);

-- MVP: permissive policies (expand auth/RLS in production)
alter table public.farmers enable row level security;
alter table public.farms enable row level security;
alter table public.batches enable row level security;
alter table public.activities enable row level security;
alter table public.verifications enable row level security;
alter table public.audit_logs enable row level security;

create policy "farmers_anon_all" on public.farmers for all using (true) with check (true);
create policy "farms_anon_all" on public.farms for all using (true) with check (true);
create policy "batches_anon_all" on public.batches for all using (true) with check (true);
create policy "activities_anon_all" on public.activities for all using (true) with check (true);
create policy "verifications_anon_all" on public.verifications for all using (true) with check (true);
create policy "audit_logs_anon_all" on public.audit_logs for all using (true) with check (true);

-- Storage bucket for activity photos (run in Supabase dashboard or via API)
insert into storage.buckets (id, name, public)
values ('activity-photos', 'activity-photos', true)
on conflict (id) do nothing;

create policy "activity_photos_public_read"
on storage.objects for select
using (bucket_id = 'activity-photos');

create policy "activity_photos_anon_upload"
on storage.objects for insert
with check (bucket_id = 'activity-photos');

create policy "activity_photos_anon_update"
on storage.objects for update
using (bucket_id = 'activity-photos');
