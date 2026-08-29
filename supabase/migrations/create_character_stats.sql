-- Phase 5.2: character_stats
--
-- One row per user, six integer stat columns. Values only ever move via
-- characterService.applyStatGains, called from QuestsPage on quest
-- completion — there is no user-facing "increment stat" action, per
-- ROADMAP.md 5.2 ("do not let users grind stats through meaningless
-- clicks").
--
-- Follows the same RLS + explicit GRANT pattern as every other table
-- this project uses (see profiles_player_state.sql, create_daily_state.sql).
-- Supabase's May 2026 default-privilege change means RLS policies alone
-- are not sufficient — the underlying role also needs table-level
-- GRANTs, or every query 403s regardless of policy. That earlier
-- incident is the reason this comment exists on every table now.

create table public.character_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  strength integer not null default 0,
  knowledge integer not null default 0,
  discipline integer not null default 0,
  health integer not null default 0,
  focus integer not null default 0,
  creativity integer not null default 0,
  updated_at timestamptz not null default now(),

  constraint character_stats_non_negative check (
    strength >= 0
    and knowledge >= 0
    and discipline >= 0
    and health >= 0
    and focus >= 0
    and creativity >= 0
  )
);

alter table public.character_stats enable row level security;

create policy "Users can view their own character stats"
  on public.character_stats
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own character stats"
  on public.character_stats
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own character stats"
  on public.character_stats
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Explicit grants — required in addition to RLS as of Supabase's May
-- 2026 default-privilege change (see comment above / DEV_JOURNAL.md
-- Phase 3 incident writeup).
grant select, insert, update on public.character_stats to authenticated;
