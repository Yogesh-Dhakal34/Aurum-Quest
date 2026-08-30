-- Phase 5.5: character_skills
--
-- One row per user, eight integer skill columns. Same pattern as
-- create_character_stats.sql: values only ever move via
-- skillService.applyQuestSkillGains, called from QuestsPage on quest
-- completion — no user-facing "increment skill" action.
--
-- Mapping is category-level for now (lib/skills.ts), not per-quest —
-- per your call, kept simple and open to a future per-quest tagging
-- migration if you revisit this after initial ship.
--
-- Same explicit-GRANT requirement as every table this project uses
-- (see create_character_stats.sql / profiles_player_state.sql for the
-- underlying Supabase May 2026 default-privilege incident).

create table public.character_skills (
  user_id uuid primary key references auth.users(id) on delete cascade,
  study integer not null default 0,
  writing integer not null default 0,
  communication integer not null default 0,
  fitness integer not null default 0,
  reading integer not null default 0,
  learning integer not null default 0,
  problem_solving integer not null default 0,
  design integer not null default 0,
  updated_at timestamptz not null default now(),

  constraint character_skills_non_negative check (
    study >= 0
    and writing >= 0
    and communication >= 0
    and fitness >= 0
    and reading >= 0
    and learning >= 0
    and problem_solving >= 0
    and design >= 0
  )
);

alter table public.character_skills enable row level security;

create policy "Users can view their own character skills"
  on public.character_skills
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own character skills"
  on public.character_skills
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own character skills"
  on public.character_skills
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update on public.character_skills to authenticated;
