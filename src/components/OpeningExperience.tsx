import { motion } from 'motion/react'
import { useSound } from '../hooks/useSound'
import Logo from './Logo'

type OpeningExperienceProps = {
  onComplete: () => void
}

function OpeningExperience({
  onComplete,
}: OpeningExperienceProps) {
  const { play } = useSound()

  // UI_GUIDELINE.md §9: no autoplay on first launch -- sound only ever
  // fires from this user gesture, never on mount. The transition-out
  // itself is also triggered from here, same click, no separate delay.
  function handleEnter() {
    play('enterGame')
    onComplete()
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center text-white"
      style={{
        background:
          'radial-gradient(circle at center, var(--color-brand-violet-dim) 0%, var(--color-brand-navy) 70%)',
      }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
        >
          <Logo size="lg" />
        </motion.div>

        <motion.p
          className="mt-6 font-body text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          Build your legend. One quest at a time.
        </motion.p>

        <motion.button
          type="button"
          onClick={handleEnter}
          className="mt-8 rounded-lg px-6 py-3 font-display font-semibold tracking-wide text-white"
          style={{ backgroundColor: 'var(--color-brand-violet)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          Enter Quest
        </motion.button>
      </div>
    </motion.div>
  )
}

export default OpeningExperience