import type { Quest } from '../types/quest'

export const todaysQuests: Quest[] = [
  {
    id: 'study-01',
    title: 'Complete BIT study session',
    description: 'Focus on your current academic work.',
    category: 'Study',
    difficulty: 'Medium',
    xpReward: 100,
    progress: 0,
    target: 1,
  },
  {
    id: 'health-01',
    title: 'Complete a physical activity session',
    description: "Move your body and complete today's activity.",
    category: 'Health',
    difficulty: 'Easy',
    xpReward: 50,
    progress: 0,
    target: 1,
  },
  {
    id: 'personal-01',
    title: 'Complete one personal priority',
    description: 'Finish one meaningful task from your personal list.',
    category: 'Personal',
    difficulty: 'Hard',
    xpReward: 150,
    progress: 0,
    target: 1,
  },
]