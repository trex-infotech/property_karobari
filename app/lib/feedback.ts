import "server-only";

import { ObjectId } from "mongodb";
import { connection } from "next/server";
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_STATUSES,
  type FeedbackCategory,
  type FeedbackStatus,
} from "./feedback-constants";
import { getDb } from "./mongodb";

export type Feedback = {
  _id: string;
  name: string;
  email: string | null;
  phone: string;
  category: FeedbackCategory;
  rating: number;
  subject: string;
  message: string;
  attachments: string[];
  status: FeedbackStatus;
  response: string | null;
  respondedAt: string | null;
  respondedBy: string | null;
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

function serialize(doc: Record<string, unknown> & { _id: ObjectId }): Feedback {
  const category = FEEDBACK_CATEGORIES.includes(
    doc.category as FeedbackCategory,
  )
    ? (doc.category as FeedbackCategory)
    : "Other";
  const status = FEEDBACK_STATUSES.includes(doc.status as FeedbackStatus)
    ? (doc.status as FeedbackStatus)
    : "new";
  const rating = Number(doc.rating);

  return {
    _id: doc._id.toString(),
    name: String(doc.name ?? ""),
    email: strOrNull(doc.email),
    phone: String(doc.phone ?? ""),
    category,
    rating: Number.isFinite(rating) ? Math.min(Math.max(rating, 1), 5) : 0,
    subject: String(doc.subject ?? ""),
    message: String(doc.message ?? ""),
    attachments: Array.isArray(doc.attachments)
      ? doc.attachments.filter((u): u is string => typeof u === "string")
      : [],
    status,
    response: strOrNull(doc.response),
    respondedAt: isoOrNull(doc.respondedAt),
    respondedBy: strOrNull(doc.respondedBy),
    createdAt: isoOrNull(doc.createdAt),
  };
}

export async function getAllFeedback(): Promise<Feedback[]> {
  await connection();
  const db = await getDb();
  const docs = await db
    .collection("feedback")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(serialize);
}
