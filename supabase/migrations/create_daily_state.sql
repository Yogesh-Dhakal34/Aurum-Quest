create table if not exists public.daily_state (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references public.profiles(id)
        on delete cascade,

    date_key date not null,

    daily_xp integer not null default 0
        check (daily_xp >= 0),

    is_complete boolean not null default false,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    constraint daily_state_unique_user_date
        unique (user_id, date_key)
);


create index if not exists daily_state_user_date_idx
    on public.daily_state (user_id, date_key);


alter table public.daily_state enable row level security;


create policy "Users can view their own daily state"
    on public.daily_state
    for select
    to authenticated
    using (auth.uid() = user_id);


create policy "Users can insert their own daily state"
    on public.daily_state
    for insert
    to authenticated
    with check (auth.uid() = user_id);


create policy "Users can update their own daily state"
    on public.daily_state
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);


create policy "Users can delete their own daily state"
    on public.daily_state
    for delete
    to authenticated
    using (auth.uid() = user_id);