import { supabase } from '../lib/supabase'
import {
  determineNewlyUnlockedAchievements,
  type AchievementStats,
} from '../lib/achievements'
import type { AchievementDefinition, UnlockedAchievement } from '../types/achievement'

type AchievementDefinitionRow = {
  id: string
  code: string
  title: string
  description: string
  check_type: AchievementDefinition['checkType']
  threshold: number
}

function toAchievementDefinition(row: AchievementDefinitionRow): AchievementDefinition {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    description: row.description,
    checkType: row.check_type,
    threshold: row.threshold,
  }
}

/**
 * Fetches the full achievement catalog. Shared/global, not scoped to a
 * user — same as questService.getTodaysQuests reading quest_definitions.
 */
export async function getAchievementCatalog(): Promise<AchievementDefinition[]> {
  const { data, error } = await supabase
    .from('achievement_definitions')
    .select('id, code, title, description, check_type, threshold')
    .eq('is_active', true)

  if (error) throw error

  return (data ?? []).map(toAchievementDefinition)
}

/**
 * Fetches the achievements a specific user has already unlocked.
 */
export async function getUnlockedAchievements(
  userId: string,
): Promise<UnlockedAchievement[]> {
  const { data, error } = await supabase
    .from('achievement_progress')
    .select(
      'unlocked_at, achievement_definitions(id, code, title, description, check_type, threshold)',
    )
    .eq('user_id', userId)

  if (error) throw error

  return (data ?? [])
    .filter(
      (row): row is typeof row & { achievement_definitions: AchievementDefinitionRow } =>
        row.achievement_definitions !== null,
    )
    .map((row) => ({
      ...toAchievementDefinition(row.achievement_definitions),
      unlockedAt: row.unlocked_at,
    }))
}

/**
 * Checks the given stats against the full catalog, persists any newly
 * met achievements, and returns just the ones that were newly unlocked
 * by THIS call — so the caller (QuestsPage) can show an unlock
 * notification only for genuinely new unlocks, not re-notify for
 * achievements unlocked in a previous session.
 *
 * Insert uses achievement_progress's unique(user_id, achievement_id)
 * constraint as the actual duplicate-unlock guard — same idempotency
 * pattern already used for quest_progress (PHASE_3_DATABASE_ARCHITECTURE.md
 * §3.4): even if this were somehow called twice concurrently for the
 * same achievement, the second insert would violate the unique
 * constraint rather than create a duplicate unlock.
 */
export async function checkAndUnlockAchievements(
  userId: string,
  stats: AchievementStats,
): Promise<AchievementDefinition[]> {
  const [catalog, unlocked] = await Promise.all([
    getAchievementCatalog(),
    getUnlockedAchievements(userId),
  ])

  const alreadyUnlockedIds = new Set(unlocked.map((achievement) => achievement.id))

  const newlyUnlocked = determineNewlyUnlockedAchievements(
    catalog,
    stats,
    alreadyUnlockedIds,
  )

  if (newlyUnlocked.length === 0) {
    return []
  }

  const { error } = await supabase.from('achievement_progress').insert(
    newlyUnlocked.map((achievement) => ({
      user_id: userId,
      achievement_id: achievement.id,
    })),
  )

  if (error) throw error

  return newlyUnlocked
}