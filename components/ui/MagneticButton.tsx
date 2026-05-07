'use client'

import { useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

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

  const Tag = as === 'a' ? motion.a : motion.button

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
    >
      <Tag
        href={href}
        onClick={onClick}
        type={as === 'button' ? (type ?? 'button') : undefined}
        disabled={as === 'button' ? disabled : undefined}
        aria-disabled={disabled || undefined}
        className={className}
        whileTap={{ scale: 0.97 }}
        data-magnetic-hover={isHovered || undefined}
      >
        {children}
      </Tag>
    </motion.div>
  )
}
