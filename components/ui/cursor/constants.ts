export type CursorState = 'default' | 'link' | 'project' | 'text'

export const DOT_SIZE = 6
export const DOT_OFFSET = DOT_SIZE / 2

/** Follows the real cursor tightly so the dot reads as "the" cursor. */
export const cursorDotSpring = {
  stiffness: 560,
  damping: 36,
  mass: 0.4,
} as const

/** Loose enough to lag and breathe, tight enough not to feel draggy. */
export const cursorRingSpring = {
  stiffness: 220,
  damping: 28,
  mass: 0.65,
} as const

/** Used for width/height transitions between cursor states. */
export const cursorRingSizeSpring = {
  type: 'spring' as const,
  stiffness: 360,
  damping: 28,
  mass: 0.45,
}

/** Snappy press-down curve (shrink). */
export const cursorPressSpring = {
  type: 'spring' as const,
  stiffness: 620,
  damping: 22,
  mass: 0.4,
}

/** Release curve — slightly under-damped so the ring "pops" back. */
export const cursorReleaseSpring = {
  type: 'spring' as const,
  stiffness: 360,
  damping: 16,
  mass: 0.45,
}

/** Opacity fade in/out on visibility toggle. */
export const CURSOR_FADE_MS = 160

/** Ripple lifetime (ms) — single-element animation on click. */
export const CURSOR_RIPPLE_MS = 520

export function getCursorRingSize(state: CursorState) {
  switch (state) {
    case 'project':
      return 64
    case 'link':
      return 44
    case 'text':
    case 'default':
      return 30
    default: {
      const exhaustiveCheck: never = state
      return exhaustiveCheck
    }
  }
}
