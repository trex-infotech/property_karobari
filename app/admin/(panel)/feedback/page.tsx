import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isSuperAdmin } from "@/app/lib/admin-access";
import { getAllFeedback } from "@/app/lib/feedback";
import FeedbackManager from "./feedback-manager";

export const metadata: Metadata = {
  title: "Feedback | Admin",
};

// Reads MongoDB at request time.
export const instant = false;

export default async function AdminFeedbackPage() {
  if (!(await isSuperAdmin())) redirect("/admin/dashboard");
  const feedback = await getAllFeedback();
  return <FeedbackManager feedback={feedback} />;
}
