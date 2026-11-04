"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { hasRecentSubmission } from "@/app/lib/dedupe";
import { getDb } from "@/app/lib/mongodb";
import { getSession } from "@/app/lib/session";

export type EnquiryFormState =
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

async function sendEnquiryEmail(enquiry: {
  name: string;
  email: string | null;
  phone: string;
  subject: string | null;
  message: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ENQUIRY_EMAIL;
  if (!apiKey || !to) return;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from:
      process.env.RESEND_FROM ||
      "Property Karobari <onboarding@resend.dev>",
    to,
    replyTo: enquiry.email ?? undefined,
    subject: `New enquiry from ${enquiry.name}`,
    html: `
      <h2 style="margin:0 0 12px">New website enquiry</h2>
      <table style="border-collapse:collapse">
        <tr><td style="padding:4px 12px 4px 0;color:#666">Name</td><td>${escapeHtml(enquiry.name)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Email</td><td>${escapeHtml(enquiry.email ?? "-")}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Phone</td><td>${escapeHtml(enquiry.phone)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Subject</td><td>${escapeHtml(enquiry.subject ?? "-")}</td></tr>
      </table>
      <p style="margin:16px 0 4px;color:#666">Message</p>
      <p style="margin:0;white-space:pre-line">${escapeHtml(enquiry.message)}</p>
    `,
  });

  if (error) throw new Error(error.message);
}

export async function submitEnquiry(
  _prevState: EnquiryFormState,
  formData: FormData,
): Promise<EnquiryFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase() || null;
  const phone = String(formData.get("phone") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim() || null;
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !phone || !message) {
    return { error: "Name, phone and message are required." };
  }
  if (email && !EMAIL_RE.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const enquiry = { name, email, phone, subject, message };

  try {
    const db = await getDb();
    if (await hasRecentSubmission("enquiries", { phone, message })) {
      return {
        error:
          "You have already submitted this enquiry recently. Our team will get back to you soon.",
      };
    }
    await db.collection("enquiries").insertOne({
      ...enquiry,
      active: true,
      createdAt: new Date(),
    });
  } catch {
    return { error: "Failed to submit your enquiry. Please try again." };
  }

  try {
    await sendEnquiryEmail(enquiry);
  } catch (error) {
    // The enquiry is safely stored — don't lose the lead over an email failure.
    console.error("Failed to send enquiry notification email:", error);
  }

  revalidatePath("/admin/enquiries");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function submitPropertyEnquiry(
  _prevState: EnquiryFormState,
  formData: FormData,
): Promise<EnquiryFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const contactMethod =
    String(formData.get("contactMethod") ?? "").trim() || "Call";
  const contactTime =
    String(formData.get("contactTime") ?? "").trim() || "Anytime";
  const propertyId = String(formData.get("propertyId") ?? "").trim() || null;
  const propertyTitle =
    String(formData.get("propertyTitle") ?? "").trim() || null;
  const propertyUrl =
    String(formData.get("propertyUrl") ?? "").trim() || null;

  if (!name || !phone) {
    return { error: "Name and mobile number are required." };
  }

  const subject = propertyTitle
    ? `Property enquiry: ${propertyTitle}`
    : "Property enquiry";
  const message = [
    propertyTitle ? `Property: ${propertyTitle}` : null,
    `Preferred contact method: ${contactMethod}`,
    `Preferred contact time: ${contactTime}`,
  ]
    .filter(Boolean)
    .join("\n");

  const enquiry = { name, email: null, phone, subject, message };

  try {
    const db = await getDb();
    await db.collection("leads").insertOne({
      name,
      phone,
      propertyId,
      propertyTitle,
      propertyUrl,
      preferredContactMethod: contactMethod,
      preferredContactTime: contactTime,
      active: true,
      createdAt: new Date(),
    });
  } catch {
    return { error: "Failed to submit your enquiry. Please try again." };
  }

  try {
    await sendEnquiryEmail(enquiry);
  } catch (error) {
    // The lead is safely stored — don't lose it over an email failure.
    console.error("Failed to send enquiry notification email:", error);
  }

  revalidatePath("/admin/leads");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function setEnquiryActive(
  _prevState: EnquiryFormState,
  formData: FormData,
): Promise<EnquiryFormState> {
  if (!(await getSession())) return { error: "Not authorized." };

  const id = String(formData.get("id") ?? "");
  const active = String(formData.get("active") ?? "") === "true";
  if (!ObjectId.isValid(id)) {
    return { error: "Invalid enquiry." };
  }

  const db = await getDb();
  await db
    .collection("enquiries")
    .updateOne({ _id: new ObjectId(id) }, { $set: { active } });

  revalidatePath("/admin/enquiries");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function deleteEnquiry(
  _prevState: EnquiryFormState,
  formData: FormData,
): Promise<EnquiryFormState> {
  if (!(await getSession())) return { error: "Not authorized." };

  const id = String(formData.get("id") ?? "");
  if (!ObjectId.isValid(id)) return { error: "Invalid enquiry." };

  const db = await getDb();
  await db.collection("enquiries").deleteOne({ _id: new ObjectId(id) });

  revalidatePath("/admin/enquiries");
  revalidatePath("/admin/dashboard");
  return { success: true };
}
