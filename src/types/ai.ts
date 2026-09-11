export type AiSuggestionType =
  | 'daily_strategy'
  | 'weekly_reflection'
  | 'quest_suggestion'
  | 'goal_breakdown'

export type AiSuggestionStatus = 'pending' | 'approved' | 'dismissed' | 'expired'

/**
 * A single AI-generated suggestion. Inert by design — nothing about
 * this shape can affect XP, quest completion, or history on its own.
 * `status` only ever changes via explicit user action (see
 * aiService.ts respondToSuggestion), never automatically.
 */
export type AiSuggestion = {
  id: string
  type: AiSuggestionType
  content: string
  reasoning: string | null
  metadata: Record<string, unknown> | null
  status: AiSuggestionStatus
  dateKey: string
  createdAt: string
  respondedAt: string | null
}
