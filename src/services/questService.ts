import { supabase } from '../lib/supabase'
import { getGmtDateKey } from '../lib/date'
import type { Quest } from '../types/quest'

/** Row shape as it exists in public.quest_definitions (the shared catalog). */
type QuestDefinitionRow = {
  id: string
  title: string
  description: string
  category: Quest['category']
  difficulty: Quest['difficulty']
  xp_reward: number
  target: number
  unit: Quest['unit']
}

/** Row shape as it exists in public.quest_progress (per-user, per-day). */
type QuestProgressRow = {
  id: string
  quest_definition_id: string
  progress: number
  target: number
  completed: boolean
  completed_at: string | null
}

/**
 * Loads today's quests for the given user: the shared catalog joined with
 * whatever progress rows exist for today's date_key. A quest with no
 * matching quest_progress row yet is presented at progress: 0 — this is
 * the expected state the first time a user sees a quest each day, not
 * an error.
 */
export async function getTodaysQuests(userId: string): Promise<Quest[]> {
  const todayKey = getGmtDateKey()

  const [{ data: definitions, error: definitionsError }, { data: progressRows, error: progressError }] =
    await Promise.all([
      supabase
        .from('quest_definitions')
        .select('id, title, description, category, difficulty, xp_reward, target, unit')
        .eq('is_active', true),
      supabase
        .from('quest_progress')
        .select('id, quest_definition_id, progress, target, completed, completed_at')
        .eq('user_id', userId)
        .eq('date_key', todayKey),
    ])

  if (definitionsError) throw definitionsError
  if (progressError) throw progressError

  const progressByQuestId = new Map<string, QuestProgressRow>(
    (progressRows ?? []).map((row) => [row.quest_definition_id, row]),
  )

  return (definitions ?? []).map((definition: QuestDefinitionRow) => {
    const progressRow = progressByQuestId.get(definition.id)

    return {
      id: definition.id,
      title: definition.title,
      description: definition.description,
      category: definition.category,
      difficulty: definition.difficulty,
      xpReward: definition.xp_reward,
      target: definition.target,
      unit: definition.unit,
      progress: progressRow?.progress ?? 0,
    }
  })
}

/**
 * Advances a quest's progress by one step for today, mirroring the exact
 * increment behavior QuestsPage.tsx already implements client-side
 * (Math.min(progress + 1, target)).
 *
 * Returns whether this call caused the quest to newly reach completion —
 * the caller uses this to decide whether to award XP, exactly as
 * QuestsPage.tsx's `questCompleted` check does today.
 *
 * Idempotency: relies on `quest_progress`'s
 * unique(user_id, quest_definition_id, date_key) constraint (see
 * PHASE_3_DATABASE_ARCHITECTURE.md §3.4) via upsert. Calling this again
 * after a quest is already at target simply re-upserts the same
 * progress/completed values — no duplicate row, no re-triggering
 * completion. The caller (QuestsPage) still checks progress >= target
 * before calling this at all, same as it does today; this is the second,
 * database-level line of defense, not the only one.
 */
export async function advanceQuestProgress(
  userId: string,
  quest: Quest,
): Promise<{ newProgress: number; justCompleted: boolean }> {
  const todayKey = getGmtDateKey()

  const { data: existing, error: fetchError } = await supabase
    .from('quest_progress')
    .select('progress, completed')
    .eq('user_id', userId)
    .eq('quest_definition_id', quest.id)
    .eq('date_key', todayKey)
    .maybeSingle()

  if (fetchError) throw fetchError

  const currentProgress = existing?.progress ?? 0

  // Already complete — do not advance further. Mirrors QuestsPage's
  // `if (!quest || quest.progress >= quest.target) return` guard.
  if (existing?.completed) {
    return { newProgress: currentProgress, justCompleted: false }
  }

  const newProgress = Math.min(currentProgress + 1, quest.target)
  const justCompleted = newProgress >= quest.target

  const { error: upsertError } = await supabase.from('quest_progress').upsert(
    {
      user_id: userId,
      quest_definition_id: quest.id,
      date_key: todayKey,
      progress: newProgress,
      target: quest.target,
      completed: justCompleted,
      completed_at: justCompleted ? new Date().toISOString() : null,
    },
    { onConflict: 'user_id,quest_definition_id,date_key' },
  )

  if (upsertError) throw upsertError

  return { newProgress, justCompleted }
}
