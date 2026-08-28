import { AnimatePresence, motion } from 'motion/react'
import PlayerCard from '../components/PlayerCard'
import QuestCard from '../components/QuestCard'
import LevelUpOverlay from '../components/LevelUpOverlay'
import AchievementToast from '../components/AchievementToast'
import { useAuth } from '../hooks/useAuth'
import { getPlayer, updatePlayerProgress } from '../services/playerService'
import type { UpdatePlayerProgressResult } from '../services/playerService'
import {
  advanceQuestProgress,
  getLifetimeCompletionCount,
  getTodaysQuests,
} from '../services/questService'
import { checkAndUnlockAchievements } from '../services/achievementService'
import { calculateComboState, calculateStreakUpdate, calculateXpReward, getDisplayCombo } from '../lib/xp'
import { getGmtDateKey, getGmtYesterdayKey } from '../lib/date'
import type { Player } from '../types/player'
import type { Quest } from '../types/quest'
import type { AchievementDefinition } from '../types/achievement'
import { useEffect, useState } from 'react'

function QuestsPage() {
  const { user } = useAuth()

  const [player, setPlayer] = useState<Player | null>(null)
  const [quests, setQuests] = useState<Quest[]>([])
  const [xpFeedback, setXpFeedback] = useState<number | null>(null)
  // Set to the new level number when a completion crosses a level
  // threshold; null means no overlay should show. Deliberately separate
  // from xpFeedback — a level-up is the one moment that gets the
  // full-screen treatment, ordinary XP gain does not.
  const [levelUpTo, setLevelUpTo] = useState<number | null>(null)
  // Achievements newly unlocked by the most recent completion. An
  // array, not a single value — one completion can plausibly cross
  // multiple thresholds at once (e.g. hitting both 1,000 XP and a
  // level-up in the same click), and each gets its own toast.
  const [unlockedAchievements, setUnlockedAchievements] = useState<
    AchievementDefinition[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  // Tracks which quest IDs currently have an in-flight
  // advanceQuestProgress request. This is what actually prevents the
  // duplicate-XP race: a second click on the same quest while its first
  // request is still pending is rejected immediately, client-side,
  // before a second network call is even made — not just after the
  // fact via a disabled prop that only updates once the first response
  // returns.
  const [pendingQuestIds, setPendingQuestIds] = useState<Set<string>>(
    new Set(),
  )
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

  useEffect(() => {
    if (unlockedAchievements.length === 0) return

    const timer = setTimeout(() => {
      setUnlockedAchievements([])
    }, 4000)

    return () => clearTimeout(timer)
  }, [unlockedAchievements])

  // Note on daily reset: unlike the previous localStorage version, no
  // explicit "reset quests for a new day" step is needed here. Each
  // quest_progress row is scoped to a specific date_key (see
  // PHASE_3_DATABASE_ARCHITECTURE.md §3.4), so getTodaysQuests()
  // naturally returns progress: 0 for a new day — there's nothing to
  // reset, there's simply no row for today yet until a quest is advanced.
  // Combo state is unrelated to the daily reset — it's governed by its
  // own 2-hour step window, entirely inside src/lib/xp.ts (see that
  // file for the full reasoning).

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

    // This check must happen synchronously, before any `await`, so that
    // a second click arriving while the first request is still pending
    // sees the ID already in the set and bails out immediately — no
    // network call, no chance to race. Checking only via the `disabled`
    // prop on the button isn't enough: React doesn't re-render between
    // the first click's synchronous handler start and the point where
    // `await advanceQuestProgress` yields, so a very fast second click
    // could still fire before the button visually updates.
    if (pendingQuestIds.has(questId)) return

    const quest = quests.find((item) => item.id === questId)

    if (!quest || quest.progress >= quest.target) {
      return
    }

    setPendingQuestIds((current) => new Set(current).add(questId))

    let result: { newProgress: number; justCompleted: boolean }

    try {
      result = await advanceQuestProgress(user.id, quest)
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : 'Failed to update quest.',
      )
      setPendingQuestIds((current) => {
        const next = new Set(current)
        next.delete(questId)
        return next
      })
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
      setPendingQuestIds((current) => {
        const next = new Set(current)
        next.delete(questId)
        return next
      })
      return
    }

    // Phase 4.1: combo/XP math now lives in src/lib/xp.ts — this is the
    // actual "centralize" step. QuestsPage calls the engine instead of
    // computing the multiplier/reward itself.

    const now = new Date()
    const nextCombo = calculateComboState(
      player.comboCount,
      player.lastComboAt,
      now,
    )
    const earnedXp = calculateXpReward(quest.xpReward, nextCombo)

    // Phase 4.3: streak only updates on the FIRST completion of a given
    // day (per your call on how this should behave) — calculateStreakUpdate
    // itself is safe to call more than once in a day (it's a no-op if
    // lastStreakDate already equals today), but we still gate it here so
    // the intent is explicit at the call site, not just relying on the
    // function's internal guard.
    const todayKey = getGmtDateKey(now)
    const yesterdayKey = getGmtYesterdayKey(now)
    const isFirstCompletionToday = player.lastStreakDate !== todayKey

    const streakUpdate = isFirstCompletionToday
      ? calculateStreakUpdate(
          player.streak,
          player.longestStreak,
          player.lastStreakDate,
          todayKey,
          yesterdayKey,
        )
      : {
          streak: player.streak,
          longestStreak: player.longestStreak,
          lastStreakDate: player.lastStreakDate,
          streakChanged: false,
        }

    let progressResult: UpdatePlayerProgressResult

    try {
      progressResult = await updatePlayerProgress(user.id, player.level, {
        currentXp: player.currentXp + earnedXp,
        comboCount: nextCombo,
        lastComboAt: now.toISOString(),
        streak: streakUpdate.streak,
        longestStreak: streakUpdate.longestStreak,
        lastStreakDate: streakUpdate.lastStreakDate,
      })
    } catch (error) {
      // The quest_progress write above already succeeded and is not
      // rolled back here — see the end-of-turn report for why this is
      // flagged as a known limitation rather than silently handled.
      setLoadError(
        error instanceof Error ? error.message : 'Failed to save XP.',
      )
      setPendingQuestIds((current) => {
        const next = new Set(current)
        next.delete(questId)
        return next
      })
      return
    }

    setPlayer({
      ...player,
      currentXp: player.currentXp + earnedXp,
      comboCount: nextCombo,
      lastComboAt: now.toISOString(),
      level: progressResult.level,
      xpToNextLevel: progressResult.xpToNextLevel,
      streak: streakUpdate.streak,
      longestStreak: streakUpdate.longestStreak,
      lastStreakDate: streakUpdate.lastStreakDate,
    })
    setXpFeedback(earnedXp)

    if (progressResult.leveledUp) {
      setLevelUpTo(progressResult.level)
    }

    // Phase 4.7: check achievements after every successful completion.
    // Deliberately wrapped in its own try/catch, separate from the XP
    // save above — a failure here should not roll back or block a
    // quest completion the player already earned. Achievements are a
    // recognition layer on top of real progress, not a gate on it.
    try {
      const lifetimeCompletions = await getLifetimeCompletionCount(user.id)

      const newlyUnlocked = await checkAndUnlockAchievements(user.id, {
        questCompletionsTotal: lifetimeCompletions,
        streakLongest: streakUpdate.longestStreak,
        levelReached: progressResult.level,
        xpTotal: player.currentXp + earnedXp,
        comboReached: nextCombo,
      })

      if (newlyUnlocked.length > 0) {
        setUnlockedAchievements(newlyUnlocked)
      }
    } catch {
      // Silently skip — an achievement-check failure should never
      // surface as a user-facing error for what is, from the player's
      // perspective, a successful quest completion. Nothing to roll
      // back: unlocking is additive and re-checked on the next
      // completion anyway.
    }

    setPendingQuestIds((current) => {
      const next = new Set(current)
      next.delete(questId)
      return next
    })

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

  const displayCombo = getDisplayCombo(player.comboCount, player.lastComboAt)

  return (
    <>
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
            {displayCombo}x
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
              isPending={pendingQuestIds.has(quest.id)}
            />
          ))}
        </div>
      </section>
    ))}
  </div>
      </div>
    </section>

    <AnimatePresence>
      {levelUpTo !== null && (
        <LevelUpOverlay
          newLevel={levelUpTo}
          onDismiss={() => setLevelUpTo(null)}
        />
      )}
    </AnimatePresence>

    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2">
      <AnimatePresence>
        {unlockedAchievements.map((achievement) => (
          <AchievementToast key={achievement.id} achievement={achievement} />
        ))}
      </AnimatePresence>
    </div>
    </>
  )
}

export default QuestsPage