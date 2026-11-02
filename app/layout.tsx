import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import Footer from "./components/footer";
import FooterVisibility from "./components/footer-visibility";
import Navbar from "./components/navbar";
import VisitTracker from "./components/visit-tracker";
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
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense
          fallback={<div className="h-16 border-b border-zinc-200 bg-white" />}
        >
          <Navbar />
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
