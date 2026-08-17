import { AnimatePresence, motion } from 'motion/react'
import { getGmtDateKey } from '../lib/date'
import PlayerCard from '../components/PlayerCard'
import QuestCard from '../components/QuestCard'
import { usePersistentState } from '../hooks/usePersistentState'
import { player as initialPlayer } from '../data/player'
import { todaysQuests as initialQuests } from '../data/quests'
import type { Player } from '../types/player'
import type { Quest } from '../types/quest'
import { useEffect, useState } from 'react'

function isPlayer(value: unknown): value is Player {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'currentXp' in value &&
    'xpToNextLevel' in value &&
    'comboCount' in value &&
    'lastComboAt' in value
  )
}

function isQuestArray(value: unknown): value is Quest[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        'id' in item &&
        'progress' in item &&
        'target' in item &&
        'xpReward' in item,
    )
  )
}

function QuestsPage() {
  const [player, setPlayer] = usePersistentState<Player>(
    'player',
    initialPlayer,
    isPlayer,
  )
  const [quests, setQuests] = usePersistentState<Quest[]>(
    'quests',
    initialQuests,
    isQuestArray,
  )

    const [dailyDate, setDailyDate] = usePersistentState<string>(
      'dailyDate',
    getGmtDateKey(),
  )

    useEffect(() => {
    const today = getGmtDateKey()

    if (dailyDate === today) {
      return
    }

    setQuests(initialQuests)

    setPlayer((currentPlayer) => ({
      ...currentPlayer,
      comboCount: 0,
      lastComboAt: null,
    }))

    setDailyDate(today)
  }, [dailyDate, setPlayer, setQuests, setDailyDate])

  const [xpFeedback, setXpFeedback] = useState<number | null>(null)

    useEffect(() => {
    const today = getGmtDateKey()

    if (dailyDate === today) {
      return
    }

    setQuests(initialQuests)

    setPlayer((currentPlayer) => ({
      ...currentPlayer,
      comboCount: 0,
      lastComboAt: null,
    }))

    setDailyDate(today)
  }, [dailyDate, setPlayer, setQuests, setDailyDate])

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

const handleCompleteQuest = (questId: string) => {
  const quest = quests.find((item) => item.id === questId)

  if (!quest || quest.progress >= quest.target) {
    return
  }

  const nextProgress = Math.min(
    quest.progress + 1,
    quest.target,
  )

  const questCompleted = nextProgress >= quest.target

  setQuests((currentQuests) =>
    currentQuests.map((item) =>
      item.id === questId
        ? {
            ...item,
            progress: nextProgress,
          }
        : item,
    ),
  )

  if (!questCompleted) {
    return
  }

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

  setPlayer((currentPlayer) => ({
    ...currentPlayer,
    currentXp: currentPlayer.currentXp + earnedXp,
    comboCount: nextCombo,
    lastComboAt: now.toISOString(),
  }))

  setXpFeedback(earnedXp)

  setTimeout(() => {
    setXpFeedback(null)
  }, 1500)
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