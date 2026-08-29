import { supabase } from '../lib/supabase'
import type { QuestCategory } from '../types/quest'

export type OnboardingInput = {
  name: string
  avatarSex: 'male' | 'female'
  timezone: string
  focusCategories: QuestCategory[]
}

/**
 * Turns a raw Supabase/Postgres error into something a user can actually
 * read and act on. Postgres error codes are stable and documented —
 * https://www.postgresql.org/docs/current/errcodes-appendix.html — so
 * matching on `error.code` here is more reliable than trying to pattern
 * match on the (implementation-detail, can-change) message text.
 */
function toReadableError(error: {
  code?: string
  message: string
  details?: string | null
}): Error {
  // 23505 = unique_violation. Covers this Postgres session's specific
  // fix (fix_profiles_name_uniqueness.sql removed the leftover unique
  // constraint on name), but written generically so it also produces a
  // sensible message for any future unique constraint, rather than only
  // patching today's one incident.
  if (error.code === '23505') {
    return new Error(
      'That value is already taken by another account. Try a different one.',
    )
  }

  // 23514 = check_violation — e.g. avatar_sex or focus_categories not
  // matching their allowed values.
  if (error.code === '23514') {
    return new Error(
      'One of your answers isn\'t in an allowed format. Please try again.',
    )
  }

  // Fallback: still show the real message rather than a fully generic
  // "something went wrong," but without pretending to have a specific
  // explanation we don't actually have.
  return new Error(error.message || 'Something went wrong. Please try again.')
}

/**
 * Checks whether the given user has already completed onboarding.
 *
 * Distinguishes three real states, not just two:
 *  - no profiles row at all -> brand new user, never started onboarding
 *  - profiles row exists but onboarding_completed_at is null -> started
 *    (shouldn't currently happen since this flow is a single step, but
 *    kept distinct for when onboarding grows a second step later)
 *  - onboarding_completed_at is set -> done, go straight to the app
 */
export async function getOnboardingStatus(
  userId: string,
): Promise<'not-started' | 'completed'> {
  const { data, error } = await supabase
    .from('profiles')
    .select('onboarding_completed_at')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw toReadableError(error)

  if (!data || !data.onboarding_completed_at) {
    return 'not-started'
  }

  return 'completed'
}

/**
 * Creates the profiles + player_state rows for a first-time user, using
 * default progression values (level 1, 0 XP, matching the same starting
 * values as the old local data/player.ts fallback).
 *
 * This is the direct replacement for manually inserting these rows via
 * the Supabase Table Editor.
 */
export async function completeOnboarding(
  userId: string,
  input: OnboardingInput,
): Promise<void> {
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    name: input.name,
    avatar_sex: input.avatarSex,
    timezone: input.timezone,
    focus_categories: input.focusCategories,
    onboarding_completed_at: new Date().toISOString(),
  })

  if (profileError) throw toReadableError(profileError)

  // Default progression values — same starting point the old
  // src/data/player.ts fallback used, so a fresh account's first
  // experience is unchanged from before persistence existed.
  const { error: stateError } = await supabase.from('player_state').upsert({
    user_id: userId,
    level: 1,
    current_xp: 0,
    xp_to_next_level: 500,
    streak: 0,
    longest_streak: 0,
    last_streak_date: null,
    combo_count: 0,
    last_combo_at: null,
  })

  if (stateError) throw toReadableError(stateError)

  // Phase 5.2: every user gets a character_stats row created at
  // onboarding, all six stats starting at 0 — same "create the full set
  // of rows a fresh account needs" pattern as player_state above, so
  // there's never a state where a signed-in, onboarded user is missing
  // stats and characterService has to handle a null case downstream.
  const { error: statsError } = await supabase.from('character_stats').upsert({
    user_id: userId,
    strength: 0,
    knowledge: 0,
    discipline: 0,
    health: 0,
    focus: 0,
    creativity: 0,
  })

  if (statsError) throw toReadableError(statsError)
}