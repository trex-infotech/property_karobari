import type { Metadata } from "next";
import PageBanner from "@/app/components/page-banner";
import ContactForm from "./contact-form";

export const metadata: Metadata = {
  title: "Contact Us | Property Karobari",
  description:
    "Get in touch with Property Karobari for help buying, renting or listing properties.",
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

const contactInfo = [
  {
    label: "Office Address",
    value: "Mumbai, Maharashtra, India",
    icon: (
      <>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
  },
  {
    label: "Phone",
    value: "+91 98765 43210",
    href: "tel:+919876543210",
    icon: (
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    ),
  },
  {
    label: "Email",
    value: "propertykarobari@gmail.com",
    href: "mailto:propertykarobari@gmail.com",
    icon: (
      <>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </>
    ),
  },
  {
    label: "Working Hours",
    value: "Mon – Sat, 10:00 AM – 7:00 PM",
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </>
    ),
  },
];

export default function ContactPage() {
  return (
    <section className="min-h-screen bg-linear-to-br from-white via-blue-50/30 to-blue-100/20 pb-16">
      <PageBanner
        title="Contact Us"
        subtitle="Have a question about a property or want to list with us? Send us a message and we'll get back to you."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <div className="container mx-auto grid gap-8 px-6 pt-10 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <h2 className="text-xl font-semibold text-zinc-900">
            Contact Information
          </h2>
          <p className="text-sm text-zinc-600">
            Reach out through any of these channels, or fill the form and our
            team will respond shortly.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {contactInfo.map((info) => (
              <div
                key={info.label}
                className="flex items-start gap-4 rounded-2xl border border-blue-100/50 bg-white p-5 shadow-sm"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Icon path={info.icon} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {info.label}
                  </p>
                  {info.href ? (
                    <a
                      href={info.href}
                      className="mt-1 block text-sm font-medium text-zinc-900 transition-colors hover:text-blue-600"
                    >
                      {info.value}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm font-medium text-zinc-900">
                      {info.value}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-blue-100/50 bg-white p-6 shadow-lg sm:p-8">
            <h2 className="text-xl font-semibold text-zinc-900">
              Send us a Message
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              Fill in your details and we&apos;ll get back to you as soon as
              possible.
            </p>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
