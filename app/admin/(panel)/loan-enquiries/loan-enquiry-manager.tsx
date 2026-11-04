"use client";

import { formatDateTime as formatCreated } from "@/app/lib/format-date";
import { useActionState, useState } from "react";
import {
  addLoanEnquiryNote,
  assignLoanEnquiry,
  deleteLoanEnquiry,
  setLoanEnquiryStatus,
} from "@/app/actions/loan-enquiries";
import type { Employee } from "@/app/lib/employees";
import type { LoanEnquiry } from "@/app/lib/loan-enquiries";
import {
  LOAN_ENQUIRY_STATUSES,
  LOAN_ENQUIRY_STATUS_LABELS,
  LOAN_TYPES,
  type LoanEnquiryStatus,
} from "@/app/lib/loan-enquiry-constants";
import ExportButton from "../export-button";

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20";


const STATUS_STYLES: Record<LoanEnquiryStatus, string> = {
  new: "bg-blue-50 text-blue-700",
  contacted: "bg-sky-50 text-sky-700",
  in_discussion: "bg-amber-50 text-amber-700",
  submitted_to_bank: "bg-violet-50 text-violet-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-zinc-100 text-zinc-600",
};

function StatusBadge({ status }: { status: LoanEnquiryStatus }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {LOAN_ENQUIRY_STATUS_LABELS[status]}
    </span>
  );
}

export default function LoanEnquiryManager({
  enquiries,
  employees,
}: {
  enquiries: LoanEnquiry[];
  employees: Employee[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | LoanEnquiryStatus>("");
  const [typeFilter, setTypeFilter] = useState("");
  const [viewingId, setViewingId] = useState<string | null>(null);
  const viewing = enquiries.find((item) => item._id === viewingId) ?? null;
  const [state, formAction, pending] = useActionState(
    async (
      _prev: { error?: string; success?: boolean } | undefined,
      formData: FormData,
    ) => {
      const intent = String(formData.get("intent") ?? "");
      if (intent === "delete") return deleteLoanEnquiry(undefined, formData);
      if (intent === "assign") return assignLoanEnquiry(undefined, formData);
      if (intent === "note") return addLoanEnquiryNote(undefined, formData);
      return setLoanEnquiryStatus(undefined, formData);
    },
    undefined,
  );

  const filtered = enquiries.filter((item) => {
    if (statusFilter && item.status !== statusFilter) return false;
    if (typeFilter && item.loanType !== typeFilter) return false;
    const q = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.email ?? "").toLowerCase().includes(q) ||
      item.phone.toLowerCase().includes(q) ||
      item.city.toLowerCase().includes(q) ||
      item.amount.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Loan Enquiries
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Track and manage property loan enquiries.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ExportButton
            filename="loan-enquiries.csv"
            headers={[
              "Name",
              "Email",
              "Phone",
              "Loan Type",
              "Amount",
              "City",
              "Status",
              "Assigned To",
              "Received",
            ]}
            rows={filtered.map((item) => [
              item.name,
              item.email,
              item.phone,
              item.loanType,
              item.amount,
              item.city,
              LOAN_ENQUIRY_STATUS_LABELS[item.status],
              item.assignedToName,
              formatCreated(item.createdAt),
            ])}
          />
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "" | LoanEnquiryStatus)
            }
            className={`${inputClass} w-44`}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {LOAN_ENQUIRY_STATUSES.map((status) => (
              <option key={status} value={status}>
                {LOAN_ENQUIRY_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={`${inputClass} w-48`}
            aria-label="Filter by loan type"
          >
            <option value="">All loan types</option>
            {LOAN_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
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
              <th className="px-4 py-3">Loan Type</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Assigned To</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-zinc-500">
                  No loan enquiries found
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
                    {item.loanType}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-600">
                    {item.amount}
                  </td>
                  <td className="max-w-32 truncate px-4 py-3 text-zinc-600">
                    {item.city}
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
                          if (!confirm("Delete this loan enquiry?"))
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
                  {viewing.loanType} — {viewing.name}
                </h3>
                <p className="mt-1 text-sm text-zinc-500">
                  {viewing.amount} · {viewing.city}
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
                  Required Amount
                </dt>
                <dd className="mt-0.5 text-zinc-900">{viewing.amount}</dd>
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
                  Message
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
                      className={`${inputClass} w-44`}
                    >
                      {LOAN_ENQUIRY_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {LOAN_ENQUIRY_STATUS_LABELS[status]}
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
                    No notes yet — log calls and progress here.
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
