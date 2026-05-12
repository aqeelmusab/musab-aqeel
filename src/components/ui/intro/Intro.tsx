'use client'

import AnimatedCounter from '@/components/ui/intro/AnimatedCounter'
import { useIntroAnimation } from '@/components/ui/intro/useIntroAnimation'
import { useIntro } from '@/lib/contexts/IntroContext'

/**
 * Cosmetic intro screen. Stays on screen for 3 s while the three-word morph
 * plays, then the exit choreography (`useMainWrapperReveal`) lifts it off.
 * No real loading logic — the site is fully mounted well before this exits.
 *
 * The gooey "threshold" morph is produced by the SVG filter defined in
 * `IntroFilterDefs`, which is mounted at the body root (not inside this
 * fixed container) so WebKit resolves the `url(#intro-threshold)` reference
 * reliably on iOS. `transform: translateZ(0)` nudges Safari onto its
 * compositing fast path for the filtered layer.
 */
export default function Intro() {
  const { isVisible } = useIntro()
  const { displayProgress, text1Ref, text2Ref } = useIntroAnimation({
    isVisible,
  })

  return (
    <div
      className="intro fixed inset-0 z-9999 flex h-dvh w-screen flex-col items-center justify-center text-white"
      style={{
        background:
          'linear-gradient(135deg, oklch(0% 0 0) 0%, oklch(12% 0.01 80) 50%, var(--color-bg) 100%)',
      }}
      role="status"
      aria-label="Loading site"
      aria-hidden={!isVisible}
    >
      <div className="intro-content relative flex h-full w-full flex-col items-center justify-center">
        {/* Morph container — SVG alpha threshold filter, iOS-safe because
            defs live at the body root. No solid background, no blend mode:
            threshold operates on alpha, so the container renders with a
            transparent backdrop and the intro gradient shows through
            wherever the thresholded alpha is zero. */}
        <div
          className="relative w-full"
          style={{
            height: '80pt',
            filter: 'url(#intro-threshold)',
            transform: 'translateZ(0)',
            willChange: 'filter',
          }}
        >
          <span
            ref={text1Ref}
            className="font-display absolute inline-block w-full text-center text-5xl font-semibold select-none md:text-[80pt]"
            style={{ willChange: 'filter, opacity' }}
          />
          <span
            ref={text2Ref}
            className="font-display absolute inline-block w-full text-center text-5xl font-semibold select-none md:text-[80pt]"
            style={{ willChange: 'filter, opacity' }}
          />
        </div>

        {/* Cosmetic progress counter — SplitText-style entry, driven by
            elapsed time. */}
        <div className="absolute right-8 bottom-8 md:right-12 md:bottom-10">
          <AnimatedCounter value={displayProgress} />
        </div>
      </div>
    </div>
  )
}
