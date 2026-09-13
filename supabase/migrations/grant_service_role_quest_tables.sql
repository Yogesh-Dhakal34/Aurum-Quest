-- Phase 9 follow-up: service_role grants on quest_definitions and
-- quest_progress.
--
-- These two tables predate the explicit-GRANT pattern (create_quest_
-- definitions.sql / create_quest_progress.sql have no grant statements
-- at all -- they were likely created before Supabase's May-2026 change
-- that stopped auto-granting anon/authenticated on new tables, and
-- `authenticated` access has worked ever since without anyone adding
-- it by hand).
--
-- Nothing ever needed service_role access to these tables until now --
-- the ai-companion Edge Function is the first thing in this project
-- that reads them as service_role rather than as a logged-in user.
-- Discovered live: "permission denied for table quest_definitions"
-- (Postgres error 42501) from the function's own error logs.

grant select on public.quest_definitions to service_role;
grant select on public.quest_progress to service_role;