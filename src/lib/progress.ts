import { calculateDailyRank, deriveComboAchievedForDay } from './rank'
import type { DailyRank, RankResult } from './rank'
import type { QuestCategory } from '../types/quest'

/**
 * Raw shape of one quest_progress row joined with its quest_definition,
 * for a date range — what progressService.ts fetches from Supabase.
 * Kept minimal: only the fields aggregation actually needs.
 */
export type RawProgressRow = {
  dateKey: string
  completed: boolean
  completedAt: string | null
  progress: number
  category: QuestCategory
  unit: string
  xpReward: number
}

export type DailyBreakdown = {
  dateKey: string
  xpEarned: number
  questsCompleted: number
  completionRate: number
  /** Sum of `progress` for completed quests, per category — the raw
   * number in whatever unit that quest uses (hours, sessions, liters,
   * completion). Mixing units within one category total would be
   * misleading, so this is intentionally per-category, not a single
   * cross-category number. */
  categoryTotals: Partial<Record<QuestCategory, number>>
  rank: RankResult
}

/**
 * Groups a date range's raw rows by day and computes each day's full
 * breakdown, including rank — reuses the exact same pure rank formula
 * (lib/rank.ts) used live in QuestsPage, so a day's rank is identical
 * whether read today or retrospectively next month.
 */
export function aggregateByDay(
  rows: RawProgressRow[],
  totalActiveQuests: number,
): DailyBreakdown[] {
  const rowsByDay = new Map<string, RawProgressRow[]>()

  for (const row of rows) {
    const existing = rowsByDay.get(row.dateKey) ?? []
    existing.push(row)
    rowsByDay.set(row.dateKey, existing)
  }

  const results: DailyBreakdown[] = []

  for (const [dateKey, dayRows] of rowsByDay) {
    const completedRows = dayRows.filter((r) => r.completed)

    const xpEarned = completedRows.reduce((sum, r) => sum + r.xpReward, 0)
    const questsCompleted = completedRows.length
    const completionRate =
      totalActiveQuests > 0 ? (questsCompleted / totalActiveQuests) * 100 : 0

    const categoryTotals: Partial<Record<QuestCategory, number>> = {}
    for (const row of completedRows) {
      categoryTotals[row.category] = (categoryTotals[row.category] ?? 0) + row.progress
    }

    const completedAtTimestamps = completedRows
      .map((r) => r.completedAt)
      .filter((v): v is string => v !== null)
      .sort()

    const streakMaintained = questsCompleted > 0
    const comboAchieved = deriveComboAchievedForDay(completedAtTimestamps)
    const rank = calculateDailyRank(completionRate, streakMaintained, comboAchieved)

    results.push({
      dateKey,
      xpEarned,
      questsCompleted,
      completionRate,
      categoryTotals,
      rank,
    })
  }

  return results.sort((a, b) => a.dateKey.localeCompare(b.dateKey))
}

export type WeeklyStats = {
  totalXp: number
  averageDailyCompletion: number
  bestDay: DailyBreakdown | null
  weakestDay: DailyBreakdown | null
  topCategory: QuestCategory | null
  neglectedCategory: QuestCategory | null
}

const ALL_CATEGORIES: QuestCategory[] = ['Study', 'Health', 'Work', 'Personal']

/**
 * Aggregates a week's worth of daily breakdowns. bestDay/weakestDay are
 * ranked by completionRate (not raw XP), so a day with fewer but
 * harder quests isn't unfairly penalized against a day that happened
 * to have more Easy quests available.
 *
 * topCategory/neglectedCategory compare COMPLETION COUNT per category
 * across the week, not XP — a category can be "neglected" even if its
 * few completions were high-XP, and this keeps the signal about
 * consistency (did you show up for this category) rather than reward
 * size.
 */
export function aggregateWeek(days: DailyBreakdown[]): WeeklyStats {
  if (days.length === 0) {
    return {
      totalXp: 0,
      averageDailyCompletion: 0,
      bestDay: null,
      weakestDay: null,
      topCategory: null,
      neglectedCategory: null,
    }
  }

  const totalXp = days.reduce((sum, d) => sum + d.xpEarned, 0)
  const averageDailyCompletion =
    days.reduce((sum, d) => sum + d.completionRate, 0) / days.length

  const bestDay = days.reduce((best, d) =>
    d.completionRate > best.completionRate ? d : best,
  )
  const weakestDay = days.reduce((worst, d) =>
    d.completionRate < worst.completionRate ? d : worst,
  )

  const completionCountByCategory: Record<QuestCategory, number> = {
    Study: 0,
    Health: 0,
    Work: 0,
    Personal: 0,
  }

  for (const day of days) {
    for (const category of ALL_CATEGORIES) {
      if (day.categoryTotals[category] !== undefined) {
        completionCountByCategory[category] += 1
      }
    }
  }

  const topCategory = ALL_CATEGORIES.reduce((top, c) =>
    completionCountByCategory[c] > completionCountByCategory[top] ? c : top,
  )
  const neglectedCategory = ALL_CATEGORIES.reduce((low, c) =>
    completionCountByCategory[c] < completionCountByCategory[low] ? c : low,
  )

  return {
    totalXp,
    averageDailyCompletion,
    bestDay,
    weakestDay,
    topCategory:
      completionCountByCategory[topCategory] > 0 ? topCategory : null,
    neglectedCategory,
  }
}

