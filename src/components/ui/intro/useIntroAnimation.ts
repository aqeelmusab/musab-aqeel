'use client'

import { useEffect, useRef, useState } from 'react'

import { INTRO_DURATION_MS } from '@/lib/motion'

/**
 * Intro choreography: three-word morph cycles through the role words.
 * With `textIndexRef` seeded at `TEXTS.length - 1`, the sequence is:
 *   cooldown (show "Developer") → morph → cooldown (show "Architect") →
 *   morph → hold on "Operator".
 * Total visible animation = 2 × (MORPH_TIME + COOLDOWN_TIME) = 2.8 s.
 * Combined with INTRO_DURATION_MS = 3000 ms, "Operator" holds for ~200 ms
 * before the page reveal begins.
 *
 * Per-span `filter: blur(px)` + `opacity` pairs with the container's
 * `contrast(28)` to produce the gooey threshold melt — see the doc
 * comment in `Intro.tsx` for the full compositing recipe.
 *
 * Blur values use a reciprocal curve (8 / f - 8) — same shape as the
 * original — so the spread stays subtle for most of the transition and
 * only spikes near the edges, which is where the contrast threshold
 * produces the characteristic "droplet breaking apart" look.
 */
const TEXTS = ['Developer', 'Architect', 'Operator']
const MORPH_TIME = 1.0
const COOLDOWN_TIME = 0.4

function updateMorphStyles(
  text1: HTMLSpanElement,
  text2: HTMLSpanElement,
  textIndex: number,
  fraction: number,
) {
  // text2 is incoming (fraction 0→1), text1 is outgoing.
  text2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`
  text2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`

  const inverseFraction = 1 - fraction
  text1.style.filter = `blur(${Math.min(8 / inverseFraction - 8, 100)}px)`
  text1.style.opacity = `${Math.pow(inverseFraction, 0.4) * 100}%`

  text1.textContent = TEXTS[textIndex % TEXTS.length] ?? ''
  text2.textContent = TEXTS[(textIndex + 1) % TEXTS.length] ?? ''
}

function resetCooldownStyles(text1: HTMLSpanElement, text2: HTMLSpanElement) {
  text1.style.filter = ''
  text1.style.opacity = '0'
  text2.style.filter = ''
  text2.style.opacity = '1'
}

export function useIntroAnimation({ isVisible }: { isVisible: boolean }) {
  const [displayProgress, setDisplayProgress] = useState(0)

  const text1Ref = useRef<HTMLSpanElement>(null)
  const text2Ref = useRef<HTMLSpanElement>(null)
  const rafRef = useRef<number>(0)

  const textIndexRef = useRef(TEXTS.length - 1)
  const timeRef = useRef(0)
  const morphRef = useRef(0)
  const cooldownRef = useRef(COOLDOWN_TIME)
  const startTimeRef = useRef(0)
  const prevRoundedRef = useRef(0)
  const reachedLastRef = useRef(false)

  useEffect(() => {
    const text1 = text1Ref.current
    const text2 = text2Ref.current
    if (!text1 || !text2) {
      return
    }

    const initialTime = Date.now()
    timeRef.current = initialTime
    startTimeRef.current = initialTime

    text1.textContent = TEXTS[textIndexRef.current % TEXTS.length] ?? ''
    text2.textContent = TEXTS[(textIndexRef.current + 1) % TEXTS.length] ?? ''

    const maxIndex = textIndexRef.current + TEXTS.length - 1

    function doMorph() {
      morphRef.current -= cooldownRef.current
      cooldownRef.current = 0

      let fraction = morphRef.current / MORPH_TIME
      if (fraction > 1) {
        cooldownRef.current = COOLDOWN_TIME
        fraction = 1
      }

      updateMorphStyles(text1!, text2!, textIndexRef.current, fraction)
    }

    function doCooldown() {
      morphRef.current = 0
      resetCooldownStyles(text1!, text2!)
    }

    function animateFrame() {
      const now = Date.now()
      const elapsed = now - startTimeRef.current
      const deltaSeconds = (now - timeRef.current) / 1000
      timeRef.current = now

      // Cosmetic progress counter: linear elapsed time, 0–100.
      const rounded = Math.min(
        Math.round((elapsed / INTRO_DURATION_MS) * 100),
        100,
      )
      if (rounded !== prevRoundedRef.current) {
        prevRoundedRef.current = rounded
        setDisplayProgress(rounded)
      }

      if (reachedLastRef.current) {
        rafRef.current = requestAnimationFrame(animateFrame)
        return
      }

      const shouldIncrement = cooldownRef.current > 0
      cooldownRef.current -= deltaSeconds

      if (cooldownRef.current <= 0) {
        if (shouldIncrement) {
          if (textIndexRef.current < maxIndex) {
            textIndexRef.current++
          } else {
            reachedLastRef.current = true
            doCooldown()
            rafRef.current = requestAnimationFrame(animateFrame)
            return
          }
        }

        doMorph()
      } else {
        doCooldown()
      }

      rafRef.current = requestAnimationFrame(animateFrame)
    }

    rafRef.current = requestAnimationFrame(animateFrame)

    return () => {
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  useEffect(() => {
    if (!isVisible) {
      cancelAnimationFrame(rafRef.current)
    }
  }, [isVisible])

  return {
    displayProgress,
    text1Ref,
    text2Ref,
  }
}
