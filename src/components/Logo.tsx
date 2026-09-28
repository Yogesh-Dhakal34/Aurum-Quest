type LogoProps = {
  size?: 'sm' | 'lg'
  showWordmark?: boolean
}

/**
 * The Aurum Quest brand mark. Third design direction, chosen after a
 * long elimination (fantasy dagger/gem, heraldic shield, checkmark,
 * rank chevrons, map pin, AQ monogram, vortex rings, tiered pyramid)
 * where each option failed on its own specific ground: borrowed
 * another genre's visual identity, or only made sense with a caption.
 *
 * This is a mountain, because a summit is the most direct picture of
 * "quest" that needs no explanation. Two things make it specific
 * rather than generic:
 *
 *  - Twin peaks with an irregular silhouette. A single symmetric
 *    triangle reads as a pyramid or a warning sign; the smaller peak
 *    behind the summit is what makes it read as a natural mountain.
 *  - Gold is the sunlit face, not a snow cap. A gold tip reads as
 *    snow; a whole gold face reads as light on the summit, which is
 *    what "Aurum" is meant to say: the reward is the light you reach.
 *
 * Tested at 64/32/16px before choosing: the gold/violet split of the
 * summit survives at 16px, which the cap-style and path-style
 * variants did not. Honest limit: a mountain is not unique to this
 * brand. The ownable part is the color logic, not the shape.
 */
function Logo({ size = 'sm', showWordmark = true }: LogoProps) {
  const iconSize = size === 'lg' ? 96 : 40

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 8 100 86"
        fill="none"
        aria-label="Aurum Quest mark"
      >
        <polygon points="6,88 30,50 54,88" fill="var(--color-brand-violet-dim)" />
        <polygon points="64,14 30,88 60,88" fill="var(--color-brand-violet)" />
        <polygon points="64,14 60,88 94,88" fill="var(--color-brand-gold)" />
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
            style={{ color: '#e2e8f0' }}
          >
            QUEST
          </p>
        </div>
      )}
    </div>
  )
}

export default Logo