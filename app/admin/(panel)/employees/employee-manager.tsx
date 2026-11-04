"use client";

import { formatDateTime as formatCreated } from "@/app/lib/format-date";
import { useActionState, useEffect, useState } from "react";
import {
  createEmployee,
  deleteEmployee,
} from "@/app/actions/employees";
import type { Employee } from "@/app/lib/employees";

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20";


const TYPE_STYLES: Record<string, string> = {
  manager: "bg-purple-50 text-purple-700",
  team_leader: "bg-blue-50 text-blue-700",
  executive: "bg-zinc-100 text-zinc-600",
};

function TypeBadge({ type, label }: { type: string; label: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        TYPE_STYLES[type] ?? "bg-zinc-100 text-zinc-600"
      }`}
    >
      {label}
    </span>
  );
}

function CreateEmployeeModal({
  managers,
  teamLeaders,
  isSuperAdmin,
  onClose,
}: {
  managers: Employee[];
  teamLeaders: Employee[];
  isSuperAdmin: boolean;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    createEmployee,
    undefined,
  );
  const [type, setType] = useState("executive");
  const [managerId, setManagerId] = useState("");
  const selectedManagerId = isSuperAdmin
    ? managerId
    : (managers[0]?._id ?? "");
  const managerTeamLeaders = teamLeaders.filter(
    (tl) => tl.managerId === selectedManagerId,
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Create employee"
        className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {state?.success ? (
          <div>
            <div className="text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-7 w-7 text-green-600"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <h3 className="mt-4 text-xl font-bold text-zinc-900">
                Employee created
              </h3>
            </div>
            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Login credentials
              </p>
              <p className="mt-2 text-sm text-zinc-700">
                {state.emailSent
                  ? `Credentials have been emailed to ${state.email}.`
                  : "The credentials email could not be sent — share these details with the employee manually."}
              </p>
              <p className="mt-3 font-mono text-sm font-semibold text-zinc-900">
                Password: {state.password}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-zinc-900">
                  Create Employee
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <form action={formAction} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">
                    Employee Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    required
                    minLength={3}
                    maxLength={50}
                    pattern="[A-Za-z][A-Za-z .'\-]{2,49}"
                    title="Letters only, at least 3 characters"
                    placeholder="Full name"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    required
                    className={inputClass}
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    {isSuperAdmin && (
                      <option value="manager">Manager — Rank 2</option>
                    )}
                    <option value="team_leader">Team Leader — Rank 3</option>
                    <option value="executive">Executive — Rank 4</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    required
                    inputMode="tel"
                    maxLength={13}
                    pattern="(\+91|91|0)?[6-9][0-9]{9}"
                    title="10-digit mobile number, optionally prefixed with +91"
                    placeholder="9876543210"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">
                    Email ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    maxLength={100}
                    placeholder="employee@example.com"
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-zinc-700">
                    Address
                  </label>
                  <textarea
                    name="address"
                    rows={2}
                    maxLength={300}
                    placeholder="Employee address"
                    className={`${inputClass} resize-y`}
                  />
                </div>
                {type !== "manager" &&
                  (isSuperAdmin ? (
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-zinc-700">
                        Assign to Manager{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="managerId"
                        required
                        className={inputClass}
                        value={managerId}
                        onChange={(e) => setManagerId(e.target.value)}
                      >
                        <option value="">Select a manager</option>
                        {managers.map((m) => (
                          <option key={m._id} value={m._id}>
                            {m.name} — {m.phone}
                          </option>
                        ))}
                      </select>
                      {managers.length === 0 && (
                        <p className="mt-1 text-xs text-amber-600">
                          No managers found — create a Manager first.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="sm:col-span-2">
                      <input
                        type="hidden"
                        name="managerId"
                        value={managers[0]?._id ?? ""}
                      />
                      <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
                        This employee will be assigned to you.
                      </p>
                    </div>
                  ))}
                {type === "executive" && (
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      Assign to Team Leader{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      key={selectedManagerId}
                      name="teamLeaderId"
                      required
                      className={inputClass}
                      disabled={!selectedManagerId}
                    >
                      <option value="">
                        {selectedManagerId
                          ? "Select a team leader"
                          : "Select a manager first"}
                      </option>
                      {managerTeamLeaders.map((tl) => (
                        <option key={tl._id} value={tl._id}>
                          {tl.name} — {tl.phone}
                        </option>
                      ))}
                    </select>
                    {selectedManagerId &&
                      managerTeamLeaders.length === 0 && (
                        <p className="mt-1 text-xs text-amber-600">
                          No team leaders under this manager — create a Team
                          Leader first.
                        </p>
                      )}
                  </div>
                )}
              </div>

              {state?.error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {state.error}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
              >
                {pending ? "Creating…" : "Create Employee"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function EmployeeManager({
  employees,
  managers,
  isSuperAdmin,
}: {
  employees: Employee[];
  managers: Employee[];
  isSuperAdmin: boolean;
}) {
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState<Employee | null>(null);
  const [, formAction, pending] = useActionState(deleteEmployee, undefined);
  const teamLeaders = employees.filter((e) => e.type === "team_leader");

  const filtered = employees.filter((employee) => {
    const q = search.toLowerCase();
    return (
      employee.name.toLowerCase().includes(q) ||
      employee.email.toLowerCase().includes(q) ||
      employee.phone.toLowerCase().includes(q) ||
      employee.typeLabel.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Employees
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Manage team members and their admin logins.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees…"
            className="w-48 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 sm:w-56"
          />
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Create Employee
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Rank</th>
              <th className="px-4 py-3 font-medium">Added</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-sm text-zinc-500"
                >
                  {employees.length === 0
                    ? "No employees yet. Create the first one."
                    : "No employees match your search."}
                </td>
              </tr>
            )}
            {filtered.map((employee) => (
              <tr
                key={employee._id}
                className="border-b border-zinc-100 last:border-0"
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-zinc-900">{employee.name}</p>
                  {employee.address && (
                    <p className="mt-0.5 max-w-48 truncate text-xs text-zinc-500">
                      {employee.address}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="text-zinc-900">{employee.phone}</p>
                  <p className="text-xs text-zinc-500">{employee.email}</p>
                </td>
                <td className="px-4 py-3">
                  <TypeBadge
                    type={employee.type}
                    label={employee.typeLabel}
                  />
                  {employee.managerName && (
                    <p className="mt-1 text-xs text-zinc-500">
                      → {employee.managerName}
                      {employee.teamLeaderName
                        ? ` / ${employee.teamLeaderName}`
                        : ""}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-700">{employee.rank}</td>
                <td className="px-4 py-3 text-zinc-600">
                  {formatCreated(employee.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setViewing(employee)}
                      className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
                    >
                      View
                    </button>
                    <form action={formAction}>
                      <input type="hidden" name="id" value={employee._id} />
                      <button
                        type="submit"
                        disabled={pending}
                        onClick={(e) => {
                          if (
                            !window.confirm(
                              `Delete ${employee.name}? Their login access will also be removed.`,
                            )
                          ) {
                            e.preventDefault();
                          }
                        }}
                        className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {creating && (
        <CreateEmployeeModal
          managers={managers}
          teamLeaders={teamLeaders}
          isSuperAdmin={isSuperAdmin}
          onClose={() => setCreating(false)}
        />
      )}

      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setViewing(null)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-zinc-900">
                {viewing.name}
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
            <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Contact Number
                </dt>
                <dd className="mt-0.5 text-zinc-900">
                  <a
                    href={`tel:${viewing.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {viewing.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Email ID
                </dt>
                <dd className="mt-0.5 text-zinc-900">
                  <a
                    href={`mailto:${viewing.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {viewing.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Type
                </dt>
                <dd className="mt-0.5">
                  <TypeBadge type={viewing.type} label={viewing.typeLabel} />
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Rank
                </dt>
                <dd className="mt-0.5 text-zinc-900">{viewing.rank}</dd>
              </div>
              {viewing.managerName && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Manager
                  </dt>
                  <dd className="mt-0.5 text-zinc-900">
                    {viewing.managerName}
                  </dd>
                </div>
              )}
              {viewing.teamLeaderName && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Team Leader
                  </dt>
                  <dd className="mt-0.5 text-zinc-900">
                    {viewing.teamLeaderName}
                  </dd>
                </div>
              )}
              {viewing.address && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Address
                  </dt>
                  <dd className="mt-0.5 text-zinc-900">{viewing.address}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Added
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
