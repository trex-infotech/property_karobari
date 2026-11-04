import type { Metadata } from "next";
import Link from "next/link";
import PageBanner from "@/app/components/page-banner";

export const metadata: Metadata = {
  title: "Preleased | Property Karobari",
};

export default function PreleasedPage() {
  return (
    <section className="min-h-screen bg-linear-to-br from-white via-blue-50/30 to-blue-100/20 pb-16">
      <PageBanner
        title="Preleased Properties"
        subtitle="Pre-leased commercial properties offering steady rental income."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Preleased" },
        ]}
      />
      <div className="container mx-auto px-6 pt-10">
        <div className="mx-auto max-w-2xl rounded-2xl border border-blue-100/50 bg-white p-8 text-center shadow-lg">
          <p className="text-sm leading-relaxed text-zinc-600">
            Pre-leased properties come with tenants already in place, so you
            start earning rental income from day one. Browse options or talk to
            our team for curated investment opportunities.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Enquire now
          </Link>
        </div>
      </div>
    </section>
  );
}
