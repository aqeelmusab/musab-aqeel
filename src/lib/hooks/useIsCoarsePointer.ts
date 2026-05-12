'use client'

import { useSyncExternalStore } from 'react'

/**
 * `true` when the primary input is coarse (phones, most tablets) — i.e. a
 * touch-first device. Used to opt-out of effects that are expensive on mobile
 * GPUs, such as the SVG displacement "dust" filter on text reveals.
 *
 * Server snapshot returns `false` so SSR matches the desktop/fine-pointer
 * render, avoiding a hydration mismatch. The filter is progressively disabled
 * on first client tick if the device turns out to be coarse.
 */
function subscribe(onChange: () => void) {
  const mq = window.matchMedia('(pointer: coarse)')
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

function getSnapshot() {
  return window.matchMedia('(pointer: coarse)').matches
}

function getServerSnapshot() {
  return false
}

export function useIsCoarsePointer() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
