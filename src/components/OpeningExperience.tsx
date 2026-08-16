import { motion } from 'motion/react'

type OpeningExperienceProps = {
  onComplete: () => void
}

function OpeningExperience({
  onComplete,
}: OpeningExperienceProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 text-white"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center">
        <motion.p
          className="text-sm uppercase tracking-[0.4em] text-cyan-400"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Welcome, Adventurer
        </motion.p>

        <motion.h1
          className="mt-4 text-5xl font-bold"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Aurum Quest
        </motion.h1>

        <motion.p
          className="mt-3 text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          Build your legend. One quest at a time.
        </motion.p>

        <motion.button
          type="button"
          onClick={onComplete}
          className="mt-8 rounded-lg bg-cyan-400 px-6 py-3 font-semibold text-slate-950"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          Enter Quest
        </motion.button>

        <button
          type="button"
          onClick={onComplete}
          className="mt-4 block w-full text-sm text-slate-500 hover:text-white"
        >
          Skip
        </button>
      </div>
    </motion.div>
  )
}

export default OpeningExperience