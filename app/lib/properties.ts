import "server-only";

import { ObjectId } from "mongodb";
import { cacheLife, cacheTag } from "next/cache";
import { getDb } from "./mongodb";
import { RESTRICTED_FIELDS_BY_TYPE } from "./restricted-fields";
import type { PropertyRecord } from "./types";

type PropertyOptions = {
  city?: string;
  q?: string;
  ptype?: string;
  min?: number;
  max?: number;
  limit?: number;
};

function serialize(
  doc: Record<string, unknown> & { _id: ObjectId },
): PropertyRecord {
  const parking = (doc.parking ?? {}) as Record<string, unknown>;
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
    id: doc._id.toString(),
    listingType: String(doc.listingType ?? "sale"),
    status: String(doc.status ?? "published"),
    societyName: strOrNull(doc.societyName) ?? strOrNull(doc.title),
    propertyType: strOrNull(doc.propertyType),
    floor: numOrNull(doc.floor),
    totalFloors: numOrNull(doc.totalFloors),
    bedrooms: strOrNull(doc.bedrooms),
    area: numOrNull(doc.area),
    areaUnit: strOrNull(doc.areaUnit),
    parking: {
      available: Boolean(parking.available),
      count: numOrNull(parking.count),
      type: strOrNull(parking.type),
    },
    constructionStatus: strOrNull(doc.constructionStatus),
    transactionType: strOrNull(doc.transactionType),
    reraNumber: strOrNull(doc.reraNumber),
    builderName: strOrNull(doc.builderName),
    saleStatus: strOrNull(doc.saleStatus),
    price: numOrNull(doc.price),
    deposit: numOrNull(doc.deposit),
    availableFor: arr(doc.availableFor),
    pgServices: arr(doc.pgServices),
    sharingOption: strOrNull(doc.sharingOption),
    totalCapacity: strOrNull(doc.totalCapacity),
    possessionIn: strOrNull(doc.possessionIn),
    startingFrom:
      numOrNull(doc.startingFrom) ??
      (doc.listingType === "new_launch" ? numOrNull(doc.price) : null),
    suitableFor: strOrNull(doc.suitableFor),
    leaseAmount: numOrNull(doc.leaseAmount),
    rentalYield: numOrNull(doc.rentalYield),
    totalLeaseTenure: strOrNull(doc.totalLeaseTenure),
    balanceLeaseTenure: strOrNull(doc.balanceLeaseTenure),
    tenantType: strOrNull(doc.tenantType),
    possessionType: strOrNull(doc.possessionType),
    reservePrice: numOrNull(doc.reservePrice),
    emdAmount: numOrNull(doc.emdAmount),
    emdDate: strOrNull(doc.emdDate),
    inspectionDate: strOrNull(doc.inspectionDate),
    bankName: strOrNull(doc.bankName),
    address: strOrNull(doc.address),
    city: strOrNull(doc.city),
    location: strOrNull(doc.location),
    furnishing: strOrNull(doc.furnishing),
    buildingAge: strOrNull(doc.buildingAge),
    facing: strOrNull(doc.facing),
    amenities: arr(doc.amenities),
    highlights: arr(doc.highlights),
    thumbnail: strOrNull(doc.thumbnail),
    images: arr(doc.images),
    videos: arr(doc.videos),
    brochure: strOrNull(doc.brochure),
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : strOrNull(doc.createdAt),
    restrictedFields: [],
  };
}

// Strip restricted field values for the record's listing type so they
// never reach public responses; only the restricted key names survive.
function maskRestricted(record: PropertyRecord): PropertyRecord {
  const fields = RESTRICTED_FIELDS_BY_TYPE[record.listingType] ?? [];
  const masked = { ...record };
  for (const key of fields) {
    const value = masked[key as keyof PropertyRecord];
    const hasValue = Array.isArray(value) ? value.length > 0 : value !== null;
    if (hasValue) {
      masked.restrictedFields.push(key);
      (masked as Record<string, unknown>)[key] = Array.isArray(value)
        ? []
        : null;
    }
  }
  return masked;
}

export async function getPublishedProperties(
  listingType: string,
  { city, q, ptype, min, max, limit }: PropertyOptions = {},
): Promise<PropertyRecord[]> {
  "use cache";
  cacheTag("properties");
  cacheLife("hours");
  const db = await getDb();

  const filter: Record<string, unknown> = {
    listingType,
    status: "published",
  };

  if (city) filter.city = city;
  if (ptype) {
    filter.propertyType = new RegExp(
      `^${ptype.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
      "i",
    );
  }

  if (min !== undefined || max !== undefined) {
    filter.price = {
      ...(min !== undefined ? { $gte: min } : {}),
      ...(max !== undefined ? { $lte: max } : {}),
    };
  }

  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [
      { societyName: rx },
      { title: rx },
      { location: rx },
      { city: rx },
      { address: rx },
      { propertyType: rx },
    ];
  }

  const docs = await db
    .collection("properties")
    .find(filter, {
      // Cards only need these fields — skip the heavy media/amenity arrays.
      projection: {
        images: 0,
        videos: 0,
        brochure: 0,
        amenities: 0,
        highlights: 0,
        pgServices: 0,
        availableFor: 0,
      },
    })
    .sort({ createdAt: -1 })
    .limit(limit ?? 100)
    .toArray();

  return docs.map((doc) => maskRestricted(serialize(doc)));
}

export type PropertyTypeStat = {
  propertyType: string;
  count: number;
  thumbnail: string | null;
  listingType: string;
};

export async function getPropertyTypeStats(): Promise<PropertyTypeStat[]> {
  "use cache";
  cacheTag("properties");
  cacheLife("hours");
  const db = await getDb();
  const docs = await db
    .collection("properties")
    .aggregate([
      { $match: { status: "published" } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$propertyType",
          count: { $sum: 1 },
          thumbnail: { $first: "$thumbnail" },
          listingTypes: { $push: "$listingType" },
        },
      },
    ])
    .toArray();

  return docs.map((doc) => {
    const listingTypes = (doc.listingTypes as string[]) ?? [];
    const counts = new Map<string, number>();
    for (const t of listingTypes) counts.set(t, (counts.get(t) ?? 0) + 1);
    const listingType =
      [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "sale";
    return {
      propertyType: String(doc._id ?? ""),
      count: Number(doc.count ?? 0),
      thumbnail: typeof doc.thumbnail === "string" ? doc.thumbnail : null,
      listingType,
    };
  });
}

export async function getPublishedProperty(
  id: string,
  listingType: string,
): Promise<PropertyRecord | null> {
  "use cache";
  if (!ObjectId.isValid(id)) return null;

  cacheTag("properties");
  cacheLife("hours");
  const db = await getDb();
  const doc = await db.collection("properties").findOne({
    _id: new ObjectId(id),
    listingType,
    status: "published",
  });
  if (!doc) return null;

  return maskRestricted(serialize(doc));
}
