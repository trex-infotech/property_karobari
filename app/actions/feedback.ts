"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_STATUSES,
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_MB,
  type FeedbackStatus,
} from "@/app/lib/feedback-constants";
import { hasRecentSubmission } from "@/app/lib/dedupe";
import { getDb } from "@/app/lib/mongodb";
import { deleteFromS3, uploadFilesToS3 } from "@/app/lib/s3";
import { getSession } from "@/app/lib/session";

export type FeedbackFormState =
  | { error?: string; success?: boolean }
  | undefined;

const S3_PREFIX = "feedback";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function attachmentFiles(formData: FormData): File[] {
  return formData
    .getAll("attachments")
    .filter((f): f is File => f instanceof File && f.size > 0);
}

function validateAttachments(files: File[]): string | null {
  if (files.length > MAX_ATTACHMENTS) {
    return `You can attach up to ${MAX_ATTACHMENTS} images.`;
  }
  if (files.some((f) => !f.type.startsWith("image/"))) {
    return "Attachments must be image files (JPG, PNG, WebP, etc.).";
  }
  if (files.some((f) => f.size > MAX_ATTACHMENT_MB * 1024 * 1024)) {
    return `Each attachment must be ${MAX_ATTACHMENT_MB}MB or smaller.`;
  }
  return null;
}

async function sendFeedbackNotification(feedback: {
  name: string;
  email: string | null;
  phone: string;
  category: string;
  rating: number;
  subject: string;
  message: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ENQUIRY_EMAIL;
  if (!apiKey || !to) return;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from:
      process.env.RESEND_FROM || "Property Karobari <onboarding@resend.dev>",
    to,
    replyTo: feedback.email ?? undefined,
    subject: `New feedback: ${feedback.subject}`,
    html: `
      <h2 style="margin:0 0 12px">New website feedback</h2>
      <table style="border-collapse:collapse">
        <tr><td style="padding:4px 12px 4px 0;color:#666">Name</td><td>${escapeHtml(feedback.name)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Email</td><td>${escapeHtml(feedback.email ?? "-")}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Phone</td><td>${escapeHtml(feedback.phone)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Category</td><td>${escapeHtml(feedback.category)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Rating</td><td>${feedback.rating}/5</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Subject</td><td>${escapeHtml(feedback.subject)}</td></tr>
      </table>
      <p style="margin:16px 0 4px;color:#666">Feedback</p>
      <p style="margin:0;white-space:pre-line">${escapeHtml(feedback.message)}</p>
    `,
  });

  if (error) throw new Error(error.message);
}

async function sendFeedbackResponseEmail(feedback: {
  name: string;
  email: string;
  subject: string;
  response: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from:
      process.env.RESEND_FROM || "Property Karobari <onboarding@resend.dev>",
    to: feedback.email,
    subject: `Re: Your feedback — ${feedback.subject}`,
    html: `
      <p style="margin:0 0 12px">Hi ${escapeHtml(feedback.name)},</p>
      <p style="margin:0 0 12px">Thanks for sharing your feedback with Property Karobari. Here is our response:</p>
      <p style="margin:0 0 12px;white-space:pre-line;border-left:3px solid #2563eb;padding-left:12px">${escapeHtml(feedback.response)}</p>
      <p style="margin:0;color:#666">— The Property Karobari team</p>
    `,
  });

  if (error) throw new Error(error.message);
}

