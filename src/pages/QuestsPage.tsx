import { AnimatePresence, motion } from 'motion/react'
import PlayerCard from '../components/PlayerCard'
import QuestCard from '../components/QuestCard'
import { useAuth } from '../hooks/useAuth'
import { getPlayer, updatePlayerProgress } from '../services/playerService'
import { advanceQuestProgress, getTodaysQuests } from '../services/questService'
import type { Player } from '../types/player'
import type { Quest } from '../types/quest'
import { useEffect, useState } from 'react'

function QuestsPage() {
  const { user } = useAuth()

  const [player, setPlayer] = useState<Player | null>(null)
  const [quests, setQuests] = useState<Quest[]>([])
  const [xpFeedback, setXpFeedback] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  // Bumped by the retry button to re-trigger the effect below without
  // needing loadData itself to be called from an event handler — keeps
  // data-fetching entirely inside the effect, per React's guidance that
  // an effect's body should own its own async work rather than call out
  // to a setState-calling function.
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!user) return

    const currentUser = user
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setLoadError(null)

      try {
        const [loadedPlayer, loadedQuests] = await Promise.all([
          getPlayer(currentUser.id),
          getTodaysQuests(currentUser.id),
        ])

        if (cancelled) return

        // A null player here means the user has an auth account but no
        // profiles/player_state row yet — expected before onboarding
        // (Phase 3.4) exists. Surface it plainly rather than crash on
        // `player.currentXp` below.
        if (!loadedPlayer) {
          setLoadError(
            'No player profile found. This should not happen after completing onboarding — try signing out and back in, or contact support if it persists.',
          )
          return
        }

        setPlayer(loadedPlayer)
        setQuests(loadedQuests)
      } catch (error) {
        if (cancelled) return
        setLoadError(
          error instanceof Error ? error.message : 'Failed to load quest data.',
        )
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [user, reloadToken])

  const retryLoad = () => setReloadToken((token) => token + 1)

  // Note on daily reset: unlike the previous localStorage version, no
  // explicit "reset quests for a new day" step is needed here. Each
  // quest_progress row is scoped to a specific date_key (see
  // PHASE_3_DATABASE_ARCHITECTURE.md §3.4), so getTodaysQuests()
  // naturally returns progress: 0 for a new day — there's nothing to
  // reset, there's simply no row for today yet until a quest is advanced.
  // Combo count, however, genuinely needs a same-day check before being
  // reused — that logic lives in handleCompleteQuest below, matching the
  // original comboWindow check exactly.

  const completedQuests = quests.filter(
    (quest) => quest.progress >= quest.target,
  ).length

  const todaysXp = quests
    .filter((quest) => quest.progress >= quest.target)
    .reduce((total, quest) => total + quest.xpReward, 0)

  const completionPercentage =
    quests.length === 0
      ? 0
      : Math.round((completedQuests / quests.length) * 100)

  const groupedQuests = quests.reduce<Record<string, Quest[]>>(
    (groups, quest) => {
      if (!groups[quest.category]) {
        groups[quest.category] = []
      }

      groups[quest.category].push(quest)

      return groups
    },
    {},
  )

  const handleCompleteQuest = async (questId: string) => {
    if (!user || !player) return

    const quest = quests.find((item) => item.id === questId)

    if (!quest || quest.progress >= quest.target) {
      return
    }

    let result: { newProgress: number; justCompleted: boolean }

    try {
      result = await advanceQuestProgress(user.id, quest)
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : 'Failed to update quest.',
      )
      return
    }

    setQuests((currentQuests) =>
      currentQuests.map((item) =>
        item.id === questId
          ? { ...item, progress: result.newProgress }
          : item,
      ),
    )

    if (!result.justCompleted) {
      return
    }

    // --- Combo/XP math below is unchanged from the previous
    // localStorage-based version. Only where the result is persisted
    // (updatePlayerProgress, a Supabase call, instead of setPlayer +
    // usePersistentState) has changed. ---

    const now = new Date()
    const comboWindow = 24 * 60 * 60 * 1000

    const currentCombo =
      player.lastComboAt &&
      now.getTime() - new Date(player.lastComboAt).getTime() <= comboWindow
        ? player.comboCount
        : 0

    const nextCombo = currentCombo + 1
    const comboMultiplier = 1 + (nextCombo - 1) * 0.1
    const earnedXp = Math.round(quest.xpReward * comboMultiplier)

    const updatedPlayer: Player = {
      ...player,
      currentXp: player.currentXp + earnedXp,
      comboCount: nextCombo,
      lastComboAt: now.toISOString(),
    }

    try {
      await updatePlayerProgress(user.id, {
        currentXp: updatedPlayer.currentXp,
        comboCount: updatedPlayer.comboCount,
        lastComboAt: updatedPlayer.lastComboAt,
      })
    } catch (error) {
      // The quest_progress write above already succeeded and is not
      // rolled back here — see the end-of-turn report for why this is
      // flagged as a known limitation rather than silently handled.
      setLoadError(
        error instanceof Error ? error.message : 'Failed to save XP.',
      )
      return
    }

    setPlayer(updatedPlayer)
    setXpFeedback(earnedXp)

    setTimeout(() => {
      setXpFeedback(null)
    }, 1500)
  }

  if (isLoading) {
    return (
      <section className="mx-auto max-w-6xl">
        <p className="text-slate-400">Loading your quests...</p>
      </section>
    )
  }

  if (loadError || !player) {
    return (
      <section className="mx-auto max-w-6xl">
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
          {loadError ?? 'Something went wrong loading your data.'}
        </p>
        <button
          type="button"
          onClick={retryLoad}
          className="mt-4 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400/50 hover:text-cyan-400"
        >
          Try Again
        </button>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-8">
        <p className="text-sm text-cyan-400">Aurum Quest</p>

        <h2 className="mt-1 text-3xl font-bold">
          Today's Quests
        </h2>

        <p className="mt-2 text-slate-400">
          Complete your quests and earn XP.
        </p>

        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2">
          <span className="text-sm text-slate-400">
            Quest Combo
          </span>

          <span className="font-bold text-cyan-400">
            {player.comboCount}x
          </span>
        </div>

        <div className="mt-6 max-w-md rounded-xl border border-slate-800 bg-slate-900/60 p-4">
  <div className="grid grid-cols-2 gap-4">
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">
        Today's XP
      </p>

      <p className="mt-1 text-2xl font-bold text-cyan-400">
        {todaysXp} XP
      </p>
    </div>

    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">
        Quests
      </p>

      <p className="mt-1 text-2xl font-bold">
        {completedQuests} / {quests.length}
      </p>
    </div>
  </div>

  <div className="mt-5 flex items-center justify-between">
    <span className="text-sm font-medium">
      Daily Progress
    </span>

    <span className="text-sm text-slate-400">
      {completionPercentage}%
    </span>
  </div>

  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
    <div
      className="h-full rounded-full bg-cyan-400 transition-all duration-300"
      style={{
        width: `${completionPercentage}%`,
      }}
    />
  </div>

  <p className="mt-2 text-xs text-slate-500">
    Complete today's quests to advance your progress.
  </p>
</div>
</div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
    <div className="relative">
        <PlayerCard player={player} />

        <AnimatePresence>
            {xpFeedback !== null && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: -10 }}
                    exit={{ opacity: 0, y: -25 }}
                    className="absolute right-4 top-4 font-bold text-cyan-400"
                >
                    +{xpFeedback} XP
                </motion.div>
            )}
        </AnimatePresence>
    </div>

        <div className="space-y-8">
  {Object.entries(groupedQuests).map(([category, categoryQuests]) => (
    <section key={category}>
      <h3 className="mb-3 text-lg font-semibold text-cyan-400">
        {category}
      </h3>

        <div className="space-y-4">
          {categoryQuests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onComplete={handleCompleteQuest}
            />
          ))}
        </div>
      </section>
    ))}
  </div>
      </div>
    </section>
  )
}

export default QuestsPage