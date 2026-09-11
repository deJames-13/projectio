import "~/styles/globals.css";

import { type Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { AuthProvider } from "~/contexts/AuthContext";
import { ThemeProvider } from "~/contexts/ThemeContext";

export const metadata: Metadata = {
  title: "Projectio - Project Management",
  description: "Corporate, elegant project management platform with sprint tracking, tasks, and team collaboration.",
  icons: [{ rel: "icon", url: "/favicon-32x32.png" }],
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
