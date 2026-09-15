export type QuestDifficulty = 'Easy' | 'Medium' | 'Hard'

// Phase 10: revives GAMEPLAY.md §4's rarity bands, additive to (not a
// replacement for) difficulty -- difficulty still drives character
// stat gains, rarity is purely a reward-tier categorization.
export type QuestRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary'

export const RARITY_XP_RANGES: Record<QuestRarity, { min: number; max: number }> = {
  Common: { min: 10, max: 25 },
  Rare: { min: 30, max: 60 },
  Epic: { min: 70, max: 150 },
  Legendary: { min: 160, max: 500 },
}

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
  rarity: QuestRarity
  xpReward: number
  progress: number
  target: number
  unit: QuestUnit
}