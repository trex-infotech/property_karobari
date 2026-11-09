import Image from "next/image";
import Link from "next/link";
import type { PropertyRecord } from "@/app/lib/types";
import {
  formatPrice,
  listingTypeToPath,
} from "@/app/lib/property-format";

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default function PropertyCard({
  property,
}: {
  property: PropertyRecord;
}) {
  const href = `/properties/${listingTypeToPath(property.listingType)}/${property.id}`;
  const isRentLike =
    property.listingType === "rent" || property.listingType === "pg";
  const price = formatPrice(property.price);
  const specs = [
    property.propertyType,
    property.bedrooms,
    property.area !== null
      ? `${property.area} ${property.areaUnit ?? ""}`.trim()
      : null,
    property.parking.available ? "Parking" : null,
  ].filter(Boolean);

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-blue-100/50 bg-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
    >
      <div className="relative aspect-3/2 bg-blue-50">
        {property.thumbnail ? (
          <Image
            src={property.thumbnail}
            alt={property.societyName || "Property"}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-sm text-blue-700">
            No Image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-1 text-lg font-bold text-blue-900">
          {property.societyName || "Untitled property"}
        </h3>
        <p className="mt-1 line-clamp-1 text-sm text-zinc-500">
          {[property.location, property.city].filter(Boolean).join(", ") ||
            "Location on request"}
        </p>

        {specs.length > 0 && (
          <p className="mt-3 line-clamp-1 text-sm text-zinc-600">
            {specs.join(" · ")}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
          <div>
            <span className="text-lg font-bold text-blue-600">
              {price ?? "Price on request"}
              {price && isRentLike && (
                <span className="text-xs font-medium text-zinc-500">/month</span>
              )}
            </span>
            {property.createdAt && (
              <p className="mt-0.5 text-xs text-zinc-500">
                Posted on {dateFmt.format(new Date(property.createdAt))}
              </p>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-900 transition-colors group-hover:text-blue-600">
            View details
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
          </span>
        </div>
      </div>
    </Link>
  );
}
