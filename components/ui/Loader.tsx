'use client'

import { useLoaderAnimation } from '@/components/ui/loader/useLoaderAnimation'
import { useLoader } from '@/lib/LoaderContext'

export default function Loader() {
  const { isLoading, progress, assetsReady } = useLoader()
  const { displayProgress, text1Ref, text2Ref } = useLoaderAnimation({
    assetsReady,
    isLoading,
    progress,
  })

  return (
    <div
      className="loader fixed inset-0 z-9999 flex h-dvh w-screen flex-col items-center justify-center text-white"
      style={{
        background:
          'linear-gradient(135deg, oklch(0% 0 0) 0%, oklch(12% 0.01 80) 50%, var(--color-bg) 100%)',
      }}
      role="status"
      aria-label={`Loading — ${displayProgress}%`}
      aria-hidden={!isLoading}
    >
      <div className="loader-content relative flex h-full w-full flex-col items-center justify-center">
        {/* Morph container */}
        <div
          className="relative w-full"
          style={{
            height: '80pt',
            filter: 'url(#threshold)',
          }}
        >
          <span
            ref={text1Ref}
            className="font-display absolute inline-block w-full text-center text-5xl font-semibold select-none md:text-[80pt]"
          />
          <span
            ref={text2Ref}
            className="font-display absolute inline-block w-full text-center text-5xl font-semibold select-none md:text-[80pt]"
          />
        </div>

        {/* Progress counter */}
        <div className="absolute right-8 bottom-8 md:right-12 md:bottom-10">
          <span className="font-mono text-sm text-white/60 tabular-nums md:text-base">
            [ {displayProgress}% ]
          </span>
        </div>
      </div>

      {/* SVG threshold filter — blur is kept inside the filter chain so mobile
          browsers don't have to handle a combined url()+blur() CSS filter,
          which iOS Safari drops silently. */}
      <svg
        style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
        aria-hidden="true"
      >
        <defs>
          <filter
            id="threshold"
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
            colorInterpolationFilters="sRGB"
          >
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140"
              result="thresholded"
            />
            <feGaussianBlur in="thresholded" stdDeviation="0.45" />
          </filter>
        </defs>
      </svg>
    </div>
  )
}
