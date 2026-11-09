import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EnquireButton, {
  EnquireTrigger,
} from "@/app/components/enquire-button";
import PageBanner from "@/app/components/page-banner";
import PropertyGallery from "@/app/components/property-gallery";
import { getPublishedProperty } from "@/app/lib/properties";
import {
  RESTRICTED_FIELD_LABELS,
  RESTRICTED_FIELD_PLACEHOLDERS,
} from "@/app/lib/restricted-fields";
import {
  formatPrice,
  listingLabel,
  PROPERTY_PAGES,
} from "@/app/lib/property-format";

// Reads MongoDB at request time.
export const instant = false;

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

type Props = { params: Promise<{ type: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type, id } = await params;
  const config = PROPERTY_PAGES[type];
  if (!config) return { title: "Not found | Property Karobari" };

  const property = await getPublishedProperty(id, config.listingType);
  if (!property) return { title: "Not found | Property Karobari" };

  return {
    title: `${property.societyName || "Property"} | Property Karobari`,
    description:
      property.location || property.city
        ? [property.location, property.city].filter(Boolean).join(", ")
        : config.heading,
  };
}

function LockIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
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
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function LockedValue({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-zinc-400">
      <LockIcon />
      <span className="select-none blur-[3px]" aria-label="Restricted">
        {text}
      </span>
    </span>
  );
}

type EnquiryProps = {
  propertyId: string;
  propertyTitle: string;
  propertyUrl: string;
};

function Detail({
  label,
  value,
  locked,
  enquiry,
}: {
  label: string;
  value?: React.ReactNode;
  locked?: string | false;
  enquiry?: EnquiryProps;
}) {
  if (!locked && (value === null || value === undefined || value === "")) {
    return null;
  }

  const lockedContent = (
    <LockedValue
      text={RESTRICTED_FIELD_PLACEHOLDERS[locked as string] ?? "Hidden data"}
    />
  );

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <div className="mt-0.5 text-sm font-medium text-zinc-900">
        {locked ? (
          enquiry ? (
            <EnquireTrigger {...enquiry} className="inline-flex cursor-pointer">
              {lockedContent}
            </EnquireTrigger>
          ) : (
            lockedContent
          )
        ) : (
          value
        )}
      </div>
    </div>
  );
}

export default async function PropertyDetailPage({ params }: Props) {
  const { type, id } = await params;
  const config = PROPERTY_PAGES[type];
  if (!config) notFound();

  const property = await getPublishedProperty(id, config.listingType);
  if (!property) notFound();

  const isRentLike =
    property.listingType === "rent" || property.listingType === "pg";
  const isNewLaunch = property.listingType === "new_launch";
  const enquiryProps: EnquiryProps = {
    propertyId: property.id,
    propertyTitle: property.societyName || "Property",
    propertyUrl: `/properties/${type}/${id}`,
  };
  const priceLabel = isNewLaunch
    ? "Starting From"
    : isRentLike
      ? "Rent"
      : "Price";
  const gallery = [
    ...(property.thumbnail ? [property.thumbnail] : []),
    ...property.images,
  ].filter((src, index, arr) => arr.indexOf(src) === index);

  return (
    <section className="min-h-screen bg-linear-to-br from-white via-blue-50/30 to-blue-100/20 pb-16">
      <PageBanner
        title={property.societyName || "Untitled property"}
        subtitle={
          [property.location, property.city].filter(Boolean).join(", ") ||
          undefined
        }
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Properties" },
          { label: config.label, href: `/properties/${type}` },
          { label: property.societyName || "Property" },
        ]}
      />

      <div className="container mx-auto px-6 pt-10">
        <article className="overflow-hidden rounded-2xl border border-blue-100/50 bg-white shadow-lg">
          <div className="p-6 md:p-10">
            {(gallery.length > 0 || property.videos.length > 0) && (
              <div className="mb-8">
                <PropertyGallery
                  images={gallery}
                  video={property.videos[0] ?? null}
                  title={property.societyName || "Property"}
                />
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="inline-block rounded-full border border-blue-200 bg-linear-to-r from-blue-100 to-blue-50 px-4 py-1 text-xs font-bold text-blue-600">
                {listingLabel(property.listingType)}
              </span>
              <p className="text-2xl font-bold text-blue-600">
                {formatPrice(property.price) ?? "Price on request"}
                {property.price !== null && isRentLike && (
                  <span className="text-sm font-medium text-zinc-500">
                    /month
                  </span>
                )}
              </p>
            </div>

            {isNewLaunch && property.brochure && (
              <a
                href={property.brochure}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
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
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download Project Brochure (PDF)
              </a>
            )}

            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-3">
              <Detail label="Property type" value={property.propertyType} />
              <Detail
                label="Transaction type"
                value={property.transactionType}
              />
              <Detail label="Bedrooms" value={property.bedrooms} />
              <Detail
                label="Area"
                value={
                  property.area !== null
                    ? `${property.area} ${property.areaUnit ?? ""}`.trim()
                    : null
                }
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
              <Detail label="Furnishing" value={property.furnishing} />
              <Detail
                label="Building Age"
                value={property.buildingAge}
              />
              <Detail label="Facing" value={property.facing} />
              <Detail label="Address" value={property.address} />
              <Detail label="Suitable for" value={property.suitableFor} />
              <Detail
                label="Possession type"
                value={property.possessionType}
              />
              <Detail
                label="EMD amount"
                value={
                  property.emdAmount !== null
                    ? formatPrice(property.emdAmount)
                    : null
                }
              />
              <Detail label="EMD date" value={property.emdDate} />
              <Detail
                label="Parking"
                value={
                  property.parking.available
                    ? [property.parking.count, property.parking.type]
                        .filter(Boolean)
                        .join(" · ") || "Yes"
                    : "No"
                }
              />
              {property.listingType === "rent" && (
                <Detail
                  label="Deposit"
                  value={
                    property.deposit !== null
                      ? formatPrice(property.deposit)
                      : null
                  }
                />
              )}
              {property.listingType === "rent" &&
                property.availableFor.length > 0 && (
                  <Detail
                    label="Available for"
                    value={property.availableFor.join(", ")}
                  />
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
                  {property.pgServices.length > 0 && (
                    <Detail
                      label="PG Services"
                      value={property.pgServices.join(", ")}
                    />
                  )}
                </>
              )}
              {isNewLaunch && (
                <>
                  <Detail label="Sale Status" value={property.saleStatus} />
                  <Detail
                    label="Possession In"
                    value={property.possessionIn}
                  />
                </>
              )}
              <Detail
                label="Posted on"
                value={
                  property.createdAt
                    ? dateFmt.format(new Date(property.createdAt))
                    : null
                }
              />
              {property.restrictedFields.map((field) => (
                <Detail
                  key={field}
                  label={RESTRICTED_FIELD_LABELS[field] ?? field}
                  locked={field}
                  enquiry={enquiryProps}
                />
              ))}
            </div>

            {property.highlights.length > 0 && (
              <div className="mt-8 border-t border-slate-100 pt-6">
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Key Highlights
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {property.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {property.amenities.length > 0 && (
              <div className="mt-8 border-t border-slate-100 pt-6">
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Amenities
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {property.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-linear-to-r from-blue-100 to-blue-50 p-6">
              <div>
                <p className="text-lg font-bold text-blue-900">
                  Interested in this property?
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  Get in touch with our team for a site visit or more details.
                </p>
              </div>
              <EnquireButton
                propertyId={property.id}
                propertyTitle={property.societyName || "Property"}
                propertyUrl={`/properties/${type}/${id}`}
              />
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
