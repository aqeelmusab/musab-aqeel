'use client'

import { AnimatePresence, motion, type MotionValue } from 'motion/react'

import {
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
  ringScale: MotionValue<number>
  ringSize: number
  ringX: MotionValue<number>
  ringY: MotionValue<number>
  visible: boolean
}

export function CursorVisual({
  dotHidden,
  dotScale,
  dotX,
  dotY,
  hoverState,
  ringScale,
  ringSize,
  ringX,
  ringY,
  visible,
}: CursorVisualProps) {
  return (
    <>
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
        animate={{
          opacity: visible && !dotHidden ? 1 : 0,
        }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
      />

      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-10000 flex items-center justify-center rounded-full will-change-transform"
        style={{
          x: ringX,
          y: ringY,
          scale: ringScale,
          marginLeft: -(ringSize / 2),
          marginTop: -(ringSize / 2),
          border: '1px solid var(--color-border-up)',
          backgroundColor: 'rgba(0, 0, 0, 0)',
          mixBlendMode: 'difference',
        }}
        animate={{
          width: ringSize,
          height: ringSize,
          marginLeft: -(ringSize / 2),
          marginTop: -(ringSize / 2),
          opacity: visible ? 1 : 0,
          backgroundColor:
            hoverState !== 'default'
              ? 'rgba(212, 255, 0, 0.07)'
              : 'rgba(0, 0, 0, 0)',
          borderColor:
            hoverState !== 'default'
              ? 'rgba(212, 255, 0, 0.18)'
              : 'rgba(115, 115, 115, 1)',
        }}
        transition={{
          duration: 0.28,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <AnimatePresence mode="wait">
          {hoverState === 'project' && (
            <motion.span
              key="view"
              initial={{ opacity: 0, y: 5, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -3, filter: 'blur(2px)' }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="font-mono text-[10px] tracking-widest uppercase"
              style={{ color: 'var(--color-text-primary)' }}
            >
              View
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}
