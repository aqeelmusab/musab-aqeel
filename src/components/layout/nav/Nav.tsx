'use client'

import { AnimatePresence } from 'motion/react'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useRef, useState, type MouseEvent } from 'react'

import {
  DesktopActions,
  DesktopNavLinks,
  MobileMenu,
} from '@/components/layout/nav/NavPieces'
import {
  HOME_PATH,
  MOBILE_SCROLL_DELAY_MS,
} from '@/components/layout/nav/constants'
import {
  useActiveSectionState,
  useHeaderScrolledState,
  useMobileMenuEffects,
} from '@/components/layout/nav/useNavState'
import HamburgerIcon from '@/components/ui/HamburgerIcon'
import Logo from '@/components/ui/Logo'
import { useIntro } from '@/lib/contexts/IntroContext'
import { useLenisRef } from '@/lib/contexts/lenis-context'
import { scrollToHashSection, scrollToPageTop } from '@/lib/scroll-navigation'

// Post-menu-close scroll sits longer so the bouncy settle has room to read.
// Desktop uses a snappier duration — easing comes from scroll-navigation's
// default (`scrollEaseOut`).
const MOBILE_MENU_SCROLL_DURATION = 1.35
const DESKTOP_SCROLL_DURATION = 1

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const lenisRef = useLenisRef()
  const { isReadyToAnimate } = useIntro()
  const scrolled = useHeaderScrolledState()
  const {
    activeSection,
    beginProgrammaticScroll,
    finishProgrammaticScroll,
    forceSyncActiveSection,
    resetActiveSection,
    setActiveSection,
  } = useActiveSectionState(pathname, isReadyToAnimate)
  const visibleActiveSection =
    isReadyToAnimate && pathname === HOME_PATH ? activeSection : ''

  useMobileMenuEffects(
    mobileOpen,
    lenisRef,
    menuRef,
    forceSyncActiveSection,
    setMobileOpen,
  )

  const closeMobileMenu = useCallback(() => {
    setMobileOpen(false)
  }, [])

  const handleLogoClick = useCallback(
    (event: MouseEvent) => {
      if (pathname === HOME_PATH) {
        event.preventDefault()

        if (window.scrollY === 0) {
          resetActiveSection()
          if (mobileOpen) {
            closeMobileMenu()
          }
          return
        }

        beginProgrammaticScroll()
        setActiveSection('')

        if (mobileOpen) {
          closeMobileMenu()
        }

        scrollToPageTop(lenisRef, {
          duration: mobileOpen
            ? MOBILE_MENU_SCROLL_DURATION
            : DESKTOP_SCROLL_DURATION,
          delayMs: mobileOpen ? MOBILE_SCROLL_DELAY_MS : 0,
          onComplete: finishProgrammaticScroll,
          restartLenis: mobileOpen,
        })
        return
      }

      // Off-home: let next/link handle the navigation. Just close the menu.
      if (mobileOpen) {
        closeMobileMenu()
      }
    },
    [
      beginProgrammaticScroll,
      closeMobileMenu,
      finishProgrammaticScroll,
      lenisRef,
      mobileOpen,
      pathname,
      resetActiveSection,
      setActiveSection,
    ],
  )

  const handleNavClick = useCallback(
    (href: string) => {
      if (pathname !== HOME_PATH) {
        if (mobileOpen) {
          closeMobileMenu()
        }

        router.push(`/${href}`)
        return
      }

      // Mark the scroll as programmatic *before* asking Lenis to scroll, so
      // the first scroll event Lenis emits doesn't briefly flip the active
      // section based on the user's current scroll position.
      beginProgrammaticScroll()
      setActiveSection(href)

      if (
        !scrollToHashSection(lenisRef, href, {
          duration: mobileOpen
            ? MOBILE_MENU_SCROLL_DURATION
            : DESKTOP_SCROLL_DURATION,
          delayMs: mobileOpen ? MOBILE_SCROLL_DELAY_MS : 0,
          onComplete: finishProgrammaticScroll,
          restartLenis: mobileOpen,
        })
      ) {
        // Target wasn't found — unwind the programmatic-scroll guard.
        finishProgrammaticScroll()
        closeMobileMenu()
        return
      }

      if (mobileOpen) {
        closeMobileMenu()
      }
    },
    [
      beginProgrammaticScroll,
      closeMobileMenu,
      finishProgrammaticScroll,
      lenisRef,
      mobileOpen,
      pathname,
      router,
      setActiveSection,
    ],
  )

  const headerState = mobileOpen ? 'menu' : scrolled ? 'scrolled' : 'idle'

  return (
    <>
      <header
        className="site-header fixed top-0 right-0 left-0 z-50"
        data-state={headerState}
      >
        <nav className="relative z-10 mx-auto flex max-w-350 items-center justify-between px-6 py-4">
          <Logo onClick={handleLogoClick} />
          <DesktopNavLinks
            activeSection={visibleActiveSection}
            onNavigate={handleNavClick}
          />
          <DesktopActions onNavigate={handleNavClick} />
          <HamburgerIcon
            isOpen={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          />
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <MobileMenu
            activeSection={visibleActiveSection}
            menuRef={menuRef}
            onNavigate={handleNavClick}
          />
        )}
      </AnimatePresence>
    </>
  )
}
