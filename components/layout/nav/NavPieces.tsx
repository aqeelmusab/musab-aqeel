'use client'

import { motion } from 'motion/react'
import type { RefObject } from 'react'

import MagneticButton from '@/components/ui/MagneticButton'
import { CONTACT_EMAIL, CONTACT_EMAIL_HREF, SITE_NAME } from '@/lib/config'
import { duration, ease } from '@/lib/motion'

import {
  MOBILE_MENU_CLOSED_CLIP_PATH,
  MOBILE_MENU_OPEN_CLIP_PATH,
  NAV_LINKS,
} from './constants'

interface NavActionProps {
  onNavigate: (href: string) => void
}

interface DesktopNavLinksProps extends NavActionProps {
  activeSection: string
}

interface MobileMenuProps extends DesktopNavLinksProps {
  menuRef: RefObject<HTMLDivElement | null>
}

function getMobileLinkColor(activeSection: string, href: string) {
  if (activeSection === href) {
    return 'var(--color-text-primary)'
  }

  if (activeSection) {
    return 'var(--color-text-tertiary)'
  }

  return 'var(--color-text-primary)'
}

export function DesktopNavLinks({
  activeSection,
  onNavigate,
}: DesktopNavLinksProps) {
  return (
    <div className="hidden items-center gap-8 lg:flex">
      {NAV_LINKS.map((link) => (
        <button
          key={link.href}
          type="button"
          onClick={() => onNavigate(link.href)}
          className="nav-link font-body text-sm font-medium tracking-wide"
          data-active={activeSection === link.href || undefined}
        >
          {link.label}
          <span className="nav-link-underline" />
        </button>
      ))}
    </div>
  )
}

export function DesktopActions({ onNavigate }: NavActionProps) {
  return (
    <div className="hidden items-center gap-4 lg:flex">
      <div
        className="flex items-center gap-2 rounded-full px-3 py-1.5"
        style={{
          backgroundColor: 'var(--color-surface-up)',
          border: '1px solid var(--color-border)',
        }}
      >
        <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
            style={{ backgroundColor: 'var(--color-accent)' }}
          />
          <span
            className="relative inline-flex h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: 'var(--color-accent)' }}
          />
        </span>
        <span
          className="font-mono text-xs"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Available for work
        </span>
      </div>

      <MagneticButton
        className="btn-outline"
        onClick={() => onNavigate('#contact')}
      >
        Hire Me
      </MagneticButton>
    </div>
  )
}

export function MobileMenu({
  activeSection,
  menuRef,
  onNavigate,
}: MobileMenuProps) {
  return (
    <motion.div
      key="mobile-menu"
      ref={menuRef}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      tabIndex={-1}
      className="fixed inset-0 z-40 flex h-dvh flex-col focus:outline-none"
      style={{ backgroundColor: 'var(--color-bg)' }}
      initial={{ clipPath: MOBILE_MENU_CLOSED_CLIP_PATH }}
      animate={{
        clipPath: MOBILE_MENU_OPEN_CLIP_PATH,
        transition: {
          duration: duration.mobileMenuClipOpen,
          ease: ease.layout,
        },
      }}
      exit={{
        clipPath: MOBILE_MENU_CLOSED_CLIP_PATH,
        transition: {
          duration: duration.mobileMenuClipClose,
          ease: ease.overlayExit,
        },
      }}
    >
      <div className="h-16 shrink-0" />

      <div className="flex flex-1 flex-col justify-center px-6">
        {NAV_LINKS.map((link, index) => (
          <div key={link.href} className="overflow-hidden">
            <motion.div
              initial={{ y: '110%' }}
              animate={{
                y: '0%',
                transition: {
                  duration: 0.65,
                  ease: ease.out,
                  delay: 0.2 + index * 0.075,
                },
              }}
              exit={{
                y: '110%',
                transition: {
                  duration: 0.48,
                  ease: ease.in,
                  delay: index * 0.05,
                },
              }}
            >
              <button
                type="button"
                onClick={() => onNavigate(link.href)}
                className="block w-full rounded-sm py-1 text-left outline-none focus-visible:ring-1 focus-visible:ring-white/20"
              >
                <span
                  className="font-display block leading-[0.9] font-bold tracking-tight uppercase transition-colors duration-200"
                  style={{
                    fontSize: 'clamp(3rem, 14vw, 5.5rem)',
                    color: getMobileLinkColor(activeSection, link.href),
                  }}
                >
                  {link.label}
                </span>
              </button>
            </motion.div>
          </div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: ease.out,
            delay: 0.58,
          },
        }}
        exit={{
          opacity: 0,
          y: 8,
          transition: { duration: 0.38, ease: ease.in, delay: 0.06 },
        }}
        className="flex shrink-0 items-center justify-between px-6 pb-8"
      >
        <div className="flex flex-col gap-1.5">
          <p
            className="font-mono text-[10px] leading-none tracking-widest uppercase"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            {SITE_NAME}
          </p>
          <p
            className="font-mono text-[10px] leading-none tracking-widest uppercase"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            {CONTACT_EMAIL}
          </p>
        </div>
        <a
          href={CONTACT_EMAIL_HREF}
          className="group inline-flex items-center gap-2 rounded-xs px-4 py-2 font-mono transition-colors duration-200 outline-none focus-visible:ring-1 focus-visible:ring-white/20"
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
  )
}
