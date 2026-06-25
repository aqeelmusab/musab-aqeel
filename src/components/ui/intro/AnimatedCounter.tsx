'use client'

import { motion } from 'motion/react'

import { ease } from '@/lib/motion'

/**
 * Counter styled to match the SplitText pattern used elsewhere on the site:
 * each character sits inside an `overflow-hidden` wrapper and its inner
 * span rises from `y: 110%` to `0%` with a staggered delay, just like the
 * headline reveals.
 *
 * Entry plays once on mount. The digit positions keep the same React keys
 * across renders, so as `value` climbs from 0 to 100 the digits update
 * their text content in place without re-triggering the entry animation.
 * A fixed three-slot width (padded with non-breaking spaces) keeps the
 * bracket frame from shifting as the number grows.
 */

interface AnimatedCounterProps {
  value: number
}

const COUNTER_PAD_CHAR = '\u00A0'
const BASE_DELAY = 0.1
const STAGGER = 0.04
const ENTRY_DURATION = 0.6

function padCounter(value: number): string {
  return String(value).padStart(3, COUNTER_PAD_CHAR)
}

export default function AnimatedCounter({ value }: AnimatedCounterProps) {
  const padded = padCounter(value)
  // Character positions are stable: React reconciles by index so the
  // digit spans update in place as `padded` changes, without remounting.
  const characters: readonly string[] = [
    '[',
    COUNTER_PAD_CHAR,
    padded[0]!,
    padded[1]!,
    padded[2]!,
    '%',
    COUNTER_PAD_CHAR,
    ']',
  ]

  return (
    <span
      role="img"
      className="font-mono text-sm text-white/60 tabular-nums md:text-base"
      aria-label={`${value} percent`}
    >
      {characters.map((char, index) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: character slots are positionally stable so digits update in place (see file header)
          key={index}
          aria-hidden="true"
          className="inline-block overflow-hidden align-bottom"
        >
          <motion.span
            className="inline-block"
            initial={{ y: '110%' }}
            animate={{ y: '0%' }}
            transition={{
              duration: ENTRY_DURATION,
              ease: ease.out,
              delay: BASE_DELAY + index * STAGGER,
            }}
          >
            {char}
          </motion.span>
        </span>
      ))}
    </span>
  )
}
