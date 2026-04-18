import { ImageResponse } from 'next/og'
import type { ReactNode } from 'react'

import { SITE_DOMAIN, SITE_NAME } from '@/lib/config'

export const SOCIAL_IMAGE_RUNTIME = 'edge'
export const SOCIAL_IMAGE_SIZE = { width: 1200, height: 630 }
export const SOCIAL_IMAGE_CONTENT_TYPE = 'image/png'

const colors = {
  accent: '#d4ff00',
  background: '#0d0d0d',
  border: '#222',
  dimText: '#555',
  mutedText: '#3a3a3a',
  projectLabel: '#333',
  projectFooter: '#2e2e2e',
  primaryText: '#f0f0f0',
  secondaryHeadline: '#1e1e1e',
} as const

const homeTags = ['Full Stack', 'Next.js', 'TypeScript'] as const

function AccentTopBar() {
  return <div style={{ height: '3px', backgroundColor: colors.accent, flexShrink: 0 }} />
}

function DomainBadge() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div
        style={{
          width: '8px',
          height: '8px',
          backgroundColor: colors.accent,
          transform: 'rotate(45deg)',
        }}
      />
      <span
        style={{
          color: colors.dimText,
          fontSize: '13px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        {SITE_DOMAIN}
      </span>
    </div>
  )
}

function AvailabilityBadge() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div
        style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          backgroundColor: colors.accent,
        }}
      />
      <span
        style={{
          color: colors.accent,
          fontSize: '12px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        Available for work
      </span>
    </div>
  )
}

function TagRow({
  tags,
  uppercase = true,
}: {
  tags: readonly string[]
  uppercase?: boolean
}) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {tags.map((tag) => (
        <div
          key={tag}
          style={{
            padding: '5px 14px',
            border: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              color: colors.mutedText,
              fontSize: '12px',
              letterSpacing: '0.06em',
              ...(uppercase ? { textTransform: 'uppercase' as const } : {}),
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
  children,
  footerLeft,
  footerRight,
}: {
  headerRight: ReactNode
  children: ReactNode
  footerLeft: ReactNode
  footerRight: ReactNode
}) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: colors.background,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AccentTopBar />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '52px 72px 60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <DomainBadge />
          {headerRight}
        </div>

        {children}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {footerLeft}
          {footerRight}
        </div>
      </div>
    </div>
  )
}

function HomeHeadline() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span
        style={{
          fontSize: '82px',
          fontWeight: 700,
          color: colors.primaryText,
          lineHeight: 1,
          letterSpacing: '-0.03em',
        }}
      >
        {SITE_NAME}.
      </span>
      <span
        style={{
          fontSize: '82px',
          fontWeight: 700,
          color: colors.secondaryHeadline,
          lineHeight: 1,
          letterSpacing: '-0.03em',
        }}
      >
        Developer.
      </span>
      <span
        style={{
          fontSize: '82px',
          fontWeight: 700,
          color: colors.secondaryHeadline,
          lineHeight: 1,
          letterSpacing: '-0.03em',
        }}
      >
        Architect. Operator.
      </span>
    </div>
  )
}

export function createHomeSocialImage() {
  return new ImageResponse(
    (
      <SocialImageFrame
        headerRight={<AvailabilityBadge />}
        footerLeft={
          <span
            style={{
              color: colors.mutedText,
              fontSize: '18px',
              lineHeight: 1.5,
              maxWidth: '540px',
            }}
          >
            Complete builds from design to deployment in weeks, not months.
          </span>
        }
        footerRight={<TagRow tags={homeTags} />}
      >
        <HomeHeadline />
      </SocialImageFrame>
    ),
    { ...SOCIAL_IMAGE_SIZE },
  )
}

export function createProjectSocialImage({
  title,
  type,
  tags,
}: {
  title: string
  type: string
  tags: readonly string[]
}) {
  return new ImageResponse(
    (
      <SocialImageFrame
        headerRight={
          <span
            style={{
              color: colors.projectLabel,
              fontSize: '13px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Case Study
          </span>
        }
        footerLeft={<TagRow tags={tags} uppercase={false} />}
        footerRight={
          <span
            style={{
              color: colors.projectFooter,
              fontSize: '13px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            {SITE_NAME}
          </span>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <span
            style={{
              color: colors.accent,
              fontSize: '13px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            {type}
          </span>
          <span
            style={{
              fontSize: '74px',
              fontWeight: 700,
              color: colors.primaryText,
              lineHeight: 1,
              letterSpacing: '-0.025em',
            }}
          >
            {title}.
          </span>
        </div>
      </SocialImageFrame>
    ),
    { ...SOCIAL_IMAGE_SIZE },
  )
}
