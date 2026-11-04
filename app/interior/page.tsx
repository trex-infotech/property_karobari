import type { Metadata } from "next";
import PageBanner from "@/app/components/page-banner";
import { getCities } from "@/app/lib/cities";
import InteriorForm from "./interior-form";

export const metadata: Metadata = {
  title: "Interior Services | Property Karobari",
  description:
    "Design and furnish your space with trusted interior professionals — full home interiors, modular kitchens and office fit-outs.",
};

const services = [
  {
    title: "Full Home Interiors",
    description:
      "End-to-end design and execution — layouts, furniture, lighting and finishes for your entire home.",
  },
  {
    title: "Modular Kitchens",
    description:
      "Smart, durable kitchen designs with quality hardware and finishes that fit your cooking style.",
  },
  {
    title: "Office & Commercial",
    description:
      "Functional workspaces, retail fit-outs and commercial interiors delivered on schedule.",
  },
];

export default async function InteriorPage() {
  const cities = (await getCities()).map((c) => c.city);

  return (
    <section className="min-h-screen bg-linear-to-br from-white via-blue-50/30 to-blue-100/20 pb-16">
      <PageBanner
        title="Interior Services"
        subtitle="Design and furnish your new space with our interior partners."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Interior" },
        ]}
      />
      <div className="container mx-auto px-6 pt-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm leading-relaxed text-zinc-600 sm:text-base">
            From modular kitchens to full home makeovers, we connect you with
            trusted interior professionals to turn your property into a home.
            Tell us what you need and get a free consultation.
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className="rounded-2xl border border-blue-100/50 bg-white p-5 text-center shadow-sm"
            >
              <h3 className="text-sm font-semibold text-zinc-900">
                {service.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-600">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-blue-100/50 bg-white p-6 shadow-lg sm:p-8">
          <h2 className="text-center text-xl font-semibold text-zinc-900">
            Get a Free Consultation
          </h2>
          <p className="mt-1 text-center text-sm text-zinc-600">
            Share your requirements and our interior team will call you back.
          </p>
          <InteriorForm cities={cities} />
        </div>
      </div>
    </section>
  );
}
