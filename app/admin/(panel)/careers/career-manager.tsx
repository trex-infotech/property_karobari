"use client";

import { formatDateTime as formatCreated } from "@/app/lib/format-date";
import { useActionState, useState } from "react";
import {
  addCareerNote,
  assignCareerApplication,
  deleteCareerApplication,
  setCareerStatus,
} from "@/app/actions/careers";
import type { CareerApplication } from "@/app/lib/careers";
import {
  CAREER_POSITIONS,
  CAREER_STATUSES,
  CAREER_STATUS_LABELS,
  type CareerStatus,
} from "@/app/lib/career-constants";
import type { Employee } from "@/app/lib/employees";
import ExportButton from "../export-button";

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20";


const STATUS_STYLES: Record<CareerStatus, string> = {
  new: "bg-blue-50 text-blue-700",
  under_review: "bg-amber-50 text-amber-700",
  shortlisted: "bg-green-50 text-green-700",
  rejected: "bg-zinc-100 text-zinc-600",
};

function StatusBadge({ status }: { status: CareerStatus }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {CAREER_STATUS_LABELS[status]}
    </span>
  );
}

export default function CareerManager({
  applications,
  employees,
}: {
  applications: CareerApplication[];
  employees: Employee[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | CareerStatus>("");
  const [positionFilter, setPositionFilter] = useState("");
  const [viewingId, setViewingId] = useState<string | null>(null);
  const viewing = applications.find((item) => item._id === viewingId) ?? null;
  const [state, formAction, pending] = useActionState(
    async (
      _prev: { error?: string; success?: boolean } | undefined,
      formData: FormData,
    ) => {
      const intent = String(formData.get("intent") ?? "");
      if (intent === "delete") return deleteCareerApplication(undefined, formData);
      if (intent === "assign") return assignCareerApplication(undefined, formData);
      if (intent === "note") return addCareerNote(undefined, formData);
      return setCareerStatus(undefined, formData);
    },
    undefined,
  );

  const filtered = applications.filter((item) => {
    if (statusFilter && item.status !== statusFilter) return false;
    if (positionFilter && item.position !== positionFilter) return false;
    const q = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.email ?? "").toLowerCase().includes(q) ||
      item.phone.toLowerCase().includes(q) ||
      item.city.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Career Applications
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Review and manage job applications.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ExportButton
            filename="career-applications.csv"
            headers={[
              "Name",
              "Email",
              "Phone",
              "Position",
              "Experience",
              "City",
              "Status",
              "Assigned To",
              "Received",
            ]}
            rows={filtered.map((item) => [
              item.name,
              item.email,
              item.phone,
              item.position,
              item.experience,
              item.city,
              CAREER_STATUS_LABELS[item.status],
              item.assignedToName,
              formatCreated(item.createdAt),
            ])}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "" | CareerStatus)}
            className={`${inputClass} w-40`}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {CAREER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {CAREER_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className={`${inputClass} w-48`}
            aria-label="Filter by position"
          >
            <option value="">All positions</option>
            {CAREER_POSITIONS.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search applications..."
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
              <th className="px-4 py-3">Position</th>
              <th className="px-4 py-3">Experience</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Resume</th>
              <th className="px-4 py-3">Assigned To</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-zinc-500">
                  No applications found
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
                    {item.position}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-600">
                    {item.experience ?? "-"}
                  </td>
                  <td className="max-w-32 truncate px-4 py-3 text-zinc-600">
                    {item.city}
                  </td>
                  <td className="px-4 py-3">
                    {item.resumeUrl ? (
                      <a
                        href={item.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-blue-600 hover:underline"
                      >
                        View PDF
                      </a>
                    ) : (
                      <span className="text-zinc-400">-</span>
                    )}
                  </td>
                  <td className="max-w-36 truncate px-4 py-3 text-zinc-600">
                    {item.assignedToName ?? (
                      <span className="text-zinc-400">Unassigned</span>
                    )}
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
                          if (!confirm("Delete this application?"))
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
                  {viewing.name}
                </h3>
                <p className="mt-1 text-sm text-zinc-500">
                  {viewing.position} · {viewing.city}
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
                  Experience
                </dt>
                <dd className="mt-0.5 text-zinc-900">
                  {viewing.experience ?? "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Resume
                </dt>
                <dd className="mt-0.5 text-zinc-900">
                  {viewing.resumeUrl ? (
                    <a
                      href={viewing.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Open resume (PDF)
                    </a>
                  ) : (
                    "Not attached"
                  )}
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

            {viewing.message && (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Cover Note
                </p>
                <p className="mt-1 whitespace-pre-line rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-900">
                  {viewing.message}
                </p>
              </div>
            )}

            <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex flex-wrap items-end gap-3">
                <form action={formAction} className="flex items-end gap-2">
                  <input type="hidden" name="id" value={viewing._id} />
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Status
                    </label>
                    <select
                      name="status"
                      defaultValue={viewing.status}
                      className={`${inputClass} w-40`}
                    >
                      {CAREER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {CAREER_STATUS_LABELS[status]}
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
                    Update
                  </button>
                </form>

                <form action={formAction} className="flex items-end gap-2">
                  <input type="hidden" name="id" value={viewing._id} />
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Assign To
                    </label>
                    <select
                      name="employeeId"
                      defaultValue={viewing.assignedTo ?? ""}
                      className={`${inputClass} w-48`}
                    >
                      <option value="">Unassigned</option>
                      {employees.map((employee) => (
                        <option key={employee._id} value={employee._id}>
                          {employee.name} ({employee.typeLabel})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    name="intent"
                    value="assign"
                    disabled={pending}
                    className="rounded-md bg-blue-600 px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                  >
                    Assign
                  </button>
                </form>
              </div>

              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Follow-up Notes
                </p>
                {viewing.notes.length === 0 ? (
                  <p className="mt-2 text-sm text-zinc-500">
                    No notes yet — log screening and interview progress here.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {[...viewing.notes].reverse().map((note, index) => (
                      <li
                        key={index}
                        className="rounded-lg border border-zinc-200 bg-white p-3 text-sm"
                      >
                        <p className="whitespace-pre-line text-zinc-900">
                          {note.text}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {note.by ?? "Admin"} · {formatCreated(note.at)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
                <form action={formAction} className="mt-3">
                  <input type="hidden" name="id" value={viewing._id} />
                  <textarea
                    name="note"
                    rows={2}
                    placeholder="Add a follow-up note…"
                    className={`${inputClass} resize-y bg-white`}
                  />
                  <button
                    type="submit"
                    name="intent"
                    value="note"
                    disabled={pending}
                    className="mt-2 rounded-md bg-blue-600 px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                  >
                    {pending ? "Saving…" : "Add Note"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
