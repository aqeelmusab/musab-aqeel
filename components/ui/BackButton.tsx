'use client'

import { useRouter } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()

  function handleBack() {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/work')
    }
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex items-center gap-2 text-sm mb-8 font-body"
      style={{ color: 'var(--color-text-secondary)' }}
    >
      ← Back
    </button>
  )
}
