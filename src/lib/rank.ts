import { calculateComboState } from './xp'

export type DailyRank = 'S' | 'A' | 'B' | 'C' | 'D' | 'F'

export type RankResult = {
  rank: DailyRank
  score: number
  reason: string
}

/**
 * Phase 4.5 (Stretch, built retroactively ahead of Phase 7) — Daily
 * Rank formula. Confirmed with the product owner before implementing,
 * per GAMEPLAY.md §11's explicit instruction: "a formula that must be
 * defined here before it's implemented."
 *
 *   score = completionPercent (0-100)
 *         + (streakMaintained ? 15 : 0)
 *         + (comboAchieved ? 15 : 0)
 *   max possible = 130
 *
 * Completion is the dominant factor — you cannot rank up by clicking
 * fast, only by actually finishing quests, per GAMEPLAY.md's "rank
 * should reflect meaningful behavior, not click-count." Streak/combo
 * are meaningful but bounded bonuses (+15 each, not unbounded), same
 * "bonus never dominates" principle already enforced for combo XP
 * itself (lib/xp.ts).
 *
 * Bands are deliberately asymmetric: S requires high completion *and*
 * at least one bonus (100% completion alone only reaches A, 100 pts) —
 * S is meant to feel rare, the standard convention for a top letter
 * grade. F requires genuinely low effort (under ~12%), not just an
 * imperfect day, matching this app's supportive-not-punishing tone
 * used everywhere else (stats/skills/achievements never shame partial
 * effort).
 */
const RANK_BANDS: { rank: DailyRank; minScore: number }[] = [
  { rank: 'S', minScore: 115 },
  { rank: 'A', minScore: 90 },
  { rank: 'B', minScore: 65 },
  { rank: 'C', minScore: 40 },
  { rank: 'D', minScore: 15 },
  { rank: 'F', minScore: 0 },
]

function rankFromScore(score: number): DailyRank {
  for (const band of RANK_BANDS) {
    if (score >= band.minScore) return band.rank
  }
  return 'F'
}

function buildReason(
  completionPercent: number,
  streakMaintained: boolean,
  comboAchieved: boolean,
): string {
  const parts = [`${Math.round(completionPercent)}% of quests completed`]
  if (streakMaintained) parts.push('streak kept')
  if (comboAchieved) parts.push('combo achieved')
  return parts.join(', ')
}

/**
 * Computes a day's rank from its three inputs. Pure, deterministic, no
 * Supabase/React — same discipline as lib/xp.ts, lib/stats.ts,
 * lib/titles.ts. Callers (rankService.ts) are responsible for deriving
 * completionPercent/streakMaintained/comboAchieved from real data.
 */
export function calculateDailyRank(
  completionPercent: number,
  streakMaintained: boolean,
  comboAchieved: boolean,
): RankResult {
  const score =
    completionPercent + (streakMaintained ? 15 : 0) + (comboAchieved ? 15 : 0)

  return {
    rank: rankFromScore(score),
    score,
    reason: buildReason(completionPercent, streakMaintained, comboAchieved),
  }
}

/**
 * Determines whether a combo was actually achieved on a given day, by
 * replaying the real combo step logic (lib/xp.ts's
 * calculateComboState) across that day's completion timestamps in
 * order, starting fresh (comboCount 0, no prior completion) at the
 * start of the day.
 *
 * This deliberately reuses calculateComboState rather than
 * reimplementing the 2-hour-window logic a second time — one
 * definition of "what counts as a combo," used both live (XP bonus at
 * completion time) and retroactively (this rank derivation).
 *
 * Simplification: does not consider a combo step that started the
 * previous day and continued into this one — consistent with how this
 * app treats every other daily boundary (streaks, daily_state) as a
 * hard GMT cutoff, not a rolling window across days.
 */
export function deriveComboAchievedForDay(
  sortedCompletedAtIso: string[],
): boolean {
  let comboCount = 0
  let lastComboAt: string | null = null

  for (const completedAt of sortedCompletedAtIso) {
    comboCount = calculateComboState(comboCount, lastComboAt, new Date(completedAt))
    lastComboAt = completedAt

    if (comboCount >= 2) return true
  }

  return false
}
