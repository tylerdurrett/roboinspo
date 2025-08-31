import type { Metadata } from 'next'
import './globals.css'
import localFont from 'next/font/local'

const brachial = localFont({
  // Path is relative to this file on the filesystem (not the public URL)
  src: '../../public/fonts/variable.ttf',
  display: 'swap',
  variable: '--font-brachial',
})

const TITLE = 'Robo Inspo'
const DESCRIPTION = 'Slop Review'
const IMAGE = '/static/opengraph.jpg'

export function generateMetadata(): Metadata {
  const isProduction = process.env.VERCEL_ENV === 'production'
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL

  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_SITE_URL is not set')
  }

  return {
    metadataBase: new URL(baseUrl),
    title: TITLE,
    description: DESCRIPTION,
    robots: isProduction ? undefined : { index: false, follow: false },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      images: [
        {
          url: IMAGE,
          width: 1200,
          height: 630,
          alt: TITLE,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: TITLE,
      description: DESCRIPTION,
      images: [IMAGE],
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${brachial.variable} dark`}>
      <head>
        <link
          rel="preconnect"
          href="https://use.typekit.net"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href="https://use.typekit.net/rlo7jqr.css" />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
