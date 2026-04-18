'use client'

import { AnimatePresence, motion, type MotionValue } from 'motion/react'

import {
  CURSOR_FADE_MS,
  CURSOR_RIPPLE_MS,
  cursorRingSizeSpring,
  DOT_OFFSET,
  DOT_SIZE,
  type CursorState,
} from './constants'

interface CursorVisualProps {
  dotHidden: boolean
  dotScale: MotionValue<number>
  dotX: MotionValue<number>
  dotY: MotionValue<number>
  hoverState: CursorState
  pressTick: number
  ringHidden: boolean
  ringScale: MotionValue<number>
  ringSize: number
  ringX: MotionValue<number>
  ringY: MotionValue<number>
  visible: boolean
}

const CURSOR_FADE_S = CURSOR_FADE_MS / 1000
const CURSOR_RIPPLE_S = CURSOR_RIPPLE_MS / 1000

const isAccentState = (state: CursorState) =>
  state === 'link' || state === 'project'

export function CursorVisual({
  dotHidden,
  dotScale,
  dotX,
  dotY,
  hoverState,
  pressTick,
  ringHidden,
  ringScale,
  ringSize,
  ringX,
  ringY,
  visible,
}: CursorVisualProps) {
  const accent = isAccentState(hoverState)

  return (
    <>
      {/* Dot — follows the pointer tightly; hides on links & text inputs. */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-10000 rounded-full will-change-transform"
        style={{
          x: dotX,
          y: dotY,
          scale: dotHidden ? 0 : dotScale,
          width: DOT_SIZE,
          height: DOT_SIZE,
          marginLeft: -DOT_OFFSET,
          marginTop: -DOT_OFFSET,
          backgroundColor: 'var(--color-text-primary)',
          mixBlendMode: 'difference',
        }}
        initial={false}
        animate={{
          opacity: visible && !dotHidden ? 1 : 0,
        }}
        transition={{ duration: CURSOR_FADE_S, ease: 'easeOut' }}
      />

      {/* Ring — loose follower, resizes and recolors per state. */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-10000 flex items-center justify-center rounded-full will-change-transform"
        style={{
          x: ringX,
          y: ringY,
          scale: ringScale,
          border: '1px solid',
          backgroundColor: 'rgba(0, 0, 0, 0)',
          mixBlendMode: 'difference',
        }}
        initial={false}
        animate={{
          width: ringSize,
          height: ringSize,
          marginLeft: -(ringSize / 2),
          marginTop: -(ringSize / 2),
          opacity: visible && !ringHidden ? 1 : 0,
          backgroundColor: accent
            ? 'rgba(212, 255, 0, 0.08)'
            : 'rgba(0, 0, 0, 0)',
          borderColor: accent
            ? 'rgba(212, 255, 0, 0.28)'
            : 'rgba(140, 140, 140, 0.9)',
        }}
        transition={{
          width: cursorRingSizeSpring,
          height: cursorRingSizeSpring,
          marginLeft: cursorRingSizeSpring,
          marginTop: cursorRingSizeSpring,
          opacity: { duration: CURSOR_FADE_S, ease: 'easeOut' },
          backgroundColor: { duration: 0.22, ease: 'easeOut' },
          borderColor: { duration: 0.22, ease: 'easeOut' },
        }}
      >
        {/* Project label — "View" with a crisp spring entry. */}
        <AnimatePresence mode="wait">
          {hoverState === 'project' && (
            <motion.span
              key="view"
              initial={{ opacity: 0, y: 4, filter: 'blur(3px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -3, filter: 'blur(2px)' }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="font-mono text-[10px] tracking-[0.18em] uppercase"
              style={{
                color: 'var(--color-text-primary)',
                lineHeight: 1,
              }}
            >
              View
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Press ripple — keyed by pressTick so each click remounts & replays.
          Not wrapped in AnimatePresence: rapid presses should replace the
          previous ripple cleanly rather than animate two concurrently. */}
      {pressTick > 0 && visible && !ringHidden && (
        <motion.div
          key={pressTick}
          aria-hidden
          className="pointer-events-none fixed top-0 left-0 z-10000 rounded-full will-change-transform"
          style={{
            x: ringX,
            y: ringY,
            width: ringSize,
            height: ringSize,
            marginLeft: -(ringSize / 2),
            marginTop: -(ringSize / 2),
            border: accent
              ? '1px solid rgba(212, 255, 0, 0.55)'
              : '1px solid rgba(180, 180, 180, 0.75)',
            mixBlendMode: 'difference',
          }}
          initial={{ opacity: 0.55, scale: 0.96 }}
          animate={{ opacity: 0, scale: 1.9 }}
          transition={{
            duration: CURSOR_RIPPLE_S,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      )}
    </>
  )
}
