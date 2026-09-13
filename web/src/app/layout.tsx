import "~/styles/globals.css";

import { type Metadata, type Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { AuthProvider } from "~/contexts/AuthContext";
import { ThemeProvider } from "~/contexts/ThemeContext";

/**
 * Site Image Assets Configuration
 * All public image paths used for SEO, metadata, and social cards.
 * Easily update or swap any asset here. Current assets point to /public/images and /public.
 */
export const siteImages = {
  // Social card preview image for Open Graph (Facebook, LinkedIn, Discord, etc.)
  // Recommended 1200x630; currently using high-res brand logo from /public/images
  ogImage: "/images/logo-dark-500.png",
  ogImageWidth: 500,
  ogImageHeight: 500,
  ogImageAlt: "Projectio - Corporate & Elegant Project Management",

  // Twitter / X card image
  twitterImage: "/images/logo-dark-500.png",
  twitterImageAlt: "Projectio - Corporate & Elegant Project Management",

  // Brand logos and titles (available in /public/images)
  logoDark: "/images/logo-dark-500.png",
  logoLight: "/images/logo-light-500.png",
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
 * Update app name, descriptions, canonical URL, and tracking IDs here.
 */
export const siteConfig = {
  name: "Projectio",
  shortName: "Projectio",
  title: "Projectio - Corporate & Elegant Project Management",
  titleTemplate: "%s | Projectio",
  description:
    "Corporate, elegant project management platform with sprint tracking, tasks, and team collaboration.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://projectio.dev",
  themeColorLight: "#ffffff",
  themeColorDark: "#0E1826", // Deep corporate navy matching dark theme background
  twitterHandle: "@projectio",
  locale: "en_US",

  // Google Analytics / Google Tag Manager Measurement ID (e.g. "G-XXXXXXXXXX")
  // Configure via NEXT_PUBLIC_GA_ID, NEXT_PUBLIC_GTAG_ID, or paste directly here
  gtagId: process.env.NEXT_PUBLIC_GA_ID ?? process.env.NEXT_PUBLIC_GTAG_ID ?? "",

  images: siteImages,
};

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
    canonical: "/",
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
        url: siteImages.ogImage,
        width: siteImages.ogImageWidth,
        height: siteImages.ogImageHeight,
        alt: siteImages.ogImageAlt,
        type: "image/png",
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
        url: siteImages.twitterImage,
        alt: siteImages.twitterImageAlt,
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
