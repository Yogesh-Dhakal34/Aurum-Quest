import { supabase } from '../lib/supabase'
import { getStatGainsForQuest, applyStatGains } from '../lib/stats'
import type { CharacterStats } from '../types/character'
import type { QuestCategory, QuestDifficulty } from '../types/quest'

type CharacterStatsRow = {
  user_id: string
  strength: number
  knowledge: number
  discipline: number
  health: number
  focus: number
  creativity: number
}

function toCharacterStats(row: CharacterStatsRow): CharacterStats {
  return {
    strength: row.strength,
    knowledge: row.knowledge,
    discipline: row.discipline,
    health: row.health,
    focus: row.focus,
    creativity: row.creativity,
  }
}

/**
 * Loads the current user's character stats.
 *
 * Returns `null` if the row doesn't exist yet — same convention as
 * playerService.getPlayer: treat `null` as "needs onboarding," not as
 * an error. In practice this shouldn't happen post-onboarding, since
 * completeOnboarding creates the row, but callers should still handle
 * it rather than assume.
 */
export async function getCharacterStats(
  userId: string,
): Promise<CharacterStats | null> {
  const { data, error } = await supabase
    .from('character_stats')
    .select('user_id, strength, knowledge, discipline, health, focus, creativity')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return toCharacterStats(data)
}

/**
 * Computes and persists the stat gains for one completed quest.
 *
 * Deliberately narrow, mirroring updatePlayerProgress: takes the
 * current stats plus just the category/difficulty that just completed,
 * derives the gains via the pure lib/stats.ts engine, writes the
 * result, and returns it so the caller can update local state without
 * a second round trip.
 */
export async function applyQuestStatGains(
  userId: string,
  current: CharacterStats,
  category: QuestCategory,
  difficulty: QuestDifficulty,
): Promise<CharacterStats> {
  const gains = getStatGainsForQuest(category, difficulty)
  const next = applyStatGains(current, gains)

  const { error } = await supabase
    .from('character_stats')
    .update({
      strength: next.strength,
      knowledge: next.knowledge,
      discipline: next.discipline,
      health: next.health,
      focus: next.focus,
      creativity: next.creativity,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  if (error) throw error

  return next
}
