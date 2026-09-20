type LogoProps = {
  size?: 'sm' | 'lg'
  showWordmark?: boolean
}

/**
 * The brand mark UI_GUIDELINE.md §6 specified for the entry transition
 * since Phase 1, never built. Inline SVG rather than an image file,
 * matching this project's existing pattern (AvatarDisplay, all Phase 8
 * sounds) of synthesizing visuals/audio rather than shipping binary
 * assets -- scales perfectly at any size, no network request, no
 * asset pipeline to maintain.
 *
 * A crest/shield motif with a gem at center: the gem reads as both
 * "aurum" (gold, the currency of the reward system) and "quest"
 * (a thing found/earned), rather than literally illustrating either
 * word. Violet outline, gold gem -- the two primary tokens from
 * UI_GUIDELINE.md §2, deliberately not introducing a third accent
 * color for the one asset most likely to be screenshotted.
 */
function Logo({ size = 'sm', showWordmark = true }: LogoProps) {
  const iconSize = size === 'lg' ? 96 : 40

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        aria-label="Aurum Quest crest"
      >
        <path
          d="M50 6 L90 22 V50 C90 74 73 90 50 96 C27 90 10 74 10 50 V22 Z"
          stroke="var(--color-brand-violet)"
          strokeWidth="3"
          fill="var(--color-brand-navy)"
        />
        <path
          d="M50 16 L82 29 V50 C82 69 68 82 50 87 C32 82 18 69 18 50 V29 Z"
          stroke="var(--color-brand-violet)"
          strokeWidth="1"
          strokeOpacity="0.5"
          fill="none"
        />
        <path
          d="M50 34 L64 48 L50 68 L36 48 Z"
          fill="var(--color-brand-gold)"
          stroke="var(--color-brand-gold-bright)"
          strokeWidth="1.5"
        />
      </svg>

      {showWordmark && (
        <div className="text-center font-display leading-tight">
          <p
            className={
              size === 'lg' ? 'text-4xl tracking-[0.15em]' : 'text-lg tracking-[0.1em]'
            }
            style={{ color: 'var(--color-brand-gold)' }}
          >
            AURUM
          </p>
          <p
            className={size === 'lg' ? 'text-2xl tracking-[0.3em]' : 'text-sm tracking-[0.2em]'}
            style={{ color: 'var(--color-brand-violet)' }}
          >
            QUEST
          </p>
        </div>
      )}
    </div>
  )
}

export default Logo