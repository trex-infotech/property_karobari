"use client";

import { useActionState, useRef, useState } from "react";
import { submitCareerApplication } from "@/app/actions/careers";
import {
  CAREER_POSITIONS,
  EXPERIENCE_OPTIONS,
  MAX_RESUME_MB,
} from "@/app/lib/career-constants";

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20";

const labelClass = "mb-1 block text-sm font-medium text-zinc-700";

export default function CareerForm({ cities }: { cities: string[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(
    async (
      _prev: { error?: string; success?: boolean } | undefined,
      formData: FormData,
    ) => {
      const result = await submitCareerApplication(_prev, formData);
      if (result?.success) {
        formRef.current?.reset();
        setResumeName(null);
        setClientError(null);
      }
      return result;
    },
    undefined,
  );

  function onResumePicked(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setClientError(null);
    if (!file) {
      setResumeName(null);
      return;
    }
    if (file.type !== "application/pdf") {
      event.target.value = "";
      setResumeName(null);
      setClientError("Resume must be a PDF file.");
      return;
    }
    if (file.size > MAX_RESUME_MB * 1024 * 1024) {
      event.target.value = "";
      setResumeName(null);
      setClientError(`Resume must be ${MAX_RESUME_MB}MB or smaller.`);
      return;
    }
    setResumeName(file.name);
  }

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
            list="career-cities"
            placeholder="City you live in"
            className={inputClass}
          />
          <datalist id="career-cities">
            {cities.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
        </div>
        <div>
          <label className={labelClass}>
            Position Applied For <span className="text-red-500">*</span>
          </label>
          <select name="position" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Select a position
            </option>
            {CAREER_POSITIONS.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Experience</label>
          <select name="experience" defaultValue="" className={inputClass}>
            <option value="">Select experience</option>
            {EXPERIENCE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Tell Us About Yourself</label>
        <textarea
          name="message"
          rows={4}
          placeholder="Briefly share your background, strengths or why you want to join us..."
          className={`${inputClass} resize-y`}
        />
      </div>

      <div>
        <label className={labelClass}>Resume (PDF, optional)</label>
        <input
          type="file"
          name="resume"
          accept="application/pdf"
          onChange={onResumePicked}
          className="w-full rounded-lg border border-dashed border-zinc-300 px-3 py-2.5 text-sm text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
        />
        {resumeName && (
          <p className="mt-1 text-xs text-zinc-600">Selected: {resumeName}</p>
        )}
      </div>

      {(clientError || state?.error) && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {clientError ?? state?.error}
        </p>
      )}
      {state?.success && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Application submitted! Our team will review your profile and reach
          out if there&apos;s a fit.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit Application"}
      </button>
    </form>
  );
}
