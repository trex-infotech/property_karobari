import "server-only";

import { ObjectId } from "mongodb";
import { connection } from "next/server";
import {
  LOAN_ENQUIRY_STATUSES,
  LOAN_TYPES,
  type LoanEnquiryStatus,
  type LoanType,
} from "./loan-enquiry-constants";
import { getDb } from "./mongodb";

export type LoanEnquiryNote = {
  text: string;
  by: string | null;
  at: string | null;
};

export type LoanEnquiry = {
  _id: string;
  name: string;
  email: string | null;
  phone: string;
  loanType: LoanType;
  amount: string;
  city: string;
  message: string | null;
  status: LoanEnquiryStatus;
  assignedTo: string | null;
  assignedToName: string | null;
  notes: LoanEnquiryNote[];
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
): LoanEnquiry {
  const loanType = LOAN_TYPES.includes(doc.loanType as LoanType)
    ? (doc.loanType as LoanType)
    : "Home Loan";
  const status = LOAN_ENQUIRY_STATUSES.includes(
    doc.status as LoanEnquiryStatus,
  )
    ? (doc.status as LoanEnquiryStatus)
    : "new";

  return {
    _id: doc._id.toString(),
    name: String(doc.name ?? ""),
    email: strOrNull(doc.email),
    phone: String(doc.phone ?? ""),
    loanType,
    amount: String(doc.amount ?? ""),
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

export async function getAllLoanEnquiries(): Promise<LoanEnquiry[]> {
  await connection();
  const db = await getDb();
  const docs = await db
    .collection("loan_enquiries")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(serialize);
}
