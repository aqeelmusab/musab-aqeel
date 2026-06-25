export const ease = {
  out: [0.16, 1, 0.3, 1] as const,
  in: [0.7, 0, 0.84, 0] as const,
  layout: [0.32, 0.72, 0, 1] as const,
  overlayExit: [0.5, 0, 0.75, 0] as const,
}

export const duration = {
  base: 0.55,
  layout: 0.6,
  /** Full-screen mobile nav — must stay open until link stagger + footer can read */
  mobileMenuClipOpen: 1.12,
  mobileMenuClipClose: 0.92,
}

export const stagger = {
  tight: 0.04,
}

export const scroll = {
  headerOffset: 80,
  /** Scroll range while fade/slide scrubs (enter → fully visible) */
  revealStart: 'top 92%',
  revealEnd: 'top 68%',
  /**
   * Scrub lag in seconds (higher = smoother follow, more “weight”).
   * Used by RevealText and SplitText (scroll mode).
   */
  revealScrub: 0.5,
}

/**
 * Easing for `lenis.scrollTo` calls. Mirrors the site's ease.out character
 * (soft, heavy deceleration) and adds a ~1.2% overshoot past the target
 * before settling, so programmatic scrolls land with a subtle spring instead
 * of snapping flat. Use this whenever a scroll should feel like the rest of
 * the motion system — notably after the mobile menu closes.
 *
 * Equivalent to easeOutBack with c1 = 0.6 (back = 1.7158 by default;
 * dialed way down so the overshoot reads as premium, not springy).
 */
export const scrollEaseOut = (t: number): number => {
  const c1 = 0.6
  const c3 = c1 + 1
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2
}

/** Fine grain + displacement for SVG dust distortion (RevealText / SplitText) */
export const dust = {
  maxDisplacement: 54,
} as const

/**
 * Lenis — smooth wheel on desktop, native scroll on touch devices.
 *
 * `syncTouch` is deliberately off (the Lenis default): on mobile we let the
 * browser drive scroll, which preserves native iOS momentum, keeps pinch-zoom
 * and viewport resize behaviour intact, and — most importantly — leaves
 * nested scroll containers (e.g. the About terminal) working natively. Lenis
 * still tracks the real scroll position through its own scroll listener, so
 * GSAP ScrollTrigger integration is unaffected.
 */
export const lenis = {
  /** Lower = heavier / smoother follow (0.05–0.12 typical). */
  lerp: 0.06,
  /** Desktop wheel feel — 1.0 is native-equivalent. */
  wheelMultiplier: 1.05,
  /** Cuts drift when navigating (anchor / route). */
  stopInertiaOnNavigate: true,
} as const

/**
 * Total time the cosmetic intro stays on screen before the page reveal
 * begins. Tuned so the three-word morph (2.8 s total) completes and the
 * final word ("Operator") holds for ~200 ms before exit.
 *
 * This is a pure timer, not a "loader" — the site finishes mounting well
 * before this elapses.
 */
export const INTRO_DURATION_MS = 3000
