'use client'

import { useEffect, useRef, useState } from 'react'

import { LOADER_DURATION_MS } from '@/lib/motion'

const TEXTS = ['Developer', 'Architect', 'Operator', 'Loading']
const MORPH_TIME = 0.8
const COOLDOWN_TIME = 0.3

function updateMorphStyles(
  text1: HTMLSpanElement,
  text2: HTMLSpanElement,
  textIndex: number,
  fraction: number,
) {
  text2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`
  text2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`

  const inverseFraction = 1 - fraction
  text1.style.filter = `blur(${Math.min(8 / inverseFraction - 8, 100)}px)`
  text1.style.opacity = `${Math.pow(inverseFraction, 0.4) * 100}%`

  text1.textContent = TEXTS[textIndex % TEXTS.length]
  text2.textContent = TEXTS[(textIndex + 1) % TEXTS.length]
}

function resetCooldownStyles(text1: HTMLSpanElement, text2: HTMLSpanElement) {
  text2.style.filter = ''
  text2.style.opacity = '100%'
  text1.style.filter = ''
  text1.style.opacity = '0%'
}

export function useLoaderAnimation({
  assetsReady,
  isLoading,
  progress,
}: {
  assetsReady: boolean
  isLoading: boolean
  progress: number
}) {
  const [displayProgress, setDisplayProgress] = useState(0)

  const text1Ref = useRef<HTMLSpanElement>(null)
  const text2Ref = useRef<HTMLSpanElement>(null)
  const rafRef = useRef<number>(0)

  const textIndexRef = useRef(TEXTS.length - 1)
  const timeRef = useRef(0)
  const morphRef = useRef(0)
  const cooldownRef = useRef(COOLDOWN_TIME)
  const startTimeRef = useRef(0)
  const displayRef = useRef(0)
  const prevRoundedRef = useRef(0)
  const reachedLastRef = useRef(false)

  const assetsReadyRef = useRef(false)
  const progressRef = useRef(0)

  useEffect(() => {
    assetsReadyRef.current = assetsReady
  }, [assetsReady])

  useEffect(() => {
    progressRef.current = progress
  }, [progress])

  useEffect(() => {
    const text1 = text1Ref.current
    const text2 = text2Ref.current
    if (!text1 || !text2) {
      return
    }

    const primaryText: HTMLSpanElement = text1
    const secondaryText: HTMLSpanElement = text2

    const initialTime = Date.now()
    timeRef.current = initialTime
    startTimeRef.current = initialTime

    primaryText.textContent = TEXTS[textIndexRef.current % TEXTS.length]
    secondaryText.textContent = TEXTS[(textIndexRef.current + 1) % TEXTS.length]

    const maxIndex = textIndexRef.current + TEXTS.length - 1

    function doMorph() {
      morphRef.current -= cooldownRef.current
      cooldownRef.current = 0

      let fraction = morphRef.current / MORPH_TIME
      if (fraction > 1) {
        cooldownRef.current = COOLDOWN_TIME
        fraction = 1
      }

      updateMorphStyles(primaryText, secondaryText, textIndexRef.current, fraction)
    }

    function doCooldown() {
      morphRef.current = 0
      resetCooldownStyles(primaryText, secondaryText)
    }

    function animateFrame() {
      const now = Date.now()
      const elapsed = now - startTimeRef.current
      const deltaSeconds = (now - timeRef.current) / 1000
      timeRef.current = now

      if (assetsReadyRef.current) {
        const linearTarget = Math.min((elapsed / LOADER_DURATION_MS) * 100, 100)
        if (linearTarget >= 100) {
          displayRef.current += (100 - displayRef.current) * 0.12
        } else {
          displayRef.current = linearTarget
        }
      } else {
        displayRef.current += (progressRef.current - displayRef.current) * 0.08
      }

      const rounded = Math.min(Math.round(displayRef.current), 100)
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
    if (!isLoading) {
      cancelAnimationFrame(rafRef.current)
    }
  }, [isLoading])

  return {
    displayProgress,
    text1Ref,
    text2Ref,
  }
}
