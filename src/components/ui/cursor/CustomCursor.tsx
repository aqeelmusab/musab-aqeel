'use client'

import { CursorVisual } from '@/components/ui/cursor/CursorVisual'
import { useCustomCursor } from '@/components/ui/cursor/useCustomCursor'

export default function CustomCursor() {
  const cursor = useCustomCursor()

  if (cursor.reducedMotion) {
    return null
  }

  return <CursorVisual {...cursor} />
}
