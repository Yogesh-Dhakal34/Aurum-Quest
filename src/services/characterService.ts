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

const DEFAULT_STATS_ROW = {
  strength: 0,
  knowledge: 0,
  discipline: 0,
  health: 0,
  focus: 0,
  creativity: 0,
}

/**
 * Loads the current user's character stats. Self-healing: if no row
 * exists (an account that predates this migration, or any future gap
 * of the same shape), creates one with default values right here
 * instead of returning null and requiring a manual SQL backfill —
 * fixed after this was hit for real with character_stats, then again
 * with character_skills and realm_state, all needing the same manual
 * fix. Still returns null in the rare case the self-heal insert itself
 * fails (e.g. a network error at that exact moment), so callers keep
 * the same null-handling contract as before — this only removes the
 * *permanent* gap, not error handling.
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
  if (data) return toCharacterStats(data)

  const { data: created, error: healError } = await supabase
    .from('character_stats')
    .upsert({ user_id: userId, ...DEFAULT_STATS_ROW })
    .select('user_id, strength, knowledge, discipline, health, focus, creativity')
    .maybeSingle()

  if (healError || !created) return null

  return toCharacterStats(created)
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
