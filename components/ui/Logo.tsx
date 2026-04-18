'use client'

import { useEffect, useRef, useCallback, type MouseEvent } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { gsap } from 'gsap'
import {
  logoFinalState,
  logoGlitchState1,
  logoGlitchState2,
  logoGlitchState3,
} from '@/lib/logo-paths'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

interface LogoProps {
  onClick?: (e: MouseEvent) => void
}

export default function Logo({ onClick: externalOnClick }: LogoProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const animatedRef = useRef(false)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (!svgRef.current || animatedRef.current) return
    animatedRef.current = true

    const mPath = svgRef.current.querySelector('#logo-path-M') as SVGPathElement
    const aPath = svgRef.current.querySelector('#logo-path-A') as SVGPathElement
    const markPath = svgRef.current.querySelector(
      '#logo-mark',
    ) as SVGPathElement

    if (!mPath || !aPath || !markPath) return

    if (reducedMotion) {
      mPath.setAttribute('d', logoFinalState.M)
      aPath.setAttribute('d', logoFinalState.A)
      markPath.setAttribute('d', logoFinalState.mark)
      return
    }

    mPath.setAttribute('d', logoGlitchState1.M)
    aPath.setAttribute('d', logoGlitchState1.A)
    markPath.setAttribute('d', logoGlitchState1.mark)

    const tl = gsap.timeline({ delay: 0.3 })

    tl.to([mPath, aPath, markPath], {
      duration: 0.06,
      ease: 'none',
      attr: {
        d: (_: number, el: SVGPathElement) => {
          if (el.id === 'logo-path-M') return logoGlitchState2.M
          if (el.id === 'logo-path-A') return logoGlitchState2.A
          return logoGlitchState2.mark
        },
      },
    })
      .to([mPath, aPath, markPath], {
        duration: 0.05,
        ease: 'none',
        attr: {
          d: (_: number, el: SVGPathElement) => {
            if (el.id === 'logo-path-M') return logoGlitchState3.M
            if (el.id === 'logo-path-A') return logoGlitchState3.A
            return logoGlitchState3.mark
          },
        },
      })
      .to([mPath, aPath, markPath], {
        duration: 0.85,
        ease: 'power3.out',
        attr: {
          d: (_: number, el: SVGPathElement) => {
            if (el.id === 'logo-path-M') return logoFinalState.M
            if (el.id === 'logo-path-A') return logoFinalState.A
            return logoFinalState.mark
          },
        },
      })
      .to(
        markPath,
        {
          scale: 1.04,
          transformOrigin: 'center center',
          duration: 2,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        },
        '-=0.2',
      )

    return () => {
      tl.kill()
    }
  }, [reducedMotion])

  const pathname = usePathname()

  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (externalOnClick) {
        externalOnClick(e)
        return
      }
      // Fallback when Logo is used outside Nav
      if (pathname === '/') {
        e.preventDefault()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    [pathname, externalOnClick],
  )

  return (
    <Link href="/" onClick={handleClick} aria-label="Musab Aqeel - Home">
      <svg
        ref={svgRef}
        viewBox="0 0 60 24"
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-auto"
        style={{ color: 'var(--color-text-primary)' }}
        aria-hidden="true"
      >
        <path
          id="logo-path-M"
          d={logoFinalState.M}
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
        <path
          id="logo-path-A"
          d={logoFinalState.A}
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
        <path
          id="logo-mark"
          d={logoFinalState.mark}
          fill="var(--color-accent)"
        />
      </svg>
    </Link>
  )
}
