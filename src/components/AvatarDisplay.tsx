type AvatarDisplayProps = {
  avatarSex: 'male' | 'female'
  size?: 'sm' | 'lg'
}

/**
 * Phase 5.1: predefined male/female avatar presets.
 *
 * Deliberately SVG, not emoji — emoji glyphs render differently across
 * OS/browser combinations (a real risk for this spec's own "avatar
 * remains consistent across devices" test in ROADMAP.md), while inline
 * SVG with currentColor renders identically everywhere. Two fixed
 * presets only, per "start with predefined visual sets, do not build a
 * character creator yet."
 */
function AvatarDisplay({ avatarSex, size = 'sm' }: AvatarDisplayProps) {
  const dimensions = size === 'lg' ? 'h-24 w-24' : 'h-16 w-16'
  const iconSize = size === 'lg' ? 44 : 30

  return (
    <div
      className={`flex ${dimensions} items-center justify-center rounded-full bg-slate-800 text-cyan-400`}
    >
      {avatarSex === 'female' ? (
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-label="Female avatar"
        >
          <circle cx="12" cy="7" r="4" />
          <path d="M12 11 L8 19 L10 19 L11 22 L13 22 L14 19 L16 19 Z" />
        </svg>
      ) : (
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-label="Male avatar"
        >
          <circle cx="12" cy="7" r="4" />
          <path d="M7 21 L7 15 Q7 12 12 12 Q17 12 17 15 L17 21" />
        </svg>
      )}
    </div>
  )
}

export default AvatarDisplay
