export type Player = {
  id: string
  name: string
  title: string
  level: number
  currentXp: number
  xpToNextLevel: number
  streak: number
  comboCount: number
  lastComboAt: string | null
  avatarUrl?: string
}