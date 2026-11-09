"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitEnquiry } from "@/app/actions/enquiries";

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-base text-zinc-900 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 md:text-sm";

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(submitEnquiry, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state?.success]);

  return (
    <form ref={formRef} action={formAction} className="mt-6 space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Full Name <span className="text-red-500">*</span>
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
            Email
          </label>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            name="phone"
            type="tel"
            required
            placeholder="+91 ..."
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Subject
          </label>
          <input
            name="subject"
            placeholder="e.g. Buying a property"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="Tell us how we can help..."
          className={`${inputClass} resize-y`}
        />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Thank you! Your enquiry has been submitted. We&apos;ll get back to you
          soon.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
