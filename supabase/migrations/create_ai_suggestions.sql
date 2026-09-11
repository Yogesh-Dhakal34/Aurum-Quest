-- Phase 9: ai_suggestions
--
-- Stores every AI-generated suggestion (daily strategy, weekly
-- reflection, and later stretch types) as a durable, auditable row.
-- Hard rule from GAMEPLAY.md §17 / ARCHITECTURE.md §7: the AI can
-- never silently affect XP, quest completion, or history. This table
-- is how that's enforced in code, not just policy — a suggestion is
-- inert data until a user explicitly approves it, and even then the
-- approval only flips `status`; it never itself writes to
-- quest_progress or player_state. Any code path that turns an
-- approved suggestion into real quest/XP changes must go through the
-- exact same service functions a human action would use.
--
-- Rows are only ever inserted by the Edge Function using the service
-- role key (which bypasses RLS) — there is deliberately no insert
-- policy for `authenticated`, so a client can never forge its own
-- "AI" suggestion.
--
-- Same RLS + explicit GRANT pattern as every table this project uses
-- (required since the post-May-2026 Supabase behavior change stopped
-- auto-granting anon/authenticated on new tables).

create table public.ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  -- 'quest_suggestion' and 'goal_breakdown' are stretch-tier types,
  -- included in the check constraint now so the column never needs a
  -- migration later, even though nothing writes them yet.
  type text not null check (
    type in ('daily_strategy', 'weekly_reflection', 'quest_suggestion', 'goal_breakdown')
  ),

  -- Human-readable suggestion text, shown as-is in the UI.
  content text not null,

  -- Why the AI suggested this — shown alongside content per
  -- GAMEPLAY.md §17 ("show reasoning when practical"). Nullable
  -- because not every suggestion type will always have one.
  reasoning text,

  -- Structured payload for suggestion types that reference specific
  -- quests/goals (stretch tier). Unused by daily_strategy /
  -- weekly_reflection today, but here so those types don't need a
  -- schema change to adopt it.
  metadata jsonb,

  status text not null default 'pending' check (
    status in ('pending', 'approved', 'dismissed', 'expired')
  ),

  -- The date_key (see lib/date.ts getGmtDateKey) this suggestion was
  -- generated for. Used by the Edge Function's rate-limit check
  -- ("has this user already gotten a daily_strategy for today?")
  -- instead of parsing created_at, which would need timezone math.
  date_key text not null,

  created_at timestamptz not null default now(),
  responded_at timestamptz
);

create index ai_suggestions_user_type_date_idx
  on public.ai_suggestions (user_id, type, date_key);

alter table public.ai_suggestions enable row level security;

create policy "Users can view their own AI suggestions"
  on public.ai_suggestions
  for select
  using (auth.uid() = user_id);

-- Users may only ever change status/responded_at on their own rows,
-- and only ever move off 'pending' — enforced by the with check
-- below in addition to the application layer, so a compromised
-- client can't do more than approve/dismiss its own suggestions.
create policy "Users can respond to their own AI suggestions"
  on public.ai_suggestions
  for update
  using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id);

grant select, update on public.ai_suggestions to authenticated;
