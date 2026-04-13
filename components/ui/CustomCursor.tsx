'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useMotionValue, useSpring, animate } from 'motion/react'

type CursorState = 'default' | 'link' | 'project'

export default function CustomCursor() {
  const mountedRef = useRef(false)
  const visibleRef = useRef(false)
  const stateRef = useRef<CursorState>('default')
  const [hoverState, setHoverState] = useState<CursorState>('default')
  const [visible, setVisible] = useState(false)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const dotX = useSpring(mouseX, { stiffness: 800, damping: 35 })
  const dotY = useSpring(mouseY, { stiffness: 800, damping: 35 })

  const ringX = useSpring(mouseX, { stiffness: 250, damping: 25 })
  const ringY = useSpring(mouseY, { stiffness: 250, damping: 25 })

  const dotScale = useMotionValue(1)

  const detectState = useCallback((target: HTMLElement): CursorState => {
    if (target.closest('[data-cursor="project"]')) return 'project'
    if (target.closest('a, button, [data-cursor="link"], input, textarea, select')) return 'link'
    return 'default'
  }, [])

  useEffect(() => {
    const hasHover = window.matchMedia('(hover: hover)').matches
    if (!hasHover) return

    mountedRef.current = true
    document.documentElement.classList.add('custom-cursor-active')

    function onMouseMove(e: MouseEvent) {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      if (!visibleRef.current) {
        visibleRef.current = true
        setVisible(true)
      }
    }

    function onMouseOver(e: MouseEvent) {
      const next = detectState(e.target as HTMLElement)
      if (next !== stateRef.current) {
        stateRef.current = next
        setHoverState(next)
      }
    }

    function onMouseDown() {
      animate(dotScale, 2.5, { duration: 0.1, ease: 'easeOut' })
    }

    function onMouseUp() {
      animate(dotScale, 1, { duration: 0.25, ease: 'easeOut' })
    }

    function onMouseLeave() {
      visibleRef.current = false
      setVisible(false)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mouseover', onMouseOver, { passive: true })
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    document.addEventListener('mouseleave', onMouseLeave)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseover', onMouseOver)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.documentElement.classList.remove('custom-cursor-active')
    }
  }, [mouseX, mouseY, dotScale, detectState])

  const ringSize = hoverState === 'project' ? 64 : hoverState === 'link' ? 48 : 32

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[10000]"
        style={{
          x: dotX,
          y: dotY,
          scale: dotScale,
          width: 6,
          height: 6,
          marginLeft: -3,
          marginTop: -3,
          backgroundColor: 'var(--color-text-primary)',
        }}
        animate={{
          opacity: visible ? (hoverState === 'link' ? 0 : 1) : 0,
          scale: hoverState === 'link' ? 0 : 1,
        }}
        transition={{ duration: 0.15 }}
      />

      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[10000] flex items-center justify-center"
        style={{
          x: ringX,
          y: ringY,
          marginLeft: -(ringSize / 2),
          marginTop: -(ringSize / 2),
          border: '1px solid var(--color-border-up)',
        }}
        animate={{
          width: ringSize,
          height: ringSize,
          marginLeft: -(ringSize / 2),
          marginTop: -(ringSize / 2),
          opacity: visible ? 1 : 0,
          backgroundColor: hoverState !== 'default' ? 'var(--color-accent-muted)' : 'rgba(0,0,0,0)',
          borderColor: hoverState !== 'default' ? 'var(--color-accent-border)' : 'var(--color-border-up)',
        }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {hoverState === 'project' && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-[10px] uppercase tracking-widest font-mono"
            style={{ color: 'var(--color-text-primary)' }}
          >
            View
          </motion.span>
        )}
      </motion.div>
    </>
  )
}
