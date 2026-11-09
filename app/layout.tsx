import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import Footer from "./components/footer";
import FooterVisibility from "./components/footer-visibility";
import Navbar from "./components/navbar";
import VisitTracker from "./components/visit-tracker";
import { getHeroBackground } from "./lib/hero-background";
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
  title: "Property Karobari",
  description: "Find properties to buy, rent, and PG accommodations",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const hero = await getHeroBackground();
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense
          fallback={<div className="h-16 border-b border-zinc-200 bg-white" />}
        >
          <Navbar heroBackground={hero} />
        </Suspense>
        {children}
        <VisitTracker />
        <Suspense fallback={null}>
          <FooterVisibility>
            <Footer />
          </FooterVisibility>
        </Suspense>
      </body>
    </html>
  );
}
