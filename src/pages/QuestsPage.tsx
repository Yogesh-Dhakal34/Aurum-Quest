import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import PlayerCard from '../components/PlayerCard'
import QuestCard from '../components/QuestCard'
import { player as initialPlayer } from '../data/player'
import { todaysQuests as initialQuests } from '../data/quests'
import type { Player } from '../types/player'
import type { Quest } from '../types/quest'

function QuestsPage() {
  const [player, setPlayer] = useState<Player>(initialPlayer)
  const [quests, setQuests] = useState<Quest[]>(initialQuests)
  const [xpFeedback, setXpFeedback] = useState<number | null>(null)

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
    setQuests((currentQuests) =>
      currentQuests.map((quest) => {
        if (quest.id !== questId || quest.progress >= quest.target) {
          return quest
        }

        return {
          ...quest,
          progress: quest.target,
        }
      }),
    )

    const quest = quests.find((item) => item.id === questId)

    if (!quest || quest.progress >= quest.target) {
      return
    }

    setPlayer((currentPlayer) => ({
      ...currentPlayer,
      currentXp: currentPlayer.currentXp + quest.xpReward,
    }))
    setXpFeedback(quest.xpReward)

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