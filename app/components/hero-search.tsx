"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const tabs = [
  { value: "buy", label: "Buy" },
  { value: "rent", label: "Rent" },
  { value: "pg", label: "PG" },
  { value: "new-launch", label: "New Launch" },
  { value: "preleased", label: "Preleased" },
  { value: "auction", label: "Auction" },
];

const propertyTypes = [
  { label: "Flat", value: "Flats" },
  { label: "Row House", value: "Row House" },
  { label: "Builder Floor", value: "Builder Floors" },
  { label: "Villa", value: "Villa" },
  { label: "Shop", value: "Shop" },
  { label: "Office Space", value: "Office Space" },
  { label: "Gala", value: "Gala" },
  { label: "Bungalow", value: "Bungalow" },
  { label: "Open Plot", value: "Open Plot" },
];

type BudgetOption = { label: string; min?: number; max?: number };

const buyBudgets: BudgetOption[] = [
  { label: "Up to ₹25 Lakh", max: 25_00_000 },
  { label: "₹25 Lakh – ₹50 Lakh", min: 25_00_000, max: 50_00_000 },
  { label: "₹50 Lakh – ₹1 Crore", min: 50_00_000, max: 1_00_00_000 },
  { label: "Up to ₹5 Crore", max: 5_00_00_000 },
  { label: "Above ₹5 Crore", min: 5_00_00_000 },
];

const rentBudgets: BudgetOption[] = [
  { label: "Under ₹20,000", max: 20_000 },
  { label: "₹20,000 - 50,000", min: 20_000, max: 50_000 },
  { label: "₹50,000 – ₹1 Lakh", min: 50_000, max: 1_00_000 },
  { label: "₹1 Lakh – ₹2 Lakh", min: 1_00_000, max: 2_00_000 },
  { label: "Above ₹2 Lakh", min: 2_00_000 },
];

const pgBudgets: BudgetOption[] = [
  { label: "Under ₹5,000", max: 5_000 },
  { label: "₹5,000 – ₹10,000", min: 5_000, max: 10_000 },
  { label: "₹10,000 – ₹15,000", min: 10_000, max: 15_000 },
  { label: "₹15,000 – ₹25,000", min: 15_000, max: 25_000 },
  { label: "Above ₹25,000", min: 25_000 },
];

const budgetsByTab: Record<string, BudgetOption[]> = {
  buy: buyBudgets,
  "new-launch": buyBudgets,
  preleased: buyBudgets,
  auction: buyBudgets,
  rent: rentBudgets,
  pg: pgBudgets,
};

const fieldClass =
  "w-full bg-transparent text-sm font-semibold text-zinc-900 outline-none";

function PillSelect({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={ariaLabel}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-1 text-left"
      >
        <span className="truncate text-sm font-semibold text-zinc-900">
          {selected?.label}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 max-h-64 w-max min-w-full max-w-64 overflow-y-auto rounded-xl border border-zinc-200 bg-white py-1 shadow-xl">
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`block w-full whitespace-nowrap px-4 py-2 text-left text-sm transition-colors hover:bg-blue-50 ${
                option.value === value
                  ? "bg-blue-50 font-medium text-blue-600"
                  : "text-zinc-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const icons = {
  tag: (
    <>
      <path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.42 0l8.58-8.58a1 1 0 0 0 0-1.42Z" />
      <circle cx="7" cy="7" r="1.5" />
    </>
  ),
  building: (
    <>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  wallet: (
    <>
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </>
  ),
};

function Segment({
  icon,
  label,
  className = "",
  children,
}: {
  icon: keyof typeof icons;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex min-w-0 flex-1 items-center gap-3 px-4 py-2 ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 shrink-0 text-blue-600"
        aria-hidden="true"
      >
        {icons[icon]}
      </svg>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
          {label}
        </p>
        {children}
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div
      className="hidden h-10 w-px shrink-0 bg-zinc-200 lg:block"
      aria-hidden="true"
    />
  );
}

type CityOption = { city: string; locations: string[] };

export default function HeroSearch({ cities }: { cities: CityOption[] }) {
  const router = useRouter();
  const [tab, setTab] = useState("buy");
  const [city, setCity] = useState(
    () => cities.find((c) => c.city.toLowerCase() === "mumbai")?.city ?? "",
  );
  const [location, setLocation] = useState("");
  const [ptype, setPtype] = useState("Flats");
  const [budget, setBudget] = useState("");

  const locationOptions = useMemo(() => {
    const source = city
      ? (cities.find((c) => c.city === city)?.locations ?? [])
      : cities.flatMap((c) => c.locations);
    return [...new Set(source)];
  }, [cities, city]);

  const search = () => {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (location.trim()) params.set("q", location.trim());
    if (ptype) params.set("ptype", ptype);
    const budgetOption = budgetsByTab[tab]?.[Number(budget)];
    if (budgetOption) {
      if (budgetOption.min) params.set("min", String(budgetOption.min));
      if (budgetOption.max) params.set("max", String(budgetOption.max));
    }
    const qs = params.toString();
    router.push(`/properties/${tab}${qs ? `?${qs}` : ""}`);
  };

  return (
    <div className="mx-auto mt-8 w-full max-w-5xl rounded-4xl bg-white p-2 text-left shadow-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center">
        <Segment icon="tag" label="Listing Type">
          <PillSelect
            value={tab}
            onChange={(v) => {
              setTab(v);
              setBudget("");
            }}
            options={tabs}
            ariaLabel="Listing type"
          />
        </Segment>

        <Divider />

        <Segment icon="building" label="Property Type">
          <PillSelect
            value={ptype}
            onChange={setPtype}
            options={[
              { label: "All property types", value: "" },
              ...propertyTypes.map((t) => ({ label: t.label, value: t.value })),
            ]}
            ariaLabel="Property type"
          />
        </Segment>

        <Divider />

        <Segment icon="wallet" label="Budget">
          <PillSelect
            value={budget}
            onChange={setBudget}
            options={[
              { label: "Any Budget", value: "" },
              ...(budgetsByTab[tab] ?? []).map((b, i) => ({
                label: b.label,
                value: String(i),
              })),
            ]}
            ariaLabel="Budget"
          />
        </Segment>

        <Divider />

        <Segment icon="pin" label="City / Location" className="lg:flex-[1.7]">
          <div className="flex min-w-0 items-center gap-1">
            <input
              type="text"
              list="hero-cities"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="All cities"
              className={`${fieldClass} min-w-0 flex-1 placeholder:font-normal placeholder:text-zinc-400`}
              aria-label="City"
            />
            <span className="text-zinc-300">/</span>
            <input
              type="text"
              list="hero-locations"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") search();
              }}
              placeholder="Location"
              className={`${fieldClass} min-w-0 flex-1 placeholder:font-normal placeholder:text-zinc-400`}
              aria-label="Location"
            />
          </div>
          <datalist id="hero-cities">
            {cities.map((c) => (
              <option key={c.city} value={c.city} />
            ))}
          </datalist>
          <datalist id="hero-locations">
            {locationOptions.map((l) => (
              <option key={l} value={l} />
            ))}
          </datalist>
        </Segment>

        <button
          type="button"
          onClick={search}
          aria-label="Search"
          className="m-1 flex h-11 w-11 shrink-0 items-center justify-center justify-self-end rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 max-lg:w-full max-lg:rounded-xl"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
