export type Player = {
  id: string
  name: string
  title: string
  level: number
  currentXp: number
  xpToNextLevel: number
  streak: number
  longestStreak: number
  lastStreakDate: string | null
  comboCount: number
  lastComboAt: string | null
  avatarUrl?: string
}