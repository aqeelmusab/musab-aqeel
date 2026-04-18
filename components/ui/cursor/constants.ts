export type CursorState = 'default' | 'link' | 'project'

export const DOT_SIZE = 6
export const DOT_OFFSET = DOT_SIZE / 2

export const cursorDotSpring = {
  stiffness: 520,
  damping: 34,
  mass: 0.45,
} as const

export const cursorRingSpring = {
  stiffness: 210,
  damping: 26,
  mass: 0.7,
} as const

export function getCursorRingSize(state: CursorState) {
  switch (state) {
    case 'project':
      return 64
    case 'link':
      return 48
    case 'default':
      return 32
    default: {
      const exhaustiveCheck: never = state
      return exhaustiveCheck
    }
  }
}
