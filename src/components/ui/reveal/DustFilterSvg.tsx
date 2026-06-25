'use client'

import type { RefObject } from 'react'

/** Hidden defs: fractal noise → displacement map for a dusty, particulate warp. */
export default function DustFilterSvg({
  id,
  displacementRef,
}: {
  id: string
  displacementRef: RefObject<SVGFEDisplacementMapElement | null>
}) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: decorative filter-defs container, hidden from the a11y tree
    <svg
      className="pointer-events-none fixed top-0 left-0 h-0 w-0 opacity-0"
      aria-hidden
    >
      <defs>
        <filter
          id={id}
          x="-25%"
          y="-25%"
          width="150%"
          height="150%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.055 0.12"
            numOctaves="4"
            seed="7"
            result="noise"
          />
          <feDisplacementMap
            ref={displacementRef}
            in="SourceGraphic"
            in2="noise"
            scale={0}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  )
}
