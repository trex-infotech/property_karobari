import "server-only";

import { ObjectId } from "mongodb";
import { connection } from "next/server";
import { getDb } from "./mongodb";
import {
  INTERIOR_BUDGETS,
  INTERIOR_PROPERTY_TYPES,
  INTERIOR_SCOPES,
  INTERIOR_STATUSES,
  type InteriorPropertyType,
  type InteriorScope,
  type InteriorStatus,
} from "./interior-constants";

export type InteriorNote = {
  text: string;
  by: string | null;
  at: string | null;
};

export type InteriorEnquiry = {
  _id: string;
  name: string;
  email: string | null;
  phone: string;
  propertyType: InteriorPropertyType;
  scope: InteriorScope;
  budget: (typeof INTERIOR_BUDGETS)[number] | null;
  city: string;
  message: string | null;
  status: InteriorStatus;
  assignedTo: string | null;
  assignedToName: string | null;
  notes: InteriorNote[];
  createdAt: string | null;
};

function strOrNull(value: unknown): string | null {
  return typeof value === "string" && value ? value : null;
}

function isoOrNull(value: unknown): string | null {
  return value instanceof Date
    ? value.toISOString()
    : typeof value === "string"
      ? value
      : null;
}

function serialize(
  doc: Record<string, unknown> & { _id: ObjectId },
): InteriorEnquiry {
  const status = INTERIOR_STATUSES.includes(doc.status as InteriorStatus)
    ? (doc.status as InteriorStatus)
    : "new";
  const propertyType = INTERIOR_PROPERTY_TYPES.includes(
    doc.propertyType as InteriorPropertyType,
  )
    ? (doc.propertyType as InteriorPropertyType)
    : "Other";
  const scope = INTERIOR_SCOPES.includes(doc.scope as InteriorScope)
    ? (doc.scope as InteriorScope)
    : "Not Sure — Need Consultation";
  const budget = INTERIOR_BUDGETS.includes(
    doc.budget as (typeof INTERIOR_BUDGETS)[number],
  )
    ? (doc.budget as (typeof INTERIOR_BUDGETS)[number])
    : null;

  return {
    _id: doc._id.toString(),
    name: String(doc.name ?? ""),
    email: strOrNull(doc.email),
    phone: String(doc.phone ?? ""),
    propertyType,
    scope,
    budget,
    city: String(doc.city ?? ""),
    message: strOrNull(doc.message),
    status,
    assignedTo: strOrNull(
      doc.assignedTo instanceof ObjectId
        ? doc.assignedTo.toString()
        : doc.assignedTo,
    ),
    assignedToName: strOrNull(doc.assignedToName),
    notes: Array.isArray(doc.notes)
      ? doc.notes
          .filter(
            (n): n is Record<string, unknown> =>
              typeof n === "object" && n !== null,
          )
          .map((n) => ({
            text: String(n.text ?? ""),
            by: strOrNull(n.by),
            at: isoOrNull(n.at),
          }))
      : [],
    createdAt: isoOrNull(doc.createdAt),
  };
}

export async function getAllInteriorEnquiries(): Promise<InteriorEnquiry[]> {
  await connection();
  const db = await getDb();
  const docs = await db
    .collection("interior_enquiries")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(serialize);
}
