"use client";

import { formatDateTime as formatCreated } from "@/app/lib/format-date";
import { useActionState, useState } from "react";
import { deleteLead, setLeadActive } from "@/app/actions/leads";
import type { Lead } from "@/app/lib/leads";
import ExportButton from "../export-button";

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20";


function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        active ? "bg-blue-50 text-blue-700" : "bg-zinc-100 text-zinc-600"
      }`}
    >
      {active ? "Active" : "Closed"}
    </span>
  );
}

export default function LeadManager({ leads }: { leads: Lead[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"active" | "closed">("active");
  const [viewing, setViewing] = useState<Lead | null>(null);
  const [state, formAction, pending] = useActionState(
    async (
      _prev: { error?: string; success?: boolean } | undefined,
      formData: FormData,
    ) => {
      const intent = String(formData.get("intent") ?? "");
      return intent === "delete"
        ? deleteLead(undefined, formData)
        : setLeadActive(undefined, formData);
    },
    undefined,
  );

  const filtered = leads.filter((lead) => {
    if (lead.active !== (filter === "active")) return false;
    const q = search.toLowerCase();
    return (
      lead.name.toLowerCase().includes(q) ||
      (lead.phone ?? "").toLowerCase().includes(q) ||
      (lead.propertyTitle ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Leads
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Property enquiries submitted from listing pages.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton
            filename="leads.csv"
            headers={[
              "Name",
              "Phone",
              "Preferred Contact",
              "Preferred Time",
              "Property",
              "Status",
              "Received",
            ]}
            rows={filtered.map((lead) => [
              lead.name,
              lead.phone,
              lead.preferredContactMethod,
              lead.preferredContactTime,
              lead.propertyTitle,
              lead.active ? "Active" : "Closed",
              formatCreated(lead.createdAt),
            ])}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as "active" | "closed")}
            className={`${inputClass} w-32`}
            aria-label="Filter leads"
          >
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
          <input
            type="text"
            placeholder="Search leads..."
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
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Property</th>
              <th className="px-4 py-3">Preferences</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-zinc-500">
                  No leads found
                </td>
              </tr>
            ) : (
              filtered.map((lead) => (
                <tr
                  key={lead._id}
                  className="border-b border-zinc-100 last:border-0"
                >
                  <td className="max-w-40 px-4 py-3 font-medium text-zinc-900">
                    {lead.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-600">
                    {lead.phone || "-"}
                  </td>
                  <td className="max-w-52 px-4 py-3 text-zinc-600">
                    {lead.propertyUrl ? (
                      <a
                        href={lead.propertyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="line-clamp-2 text-blue-600 hover:underline"
                      >
                        {lead.propertyTitle || "View property"}
                      </a>
                    ) : (
                      <span className="line-clamp-2">
                        {lead.propertyTitle || "-"}
                      </span>
                    )}
                  </td>
                  <td className="max-w-44 px-4 py-3 text-zinc-600">
                    <p className="truncate">
                      {lead.preferredContactMethod || "-"}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {lead.preferredContactTime || "-"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge active={lead.active} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-600">
                    {formatCreated(lead.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setViewing(lead)}
                        className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
                      >
                        View
                      </button>
                      <form
                        action={formAction}
                        onSubmit={(e) => {
                          if (
                            !confirm(
                              lead.active
                                ? "Close this lead?"
                                : "Reopen this lead?",
                            )
                          )
                            e.preventDefault();
                        }}
                      >
                        <input type="hidden" name="id" value={lead._id} />
                        <input
                          type="hidden"
                          name="active"
                          value={lead.active ? "false" : "true"}
                        />
                        <button
                          type="submit"
                          disabled={pending}
                          className={`rounded-md px-3 py-1.5 text-xs font-medium text-white transition-colors disabled:opacity-60 ${
                            lead.active
                              ? "bg-amber-600 hover:bg-amber-700"
                              : "bg-blue-600 hover:bg-blue-700"
                          }`}
                        >
                          {lead.active ? "Close" : "Reopen"}
                        </button>
                      </form>
                      <form
                        action={formAction}
                        onSubmit={(e) => {
                          if (!confirm("Delete this lead?")) e.preventDefault();
                        }}
                      >
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="id" value={lead._id} />
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
                Lead — {viewing.name}
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
                  Phone
                </dt>
                <dd className="mt-0.5 text-zinc-900">
                  {viewing.phone ? (
                    <a
                      href={`tel:${viewing.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {viewing.phone}
                    </a>
                  ) : (
                    "-"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Property
                </dt>
                <dd className="mt-0.5 text-zinc-900">
                  {viewing.propertyUrl ? (
                    <a
                      href={viewing.propertyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {viewing.propertyTitle || "View property"}
                    </a>
                  ) : (
                    (viewing.propertyTitle ?? "-")
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Preferred Contact Method
                </dt>
                <dd className="mt-0.5 text-zinc-900">
                  {viewing.preferredContactMethod || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Preferred Contact Time
                </dt>
                <dd className="mt-0.5 text-zinc-900">
                  {viewing.preferredContactTime || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Status
                </dt>
                <dd className="mt-0.5">
                  <StatusBadge active={viewing.active} />
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
          </div>
        </div>
      )}
    </div>
  );
}
