import Link from 'next/link'
import type { Metadata } from 'next'
import { PAGE_TITLE_NOT_FOUND, SITE_DOMAIN } from '@/lib/config'

export const metadata: Metadata = {
  title: PAGE_TITLE_NOT_FOUND,
  description: 'The page you are looking for does not exist.',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <section className="flex min-h-[90dvh] flex-col px-6 pt-32 pb-10 md:px-12 lg:px-24">
      {/* Top: label */}
      <span
        className="mb-8 font-mono text-xs tracking-widest uppercase"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        <span aria-hidden="true">{'// '}</span>
        Error 404
      </span>

      {/* Center: massive 404 + message */}
      <div className="flex max-w-225 flex-1 flex-col justify-center">
        <h1
          className="font-display mb-6 leading-[0.85] font-bold tracking-tighter"
          style={{
            fontSize: 'clamp(6rem, 20vw, 14rem)',
            color: 'var(--color-text-primary)',
          }}
        >
          <span
            className="glitch-404"
            data-text="4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            4
          </span>
          <span
            className="glitch-404"
            data-text="0"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            0
          </span>
          <span
            className="glitch-404"
            data-text="4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            4
          </span>
        </h1>
        <p
          className="font-body mb-10 max-w-120 text-lg leading-relaxed md:text-xl"
          style={{
            fontWeight: 300,
            color: 'var(--color-text-secondary)',
          }}
        >
          The page you are looking for has been moved, deleted, or never
          existed. Either way, the work is elsewhere.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/" className="btn-outline md:px-8 md:py-3.5 md:text-base">
            Back to home
          </Link>
          <Link href="/work" className="btn-text md:text-base">
            View work{' '}
            <span className="arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </div>

      {/* Bottom: subtle line */}
      <div className="flex items-end justify-between">
        <p
          className="font-mono text-[10px] tracking-widest uppercase"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          {SITE_DOMAIN}
        </p>
        <p
          className="font-mono text-[10px] tracking-widest uppercase"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          Page not found
        </p>
      </div>
    </section>
  )
}
