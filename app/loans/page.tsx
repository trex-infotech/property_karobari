import type { Metadata } from "next";
import PageBanner from "@/app/components/page-banner";
import { getCities } from "@/app/lib/cities";
import TalkToUs from "./loan-enquiry-modal";

export const metadata: Metadata = {
  title: "Property Loans | Property Karobari",
  description:
    "Loan assistance for home, commercial, construction, renovation and plot purchase loans — compare offers from leading banks with Property Karobari.",
};

function Icon({ path }: { path: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}

const loanTypes = [
  {
    title: "Home Loan",
    description:
      "Finance your dream home with competitive rates and flexible tenures from leading banks and housing finance companies.",
    icon: (
      <>
        <path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
        <path d="M9 22V12h6v10" />
      </>
    ),
  },
  {
    title: "Commercial Loan",
    description:
      "Funding for offices, shops and commercial spaces — structured to match your business cash flows.",
    icon: (
      <>
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M9 22v-4h6v4" />
        <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
      </>
    ),
  },
  {
    title: "Loan Against Property",
    description:
      "Unlock the value of your existing property to fund business expansion, education or other major expenses.",
    icon: (
      <>
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="2" />
        <path d="M6 12h.01M18 12h.01" />
      </>
    ),
  },
  {
    title: "Plot Purchase Loan",
    description:
      "Buy residential or investment plots with loans tailored for land purchase and quick approvals.",
    icon: (
      <>
        <path d="M9 20 3 17V4l6 3m0 13 6-3m-6 3V7m6 10 6 3V7l-6-3m0 13V4M9 7 15 4" />
      </>
    ),
  },
  {
    title: "Home Construction Loan",
    description:
      "Stage-wise disbursal for building your home on a plot you own, with interest charged only on drawn amounts.",
    icon: (
      <>
        <path d="M2 20h20" />
        <path d="M4 20V8l8-5 8 5v12" />
        <path d="M9 20v-6h6v6" />
        <path d="M9 10h.01M15 10h.01" />
      </>
    ),
  },
  {
    title: "Home Renovation Loan",
    description:
      "Upgrade, repair or extend your home with top-up style loans that keep your finances on track.",
    icon: (
      <>
        <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.1-2.1 2.7-2.5Z" />
      </>
    ),
  },
];

const benefits = [
  {
    title: "Compare Multiple Banks",
    description:
      "We present offers from leading banks and NBFCs side by side so you pick the best rate and terms.",
  },
  {
    title: "End-to-End Assistance",
    description:
      "From eligibility checks to documentation and disbursal, our team stays with you at every step.",
  },
  {
    title: "Faster Approvals",
    description:
      "Pre-verified paperwork and direct bank coordination mean your file moves without delays.",
  },
  {
    title: "No Hidden Charges",
    description:
      "Transparent guidance on processing fees, rates and terms — you always know what you sign.",
  },
];

const steps = [
  {
    title: "Share your requirement",
    description:
      "Tell us the loan type, amount and city through the enquiry form — takes two minutes.",
  },
  {
    title: "Eligibility & options",
    description:
      "Our team checks your eligibility and shortlists the best-suited banks and offers.",
  },
  {
    title: "Documentation",
    description:
      "We help you compile KYC, income and property documents the right way, the first time.",
  },
  {
    title: "Submit to bank",
    description:
      "Your application goes to the chosen bank with our follow-up for quick processing.",
  },
  {
    title: "Approval & disbursal",
    description:
      "Track sanction, complete formalities and get the loan disbursed to your account or builder.",
  },
];

const faqs = [
  {
    q: "What is the maximum loan amount I can get?",
    a: "It depends on your income, existing obligations, credit score and the property value. Most lenders finance 75–90% of the property cost. Share your details and we'll estimate your eligibility.",
  },
  {
    q: "What documents do I need for a home loan?",
    a: "Typically KYC documents (Aadhaar, PAN), income proof (salary slips, ITRs or bank statements), and property documents (agreement, title deeds, approvals). We share a tailored checklist once we know your profile.",
  },
  {
    q: "How long does loan approval take?",
    a: "With complete documentation, sanction usually takes 3–7 working days, and disbursal a few days after that. Our coordination with banks helps avoid back-and-forth delays.",
  },
  {
    q: "Does Property Karobari charge for loan assistance?",
    a: "Guidance and comparison support is free for our customers. Any bank processing fees or statutory charges are disclosed upfront — no hidden costs.",
  },
  {
    q: "Can I get a loan for a resale or auction property?",
    a: "Yes. Loans are available for resale flats, auction properties and preleased assets too, subject to title verification and lender norms. We help with the extra scrutiny these files need.",
  },
];

export default async function LoansPage() {
  const cities = (await getCities()).map((c) => c.city);

  return (
    <section className="min-h-screen bg-linear-to-br from-white via-blue-50/30 to-blue-100/20 pb-16">
      <PageBanner
        title="Property Loans"
        subtitle="Compare offers from leading banks and finance your property with confidence."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Loans" },
        ]}
      />

      <div className="container mx-auto px-6 pt-10">
        {/* Introduction */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            Loan Assistance, Simplified
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-600 sm:text-base">
            Finding the right property is only half the journey — financing it
            matters just as much. Property Karobari&apos;s loan assistance team
            connects you with leading banks and housing finance companies,
            helps you compare rates and terms, and handles the paperwork so
            your approval moves quickly and smoothly.
          </p>
        </div>

        {/* Loan types */}
        <div className="mt-14">
          <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            Loans We Assist With
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loanTypes.map((loan) => (
              <div
                key={loan.title}
                className="rounded-2xl border border-blue-100/50 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Icon path={loan.icon} />
                </span>
                <h3 className="mt-4 text-base font-semibold text-zinc-900">
                  {loan.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  {loan.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-14 rounded-2xl border border-blue-100/50 bg-white p-8 shadow-sm sm:p-10">
          <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            Why Use Our Loan Assistance
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">
                    {benefit.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Process */}
        <div className="mt-14">
          <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            How It Works
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border border-blue-100/50 bg-white p-5 shadow-sm"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
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
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-14 max-w-3xl">
          <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <div className="mt-8 space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-xl border border-blue-100/50 bg-white px-5 py-4 shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-zinc-900 [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <span className="shrink-0 text-zinc-400 transition-transform group-open:rotate-180">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>

        {/* Talk to Us CTA */}
        <div className="mt-14 rounded-2xl bg-linear-to-r from-blue-600 to-blue-800 px-8 py-10 text-center shadow-lg sm:px-10">
          <h2 className="text-2xl font-bold tracking-wide text-white sm:text-3xl">
            Talk to Us
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-blue-100 sm:text-base">
            Have a loan requirement or just want to check your eligibility?
            Tell us what you need — our loan experts will call you back with
            the best options.
          </p>
          <div className="mt-6">
            <TalkToUs cities={cities} />
          </div>
        </div>
      </div>
    </section>
  );
}
