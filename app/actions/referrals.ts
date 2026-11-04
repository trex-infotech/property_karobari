"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { hasRecentSubmission } from "@/app/lib/dedupe";
import { getDb } from "@/app/lib/mongodb";
import {
  REFERRAL_STATUSES,
  REQUIREMENT_TYPES,
  type ReferralStatus,
} from "@/app/lib/referral-constants";
import { getSession } from "@/app/lib/session";

export type ReferralFormState =
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

async function sendReferralNotification(referral: {
  referrerName: string;
  referrerPhone: string;
  referredName: string;
  referredPhone: string;
  requirement: string;
  city: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ENQUIRY_EMAIL;
  if (!apiKey || !to) return;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from:
      process.env.RESEND_FROM || "Property Karobari <onboarding@resend.dev>",
    to,
    subject: `New referral: ${referral.referredName} (by ${referral.referrerName})`,
    html: `
      <h2 style="margin:0 0 12px">New referral submitted</h2>
      <table style="border-collapse:collapse">
        <tr><td style="padding:4px 12px 4px 0;color:#666">Referred by</td><td>${escapeHtml(referral.referrerName)} — ${escapeHtml(referral.referrerPhone)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Referred person</td><td>${escapeHtml(referral.referredName)} — ${escapeHtml(referral.referredPhone)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Requirement</td><td>${escapeHtml(referral.requirement)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">City</td><td>${escapeHtml(referral.city)}</td></tr>
      </table>
      <p style="margin:16px 0 0;color:#666">View details in the admin panel.</p>
    `,
  });

  if (error) throw new Error(error.message);
}

export async function submitReferral(
  _prevState: ReferralFormState,
  formData: FormData,
): Promise<ReferralFormState> {
  const referrerName = String(formData.get("referrerName") ?? "").trim();
  const referrerPhone = String(formData.get("referrerPhone") ?? "").trim();
  const referrerEmail =
    String(formData.get("referrerEmail") ?? "").trim().toLowerCase() || null;
  const referredName = String(formData.get("referredName") ?? "").trim();
  const referredPhone = String(formData.get("referredPhone") ?? "").trim();
  const requirement = String(formData.get("requirement") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim() || null;

  if (
    !referrerName ||
    !referrerPhone ||
    !referredName ||
    !referredPhone ||
    !requirement ||
    !city
  ) {
    return { error: "Please fill in all required fields." };
  }
  if (referrerEmail && !EMAIL_RE.test(referrerEmail)) {
    return { error: "Please enter a valid email address." };
  }
  for (const [label, value] of [
    ["your", referrerPhone],
    ["their", referredPhone],
  ] as const) {
    const digits = value.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15) {
      return { error: `Please enter a valid ${label} mobile number.` };
    }
  }
  if (
    !REQUIREMENT_TYPES.includes(
      requirement as (typeof REQUIREMENT_TYPES)[number],
    )
  ) {
    return { error: "Please choose a requirement type." };
  }

  try {
    const db = await getDb();
    if (
      await hasRecentSubmission("referrals", {
        referrerPhone,
        referredPhone,
      })
    ) {
      return {
        error:
          "This referral has already been submitted recently. Our team will reach out to them soon.",
      };
    }

    await db.collection("referrals").insertOne({
      referrerName,
      referrerPhone,
      referrerEmail,
      referredName,
      referredPhone,
      requirement,
      city,
      message,
      status: "new" satisfies ReferralStatus,
      assignedTo: null,
      assignedToName: null,
      notes: [],
      createdAt: new Date(),
    });
  } catch {
    return { error: "Failed to submit your referral. Please try again." };
  }

  try {
    await sendReferralNotification({
      referrerName,
      referrerPhone,
      referredName,
      referredPhone,
      requirement,
      city,
    });
  } catch (error) {
    // Referral is safely stored — don't lose it over an email failure.
    console.error("Failed to send referral notification email:", error);
  }

  revalidatePath("/admin/referrals");
  return { success: true };
}

export async function setReferralStatus(
  _prevState: ReferralFormState,
  formData: FormData,
): Promise<ReferralFormState> {
  if (!(await getSession())) return { error: "Not authorized." };

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!ObjectId.isValid(id)) return { error: "Invalid referral." };
  if (!REFERRAL_STATUSES.includes(status as ReferralStatus)) {
    return { error: "Invalid status." };
  }

  const db = await getDb();
  await db
    .collection("referrals")
    .updateOne({ _id: new ObjectId(id) }, { $set: { status } });

  revalidatePath("/admin/referrals");
  return { success: true };
}

export async function assignReferral(
  _prevState: ReferralFormState,
  formData: FormData,
): Promise<ReferralFormState> {
  if (!(await getSession())) return { error: "Not authorized." };

  const id = String(formData.get("id") ?? "");
  const employeeId = String(formData.get("employeeId") ?? "");
  if (!ObjectId.isValid(id)) return { error: "Invalid referral." };

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
    .collection("referrals")
    .updateOne(
      { _id: new ObjectId(id) },
      { $set: { assignedTo, assignedToName } },
    );

  revalidatePath("/admin/referrals");
  return { success: true };
}

export async function addReferralNote(
  _prevState: ReferralFormState,
  formData: FormData,
): Promise<ReferralFormState> {
  const session = await getSession();
  if (!session) return { error: "Not authorized." };

  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!ObjectId.isValid(id)) return { error: "Invalid referral." };
  if (!note) return { error: "Note cannot be empty." };

  const db = await getDb();
  await db
    .collection<{ notes?: { text: string; by: string | null; at: Date }[] }>(
      "referrals",
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

  revalidatePath("/admin/referrals");
  return { success: true };
}

export async function deleteReferral(
  _prevState: ReferralFormState,
  formData: FormData,
): Promise<ReferralFormState> {
  if (!(await getSession())) return { error: "Not authorized." };

  const id = String(formData.get("id") ?? "");
  if (!ObjectId.isValid(id)) return { error: "Invalid referral." };

  const db = await getDb();
  await db.collection("referrals").deleteOne({ _id: new ObjectId(id) });

  revalidatePath("/admin/referrals");
  return { success: true };
}
