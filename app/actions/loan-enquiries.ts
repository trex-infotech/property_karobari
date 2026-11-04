"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import {
  LOAN_ENQUIRY_STATUSES,
  LOAN_TYPES,
  type LoanEnquiryStatus,
} from "@/app/lib/loan-enquiry-constants";
import { hasRecentSubmission } from "@/app/lib/dedupe";
import { getDb } from "@/app/lib/mongodb";
import { getSession } from "@/app/lib/session";

export type LoanEnquiryFormState =
  | { error?: string; success?: boolean }
  | undefined;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendLoanEnquiryNotification(enquiry: {
  name: string;
  email: string | null;
  phone: string;
  loanType: string;
  amount: string;
  city: string;
  message: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ENQUIRY_EMAIL;
  if (!apiKey || !to) return;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from:
      process.env.RESEND_FROM || "Property Karobari <onboarding@resend.dev>",
    to,
    replyTo: enquiry.email ?? undefined,
    subject: `New loan enquiry from ${enquiry.name}`,
    html: `
      <h2 style="margin:0 0 12px">New loan enquiry</h2>
      <table style="border-collapse:collapse">
        <tr><td style="padding:4px 12px 4px 0;color:#666">Name</td><td>${escapeHtml(enquiry.name)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Email</td><td>${escapeHtml(enquiry.email ?? "-")}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Phone</td><td>${escapeHtml(enquiry.phone)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Loan type</td><td>${escapeHtml(enquiry.loanType)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Amount</td><td>${escapeHtml(enquiry.amount)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">City</td><td>${escapeHtml(enquiry.city)}</td></tr>
      </table>
      <p style="margin:16px 0 4px;color:#666">Message</p>
      <p style="margin:0;white-space:pre-line">${escapeHtml(enquiry.message ?? "-")}</p>
    `,
  });

  if (error) throw new Error(error.message);
}

export async function submitLoanEnquiry(
  _prevState: LoanEnquiryFormState,
  formData: FormData,
): Promise<LoanEnquiryFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase() || null;
  const loanType = String(formData.get("loanType") ?? "").trim();
  const amount = String(formData.get("amount") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim() || null;

  if (!name || !phone || !loanType || !amount || !city) {
    return {
      error:
        "Name, mobile number, loan type, loan amount and city are required.",
    };
  }
  if (email && !EMAIL_RE.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  const phoneDigits = phone.replace(/\D/g, "");
  if (phoneDigits.length < 7 || phoneDigits.length > 15) {
    return { error: "Please enter a valid mobile number." };
  }
  if (!LOAN_TYPES.includes(loanType as (typeof LOAN_TYPES)[number])) {
    return { error: "Please choose a loan type." };
  }

  const enquiry = { name, email, phone, loanType, amount, city, message };

  try {
    const db = await getDb();
    if (await hasRecentSubmission("loan_enquiries", { phone, loanType })) {
      return {
        error:
          "You have already submitted a similar enquiry recently. Our loan team will reach out soon.",
      };
    }
    await db.collection("loan_enquiries").insertOne({
      ...enquiry,
      status: "new" satisfies LoanEnquiryStatus,
      assignedTo: null,
      assignedToName: null,
      notes: [],
      createdAt: new Date(),
    });
  } catch {
    return { error: "Failed to submit your enquiry. Please try again." };
  }

  try {
    await sendLoanEnquiryNotification(enquiry);
  } catch (error) {
    // The enquiry is safely stored — don't lose it over an email failure.
    console.error("Failed to send loan enquiry notification email:", error);
  }

  revalidatePath("/admin/loan-enquiries");
  return { success: true };
}

export async function setLoanEnquiryStatus(
  _prevState: LoanEnquiryFormState,
  formData: FormData,
): Promise<LoanEnquiryFormState> {
  if (!(await getSession())) return { error: "Not authorized." };

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!ObjectId.isValid(id)) return { error: "Invalid enquiry." };
  if (!LOAN_ENQUIRY_STATUSES.includes(status as LoanEnquiryStatus)) {
    return { error: "Invalid status." };
  }

  const db = await getDb();
  await db
    .collection("loan_enquiries")
    .updateOne({ _id: new ObjectId(id) }, { $set: { status } });

  revalidatePath("/admin/loan-enquiries");
  return { success: true };
}

export async function assignLoanEnquiry(
  _prevState: LoanEnquiryFormState,
  formData: FormData,
): Promise<LoanEnquiryFormState> {
  if (!(await getSession())) return { error: "Not authorized." };

  const id = String(formData.get("id") ?? "");
  const employeeId = String(formData.get("employeeId") ?? "");
  if (!ObjectId.isValid(id)) return { error: "Invalid enquiry." };

  const db = await getDb();

  let assignedTo: ObjectId | null = null;
  let assignedToName: string | null = null;
  if (employeeId) {
    if (!ObjectId.isValid(employeeId)) return { error: "Invalid employee." };
    const employee = await db
      .collection("employees")
      .findOne({ _id: new ObjectId(employeeId) });
    if (!employee) return { error: "Employee not found." };
    assignedTo = employee._id;
    assignedToName = String(employee.name ?? "");
  }

  await db
    .collection("loan_enquiries")
    .updateOne(
      { _id: new ObjectId(id) },
      { $set: { assignedTo, assignedToName } },
    );

  revalidatePath("/admin/loan-enquiries");
  return { success: true };
}

export async function addLoanEnquiryNote(
  _prevState: LoanEnquiryFormState,
  formData: FormData,
): Promise<LoanEnquiryFormState> {
  const session = await getSession();
  if (!session) return { error: "Not authorized." };

  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!ObjectId.isValid(id)) return { error: "Invalid enquiry." };
  if (!note) return { error: "Note cannot be empty." };

  const db = await getDb();
  await db
    .collection<{ notes?: { text: string; by: string | null; at: Date }[] }>(
      "loan_enquiries",
    )
    .updateOne(
      { _id: new ObjectId(id) },
      {
        $push: {
          notes: {
            text: note,
            by: typeof session.email === "string" ? session.email : null,
            at: new Date(),
          },
        },
      },
    );

  revalidatePath("/admin/loan-enquiries");
  return { success: true };
}

export async function deleteLoanEnquiry(
  _prevState: LoanEnquiryFormState,
  formData: FormData,
): Promise<LoanEnquiryFormState> {
  if (!(await getSession())) return { error: "Not authorized." };

  const id = String(formData.get("id") ?? "");
  if (!ObjectId.isValid(id)) return { error: "Invalid enquiry." };

  const db = await getDb();
  await db.collection("loan_enquiries").deleteOne({ _id: new ObjectId(id) });

  revalidatePath("/admin/loan-enquiries");
  return { success: true };
}
