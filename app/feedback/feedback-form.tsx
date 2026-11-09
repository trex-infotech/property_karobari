"use client";

import { useActionState, useRef, useState } from "react";
import { submitFeedback } from "@/app/actions/feedback";
import {
  FEEDBACK_CATEGORIES,
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_MB,
} from "@/app/lib/feedback-constants";

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-base text-zinc-900 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 md:text-sm";

const labelClass = "mb-1 block text-sm font-medium text-zinc-700";

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-8 w-8 ${filled ? "text-amber-400" : "text-zinc-300"}`}
      aria-hidden="true"
    >
      <path d="M11.48 3.5a.56.56 0 0 1 1.04 0l2.13 5.11a.56.56 0 0 0 .47.35l5.51.46c.5.04.7.67.32.99l-4.2 3.6a.56.56 0 0 0-.18.54l1.28 5.39a.56.56 0 0 1-.84.61l-4.72-2.88a.56.56 0 0 0-.59 0l-4.72 2.88a.56.56 0 0 1-.84-.61l1.28-5.39a.56.56 0 0 0-.18-.54l-4.2-3.6a.56.56 0 0 1 .32-.99l5.51-.46a.56.56 0 0 0 .47-.35l2.13-5.1Z" />
    </svg>
  );
}

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

export default function FeedbackForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [clientError, setClientError] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(
    async (
      _prev: { error?: string; success?: boolean } | undefined,
      formData: FormData,
    ) => {
      const result = await submitFeedback(_prev, formData);
      if (result?.success) {
        formRef.current?.reset();
        setRating(0);
        setHoverRating(0);
        setFiles([]);
        setClientError(null);
      }
      return result;
    },
    undefined,
  );

  function onFilesPicked(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    setClientError(null);
    if (picked.length > MAX_ATTACHMENTS) {
      event.target.value = "";
      setFiles([]);
      setClientError(`You can attach up to ${MAX_ATTACHMENTS} images.`);
      return;
    }
    if (picked.some((f) => !f.type.startsWith("image/"))) {
      event.target.value = "";
      setFiles([]);
      setClientError("Attachments must be image files.");
      return;
    }
    if (picked.some((f) => f.size > MAX_ATTACHMENT_MB * 1024 * 1024)) {
      event.target.value = "";
      setFiles([]);
      setClientError(
        `Each attachment must be ${MAX_ATTACHMENT_MB}MB or smaller.`,
      );
      return;
    }
    setFiles(picked);
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mt-6 space-y-5 text-left"
      onSubmit={(e) => {
        if (rating === 0) {
          e.preventDefault();
          setClientError("Please select a rating between 1 and 5 stars.");
        } else {
          setClientError(null);
        }
      }}
    >
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
        <div className="sm:col-span-2">
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
            Feedback Category <span className="text-red-500">*</span>
          </label>
          <select name="category" required className={inputClass} defaultValue="">
            <option value="" disabled>
              Select a category
            </option>
            {FEEDBACK_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            name="subject"
            required
            placeholder="Brief summary of your feedback"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>
          Rate Your Experience <span className="text-red-500">*</span>
        </label>
        <input type="hidden" name="rating" value={rating} />
        <div
          className="flex items-center gap-1"
          onMouseLeave={() => setHoverRating(0)}
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              className="rounded-md p-0.5 transition-transform hover:scale-110"
              aria-label={`Rate ${value} out of 5`}
              aria-pressed={rating === value}
            >
              <StarIcon filled={value <= (hoverRating || rating)} />
            </button>
          ))}
          <span className="ml-2 text-sm font-medium text-zinc-600">
            {RATING_LABELS[hoverRating || rating] || "Tap a star"}
          </span>
        </div>
      </div>

      <div>
        <label className={labelClass}>
          Detailed Feedback <span className="text-red-500">*</span>
        </label>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="Tell us what worked well or what we can improve..."
          className={`${inputClass} resize-y`}
        />
      </div>

      <div>
        <label className={labelClass}>Attach Screenshots (optional)</label>
        <input
          ref={fileRef}
          type="file"
          name="attachments"
          accept="image/*"
          multiple
          onChange={onFilesPicked}
          className="w-full rounded-lg border border-dashed border-zinc-300 px-3 py-2.5 text-sm text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Up to {MAX_ATTACHMENTS} images, {MAX_ATTACHMENT_MB}MB each.
        </p>
        {files.length > 0 && (
          <ul className="mt-2 space-y-1">
            {files.map((file) => (
              <li
                key={`${file.name}-${file.size}`}
                className="flex items-center gap-2 text-xs text-zinc-600"
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-600" />
                {file.name}
                <span className="text-zinc-400">
                  ({(file.size / 1024 / 1024).toFixed(1)}MB)
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {(clientError || state?.error) && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {clientError ?? state?.error}
        </p>
      )}
      {state?.success && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Thank you! Your feedback has been submitted successfully. We read
          every message and use it to improve Property Karobari.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit Feedback"}
      </button>
    </form>
  );
}
