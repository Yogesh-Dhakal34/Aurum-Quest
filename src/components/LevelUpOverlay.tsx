import { motion } from 'motion/react'

type LevelUpOverlayProps = {
  newLevel: number
  onDismiss: () => void
}

/**
 * The single required animation moment for Phase 4 (GAMEPLAY.md §7).
 * Deliberately the ONLY full-screen celebratory moment in the app —
 * per UI_GUIDELINE.md, one purposeful animation beats five ambient
 * ones. Do not add a similar overlay for ordinary quest completion or
 * combo increments; those already have their own, smaller XP-feedback
 * treatment in QuestCard/PlayerCard.
 *
 * Visual conventions (bg-slate-950, staggered motion.div reveals,
 * fixed inset-0 z-50) are matched from OpeningExperience.tsx so this
 * doesn't introduce a second full-screen-overlay style into the app.
 * Gold is used here specifically because UI_GUIDELINE.md reserves that
 * token for rewards — this is the moment it exists for.
 */
function LevelUpOverlay({ newLevel, onDismiss }: LevelUpOverlayProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      role="dialog"
      aria-modal="true"
      aria-label={`Level up! You reached level ${newLevel}`}
    >
      <div className="text-center">
        <motion.p
          className="text-sm uppercase tracking-[0.4em] text-amber-400"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Level Up
        </motion.p>

        <motion.h1
          className="mt-4 text-7xl font-bold text-amber-300"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, type: 'spring' }}
        >
          {newLevel}
        </motion.h1>

        <motion.p
          className="mt-3 text-slate-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          Your legend grows stronger.
        </motion.p>

        <motion.button
          type="button"
          onClick={onDismiss}
          className="mt-8 rounded-lg bg-amber-400 px-6 py-3 font-semibold text-slate-950"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          Continue
        </motion.button>
      </div>
    </motion.div>
  )
}

export default LevelUpOverlay