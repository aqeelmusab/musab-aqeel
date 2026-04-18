import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scroll } from '@/lib/motion'

/** Pixels from max scroll to treat as “end of page” (Lenis limit). */
const PAGE_END_EPS = 8

/** Completion progress past which we snap immediately (no visible tween). */
const ALMOST_DONE = 0.995

type EndState =
  | { phase: 'idle' }
  | { phase: 'animating'; tween: gsap.core.Tween }
  | { phase: 'locked' }

const endBySt = new Map<ScrollTrigger, EndState>()

function getState(st: ScrollTrigger): EndState {
  return endBySt.get(st) ?? { phase: 'idle' }
}

/**
 * After smooth completion, pin scrub + animation so ScrollTrigger’s next
 * `update()` can’t pull progress back below 1.
 *
 * Uses `progress` (not `totalProgress`) on the timeline — tweening
 * `totalProgress` triggers GSAP’s “not eligible for reset” console spam.
 * ScrollTrigger’s scrub tween still uses `vars.totalProgress` internally.
 */
function applySnapPin(st: ScrollTrigger, anim: gsap.core.Animation): void {
  const scrubTween = st.getTween?.() as gsap.core.Tween | undefined

  if (scrubTween) {
    Object.assign(scrubTween.vars, { totalProgress: 1 })
    scrubTween.invalidate().restart()
    scrubTween.progress(1, false)
  }

  anim.progress(1, false)
}

/**
 * Scrubs can stop short of progress 1 when the document ends before the
 * trigger’s end is reachable. Near the bottom we first ease timeline
 * `progress` to 1 over `scroll.revealScrub`, then lock with the scrub tween.
 */
export function completeScrubAnimationsAtPageEnd(
  scrollPos: number,
  limit: number,
): void {
  const atBottom = limit > PAGE_END_EPS && scrollPos >= limit - PAGE_END_EPS

  if (!atBottom) {
    for (const st of ScrollTrigger.getAll()) {
      const s = endBySt.get(st)
      if (!s) continue
      if (s.phase === 'animating') {
        s.tween.kill()
      }
      endBySt.delete(st)
    }
    return
  }

  for (const st of ScrollTrigger.getAll()) {
    const scrub = st.vars?.scrub
    if (scrub === false || scrub == null) continue

    const anim = st.animation
    if (!anim) continue

    const progress = anim.progress()
    const state = getState(st)

    if (progress >= ALMOST_DONE) {
      endBySt.set(st, { phase: 'locked' })
      applySnapPin(st, anim)
      continue
    }

    if (state.phase === 'locked') {
      applySnapPin(st, anim)
      continue
    }

    if (state.phase === 'animating') {
      continue
    }

    const tween = gsap.to(anim, {
      progress: 1,
      duration: scroll.revealScrub,
      ease: 'sine.out',
      overwrite: 'auto',
      onComplete: () => {
        const cur = endBySt.get(st)
        if (cur?.phase !== 'animating' || cur.tween !== tween) return
        endBySt.set(st, { phase: 'locked' })
        applySnapPin(st, anim)
      },
    })

    endBySt.set(st, { phase: 'animating', tween })
  }

  // Do not call ScrollTrigger.update() here — it would re-derive scrub
  // progress from scroll and undo the pin before the next paint.
}
