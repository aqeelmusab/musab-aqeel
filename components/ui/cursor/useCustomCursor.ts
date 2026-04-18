'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { animate, useMotionValue, useSpring } from 'motion/react'

import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

import {
  cursorDotSpring,
  cursorRingSpring,
  type CursorState,
  getCursorRingSize,
} from './constants'

const INTERACTIVE_CURSOR_SELECTOR =
  'a, button, label, summary, [data-cursor="link"], [role="button"], [role="link"], input, textarea, select'

function detectCursorState(target: Element): CursorState {
  if (target.closest('[data-cursor="project"]')) {
    return 'project'
  }

  if (target.closest(INTERACTIVE_CURSOR_SELECTOR)) {
    return 'link'
  }

  return 'default'
}

export function useCustomCursor() {
  const reducedMotion = usePrefersReducedMotion()
  const visibleRef = useRef(false)
  const stateRef = useRef<CursorState>('default')
  const lastPosRef = useRef({ x: 0, y: 0 })

  const [hoverState, setHoverState] = useState<CursorState>('default')
  const [visible, setVisible] = useState(false)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const dotX = useSpring(mouseX, cursorDotSpring)
  const dotY = useSpring(mouseY, cursorDotSpring)

  const ringX = useSpring(mouseX, cursorRingSpring)
  const ringY = useSpring(mouseY, cursorRingSpring)

  const dotScale = useMotionValue(1)
  const ringScale = useMotionValue(1)

  const setCursorState = useCallback((next: CursorState) => {
    if (next !== stateRef.current) {
      stateRef.current = next
      setHoverState(next)
    }
  }, [])

  const updateStateFromPoint = useCallback(
    (clientX: number, clientY: number) => {
      const element = document.elementFromPoint(clientX, clientY)

      if (!(element instanceof Element)) {
        return
      }

      setCursorState(detectCursorState(element))
    },
    [setCursorState],
  )

  useEffect(() => {
    if (reducedMotion) {
      return
    }

    const hasHover = window.matchMedia('(hover: hover)').matches
    const finePointer = window.matchMedia('(pointer: fine)').matches
    if (!hasHover || !finePointer) {
      return
    }

    document.documentElement.classList.add('custom-cursor-active')

    let scrollRaf = 0

    const scheduleScrollSync = () => {
      if (scrollRaf) {
        return
      }

      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0

        if (!visibleRef.current) {
          return
        }

        const { x, y } = lastPosRef.current
        updateStateFromPoint(x, y)
      })
    }

    function handleMouseMove(event: MouseEvent) {
      lastPosRef.current = { x: event.clientX, y: event.clientY }
      mouseX.set(event.clientX)
      mouseY.set(event.clientY)
      updateStateFromPoint(event.clientX, event.clientY)

      if (!visibleRef.current) {
        visibleRef.current = true
        setVisible(true)
      }
    }

    function handleMouseOver(event: MouseEvent) {
      const target = event.target
      if (!(target instanceof Element)) {
        return
      }

      setCursorState(detectCursorState(target))
    }

    function handleMouseDown() {
      animate(dotScale, 0.88, { duration: 0.1, ease: 'easeOut' })
      animate(ringScale, 0.94, { duration: 0.12, ease: 'easeOut' })
    }

    function handleMouseUp() {
      animate(dotScale, 1, { duration: 0.22, ease: 'easeOut' })
      animate(ringScale, 1, { duration: 0.24, ease: 'easeOut' })
    }

    function hideCursor() {
      visibleRef.current = false
      setVisible(false)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mouseover', handleMouseOver, { passive: true })
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseleave', hideCursor)
    window.addEventListener('blur', hideCursor)
    window.addEventListener('scroll', scheduleScrollSync, true)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseover', handleMouseOver)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseleave', hideCursor)
      window.removeEventListener('blur', hideCursor)
      window.removeEventListener('scroll', scheduleScrollSync, true)

      if (scrollRaf) {
        cancelAnimationFrame(scrollRaf)
      }

      document.documentElement.classList.remove('custom-cursor-active')
    }
  }, [dotScale, mouseX, mouseY, reducedMotion, ringScale, setCursorState, updateStateFromPoint])

  return {
    dotHidden: hoverState === 'link',
    dotScale,
    dotX,
    dotY,
    hoverState,
    reducedMotion,
    ringScale,
    ringSize: getCursorRingSize(hoverState),
    ringX,
    ringY,
    visible,
  }
}
