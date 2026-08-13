-- Run this entire file in the Supabase SQL editor.
-- supabase.com → your project → SQL Editor → New query → paste → Run

-- ── Tables ────────────────────────────────────────────────────

create table if not exists couples (
  id           uuid primary key default gen_random_uuid(),
  invite_code  text unique not null,
  start_date   date,
  next_visit   date,
  created_at   timestamptz default now()
);

create table if not exists couple_members (
  id                uuid primary key default gen_random_uuid(),
  couple_id         uuid references couples(id) on delete cascade,
  name              text not null,
  slot              text check (slot in ('A','B')) not null,
  push_subscription jsonb,
  created_at        timestamptz default now(),
  unique(couple_id, slot)
);

create table if not exists daily_answers (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid references couples(id) on delete cascade,
  slot       text not null,
  date       date not null,
  answer     text not null,
  created_at timestamptz default now(),
  unique(couple_id, slot, date)
);

create table if not exists faith_reflections (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid references couples(id) on delete cascade,
  slot       text not null,
  topic_id   text not null,
  reflection text not null,
  created_at timestamptz default now(),
  unique(couple_id, slot, topic_id)
);

create table if not exists photos (
  id           uuid primary key default gen_random_uuid(),
  couple_id    uuid references couples(id) on delete cascade,
  slot         text not null,
  storage_path text not null,
  caption      text default '',
  taken_at     timestamptz default now()
);

create table if not exists calendar_events (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid references couples(id) on delete cascade,
  title      text not null,
  date       date not null,
  type       text default 'other' check (type in ('visit','milestone','other')),
  notes      text default '',
  created_at timestamptz default now()
);

-- ── Storage bucket for photos ─────────────────────────────────
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do update set public = true;

-- ── Realtime ──────────────────────────────────────────────────
alter publication supabase_realtime add table daily_answers;
alter publication supabase_realtime add table faith_reflections;
alter publication supabase_realtime add table couple_members;
alter publication supabase_realtime add table photos;
alter publication supabase_realtime add table calendar_events;

-- ── RLS (Row Level Security) ──────────────────────────────────
-- All writes go through server API routes using the service role key.
-- Reads use the anon key — the couple_id UUID acts as the "secret".

alter table couples           enable row level security;
alter table couple_members    enable row level security;
alter table daily_answers     enable row level security;
alter table faith_reflections enable row level security;
alter table photos            enable row level security;
alter table calendar_events   enable row level security;

create policy "anon_read_couples"     on couples           for select using (true);
create policy "anon_read_members"     on couple_members    for select using (true);
create policy "anon_read_answers"     on daily_answers     for select using (true);
create policy "anon_read_faith"       on faith_reflections for select using (true);
create policy "anon_read_photos"      on photos            for select using (true);
create policy "anon_read_events"      on calendar_events   for select using (true);

-- Storage: make photos publicly accessible via signed URLs
create policy "public_photos"
  on storage.objects for select
  using (bucket_id = 'photos');

create policy "service_upload_photos"
  on storage.objects for insert
  using (bucket_id = 'photos');

create policy "service_delete_photos"
  on storage.objects for delete
  using (bucket_id = 'photos');
