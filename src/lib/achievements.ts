import type { AchievementCheckType, AchievementDefinition } from '../types/achievement'

/**
 * Phase 4.7 — Achievements.
 *
 * The stats an achievement check needs. Deliberately a flat, explicit
 * shape rather than reusing Player/Quest types directly — this keeps
 * the achievement engine decoupled from exactly how those types are
 * shaped, and makes it obvious at a glance which five numbers actually
 * drive achievement unlocking.
 */
export type AchievementStats = {
  questCompletionsTotal: number
  streakLongest: number
  levelReached: number
  xpTotal: number
  comboReached: number
}

function statForCheckType(
  checkType: AchievementCheckType,
  stats: AchievementStats,
): number {
  switch (checkType) {
    case 'quest_completions_total':
      return stats.questCompletionsTotal
    case 'streak_longest':
      return stats.streakLongest
    case 'level_reached':
      return stats.levelReached
    case 'xp_total':
      return stats.xpTotal
    case 'combo_reached':
      return stats.comboReached
  }
}

/**
 * Given the full catalog of achievement definitions, a player's current
 * stats, and the set of achievement IDs already unlocked, returns the
 * definitions that should be newly unlocked right now.
 *
 * Pure and side-effect free — does not touch Supabase, does not mark
 * anything unlocked itself. Callers (achievementService) are
 * responsible for persisting the result. Already-unlocked achievements
 * are excluded from the result even if their threshold is still met,
 * since unlocking is a one-time event per GAMEPLAY.md §15 — permanent
 * once granted, not something to re-fire on every check.
 */
export function determineNewlyUnlockedAchievements(
  definitions: AchievementDefinition[],
  stats: AchievementStats,
  alreadyUnlockedIds: Set<string>,
): AchievementDefinition[] {
  return definitions.filter((definition) => {
    if (alreadyUnlockedIds.has(definition.id)) {
      return false
    }

    const currentValue = statForCheckType(definition.checkType, stats)
    return currentValue >= definition.threshold
  })
}