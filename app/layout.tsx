import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import SmoothScroll from '@/lib/SmoothScroll'
import Nav from '@/components/layout/Nav'
import CustomCursor from '@/components/ui/CustomCursor'
import { personJsonLd, websiteJsonLd } from '@/lib/structured-data'
import { SITE_URL } from '@/lib/config'
import './globals.css'

const clashDisplay = localFont({
  src: [
    { path: '../public/fonts/ClashDisplay/ClashDisplay-Regular.woff2', weight: '400' },
    { path: '../public/fonts/ClashDisplay/ClashDisplay-Medium.woff2', weight: '500' },
    { path: '../public/fonts/ClashDisplay/ClashDisplay-Semibold.woff2', weight: '600' },
    { path: '../public/fonts/ClashDisplay/ClashDisplay-Bold.woff2', weight: '700' },
  ],
  variable: '--font-display',
  display: 'swap',
})

const satoshi = localFont({
  src: [
    { path: '../public/fonts/Satoshi/Satoshi-Light.woff2', weight: '300' },
    { path: '../public/fonts/Satoshi/Satoshi-Regular.woff2', weight: '400' },
    { path: '../public/fonts/Satoshi/Satoshi-Medium.woff2', weight: '500' },
    { path: '../public/fonts/Satoshi/Satoshi-Bold.woff2', weight: '700' },
  ],
  variable: '--font-body',
  display: 'swap',
})

const fragmentMono = localFont({
  src: [
    { path: '../public/fonts/FragmentMono/FragmentMono-Regular.woff2', weight: '400' },
  ],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Musab Aqeel - Full Stack Developer, Architect & Operator',
    template: '%s | Musab Aqeel',
  },
  description: 'Full stack developer and studio founder delivering complete builds from design to deployment in weeks, not months. Based in Pakistan, working worldwide.',
  keywords: [
    'full stack developer', 'web developer', 'freelance developer', 'Next.js developer',
    'React developer', 'TypeScript', 'Node.js', 'Pakistan developer', 'remote developer',
    'studio founder', 'Dupixo', 'web application', 'e-commerce developer', 'SaaS developer',
    'UI engineer', 'design to deployment', 'fast delivery', 'Musab Aqeel',
  ],
  applicationName: 'Musab Aqeel',
  authors: [{ name: 'Musab Aqeel', url: SITE_URL }],
  creator: 'Musab Aqeel',
  publisher: 'Musab Aqeel',
  category: 'Technology',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Musab Aqeel',
    title: 'Musab Aqeel - Full Stack Developer, Architect & Operator',
    description: 'I take complete projects from zero to production, across any stack, at a pace most teams cannot match.',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Musab Aqeel - Full Stack Developer',
    description: 'Complete builds from design to deployment in weeks, not months.',
    creator: '@aqeelmusab',
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
      { url: '/favicons/favicon.ico', sizes: 'any' },
      { url: '/favicons/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicons/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: '/favicons/apple-touch-icon.png',
  },
  manifest: '/favicons/site.webmanifest',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#131313',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${clashDisplay.variable} ${satoshi.variable} ${fragmentMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body>
        <SmoothScroll>
          <Nav />
          {children}
        </SmoothScroll>
        <CustomCursor />
        <div className="noise" aria-hidden="true" />
      </body>
    </html>
  )
}
