import type { QuestCategory, QuestDifficulty } from '../types/quest'
import type { CharacterStats, StatName } from '../types/character'

/**
 * Phase 5.3 stat mapping. Every real QuestCategory maps to exactly two
 * of the six stats — no category is unmapped, no stat is orphaned.
 *
 * Grounded in the app's actual QuestCategory type ('Study' | 'Health' |
 * 'Work' | 'Personal'), not ROADMAP.md's illustrative examples
 * (workout/study/journaling/project), which don't correspond to a real
 * category in this codebase. Two of the four map directly onto the
 * roadmap's own examples:
 *   - Study    -> Knowledge, Focus   (matches "Study quest" exactly)
 *   - Health   -> Strength, Health   (matches "Workout quest" exactly)
 * The other two are the closest honest fit for categories the roadmap
 * didn't name directly:
 *   - Work     -> Discipline, Creativity  (stands in for "Project
 *     completion -> Discipline, Career-adjacent stat" — there's no
 *     Career stat in the six, so Creativity is the nearest adjacent one)
 *   - Personal -> Discipline, Focus       (generalizes "Journaling
 *     quest -> Discipline" to the broader Personal category)
 */
export const STAT_MAPPING: Record<QuestCategory, [StatName, StatName]> = {
  Study: ['knowledge', 'focus'],
  Health: ['strength', 'health'],
  Work: ['discipline', 'creativity'],
  Personal: ['discipline', 'focus'],
}

/**
 * Per-mapped-stat gain by difficulty. Both stats a category maps to
 * gain the same amount — no reason for one to outpace the other within
 * a single completion. Scales with difficulty (per your call) so a
 * Hard quest visibly signals more growth than an Easy one, keeping
 * difficulty meaningful outside of XP too.
 */
const GAIN_BY_DIFFICULTY: Record<QuestDifficulty, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
}

export type StatGain = {
  stat: StatName
  amount: number
}

/**
 * Given a completed quest's category and difficulty, returns the two
 * stat gains it produces. Pure and deterministic — same inputs always
 * produce the same output, no randomness, no side effects. This is
 * what keeps stat growth "explainable" (ROADMAP.md 5.3 test) rather
 * than a black box.
 */
export function getStatGainsForQuest(
  category: QuestCategory,
  difficulty: QuestDifficulty,
): StatGain[] {
  const [statA, statB] = STAT_MAPPING[category]
  const amount = GAIN_BY_DIFFICULTY[difficulty]

  return [
    { stat: statA, amount },
    { stat: statB, amount },
  ]
}

/**
 * Applies a set of stat gains to an existing CharacterStats object,
 * returning a new object (does not mutate the input) — same
 * "pure function, caller decides what to do with the result" shape as
 * xp.ts's calculateXpReward/calculateComboState.
 */
export function applyStatGains(
  current: CharacterStats,
  gains: StatGain[],
): CharacterStats {
  const next = { ...current }

  for (const gain of gains) {
    next[gain.stat] = next[gain.stat] + gain.amount
  }

  return next
}
