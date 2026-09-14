-- Backfill migration: achievement_progress
--
-- This table has existed in the live database since Phase 4 but was
-- never captured in a migration file (a known, previously-documented
-- gap). Reconstructed here from the actual FK/cascade behavior
-- confirmed live via pg_constraint, and from the columns
-- achievementService.ts already reads/writes successfully in
-- production (user_id, achievement_id, unlocked_at).
--
-- `create table if not exists` deliberately makes this a no-op
-- against the current database -- the goal isn't to change anything
-- live, it's to make the schema reproducible if this project is ever
-- rebuilt from a clean database.

create table if not exists public.achievement_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id uuid not null references public.achievement_definitions(id) on delete cascade,
  unlocked_at timestamptz not null default now(),

  unique (user_id, achievement_id)
);

alter table public.achievement_progress enable row level security;

-- drop-then-create makes this safe to run even though the live table
-- already has RLS/policies from whenever it was first set up outside
-- a migration -- if those existing policies have different names,
-- this just adds an equivalent, harmless second policy rather than
-- erroring on a duplicate name.
drop policy if exists "Users can view their own achievement progress" on public.achievement_progress;
create policy "Users can view their own achievement progress"
  on public.achievement_progress
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can unlock their own achievements" on public.achievement_progress;
create policy "Users can unlock their own achievements"
  on public.achievement_progress
  for insert
  with check (auth.uid() = user_id);

grant select, insert on public.achievement_progress to authenticated;