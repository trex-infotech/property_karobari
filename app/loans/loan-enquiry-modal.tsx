"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitLoanEnquiry } from "@/app/actions/loan-enquiries";
import { LOAN_TYPES } from "@/app/lib/loan-enquiry-constants";

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-base text-zinc-900 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 md:text-sm";

const labelClass = "mb-1 block text-sm font-medium text-zinc-700";

function LoanEnquiryModal({
  cities,
  onClose,
}: {
  cities: string[];
  onClose: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [state, formAction, pending] = useActionState(
    submitLoanEnquiry,
    undefined,
  );

  useEffect(() => {
    dialogRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex overflow-y-auto p-4">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="loan-enquiry-title"
        tabIndex={-1}
        className="relative m-auto max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl outline-none sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-700"
          aria-label="Close"
        >
          ✕
        </button>

        {state?.success ? (
          <div className="py-6 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-7 w-7"
                aria-hidden="true"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <h3
              id="loan-enquiry-title"
              className="mt-4 text-xl font-semibold text-zinc-900"
            >
              Enquiry submitted!
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              Thank you for reaching out. Our loan assistance team will contact
              you shortly to discuss your requirements.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h3
              id="loan-enquiry-title"
              className="text-xl font-semibold text-zinc-900"
            >
              Talk to Us
            </h3>
            <p className="mt-1 text-sm text-zinc-600">
              Tell us about your loan requirement and we&apos;ll get back to
              you.
            </p>

            <form ref={formRef} action={formAction} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="loan-name">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="loan-name"
                    name="name"
                    required
                    placeholder="Your name"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="loan-phone">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="loan-phone"
                    name="phone"
                    type="tel"
                    required
                    placeholder="+91 ..."
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="loan-email">
                    Email{" "}
                    <span className="text-xs font-normal text-zinc-400">
                      (optional)
                    </span>
                  </label>
                  <input
                    id="loan-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="loan-type">
                    Loan Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="loan-type"
                    name="loanType"
                    required
                    defaultValue=""
                    className={inputClass}
                  >
                    <option value="" disabled>
                      Select loan type
                    </option>
                    {LOAN_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass} htmlFor="loan-amount">
                    Required Loan Amount{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="loan-amount"
                    name="amount"
                    required
                    placeholder="e.g. ₹50,00,000"
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="loan-city">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="loan-city"
                    name="city"
                    required
                    list="loan-enquiry-cities"
                    placeholder="City where the property is located"
                    className={inputClass}
                  />
                  <datalist id="loan-enquiry-cities">
                    {cities.map((city) => (
                      <option key={city} value={city} />
                    ))}
                  </datalist>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="loan-message">
                    Message
                  </label>
                  <textarea
                    id="loan-message"
                    name="message"
                    rows={3}
                    placeholder="Anything else we should know — timeline, property details, preferred bank..."
                    className={`${inputClass} resize-y`}
                  />
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

export default function TalkToUs({ cities }: { cities: string[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-block rounded-lg bg-white px-8 py-3 text-sm font-semibold text-blue-700 shadow-lg transition-transform hover:scale-105"
      >
        Talk to Us
      </button>
      {open && (
        <LoanEnquiryModal cities={cities} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
