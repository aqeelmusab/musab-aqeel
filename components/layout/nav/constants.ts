import type { NavLink } from '@/types'

export const NAV_LINKS: readonly NavLink[] = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#work' },
  { label: 'Process', href: '#process' },
  { label: 'Contact', href: '#contact' },
]

export const HOME_PATH = '/'
export const HEADER_SCROLL_THRESHOLD = 60
export const HEADER_SCROLL_RELEASE = 28
export const ACTIVE_SECTION_THRESHOLD = 120
export const MOBILE_MENU_RESTART_DELAY_MS = 1000
/**
 * Delay scrolling after a mobile nav link tap so the menu's clip-close
 * animation (`duration.mobileMenuClipClose` = 0.92 s) can complete first.
 * Otherwise the page scrolls beneath a still-collapsing overlay, which is
 * fast but disorienting.
 */
export const MOBILE_SCROLL_DELAY_MS = 900
export const MOBILE_MENU_OPEN_CLIP_PATH =
  'circle(160% at calc(100% - 40px) 36px)'
export const MOBILE_MENU_CLOSED_CLIP_PATH =
  'circle(0% at calc(100% - 40px) 36px)'
