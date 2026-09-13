import { useState } from 'react'
import type { AiSuggestion, AiSuggestionType } from '../types/ai'

type AiSuggestionCardProps = {
  title: string
  type: AiSuggestionType
  suggestion: AiSuggestion | null
  isGenerating: boolean
  isResponding: boolean
  errorMessage: string | null
  onGenerate: () => void
  onRespond: (status: 'approved' | 'dismissed') => void
}

const TYPE_LABEL: Record<AiSuggestionType, string> = {
  daily_strategy: 'Daily Strategy',
  weekly_reflection: 'Weekly Reflection',
  quest_suggestion: 'Quest Suggestion',
  goal_breakdown: 'Goal Breakdown',
}

/**
 * Renders one of three states: no suggestion yet (generate button),
 * a pending suggestion awaiting approve/dismiss, or an already
 * responded-to suggestion (read-only). Approve/dismiss only ever
 * flips `status` via aiService.respondToSuggestion — this component
 * never itself touches quest/XP data (GAMEPLAY.md §17).
 */
function AiSuggestionCard({
  title,
  type,
  suggestion,
  isGenerating,
  isResponding,
  errorMessage,
  onGenerate,
  onRespond,
}: AiSuggestionCardProps) {
  const [showReasoning, setShowReasoning] = useState(false)

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-cyan-400">{title}</p>
        {suggestion && (
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs capitalize text-slate-400">
            {suggestion.status}
          </span>
        )}
      </div>

      {!suggestion && (
        <div className="mt-4">
          <p className="text-sm text-slate-400">{TYPE_LABEL[type]} hasn't been generated yet.</p>
          <button
            type="button"
            disabled={isGenerating}
            onClick={onGenerate}
            className="mt-3 rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating ? 'Thinking...' : 'Generate'}
          </button>
        </div>
      )}

      {suggestion && suggestion.status === 'dismissed' && (
        <p className="mt-3 text-sm text-slate-500">
          You dismissed today's {TYPE_LABEL[type].toLowerCase()}. Check back{' '}
          {type === 'daily_strategy' ? 'tomorrow' : 'next week'} for a new one.
        </p>
      )}

      {suggestion && suggestion.status !== 'dismissed' && (
        <div className="mt-4">
          <p className="whitespace-pre-line text-slate-200">{suggestion.content}</p>

          {suggestion.reasoning && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowReasoning((v) => !v)}
                className="text-xs text-slate-500 underline"
              >
                {showReasoning ? 'Hide reasoning' : 'Why this suggestion?'}
              </button>
              {showReasoning && (
                <p className="mt-2 text-xs text-slate-500">{suggestion.reasoning}</p>
              )}
            </div>
          )}

          {suggestion.status === 'pending' && (
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                disabled={isResponding}
                onClick={() => onRespond('approved')}
                className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Acknowledge
              </button>
              <button
                type="button"
                disabled={isResponding}
                onClick={() => onRespond('dismissed')}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}

      {errorMessage && <p className="mt-3 text-sm text-red-400">{errorMessage}</p>}
    </article>
  )
}

export default AiSuggestionCard