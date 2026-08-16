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

        <p className="mt-4 text-sm text-slate-400">
          Daily Progress: {completedQuests} / {quests.length}
        </p>
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

        <div className="space-y-4">
          {quests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onComplete={handleCompleteQuest}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default QuestsPage