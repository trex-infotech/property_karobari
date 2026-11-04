import type { Metadata } from "next";
import Link from "next/link";
import PageBanner from "@/app/components/page-banner";

export const metadata: Metadata = {
  title: "About Us | Property Karobari",
  description:
    "Learn about Property Karobari — our mission to make buying, selling and renting property in India simple and transparent.",
};

function Icon({ path }: { path: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}

const values = [
  {
    title: "Transparency",
    description:
      "Verified listings and honest pricing, so you always know exactly what you're getting.",
    icon: (
      <>
        <path d="M9 12l2 2 4-4" />
        <path d="M12 3l7 4v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7l7-4z" />
      </>
    ),
  },
  {
    title: "Customer First",
    description:
      "From search to possession, our team supports buyers, sellers and tenants at every step.",
    icon: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
  {
    title: "Local Expertise",
    description:
      "Deep knowledge of neighbourhoods, market trends and legal processes in every city we serve.",
    icon: (
      <>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
  },
  {
    title: "Technology Driven",
    description:
      "Smart search, real photos and instant alerts that help you find the right property faster.",
    icon: (
      <>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" x2="16" y1="21" y2="21" />
        <line x1="12" x2="12" y1="17" y2="21" />
      </>
    ),
  },
];

const stats = [
  { value: "10,000+", label: "Properties Listed" },
  { value: "5,000+", label: "Happy Customers" },
  { value: "25+", label: "Cities Covered" },
  { value: "15+", label: "Years of Experience" },
];

export default function AboutPage() {
  return (
    <section className="min-h-screen bg-linear-to-br from-white via-blue-50/30 to-blue-100/20 pb-16">
      <PageBanner
        title="About Us"
        subtitle="Property Karobari is on a mission to make real estate in India simple, transparent and accessible for everyone."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "About" }]}
      />

      <div className="container mx-auto px-6 pt-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              Who We Are
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-zinc-600 sm:text-base">
              SINGHRANI CONSULTANCY SERVICES started with a simple idea: finding
              a home shouldn&apos;t be complicated. Whether you&apos;re buying your
              first flat, renting near your office, looking for a PG, or
              investing in a new launch — we bring every option together in one
              place.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-zinc-600 sm:text-base">
              We work directly with owners, builders and verified agents to
              publish genuine listings with real photos and accurate pricing.
              Our team handles the details — site visits, paperwork,
              negotiation — so you can focus on choosing the right property.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-blue-100/50 bg-white p-6 text-center shadow-sm"
              >
                <p className="text-2xl font-bold text-blue-600 sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 rounded-2xl bg-linear-to-r from-blue-600 to-blue-800 px-8 py-8 text-center shadow-lg sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">
            Operated by
          </p>
          <h2 className="mt-2 text-xl font-bold tracking-wide text-white sm:text-2xl">
            SINGHRANI CONSULTANCY SERVICES
          </h2>
          <p className="mt-3 inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-blue-100">
            MahaRERA Agent Reg. No.: A031242605002
          </p>
        </div>

        <div className="mt-14">
          <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            What We Stand For
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-zinc-600">
            The principles that guide every listing, visit and deal on Property
            Karobari.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-blue-100/50 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Icon path={value.icon} />
                </span>
                <h3 className="mt-4 text-base font-semibold text-zinc-900">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 rounded-2xl border border-blue-100/50 bg-white p-8 text-center shadow-lg sm:p-10">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            Ready to find your next property?
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-zinc-600">
            Browse verified listings or talk to our team — we&apos;ll help you
            buy, rent or sell with confidence.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/properties/buy"
              className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Browse Properties
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-blue-600"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
