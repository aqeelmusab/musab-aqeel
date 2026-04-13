'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import Logo from '@/components/ui/Logo'
import HamburgerIcon from '@/components/ui/HamburgerIcon'
import MagneticButton from '@/components/ui/MagneticButton'
import { ease } from '@/lib/motion'
import { useLenisRef } from '@/lib/lenis-context'
import type { NavLink } from '@/types'

const NAV_LINKS: NavLink[] = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#work' },
  { label: 'Process', href: '#process' },
  { label: 'Contact', href: '#contact' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const hasOpenedRef = useRef(false)
  const pathname = usePathname()
  const router = useRouter()
  const lenisRef = useLenisRef()

  // Nav background on scroll
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Stop / start Lenis around the mobile menu.
  // lenis.stop() freezes smooth scroll immediately on open.
  // lenis.start() is deferred by 600ms so it fires only after the
  // 0.55s close animation has fully finished.
  useEffect(() => {
    const lenis = lenisRef.current

    if (mobileOpen) {
      hasOpenedRef.current = true
      lenis?.stop()
      document.body.style.overflow = 'hidden'
      return
    }
    // Skip on initial mount (menu was never opened)
    if (!hasOpenedRef.current) return

    const t = setTimeout(() => {
      lenis?.start()
      document.body.style.overflow = ''
    }, 600)

    return () => {
      clearTimeout(t)
      lenis?.start()
      document.body.style.overflow = ''
    }
  // lenisRef is a stable MutableRefObject — omitting it is intentional
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileOpen])

  // Scroll-synced active section — home page only.
  // Strategy: among sections whose top has already passed 120px from the viewport
  // top (just below the nav), pick the one whose top is CLOSEST to that line.
  // This avoids the "last-above-threshold" approach misfiring when a section's
  // top is still in the lower half of the viewport while the user is reading it.
  useEffect(() => {
    function updateActive() {
      if (pathname !== '/') {
        setActiveSection('')
        return
      }
      const NAV_THRESHOLD = 120
      let current = ''
      let closestTop = -Infinity
      for (const link of NAV_LINKS) {
        const el = document.querySelector(link.href)
        if (!el) continue
        const top = el.getBoundingClientRect().top
        if (top <= NAV_THRESHOLD && top > closestTop) {
          closestTop = top
          current = link.href
        }
      }
      setActiveSection(current)
    }

    window.addEventListener('scroll', updateActive, { passive: true })
    const raf = requestAnimationFrame(updateActive)
    return () => {
      window.removeEventListener('scroll', updateActive)
      cancelAnimationFrame(raf)
    }
  }, [pathname])

  // Focus trap — delay focus until after the open animation completes
  const trapFocus = useCallback(() => {
    const menuEl = menuRef.current
    if (!menuEl) return

    function getFocusable() {
      return menuEl
        ? Array.from(menuEl.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'))
        : []
    }

    // Wait for the clip-path animation (~700ms) before stealing focus
    const focusTimer = setTimeout(() => {
      getFocusable()[0]?.focus({ preventScroll: true })
    }, 400)

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMobileOpen(false)
        return
      }
      if (e.key !== 'Tab') return
      const focusable = getFocusable()
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus({ preventScroll: true })
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus({ preventScroll: true })
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      clearTimeout(focusTimer)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  useEffect(() => {
    if (!mobileOpen) return
    return trapFocus()
  }, [mobileOpen, trapFocus])

  const handleLogoClick = useCallback((e: React.MouseEvent) => {
    // Always prevent default — logo never navigates away
    e.preventDefault()

    if (pathname === '/') {
      if (mobileOpen) {
        // At top with menu open → do nothing (user closes via hamburger)
        if (window.scrollY === 0) return
        // Scrolled + menu open → scroll to top, close menu when scroll completes
        const lenis = lenisRef.current
        lenis?.start()
        lenis?.scrollTo(0, {
          duration: 1.2,
          onComplete: () => setMobileOpen(false),
        })
      } else {
        // At top + menu closed → do nothing
        if (window.scrollY === 0) return
        lenisRef.current?.scrollTo(0, { duration: 1.2 })
      }
    } else {
      // Non-home page
      if (mobileOpen) {
        // At top with menu open → do nothing (user closes via hamburger)
        if (window.scrollY <= 10) return
        // Scrolled + menu open → close menu, then scroll to top
        setMobileOpen(false)
        setTimeout(() => {
          lenisRef.current?.scrollTo(0, { duration: 0.8 })
        }, 700)
      } else {
        // At top + menu closed → do nothing
        if (window.scrollY === 0) return
        lenisRef.current?.scrollTo(0, { duration: 1.0 })
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, mobileOpen])

  function handleNavClick(href: string) {
    if (pathname !== '/') {
      // On a non-home page: close menu and navigate to /#section
      setMobileOpen(false)
      router.push(`/${href}`)
      return
    }

    const el = document.querySelector(href)
    if (!el) { setMobileOpen(false); return }

    if (mobileOpen) {
      // Menu is open: scroll to section while menu stays visible,
      // close only after scroll completes (mirrors logo behaviour)
      const lenis = lenisRef.current
      lenis?.start()
      lenis?.scrollTo(el as HTMLElement, {
        offset: -80,
        duration: 1.2,
        onComplete: () => setMobileOpen(false),
      })
    } else {
      lenisRef.current?.scrollTo(el as HTMLElement, { offset: -80, duration: 1.0 })
    }
  }

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled && !mobileOpen
            ? 'color-mix(in oklch, var(--color-bg) 80%, transparent)'
            : 'transparent',
          backdropFilter: scrolled && !mobileOpen ? 'blur(12px)' : 'none',
          borderBottom: scrolled && !mobileOpen
            ? '0.5px solid var(--color-border-sub)'
            : '0.5px solid transparent',
        }}
      >
        <nav className="mx-auto flex items-center justify-between px-6 py-4 max-w-[1400px]">
          <Logo onClick={handleLogoClick} />

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => handleNavClick(link.href)}
                className="nav-link text-sm font-medium tracking-wide font-body"
                data-active={activeSection === link.href || undefined}
              >
                {link.label}
                <span className="nav-link-underline" />
              </button>
            ))}
          </div>

          {/* Desktop right cluster */}
          <div className="hidden lg:flex items-center gap-4">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: 'var(--color-surface-up)',
                border: '1px solid var(--color-border)',
              }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                />
                <span
                  className="relative inline-flex rounded-full h-1.5 w-1.5"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                />
              </span>
              <span className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                Available for work
              </span>
            </div>

            <MagneticButton className="btn-outline" onClick={() => handleNavClick('#contact')}>
              Hire Me
            </MagneticButton>
          </div>

          <HamburgerIcon isOpen={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)} />
        </nav>
      </header>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="fixed inset-0 z-40 mobile-nav-overlay flex flex-col"
            style={{ backgroundColor: 'var(--color-bg)' }}
            initial={{ clipPath: 'circle(0% at calc(100% - 40px) 36px)' }}
            animate={{
              clipPath: 'circle(160% at calc(100% - 40px) 36px)',
              transition: { duration: 0.7, ease: [0.32, 0.72, 0, 1] },
            }}
            exit={{
              clipPath: 'circle(0% at calc(100% - 40px) 36px)',
              transition: { duration: 0.55, ease: [0.5, 0, 0.75, 0] },
            }}
          >
            {/* Spacer matches header height */}
            <div className="h-[64px] shrink-0" />

            {/* Nav links — massive, vertically centred */}
            <div className="flex-1 flex flex-col justify-center px-6">
              {NAV_LINKS.map((link, i) => (
                <div key={link.href} className="overflow-hidden">
                  <motion.div
                    initial={{ y: '110%' }}
                    animate={{
                      y: '0%',
                      transition: { duration: 0.55, ease: ease.out, delay: 0.2 + i * 0.055 },
                    }}
                    exit={{
                      y: '110%',
                      transition: { duration: 0.3, ease: ease.in, delay: i * 0.03 },
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleNavClick(link.href)}
                      className="block w-full text-left py-1 group"
                    >
                      <span
                        className="uppercase font-bold tracking-tight leading-[0.9] block font-display transition-colors duration-300"
                        style={{
                          fontSize: 'clamp(3rem, 14vw, 5.5rem)',
                          color:
                            activeSection && activeSection !== link.href
                              ? 'var(--color-text-tertiary)'
                              : 'var(--color-text-primary)',
                        }}
                      >
                        {link.label}
                      </span>
                    </button>
                  </motion.div>
                </div>
              ))}
            </div>

            {/* Bottom bar */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { duration: 0.4, ease: ease.out, delay: 0.5 },
              }}
              exit={{
                opacity: 0,
                y: 6,
                transition: { duration: 0.2, ease: ease.in },
              }}
              className="shrink-0 px-6 pb-8 flex items-center justify-between"
            >
              <div className="flex flex-col gap-1.5">
                <p
                  className="text-[10px] uppercase tracking-widest leading-none font-mono"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Musab Aqeel
                </p>
                <p
                  className="text-[10px] uppercase tracking-widest leading-none font-mono"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  hello@musabaqeel.com
                </p>
              </div>
              <a
                href="mailto:hello@musabaqeel.com"
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-[2px] transition-colors duration-200 font-mono"
                style={{
                  border: '1px solid var(--color-border)',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--color-text-secondary)',
                }}
              >
                Get in touch
                <span
                  className="inline-block transition-transform duration-300 group-hover:translate-x-0.5"
                  aria-hidden="true"
                >
                  →
                </span>
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
