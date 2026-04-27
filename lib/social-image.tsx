import { ImageResponse } from 'next/og'
import type { CSSProperties, ReactNode } from 'react'

import { SITE_DOMAIN, SITE_NAME } from '@/lib/config'

/**
 * OG images intentionally use system fonts. The site's Clash Display / Fragment
 * Mono are WOFF2 only, and `next/og` (satori) doesn't decode WOFF2 under Node
 * runtime — edge runtime does, but Turbopack can't resolve
 * `new URL('...', import.meta.url)` at build time for prerender. System fonts
 * render cleanly at 1200×630 scale and keep builds deterministic; the
 * site-identity signal comes from palette, layout, grid, and mono labels.
 *
 * Routes declare `export const runtime = 'edge'` directly because Next.js
 * requires that field to be a literal string at the export site.
 */
export const SOCIAL_IMAGE_SIZE = { width: 1200, height: 630 } as const
export const SOCIAL_IMAGE_CONTENT_TYPE = 'image/png'

/**
 * Hex approximations of the site's oklch palette. Satori's color support
 * across oklch is patchy, so we resolve to hex once here.
 */
const palette = {
  bg: '#0b0b0b',
  surface: '#121212',
  borderSub: '#1c1c1c',
  border: '#262626',
  borderUp: '#3a3a3a',
  textPrimary: '#ededed',
  textSecondary: '#7a7a7a',
  textTertiary: '#4a4a4a',
  textDim: '#343434',
  accent: '#d4ff00',
} as const

const FONT_STACK_DISPLAY =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
const FONT_STACK_MONO =
  "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace"

const frameStyles = {
  root: {
    width: '100%',
    height: '100%',
    backgroundColor: palette.bg,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: FONT_STACK_DISPLAY,
    color: palette.textPrimary,
  },
  accentBar: {
    height: '3px',
    backgroundColor: palette.accent,
    flexShrink: 0,
  },
  grid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `repeating-linear-gradient(105deg, ${palette.border} 0px, ${palette.border} 1px, transparent 1px, transparent 14px)`,
    opacity: 0.28,
  },
  accentWash: {
    position: 'absolute',
    top: '-260px',
    right: '-220px',
    width: '820px',
    height: '820px',
    borderRadius: '50%',
    background: `radial-gradient(circle, rgba(212, 255, 0, 0.12) 0%, rgba(212, 255, 0, 0) 65%)`,
  },
  body: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '56px 72px 56px',
    position: 'relative',
    justifyContent: 'space-between',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  footerRow: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    zIndex: 1,
    gap: '32px',
  },
} satisfies Record<string, CSSProperties>

const monoLabelStyle: CSSProperties = {
  fontFamily: FONT_STACK_MONO,
  fontSize: '14px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: palette.textSecondary,
}

const monoDimLabelStyle: CSSProperties = {
  ...monoLabelStyle,
  color: palette.textTertiary,
}

function Diamond({
  size = 9,
  color = palette.accent,
}: {
  size?: number
  color?: string
}) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        transform: 'rotate(45deg)',
        flexShrink: 0,
      }}
    />
  )
}

function DomainBadge() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <Diamond />
      <span style={monoLabelStyle}>
        {'// '}
        {SITE_DOMAIN}
      </span>
    </div>
  )
}

function AvailabilityBadge() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 14px',
        border: `1px solid ${palette.border}`,
        borderRadius: '999px',
        backgroundColor: palette.surface,
      }}
    >
      <div
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: palette.accent,
        }}
      />
      <span
        style={{
          ...monoLabelStyle,
          color: palette.textPrimary,
          fontSize: '12px',
        }}
      >
        Available for work
      </span>
    </div>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        ...monoLabelStyle,
        color: palette.accent,
        fontSize: '13px',
      }}
    >
      {'// '}
      {children}
    </span>
  )
}

function Signature() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span
        style={{
          ...monoLabelStyle,
          color: palette.textTertiary,
          fontSize: '12px',
        }}
      >
        MA
      </span>
      <Diamond size={7} color={palette.borderUp} />
    </div>
  )
}

function TagChipRow({
  tags,
  tone = 'muted',
}: {
  tags: readonly string[]
  tone?: 'muted' | 'accent'
}) {
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {tags.map((tag) => (
        <div
          key={tag}
          style={{
            padding: '6px 12px',
            border: `1px solid ${tone === 'accent' ? palette.borderUp : palette.borderSub}`,
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: palette.surface,
          }}
        >
          <span
            style={{
              fontFamily: FONT_STACK_MONO,
              fontSize: '12px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color:
                tone === 'accent' ? palette.textPrimary : palette.textSecondary,
            }}
          >
            {tag}
          </span>
        </div>
      ))}
    </div>
  )
}

