"use client";

import { useActionState, useEffect, useState } from "react";
import { submitPropertyEnquiry } from "@/app/actions/enquiries";

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20";

const contactMethods = ["Call", "WhatsApp", "SMS"];
const contactTimes = [
  "Anytime",
  "Morning (9 AM - 12 PM)",
  "Afternoon (12 - 4 PM)",
  "Evening (4 - 7 PM)",
  "Night (7 - 9 PM)",
];

function EnquiryModal({
  propertyId,
  propertyTitle,
  propertyUrl,
  onClose,
}: {
  propertyId: string;
  propertyTitle: string;
  propertyUrl: string;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    submitPropertyEnquiry,
    undefined,
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-zinc-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Enquire now"
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {state?.success ? (
          <div className="text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-7 w-7 text-green-600"
                aria-hidden="true"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <h3 className="mt-4 text-xl font-bold text-blue-950">
              Enquiry received!
            </h3>
            <p className="mt-2 text-sm text-zinc-600">
              Our team will reach out to you soon{propertyTitle ? ` about "${propertyTitle}"` : ""}.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-lg bg-blue-600 px-8 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-blue-950">Enquire Now</h3>
                {propertyTitle && (
                  <p className="mt-1 text-sm text-zinc-500">
                    {propertyTitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
              >
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
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <form action={formAction} className="mt-6 space-y-4">
              <input type="hidden" name="propertyId" value={propertyId} />
              <input type="hidden" name="propertyTitle" value={propertyTitle} />
              <input type="hidden" name="propertyUrl" value={propertyUrl} />

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  required
                  placeholder="Your name"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="+91 ..."
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">
                    Preferred Contact Method
                  </label>
                  <select name="contactMethod" className={inputClass} defaultValue="Call">
                    {contactMethods.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">
                    Preferred Contact Time
                  </label>
                  <select name="contactTime" className={inputClass} defaultValue="Anytime">
                    {contactTimes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {state?.error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {state.error}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
              >
                {pending ? "Submitting…" : "Submit Enquiry"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export function EnquireTrigger({
  propertyId,
  propertyTitle,
  propertyUrl,
  className,
  children,
}: {
  propertyId: string;
  propertyTitle: string;
  propertyUrl: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          // Locked fields live inside links/cards — don't let the
          // click navigate or trigger the parent element.
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className={className}
      >
        {children}
      </button>
      {open && (
        <EnquiryModal
          propertyId={propertyId}
          propertyTitle={propertyTitle}
          propertyUrl={propertyUrl}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

export default function EnquireButton({
  propertyId,
  propertyTitle,
  propertyUrl,
}: {
  propertyId: string;
  propertyTitle: string;
  propertyUrl: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        Enquire Now
      </button>
      {open && (
        <EnquiryModal
          propertyId={propertyId}
          propertyTitle={propertyTitle}
          propertyUrl={propertyUrl}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
