export type QuestDifficulty = 'Easy' | 'Medium' | 'Hard'

export type QuestCategory =
  | 'Study'
  | 'Health'
  | 'Work'
  | 'Personal'

export type QuestUnit = 'completion' | 'hours' | 'liters' | 'sessions'

export type Quest = {
  id: string
  title: string
  description: string
  category: QuestCategory
  difficulty: QuestDifficulty
  xpReward: number
  progress: number
  target: number
  unit: QuestUnit
}