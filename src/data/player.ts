import type { Player } from '../types/player'

export const player: Player = {
  id: 'player-01',
  name: 'Adventurer',
  title: 'Quest Initiate',
  level: 1,
  currentXp: 120,
  xpToNextLevel: 500,
  streak: 3,
  longestStreak: 3,
  lastStreakDate: null,
  comboCount: 0,
  lastComboAt: null,
}