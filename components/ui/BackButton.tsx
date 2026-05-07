'use client'

import { useRouter } from 'next/navigation'

interface BackButtonProps {
  fallbackHref?: string
}

export default function BackButton({ fallbackHref = '/' }: BackButtonProps) {
  const router = useRouter()

  function handleBack() {
    let hasSameOriginReferrer = false
    if (document.referrer.length > 0) {
      try {
        hasSameOriginReferrer =
          new URL(document.referrer).origin === window.location.origin
      } catch {
        hasSameOriginReferrer = false
      }
    }

    if (window.history.length > 1 && hasSameOriginReferrer) {
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
