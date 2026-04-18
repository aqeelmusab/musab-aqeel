'use client'

import { useRouter } from 'next/navigation'

interface BackButtonProps {
  fallbackHref?: string
}

export default function BackButton({ fallbackHref = '/' }: BackButtonProps) {
  const router = useRouter()

  function handleBack() {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(fallbackHref)
    }
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="font-body mb-8 inline-flex items-center gap-2 text-sm"
      style={{ color: 'var(--color-text-secondary)' }}
    >
      ← Back
    </button>
  )
}
