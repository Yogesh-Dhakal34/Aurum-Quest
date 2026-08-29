export type StatName =
  | 'strength'
  | 'knowledge'
  | 'discipline'
  | 'health'
  | 'focus'
  | 'creativity'

export type CharacterStats = Record<StatName, number>

/**
 * Which stat(s) most recently increased and by how much, plus the quest
 * title/category that caused it — the data LegendPage needs to answer
 * ROADMAP.md 5.2/GAMEPLAY.md §14's "users must be able to explain why a
 * stat changed."
 */
export type StatGainReason = {
  stat: StatName
  amount: number
  questTitle: string
  category: string
  at: string
}
