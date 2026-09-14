type AvatarDisplayProps = {
  avatarSex: 'male' | 'female'
  avatarVariant?: number
  size?: 'sm' | 'lg'
}

/**
 * Phase 5.1: predefined avatar presets. Expanded in Phase 10 from 2
 * (one per avatarSex) to 4 (two per avatarSex) for the new Profile
 * page's avatar picker — avatarVariant is orthogonal to avatarSex
 * rather than replacing it, so existing call sites that only pass
 * avatarSex keep rendering exactly what they always have (variant
 * defaults to 1, identical to the original single design per sex).
 *
 * Deliberately SVG, not emoji — emoji glyphs render differently across
 * OS/browser combinations (a real risk for this spec's own "avatar
 * remains consistent across devices" test in ROADMAP.md), while inline
 * SVG with currentColor renders identically everywhere.
 */
function AvatarDisplay({ avatarSex, avatarVariant = 1, size = 'sm' }: AvatarDisplayProps) {
  const dimensions = size === 'lg' ? 'h-24 w-24' : 'h-16 w-16'
  const iconSize = size === 'lg' ? 44 : 30

  return (
    <div
      className={`flex ${dimensions} items-center justify-center rounded-full bg-slate-800 text-cyan-400`}
    >
      {avatarSex === 'female' ? (
        avatarVariant === 2 ? (
          <svg
            width={iconSize}
            height={iconSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-label="Female avatar, style 2"
          >
            <circle cx="12" cy="7" r="4" />
            <path d="M8 6 Q8 2 12 2 Q16 2 16 6 L16 8 Q16 11 12 11 Q8 11 8 8 Z" />
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
            aria-label="Female avatar, style 1"
          >
            <circle cx="12" cy="7" r="4" />
            <path d="M12 11 L8 19 L10 19 L11 22 L13 22 L14 19 L16 19 Z" />
          </svg>
        )
      ) : avatarVariant === 2 ? (
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-label="Male avatar, style 2"
        >
          <circle cx="12" cy="7" r="4" />
          <path d="M5 21 L5 17 Q5 12 12 12 Q19 12 19 17 L19 21" />
          <path d="M9 12 L7 9 M15 12 L17 9" />
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
          aria-label="Male avatar, style 1"
        >
          <circle cx="12" cy="7" r="4" />
          <path d="M7 21 L7 15 Q7 12 12 12 Q17 12 17 15 L17 21" />
        </svg>
      )}
    </div>
  )
}

export default AvatarDisplay