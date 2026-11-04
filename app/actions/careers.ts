"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import {
  CAREER_POSITIONS,
  CAREER_STATUSES,
  EXPERIENCE_OPTIONS,
  MAX_RESUME_MB,
  type CareerStatus,
} from "@/app/lib/career-constants";
import { hasRecentSubmission } from "@/app/lib/dedupe";
import { getDb } from "@/app/lib/mongodb";
import { deleteFromS3, uploadFilesToS3 } from "@/app/lib/s3";
import { getSession } from "@/app/lib/session";

export type CareerFormState =
  | { error?: string; success?: boolean }
  | undefined;

const S3_PREFIX = "careers";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendCareerNotification(application: {
  name: string;
  email: string | null;
  phone: string;
  position: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ENQUIRY_EMAIL;
  if (!apiKey || !to) return;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from:
      process.env.RESEND_FROM || "Property Karobari <onboarding@resend.dev>",
    to,
    replyTo: application.email ?? undefined,
    subject: `New career application: ${application.position} — ${application.name}`,
    html: `
      <h2 style="margin:0 0 12px">New career application</h2>
      <table style="border-collapse:collapse">
        <tr><td style="padding:4px 12px 4px 0;color:#666">Name</td><td>${escapeHtml(application.name)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Email</td><td>${escapeHtml(application.email ?? "-")}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Phone</td><td>${escapeHtml(application.phone)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Position</td><td>${escapeHtml(application.position)}</td></tr>
      </table>
      <p style="margin:16px 0 0;color:#666">View the full application in the admin panel.</p>
    `,
  });

  if (error) throw new Error(error.message);
}

export async function submitCareerApplication(
  _prevState: CareerFormState,
  formData: FormData,
): Promise<CareerFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase() || null;
  const position = String(formData.get("position") ?? "").trim();
  const experience = String(formData.get("experience") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim() || null;

  if (!name || !phone || !position || !city) {
    return { error: "Name, mobile number, position and city are required." };
  }
  if (email && !EMAIL_RE.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  const phoneDigits = phone.replace(/\D/g, "");
  if (phoneDigits.length < 7 || phoneDigits.length > 15) {
    return { error: "Please enter a valid mobile number." };
  }
  if (!CAREER_POSITIONS.includes(position as (typeof CAREER_POSITIONS)[number])) {
    return { error: "Please choose a position." };
  }
  if (
    experience &&
    !EXPERIENCE_OPTIONS.includes(
      experience as (typeof EXPERIENCE_OPTIONS)[number],
    )
  ) {
    return { error: "Please choose a valid experience range." };
  }

  const resume = formData
    .getAll("resume")
    .find((f): f is File => f instanceof File && f.size > 0);
  if (resume) {
    if (resume.type !== "application/pdf") {
      return { error: "Resume must be a PDF file." };
    }
    if (resume.size > MAX_RESUME_MB * 1024 * 1024) {
      return { error: `Resume must be ${MAX_RESUME_MB}MB or smaller.` };
    }
  }

  try {
    const db = await getDb();
    if (
      await hasRecentSubmission("career_applications", { phone, position })
    ) {
      return {
        error:
          "You have already applied for this position recently. Our team will reach out if shortlisted.",
      };
    }

    let resumeUrl: string | null = null;
    if (resume) {
      try {
        [resumeUrl] = await uploadFilesToS3([resume], S3_PREFIX);
      } catch (error) {
        console.error("Failed to upload resume:", error);
        return {
          error: "Your resume could not be uploaded. Please try again.",
        };
      }
    }

    await db.collection("career_applications").insertOne({
      name,
      email,
      phone,
      position,
      experience,
      city,
      message,
      resumeUrl: resumeUrl ?? null,
      status: "new" satisfies CareerStatus,
      assignedTo: null,
      assignedToName: null,
      notes: [],
      createdAt: new Date(),
    });
  } catch {
    return { error: "Failed to submit your application. Please try again." };
  }

  try {
    await sendCareerNotification({ name, email, phone, position });
  } catch (error) {
    // Application is safely stored — don't lose it over an email failure.
    console.error("Failed to send career notification email:", error);
  }

  revalidatePath("/admin/careers");
  return { success: true };
}

export async function setCareerStatus(
  _prevState: CareerFormState,
  formData: FormData,
): Promise<CareerFormState> {
  if (!(await getSession())) return { error: "Not authorized." };

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!ObjectId.isValid(id)) return { error: "Invalid application." };
  if (!CAREER_STATUSES.includes(status as CareerStatus)) {
    return { error: "Invalid status." };
  }

  const db = await getDb();
  await db
    .collection("career_applications")
    .updateOne({ _id: new ObjectId(id) }, { $set: { status } });

  revalidatePath("/admin/careers");
  return { success: true };
}

export async function assignCareerApplication(
  _prevState: CareerFormState,
  formData: FormData,
): Promise<CareerFormState> {
  if (!(await getSession())) return { error: "Not authorized." };

  const id = String(formData.get("id") ?? "");
  const employeeId = String(formData.get("employeeId") ?? "");
  if (!ObjectId.isValid(id)) return { error: "Invalid application." };

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
    .collection("career_applications")
    .updateOne(
      { _id: new ObjectId(id) },
      { $set: { assignedTo, assignedToName } },
    );

  revalidatePath("/admin/careers");
  return { success: true };
}

export async function addCareerNote(
  _prevState: CareerFormState,
  formData: FormData,
): Promise<CareerFormState> {
  const session = await getSession();
  if (!session) return { error: "Not authorized." };

  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!ObjectId.isValid(id)) return { error: "Invalid application." };
  if (!note) return { error: "Note cannot be empty." };

  const db = await getDb();
  await db
    .collection<{ notes?: { text: string; by: string | null; at: Date }[] }>(
      "career_applications",
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

  revalidatePath("/admin/careers");
  return { success: true };
}

export async function deleteCareerApplication(
  _prevState: CareerFormState,
  formData: FormData,
): Promise<CareerFormState> {
  if (!(await getSession())) return { error: "Not authorized." };

  const id = String(formData.get("id") ?? "");
  if (!ObjectId.isValid(id)) return { error: "Invalid application." };

  const db = await getDb();
  const doc = await db
    .collection("career_applications")
    .findOne({ _id: new ObjectId(id) });

  await db
    .collection("career_applications")
    .deleteOne({ _id: new ObjectId(id) });

  try {
    await deleteFromS3(
      typeof doc?.resumeUrl === "string" ? doc.resumeUrl : null,
      S3_PREFIX,
    );
  } catch {
    // Orphaned object cleanup is best-effort.
  }

  revalidatePath("/admin/careers");
  return { success: true };
}
