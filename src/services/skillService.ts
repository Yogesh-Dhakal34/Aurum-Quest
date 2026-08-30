import { supabase } from '../lib/supabase'
import { getSkillGainsForQuest, applySkillGains } from '../lib/skills'
import type { CharacterSkills } from '../types/skill'
import type { QuestCategory, QuestDifficulty } from '../types/quest'

type CharacterSkillsRow = {
  user_id: string
  study: number
  writing: number
  communication: number
  fitness: number
  reading: number
  learning: number
  problem_solving: number
  design: number
}

function toCharacterSkills(row: CharacterSkillsRow): CharacterSkills {
  return {
    study: row.study,
    writing: row.writing,
    communication: row.communication,
    fitness: row.fitness,
    reading: row.reading,
    learning: row.learning,
    problemSolving: row.problem_solving,
    design: row.design,
  }
}

/**
 * Loads the current user's character skills. Returns null if the row
 * doesn't exist yet — same "null means needs onboarding" convention as
 * getCharacterStats/getPlayer.
 */
export async function getCharacterSkills(
  userId: string,
): Promise<CharacterSkills | null> {
  const { data, error } = await supabase
    .from('character_skills')
    .select(
      'user_id, study, writing, communication, fitness, reading, learning, problem_solving, design',
    )
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return toCharacterSkills(data)
}

/**
 * Computes and persists the skill gains for one completed quest.
 * Mirrors characterService.applyQuestStatGains exactly.
 */
export async function applyQuestSkillGains(
  userId: string,
  current: CharacterSkills,
  category: QuestCategory,
  difficulty: QuestDifficulty,
): Promise<CharacterSkills> {
  const gains = getSkillGainsForQuest(category, difficulty)
  const next = applySkillGains(current, gains)

  const { error } = await supabase
    .from('character_skills')
    .update({
      study: next.study,
      writing: next.writing,
      communication: next.communication,
      fitness: next.fitness,
      reading: next.reading,
      learning: next.learning,
      problem_solving: next.problemSolving,
      design: next.design,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  if (error) throw error

  return next
}
