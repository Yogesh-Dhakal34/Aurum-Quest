import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getPlayer } from '../services/playerService'
import { getCharacterStats } from '../services/characterService'
import { STAT_MAPPING } from '../lib/stats'
import { getCurrentTitle, getNextTitle } from '../lib/titles'
import { xpForLevel } from '../lib/xp'
import AvatarDisplay from '../components/AvatarDisplay'
import type { Player } from '../types/player'
import type { CharacterStats, StatName } from '../types/character'
import type { QuestCategory } from '../types/quest'

const STAT_LABELS: Record<StatName, string> = {
  strength: 'Strength',
  knowledge: 'Knowledge',
  discipline: 'Discipline',
  health: 'Health',
  focus: 'Focus',
  creativity: 'Creativity',
}

const STAT_ORDER: StatName[] = [
  'strength',
  'knowledge',
  'discipline',
  'health',
  'focus',
  'creativity',
]

/**
 * Reverse of STAT_MAPPING (lib/stats.ts): for a given stat, which quest
 * categories raise it. Derived rather than hand-maintained, so this
 * page can never drift out of sync with the actual mapping rules used
 * at quest-completion time.
 */
function categoriesForStat(stat: StatName): QuestCategory[] {
  return (Object.keys(STAT_MAPPING) as QuestCategory[]).filter((category) =>
    STAT_MAPPING[category].includes(stat),
  )
}

function LegendPage() {
  const { user } = useAuth()
  const [player, setPlayer] = useState<Player | null>(null)
  const [stats, setStats] = useState<CharacterStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const currentUser = user
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setLoadError(null)

      try {
        const [loadedPlayer, loadedStats] = await Promise.all([
          getPlayer(currentUser.id),
          getCharacterStats(currentUser.id),
        ])

        if (cancelled) return

        setPlayer(loadedPlayer)
        setStats(loadedStats)
      } catch (error) {
        if (cancelled) return
        setLoadError(
          error instanceof Error ? error.message : 'Failed to load your Legend.',
        )
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [user])

  if (isLoading) {
    return (
      <section className="mx-auto max-w-4xl">
        <p className="text-slate-400">Loading your Legend...</p>
      </section>
    )
  }

  if (loadError || !player) {
    return (
      <section className="mx-auto max-w-4xl">
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
          {loadError ?? 'No player profile found.'}
        </p>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-4xl">
      <p className="text-sm text-cyan-400">Aurum Quest</p>
      <h2 className="mt-1 text-3xl font-bold">Legend</h2>
      <p className="mt-2 text-slate-400">
        Who you are, and what you're building toward.
      </p>

      {/* Who am I? */}
      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <AvatarDisplay avatarSex={player.avatarSex} size="lg" />
        <div>
          <p className="text-sm text-cyan-400">{getCurrentTitle(player.level).name}</p>
          <h3 className="text-2xl font-bold">{player.name}</h3>
          <p className="mt-1 text-sm text-slate-400">Level {player.level}</p>
        </div>
      </div>

      {/* What am I good at? / What am I improving? */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-slate-200">Stats</h3>
        <p className="mt-1 text-sm text-slate-500">
          Every stat moves only when you complete a matching quest —
          nothing here can be grinded through empty clicks.
        </p>

        {!stats ? (
          <p className="mt-4 text-sm text-slate-500">
            Your stats will appear here once your account finishes
            onboarding.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {STAT_ORDER.map((stat) => {
              const categories = categoriesForStat(stat)

              return (
                <div
                  key={stat}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-medium text-slate-200">
                      {STAT_LABELS[stat]}
                    </span>
                    <span className="text-xl font-bold text-cyan-400">
                      {stats[stat]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Raised by {categories.join(' and ')} quests
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* What is my next milestone? — Phase 5.4 title ladder. */}
      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h3 className="text-lg font-semibold text-slate-200">Title</h3>
        {(() => {
          const next = getNextTitle(player.level)

          if (!next) {
            return (
              <p className="mt-2 text-sm text-slate-400">
                You've reached the top title, Aurum Vanguard.
              </p>
            )
          }

          return (
            <p className="mt-2 text-sm text-slate-400">
              Next: <span className="text-slate-200">{next.name}</span> at
              Level {next.minLevel} ({xpForLevel(next.minLevel).toLocaleString()}{' '}
              total XP)
            </p>
          )
        })()}
      </div>
    </section>
  )
}

export default LegendPage
