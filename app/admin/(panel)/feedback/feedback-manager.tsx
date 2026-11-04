"use client";

import { formatDateTime as formatCreated } from "@/app/lib/format-date";
import { useActionState, useState } from "react";
import {
  deleteFeedback,
  respondToFeedback,
  setFeedbackStatus,
} from "@/app/actions/feedback";
import type { Feedback } from "@/app/lib/feedback";
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_STATUSES,
  FEEDBACK_STATUS_LABELS,
  type FeedbackStatus,
} from "@/app/lib/feedback-constants";
import ExportButton from "../export-button";

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20";


const STATUS_STYLES: Record<FeedbackStatus, string> = {
  new: "bg-blue-50 text-blue-700",
  in_progress: "bg-amber-50 text-amber-700",
  resolved: "bg-green-50 text-green-700",
  rejected: "bg-zinc-100 text-zinc-600",
};

function StatusBadge({ status }: { status: FeedbackStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {FEEDBACK_STATUS_LABELS[status]}
    </span>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="whitespace-nowrap" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={i <= rating ? "text-amber-400" : "text-zinc-300"}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default function FeedbackManager({
  feedback,
}: {
  feedback: Feedback[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | FeedbackStatus>("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [viewingId, setViewingId] = useState<string | null>(null);
  const viewing = feedback.find((item) => item._id === viewingId) ?? null;
  const [state, formAction, pending] = useActionState(
    async (
      _prev: { error?: string; success?: boolean } | undefined,
      formData: FormData,
    ) => {
      const intent = String(formData.get("intent") ?? "");
      if (intent === "delete") return deleteFeedback(undefined, formData);
      if (intent === "respond") return respondToFeedback(undefined, formData);
      return setFeedbackStatus(undefined, formData);
    },
    undefined,
  );

  const filtered = feedback.filter((item) => {
    if (statusFilter && item.status !== statusFilter) return false;
    if (categoryFilter && item.category !== categoryFilter) return false;
    const q = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.email ?? "").toLowerCase().includes(q) ||
      item.phone.toLowerCase().includes(q) ||
      item.subject.toLowerCase().includes(q) ||
      item.message.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Feedback
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Review, manage and respond to website feedback.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ExportButton
            filename="feedback.csv"
            headers={[
              "Name",
              "Email",
              "Phone",
              "Category",
              "Rating",
              "Subject",
              "Status",
              "Received",
            ]}
            rows={filtered.map((item) => [
              item.name,
              item.email,
              item.phone,
              item.category,
              item.rating,
              item.subject,
              FEEDBACK_STATUS_LABELS[item.status],
              formatCreated(item.createdAt),
            ])}
          />
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "" | FeedbackStatus)
            }
            className={`${inputClass} w-36`}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {FEEDBACK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {FEEDBACK_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={`${inputClass} w-44`}
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {FEEDBACK_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search feedback..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputClass} w-56`}
          />
        </div>
      </div>

      {state?.error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Feedback</th>
              <th className="px-4 py-3">Files</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-zinc-500">
                  No feedback found
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr
                  key={item._id}
                  className="border-b border-zinc-100 last:border-0"
                >
                  <td className="max-w-40 px-4 py-3 font-medium text-zinc-900">
                    <p className="truncate">{item.name}</p>
                    <p className="truncate text-xs font-normal text-zinc-500">
                      {item.phone}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-600">
                    {item.category}
                  </td>
                  <td className="px-4 py-3">
                    <Stars rating={item.rating} />
                  </td>
                  <td className="max-w-xs px-4 py-3 text-zinc-600">
                    <p className="truncate text-xs font-medium text-zinc-500">
                      {item.subject}
                    </p>
                    <p className="line-clamp-2">{item.message}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {item.attachments.length > 0
                      ? `${item.attachments.length} image${item.attachments.length === 1 ? "" : "s"}`
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-600">
                    {formatCreated(item.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setViewingId(item._id)}
                        className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
                      >
                        View
                      </button>
                      <form
                        action={formAction}
                        onSubmit={(e) => {
                          if (!confirm("Delete this feedback?"))
                            e.preventDefault();
                        }}
                      >
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="id" value={item._id} />
                        <button
                          type="submit"
                          disabled={pending}
                          className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setViewingId(null)}
            aria-hidden="true"
          />
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-zinc-900">
                  {viewing.subject}
                </h3>
                <p className="mt-1 text-sm text-zinc-500">
                  {viewing.name} · {viewing.category}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingId(null)}
                className="text-zinc-500 hover:text-zinc-700"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Email
                </dt>
                <dd className="mt-0.5 text-zinc-900">
                  {viewing.email ? (
                    <a
                      href={`mailto:${viewing.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {viewing.email}
                    </a>
                  ) : (
                    "-"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Mobile
                </dt>
                <dd className="mt-0.5 text-zinc-900">{viewing.phone || "-"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Rating
                </dt>
                <dd className="mt-0.5 text-lg leading-6">
                  <Stars rating={viewing.rating} />
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Received
                </dt>
                <dd className="mt-0.5 text-zinc-900">
                  {formatCreated(viewing.createdAt)}
                </dd>
              </div>
            </dl>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Feedback
              </p>
              <p className="mt-1 whitespace-pre-line rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-900">
                {viewing.message}
              </p>
            </div>

            {viewing.attachments.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Attachments
                </p>
                <div className="mt-2 flex flex-wrap gap-3">
                  {viewing.attachments.map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block overflow-hidden rounded-lg border border-zinc-200 transition-opacity hover:opacity-80"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt="Feedback attachment"
                        className="h-24 w-32 object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <form
              action={formAction}
              className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-4"
            >
              <input type="hidden" name="id" value={viewing._id} />
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={viewing.status}
                    className={`${inputClass} w-40`}
                  >
                    {FEEDBACK_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {FEEDBACK_STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  name="intent"
                  value="status"
                  disabled={pending}
                  className="rounded-md bg-blue-600 px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                >
                  Update Status
                </button>
              </div>

              <div className="mt-4">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Response to user
                </label>
                <textarea
                  name="response"
                  rows={4}
                  defaultValue={viewing.response ?? ""}
                  placeholder="Write a reply… if an email was provided, the user will be notified."
                  className={`${inputClass} resize-y bg-white`}
                />
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    name="intent"
                    value="respond"
                    disabled={pending}
                    className="rounded-md bg-blue-600 px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                  >
                    {pending ? "Saving…" : "Save Response"}
                  </button>
                  {viewing.respondedAt && (
                    <p className="text-xs text-zinc-500">
                      Last responded {formatCreated(viewing.respondedAt)}
                      {viewing.respondedBy ? ` by ${viewing.respondedBy}` : ""}
                    </p>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
