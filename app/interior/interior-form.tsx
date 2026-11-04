"use client";

import { useActionState, useRef } from "react";
import { submitInteriorEnquiry } from "@/app/actions/interiors";
import {
  INTERIOR_BUDGETS,
  INTERIOR_PROPERTY_TYPES,
  INTERIOR_SCOPES,
} from "@/app/lib/interior-constants";

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20";

const labelClass = "mb-1 block text-sm font-medium text-zinc-700";

export default function InteriorForm({ cities }: { cities: string[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    async (
      _prev: { error?: string; success?: boolean } | undefined,
      formData: FormData,
    ) => {
      const result = await submitInteriorEnquiry(_prev, formData);
      if (result?.success) formRef.current?.reset();
      return result;
    },
    undefined,
  );

  return (
    <form ref={formRef} action={formAction} className="mt-6 space-y-4 text-left">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>
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
          <label className={labelClass}>
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
        <div>
          <label className={labelClass}>Email</label>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            City <span className="text-red-500">*</span>
          </label>
          <input
            name="city"
            required
            list="interior-cities"
            placeholder="City where the property is"
            className={inputClass}
          />
          <datalist id="interior-cities">
            {cities.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
        </div>
        <div>
          <label className={labelClass}>
            Property Type <span className="text-red-500">*</span>
          </label>
          <select
            name="propertyType"
            required
            defaultValue=""
            className={inputClass}
          >
            <option value="" disabled>
              Select property type
            </option>
            {INTERIOR_PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>
            Project Scope <span className="text-red-500">*</span>
          </label>
          <select name="scope" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              What do you need?
            </option>
            {INTERIOR_SCOPES.map((scope) => (
              <option key={scope} value={scope}>
                {scope}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Budget Range</label>
          <select name="budget" defaultValue="" className={inputClass}>
            <option value="">Select a budget range</option>
            {INTERIOR_BUDGETS.map((budget) => (
              <option key={budget} value={budget}>
                {budget}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Message</label>
        <textarea
          name="message"
          rows={3}
          placeholder="Tell us about your space — rooms, style preferences, timeline..."
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
          Enquiry submitted! Our interior team will contact you shortly to
          discuss your project.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Get a Free Consultation"}
      </button>
    </form>
  );
}
