import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#00D2BE",
}

export const metadata: Metadata = {
  metadataBase: new URL("https://sonnyau.dev"),
  title: {
    default: "Sonny Au - Full-Stack Software Engineer | React Native & AI Specialist",
    template: "%s | Sonny Au - Software Engineer",
  },
  description:
    "President's Scholar at SJSU specializing in full-stack development, React Native mobile apps, and machine learning. Co-founder of PalAte with 1,000+ users. Available for software engineering opportunities.",
  keywords: [
    "Sonny Au",
    "Software Engineer",
    "Full-Stack Developer",
    "React Native",
    "Next.js",
    "TypeScript",
    "Machine Learning",
    "SJSU",
    "San Jose State University",
    "PalAte",
    "Frontend Developer",
    "Mobile App Development",
    "PostgreSQL",
    "Python",
    "JavaScript",
  ],
  authors: [{ name: "Sonny Au", url: "https://sonnyau.dev" }],
  creator: "Sonny Au",
  publisher: "Sonny Au",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sonnyau.dev",
    siteName: "Sonny Au - Software Engineer",
    title: "Sonny Au - Full-Stack Software Engineer | React Native & AI Specialist",
    description:
      "President's Scholar at SJSU specializing in full-stack development, React Native mobile apps, and machine learning. Co-founder of PalAte with 1,000+ users.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sonny Au - Software Engineer Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sonny Au - Full-Stack Software Engineer",
    description:
      "President's Scholar at SJSU specializing in full-stack development, React Native mobile apps, and machine learning.",
    images: ["/og-image.jpg"],
    creator: "@sonnyau_dev",
  },
  alternates: {
    canonical: "https://sonnyau.dev",
  },
  verification: {
    google: "your-google-verification-code",
  },
  category: "technology",
    generator: 'v0.app'
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Sonny Au",
  url: "https://sonnyau.dev",
  image: "https://sonnyau.dev/profile-image.jpg",
  sameAs: ["https://github.com/SonnyAu", "https://linkedin.com/in/sonny-au", "https://pal-ate.com"],
  jobTitle: "Software Engineer",
  worksFor: {
    "@type": "Organization",
    name: "GBCS Group (SkyIT)",
  },
  alumniOf: {
    "@type": "EducationalOrganization",
    name: "San Jose State University",
  },
  knowsAbout: [
    "Software Engineering",
    "React Native",
    "Next.js",
    "TypeScript",
    "Machine Learning",
    "Full-Stack Development",
    "Mobile App Development",
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "San Jose",
    addressRegion: "CA",
    addressCountry: "US",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          href="/fonts/Formula1-Regular_web_0.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link rel="preload" href="/fonts/Formula1-Bold_web_0.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  )
}
