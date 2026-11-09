import Link from "next/link";
import { getPublishedProperties } from "@/app/lib/properties";
import PropertyCard from "./property-card";

const ROWS = [
  {
    label: "New Launch",
    listingType: "new_launch",
    href: "/properties/new-launch",
  },
  { label: "Resale", listingType: "sale", href: "/properties/buy" },
  { label: "Rent", listingType: "rent", href: "/properties/rent" },
  { label: "PG", listingType: "pg", href: "/properties/pg" },
];

const CARDS_PER_ROW = 30;

export default async function RecentlyListed() {
  const rows = (
    await Promise.all(
      ROWS.map(async (row) => ({
        ...row,
        properties: await getPublishedProperties(row.listingType, {
          limit: CARDS_PER_ROW,
        }),
      })),
    )
  ).filter((row) => row.properties.length > 0);

  if (rows.length === 0) return null;

  return (
    <section className="bg-linear-to-br from-white via-blue-50/30 to-blue-100/20 py-14">
      <div className="container mx-auto px-6">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          <span className="mr-2 inline-block h-6 w-1.5 rounded-full bg-amber-400 align-middle" />
          Recently Listed
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          The latest properties published on Property Karobari.
        </p>

        <div className="mt-8 space-y-10">
          {rows.map((row) => (
            <div key={row.listingType}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-blue-900">
                  {row.label}
                </h3>
                <Link
                  href={row.href}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-800"
                >
                  View all
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
              </div>
              <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-none sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
                {row.properties.map((property) => (
                  <div
                    key={property.id}
                    className="w-[80%] shrink-0 snap-start sm:w-auto"
                  >
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
