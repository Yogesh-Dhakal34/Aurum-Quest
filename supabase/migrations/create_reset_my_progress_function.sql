-- Phase 10: reset_my_progress()
--
-- Wipes a user's game progress back to a fresh-start state while
-- keeping their account (login, username, display_name, avatar)
-- intact. Deliberately a single Postgres function rather than several
-- separate client-side calls: a reset touching 7 tables needs to be
-- all-or-nothing, and a plain sequence of client calls has no such
-- guarantee if one fails partway through.
--
-- security definer means this runs with the function owner's
-- privileges, not the caller's -- it bypasses RLS/grants entirely.
-- That's normally something to be careful with, but it's safe here
-- specifically because the function hardcodes auth.uid() as the only
-- possible target; there is no parameter a caller could use to reset
-- anyone else's data.
--
-- Granted to `authenticated` only -- there's no reason for anon or
-- service_role to ever call this directly.

create or replace function public.reset_my_progress()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_user_id uuid := auth.uid();
begin
  if target_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Progress rows: delete outright, nothing to preserve.
  delete from public.quest_progress where user_id = target_user_id;
  delete from public.achievement_progress where user_id = target_user_id;
  delete from public.weekly_journal where user_id = target_user_id;
  delete from public.ai_suggestions where user_id = target_user_id;

  -- Stateful rows: reset to their original defaults rather than
  -- delete, since these tables use user_id as a primary key and
  -- other code (e.g. loaders across the app) assumes a row always
  -- exists for a signed-in user -- deleting them would just recreate
  -- the exact "missing row" class of bug this project already solved
  -- once with self-healing loaders.
  update public.player_state
    set level = 1,
        current_xp = 0,
        xp_to_next_level = 500,
        streak = 0,
        combo_count = 0,
        last_combo_at = null,
        updated_at = now()
    where user_id = target_user_id;

  update public.character_stats
    set strength = 0,
        knowledge = 0,
        discipline = 0,
        health = 0,
        focus = 0,
        creativity = 0,
        updated_at = now()
    where user_id = target_user_id;

  update public.character_skills
    set study = 0,
        writing = 0,
        communication = 0,
        fitness = 0,
        reading = 0,
        learning = 0,
        problem_solving = 0,
        design = 0,
        updated_at = now()
    where user_id = target_user_id;

  update public.realm_state
    set last_acknowledged_tier = 1,
        updated_at = now()
    where user_id = target_user_id;

  -- Title is level-derived (see LegendPage) -- reset it alongside
  -- level so a fresh level-1 character doesn't keep a high-level
  -- title, which would be an inconsistent state nothing else expects.
  update public.profiles
    set title = 'Quest Initiate',
        updated_at = now()
    where id = target_user_id;
end;
$$;

revoke all on function public.reset_my_progress() from public;
grant execute on function public.reset_my_progress() to authenticated;