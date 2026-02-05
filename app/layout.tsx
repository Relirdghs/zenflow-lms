import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zenflow.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ZenFlow — Yoga LMS",
    template: "%s | ZenFlow",
  },
  description:
    "Платформа для обучения йоге: курсы, уроки и осознанная практика. Учитесь в своём темпе с персонализированным прогрессом.",
  keywords: [
    "йога",
    "курсы йоги",
    "обучение йоге",
    "онлайн йога",
    "медитация",
    "осознанность",
    "yoga courses",
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
    title: "ZenFlow — Yoga LMS",
    description:
      "Платформа для обучения йоге: курсы, уроки и осознанная практика.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ZenFlow — Yoga Learning Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZenFlow — Yoga LMS",
    description:
      "Платформа для обучения йоге: курсы, уроки и осознанная практика.",
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
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen min-h-[100dvh] bg-background text-foreground touch-manipulation`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
