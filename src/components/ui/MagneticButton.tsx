'use client'

import { motion, useMotionValue, useSpring } from 'motion/react'
import Link from 'next/link'
import { type MouseEvent, type ReactNode, useRef, useState } from 'react'

import { useHoverFinePointer } from '@/lib/hooks/useHoverFinePointer'

const MotionLink = motion.create(Link)

function isInternalHref(href: string | undefined): href is string {
  return typeof href === 'string' && href.startsWith('/')
}

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  as?: 'button' | 'a'
  type?: 'button' | 'submit' | 'reset'
  href?: string
  onClick?: () => void
  strength?: number
  disabled?: boolean
}

export default function MagneticButton({
  children,
  className = '',
  as = 'button',
  type,
  href,
  onClick,
  strength = 0.3,
  disabled = false,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  // The magnetic effect only makes sense for a fine, hover-capable pointer.
  // On touch devices a tap emulates mouse events (no matching `mouseleave`),
  // which leaves the button skewed on its own GPU layer; when the contact form
  // remounts the button, mobile browsers can leave that layer painted as a
  // ghost. Gating the transform off on touch removes the layer entirely.
  const isMagnetic = useHoverFinePointer()

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springX = useSpring(x, { stiffness: 300, damping: 20 })
  const springY = useSpring(y, { stiffness: 300, damping: 20 })

  function handleMouseMove(e: MouseEvent) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) * strength)
    y.set((e.clientY - centerY) * strength)
  }

  function handleMouseLeave() {
    x.set(0)
    y.set(0)
    setIsHovered(false)
  }

  // For internal hrefs, route through next/link so navigation stays SPA and
  // prefetching works. External (or unset) hrefs fall through to a plain
  // <a>; non-anchor renders a <button>.
  const useInternalLink = as === 'a' && isInternalHref(href)
  const Tag = useInternalLink
    ? MotionLink
    : as === 'a'
      ? motion.a
      : motion.button

  // Build props conditionally so we never pass an explicit `undefined`
  // (incompatible with exactOptionalPropertyTypes). Omitting a key is
  // equivalent to the previous `: undefined` branches at runtime.
  // No `style` when non-magnetic: avoids a persistent transform/compositor
  // layer (the source of the mobile remount ghost).
  const magneticProps = isMagnetic
    ? {
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: handleMouseLeave,
        style: { x: springX, y: springY },
        ...(disabled ? {} : { onMouseMove: handleMouseMove }),
      }
    : {}

  const isButton = as === 'button'

  return (
    <motion.div ref={ref} {...magneticProps}>
      <Tag
        href={href as string}
        className={className}
        whileTap={{ scale: 0.97 }}
        {...(onClick ? { onClick } : {})}
        {...(isButton ? { type: type ?? 'button', disabled } : {})}
        {...(disabled ? { 'aria-disabled': true } : {})}
        {...(isHovered ? { 'data-magnetic-hover': true } : {})}
      >
        {children}
      </Tag>
    </motion.div>
  )
}
