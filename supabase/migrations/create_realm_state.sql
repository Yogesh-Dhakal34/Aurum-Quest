-- Phase 6.2: realm_state
--
-- The player's current tier is fully derivable from lifetime XP
-- (lib/realm.ts getCurrentTier) — it does NOT need its own storage.
-- What DOES need storage is which tier's unlock CEREMONY has already
-- been shown, so a player who crosses a threshold and closes the tab
-- before the animation finishes still sees it on their next visit,
-- rather than it being silently skipped. ROADMAP.md 6.2 requires this
-- explicitly ("store unlock permanently") as Core, not Stretch.
--
-- Same RLS + explicit GRANT pattern as every table this project uses.

create table public.realm_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  -- Starts at 1: Tier 1 (Campfire) requires 0 XP and is never
  -- "unlocked" via a ceremony — everyone starts there.
  last_acknowledged_tier integer not null default 1,
  updated_at timestamptz not null default now(),

  constraint realm_state_tier_valid check (
    last_acknowledged_tier >= 1 and last_acknowledged_tier <= 7
  )
);

alter table public.realm_state enable row level security;

create policy "Users can view their own realm state"
  on public.realm_state
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own realm state"
  on public.realm_state
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own realm state"
  on public.realm_state
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update on public.realm_state to authenticated;
