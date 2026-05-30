'use client'

import { useEffect } from 'react'

/**
 * Tracks whether the user is currently navigating via keyboard and reflects it
 * on `<html data-input-modality>`. CSS can then show a focus ring only for
 * keyboard users: `:focus-visible` is not enough on its own because the spec
 * always treats a focused text field as focus-visible (even on pointer focus),
 * so a pure-CSS approach lights up the ring on every click/tap.
 *
 * Tab switches to keyboard mode; any pointer interaction switches back. Typing
 * (non-Tab keys) does not flip modality, so clicking into a field and typing
 * keeps it in pointer mode.
 */
export default function InputModalityWatcher() {
  useEffect(() => {
    const root = document.documentElement

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        root.setAttribute('data-input-modality', 'keyboard')
      }
    }

    const onPointerDown = () => {
      root.setAttribute('data-input-modality', 'pointer')
    }

    window.addEventListener('keydown', onKeyDown, true)
    window.addEventListener('pointerdown', onPointerDown, true)

    return () => {
      window.removeEventListener('keydown', onKeyDown, true)
      window.removeEventListener('pointerdown', onPointerDown, true)
    }
  }, [])

  return null
}
