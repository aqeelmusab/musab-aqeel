'use client'

import { AnimatePresence } from 'motion/react'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useRef, useState, type MouseEvent } from 'react'

import { DesktopActions, DesktopNavLinks, MobileMenu } from '@/components/layout/nav/NavPieces'
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
import { useLoader } from '@/lib/LoaderContext'
import { useLenisRef } from '@/lib/lenis-context'
import { scrollToHashSection, scrollToPageTop } from '@/lib/scroll-navigation'

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const lenisRef = useLenisRef()
  const { isReadyToAnimate } = useLoader()
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
      event.preventDefault()

      if (pathname === HOME_PATH) {
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
          duration: mobileOpen ? 0.8 : 1,
          delayMs: mobileOpen ? MOBILE_SCROLL_DELAY_MS : 0,
          onComplete: finishProgrammaticScroll,
          restartLenis: mobileOpen,
        })
        return
      }

      if (mobileOpen) {
        closeMobileMenu()
      }

      router.push(HOME_PATH)
    },
    [
      beginProgrammaticScroll,
      closeMobileMenu,
      finishProgrammaticScroll,
      lenisRef,
      mobileOpen,
      pathname,
      resetActiveSection,
      router,
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

      if (
        !scrollToHashSection(lenisRef, href, {
          duration: mobileOpen ? 0.8 : 1,
          delayMs: mobileOpen ? MOBILE_SCROLL_DELAY_MS : 0,
          onComplete: finishProgrammaticScroll,
          restartLenis: mobileOpen,
        })
      ) {
        closeMobileMenu()
        return
      }

      beginProgrammaticScroll()
      setActiveSection(href)

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
      <header className="site-header fixed top-0 right-0 left-0 z-50" data-state={headerState}>
        <nav className="relative z-10 mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
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
