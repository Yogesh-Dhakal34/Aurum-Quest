create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text not null,
  title text not null default 'Quest Initiate',
  avatar_url text,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.player_state (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  level integer not null default 1,
  current_xp integer not null default 0,
  xp_to_next_level integer not null default 500,
  streak integer not null default 0,
  combo_count integer not null default 0,
  last_combo_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint player_state_level_positive
    check (level >= 1),

  constraint player_state_current_xp_nonnegative
    check (current_xp >= 0),

  constraint player_state_xp_to_next_level_positive
    check (xp_to_next_level > 0),

  constraint player_state_streak_nonnegative
    check (streak >= 0),

  constraint player_state_combo_nonnegative
    check (combo_count >= 0)
);
alter table public.profiles enable row level security;

alter table public.player_state enable row level security;
create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
create policy "Users can view their own player state"
on public.player_state
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own player state"
on public.player_state
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own player state"
on public.player_state
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);