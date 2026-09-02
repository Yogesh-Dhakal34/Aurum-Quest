import { supabase } from '../lib/supabase'
import { getGmtDateKey, getGmtDateKeyDaysAgo } from '../lib/date'
import {
  aggregateByDay,
  aggregateWeek,
  computePersonalRecords,
  buildWeeklyReport,
} from '../lib/progress'
import type {
  RawProgressRow,
  DailyBreakdown,
  WeeklyStats,
  PersonalRecords,
  WeeklyReport,
} from '../lib/progress'
import type { QuestCategory } from '../types/quest'

type QuestDefinitionRow = {
  id: string
  category: QuestCategory
  unit: string
  xp_reward: number
}

type QuestProgressRangeRow = {
  quest_definition_id: string
  date_key: string
  completed: boolean
  completed_at: string | null
  progress: number
}

/**
 * Fetches raw quest_progress rows for [startDateKey, endDateKey]
 * (inclusive) and joins them to quest_definitions client-side — same
 * two-query, join-in-JS pattern already used by
 * questService.getTodaysQuests, not the untested PostgREST embedded-
 * join syntax. Also returns the count of active quest_definitions,
 * needed as the completion-rate denominator (lib/progress.ts).
 */
async function getRangeData(
  userId: string,
  startDateKey: string,
  endDateKey: string,
): Promise<{ rows: RawProgressRow[]; totalActiveQuests: number }> {
  const [
    { data: definitions, error: definitionsError },
    { count: totalActiveQuests, error: countError },
    { data: progressRows, error: progressError },
  ] = await Promise.all([
    supabase.from('quest_definitions').select('id, category, unit, xp_reward'),
    supabase
      .from('quest_definitions')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true),
    supabase
      .from('quest_progress')
      .select('quest_definition_id, date_key, completed, completed_at, progress')
      .eq('user_id', userId)
      .gte('date_key', startDateKey)
      .lte('date_key', endDateKey),
  ])

  if (definitionsError) throw definitionsError
  if (countError) throw countError
  if (progressError) throw progressError

  const definitionsById = new Map<string, QuestDefinitionRow>(
    (definitions ?? []).map((d: QuestDefinitionRow) => [d.id, d]),
  )

  const rows: RawProgressRow[] = (progressRows ?? [])
    .map((row: QuestProgressRangeRow) => {
      const definition = definitionsById.get(row.quest_definition_id)
      // A quest_progress row whose quest_definition was later deleted
      // (never happens today — quest_definitions are never deleted,
      // only deactivated — but defensive rather than assuming) is
      // dropped from aggregation rather than crashing the whole range.
      if (!definition) return null

      return {
        dateKey: row.date_key,
        completed: row.completed,
        completedAt: row.completed_at,
        progress: row.progress,
        category: definition.category,
        unit: definition.unit,
        xpReward: definition.xp_reward,
      }
    })
    .filter((row): row is RawProgressRow => row !== null)

  return { rows, totalActiveQuests: totalActiveQuests ?? 0 }
}

/** Phase 7 daily view: today, or any specific past date_key. */
export async function getDailyBreakdown(
  userId: string,
  dateKey: string,
): Promise<DailyBreakdown | null> {
  const { rows, totalActiveQuests } = await getRangeData(userId, dateKey, dateKey)
  const days = aggregateByDay(rows, totalActiveQuests)
  return days.find((d) => d.dateKey === dateKey) ?? null
}

/**
 * Phase 7 weekly view: the 7 days ending today (today minus 6, through
 * today, inclusive) — the simplest "last 7 days" framing, not aligned
 * to calendar week boundaries, since GAMEPLAY.md/ROADMAP.md don't
 * specify Mon-Sun vs a rolling window and a rolling "last 7 days" is
 * always meaningful regardless of what day it is today.
 */
export async function getWeeklyProgress(userId: string): Promise<{
  weekStartKey: string
  days: DailyBreakdown[]
  stats: WeeklyStats
  report: WeeklyReport
}> {
  const endDateKey = getGmtDateKey()
  const startDateKey = getGmtDateKeyDaysAgo(6)

  const { rows, totalActiveQuests } = await getRangeData(
    userId,
    startDateKey,
    endDateKey,
  )
  const days = aggregateByDay(rows, totalActiveQuests)
  const stats = aggregateWeek(days)
  const report = buildWeeklyReport(days, stats)

  return { weekStartKey: startDateKey, days, stats, report }
}

/**
 * All-time personal records. `longestStreak` must come from the
 * caller (player_state.longest_streak, already correctly maintained by
 * Phase 4.3) rather than being derived here — see
 * lib/progress.ts:computePersonalRecords's comment for why.
 *
 * Queries from account creation isn't tracked precisely here — this
 * pragmatically looks back 365 days, which comfortably covers this
 * project's actual usage history and avoids an unbounded full-table
 * scan as the account ages for years.
 */
export async function getPersonalRecords(
  userId: string,
  longestStreak: number,
): Promise<PersonalRecords> {
  const endDateKey = getGmtDateKey()
  const startDateKey = getGmtDateKeyDaysAgo(365)

  const { rows, totalActiveQuests } = await getRangeData(
    userId,
    startDateKey,
    endDateKey,
  )
  const days = aggregateByDay(rows, totalActiveQuests)

  return computePersonalRecords(days, longestStreak)
}

/**
 * Reads the optional journal note for a given week, keyed by the same
 * week_start_key getWeeklyProgress returns — the one piece of Phase 7
 * state that's actually written by the player, not derived. Returns
 * an empty string if no note has been saved yet, so callers can treat
 * "no note" and "empty note" the same way rather than handling null.
 */
export async function getWeeklyJournalNote(
  userId: string,
  weekStartKey: string,
): Promise<string> {
  const { data, error } = await supabase
    .from('weekly_journal')
    .select('note')
    .eq('user_id', userId)
    .eq('week_start_key', weekStartKey)
    .maybeSingle()

  if (error) throw error
  return data?.note ?? ''
}

/**
 * Saves the journal note for a given week. Upsert on the
 * (user_id, week_start_key) primary key — same "write your own row,
 * overwrite freely" semantics as every other per-user table in this
 * app, no separate create-vs-update branching needed.
 */
export async function saveWeeklyJournalNote(
  userId: string,
  weekStartKey: string,
  note: string,
): Promise<void> {
  const { error } = await supabase.from('weekly_journal').upsert({
    user_id: userId,
    week_start_key: weekStartKey,
    note,
    updated_at: new Date().toISOString(),
  })

  if (error) throw error
}
