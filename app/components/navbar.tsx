"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const propertyLinks = [
  { href: "/properties/buy", label: "Buy" },
  { href: "/properties/rent", label: "Rent" },
  { href: "/properties/pg", label: "PG" },
  { href: "/properties/preleased", label: "Preleased" },
  { href: "/properties/auction", label: "Auction" },
  { href: "/properties/new-launch", label: "New Launch" },
];

const navLinks: { href: string; label: string }[] = [];

const darkBannerRoutes = [
  "/about",
  "/blogs",
  "/career",
  "/contact",
  "/feedback",
  "/interior",
  "/loans",
  "/preleased",
  "/privacy-policy",
  "/properties",
  "/refer-n-earn",
];

const socialLinks = [
  {
    label: "Facebook",
    href: "#",
    color: "text-[#1877F2]",
    icon: (
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    ),
  },
  {
    label: "Instagram",
    href: "#",
    color: "text-[#E4405F]",
    icon: (
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    ),
  },
  {
    label: "WhatsApp",
    href: "#",
    color: "text-[#25D366]",
    icon: (
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    ),
  },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function linkClass(active: boolean) {
  return `rounded-full px-4 py-2 text-base font-medium transition-colors ${
    active
      ? "bg-blue-50 text-blue-600"
      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
  }`;
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function SocialIcon({ path }: { path: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobilePropertiesOpen, setMobilePropertiesOpen] = useState(false);
  const [desktopPropertiesOpen, setDesktopPropertiesOpen] = useState(false);
  const propertiesActive = isActive(pathname, "/properties");
  const onDarkBanner = darkBannerRoutes.some((route) =>
    isActive(pathname, route),
  );

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3 sm:px-4">
      <span
        className={`absolute -top-1 right-6 text-[11px] font-bold leading-none tracking-wide sm:right-8 sm:text-xs ${
          onDarkBanner
            ? "text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.55)]"
            : "text-[#172554]"
        }`}
      >
        MahaRERA Agent Reg. No.: A031242605002
      </span>
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full border border-zinc-200 bg-white/90 px-4 shadow-lg backdrop-blur sm:h-16 sm:px-5">
        <Link
          href="/"
          className="flex items-center gap-2"
          onClick={() => setMobileOpen(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/property-karobari-logo-mark.png"
            alt="Property Karobari"
            className="-mt-4 -ml-2 h-12 w-auto object-contain sm:h-14"
          />
        </Link>

        <div className="hidden items-center gap-0.5 md:-ml-6 md:flex">
          <div
            className="relative"
            onMouseEnter={() => setDesktopPropertiesOpen(true)}
            onMouseLeave={() => setDesktopPropertiesOpen(false)}
          >
            <button
              type="button"
              className={`${linkClass(propertiesActive)} flex items-center gap-1`}
              aria-haspopup="true"
              aria-expanded={desktopPropertiesOpen}
              onClick={() => setDesktopPropertiesOpen((open) => !open)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setDesktopPropertiesOpen(false);
              }}
            >
              All Properties
              <ChevronDown
                className={`h-5 w-5 transition-transform ${
                  desktopPropertiesOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {desktopPropertiesOpen && (
              <div className="absolute left-0 top-full z-50 pt-2">
                <div className="w-44 overflow-hidden rounded-2xl border border-zinc-200 bg-white py-1 shadow-lg">
                  {propertyLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setDesktopPropertiesOpen(false)}
                      className={`block px-4 py-2.5 text-base font-medium transition-colors ${
                        isActive(pathname, link.href)
                          ? "bg-blue-50 text-blue-600"
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={linkClass(isActive(pathname, link.href))}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              aria-label={social.label}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-zinc-100 ${social.color}`}
            >
              <SocialIcon path={social.icon} />
            </a>
          ))}
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-100 md:hidden"
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation menu"
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-7"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-7"
              aria-hidden="true"
            >
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          )}
        </button>
      </nav>

      {mobileOpen && (
        <div className="mx-auto mt-2 max-w-6xl rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-lg md:hidden">
          <div className="space-y-1">
            <button
              type="button"
              className={`${linkClass(propertiesActive)} flex w-full items-center justify-between`}
              aria-expanded={mobilePropertiesOpen}
              onClick={() => setMobilePropertiesOpen((open) => !open)}
            >
              All Properties
              <ChevronDown
                className={`h-5 w-5 transition-transform ${
                  mobilePropertiesOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {mobilePropertiesOpen && (
              <div className="space-y-1 pb-1 pl-4">
                {propertyLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block ${linkClass(
                      isActive(pathname, link.href),
                    )}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block ${linkClass(isActive(pathname, link.href))}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
