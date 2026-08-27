import { supabase } from '../lib/supabase'
import { levelFromXp } from '../lib/xp'
import type { Player } from '../types/player'

/**
 * Row shape as it actually exists in public.player_state (see
 * PHASE_3_DATABASE_ARCHITECTURE.md §3.2 and the create_daily_state /
 * profiles_player_state migrations). Snake_case, matching Postgres
 * convention — mapped to the app's camelCase Player type at the service
 * boundary so nothing above this file needs to know about the DB shape.
 */
type PlayerStateRow = {
  user_id: string
  level: number
  current_xp: number
  xp_to_next_level: number
  streak: number
  longest_streak: number
  last_streak_date: string | null
  combo_count: number
  last_combo_at: string | null
}

type ProfileRow = {
  id: string
  name: string
  title: string
  avatar_url: string | null
}

function toPlayer(profile: ProfileRow, state: PlayerStateRow): Player {
  return {
    id: profile.id,
    name: profile.name,
    title: profile.title,
    level: state.level,
    currentXp: state.current_xp,
    xpToNextLevel: state.xp_to_next_level,
    streak: state.streak,
    longestStreak: state.longest_streak,
    lastStreakDate: state.last_streak_date,
    comboCount: state.combo_count,
    lastComboAt: state.last_combo_at,
    avatarUrl: profile.avatar_url ?? undefined,
  }
}

/**
 * Loads the current user's combined profile + player_state as a single
 * Player object.
 *
 * Returns `null` if either row doesn't exist yet — this is the expected,
 * normal case for a user who has signed up but not yet been through
 * onboarding (Phase 3.4). Callers should treat `null` as "needs
 * onboarding," not as an error.
 */
export async function getPlayer(userId: string): Promise<Player | null> {
  const [{ data: profile, error: profileError }, { data: state, error: stateError }] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('id, name, title, avatar_url')
        .eq('id', userId)
        .maybeSingle(),
      supabase
        .from('player_state')
        .select(
          'user_id, level, current_xp, xp_to_next_level, streak, longest_streak, last_streak_date, combo_count, last_combo_at',
        )
        .eq('user_id', userId)
        .maybeSingle(),
    ])

  if (profileError) throw profileError
  if (stateError) throw stateError

  if (!profile || !state) {
    return null
  }

  return toPlayer(profile, state)
}

export type UpdatePlayerProgressResult = {
  level: number
  xpToNextLevel: number
  leveledUp: boolean
}

/**
 * Persists an updated Player back to profiles + player_state.
 *
 * As of Phase 4.1, this also derives `level` and `xp_to_next_level` from
 * the new `currentXp` via the centralized xp.ts engine (levelFromXp),
 * rather than trusting a caller-supplied level number. This is what
 * replaces the previously-static xp_to_next_level: 500 default with a
 * value that's always correctly derived from lifetime XP.
 *
 * Deliberately narrow on which fields it accepts: only the progression
 * fields quest completion actually changes (currentXp, comboCount,
 * lastComboAt, and — as of Phase 4.3 — streak/longestStreak/
 * lastStreakDate on the first completion of a day). Does not touch
 * name/title/avatar — those belong to a future profile-editing
 * feature, not quest completion.
 */
export async function updatePlayerProgress(
  userId: string,
  currentLevel: number,
  updates: Pick<
    Player,
    | 'currentXp'
    | 'comboCount'
    | 'lastComboAt'
    | 'streak'
    | 'longestStreak'
    | 'lastStreakDate'
  >,
): Promise<UpdatePlayerProgressResult> {
  const { level, xpToNextLevel } = levelFromXp(updates.currentXp)

  const { error } = await supabase
    .from('player_state')
    .update({
      current_xp: updates.currentXp,
      level,
      xp_to_next_level: xpToNextLevel,
      combo_count: updates.comboCount,
      last_combo_at: updates.lastComboAt,
      streak: updates.streak,
      longest_streak: updates.longestStreak,
      last_streak_date: updates.lastStreakDate,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  if (error) throw error

  return {
    level,
    xpToNextLevel,
    leveledUp: level > currentLevel,
  }
}