export async function submitFeedback(
  _prevState: FeedbackFormState,
  formData: FormData,
): Promise<FeedbackFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase() || null;
  const phone = String(formData.get("phone") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const rating = Number(formData.get("rating") ?? 0);
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !phone || !subject || !message) {
    return { error: "Name, mobile number, subject and feedback are required." };
  }
  if (email && !EMAIL_RE.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  const phoneDigits = phone.replace(/\D/g, "");
  if (phoneDigits.length < 7 || phoneDigits.length > 15) {
    return { error: "Please enter a valid mobile number." };
  }
  if (
    !FEEDBACK_CATEGORIES.includes(
      category as (typeof FEEDBACK_CATEGORIES)[number],
    )
  ) {
    return { error: "Please choose a feedback category." };
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Please select a rating between 1 and 5 stars." };
  }

  const files = attachmentFiles(formData);
  const attachmentError = validateAttachments(files);
  if (attachmentError) return { error: attachmentError };

  let attachments: string[] = [];
  if (files.length > 0) {
    try {
      attachments = await uploadFilesToS3(files, S3_PREFIX);
    } catch (error) {
      console.error("Failed to upload feedback attachments:", error);
      return {
        error:
          "Your attachments could not be uploaded. Please remove them or try again.",
      };
    }
  }

  const feedback = { name, email, phone, category, rating, subject, message };

  try {
    const db = await getDb();
    if (await hasRecentSubmission("feedback", { phone, subject })) {
      return {
        error:
          "You have already submitted this feedback recently. Thank you — we read every message.",
      };
    }
    await db.collection("feedback").insertOne({
      ...feedback,
      attachments,
      status: "new" satisfies FeedbackStatus,
      response: null,
      respondedAt: null,
      respondedBy: null,
      createdAt: new Date(),
    });
  } catch {
    return { error: "Failed to submit your feedback. Please try again." };
  }

  try {
    await sendFeedbackNotification(feedback);
  } catch (error) {
    // Feedback is safely stored — don't lose it over an email failure.
    console.error("Failed to send feedback notification email:", error);
  }

  revalidatePath("/admin/feedback");
  return { success: true };
}

export async function setFeedbackStatus(
  _prevState: FeedbackFormState,
  formData: FormData,
): Promise<FeedbackFormState> {
  if (!(await getSession())) return { error: "Not authorized." };

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!ObjectId.isValid(id)) return { error: "Invalid feedback." };
  if (!FEEDBACK_STATUSES.includes(status as FeedbackStatus)) {
    return { error: "Invalid status." };
  }

  const db = await getDb();
  await db
    .collection("feedback")
    .updateOne({ _id: new ObjectId(id) }, { $set: { status } });

  revalidatePath("/admin/feedback");
  return { success: true };
}

export async function respondToFeedback(
  _prevState: FeedbackFormState,
  formData: FormData,
): Promise<FeedbackFormState> {
  const session = await getSession();
  if (!session) return { error: "Not authorized." };

  const id = String(formData.get("id") ?? "");
  const response = String(formData.get("response") ?? "").trim();
  if (!ObjectId.isValid(id)) return { error: "Invalid feedback." };
  if (!response) return { error: "Response cannot be empty." };

  const db = await getDb();
  const doc = await db
    .collection("feedback")
    .findOne({ _id: new ObjectId(id) });
  if (!doc) return { error: "Feedback not found." };

  await db.collection("feedback").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        response,
        respondedAt: new Date(),
        respondedBy: typeof session.email === "string" ? session.email : null,
      },
    },
  );

  if (typeof doc.email === "string" && doc.email) {
    try {
      await sendFeedbackResponseEmail({
        name: String(doc.name ?? "there"),
        email: doc.email,
        subject: String(doc.subject ?? "your feedback"),
        response,
      });
    } catch (error) {
      // The response is stored — an email failure shouldn't undo it.
      console.error("Failed to send feedback response email:", error);
    }
  }

  revalidatePath("/admin/feedback");
  return { success: true };
}

export async function deleteFeedback(
  _prevState: FeedbackFormState,
  formData: FormData,
): Promise<FeedbackFormState> {
  if (!(await getSession())) return { error: "Not authorized." };

  const id = String(formData.get("id") ?? "");
  if (!ObjectId.isValid(id)) return { error: "Invalid feedback." };

  const db = await getDb();
  const doc = await db
    .collection("feedback")
    .findOne({ _id: new ObjectId(id) });

  await db.collection("feedback").deleteOne({ _id: new ObjectId(id) });

  const urls = Array.isArray(doc?.attachments)
    ? doc.attachments.filter((u): u is string => typeof u === "string")
    : [];
  await Promise.allSettled(urls.map((url) => deleteFromS3(url, S3_PREFIX)));

  revalidatePath("/admin/feedback");
  return { success: true };
}
