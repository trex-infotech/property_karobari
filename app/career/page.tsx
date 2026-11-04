import type { Metadata } from "next";
import PageBanner from "@/app/components/page-banner";
import { getCities } from "@/app/lib/cities";
import CareerForm from "./career-form";

export const metadata: Metadata = {
  title: "Careers | Property Karobari",
  description:
    "Join the Property Karobari team — apply for sales, marketing and operations roles in real estate.",
};

const perks = [
  {
    title: "Grow with us",
    description:
      "Work directly with founders and learn the real estate business end to end.",
  },
  {
    title: "Performance rewards",
    description:
      "Transparent incentives on every successful deal you help close.",
  },
  {
    title: "On-ground experience",
    description:
      "Real site visits, real clients — build expertise that matters.",
  },
];

export default async function CareersPage() {
  const cities = (await getCities()).map((c) => c.city);

  return (
    <section className="min-h-screen bg-linear-to-br from-white via-blue-50/30 to-blue-100/20 pb-16">
      <PageBanner
        title="Careers"
        subtitle="Join our team and help people find their perfect property."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Careers" },
        ]}
      />
      <div className="container mx-auto px-6 pt-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm leading-relaxed text-zinc-600 sm:text-base">
            We are growing! If you are passionate about real estate and want to
            work with a fast-moving team, we would love to hear from you. Apply
            below and our team will review your application.
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-3">
          {perks.map((perk) => (
            <div
              key={perk.title}
              className="rounded-2xl border border-blue-100/50 bg-white p-5 text-center shadow-sm"
            >
              <h3 className="text-sm font-semibold text-zinc-900">
                {perk.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-600">
                {perk.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-blue-100/50 bg-white p-6 shadow-lg sm:p-8">
          <h2 className="text-center text-xl font-semibold text-zinc-900">
            Apply Now
          </h2>
          <p className="mt-1 text-center text-sm text-zinc-600">
            Fill in your details — it takes two minutes.
          </p>
          <CareerForm cities={cities} />
        </div>
      </div>
    </section>
  );
}
