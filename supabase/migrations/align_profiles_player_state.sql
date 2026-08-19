-- Align Phase 3.2 schema with the authoritative database architecture.

-- profiles:
-- username -> name
-- display_name is removed because identity is represented by name.

alter table public.profiles
  rename column username to name;

alter table public.profiles
  drop column display_name;

-- player_state:
-- The architecture defines player_state.user_id as a direct reference
-- to auth.users rather than indirectly referencing profiles.

alter table public.player_state
  drop constraint if exists player_state_user_id_fkey;

alter table public.player_state
  add constraint player_state_user_id_fkey
  foreign key (user_id)
  references auth.users(id)
  on delete cascade;

-- created_at is not part of the authoritative player_state model.
alter table public.player_state
  drop column if exists created_at;