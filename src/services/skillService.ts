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

const DEFAULT_SKILLS_ROW = {
  study: 0,
  writing: 0,
  communication: 0,
  fitness: 0,
  reading: 0,
  learning: 0,
  problem_solving: 0,
  design: 0,
}

const SKILLS_SELECT =
  'user_id, study, writing, communication, fitness, reading, learning, problem_solving, design'

/**
 * Loads the current user's character skills. Self-healing — same
 * rationale and pattern as characterService.getCharacterStats: create
 * a default row on first read rather than returning a permanent null
 * that needs a manual SQL backfill.
 */
export async function getCharacterSkills(
  userId: string,
): Promise<CharacterSkills | null> {
  const { data, error } = await supabase
    .from('character_skills')
    .select(SKILLS_SELECT)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  if (data) return toCharacterSkills(data)

  const { data: created, error: healError } = await supabase
    .from('character_skills')
    .upsert({ user_id: userId, ...DEFAULT_SKILLS_ROW })
    .select(SKILLS_SELECT)
    .maybeSingle()

  if (healError || !created) return null

  return toCharacterSkills(created)
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
