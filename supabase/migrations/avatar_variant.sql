-- Phase 10: Profile section support
--
-- avatar_variant: which specific design within the chosen avatar_sex
-- bucket (see AvatarDisplay.tsx) -- orthogonal to avatar_sex rather
-- than replacing it, so every existing call site that already passes
-- avatarSex straight into AvatarDisplay keeps working unchanged; they
-- just default to variant 1, identical to today's single design per
-- sex. Defaulting existing rows to 1 preserves everyone's current
-- avatar exactly as it looks today.
--
-- birthday: purely informational, shown on the new Profile page.
-- Deliberately nullable with no default -- onboarding never collected
-- this, so every existing user starts with no birthday set rather
-- than a fabricated one.

alter table public.profiles
  add column if not exists avatar_variant smallint not null default 1,
  add column if not exists birthday date;