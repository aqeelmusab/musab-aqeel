import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <section className="min-h-[90dvh] flex flex-col px-6 md:px-12 lg:px-24 pt-32 pb-10">
      {/* Top: label */}
      <span
        className="text-xs uppercase tracking-widest mb-8 font-mono"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        {'// Error 404'}
      </span>

      {/* Center: massive 404 + message */}
      <div className="flex-1 flex flex-col justify-center max-w-[900px]">
        <h1
          className="font-bold tracking-tighter leading-[0.85] mb-6 font-display"
          style={{
            fontSize: 'clamp(6rem, 20vw, 14rem)',
            color: 'var(--color-text-primary)',
          }}
        >
          <span className="glitch-404" data-text="4" style={{ color: 'var(--color-text-primary)' }}>
            4
          </span>
          <span className="glitch-404" data-text="0" style={{ color: 'var(--color-text-tertiary)' }}>
            0
          </span>
          <span className="glitch-404" data-text="4" style={{ color: 'var(--color-text-primary)' }}>
            4
          </span>
        </h1>
        <p
          className="text-lg md:text-xl leading-relaxed max-w-[480px] mb-10 font-body"
          style={{
            fontWeight: 300,
            color: 'var(--color-text-secondary)',
          }}
        >
          The page you are looking for has been moved, deleted, or never existed.
          Either way, the work is elsewhere.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/" className="btn-outline md:px-8 md:py-3.5 md:text-base">
            Back to home
          </Link>
          <Link
            href="/work"
            className="btn-text md:text-base"
          >
            View work <span className="arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      {/* Bottom: subtle line */}
      <div className="flex items-end justify-between">
        <p
          className="text-[10px] uppercase tracking-widest font-mono"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          musabaqeel.com
        </p>
        <p
          className="text-[10px] uppercase tracking-widest font-mono"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          Page not found
        </p>
      </div>
    </section>
  )
}
