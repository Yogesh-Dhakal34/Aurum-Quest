import type { Player } from '../types/player'

type PlayerCardProps = {
  player: Player
}

function PlayerCard({ player }: PlayerCardProps) {
  const xpPercentage = (player.currentXp / player.xpToNextLevel) * 100

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-2xl">
          🧙
        </div>

        <div>
          <p className="text-sm text-cyan-400">{player.title}</p>
          <h2 className="text-2xl font-bold">{player.name}</h2>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex justify-between text-sm">
          <span>Level {player.level}</span>
          <span>
            {player.currentXp} / {player.xpToNextLevel} XP
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-cyan-400"
            style={{ width: `${xpPercentage}%` }}
          />
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-400">
        🔥 {player.streak} day streak
      </p>
    </section>
  )
}

export default PlayerCard