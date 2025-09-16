import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ClientSessionProvider from "@/components/ClientSessionProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hisab Cal - Smart Expense Management",
  description: "Track expenses with friends, manage balances, and get powerful insights",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  // PWA manifest
  manifest: '/manifest.json',
  // Mobile app capable
  appleWebApp: {
    title: 'Hisab Cal',
    statusBarStyle: 'black-translucent',
    capable: true,
  },
  // Theme color for mobile browsers
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1A1625' },
    { media: '(prefers-color-scheme: dark)', color: '#1A1625' },
  ],
  // Icons for mobile devices
  icons: {
    icon: [
      { url: '/android-chrome-192x192.png' },
      { url: '/android-chrome-512x512.png' },
    ],
    apple: '/android-chrome-192x192.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-[#1A1735] via-[#2D1B69] to-[#1A1735] min-h-screen dark:bg-gradient-to-br dark:from-[#1A1735] dark:via-[#2D1B69] dark:to-[#1A1735]`}
      >
        <ClientSessionProvider>
          {children}
        </ClientSessionProvider>
      </body>
    </html>
  );
}