-- ═══ SALESPARK SUPABASE SCHEMA ═══
-- Run this entire file in: Supabase → SQL Editor → New Query → Run

-- ── DROPS TABLE ──────────────────────────────────────────
create table if not exists drops (
  id              uuid primary key default gen_random_uuid(),
  content         text not null,
  role            text,
  years_in_sales  text,
  industry        text,
  been_there_count integer not null default 0,
  is_flagged      boolean not null default false,
  user_id         uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now()
);

-- ── REACTIONS TABLE ──────────────────────────────────────
create table if not exists reactions (
  id          uuid primary key default gen_random_uuid(),
  drop_id     uuid not null references drops(id) on delete cascade,
  type        text not null check (type in ('been_there', 'disagree')),
  reason      text,
  created_at  timestamptz not null default now()
);

-- ── INDEXES ──────────────────────────────────────────────
create index if not exists drops_created_at_idx on drops(created_at desc);
create index if not exists drops_flagged_idx on drops(is_flagged);
create index if not exists reactions_drop_id_idx on reactions(drop_id);

-- ── ROW LEVEL SECURITY ───────────────────────────────────
alter table drops enable row level security;
alter table reactions enable row level security;

-- Anyone can read non-flagged drops
create policy "Public can read drops"
  on drops for select
  using (is_flagged = false);

-- Anyone can insert a drop (anonymous included)
create policy "Anyone can insert drops"
  on drops for insert
  with check (true);

-- Anyone can insert a reaction
create policy "Anyone can insert reactions"
  on reactions for insert
  with check (true);

-- Anyone can read reactions
create policy "Public can read reactions"
  on reactions for select
  using (true);

-- Anyone can flag a drop (report)
create policy "Anyone can flag drops"
  on drops for update
  using (true)
  with check (true);

-- ── FUNCTION: increment been_there atomically ─────────────
create or replace function increment_been_there(drop_id uuid)
returns void as $$
  update drops
  set been_there_count = been_there_count + 1
  where id = drop_id;
$$ language sql;

-- ── REALTIME ─────────────────────────────────────────────
-- Enable realtime on drops table
-- Do this in: Supabase → Database → Replication → add drops table
-- (Cannot be done via SQL, must be done in the dashboard)
