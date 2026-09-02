-- Phase 7: weekly_journal
--
-- The one genuinely new piece of writable state this phase needs —
-- everything else (daily/weekly stats, personal records) is derived
-- from quest_progress/quest_definitions, not stored separately. This
-- table exists only for the optional free-text note a player can
-- attach to a given week's report (ROADMAP.md's Weekly Report spec).
--
-- Keyed by week_start_key (the GMT date_key of the first day of the
-- 7-day window that report covers), not an auto-increment id — a user
-- can have at most one note per week, upsert semantics, no separate
-- lookup needed.
--
-- Same explicit-GRANT requirement as every table in this project (see
-- create_character_stats.sql for the underlying incident).

create table public.weekly_journal (
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start_key text not null,
  note text not null default '',
  updated_at timestamptz not null default now(),

  primary key (user_id, week_start_key)
);

alter table public.weekly_journal enable row level security;

create policy "Users can view their own weekly journal entries"
  on public.weekly_journal
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own weekly journal entries"
  on public.weekly_journal
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own weekly journal entries"
  on public.weekly_journal
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update on public.weekly_journal to authenticated;
