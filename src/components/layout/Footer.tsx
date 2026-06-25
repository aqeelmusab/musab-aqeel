import CurrentYear from '@/components/ui/CurrentYear'
import { SITE_NAME, SOCIAL_LINKS } from '@/lib/config'

export default function Footer() {
  return (
    <footer
      className="px-6 py-8 md:px-12 lg:px-24"
      style={{ borderTop: '1px solid var(--color-border-sub)' }}
    >
      <div className="mx-auto flex max-w-350 flex-col items-center justify-between gap-4 md:flex-row">
        <p
          className="font-mono text-xs"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          &copy; <CurrentYear /> {SITE_NAME}. All rights reserved.
        </p>

        <div className="flex items-center">
          {SOCIAL_LINKS.map(({ label, href }, i) => (
            <div key={label} className="flex items-center">
              {i > 0 && (
                <svg
                  aria-hidden="true"
                  className="mx-4 shrink-0"
                  width="7"
                  height="7"
                  viewBox="-7 -7 14 14"
                  style={{ fill: 'var(--color-text-primary)' }}
                >
                  <path d="M0,-6 L1.8,-1.8 L6,0 L1.8,1.8 L0,6 L-1.8,1.8 L-6,0 L-1.8,-1.8 Z" />
                </svg>
              )}
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-(--color-text-tertiary) transition-colors duration-200 hover:text-(--color-text-primary)"
              >
                {label}
              </a>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}
