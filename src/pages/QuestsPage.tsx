import PlayerCard from '../components/PlayerCard'
import QuestCard from '../components/QuestCard'
import { player } from '../data/player'
import { todaysQuests } from '../data/quests'

function QuestsPage() {
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
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <PlayerCard player={player} />

        <div className="space-y-4">
          {todaysQuests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default QuestsPage