import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getPlayer } from '../services/playerService'
import { getCharacterStats } from '../services/characterService'
import { getCharacterSkills } from '../services/skillService'
import { getLifetimeCompletionCount } from '../services/questService'
import { getUnlockedAchievements } from '../services/achievementService'
import { getCurrentTier } from '../lib/realm'
import type { Player } from '../types/player'
import type { CharacterStats } from '../types/character'
import type { CharacterSkills } from '../types/skill'
import type { UnlockedAchievement } from '../types/achievement'
import type { View } from '../types/view'

type SummaryPageProps = {
  onNavigate: (view: View) => void
}

const STAT_LABELS: Record<keyof CharacterStats, string> = {
  strength: 'Strength',
  knowledge: 'Knowledge',
  discipline: 'Discipline',
  health: 'Health',
  focus: 'Focus',
  creativity: 'Creativity',
}

const SKILL_LABELS: Record<keyof CharacterSkills, string> = {
  study: 'Study',
  writing: 'Writing',
  communication: 'Communication',
  fitness: 'Fitness',
  reading: 'Reading',
  learning: 'Learning',
  problemSolving: 'Problem Solving',
  design: 'Design',
}

/**
 * The human-readable counterpart to Settings' JSON export. That export
 * exists for data portability (exact, lossless, machine-readable) --
 * this page exists so a person can actually look at their own stats
 * without opening a JSON file. Print-to-PDF via the browser rather
 * than a PDF-generation library, since browsers already do this
 * reliably and it avoids a real dependency for something this simple.
 */
function SummaryPage({ onNavigate }: SummaryPageProps) {
  const { user } = useAuth()

  const [player, setPlayer] = useState<Player | null>(null)
  const [stats, setStats] = useState<CharacterStats | null>(null)
  const [skills, setSkills] = useState<CharacterSkills | null>(null)
  const [lifetimeQuests, setLifetimeQuests] = useState(0)
  const [achievements, setAchievements] = useState<UnlockedAchievement[]>([])
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
        const [loadedPlayer, loadedStats, loadedSkills, loadedCount, loadedAchievements] =
          await Promise.all([
            getPlayer(currentUser.id),
            getCharacterStats(currentUser.id),
            getCharacterSkills(currentUser.id),
            getLifetimeCompletionCount(currentUser.id),
            getUnlockedAchievements(currentUser.id),
          ])

        if (cancelled) return

        setPlayer(loadedPlayer)
        setStats(loadedStats)
        setSkills(loadedSkills)
        setLifetimeQuests(loadedCount)
        setAchievements(loadedAchievements)
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : 'Failed to load your summary.')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [user])

  if (isLoading) {
    return <p className="text-slate-400">Loading your summary...</p>
  }

  if (loadError || !player || !stats || !skills) {
    return <p className="text-red-400">{loadError ?? 'No data found.'}</p>
  }

  const tier = getCurrentTier(player.currentXp)

  return (
    <section className="mx-auto max-w-2xl">
      <div className="print:hidden">
        <button
          type="button"
          onClick={() => onNavigate('settings')}
          className="text-sm text-slate-500 hover:text-slate-300"
        >
          &larr; Back to Settings
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="ml-4 rounded-lg bg-cyan-400/10 px-4 py-1.5 text-sm font-medium text-cyan-400 hover:bg-cyan-400/20"
        >
          Print / Save as PDF
        </button>
      </div>

      <p className="mt-4 text-sm text-cyan-400">Aurum Quest</p>
      <h2 className="mt-1 text-3xl font-bold">{player.name}'s Summary</h2>
      <p className="mt-1 text-slate-400">{player.title}</p>

      <div className="mt-6 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Level</p>
          <p className="mt-1 text-2xl font-bold text-white">{player.level}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Lifetime XP</p>
          <p className="mt-1 text-2xl font-bold text-cyan-400">{player.currentXp}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Longest Streak</p>
          <p className="mt-1 text-2xl font-bold text-white">{player.longestStreak}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Quests Completed</p>
          <p className="mt-1 text-2xl font-bold text-white">{lifetimeQuests}</p>
        </div>
      </div>

      <div className="mt-6 max-w-2xl rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">Realm</p>
        <p className="mt-2 text-sm text-slate-300">
          Tier {tier.tier} — {tier.building}
        </p>
        <p className="mt-1 text-sm text-slate-500">{tier.blurb}</p>
      </div>

      <div className="mt-6 grid max-w-2xl gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Character Stats</p>
          <ul className="mt-2 space-y-1 text-sm">
            {(Object.keys(STAT_LABELS) as Array<keyof CharacterStats>).map((key) => (
              <li key={key} className="flex justify-between text-slate-300">
                <span>{STAT_LABELS[key]}</span>
                <span className="font-medium text-white">{stats[key]}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Skills</p>
          <ul className="mt-2 space-y-1 text-sm">
            {(Object.keys(SKILL_LABELS) as Array<keyof CharacterSkills>).map((key) => (
              <li key={key} className="flex justify-between text-slate-300">
                <span>{SKILL_LABELS[key]}</span>
                <span className="font-medium text-white">{skills[key]}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 max-w-2xl rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Achievements ({achievements.length} unlocked)
        </p>
        {achievements.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">None yet — complete quests to unlock some.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm text-slate-300">
            {achievements.map((a) => (
              <li key={a.id}>{a.title}</li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-6 max-w-2xl text-xs text-slate-600 print:block hidden">
        Generated {new Date().toLocaleDateString()} from Aurum Quest.
      </p>
    </section>
  )
}

export default SummaryPage