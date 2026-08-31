import type { Player } from '../types/player'
import AvatarDisplay from './AvatarDisplay'
import { getCurrentTitle } from '../lib/titles'
import { levelFromXp } from '../lib/xp'

type PlayerCardProps = {
  player: Player
}

function PlayerCard({ player }: PlayerCardProps) {
  // Bug fix (found while scoping Phase 6, which needed to confirm what
  // player.currentXp actually represents): currentXp is lifetime
  // cumulative XP — it only ever grows, never resets per level. The
  // old code divided that raw cumulative number by xpToNextLevel (the
  // SIZE of the current level's span, not a cumulative threshold),
  // which is only ever correct at level 1 — past that the bar showed
  // a meaningless, usually-over-100% value. Recomputing fresh via
  // levelFromXp gives the correct IN-LEVEL progress (xpInLevel /
  // xpToNextLevel), same derive-don't-trust-stored-snapshot pattern
  // used everywhere else in this codebase (titles, stats, skills).
  const { xpInLevel, xpToNextLevel } = levelFromXp(player.currentXp)
  const xpPercentage = (xpInLevel / xpToNextLevel) * 100
  // Phase 5.4: the displayed title is always computed fresh from level
  // via the title ladder, not read from the static profiles.title
  // column (which only ever held its onboarding default and never
  // updated). This is what makes titles actually "unlock from
  // milestones" instead of being a fixed piece of text forever.
  const currentTitle = getCurrentTitle(player.level)

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center gap-4">
        <AvatarDisplay avatarSex={player.avatarSex} />

        <div>
          <p className="text-sm text-cyan-400">{currentTitle.name}</p>
          <h2 className="text-2xl font-bold">{player.name}</h2>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex justify-between text-sm">
          <span>Level {player.level}</span>
          <span>
            {xpInLevel} / {xpToNextLevel} XP
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