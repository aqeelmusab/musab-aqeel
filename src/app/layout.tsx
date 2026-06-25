import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import type { ReactNode } from 'react'
import MainWrapper from '@/components/layout/main-wrapper/MainWrapper'
import Nav from '@/components/layout/nav/Nav'
import CustomCursor from '@/components/ui/cursor/CustomCursor'
import InputModalityWatcher from '@/components/ui/InputModalityWatcher'
import Intro from '@/components/ui/intro/Intro'
import IntroFilterDefs from '@/components/ui/intro/IntroFilterDefs'
import {
  SITE_NAME,
  SITE_SHORT_TITLE,
  SITE_TITLE,
  SITE_URL,
  TWITTER_HANDLE,
} from '@/lib/config'
import { IntroProvider } from '@/lib/contexts/IntroContext'
import SmoothScroll from '@/lib/contexts/SmoothScroll'
import { scroll } from '@/lib/motion'
import { APP_VERSION } from '@/lib/package-version'
import { personJsonLd, websiteJsonLd } from '@/lib/structured-data'
import './globals.css'

const clashDisplay = localFont({
  src: [
    {
      path: '../../public/fonts/ClashDisplay/ClashDisplay-Regular.woff2',
      weight: '400',
    },
    {
      path: '../../public/fonts/ClashDisplay/ClashDisplay-Medium.woff2',
      weight: '500',
    },
    {
      path: '../../public/fonts/ClashDisplay/ClashDisplay-Semibold.woff2',
      weight: '600',
    },
    {
      path: '../../public/fonts/ClashDisplay/ClashDisplay-Bold.woff2',
      weight: '700',
    },
  ],
  variable: '--font-display',
  display: 'swap',
})

const satoshi = localFont({
  src: [
    { path: '../../public/fonts/Satoshi/Satoshi-Light.woff2', weight: '300' },
    { path: '../../public/fonts/Satoshi/Satoshi-Regular.woff2', weight: '400' },
    { path: '../../public/fonts/Satoshi/Satoshi-Medium.woff2', weight: '500' },
    { path: '../../public/fonts/Satoshi/Satoshi-Bold.woff2', weight: '700' },
  ],
  variable: '--font-body',
  display: 'swap',
})

const fragmentMono = localFont({
  src: [
    {
      path: '../../public/fonts/FragmentMono/FragmentMono-Regular.woff2',
      weight: '400',
    },
  ],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Full stack developer and studio founder delivering complete builds from design to deployment in weeks, not months. Based in Pakistan, working worldwide.',
  keywords: [
    'full stack developer',
    'web developer',
    'freelance developer',
    'Next.js developer',
    'React developer',
    'TypeScript',
    'Node.js',
    'Pakistan developer',
    'remote developer',
    'studio founder',
    'Dupixo',
    'web application',
    'e-commerce developer',
    'SaaS developer',
    'UI engineer',
    'design to deployment',
    'fast delivery',
    'Musab Aqeel',
  ],
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'Technology',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description:
      'I take complete projects from zero to production, across any stack, at a pace most teams cannot match.',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_SHORT_TITLE,
    description:
      'Complete builds from design to deployment in weeks, not months.',
    creator: TWITTER_HANDLE,
    images: ['/twitter-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: `/favicons/favicon.ico?v=${APP_VERSION}`, sizes: 'any' },
      {
        url: `/favicons/favicon.svg?v=${APP_VERSION}`,
        type: 'image/svg+xml',
      },
      {
        url: `/favicons/favicon-96x96.png?v=${APP_VERSION}`,
        sizes: '96x96',
        type: 'image/png',
      },
    ],
    apple: `/favicons/apple-touch-icon.png?v=${APP_VERSION}`,
  },
  manifest: `/favicons/site.webmanifest?v=${APP_VERSION}`,
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#131313',
}

function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${clashDisplay.variable} ${satoshi.variable} ${fragmentMono.variable}`}
    >
      <head>
        {/* JSON-LD is not subject to CSP script-src because it is not a script
          MIME type. */}
        <script type="application/ld+json">
          {serializeJsonLd(personJsonLd)}
        </script>
        <script type="application/ld+json">
          {serializeJsonLd(websiteJsonLd)}
        </script>
        {/* No-JS fallback: the reveal-on-scroll system, the intro screen, and
          the MainWrapper offset all rely on client-side JS to make content
          visible. Without JS, surface everything and hide the intro. */}
        <noscript>
          <style>{`[data-reveal],[data-main-wrapper]{opacity:1!important;transform:none!important}.intro{display:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <InputModalityWatcher />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {/* SVG filter defs mounted at body root so `url(#intro-threshold)`
            resolves reliably on iOS Safari. Must sit outside the fixed
            `.intro` container. */}
        <IntroFilterDefs />
        <IntroProvider>
          <Intro />
          <SmoothScroll>
            <MainWrapper>
              <Nav />
              <main
                id="main-content"
                tabIndex={-1}
                style={{ scrollMarginTop: `${scroll.headerOffset}px` }}
              >
                {children}
              </main>
            </MainWrapper>
          </SmoothScroll>
          <CustomCursor />
          <div className="noise" aria-hidden="true" />
        </IntroProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
