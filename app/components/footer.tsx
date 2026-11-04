import Link from "next/link";
import { connection } from "next/server";

const companyLinks = [
  { href: "/about", label: "About Us" },
  { href: "/blogs", label: "Blogs" },
  { href: "/contact", label: "Contact" },
  { href: "/career", label: "Career" },
  { href: "/refer-n-earn", label: "Refer N Earn" },
  { href: "/feedback", label: "Feedback" },
  { href: "/privacy-policy", label: "Privacy Policy" },
];

const serviceLinks = [
  { href: "/properties/buy", label: "Buy" },
  { href: "/properties/rent", label: "Rent" },
  { href: "/properties/pg", label: "PG" },
  { href: "/properties/preleased", label: "Preleased" },
  { href: "/properties/auction", label: "Auction" },
  { href: "/properties/new-launch", label: "New Launch" },
  { href: "/loans", label: "Loans" },
  { href: "/interior", label: "Interior" },
];

const partnerLinks = [
  {
    name: "MahaRERA",
    description: "Regulatory",
    href: "https://maharera.maharashtra.gov.in",
  },
  {
    name: "MCHI-CREDAI",
    description: "Industry Association",
    href: "https://mchi.net",
  },
  {
    name: "IGR Maharashtra",
    description: "Registration & Stamp Department",
    href: "https://igrmaharashtra.gov.in",
  },
  {
    name: "CERSAI",
    description: "Public Registry",
    href: "https://www.cersai.org.in/CERSAI/home.prg",
  },
  {
    name: "MoHUA",
    description: "Portal",
    href: "https://mohua.gov.in",
  },
  {
    name: "FinvestCorp",
    description: "Our Loan Solution Partner",
    href: "https://finvestcorp.com",
  },
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
    label: "LinkedIn",
    href: "#",
    color: "text-[#0A66C2]",
    icon: (
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    ),
  },
  {
    label: "YouTube",
    href: "#",
    color: "text-[#FF0000]",
    icon: (
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    ),
  },
];

function Icon({ path, stroke = false }: { path: React.ReactNode; stroke?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={stroke ? "none" : "currentColor"}
      stroke={stroke ? "currentColor" : undefined}
      strokeWidth={stroke ? 2 : undefined}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}

export default async function Footer() {
  await connection();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-blue-800 bg-blue-950 text-blue-200">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="-mt-2 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/property-karobari-logo.png"
                alt="Property Karobari"
                className="h-auto w-full max-w-[300px] object-contain"
              />
            </Link>
            <p className="mt-2 max-w-xs text-center text-sm leading-relaxed text-blue-200">
              Buy, rent, or find a PG — explore verified properties across top
              cities.
            </p>
            <div className="mt-1 flex justify-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className={`flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm transition-transform hover:scale-110 ${social.color}`}
                >
                  <Icon path={social.icon} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Company
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Services
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Useful Links & Partners
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {partnerLinks.map((partner) => (
                <li key={partner.href}>
                  <a
                    href={partner.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-100 transition-colors hover:text-white"
                  >
                    {partner.name}
                  </a>
                  <span className="block text-xs text-blue-300/60">
                    {partner.description}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Get in Touch
            </h3>
            <div className="mt-4">
              <p className="text-sm font-semibold tracking-wide text-white">
                SINGHRANI CONSULTANCY SERVICES
              </p>
              <p className="mt-1 text-xs text-blue-300/80">
                MahaRERA Agent Reg. No.: A031242605002
              </p>
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-blue-400">
                  <Icon
                    stroke
                    path={
                      <>
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </>
                    }
                  />
                </span>
                Mumbai, Maharashtra, India
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-blue-400">
                  <Icon
                    stroke
                    path={
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    }
                  />
                </span>
                +91 98765 43210
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-blue-400">
                  <Icon
                    stroke
                    path={
                      <>
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </>
                    }
                  />
                </span>
                <a
                  href="mailto:propertykarobari@gmail.com"
                  className="transition-colors hover:text-white"
                >
                  propertykarobari@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-blue-800 pt-6 text-center">
          <p className="text-xs text-blue-300/70">
            © {year} Property Karobari. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
