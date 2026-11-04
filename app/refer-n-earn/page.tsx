import type { Metadata } from "next";
import PageBanner from "@/app/components/page-banner";
import { getCities } from "@/app/lib/cities";
import ReferralForm from "./referral-form";

export const metadata: Metadata = {
  title: "Refer N Earn | Property Karobari",
  description:
    "Refer friends and family to Property Karobari and earn rewards on every successful deal.",
};

const steps = [
  {
    title: "Share a referral",
    description:
      "Fill the form with your friend's details — name, number and what they're looking for.",
  },
  {
    title: "We take it from there",
    description:
      "Our team contacts them, understands their requirement and helps them find the right property.",
  },
  {
    title: "Earn your reward",
    description:
      "When their deal closes successfully, your referral reward is processed.",
  },
];

export default async function ReferNEarnPage() {
  const cities = (await getCities()).map((c) => c.city);

  return (
    <section className="min-h-screen bg-linear-to-br from-white via-blue-50/30 to-blue-100/20 pb-16">
      <PageBanner
        title="Refer N Earn"
        subtitle="Refer friends and family — earn rewards on every successful deal."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Refer N Earn" },
        ]}
      />
      <div className="container mx-auto px-6 pt-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm leading-relaxed text-zinc-600 sm:text-base">
            Know someone looking to buy, rent, or invest in property? Refer
            them to Property Karobari and earn rewards when their deal closes.
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-2xl border border-blue-100/50 bg-white p-5 text-center shadow-sm"
            >
              <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {index + 1}
              </span>
              <h3 className="mt-3 text-sm font-semibold text-zinc-900">
                {step.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-blue-100/50 bg-white p-6 shadow-lg sm:p-8">
          <h2 className="text-center text-xl font-semibold text-zinc-900">
            Refer Someone Now
          </h2>
          <p className="mt-1 text-center text-sm text-zinc-600">
            We&apos;ll call them, understand their need and handle the rest.
          </p>
          <ReferralForm cities={cities} />
        </div>
      </div>
    </section>
  );
}
