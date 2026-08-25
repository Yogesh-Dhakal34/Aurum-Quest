import type { Quest } from '../types/quest'

type QuestCardProps = {
  quest: Quest
  onComplete: (questId: string) => void
  isPending: boolean
}

function QuestCard({ quest, onComplete, isPending }: QuestCardProps) {  const progressPercentage = (quest.progress / quest.target) * 100

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-cyan-400">
            {quest.category}
          </p>

          <h3 className="mt-1 text-xl font-semibold">
            {quest.title}
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            {quest.description}
          </p>
        </div>

        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs">
          {quest.difficulty}
        </span>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex justify-between text-sm">
          <span>
            Progress: {quest.progress} / {quest.target}{' '}
            {quest.unit !== 'completion' && quest.unit}
          </span>

          <span className="text-cyan-400">
            +{quest.xpReward} XP
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-cyan-400"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <button
        type="button"
        disabled={quest.progress >= quest.target || isPending}
        onClick={() => onComplete(quest.id)}
        className="mt-5 rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
      >

      {quest.progress >= quest.target
        ? 'Completed'
        : isPending
          ? 'Saving...'
          : quest.unit === 'completion'
            ? 'Complete Quest'
            : 'Add Progress'}
      </button>
    </article>
  )
}

export default QuestCard