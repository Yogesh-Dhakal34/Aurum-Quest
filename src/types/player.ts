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
  // Phase 5.1: collected at onboarding (profiles.avatar_sex) but never
  // read back until now — this is what lets AvatarDisplay pick the
  // right preset instead of falling back to a generic icon for every
  // user regardless of what they chose.
  avatarSex: 'male' | 'female'
}