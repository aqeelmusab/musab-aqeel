'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

import { CONTACT_EMAIL } from '@/lib/config'

const COPIED_RESET_MS = 2000

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Fall through to the legacy path below.
  }

  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const succeeded = document.execCommand('copy')
    document.body.removeChild(textarea)
    return succeeded
  } catch {
    return false
  }
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export default function CopyEmail() {
  const [copied, setCopied] = useState(false)

  const rootRef = useRef<HTMLButtonElement>(null)
  const iconRef = useRef<HTMLSpanElement>(null)
  const pageRef = useRef<SVGPathElement>(null)
  const checkRef = useRef<SVGPathElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(pageRef.current, { transformOrigin: 'center' })
      gsap.set(checkRef.current, { strokeDasharray: 8, strokeDashoffset: 8 })
      gsap.set(labelRef.current, { autoAlpha: 0, x: -6 })
    }, rootRef)

    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
      timelineRef.current?.kill()
      ctx.revert()
    }
  }, [])

  const playCopied = useCallback(() => {
    timelineRef.current?.kill()
    // Start from a clean idle page in case a previous reset was interrupted.
    gsap.set(pageRef.current, { rotation: 0, y: 0, autoAlpha: 1 })

    if (prefersReducedMotion()) {
      gsap.set(checkRef.current, { strokeDashoffset: 0 })
      gsap.set(labelRef.current, { autoAlpha: 1, x: 0 })
      return
    }

    const tl = gsap.timeline()
    // Icon pop with a little overshoot.
    tl.to(
      iconRef.current,
      { scale: 1.2, duration: 0.16, ease: 'power2.out' },
      0,
    )
      .to(
        iconRef.current,
        { scale: 1, duration: 0.5, ease: 'back.out(2.5)' },
        0.16,
      )
      // Accent check draws in.
      .to(
        checkRef.current,
        { strokeDashoffset: 0, duration: 0.4, ease: 'power2.out' },
        0.05,
      )
      // "Copied" label slides in.
      .to(
        labelRef.current,
        { autoAlpha: 1, x: 0, duration: 0.35, ease: 'power3.out' },
        0.1,
      )

    timelineRef.current = tl
  }, [])

  const playReset = useCallback(() => {
    timelineRef.current?.kill()

    if (prefersReducedMotion()) {
      gsap.set(pageRef.current, { rotation: 0, y: 0, autoAlpha: 1 })
      gsap.set(checkRef.current, { strokeDashoffset: 8 })
      gsap.set(labelRef.current, { autoAlpha: 0, x: -6 })
      return
    }

    const tl = gsap.timeline()
    // The front page tears off: rotate, slide down, fade.
    tl.to(
      pageRef.current,
      {
        rotation: 10,
        y: 18,
        autoAlpha: 0,
        duration: 0.45,
        ease: 'back.in(1.4)',
      },
      0,
    )
      // Check un-draws and label slides out alongside the tear.
      .to(
        checkRef.current,
        { strokeDashoffset: 8, duration: 0.3, ease: 'power2.in' },
        0,
      )
      .to(
        labelRef.current,
        { autoAlpha: 0, x: -6, duration: 0.25, ease: 'power2.in' },
        0,
      )
      // The page sits exactly over the static base, so restoring it is invisible.
      .set(pageRef.current, { rotation: 0, y: 0, autoAlpha: 1 })

    timelineRef.current = tl
  }, [])

  const handleCopy = useCallback(async () => {
    const succeeded = await copyToClipboard(CONTACT_EMAIL)
    if (!succeeded) return

    setCopied(true)
    playCopied()

    if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
    resetTimerRef.current = setTimeout(() => {
      setCopied(false)
      playReset()
    }, COPIED_RESET_MS)
  }, [playCopied, playReset])

  return (
    <button
      ref={rootRef}
      type="button"
      onClick={handleCopy}
      aria-label={`Copy email address ${CONTACT_EMAIL}`}
      className="copy-clipboard group text-theme-primary hover:bg-theme-surface-up -mx-2 inline-flex items-center gap-2 rounded-xs px-2 py-1 transition-colors duration-200"
    >
      <span className="font-body relative text-lg font-medium">
        {CONTACT_EMAIL}
        <span
          className="bg-theme-primary absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
          style={{ transitionTimingFunction: 'var(--ease-out)' }}
        />
      </span>

      <span
        ref={iconRef}
        aria-hidden="true"
        className="text-theme-tertiary group-hover:text-theme-primary relative inline-block h-4 w-4 shrink-0 transition-colors duration-200"
      >
        <svg
          viewBox="0 0 16 32"
          className="absolute top-0 left-0 h-8 w-4"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M3 12.75V4.25C3 3.42157 3.67157 2.75 4.5 2.75H12C12.8284 2.75 13.5 3.42157 13.5 4.25V12.75C13.5 13.5784 12.8284 14.25 12 14.25H4.5C3.67157 14.25 3 13.5784 3 12.75Z" />
          <path
            ref={pageRef}
            d="M3 12.75V4.25C3 3.42157 3.67157 2.75 4.5 2.75H12C12.8284 2.75 13.5 3.42157 13.5 4.25V12.75C13.5 13.5784 12.8284 14.25 12 14.25H4.5C3.67157 14.25 3 13.5784 3 12.75Z"
            className="page"
          />
          <path
            ref={checkRef}
            d="M6.25 9.75L7.75 11.25L10.25 7.75"
            className="check"
          />
          <path d="M7 1.75001C6.72386 1.75001 6.5 1.97387 6.5 2.25001V3.5C6.5 4.4665 7.2835 5.25 8.25 5.25C9.2165 5.25 10 4.4665 10 3.5V2.25C10 1.97386 9.77614 1.75 9.5 1.75L7 1.75001Z" />
        </svg>
      </span>

      <span
        ref={labelRef}
        aria-hidden="true"
        className="text-theme-accent font-mono text-xs"
      >
        Copied
      </span>

      <span role="status" aria-live="polite" className="sr-only">
        {copied ? `${CONTACT_EMAIL} copied to clipboard` : ''}
      </span>
    </button>
  )
}
