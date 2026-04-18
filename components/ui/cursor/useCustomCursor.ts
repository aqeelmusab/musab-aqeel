'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { animate, useMotionValue, useSpring } from 'motion/react'

import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

import {
  cursorDotSpring,
  cursorPressSpring,
  cursorReleaseSpring,
  cursorRingSpring,
  type CursorState,
  getCursorRingSize,
} from './constants'

const INTERACTIVE_CURSOR_SELECTOR =
  'a, button, label, summary, [data-cursor="link"], [role="button"], [role="link"]'

const TEXT_INPUT_SELECTOR =
  'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="file"]), textarea, select, [contenteditable="true"]'

function detectCursorState(target: Element): CursorState {
  if (target.closest('[data-cursor="project"]')) {
    return 'project'
  }

  if (target.closest(TEXT_INPUT_SELECTOR)) {
    return 'text'
  }

  if (target.closest(INTERACTIVE_CURSOR_SELECTOR)) {
    return 'link'
  }

  return 'default'
}

export function useCustomCursor() {
  const reducedMotion = usePrefersReducedMotion()
  const visibleRef = useRef(false)
  const hasJumpedToMouseRef = useRef(false)
  const stateRef = useRef<CursorState>('default')
  const lastPosRef = useRef({ x: 0, y: 0 })

  const [hoverState, setHoverState] = useState<CursorState>('default')
  const [visible, setVisible] = useState(false)

  /**
   * Increments on every mousedown so a keyed ripple element re-mounts and
   * replays its animation. State update is fine here — it happens at the
   * cadence of clicks, not mousemoves.
   */
  const [pressTick, setPressTick] = useState(0)

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
      const { clientX, clientY } = event
      lastPosRef.current = { x: clientX, y: clientY }

      // On first visibility, snap every follower to the entry point so the
      // cursor doesn't spring in from the top-left corner.
      if (!hasJumpedToMouseRef.current) {
        hasJumpedToMouseRef.current = true
        mouseX.jump(clientX)
        mouseY.jump(clientY)
        dotX.jump(clientX)
        dotY.jump(clientY)
        ringX.jump(clientX)
        ringY.jump(clientY)

        // Seed state from the element under the entry point so the first
        // frame paints with the correct ring size / color.
        updateStateFromPoint(clientX, clientY)
      } else {
        mouseX.set(clientX)
        mouseY.set(clientY)
      }

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
      animate(dotScale, 0.7, cursorPressSpring)
      animate(ringScale, 0.86, cursorPressSpring)
      setPressTick((tick) => tick + 1)
    }

    function handleMouseUp() {
      animate(dotScale, 1, cursorReleaseSpring)
      animate(ringScale, 1, cursorReleaseSpring)
    }

    function hideCursor() {
      visibleRef.current = false
      hasJumpedToMouseRef.current = false
      setVisible(false)
    }

    function showCursor(event: MouseEvent) {
      // `mouseenter` on the document fires when the pointer re-enters the
      // viewport. Reset the jump flag so the next mousemove re-seeds.
      hasJumpedToMouseRef.current = false
      handleMouseMove(event)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mouseover', handleMouseOver, { passive: true })
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseleave', hideCursor)
    document.addEventListener('mouseenter', showCursor)
    window.addEventListener('blur', hideCursor)
    window.addEventListener('scroll', scheduleScrollSync, true)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseover', handleMouseOver)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseleave', hideCursor)
      document.removeEventListener('mouseenter', showCursor)
      window.removeEventListener('blur', hideCursor)
      window.removeEventListener('scroll', scheduleScrollSync, true)

      if (scrollRaf) {
        cancelAnimationFrame(scrollRaf)
      }

      document.documentElement.classList.remove('custom-cursor-active')
    }
  }, [
    dotScale,
    dotX,
    dotY,
    mouseX,
    mouseY,
    reducedMotion,
    ringScale,
    ringX,
    ringY,
    setCursorState,
    updateStateFromPoint,
  ])

  const textMode = hoverState === 'text'

  return {
    dotHidden: hoverState === 'link' || textMode,
    dotScale,
    dotX,
    dotY,
    hoverState,
    pressTick,
    reducedMotion,
    ringHidden: textMode,
    ringScale,
    ringSize: getCursorRingSize(hoverState),
    ringX,
    ringY,
    visible,
  }
}
