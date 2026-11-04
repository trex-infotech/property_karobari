import type { Metadata } from "next";
import PageBanner from "@/app/components/page-banner";

export const metadata: Metadata = {
  title: "Privacy Policy | Property Karobari",
};

export default function PrivacyPolicyPage() {
  return (
    <section className="min-h-screen bg-linear-to-br from-white via-blue-50/30 to-blue-100/20 pb-16">
      <PageBanner
        title="Privacy Policy"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Privacy Policy" },
        ]}
      />
      <div className="container mx-auto px-6 pt-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-blue-100/50 bg-white p-8 shadow-lg">
          <div className="space-y-4 text-sm leading-relaxed text-zinc-600">
            <p>
              Property Karobari respects your privacy. We collect only the
              information needed to help you with your property search — such as
              your name, contact details, and property preferences — when you
              submit an enquiry or contact us.
            </p>
            <p>
              Your information is used to respond to enquiries, share relevant
              property options, and improve our services. We do not sell your
              personal data to third parties.
            </p>
            <p>
              For any questions about how your data is handled, reach out to us
              at propertykarobari@gmail.com.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
