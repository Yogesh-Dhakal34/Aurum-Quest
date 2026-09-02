import type { DailyRank } from '../lib/rank'

type RankBadgeProps = {
  rank: DailyRank
  reason: string
}

/**
 * Phase 4.5 / UI_GUIDELINE.md's "Daily rank card (if built) | Letter
 * rank, one-line reason why." Deliberately small and reusable — used
 * both live on QuestsPage (today's rank) and on Phase 7's Progress
 * page (past days' ranks), same component either way.
 */
const RANK_COLORS: Record<DailyRank, string> = {
  S: 'text-amber-300 border-amber-400/40 bg-amber-400/10',
  A: 'text-cyan-300 border-cyan-400/40 bg-cyan-400/10',
  B: 'text-cyan-400 border-cyan-400/20 bg-cyan-400/5',
  C: 'text-slate-300 border-slate-700 bg-slate-800/40',
  D: 'text-slate-400 border-slate-800 bg-slate-900/40',
  F: 'text-slate-500 border-slate-800 bg-slate-900/40',
}

function RankBadge({ rank, reason }: RankBadgeProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg border text-lg font-bold ${RANK_COLORS[rank]}`}
      >
        {rank}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Today's Rank
        </p>
        <p className="text-sm text-slate-400">{reason}</p>
      </div>
    </div>
  )
}

export default RankBadge
