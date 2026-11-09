import type { Metadata } from "next";
import { connection } from "next/server";
import { getDb } from "@/app/lib/mongodb";
import type { PropertyRecord } from "@/app/lib/types";
import AddPropertyModal from "./add-property-modal";
import DeletePropertyButton from "./delete-property-button";
import ViewPropertyModal from "./view-property-modal";

export const metadata: Metadata = {
  title: "Properties | Admin",
};

// Reads MongoDB at request time.
export const instant = false;

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

function toPropertyRecord(
  property: Record<string, unknown>,
): PropertyRecord {
  const parking = (property.parking ?? {}) as Record<string, unknown>;
  const arr = (value: unknown) =>
    Array.isArray(value) ? (value as string[]) : [];
  const numOrNull = (value: unknown) => {
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  };
  const strOrNull = (value: unknown) =>
    typeof value === "string" ? value : null;

  return {
    id: String(property._id),
    listingType: String(property.listingType ?? "sale"),
    status: String(property.status ?? "published"),
    societyName:
      strOrNull(property.societyName) ?? strOrNull(property.title),
    propertyType: strOrNull(property.propertyType),
    floor: numOrNull(property.floor),
    totalFloors: numOrNull(property.totalFloors),
    bedrooms: strOrNull(property.bedrooms),
    area: numOrNull(property.area),
    areaUnit: strOrNull(property.areaUnit),
    parking: {
      available: Boolean(parking.available),
      count: numOrNull(parking.count),
      type: strOrNull(parking.type),
    },
    constructionStatus: strOrNull(property.constructionStatus),
    transactionType: strOrNull(property.transactionType),
    reraNumber: strOrNull(property.reraNumber),
    builderName: strOrNull(property.builderName),
    saleStatus: strOrNull(property.saleStatus),
    price: numOrNull(property.price),
    deposit: numOrNull(property.deposit),
    availableFor: arr(property.availableFor),
    pgServices: arr(property.pgServices),
    sharingOption: strOrNull(property.sharingOption),
    totalCapacity: strOrNull(property.totalCapacity),
    possessionIn: strOrNull(property.possessionIn),
    startingFrom:
      numOrNull(property.startingFrom) ??
      (property.listingType === "new_launch"
        ? numOrNull(property.price)
        : null),
    suitableFor: strOrNull(property.suitableFor),
    leaseAmount: numOrNull(property.leaseAmount),
    rentalYield: numOrNull(property.rentalYield),
    totalLeaseTenure: strOrNull(property.totalLeaseTenure),
    balanceLeaseTenure: strOrNull(property.balanceLeaseTenure),
    tenantType: strOrNull(property.tenantType),
    possessionType: strOrNull(property.possessionType),
    reservePrice: numOrNull(property.reservePrice),
    emdAmount: numOrNull(property.emdAmount),
    emdDate: strOrNull(property.emdDate),
    inspectionDate: strOrNull(property.inspectionDate),
    bankName: strOrNull(property.bankName),
    address: strOrNull(property.address),
    city: strOrNull(property.city),
    location: strOrNull(property.location),
    furnishing: strOrNull(property.furnishing),
    buildingAge: strOrNull(property.buildingAge),
    facing: strOrNull(property.facing),
    amenities: arr(property.amenities),
    highlights: arr(property.highlights),
    thumbnail: strOrNull(property.thumbnail),
    images: arr(property.images),
    videos: arr(property.videos),
    brochure: strOrNull(property.brochure),
    createdAt:
      property.createdAt instanceof Date
        ? property.createdAt.toISOString()
        : strOrNull(property.createdAt),
    restrictedFields: [],
  };
}

export default async function AdminPropertiesPage() {
  // Render at request time — MongoDB internals use Date.now()/new Date(),
  // which the prerenderer rejects.
  await connection();
  const db = await getDb();
  const [properties, cities] = await Promise.all([
    db.collection("properties").find().sort({ createdAt: -1 }).limit(100).toArray(),
    db
      .collection("cities")
      .find()
      .sort({ city: 1 })
      .limit(500)
      .toArray(),
  ]);

  const cityOptions = cities.map((entry) => ({
    city: String(entry.city),
    locations: Array.isArray(entry.locations) ? (entry.locations as string[]) : [],
  }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Properties
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Add, edit, and manage property listings.
          </p>
        </div>
        <AddPropertyModal cities={cityOptions} />
      </div>

      {properties.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500">
          No properties yet. Click “Add Property” to create your first listing.
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Society / Project</th>
                <th className="px-4 py-3">Listing</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Price</th>
                <th className="hidden px-4 py-3 sm:table-cell">City</th>
                <th className="hidden px-4 py-3 sm:table-cell">Posted</th>
                <th className="px-4 py-3">Status</th>
                <th className="w-48 px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {properties.map((property) => {
                const record = toPropertyRecord(property);

                return (
                  <tr key={record.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {record.societyName || "Untitled"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {listingLabels[property.listingType] ?? property.listingType}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {property.propertyType ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {inr.format(property.price ?? 0)}
                  </td>
                  <td className="hidden px-4 py-3 text-zinc-600 sm:table-cell">
                    {property.city ?? "—"}
                  </td>
                  <td className="hidden px-4 py-3 text-zinc-600 sm:table-cell">
                    {record.createdAt
                      ? dateFmt.format(new Date(record.createdAt))
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                        property.status === "draft"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {property.status === "draft" ? "Draft" : "Published"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <ViewPropertyModal property={record} />
                      <AddPropertyModal
                        cities={cityOptions}
                        property={record}
                      />
                      <DeletePropertyButton
                        propertyId={record.id}
                        title={record.societyName ?? "this property"}
                      />
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
