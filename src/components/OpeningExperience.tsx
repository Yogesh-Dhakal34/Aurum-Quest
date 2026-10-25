import { useCallback, useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useSound } from '../hooks/useSound'
import Logo from './Logo'

type OpeningExperienceProps = {
  onComplete: () => void
}

/**
 * Cinematic title strike. Inspired by the "title written in light"
 * openings of Shadow Fight 2, Mobile Legends and Honor of Kings, built
 * as original work in the Aurum Quest violet/gold identity.
 *
 * Timeline (seconds):
 *   0.00  dark screen, embers rise
 *   0.25  first slash cuts across, mountain mark ignites
 *   0.55  A-U-R-U-M strike in, one letter every 0.22s, each with a
 *         flash, a blur-to-sharp snap and a gold glow
 *   1.95  QUEST pulls in from wide tracking, second slash crosses
 *         the first, one soft flash, whole title recoils
 *   2.35  gold shine sweeps across the title
 *   2.70  tagline fades in
 *   3.00  Enter Quest button appears (intro is now "ready")
 *
 * UX rules kept from UI_GUIDELINE.md section 9:
 *  - No autoplay sound. Sound fires only from the Enter click.
 *  - The intro is skippable. A tap, click, Enter or Space during the
 *    animation jumps straight to the finished state. A second press
 *    enters the app.
 *  - prefers-reduced-motion shows the finished state with no motion.
 *  - Only one full-screen flash, capped at 35% opacity.
 */

const READY_AT_MS = 3000
const GOLD = '212, 175, 55'
const GOLD_BRIGHT = '245, 215, 110'

const LETTERS = ['A', 'U', 'R', 'U', 'M']
const LETTER_START = 0.55
const LETTER_STEP = 0.22
const QUEST_AT = 1.95
const SHINE_AT = 2.35

// Deterministic pseudo-random so renders stay pure (no Math.random).
function seeded(index: number, salt: number): number {
  const x = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}

const EMBERS = Array.from({ length: 22 }, (_, i) => ({
  left: seeded(i, 1) * 100,
  size: 2 + seeded(i, 2) * 3,
  rise: 220 + seeded(i, 3) * 360,
  duration: 3.2 + seeded(i, 4) * 3,
  delay: seeded(i, 5) * 3,
  drift: (seeded(i, 6) - 0.5) * 80,
}))

function Embers() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {EMBERS.map((e, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${e.left}%`,
            bottom: -8,
            width: e.size,
            height: e.size,
            backgroundColor: `rgb(${GOLD_BRIGHT})`,
            boxShadow: `0 0 8px 2px rgba(${GOLD}, 0.6)`,
          }}
          initial={{ opacity: 0, y: 0, x: 0 }}
          animate={{ opacity: [0, 0.9, 0], y: -e.rise, x: e.drift }}
          transition={{
            duration: e.duration,
            delay: e.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}

function Slash({
  angle,
  at,
  reverse = false,
}: {
  angle: number
  at: number
  reverse?: boolean
}) {
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-1/2 h-[3px] w-[160vmax] -translate-x-1/2 -translate-y-1/2"
      style={{
        rotate: angle,
        background: `linear-gradient(90deg, transparent 0%, rgba(${GOLD}, 0) 20%, #ffffff 48%, rgb(${GOLD_BRIGHT}) 52%, rgba(${GOLD}, 0) 80%, transparent 100%)`,
        boxShadow: `0 0 18px 4px rgba(${GOLD_BRIGHT}, 0.55)`,
      }}
      initial={{ x: reverse ? '60%' : '-60%', opacity: 0 }}
      animate={{
        x: reverse ? ['60%', '-60%'] : ['-60%', '60%'],
        opacity: [0, 1, 0],
      }}
      transition={{ duration: 0.45, delay: at, ease: [0.2, 0.8, 0.2, 1] }}
      aria-hidden="true"
    />
  )
}

