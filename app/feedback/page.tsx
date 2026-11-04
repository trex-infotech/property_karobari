import type { Metadata } from "next";
import PageBanner from "@/app/components/page-banner";
import FeedbackForm from "./feedback-form";

export const metadata: Metadata = {
  title: "Feedback | Property Karobari",
  description:
    "Share your experience with Property Karobari — rate us and tell us what we can improve.",
};

export default function FeedbackPage() {
  return (
    <section className="min-h-screen bg-linear-to-br from-white via-blue-50/30 to-blue-100/20 pb-16">
      <PageBanner
        title="Share Feedback"
        subtitle="Your feedback helps us serve you better."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Feedback" },
        ]}
      />
      <div className="container mx-auto px-6 pt-10">
        <div className="mx-auto max-w-2xl rounded-2xl border border-blue-100/50 bg-white p-6 shadow-lg sm:p-8">
          <h2 className="text-center text-xl font-semibold text-zinc-900">
            Tell us about your experience
          </h2>
          <p className="mt-1 text-center text-sm text-zinc-600">
            What worked well, and what can we improve?
          </p>
          <FeedbackForm />
        </div>
      </div>
    </section>
  );
}
