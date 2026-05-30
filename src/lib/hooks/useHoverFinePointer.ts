'use client'

import { useSyncExternalStore } from 'react'

/**
 * `true` when the primary pointer is both fine and hover-capable (a mouse or
 * trackpad). Used to gate hover-only affordances such as the magnetic button
 * effect, which has no meaning, and causes glitches, on touch devices.
 *
 * Server snapshot returns `false` so SSR matches a touch-first render and the
 * effect is progressively enabled on the first client tick for fine pointers.
 */
const QUERY = '(hover: hover) and (pointer: fine)'

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches
}

function getServerSnapshot() {
  return false
}

export function useHoverFinePointer() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
