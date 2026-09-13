import "~/styles/globals.css";

import { type Metadata, type Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { AuthProvider } from "~/contexts/AuthContext";
import { ThemeProvider } from "~/contexts/ThemeContext";

/**
 * Automatically determine the absolute base URL for Open Graph tags.
 * Social media scrapers (Discord, Twitter, WhatsApp, LinkedIn, etc.) require
 * a fully qualified, publicly reachable URL (not an unresolvable domain or relative path).
 *
 * Priority:
 * 1. NEXT_PUBLIC_APP_URL (.env)
 * 2. VERCEL_PROJECT_PRODUCTION_URL / VERCEL_URL (auto-injected on Vercel deployments)
 * 3. Fallback to http://localhost:3000
 */
const getBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    let url = process.env.NEXT_PUBLIC_APP_URL.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }
    return url.replace(/\/+$/, "");
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/+$/, "")}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/+$/, "")}`;
  }

  return "http://localhost:3000";
};

const baseUrl = getBaseUrl();

/**
 * Site Image Assets Configuration
 * All public image paths used for SEO, metadata, and social cards.
 * Updated with a dedicated 1200x630 card for standard Open Graph & Twitter summary_large_image previews.
 */
export const siteImages = {
  // Primary Open Graph & Twitter banner image (1200x630 - gold standard for social cards)
  ogImage: "/images/og-image-1200-630.png",
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageType: "image/png",
  ogImageAlt: "Projectio - Corporate & Elegant Project Management Platform",

  // Twitter / X card image
  twitterImage: "/images/og-image-1200-630.png",
  twitterImageAlt: "Projectio - Corporate & Elegant Project Management Platform",

  // Square logos (500x500)
  logoDark: "/images/logo-dark-500.png",
  logoLight: "/images/logo-light-500.png",

  // Wordmark titles
  titleDark: "/images/title-dark-500.png",
  titleLight: "/images/title-light-500.png",

  // Favicons & App Icons (in /public)
  favicon: "/favicon.ico",
  favicon16: "/favicon-16x16.png",
  favicon32: "/favicon-32x32.png",
  appleTouchIcon: "/apple-touch-icon.png",
  androidChrome192: "/android-chrome-192x192.png",
  androidChrome512: "/android-chrome-512x512.png",
} as const;

/**
 * Site Metadata & SEO Configuration
 */
export const siteConfig = {
  name: "Projectio",
  shortName: "Projectio",
  title: "Projectio - Corporate & Elegant Project Management",
  titleTemplate: "%s | Projectio",
  description:
    "Corporate, elegant project management platform with sprint tracking, tasks, and team collaboration.",
  url: baseUrl,
  themeColorLight: "#ffffff",
  themeColorDark: "#0E1826", // Deep corporate navy matching dark theme background
  twitterHandle: "@projectio",
  locale: "en_US",

  // Google Analytics / Google Tag Manager Measurement ID (e.g. "G-XXXXXXXXXX")
  gtagId: process.env.NEXT_PUBLIC_GA_ID ?? process.env.NEXT_PUBLIC_GTAG_ID ?? "",

  images: siteImages,
};

// Compute fully qualified absolute OG image URL for scrapers
const absoluteOgImageUrl = `${siteConfig.url}${siteImages.ogImage.startsWith("/") ? "" : "/"}${siteImages.ogImage}`;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: siteConfig.themeColorLight },
    { media: "(prefers-color-scheme: dark)", color: siteConfig.themeColorDark },
  ],
  colorScheme: "dark light",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: siteConfig.titleTemplate,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: "Projectio Team" }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  keywords: [
    "Project Management",
    "Sprint Tracking",
    "Agile",
    "Kanban",
    "Task Management",
    "Corporate Collaboration",
    "Workflow Management",
    "Software Development",
  ],
  alternates: {
    canonical: siteConfig.url,
  },
  icons: {
    icon: [
      { url: siteImages.favicon, sizes: "any" },
      { url: siteImages.favicon32, sizes: "32x32", type: "image/png" },
      { url: siteImages.favicon16, sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: siteImages.appleTouchIcon, sizes: "180x180", type: "image/png" },
    ],
    shortcut: [siteImages.favicon],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: absoluteOgImageUrl,
        secureUrl: absoluteOgImageUrl.startsWith("https") ? absoluteOgImageUrl : undefined,
        width: siteImages.ogImageWidth,
        height: siteImages.ogImageHeight,
        alt: siteImages.ogImageAlt,
        type: siteImages.ogImageType,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    site: siteConfig.twitterHandle,
    creator: siteConfig.twitterHandle,
    images: [
      {
        url: absoluteOgImageUrl,
        alt: siteImages.twitterImageAlt,
        width: siteImages.ogImageWidth,
        height: siteImages.ogImageHeight,
      },
    ],
  },
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
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* Explicit Open Graph & Twitter fallbacks in raw head for scrapers with strict regex parsers */}
        <meta property="og:title" content={siteConfig.title} />
        <meta property="og:description" content={siteConfig.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteConfig.url} />
        <meta property="og:site_name" content={siteConfig.name} />
        <meta property="og:image" content={absoluteOgImageUrl} />
        {absoluteOgImageUrl.startsWith("https") && (
          <meta property="og:image:secure_url" content={absoluteOgImageUrl} />
        )}
        <meta property="og:image:type" content={siteImages.ogImageType} />
        <meta property="og:image:width" content={String(siteImages.ogImageWidth)} />
        <meta property="og:image:height" content={String(siteImages.ogImageHeight)} />
        <meta property="og:image:alt" content={siteImages.ogImageAlt} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={siteConfig.title} />
        <meta name="twitter:description" content={siteConfig.description} />
        <meta name="twitter:image" content={absoluteOgImageUrl} />
        <meta name="twitter:image:alt" content={siteImages.twitterImageAlt} />

        {/* Google Analytics / Google Tag Manager (gtag.js) */}
        {siteConfig.gtagId ? (
          <>
            <link rel="preconnect" href="https://www.googletagmanager.com" />
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${siteConfig.gtagId}`}
            />
            <script
              id="google-analytics"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${siteConfig.gtagId}');
                `,
              }}
            />
          </>
        ) : null}

        {/* Theme script to prevent hydration flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('projectio-theme');
                const isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (isDark) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.colorScheme = 'light';
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-600 selection:text-white transition-colors duration-200">
        <ThemeProvider>
          <TRPCReactProvider>
            <AuthProvider>{children}</AuthProvider>
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