function SocialImageFrame({
  headerRight,
  footerLeft,
  footerRight,
  children,
}: {
  headerRight: ReactNode
  footerLeft: ReactNode
  footerRight: ReactNode
  children: ReactNode
}) {
  return (
    <div style={frameStyles.root}>
      <div style={frameStyles.accentBar} />
      <div style={frameStyles.body}>
        <div style={frameStyles.grid} />
        <div style={frameStyles.accentWash} />

        <div style={frameStyles.headerRow}>
          <DomainBadge />
          {headerRight}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1,
          }}
        >
          {children}
        </div>

        <div style={frameStyles.footerRow}>
          {footerLeft}
          {footerRight}
        </div>
      </div>
    </div>
  )
}

/**
 * Home OG — mirrors the site hero: large display headline, muted second line,
 * tagline + tech tag row at the bottom, availability pill top-right.
 */
export function createHomeSocialImage() {
  return new ImageResponse(
    <SocialImageFrame
      headerRight={<AvailabilityBadge />}
      footerLeft={
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            maxWidth: '520px',
          }}
        >
          <span
            style={{
              fontFamily: FONT_STACK_DISPLAY,
              fontWeight: 600,
              fontSize: '22px',
              lineHeight: 1.35,
              color: palette.textSecondary,
              letterSpacing: '-0.01em',
            }}
          >
            Design to deployment.
          </span>
          <span
            style={{
              fontFamily: FONT_STACK_DISPLAY,
              fontWeight: 600,
              fontSize: '22px',
              lineHeight: 1.35,
              color: palette.textTertiary,
              letterSpacing: '-0.01em',
            }}
          >
            Weeks, not months.
          </span>
        </div>
      }
      footerRight={
        <TagChipRow tags={['Full Stack', 'Next.js', 'TypeScript']} />
      }
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <SectionLabel>01 hero</SectionLabel>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <span
            style={{
              fontFamily: FONT_STACK_DISPLAY,
              fontWeight: 700,
              fontSize: '104px',
              lineHeight: 1,
              letterSpacing: '-0.035em',
              color: palette.textPrimary,
            }}
          >
            {SITE_NAME}.
          </span>
          <span
            style={{
              fontFamily: FONT_STACK_DISPLAY,
              fontWeight: 700,
              fontSize: '104px',
              lineHeight: 1,
              letterSpacing: '-0.035em',
              color: palette.textDim,
            }}
          >
            Developer.
          </span>
          <span
            style={{
              fontFamily: FONT_STACK_DISPLAY,
              fontWeight: 700,
              fontSize: '104px',
              lineHeight: 1,
              letterSpacing: '-0.035em',
              color: palette.textDim,
            }}
          >
            Architect. Operator.
          </span>
        </div>
      </div>
    </SocialImageFrame>,
    { ...SOCIAL_IMAGE_SIZE },
  )
}

/**
 * Project OG — mirrors the case-study hero: type label in mono, large title,
 * tag chip row, "case study" marker top-right.
 */
export function createProjectSocialImage({
  title,
  type,
  tags,
  year,
}: {
  title: string
  type: string
  tags: readonly string[]
  year?: string
}) {
  const tagsToShow = tags.slice(0, 4)

  return new ImageResponse(
    <SocialImageFrame
      headerRight={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span style={monoDimLabelStyle}>{'// '}case study</span>
        </div>
      }
      footerLeft={<TagChipRow tags={tagsToShow} tone="accent" />}
      footerRight={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          {year && (
            <span
              style={{
                ...monoLabelStyle,
                fontSize: '12px',
                color: palette.textTertiary,
              }}
            >
              {year}
            </span>
          )}
          <Signature />
        </div>
      }
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
        }}
      >
        <SectionLabel>{type}</SectionLabel>
        <span
          style={{
            fontFamily: FONT_STACK_DISPLAY,
            fontWeight: 700,
            fontSize: title.length > 18 ? '92px' : '112px',
            lineHeight: 1,
            letterSpacing: '-0.035em',
            color: palette.textPrimary,
            maxWidth: '1000px',
          }}
        >
          {title}.
        </span>
      </div>
    </SocialImageFrame>,
    { ...SOCIAL_IMAGE_SIZE },
  )
}
