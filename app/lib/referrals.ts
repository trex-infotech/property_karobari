import "server-only";

import { ObjectId } from "mongodb";
import { connection } from "next/server";
import { getDb } from "./mongodb";
import {
  REFERRAL_STATUSES,
  REQUIREMENT_TYPES,
  type ReferralStatus,
  type RequirementType,
} from "./referral-constants";

export type ReferralNote = {
  text: string;
  by: string | null;
  at: string | null;
};

export type Referral = {
  _id: string;
  referrerName: string;
  referrerPhone: string;
  referrerEmail: string | null;
  referredName: string;
  referredPhone: string;
  requirement: RequirementType;
  city: string;
  message: string | null;
  status: ReferralStatus;
  assignedTo: string | null;
  assignedToName: string | null;
  notes: ReferralNote[];
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

function serialize(doc: Record<string, unknown> & { _id: ObjectId }): Referral {
  const status = REFERRAL_STATUSES.includes(doc.status as ReferralStatus)
    ? (doc.status as ReferralStatus)
    : "new";
  const requirement = REQUIREMENT_TYPES.includes(
    doc.requirement as RequirementType,
  )
    ? (doc.requirement as RequirementType)
    : "Other";

  return {
    _id: doc._id.toString(),
    referrerName: String(doc.referrerName ?? ""),
    referrerPhone: String(doc.referrerPhone ?? ""),
    referrerEmail: strOrNull(doc.referrerEmail),
    referredName: String(doc.referredName ?? ""),
    referredPhone: String(doc.referredPhone ?? ""),
    requirement,
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

export async function getAllReferrals(): Promise<Referral[]> {
  await connection();
  const db = await getDb();
  const docs = await db
    .collection("referrals")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(serialize);
}
