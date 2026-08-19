create table public.quest_progress (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  quest_definition_id uuid not null
    references public.quest_definitions(id)
    on delete cascade,

  progress integer not null default 0,

  target integer not null,

  completed boolean not null default false,

  completed_at timestamptz,

  date_key date not null,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  constraint quest_progress_progress_nonnegative
    check (progress >= 0),

  constraint quest_progress_target_positive
    check (target > 0),

  constraint quest_progress_progress_within_target
    check (progress <= target),

  constraint quest_progress_unique_daily_quest
    unique (user_id, quest_definition_id, date_key)
);

alter table public.quest_progress enable row level security;

create policy "Users can view their own quest progress"
on public.quest_progress
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own quest progress"
on public.quest_progress
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own quest progress"
on public.quest_progress
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own quest progress"
on public.quest_progress
for delete
to authenticated
using (auth.uid() = user_id);