export type PersonalRecords = {
  longestStreak: number
  mostXpInDay: number
  mostXpInDayDate: string | null
  mostCategoryUnitsInDay: Partial<Record<QuestCategory, number>>
  rankFrequency: Record<DailyRank, number>
}

/**
 * Computes personal records across an arbitrary set of daily
 * breakdowns (intended to be called with the full historical range for
 * "true" all-time records, not just one week). `longestStreak` is
 * passed in rather than derived here — it already exists as a
 * correctly-maintained running value on player_state (Phase 4.3), so
 * recomputing it from daily breakdowns would be redundant and a
 * potential source of drift from the value already shown elsewhere.
 */
export function computePersonalRecords(
  days: DailyBreakdown[],
  longestStreak: number,
): PersonalRecords {
  const rankFrequency: Record<DailyRank, number> = {
    S: 0,
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    F: 0,
  }

  let mostXpInDay = 0
  let mostXpInDayDate: string | null = null
  const mostCategoryUnitsInDay: Partial<Record<QuestCategory, number>> = {}

  for (const day of days) {
    rankFrequency[day.rank.rank] += 1

    if (day.xpEarned > mostXpInDay) {
      mostXpInDay = day.xpEarned
      mostXpInDayDate = day.dateKey
    }

    for (const category of ALL_CATEGORIES) {
      const value = day.categoryTotals[category] ?? 0
      if (value > (mostCategoryUnitsInDay[category] ?? 0)) {
        mostCategoryUnitsInDay[category] = value
      }
    }
  }

  return {
    longestStreak,
    mostXpInDay,
    mostXpInDayDate,
    mostCategoryUnitsInDay,
    rankFrequency,
  }
}

export type WeeklyReport = {
  score: number
  wins: string[]
  weaknesses: string[]
  nextWeekFocus: string
}

/**
 * Composes the weekly report — Score/Wins/Weaknesses/Next-week-focus,
 * per ROADMAP.md's Weekly Report spec. Score is the average of that
 * week's daily rank scores (lib/rank.ts), so it's on the exact same
 * 0-130 scale a player already sees daily, not a separate invented
 * metric.
 *
 * "Next week's focus" is deliberately the lightweight, COMPUTED
 * version only (the neglected category) — not an interactive
 * goal-setting flow. That's the Core/Stretch split confirmed before
 * building this: a full planning flow needs unspecified mechanics
 * (freeform goal? tracked against next week? how?) that aren't in any
 * spec doc, so it stays deferred rather than invented here.
 */
export function buildWeeklyReport(
  days: DailyBreakdown[],
  weekStats: WeeklyStats,
): WeeklyReport {
  const score =
    days.length > 0
      ? days.reduce((sum, d) => sum + d.rank.score, 0) / days.length
      : 0

  const wins: string[] = []
  if (weekStats.bestDay) {
    wins.push(
      `Best day: ${weekStats.bestDay.dateKey} at ${Math.round(weekStats.bestDay.completionRate)}% complete (Rank ${weekStats.bestDay.rank.rank})`,
    )
  }
  if (weekStats.topCategory) {
    wins.push(`Most consistent category: ${weekStats.topCategory}`)
  }

  const weaknesses: string[] = []
  if (weekStats.weakestDay && weekStats.weakestDay.completionRate < 50) {
    weaknesses.push(
      `Lowest day: ${weekStats.weakestDay.dateKey} at ${Math.round(weekStats.weakestDay.completionRate)}% complete`,
    )
  }
  if (weekStats.neglectedCategory) {
    weaknesses.push(`Neglected category: ${weekStats.neglectedCategory}`)
  }

  const nextWeekFocus = weekStats.neglectedCategory
    ? `Focus for next week: ${weekStats.neglectedCategory} — it saw the fewest completions this week.`
    : 'Keep the same balance next week — no category was clearly neglected.'

  return { score, wins, weaknesses, nextWeekFocus }
}
