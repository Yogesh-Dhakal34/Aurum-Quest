-- Phase 10: policy consent tracking
--
-- Versioned rather than a plain boolean -- if Privacy/Terms are ever
-- materially rewritten, this lets us tell who agreed to which version
-- instead of a single flag that silently goes stale the moment the
-- policy text changes underneath it.
--
-- Populated from two places, deliberately redundant: supabase.auth.
-- signUp()'s options.data captures it on the auth record itself at
-- the moment of signup (so it's never lost even if onboarding is
-- abandoned partway), and completeOnboarding() copies it here for
-- durable querying in the public schema -- see AuthPage.tsx and
-- onboardingService.ts.

alter table public.profiles
  add column if not exists accepted_policy_version text,
  add column if not exists accepted_policy_at timestamptz;