"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { hasRecentSubmission } from "@/app/lib/dedupe";
import { getDb } from "@/app/lib/mongodb";
import {
  INTERIOR_BUDGETS,
  INTERIOR_PROPERTY_TYPES,
  INTERIOR_SCOPES,
  INTERIOR_STATUSES,
  type InteriorStatus,
} from "@/app/lib/interior-constants";
import { getSession } from "@/app/lib/session";

export type InteriorFormState =
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

async function sendInteriorNotification(enquiry: {
  name: string;
  email: string | null;
  phone: string;
  propertyType: string;
  scope: string;
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
    replyTo: enquiry.email ?? undefined,
    subject: `New interior enquiry: ${enquiry.scope} — ${enquiry.name}`,
    html: `
      <h2 style="margin:0 0 12px">New interior enquiry</h2>
      <table style="border-collapse:collapse">
        <tr><td style="padding:4px 12px 4px 0;color:#666">Name</td><td>${escapeHtml(enquiry.name)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Email</td><td>${escapeHtml(enquiry.email ?? "-")}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Phone</td><td>${escapeHtml(enquiry.phone)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Property</td><td>${escapeHtml(enquiry.propertyType)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Scope</td><td>${escapeHtml(enquiry.scope)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">City</td><td>${escapeHtml(enquiry.city)}</td></tr>
      </table>
      <p style="margin:16px 0 0;color:#666">View details in the admin panel.</p>
    `,
  });

  if (error) throw new Error(error.message);
}

export async function submitInteriorEnquiry(
  _prevState: InteriorFormState,
  formData: FormData,
): Promise<InteriorFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase() || null;
  const propertyType = String(formData.get("propertyType") ?? "").trim();
  const scope = String(formData.get("scope") ?? "").trim();
  const budget = String(formData.get("budget") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim() || null;

  if (!name || !phone || !propertyType || !scope || !city) {
    return {
      error:
        "Name, mobile number, property type, scope and city are required.",
    };
  }
  if (email && !EMAIL_RE.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  const phoneDigits = phone.replace(/\D/g, "");
  if (phoneDigits.length < 7 || phoneDigits.length > 15) {
    return { error: "Please enter a valid mobile number." };
  }
  if (
    !INTERIOR_PROPERTY_TYPES.includes(
      propertyType as (typeof INTERIOR_PROPERTY_TYPES)[number],
    )
  ) {
    return { error: "Please choose a property type." };
  }
  if (!INTERIOR_SCOPES.includes(scope as (typeof INTERIOR_SCOPES)[number])) {
    return { error: "Please choose a project scope." };
  }
  if (
    budget &&
    !INTERIOR_BUDGETS.includes(budget as (typeof INTERIOR_BUDGETS)[number])
  ) {
    return { error: "Please choose a valid budget range." };
  }

  const enquiry = { name, email, phone, propertyType, scope, city };

  try {
    const db = await getDb();
    if (await hasRecentSubmission("interior_enquiries", { phone, scope })) {
      return {
        error:
          "You have already submitted a similar enquiry recently. Our team will reach out soon.",
      };
    }

    await db.collection("interior_enquiries").insertOne({
      ...enquiry,
      budget,
      message,
      status: "new" satisfies InteriorStatus,
      assignedTo: null,
      assignedToName: null,
      notes: [],
      createdAt: new Date(),
    });
  } catch {
    return { error: "Failed to submit your enquiry. Please try again." };
  }

  try {
    await sendInteriorNotification(enquiry);
  } catch (error) {
    // Enquiry is safely stored — don't lose it over an email failure.
    console.error("Failed to send interior enquiry notification email:", error);
  }

  revalidatePath("/admin/interiors");
  return { success: true };
}

export async function setInteriorStatus(
  _prevState: InteriorFormState,
  formData: FormData,
): Promise<InteriorFormState> {
  if (!(await getSession())) return { error: "Not authorized." };

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!ObjectId.isValid(id)) return { error: "Invalid enquiry." };
  if (!INTERIOR_STATUSES.includes(status as InteriorStatus)) {
    return { error: "Invalid status." };
  }

  const db = await getDb();
  await db
    .collection("interior_enquiries")
    .updateOne({ _id: new ObjectId(id) }, { $set: { status } });

  revalidatePath("/admin/interiors");
  return { success: true };
}

export async function assignInteriorEnquiry(
  _prevState: InteriorFormState,
  formData: FormData,
): Promise<InteriorFormState> {
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
    .collection("interior_enquiries")
    .updateOne(
      { _id: new ObjectId(id) },
      { $set: { assignedTo, assignedToName } },
    );

  revalidatePath("/admin/interiors");
  return { success: true };
}

export async function addInteriorNote(
  _prevState: InteriorFormState,
  formData: FormData,
): Promise<InteriorFormState> {
  const session = await getSession();
  if (!session) return { error: "Not authorized." };

  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!ObjectId.isValid(id)) return { error: "Invalid enquiry." };
  if (!note) return { error: "Note cannot be empty." };

  const db = await getDb();
  await db
    .collection<{ notes?: { text: string; by: string | null; at: Date }[] }>(
      "interior_enquiries",
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

  revalidatePath("/admin/interiors");
  return { success: true };
}

export async function deleteInteriorEnquiry(
  _prevState: InteriorFormState,
  formData: FormData,
): Promise<InteriorFormState> {
  if (!(await getSession())) return { error: "Not authorized." };

  const id = String(formData.get("id") ?? "");
  if (!ObjectId.isValid(id)) return { error: "Invalid enquiry." };

  const db = await getDb();
  await db.collection("interior_enquiries").deleteOne({ _id: new ObjectId(id) });

  revalidatePath("/admin/interiors");
  return { success: true };
}
