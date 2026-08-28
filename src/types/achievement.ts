export type AchievementCheckType =
  | 'quest_completions_total'
  | 'streak_longest'
  | 'level_reached'
  | 'xp_total'
  | 'combo_reached'

export type AchievementDefinition = {
  id: string
  code: string
  title: string
  description: string
  checkType: AchievementCheckType
  threshold: number
}

export type UnlockedAchievement = AchievementDefinition & {
  unlockedAt: string
}