'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'

interface HamburgerIconProps {
  isOpen: boolean
  onClick: () => void
}

export default function HamburgerIcon({ isOpen, onClick }: HamburgerIconProps) {
  const topRef = useRef<HTMLSpanElement>(null)
  const btmRef = useRef<HTMLSpanElement>(null)
  const prevOpen = useRef(false)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    if (!topRef.current || !btmRef.current) return
    if (prevOpen.current === isOpen) return
    prevOpen.current = isOpen

    if (tlRef.current) tlRef.current.kill()

    const tl = gsap.timeline()
    tlRef.current = tl

    if (isOpen) {
      tl
        .to(btmRef.current, { width: 22, duration: 0.15, ease: 'power2.in' }, 0)
        .to(topRef.current, { y: 5, duration: 0.15, ease: 'power2.in' }, 0)
        .to(btmRef.current, { y: -5, duration: 0.15, ease: 'power2.in' }, 0)
        .to(topRef.current, { rotation: 45, duration: 0.35, ease: 'back.out(1.4)' }, 0.15)
        .to(btmRef.current, { rotation: -45, duration: 0.35, ease: 'back.out(1.4)' }, 0.15)
    } else {
      tl
        .to(topRef.current, { rotation: 0, duration: 0.25, ease: 'power2.inOut' }, 0)
        .to(btmRef.current, { rotation: 0, duration: 0.25, ease: 'power2.inOut' }, 0)
        .to(topRef.current, { y: 0, duration: 0.2, ease: 'power2.out' }, 0.2)
        .to(btmRef.current, { y: 0, duration: 0.2, ease: 'power2.out' }, 0.2)
        .to(btmRef.current, { width: 13, duration: 0.25, ease: 'power2.out' }, 0.25)
    }

    return () => { tl.kill() }
  }, [isOpen])

  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
      className="relative z-50 flex items-center justify-end w-10 h-10 lg:hidden ml-auto"
    >
      {/* 22 × 11.5 hit area with absolute-positioned lines */}
      <div className="relative w-[22px] h-[11.5px]">
        <span
          ref={topRef}
          className="absolute top-0 right-0 block h-[1.5px] w-[22px] origin-center"
          style={{ backgroundColor: 'var(--color-text-primary)' }}
        />
        <span
          ref={btmRef}
          className="absolute bottom-0 right-0 block h-[1.5px] origin-center"
          style={{ backgroundColor: 'var(--color-text-primary)', width: 13 }}
        />
      </div>
    </button>
  )
}
