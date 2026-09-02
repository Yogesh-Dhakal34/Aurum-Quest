import { supabase } from '../lib/supabase'
import { calculateDailyRank, deriveComboAchievedForDay } from '../lib/rank'
import type { RankResult } from '../lib/rank'

/**
 * Computes the rank for a single (user, date) pair, entirely derived
 * from real quest_progress + quest_definitions data — no separate rank
 * storage, same "recompute, don't trust stored" pattern already used
 * for titles and the XP bar.
 *
 * streakMaintained is derived here too, not passed in from
 * player_state: calculateStreakUpdate (lib/xp.ts) increments the
 * streak the first time ANY quest is completed on a new day, so
 * "streak maintained on day X" is exactly equivalent to "at least one
 * completion exists for day X" — no need to depend on player_state's
 * single current value, which only reflects the most recent day
 * anyway and can't answer this for an arbitrary past date.
 */
export async function getDailyRank(
  userId: string,
  dateKey: string,
): Promise<RankResult> {
  const [{ count: totalActive, error: countError }, { data: progressRows, error: progressError }] =
    await Promise.all([
      supabase
        .from('quest_definitions')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),
      supabase
        .from('quest_progress')
        .select('completed, completed_at')
        .eq('user_id', userId)
        .eq('date_key', dateKey),
    ])

  if (countError) throw countError
  if (progressError) throw progressError

  const total = totalActive ?? 0
  const rows = progressRows ?? []
  const completedRows = rows.filter((row) => row.completed)

  const completionPercent = total > 0 ? (completedRows.length / total) * 100 : 0
  const streakMaintained = completedRows.length > 0

  const completedAtTimestamps = completedRows
    .map((row) => row.completed_at)
    .filter((value): value is string => value !== null)
    .sort()

  const comboAchieved = deriveComboAchievedForDay(completedAtTimestamps)

  return calculateDailyRank(completionPercent, streakMaintained, comboAchieved)
}
