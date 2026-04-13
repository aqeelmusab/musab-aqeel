const SOCIAL_LINKS = [
  { label: 'GitHub', href: 'https://github.com/aqeelspark' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/aqeelmusab' },
  { label: 'X / Twitter', href: 'https://x.com/aqeelmusab' },
]

export default function Footer() {
  return (
    <footer
      className="py-8 px-6 md:px-12 lg:px-24"
      style={{ borderTop: '1px solid var(--color-border-sub)' }}
    >
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p
          className="text-xs font-mono"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          &copy; {new Date().getFullYear()} Musab Aqeel. All rights reserved.
        </p>

        <div className="flex items-center">
          {SOCIAL_LINKS.map(({ label, href }, i) => (
            <div key={label} className="flex items-center">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className="w-px h-3 mx-4 block"
                  style={{ backgroundColor: 'var(--color-accent-border)' }}
                />
              )}
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono transition-colors duration-200 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
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
