import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import Navbar from "@/components/layout/Navbar";

const siteUrl = "https://subtitle-forge.github.io";
const logoUrl = "https://res.cloudinary.com/dkj22lm1g/image/upload/v1770949907/SubtitleForge_tyfucj.webp";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SubtitleForge - SRT File Generator & Video Subtitle Tool",
    template: "%s | SubtitleForge",
  },
  description:
    "Create, edit, and embed SRT subtitle files with an intuitive editor. Convert between formats (SRT, VTT, ASS) and burn subtitles into videos directly in your browser. Free, fast, and privacy-first.",
  keywords: [
    "subtitle generator",
    "SRT editor",
    "video subtitles",
    "subtitle converter",
    "VTT converter",
    "ASS subtitles",
    "burn subtitles",
    "embed subtitles",
    "subtitle tool",
    "free subtitle maker",
    "online subtitle editor",
    "browser subtitle tool",
  ],
  authors: [{ name: "SubtitleForge" }],
  creator: "SubtitleForge",
  publisher: "SubtitleForge",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "SubtitleForge",
    title: "SubtitleForge - SRT File Generator & Video Subtitle Tool",
    description:
      "Create, edit, and embed SRT subtitle files with an intuitive editor. Convert between formats (SRT, VTT, ASS) and burn subtitles into videos directly in your browser.",
    images: [
      {
        url: logoUrl,
        width: 512,
        height: 512,
        alt: "SubtitleForge - Free Online Subtitle Editor",
        type: "image/webp",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "SubtitleForge - SRT File Generator & Video Subtitle Tool",
    description:
      "Create, edit, and embed SRT subtitle files. Convert between formats and burn subtitles into videos directly in your browser. Free and privacy-first.",
    images: [logoUrl],
    creator: "@subtitleforge",
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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: logoUrl, sizes: "180x180", type: "image/webp" },
    ],
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: siteUrl,
  },
  category: "technology",
  classification: "Video Tools, Subtitle Software",
  referrer: "origin-when-cross-origin",
  applicationName: "SubtitleForge",
  generator: "Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "SubtitleForge",
    "url": siteUrl,
    "description": "Create, edit, and embed SRT subtitle files with an intuitive editor. Convert between formats (SRT, VTT, ASS) and burn subtitles into videos directly in your browser.",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Any",
    "browserRequirements": "Requires JavaScript",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "image": logoUrl,
    "screenshot": logoUrl,
    "featureList": [
      "Create SRT subtitle files",
      "Edit existing subtitles",
      "Convert between SRT, VTT, ASS, TXT formats",
      "Burn subtitles into videos",
      "Embed soft subtitles",
      "100% client-side processing",
      "Privacy-first approach"
    ],
    "softwareVersion": "1.0.0",
    "creator": {
      "@type": "Organization",
      "name": "SubtitleForge"
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          as="image"
          href={logoUrl}
          type="image/webp"
        />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="antialiased bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white font-sans"
      >
        <ThemeProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
