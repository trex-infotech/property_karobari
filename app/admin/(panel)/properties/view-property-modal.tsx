"use client";

import Image from "next/image";
import { useState } from "react";
import type { PropertyRecord } from "@/app/lib/types";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const listingLabels: Record<string, string> = {
  sale: "Sale",
  rent: "Rent",
  pg: "PG",
  new_launch: "New Launch",
  preleased: "Preleased",
  auction: "Auction",
};

function Detail({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  if (value === null || value === undefined || value === "") return null;

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-zinc-900">{value}</p>
    </div>
  );
}

export default function ViewPropertyModal({
  property,
}: {
  property: PropertyRecord;
}) {
  const [open, setOpen] = useState(false);

  const isRentLike =
    property.listingType === "rent" || property.listingType === "pg";
  const isNewLaunch = property.listingType === "new_launch";
  const isAuction = property.listingType === "auction";
  const priceLabel = isNewLaunch
    ? "Starting From"
    : isRentLike
      ? "Rent"
      : "Price";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
      >
        View
      </button>

      {open && (
        <div className="fixed inset-0 z-100 overflow-y-auto bg-black/50 p-4 text-left">
          <div className="mx-auto my-8 w-full max-w-3xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-zinc-900">
                  {property.societyName || "Untitled"}
                </h2>
                <span
                  className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                    property.status === "draft"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {property.status === "draft" ? "Draft" : "Published"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100"
                aria-label="Close"
              >
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
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6 px-6 py-5">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <Detail
                  label="Listing type"
                  value={listingLabels[property.listingType]}
                />
                <Detail label="Property type" value={property.propertyType} />
                <Detail
                  label="Transaction type"
                  value={property.transactionType}
                />
                {!isNewLaunch && property.listingType !== "pg" && (
                  <Detail
                    label="Construction status"
                    value={property.constructionStatus}
                  />
                )}
                <Detail
                  label="RERA Registration Number"
                  value={property.reraNumber}
                />
                <Detail
                  label="Builder / Developer"
                  value={property.builderName}
                />
                <Detail label="Bedrooms" value={property.bedrooms} />
                <Detail
                  label="Floor"
                  value={
                    property.floor !== null
                      ? `Floor ${property.floor}${
                          property.totalFloors !== null
                            ? ` of ${property.totalFloors}`
                            : ""
                        }`
                      : null
                  }
                />
                <Detail
                  label="Area"
                  value={
                    property.area !== null
                      ? `${property.area} ${property.areaUnit ?? ""}`.trim()
                      : null
                  }
                />
                <Detail label="Furnishing" value={property.furnishing} />
                <Detail label="Building Age" value={property.buildingAge} />
                <Detail label="Facing" value={property.facing} />
                <Detail
                  label={priceLabel}
                  value={
                    property.price !== null ? inr.format(property.price) : null
                  }
                />
                {(property.listingType === "rent" ||
                  property.listingType === "preleased") && (
                  <Detail
                    label="Deposit"
                    value={
                      property.deposit !== null
                        ? inr.format(property.deposit)
                        : null
                    }
                  />
                )}
                {isAuction && (
                  <>
                    <Detail
                      label="Possession Type"
                      value={property.possessionType}
                    />
                    <Detail
                      label="EMD Amount"
                      value={
                        property.emdAmount !== null
                          ? inr.format(property.emdAmount)
                          : null
                      }
                    />
                    <Detail label="EMD Date" value={property.emdDate} />
                    <Detail
                      label="Inspection Date"
                      value={property.inspectionDate}
                    />
                    <Detail label="Name of Bank" value={property.bankName} />
                  </>
                )}
                {property.listingType === "preleased" && (
                  <>
                    <Detail
                      label="Suitable For"
                      value={property.suitableFor}
                    />
                    <Detail
                      label="Lease Amount"
                      value={
                        property.leaseAmount !== null
                          ? inr.format(property.leaseAmount)
                          : null
                      }
                    />
                    <Detail
                      label="Rental Yield YLY"
                      value={
                        property.rentalYield !== null
                          ? `${property.rentalYield}%`
                          : null
                      }
                    />
                    <Detail
                      label="Total Lease Tenure"
                      value={property.totalLeaseTenure}
                    />
                    <Detail
                      label="Balance Lease Tenure"
                      value={property.balanceLeaseTenure}
                    />
                    <Detail
                      label="Tenant Type"
                      value={property.tenantType}
                    />
                  </>
                )}
                {isNewLaunch && (
                  <>
                    <Detail
                      label="Sale Status"
                      value={property.saleStatus}
                    />
                    <Detail
                      label="Possession In"
                      value={property.possessionIn}
                    />
                  </>
                )}
                {property.listingType === "pg" && (
                  <>
                    <Detail
                      label="Sharing option"
                      value={property.sharingOption}
                    />
                    <Detail
                      label="Total capacity"
                      value={property.totalCapacity}
                    />
                  </>
                )}
                {property.listingType === "rent" &&
                  property.availableFor.length > 0 && (
                    <Detail
                      label="Available for"
                      value={property.availableFor.join(", ")}
                    />
                  )}
                {property.listingType === "pg" &&
                  property.pgServices.length > 0 && (
                    <Detail
                      label="PG Services"
                      value={property.pgServices.join(", ")}
                    />
                  )}
                <Detail label="City" value={property.city} />
                <Detail
                  label="Posted on"
                  value={
                    property.createdAt
                      ? dateFmt.format(new Date(property.createdAt))
                      : null
                  }
                />
                <Detail label="Location" value={property.location} />
                {!isNewLaunch && (
                  <Detail
                    label="Parking"
                    value={
                      property.parking.available
                        ? [
                            property.parking.count,
                            property.parking.type,
                          ]
                            .filter(Boolean)
                            .join(" · ") || "Yes"
                        : "No"
                    }
                  />
                )}
              </div>

              {property.address && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">
                    Address
                  </p>
                  <p className="mt-0.5 text-sm text-zinc-900">
                    {property.address}
                  </p>
                </div>
              )}

              {property.highlights.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">
                    Key Highlights
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {property.highlights.map((highlight) => (
                      <span
                        key={highlight}
                        className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {property.amenities.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">
                    Amenities
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {property.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {property.thumbnail && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">
                    Thumbnail
                  </p>
                  <Image
                    src={property.thumbnail}
                    alt="Thumbnail"
                    width={800}
                    height={450}
                    unoptimized
                    className="mt-2 h-48 w-full rounded-lg object-cover"
                  />
                </div>
              )}

              {property.images.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">
                    Property Images
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {property.images.map((image) => (
                      <Image
                        key={image}
                        src={image}
                        alt="Property image"
                        width={400}
                        height={300}
                        unoptimized
                        className="h-32 w-full rounded-lg object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}

              {property.videos.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">
                    Video
                  </p>
                  <video
                    controls
                    src={property.videos[0]}
                    className="mt-2 w-full rounded-lg"
                  />
                </div>
              )}

              {property.brochure && (
                <a
                  href={property.brochure}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" x2="12" y1="15" y2="3" />
                  </svg>
                  Download brochure (PDF)
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
