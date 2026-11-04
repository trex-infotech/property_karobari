import "server-only";

import { ObjectId } from "mongodb";
import { connection } from "next/server";
import {
  CAREER_STATUSES,
  type CareerStatus,
} from "./career-constants";
import { getDb } from "./mongodb";

export type CareerNote = {
  text: string;
  by: string | null;
  at: string | null;
};

export type CareerApplication = {
  _id: string;
  name: string;
  email: string | null;
  phone: string;
  position: string;
  experience: string | null;
  city: string;
  message: string | null;
  resumeUrl: string | null;
  status: CareerStatus;
  assignedTo: string | null;
  assignedToName: string | null;
  notes: CareerNote[];
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
): CareerApplication {
  const status = CAREER_STATUSES.includes(doc.status as CareerStatus)
    ? (doc.status as CareerStatus)
    : "new";

  return {
    _id: doc._id.toString(),
    name: String(doc.name ?? ""),
    email: strOrNull(doc.email),
    phone: String(doc.phone ?? ""),
    position: String(doc.position ?? ""),
    experience: strOrNull(doc.experience),
    city: String(doc.city ?? ""),
    message: strOrNull(doc.message),
    resumeUrl: strOrNull(doc.resumeUrl),
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

export async function getAllCareerApplications(): Promise<
  CareerApplication[]
> {
  await connection();
  const db = await getDb();
  const docs = await db
    .collection("career_applications")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(serialize);
}
