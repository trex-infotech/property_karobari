"use client";

import { useActionState, useRef } from "react";
import { submitReferral } from "@/app/actions/referrals";
import { REQUIREMENT_TYPES } from "@/app/lib/referral-constants";

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-base text-zinc-900 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 md:text-sm";

const labelClass = "mb-1 block text-sm font-medium text-zinc-700";

export default function ReferralForm({ cities }: { cities: string[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    async (
      _prev: { error?: string; success?: boolean } | undefined,
      formData: FormData,
    ) => {
      const result = await submitReferral(_prev, formData);
      if (result?.success) formRef.current?.reset();
      return result;
    },
    undefined,
  );

  return (
    <form ref={formRef} action={formAction} className="mt-6 space-y-4 text-left">
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-zinc-900">
          Your Details
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              name="referrerName"
              required
              placeholder="Your name"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Your Mobile <span className="text-red-500">*</span>
            </label>
            <input
              name="referrerPhone"
              type="tel"
              required
              placeholder="+91 ..."
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Your Email</label>
            <input
              name="referrerEmail"
              type="email"
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-zinc-900">
          Person You&apos;re Referring
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>
              Their Name <span className="text-red-500">*</span>
            </label>
            <input
              name="referredName"
              required
              placeholder="Friend / family member's name"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Their Mobile <span className="text-red-500">*</span>
            </label>
            <input
              name="referredPhone"
              type="tel"
              required
              placeholder="+91 ..."
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Requirement <span className="text-red-500">*</span>
            </label>
            <select
              name="requirement"
              required
              defaultValue=""
              className={inputClass}
            >
              <option value="" disabled>
                What are they looking for?
              </option>
              {REQUIREMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>
              City <span className="text-red-500">*</span>
            </label>
            <input
              name="city"
              required
              list="referral-cities"
              placeholder="City they're interested in"
              className={inputClass}
            />
            <datalist id="referral-cities">
              {cities.map((city) => (
                <option key={city} value={city} />
              ))}
            </datalist>
          </div>
        </div>
      </fieldset>

      <div>
        <label className={labelClass}>Message</label>
        <textarea
          name="message"
          rows={3}
          placeholder="Anything helpful — budget, preferred location, timeline..."
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
          Referral submitted! We&apos;ll reach out to them and keep you posted
          on your reward.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit Referral"}
      </button>
    </form>
  );
}
