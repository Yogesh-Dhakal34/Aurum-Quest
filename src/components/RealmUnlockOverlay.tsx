import { motion } from 'motion/react'
import type { RealmTier } from '../lib/realm'

type RealmUnlockOverlayProps = {
  tier: RealmTier
  onDismiss: () => void
}

/**
 * Phase 6.2's required unlock ceremony. Modeled directly on
 * LevelUpOverlay's motion/visual conventions (fixed inset-0 z-50,
 * bg-slate-950/95, staggered reveals, amber reward accent) so the app
 * doesn't grow a second full-screen-overlay style. UI_GUIDELINE.md
 * explicitly lists "level-up, realm unlock" as separate meaningful
 * events each earning one purposeful animation — this isn't a
 * violation of "one full-screen moment," it's the second of a small,
 * deliberate set.
 */
function RealmUnlockOverlay({ tier, onDismiss }: RealmUnlockOverlayProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      role="dialog"
      aria-modal="true"
      aria-label={`Realm tier unlocked: ${tier.building}`}
    >
      <div className="max-w-md px-6 text-center">
        <motion.p
          className="text-sm uppercase tracking-[0.4em] text-amber-400"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Realm Tier {tier.tier} Unlocked
        </motion.p>

        <motion.h1
          className="mt-4 text-5xl font-bold text-amber-300"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, type: 'spring' }}
        >
          {tier.building}
        </motion.h1>

        <motion.p
          className="mt-3 text-slate-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {tier.blurb}
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

export default RealmUnlockOverlay
