import { motion } from 'motion/react'
import type { AchievementDefinition } from '../types/achievement'

type AchievementToastProps = {
  achievement: AchievementDefinition
}

/**
 * Phase 4.7 — Achievement unlock notification.
 *
 * Deliberately smaller/lighter than LevelUpOverlay — UI_GUIDELINE.md's
 * component inventory lists "Achievement unlock toast" and "Level-up
 * ceremony" as two distinct entries, not the same treatment reused. A
 * level-up gets the full-screen moment (GAMEPLAY.md §7's one required
 * animation); an achievement gets a corner toast. Stacking multiple
 * full-screen overlays for a multi-achievement unlock would violate
 * "one purposeful animation beats five ambient ones" — this stays out
 * of the way instead.
 */
function AchievementToast({ achievement }: AchievementToastProps) {
  return (
    <motion.div
      className="flex items-center gap-3 rounded-lg border border-amber-400/30 bg-slate-900/95 px-4 py-3 shadow-lg"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.3 }}
      role="status"
    >
      <span className="text-2xl" aria-hidden="true">
        🏆
      </span>
      <div>
        <p className="text-xs uppercase tracking-wide text-amber-400">
          Achievement Unlocked
        </p>
        <p className="font-semibold text-white">{achievement.title}</p>
      </div>
    </motion.div>
  )
}

export default AchievementToast