function Title({ instant }: { instant: boolean }) {
  const t = (delay: number, duration = 0.45) =>
    instant
      ? { duration: 0 }
      : { duration, delay, ease: [0.16, 1, 0.3, 1] as const }

  return (
    <motion.div
      className="relative"
      animate={instant ? undefined : { x: [0, -5, 4, -2, 0], y: [0, 3, -2, 1, 0] }}
      transition={{ duration: 0.4, delay: QUEST_AT }}
    >
      <h1 className="sr-only">Aurum Quest</h1>

      <div className="relative overflow-hidden px-4 py-2" aria-hidden="true">
        <div className="flex justify-center font-display text-6xl font-bold leading-none sm:text-8xl md:text-9xl">
          {LETTERS.map((letter, i) => {
            const delay = LETTER_START + i * LETTER_STEP
            return (
              <span key={i} className="relative inline-block px-[0.04em]">
                {!instant && (
                  <motion.span
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `radial-gradient(circle, rgba(${GOLD_BRIGHT}, 0.9) 0%, transparent 65%)`,
                    }}
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: [0, 1, 0], scale: [0.4, 2.2, 2.6] }}
                    transition={{ duration: 0.5, delay }}
                  />
                )}
                <motion.span
                  className="relative inline-block"
                  style={{ WebkitTextStroke: `1px rgb(${GOLD_BRIGHT})` }}
                  initial={
                    instant
                      ? false
                      : {
                          opacity: 0,
                          scale: 2.2,
                          y: -24,
                          skewX: -14,
                          filter: 'blur(14px)',
                          color: `rgba(${GOLD}, 0)`,
                          textShadow: `0 0 0px rgba(${GOLD_BRIGHT}, 0)`,
                        }
                  }
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    skewX: 0,
                    filter: 'blur(0px)',
                    color: `rgba(${GOLD}, 1)`,
                    textShadow: `0 0 18px rgba(${GOLD_BRIGHT}, 0.55)`,
                  }}
                  transition={t(delay, 0.4)}
                >
                  {letter}
                </motion.span>
              </span>
            )
          })}
        </div>

        <motion.p
          className="mt-3 text-center font-display text-xl font-semibold sm:text-3xl md:text-4xl"
          style={{ color: '#e2e8f0' }}
          initial={
            instant
              ? false
              : { opacity: 0, letterSpacing: '1.2em', filter: 'blur(6px)' }
          }
          animate={{ opacity: 1, letterSpacing: '0.55em', filter: 'blur(0px)' }}
          transition={t(QUEST_AT, 0.55)}
        >
          QUEST
        </motion.p>

        {!instant && (
          <motion.div
            className="pointer-events-none absolute inset-y-0 w-1/4"
            style={{
              background: `linear-gradient(100deg, transparent, rgba(${GOLD_BRIGHT}, 0.55), transparent)`,
              mixBlendMode: 'screen',
              skewX: -18,
            }}
            initial={{ left: '-30%', opacity: 0 }}
            animate={{ left: '130%', opacity: [0, 1, 1, 0] }}
            transition={{ duration: 0.8, delay: SHINE_AT, ease: 'easeInOut' }}
          />
        )}
      </div>
    </motion.div>
  )
}

function OpeningExperience({ onComplete }: OpeningExperienceProps) {
  const { play } = useSound()
  const reduceMotion = useReducedMotion()
  const [skipped, setSkipped] = useState(false)
  const [ready, setReady] = useState(false)

  const instant = skipped || !!reduceMotion
  const isReady = ready || instant

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), READY_AT_MS)
    return () => window.clearTimeout(id)
  }, [])

  // UI_GUIDELINE.md section 9: no autoplay. Sound only fires from a
  // user gesture, here the Enter click or key press.
  const handleEnter = useCallback(() => {
    play('enterGame')
    onComplete()
  }, [play, onComplete])

  const handleSkip = useCallback(() => {
    setSkipped(true)
    setReady(true)
  }, [])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Escape') return
      event.preventDefault()
      if (isReady) handleEnter()
      else handleSkip()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isReady, handleEnter, handleSkip])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden text-white"
      style={{
        background:
          'radial-gradient(ellipse at center, var(--color-brand-violet-dim) 0%, var(--color-brand-navy) 62%, #000 100%)',
      }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.45 }}
      onClick={() => {
        if (!isReady) handleSkip()
      }}
    >
      <Embers />

      {!instant && (
        <>
          <Slash angle={-16} at={0.25} />
          <Slash angle={14} at={QUEST_AT - 0.05} reverse />
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundColor: `rgb(${GOLD_BRIGHT})` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.35, 0] }}
            transition={{ duration: 0.45, delay: QUEST_AT }}
            aria-hidden="true"
          />
        </>
      )}

      <div className="relative z-10 flex flex-col items-center px-4 text-center">
        <motion.div
          initial={instant ? false : { opacity: 0, y: 12, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={instant ? { duration: 0 } : { duration: 0.6, delay: 0.3 }}
        >
          <Logo size="lg" showWordmark={false} />
        </motion.div>

        <div className="mt-4">
          <Title key={instant ? 'instant' : 'play'} instant={instant} />
        </div>

        <motion.p
          className="mt-6 font-body text-slate-300"
          initial={instant ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={instant ? { duration: 0 } : { duration: 0.6, delay: 2.7 }}
        >
          Build your legend. One quest at a time.
        </motion.p>

        <div className="mt-8 h-14">
          {isReady && (
            <motion.button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                handleEnter()
              }}
              className="rounded-lg px-8 py-3 font-display text-lg font-semibold tracking-widest text-white"
              style={{ backgroundColor: 'var(--color-brand-violet)' }}
              initial={{ opacity: 0, y: 8 }}
              animate={{
                opacity: 1,
                y: 0,
                boxShadow: [
                  '0 0 16px rgba(124, 58, 237, 0.45)',
                  '0 0 32px rgba(124, 58, 237, 0.85)',
                  '0 0 16px rgba(124, 58, 237, 0.45)',
                ],
              }}
              transition={{
                opacity: { duration: 0.4 },
                y: { duration: 0.4 },
                boxShadow: { duration: 2, repeat: Infinity },
              }}
              whileTap={{ scale: 0.96 }}
              autoFocus
            >
              ENTER QUEST
            </motion.button>
          )}
        </div>

        {!isReady && (
          <p className="absolute -bottom-16 font-body text-xs tracking-wide text-slate-500">
            Tap to skip
          </p>
        )}
      </div>
    </motion.div>
  )
}

export default OpeningExperience