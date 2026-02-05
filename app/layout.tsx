import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: true,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zenflow.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Курсы йоги в Алматы | ZenFlow — Онлайн обучение йоге",
    template: "%s | ZenFlow — Йога в Алматы",
  },
  description:
    "Лучшие курсы йоги в Алматы: Алмалинский, Бостандыкский, Медеуский, Ауэзовский районы. Онлайн обучение йоге с персональным прогрессом.",
  keywords: [
    "йога Алматы",
    "курсы йоги Алматы",
    "йога онлайн Алматы",
    "обучение йоге Алматы",
    "йога Алмалинский район",
    "йога Бостандыкский район",
    "йога Медеуский район",
    "йога Ауэзовский район",
    "онлайн йога",
    "медитация Алматы",
    "осознанность",
    "yoga courses Almaty",
    "LMS",
  ],
  authors: [{ name: "ZenFlow Team" }],
  creator: "ZenFlow",
  publisher: "ZenFlow",
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
    locale: "ru_RU",
    url: siteUrl,
    siteName: "ZenFlow",
    title: "Курсы йоги в Алматы | ZenFlow — Онлайн обучение йоге",
    description:
      "Лучшие курсы йоги в Алматы: Алмалинский, Бостандыкский, Медеуский, Ауэзовский районы. Онлайн обучение йоге с персональным прогрессом.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ZenFlow — Курсы йоги в Алматы",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Курсы йоги в Алматы | ZenFlow — Онлайн обучение йоге",
    description:
      "Лучшие курсы йоги в Алматы: Алмалинский, Бостандыкский, Медеуский, Ауэзовский районы. Онлайн обучение йоге с персональным прогрессом.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8faf8" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

// Structured data for Organization (JSON-LD)
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ZenFlow",
  description: "Платформа для обучения йоге онлайн",
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  sameAs: [],
};

// Structured data for LocalBusiness (SEO для Алматы)
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "ZenFlow — Курсы йоги в Алматы",
  description: "Онлайн курсы йоги для жителей Алматы: Алмалинский, Бостандыкский, Медеуский, Ауэзовский районы",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Алматы",
    addressRegion: "Алматинская область",
    addressCountry: "KZ",
    streetAddress: "Онлайн платформа",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 43.2220,
    longitude: 76.8512,
  },
  areaServed: [
    {
      "@type": "City",
      name: "Алматы",
    },
    {
      "@type": "AdministrativeArea",
      name: "Алмалинский район",
    },
    {
      "@type": "AdministrativeArea",
      name: "Бостандыкский район",
    },
    {
      "@type": "AdministrativeArea",
      name: "Медеуский район",
    },
    {
      "@type": "AdministrativeArea",
      name: "Ауэзовский район",
    },
  ],
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "00:00",
    closes: "23:59",
  },
  url: siteUrl,
};

// Structured data for WebSite (JSON-LD)
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ZenFlow",
  url: siteUrl,
  description: "Платформа для обучения йоге: курсы, уроки и осознанная практика.",
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/dashboard/courses?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen min-h-[100dvh] bg-background text-foreground touch-manipulation`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
