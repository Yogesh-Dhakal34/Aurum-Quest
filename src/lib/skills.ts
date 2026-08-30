import type { QuestCategory, QuestDifficulty } from '../types/quest'
import type { SkillName, CharacterSkills } from '../types/skill'

/**
 * Phase 5.5 skill mapping. Deliberately category-level, not per-quest —
 * per your call, kept simple for now and open to revisiting after the
 * project's initial ship. Same shape as STAT_MAPPING in lib/stats.ts:
 * every category maps to one or more skills, no skill is orphaned.
 *
 * Final 8-skill list, confirmed: Study, Writing, Communication,
 * Fitness, Reading, Learning, Problem Solving, Design (Programming
 * dropped in favor of a broader "Learning" skill per your last call).
 */
export const SKILL_MAPPING: Record<QuestCategory, SkillName[]> = {
  Study: ['study', 'reading'],
  Health: ['fitness'],
  Work: ['problemSolving', 'design'],
  Personal: ['writing', 'communication', 'learning'],
}

/**
 * Per-mapped-skill gain by difficulty. Same scale as
 * GAIN_BY_DIFFICULTY in lib/stats.ts (+1/+2/+3) — kept identical
 * deliberately, so a Hard quest means the same thing everywhere in the
 * app, not a different scale per system.
 */
const GAIN_BY_DIFFICULTY: Record<QuestDifficulty, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
}

export type SkillGain = {
  skill: SkillName
  amount: number
}

/**
 * Given a completed quest's category and difficulty, returns the gain
 * for every skill mapped to that category. Pure and deterministic, no
 * side effects — same contract as getStatGainsForQuest.
 */
export function getSkillGainsForQuest(
  category: QuestCategory,
  difficulty: QuestDifficulty,
): SkillGain[] {
  const skills = SKILL_MAPPING[category]
  const amount = GAIN_BY_DIFFICULTY[difficulty]

  return skills.map((skill) => ({ skill, amount }))
}

/**
 * Applies a set of skill gains to an existing CharacterSkills object,
 * returning a new object rather than mutating the input.
 */
export function applySkillGains(
  current: CharacterSkills,
  gains: SkillGain[],
): CharacterSkills {
  const next = { ...current }

  for (const gain of gains) {
    next[gain.skill] = next[gain.skill] + gain.amount
  }

  return next
}
