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

/** Fine grain + displacement for SVG dust distortion (RevealText / SplitText) */
export const dust = {
  maxDisplacement: 54,
} as const

/** Lenis — tuned for smooth wheel + touch without feeling floaty */
export const lenis = {
  /** Lower = heavier / smoother follow (0.05–0.12 typical) */
  lerp: 0.06,
  wheelMultiplier: 1.05,
  touchMultiplier: 1.15,
  /** iOS: smooth touch scroll in sync with Lenis */
  syncTouch: true,
  syncTouchLerp: 0.07,
  /** Softer touch deceleration curve */
  touchInertiaExponent: 1.65,
  /** Cuts drift when navigating (anchor / route) */
  stopInertiaOnNavigate: true,
} as const

/**
 * Minimum time the loader stays on screen before revealing the page.
 * Tuned so the three-word morph (2.8 s total) completes and the final word
 * ("Operator") holds for ~200 ms before the reveal begins.
 */
export const LOADER_DURATION_MS = 3000
