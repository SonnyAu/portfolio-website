import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-inter",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#00D2BE" },
    { media: "(prefers-color-scheme: dark)", color: "#00D2BE" },
  ],
  colorScheme: "dark",
}

export const metadata: Metadata = {
  metadataBase: new URL("https://sonnyau.dev"),
  title: {
    default: "Sonny Au - Elite Software Engineer | React Native & AI Specialist | F1-Inspired Portfolio",
    template: "%s | Sonny Au - Championship-Level Software Engineering",
  },
  description:
    "🏆 President's Scholar at SJSU with 3.75 GPA specializing in championship-level full-stack development, React Native mobile apps, and machine learning. Co-founder of PalAte serving 1,000+ users. Currently Frontend React Developer Intern at GBCS Group achieving 900% performance improvements. Available for elite software engineering opportunities.",
  keywords: [
    // Primary keywords
    "Sonny Au",
    "Software Engineer",
    "Full-Stack Developer",
    "React Native Developer",
    "Frontend Developer",
    "Machine Learning Engineer",

    // Technical skills
    "Next.js Expert",
    "TypeScript Specialist",
    "React Developer",
    "Node.js Developer",
    "PostgreSQL",
    "Python Developer",
    "JavaScript Expert",
    "Tailwind CSS",
    "Supabase",
    "GraphQL",

    // Education & Achievements
    "SJSU Computer Science",
    "San Jose State University",
    "President's Scholar",
    "3.75 GPA",
    "Software Engineering Student",

    // Experience & Projects
    "PalAte Co-founder",
    "GBCS Group Intern",
    "SkyIT Developer",
    "Mobile App Developer",
    "Startup Founder",
    "Food Tech Innovation",

    // Location & Availability
    "San Jose Software Engineer",
    "California Developer",
    "Bay Area Tech",
    "Available for Hire",
    "Software Engineering Internship",
    "Entry Level Developer",

    // Specializations
    "Performance Optimization",
    "Code Efficiency",
    "Educational Technology",
    "Team Leadership",
    "Project Management",
    "Cross-platform Development",
  ],
  authors: [{ name: "Sonny Au", url: "https://sonnyau.dev" }],
  creator: "Sonny Au",
  publisher: "Sonny Au",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sonnyau.dev",
    siteName: "Sonny Au - Elite Software Engineer Portfolio",
    title: "Sonny Au - Elite Software Engineer | React Native & AI Specialist",
    description:
      "🏆 President's Scholar at SJSU specializing in championship-level full-stack development, React Native mobile apps, and machine learning. Co-founder of PalAte with 1,000+ users achieving 900% performance improvements.",
    images: [
      {
        url: "/placeholder.jpg", // TODO: Replace with actual og-image.jpg when created
        width: 1200,
        height: 630,
        alt: "Sonny Au - Elite Software Engineer Portfolio with F1-Inspired Design",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sonny Au - Elite Software Engineer | F1-Inspired Portfolio",
    description:
      "🏆 President's Scholar at SJSU | React Native & AI Specialist | Co-founder of PalAte | 900% Performance Improvements | Available for Elite Opportunities",
    images: ["/placeholder.jpg"], // TODO: Replace with actual og-image.jpg when created
    creator: "@sonnyau_dev",
    site: "@sonnyau_dev",
  },
  alternates: {
    canonical: "https://sonnyau.dev",
    languages: {
      "en-US": "https://sonnyau.dev",
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
    other: {
      "msvalidate.01": "your-bing-verification-code",
    },
  },
  category: "technology",
  classification: "Software Engineering Portfolio",
  referrer: "origin-when-cross-origin",
  generator: "Next.js",
  applicationName: "Sonny Au Portfolio",
  appleWebApp: {
    capable: true,
    title: "Sonny Au - Software Engineer",
    statusBarStyle: "black-translucent",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "theme-color": "#00D2BE",
    "color-scheme": "dark",
  },
}

// Enhanced JSON-LD structured data for better SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Sonny Au",
  url: "https://sonnyau.dev",
  image: {
    "@type": "ImageObject",
    url: "https://sonnyau.dev/profile-image.jpg",
    width: 400,
    height: 400,
  },
  sameAs: ["https://github.com/SonnyAu", "https://linkedin.com/in/sonny-au", "https://pal-ate.com"],
  jobTitle: "Software Engineer",
  description:
    "President's Scholar at SJSU specializing in full-stack development, React Native mobile apps, and machine learning",
  worksFor: [
    {
      "@type": "Organization",
      name: "GBCS Group (SkyIT)",
      url: "https://gbcsgroup.com",
    },
    {
      "@type": "Organization",
      name: "PalAte",
      url: "https://pal-ate.com",
      foundingDate: "2023-09",
    },
  ],
  alumniOf: {
    "@type": "EducationalOrganization",
    name: "San Jose State University",
    url: "https://sjsu.edu",
  },
  knowsAbout: [
    "Software Engineering",
    "React Native Development",
    "Next.js",
    "TypeScript",
    "Machine Learning",
    "Full-Stack Development",
    "Mobile App Development",
    "PostgreSQL",
    "Python",
    "JavaScript",
    "Performance Optimization",
    "Team Leadership",
    "Project Management",
  ],
  hasCredential: [
    {
      "@type": "EducationalOccupationalCredential",
      name: "President's Scholar",
      credentialCategory: "Academic Achievement",
      educationalLevel: "Undergraduate",
    },
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "San Jose",
    addressRegion: "CA",
    addressCountry: "US",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+1-408-669-9299",
    email: "au.sonny10@gmail.com",
    contactType: "Professional",
    availableLanguage: "English",
  },
  seeks: {
    "@type": "Demand",
    name: "Software Engineering Opportunities",
    description:
      "Seeking full-time software engineering positions specializing in full-stack development, mobile applications, and machine learning",
  },
}

// Additional structured data for projects
const projectsJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Sonny Au's Software Projects",
  description:
    "Portfolio of software engineering projects including mobile apps, web applications, and machine learning models",
  itemListElement: [
    {
      "@type": "SoftwareApplication",
      name: "PalAte Mobile App",
      description:
        "React Native app with 20+ screens helping SJSU students discover restaurants matching dietary preferences",
      applicationCategory: "MobileApplication",
      operatingSystem: "iOS, Android",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
    {
      "@type": "WebApplication",
      name: "PalAte Promotional Website",
      description:
        "Dynamic promotional website for food-tech startup with Next.js, focusing on performance and SEO optimization",
      url: "https://pal-ate.com",
      applicationCategory: "WebApplication",
      browserRequirements: "Modern web browser",
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Enhanced DNS prefetch and preconnect for performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Critical font preloading with enhanced fallbacks */}
        <link
          rel="preload"
          href="/fonts/Formula1-Regular_web_0.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
          fetchPriority="high"
        />
        <link 
          rel="preload" 
          href="/fonts/Formula1-Bold_web_0.ttf" 
          as="font" 
          type="font/ttf" 
          crossOrigin="anonymous"
          fetchPriority="high"
        />

        {/* Enhanced favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />

        {/* PWA manifest with enhanced configuration */}
        <link rel="manifest" href="/manifest.json" />

        {/* Enhanced structured data for SEO */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(projectsJsonLd) }} />

        {/* Performance optimization meta tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Sonny Au" />

        {/* Enhanced security headers */}
        {/* Note: X-Frame-Options must be set via HTTP headers, not meta tags */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta name="referrer" content="origin-when-cross-origin" />

        {/* Resource hints for better performance */}
        {/* Note: og-image.jpg should be created in public/ folder */}
        {/* <link rel="preload" href="/og-image.jpg" as="image" type="image/jpeg" /> */}
      </head>
      <body className={`${inter.variable} antialiased`}>
        {/* Class is already added in JSX to prevent hydration mismatch */}
        {children}

        {/* Performance monitoring script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Core Web Vitals monitoring
              if ('PerformanceObserver' in window) {
                // Monitor LCP, FID, CLS
                const observer = new PerformanceObserver((list) => {
                  for (const entry of list.getEntries()) {
                    if (entry.entryType === 'largest-contentful-paint') {
                      console.log('LCP:', entry.startTime);
                    }
                    if (entry.entryType === 'first-input') {
                      console.log('FID:', entry.processingStart - entry.startTime);
                    }
                    if (entry.entryType === 'layout-shift') {
                      if (!entry.hadRecentInput) {
                        console.log('CLS:', entry.value);
                      }
                    }
                  }
                });
                
                observer.observe({entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift']});
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
