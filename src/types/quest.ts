export type QuestDifficulty = 'Easy' | 'Medium' | 'Hard'

export type QuestCategory =
  | 'Study'
  | 'Health'
  | 'Work'
  | 'Personal'

export type Quest = {
  id: string
  title: string
  description: string
  category: QuestCategory
  difficulty: QuestDifficulty
  xpReward: number
  progress: number
  target: number
}