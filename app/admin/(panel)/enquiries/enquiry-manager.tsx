"use client";

import { formatDateTime as formatCreated } from "@/app/lib/format-date";
import { useActionState, useState } from "react";
import {
  deleteEnquiry,
  setEnquiryActive,
} from "@/app/actions/enquiries";
import type { Enquiry } from "@/app/lib/enquiries";
import ExportButton from "../export-button";

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20";


function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        active
          ? "bg-blue-50 text-blue-700"
          : "bg-zinc-100 text-zinc-600"
      }`}
    >
      {active ? "Open" : "Closed"}
    </span>
  );
}

export default function EnquiryManager({
  enquiries,
}: {
  enquiries: Enquiry[];
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"open" | "closed">("open");
  const [viewing, setViewing] = useState<Enquiry | null>(null);
  const [state, formAction, pending] = useActionState(
    async (
      _prev: { error?: string; success?: boolean } | undefined,
      formData: FormData,
    ) => {
      const intent = String(formData.get("intent") ?? "");
      return intent === "delete"
        ? deleteEnquiry(undefined, formData)
        : setEnquiryActive(undefined, formData);
    },
    undefined,
  );

  const filtered = enquiries.filter((enquiry) => {
    if (enquiry.active !== (filter === "open")) return false;
    const q = search.toLowerCase();
    return (
      enquiry.name.toLowerCase().includes(q) ||
      (enquiry.email ?? "").toLowerCase().includes(q) ||
      (enquiry.subject ?? "").toLowerCase().includes(q) ||
      enquiry.message.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Enquiries
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            View and respond to contact enquiries.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton
            filename="enquiries.csv"
            headers={["Name", "Email", "Phone", "Subject", "Message", "Status", "Received"]}
            rows={filtered.map((enquiry) => [
              enquiry.name,
              enquiry.email,
              enquiry.phone,
              enquiry.subject,
              enquiry.message,
              enquiry.active ? "Open" : "Closed",
              formatCreated(enquiry.createdAt),
            ])}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as "open" | "closed")}
            className={`${inputClass} w-32`}
            aria-label="Filter enquiries"
          >
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
          <input
            type="text"
            placeholder="Search enquiries..."
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
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-zinc-500">
                  No enquiries found
                </td>
              </tr>
            ) : (
              filtered.map((enquiry) => (
                <tr
                  key={enquiry._id}
                  className="border-b border-zinc-100 last:border-0"
                >
                  <td className="max-w-40 px-4 py-3 font-medium text-zinc-900">
                    {enquiry.name}
                  </td>
                  <td className="max-w-52 px-4 py-3 text-zinc-600">
                    <p className="truncate">{enquiry.phone || "-"}</p>
                    {enquiry.email && (
                      <p className="truncate text-xs text-zinc-500">
                        {enquiry.email}
                      </p>
                    )}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-zinc-600">
                    {enquiry.subject && (
                      <p className="truncate text-xs font-medium text-zinc-500">
                        {enquiry.subject}
                      </p>
                    )}
                    <p className="line-clamp-2">{enquiry.message}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge active={enquiry.active} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-600">
                    {formatCreated(enquiry.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setViewing(enquiry)}
                        className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
                      >
                        View
                      </button>
                      <form
                        action={formAction}
                        onSubmit={(e) => {
                          if (
                            !confirm(
                              enquiry.active
                                ? "Close this enquiry?"
                                : "Reopen this enquiry?",
                            )
                          )
                            e.preventDefault();
                        }}
                      >
                        <input type="hidden" name="id" value={enquiry._id} />
                        <input
                          type="hidden"
                          name="active"
                          value={enquiry.active ? "false" : "true"}
                        />
                        <button
                          type="submit"
                          disabled={pending}
                          className={`rounded-md px-3 py-1.5 text-xs font-medium text-white transition-colors disabled:opacity-60 ${
                            enquiry.active
                              ? "bg-amber-600 hover:bg-amber-700"
                              : "bg-blue-600 hover:bg-blue-700"
                          }`}
                        >
                          {enquiry.active ? "Close" : "Reopen"}
                        </button>
                      </form>
                      <form
                        action={formAction}
                        onSubmit={(e) => {
                          if (!confirm("Delete this enquiry?"))
                            e.preventDefault();
                        }}
                      >
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="id" value={enquiry._id} />
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
            onClick={() => setViewing(null)}
            aria-hidden="true"
          />
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-zinc-900">
                Enquiry from {viewing.name}
              </h3>
              <button
                type="button"
                onClick={() => setViewing(null)}
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
                  Phone
                </dt>
                <dd className="mt-0.5 text-zinc-900">
                  {viewing.phone || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Subject
                </dt>
                <dd className="mt-0.5 text-zinc-900">
                  {viewing.subject || "-"}
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
                Message
              </p>
              <p className="mt-1 whitespace-pre-line rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-900">
                {viewing.message}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
