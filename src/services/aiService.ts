import { supabase } from '../lib/supabase'
import { getGmtDateKey } from '../lib/date'
import type { AiSuggestion, AiSuggestionType } from '../types/ai'

type AiSuggestionRow = {
  id: string
  type: AiSuggestionType
  content: string
  reasoning: string | null
  metadata: Record<string, unknown> | null
  status: AiSuggestion['status']
  date_key: string
  created_at: string
  responded_at: string | null
}

function toAiSuggestion(row: AiSuggestionRow): AiSuggestion {
  return {
    id: row.id,
    type: row.type,
    content: row.content,
    reasoning: row.reasoning,
    metadata: row.metadata,
    status: row.status,
    dateKey: row.date_key,
    createdAt: row.created_at,
    respondedAt: row.responded_at,
  }
}

/**
 * Today's daily_strategy suggestion for this user, if one has already
 * been generated (regardless of status) — used to decide whether to
 * show a "generate" button or the existing suggestion.
 */
export async function getTodaysDailyStrategy(userId: string): Promise<AiSuggestion | null> {
  const { data, error } = await supabase
    .from('ai_suggestions')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'daily_strategy')
    .eq('date_key', getGmtDateKey())
    .maybeSingle()

  if (error) throw error
  return data ? toAiSuggestion(data) : null
}

/**
 * Most recent weekly_reflection suggestion generated in the last 7
 * days, if any.
 */
export async function getRecentWeeklyReflection(userId: string): Promise<AiSuggestion | null> {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7)

  const { data, error } = await supabase
    .from('ai_suggestions')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'weekly_reflection')
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data ? toAiSuggestion(data) : null
}

/**
 * Calls the ai-companion Edge Function to generate a new suggestion.
 * This is the ONLY path that creates an AiSuggestion — there is
 * deliberately no client-side insert function, since a client can't
 * be trusted to write its own "AI" output (see ai_suggestions RLS).
 * Throws if the Edge Function returns an error (including rate-limit
 * 429s — surface that message to the user rather than retrying).
 */
export async function requestAiSuggestion(type: AiSuggestionType): Promise<AiSuggestion> {
  const { data, error } = await supabase.functions.invoke('ai-companion', {
    body: { type },
  })

  if (error) throw error
  if (!data?.suggestion) throw new Error('AI companion returned no suggestion')

  return toAiSuggestion(data.suggestion as AiSuggestionRow)
}

/**
 * The only way a suggestion's status ever changes. Per GAMEPLAY.md
 * §17, approving a suggestion does NOT itself touch quest_progress or
 * player_state — it only records that the user acknowledged it. Any
 * future stretch-tier suggestion type that creates real quests must
 * do so through the normal quest-creation path after this call
 * succeeds, never inside it.
 */
export async function respondToSuggestion(
  suggestionId: string,
  status: 'approved' | 'dismissed',
): Promise<void> {
  const { error } = await supabase
    .from('ai_suggestions')
    .update({ status, responded_at: new Date().toISOString() })
    .eq('id', suggestionId)
    .eq('status', 'pending')

  if (error) throw error
}
