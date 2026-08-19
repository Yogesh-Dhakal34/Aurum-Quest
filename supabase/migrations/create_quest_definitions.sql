create table public.quest_definitions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,

  category text not null
    check (category in ('Study', 'Health', 'Work', 'Personal')),

  difficulty text not null
    check (difficulty in ('Easy', 'Medium', 'Hard')),

  xp_reward integer not null
    check (xp_reward >= 0),

  target integer not null
    check (target > 0),

  unit text not null
    check (unit in ('completion', 'hours', 'liters', 'sessions')),

  is_active boolean not null default true,

  created_at timestamptz not null default now()
);

alter table public.quest_definitions
  enable row level security;

create policy "Authenticated users can read active quests"
on public.quest_definitions
for select
to authenticated
using (is_active = true);