'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react'
import type Lenis from 'lenis'

import { useLenisRef } from '@/lib/lenis-context'

import {
  ACTIVE_SECTION_THRESHOLD,
  HEADER_SCROLL_RELEASE,
  HEADER_SCROLL_THRESHOLD,
  HOME_PATH,
  MOBILE_MENU_RESTART_DELAY_MS,
  NAV_LINKS,
} from './constants'

type LenisRef = RefObject<Lenis | null>

function setBodyScrollLocked(locked: boolean) {
  document.body.style.overflow = locked ? 'hidden' : ''
}

function getFocusableElements(menuEl: HTMLDivElement | null) {
  return menuEl
    ? Array.from(
        menuEl.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      )
    : []
}

function resolveActiveSection(pathname: string, isReadyToAnimate: boolean) {
  if (!isReadyToAnimate || pathname !== HOME_PATH) {
    return ''
  }

  const atBottom =
    window.scrollY + window.innerHeight >=
    document.documentElement.scrollHeight - 2

  if (atBottom) {
    return NAV_LINKS[NAV_LINKS.length - 1].href
  }

  const firstSection = document.querySelector<HTMLElement>(NAV_LINKS[0].href)
  if (
    !firstSection ||
    firstSection.getBoundingClientRect().top > ACTIVE_SECTION_THRESHOLD
  ) {
    return ''
  }

  let currentSection = ''

  for (const link of NAV_LINKS) {
    const section = document.querySelector<HTMLElement>(link.href)
    if (!section) {
      continue
    }

    if (section.getBoundingClientRect().top <= ACTIVE_SECTION_THRESHOLD) {
      currentSection = link.href
      continue
    }

    break
  }

  return currentSection
}

export function useHeaderScrolledState() {
  const [scrolled, setScrolled] = useState(false)
  const lenisRef = useLenisRef()

  useEffect(() => {
    function readScrollY(lenis: Lenis | null): number {
      return lenis ? lenis.scroll : window.scrollY
    }

    function update() {
      const y = readScrollY(lenisRef.current)
      setScrolled((prev) =>
        prev ? y > HEADER_SCROLL_RELEASE : y > HEADER_SCROLL_THRESHOLD,
      )
    }

    update()

    window.addEventListener('scroll', update, { passive: true })

    let unsubscribeLenis: (() => void) | undefined
    let secondaryRaf = 0
    const initialRaf = requestAnimationFrame(() => {
      const attach = () => {
        const lenis = lenisRef.current
        if (lenis) {
          unsubscribeLenis = lenis.on('scroll', update)
        }
      }

      attach()
      if (!unsubscribeLenis) {
        secondaryRaf = requestAnimationFrame(attach)
      }
    })

    return () => {
      cancelAnimationFrame(initialRaf)
      if (secondaryRaf) {
        cancelAnimationFrame(secondaryRaf)
      }
      window.removeEventListener('scroll', update)
      unsubscribeLenis?.()
    }
  }, [lenisRef])

  return scrolled
}

export function useActiveSectionState(
  pathname: string,
  isReadyToAnimate: boolean,
) {
  const [activeSection, setActiveSection] = useState('')
  const isProgrammaticScrollRef = useRef(false)

  const getActiveSection = useCallback(() => {
    return resolveActiveSection(pathname, isReadyToAnimate)
  }, [isReadyToAnimate, pathname])

  const syncActiveSection = useCallback(() => {
    if (isProgrammaticScrollRef.current) {
      return
    }

    setActiveSection(getActiveSection())
  }, [getActiveSection])

  const forceSyncActiveSection = useCallback(() => {
    isProgrammaticScrollRef.current = false
    setActiveSection(getActiveSection())
  }, [getActiveSection])

  const beginProgrammaticScroll = useCallback(() => {
    isProgrammaticScrollRef.current = true
  }, [])

  const finishProgrammaticScroll = useCallback(() => {
    isProgrammaticScrollRef.current = false
    setActiveSection(getActiveSection())
  }, [getActiveSection])

  const resetActiveSection = useCallback(() => {
    isProgrammaticScrollRef.current = false
    setActiveSection('')
  }, [])

  useEffect(() => {
    if (!isReadyToAnimate || pathname !== HOME_PATH) {
      return
    }

    const frame = window.requestAnimationFrame(syncActiveSection)

    window.addEventListener('scroll', syncActiveSection, { passive: true })
    window.addEventListener('resize', syncActiveSection)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', syncActiveSection)
      window.removeEventListener('resize', syncActiveSection)
    }
  }, [isReadyToAnimate, pathname, syncActiveSection])

  return {
    activeSection,
    beginProgrammaticScroll,
    finishProgrammaticScroll,
    forceSyncActiveSection,
    resetActiveSection,
    setActiveSection,
  }
}

export function useMobileMenuEffects(
  mobileOpen: boolean,
  lenisRef: LenisRef,
  menuRef: RefObject<HTMLDivElement | null>,
  forceSyncActiveSection: () => void,
  setMobileOpen: Dispatch<SetStateAction<boolean>>,
) {
  const hasOpenedRef = useRef(false)

  useEffect(() => {
    const lenis = lenisRef.current

    if (mobileOpen) {
      hasOpenedRef.current = true
      lenis?.stop()
      setBodyScrollLocked(true)
      return
    }

    if (!hasOpenedRef.current) {
      return
    }

    const timer = window.setTimeout(() => {
      lenis?.start()
      setBodyScrollLocked(false)
    }, MOBILE_MENU_RESTART_DELAY_MS)

    return () => {
      window.clearTimeout(timer)
      lenis?.start()
      setBodyScrollLocked(false)
    }
  }, [lenisRef, mobileOpen])

  useEffect(() => {
    if (!mobileOpen) {
      return
    }

    forceSyncActiveSection()

    const menuEl = menuRef.current

    // Move focus into the dialog so screen readers announce it and Tab keeps
    // focus trapped. Target the dialog container (tabIndex={-1}) rather than
    // the first nav button — programmatic focus on the button can trigger
    // `:focus-visible` in some UAs, and that ring lands mid-clipPath-sweep,
    // producing a flickering outline around "About" as the menu opens.
    const focusTimer = window.setTimeout(() => {
      menuEl?.focus({ preventScroll: true })
    }, 520)

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileOpen(false)
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const focusable = getFocusableElements(menuEl)
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (!first || !last) {
        return
      }

      // If focus is on the dialog container itself, the first Tab press
      // should land on the first nav link (or the last, on Shift+Tab) —
      // mirroring how native modals behave.
      if (document.activeElement === menuEl) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus({ preventScroll: true })
        return
      }

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault()
          last.focus({ preventScroll: true })
        }
        return
      }

      if (document.activeElement === last) {
        event.preventDefault()
        first.focus({ preventScroll: true })
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuRef, mobileOpen, setMobileOpen, forceSyncActiveSection])
}
