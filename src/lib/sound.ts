/**
 * Phase 8 — Audio. Every "meaningful sound" (quest claim/XP, level up,
 * achievement, realm unlock) is synthesized here via the Web Audio
 * API — no external sound files. This isn't a workaround for missing
 * assets; it's the deliberate choice made for this phase (real audio
 * files were considered and explicitly not used this pass).
 *
 * Each sound is a short sequence of oscillator tones with a simple
 * attack/decay envelope (GainNode), designed as a small musical phrase
 * rather than a single flat beep — an ascending interval reads as
 * "reward," a fuller chord reads as a bigger moment, matching how each
 * event's actual significance differs (a quest completion is common;
 * a realm unlock is rare).
 *
 * All triggers in this app fire from a user gesture (clicking
 * "complete quest," etc.), so there's no autoplay-policy conflict —
 * browsers block audio starting without user interaction, and nothing
 * here ever tries to play before one.
 */

export type ToneStep = {
  frequency: number
  startOffset: number
  duration: number
  type?: OscillatorType
}

let sharedContext: AudioContext | null = null

/**
 * Lazily creates a single shared AudioContext, reused across all
 * sounds rather than one per play — creating a new AudioContext per
 * call is wasteful and, on some browsers, rate-limited.
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null

  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext

  if (!AudioContextClass) return null

  if (!sharedContext) {
    sharedContext = new AudioContextClass()
  }

  // Some browsers create the context in a suspended state until a
  // user gesture resumes it. Every call site here is already inside a
  // gesture-triggered handler, so resuming is safe and expected.
  if (sharedContext.state === 'suspended') {
    void sharedContext.resume()
  }

  return sharedContext
}

/**
 * Plays a short sequence of tones with a basic attack/decay envelope
 * per note, scaled by `volume` (0-1). Silently does nothing if the Web
 * Audio API isn't available (very old browsers) or volume is 0 — sound
 * being unavailable should never break the app.
 */
function playTones(steps: ToneStep[], volume: number): void {
  if (volume <= 0) return

  const context = getAudioContext()
  if (!context) return

  const now = context.currentTime

  for (const step of steps) {
    const oscillator = context.createOscillator()
    const gain = context.createGain()

    oscillator.type = step.type ?? 'sine'
    oscillator.frequency.setValueAtTime(step.frequency, now + step.startOffset)

    const startTime = now + step.startOffset
    const endTime = startTime + step.duration

    // Quick attack, exponential-feeling decay (linear ramp to a tiny
    // value, since GainNode's exponential ramp can't target exactly 0)
    // — reads as a natural "ding" rather than an abrupt cutoff.
    gain.gain.setValueAtTime(0, startTime)
    gain.gain.linearRampToValueAtTime(volume * 0.3, startTime + 0.01)
    gain.gain.linearRampToValueAtTime(0.0001, endTime)

    oscillator.connect(gain)
    gain.connect(context.destination)

    oscillator.start(startTime)
    oscillator.stop(endTime)
  }
}

/**
 * Quest claim / XP reward — combined into one sound rather than two
 * overlapping ones, since both events fire at the exact same moment
 * in this app (completing a quest always awards XP in the same
 * action; there's no separate "claim" step). A quick two-note
 * ascending interval, short enough not to slow down rapid completions.
 */
export function playQuestClaimSound(volume: number): void {
  playTones(
    [
      { frequency: 587.33, startOffset: 0, duration: 0.12 }, // D5
      { frequency: 880, startOffset: 0.08, duration: 0.18 }, // A5
    ],
    volume,
  )
}

/**
 * Level up — a fuller three-note ascending phrase, matching the bigger
 * full-screen moment LevelUpOverlay already gives this event.
 */
export function playLevelUpSound(volume: number): void {
  playTones(
    [
      { frequency: 523.25, startOffset: 0, duration: 0.15 }, // C5
      { frequency: 659.25, startOffset: 0.1, duration: 0.15 }, // E5
      { frequency: 783.99, startOffset: 0.2, duration: 0.35 }, // G5
    ],
    volume,
  )
}

/**
 * Achievement unlocked — a distinct bell-like two-note interval (a
 * perfect fifth), deliberately different in character from the level-
 * up phrase so the two don't sound like the same event by ear.
 */
export function playAchievementSound(volume: number): void {
  playTones(
    [
      { frequency: 1046.5, startOffset: 0, duration: 0.25, type: 'triangle' }, // C6
      { frequency: 1568, startOffset: 0.05, duration: 0.3, type: 'triangle' }, // G6
    ],
    volume,
  )
}

/**
 * Realm unlock — the largest moment in the app (a new tier, potentially
 * once every several weeks), so this is the richest sound: a full
 * ascending triad plus octave, longer sustain than any other sound.
 */
export function playRealmUnlockSound(volume: number): void {
  playTones(
    [
      { frequency: 261.63, startOffset: 0, duration: 0.5, type: 'triangle' }, // C4
      { frequency: 329.63, startOffset: 0.12, duration: 0.5, type: 'triangle' }, // E4
      { frequency: 392, startOffset: 0.24, duration: 0.5, type: 'triangle' }, // G4
      { frequency: 523.25, startOffset: 0.36, duration: 0.6, type: 'triangle' }, // C5
    ],
    volume,
  )
}

/**
 * Entry transition — a rising four-note arpeggio (not a chord, unlike
 * realm unlock) meant to read as "arrival" rather than "reward": this
 * fires once per app session on tapping Enter Quest, not tied to any
 * in-game achievement, so it's deliberately a different character from
 * every other sound here rather than reusing the reward family.
 */
export function playEnterGameSound(volume: number): void {
  playTones(
    [
      { frequency: 261.63, startOffset: 0, duration: 0.18, type: 'triangle' }, // C4
      { frequency: 329.63, startOffset: 0.1, duration: 0.18, type: 'triangle' }, // E4
      { frequency: 392, startOffset: 0.2, duration: 0.18, type: 'triangle' }, // G4
      { frequency: 523.25, startOffset: 0.3, duration: 0.45, type: 'triangle' }, // C5
    ],
    volume,
  )
}