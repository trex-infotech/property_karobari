"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  createProperty,
  deletePropertyMedia,
  replacePropertyMedia,
  updateProperty,
} from "@/app/actions/properties";
import type { PropertyRecord } from "@/app/lib/types";
import SearchableSelect from "./searchable-select";

type CityOption = { city: string; locations: string[] };

const LISTING_TYPES = [
  { value: "sale", label: "Sale" },
  { value: "rent", label: "Rent" },
  { value: "pg", label: "PG" },
  { value: "new_launch", label: "New Launch" },
  { value: "preleased", label: "Preleased" },
  { value: "auction", label: "Auction" },
];

const PROPERTY_TYPES = [
  "Flats",
  "Builder Floors",
  "Row House",
  "Villa",
  "Shop",
  "Office Space",
  "Gala",
  "Bungalow",
  "Open Plot",
];

const BEDROOM_OPTIONS = [
  "1RK",
  "1BHK",
  "1.5BHK",
  "2BHK",
  "2.5BHK",
  "3BHK",
  "4BHK",
  "5BHK",
];

const NEW_LAUNCH_PROPERTY_TYPES = [
  "Residential",
  "Commercial",
  "Resi. With Comm.",
];

const AREA_UNITS = ["Sq.ft", "Sq.mt", "Acre", "Guntha", "Hectare"];

const PRELEASED_AREA_UNITS = ["Sq.ft", "Sq.m"];

const TENANT_TYPES = ["MNC", "Corporate", "Bank", "Showroom"];

const POSSESSION_TYPES = ["Symbolic", "Physical"];

const FURNISHING_OPTIONS = ["Furnished", "Semi-furnished", "Unfurnished"];

const CONSTRUCTION_STATUSES = [
  "Ready to Move",
  "Under Construction",
  "Newly Launched",
  "OC Received",
];

const TRANSACTION_TYPES = ["Resale", "Builder"];

const SALE_STATUSES = ["EOI Acceptance", "Normal Booking"];

const FACING_OPTIONS = [
  "North",
  "South",
  "East",
  "West",
  "North-East",
  "North-West",
  "South-East",
  "South-West",
];

const AMENITIES = [
  "Lift",
  "Power Backup",
  "Park",
  "Gymnasium",
  "Vaastu Compliant",
  "Swimming Pool",
  "Club House",
  "Gas Pipeline",
  "Security Personnel",
  "Wheelchair Friendly",
  "Pet Friendly",
  "Food Service",
  "Wifi",
  "Laundry Available",
];

const AVAILABLE_FOR_OPTIONS = [
  "Professional",
  "Boy",
  "Girl",
  "Student",
  "Family",
  "Other",
];

const PG_SERVICES = [
  "Wifi",
  "AC Room",
  "Food Service",
  "Laundry Service",
  "Laundry Available",
  "Wheelchair Friendly",
  "Pet Friendly",
];

const SHARING_OPTIONS = [
  "Private Room",
  "2 per Room",
  "More than 2 per Room",
];

const CAPACITY_OPTIONS = [
  "1-2 Guests",
  "2-4 Guests",
  "4-10 Guests",
  "10+ Guests",
];

const inputClass =
  "mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20";


const labelClass = "block text-sm font-medium text-zinc-700";

const MAX_THUMBNAIL_MB = 5;
const MAX_IMAGES = 5;
const MAX_IMAGE_MB = 5;
const MAX_VIDEO_MB = 25;
const MAX_BROCHURE_MB = 25;

function validateFiles(formData: FormData): string | null {
  const thumbnail = formData
    .getAll("thumbnail")
    .filter((f): f is File => f instanceof File && f.size > 0);
  const images = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);
  const videos = formData
    .getAll("videos")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (thumbnail.length > 1) {
    return "Only one thumbnail image can be uploaded.";
  }
  const thumbnailBytes = thumbnail.reduce((sum, file) => sum + file.size, 0);
  if (thumbnailBytes > MAX_THUMBNAIL_MB * 1024 * 1024) {
    return `Thumbnail exceeds the ${MAX_THUMBNAIL_MB}MB limit.`;
  }

  if (images.length > MAX_IMAGES) {
    return `You can upload up to ${MAX_IMAGES} property images.`;
  }
  if (images.some((file) => file.size > MAX_IMAGE_MB * 1024 * 1024)) {
    return `Each property image must be ${MAX_IMAGE_MB}MB or smaller.`;
  }

  if (videos.length > 1) {
    return "Only one video can be uploaded.";
  }
  const videoBytes = videos.reduce((sum, file) => sum + file.size, 0);
  if (videoBytes > MAX_VIDEO_MB * 1024 * 1024) {
    return `Video exceeds the ${MAX_VIDEO_MB}MB limit.`;
  }

  const brochures = formData
    .getAll("brochure")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (brochures.length > 1) {
    return "Only one brochure can be uploaded.";
  }
  if (brochures.some((file) => file.type !== "application/pdf")) {
    return "Project brochure must be a PDF file.";
  }
  if (brochures.some((file) => file.size > MAX_BROCHURE_MB * 1024 * 1024)) {
    return `Brochure exceeds the ${MAX_BROCHURE_MB}MB limit.`;
  }

  return null;
}

const inrAmount = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
});

const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function underHundred(n: number): string {
  if (n < 20) return ONES[n];
  const one = n % 10;
  return one ? `${TENS[Math.floor(n / 10)]}-${ONES[one]}` : TENS[Math.floor(n / 10)];
}

function underThousand(n: number): string {
  const rest = n % 100;
  return [
    n >= 100 ? `${ONES[Math.floor(n / 100)]} Hundred` : "",
    rest ? underHundred(rest) : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function indianWords(n: number): string {
  if (n === 0) return "Zero";
  const crore = Math.floor(n / 1e7);
  const lakh = Math.floor((n % 1e7) / 1e5);
  const thousand = Math.floor((n % 1e5) / 1e3);
  const rest = n % 1e3;
  return [
    crore
      ? `${crore >= 100 ? indianWords(crore) : underHundred(crore)} Crore`
      : "",
    lakh ? `${underHundred(lakh)} Lakh` : "",
    thousand ? `${underHundred(thousand)} Thousand` : "",
    rest ? underThousand(rest) : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function amountInWords(amount: number): string {
  let rupees = Math.floor(amount);
  let paise = Math.round((amount - rupees) * 100);
  if (paise === 100) {
    rupees += 1;
    paise = 0;
  }
  const parts = [
    rupees ? `${indianWords(rupees)} Rupees` : "",
    paise ? `${underHundred(paise)} Paise` : "",
  ].filter(Boolean);
  return parts.length ? `${parts.join(" and ")} Only` : "";
}

function AmountWithWords({
  name,
  required,
  defaultValue,
}: {
  name: string;
  required?: boolean;
  defaultValue: number | null;
}) {
  const [text, setText] = useState(defaultValue?.toString() ?? "");
  const amount = Number(text);
  const words =
    text !== "" && Number.isFinite(amount) && amount > 0
      ? amountInWords(amount)
      : null;

  return (
    <>
      <input
        name={name}
        type="number"
        min="0"
        step="any"
        required={required}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className={inputClass}
      />
      {words && (
        <p className="mt-1 text-xs text-zinc-500">
          ₹{inrAmount.format(amount)} — {words}
        </p>
      )}
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

type MediaField = "thumbnail" | "images" | "videos" | "brochure";

function MediaButtons({
  propertyId,
  field,
  url,
  accept,
  onError,
}: {
  propertyId: string;
  field: MediaField;
  url: string;
  accept: string;
  onError: (message: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleDelete() {
    if (!window.confirm("Delete this media?")) return;
    setBusy(true);
    const result = await deletePropertyMedia({ propertyId, field, url });
    setBusy(false);
    if (!result?.success) {
      onError(result?.error ?? "Failed to delete media.");
    }
  }

  async function handleReplace(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    const result = await replacePropertyMedia({
      propertyId,
      field,
      url,
      file,
    });
    setBusy(false);
    if (!result?.success) {
      onError(result?.error ?? "Failed to replace media.");
    }
  }

  return (
    <div className="absolute right-1 top-1 flex gap-1">
      <button
        type="button"
        title="Replace"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="flex h-6 w-6 items-center justify-center rounded-md bg-white/90 text-zinc-700 shadow hover:bg-white disabled:opacity-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </button>
      <button
        type="button"
        title="Delete"
        disabled={busy}
        onClick={handleDelete}
        className="flex h-6 w-6 items-center justify-center rounded-md bg-red-600/90 text-white shadow hover:bg-red-600 disabled:opacity-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path d="M3 6h18" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleReplace}
      />
    </div>
  );
}

function HighlightsInput({ initial }: { initial: string[] }) {
  const [items, setItems] = useState(initial);
  const [draft, setDraft] = useState("");

  function addHighlight() {
    const value = draft.trim();
    if (!value || items.includes(value)) return;
    setItems((prev) => [...prev, value]);
    setDraft("");
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addHighlight();
            }
          }}
          placeholder="e.g. Near Metro Station"
          className={inputClass}
        />
        <button
          type="button"
          onClick={addHighlight}
          className="mt-1 shrink-0 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
        >
          Add
        </button>
      </div>
      {items.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 py-1 pl-3 pr-2 text-sm text-zinc-700"
            >
              {item}
              <button
                type="button"
                aria-label={`Remove ${item}`}
                onClick={() =>
                  setItems((prev) => prev.filter((v) => v !== item))
                }
                className="flex h-4 w-4 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3 w-3"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
              <input type="hidden" name="highlights" value={item} />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ImageThumb({
  src,
  onPreview,
  onRemove,
}: {
  src: string;
  onPreview: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="relative h-14 w-14 overflow-hidden rounded-md border border-zinc-200">
      <button
        type="button"
        onClick={onPreview}
        className="block h-full w-full"
        aria-label="Preview image"
      >
        <Image
          src={src}
          alt="Property image"
          width={56}
          height={56}
          unoptimized
          className="h-full w-full object-cover"
        />
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove image"
        className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-red-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-2.5 w-2.5"
          aria-hidden="true"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>
  );
}

function PropertyImagesInput({
  existingImages,
  propertyId,
  allowPdf = false,
}: {
  existingImages: string[];
  propertyId?: string;
  allowPdf?: boolean;
}) {
  const [selected, setSelected] = useState<{ file: File; url: string }[]>([]);
  const [existing, setExisting] = useState(existingImages);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const urlsRef = useRef<string[]>([]);

  useEffect(
    () => () => {
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  const total = existing.length + selected.length;

  // Keep the real <input type="file"> FileList in sync with state so
  // the managed selection is what FormData submits.
  function syncInput(items: { file: File; url: string }[]) {
    const dt = new DataTransfer();
    items.forEach((item) => dt.items.add(item.file));
    if (inputRef.current) inputRef.current.files = dt.files;
  }

  function handleSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    const next = [...selected];
    let message: string | null = null;
    for (const file of picked) {
      if (existing.length + next.length >= MAX_IMAGES) {
        message = `You can upload up to ${MAX_IMAGES} images in total.`;
        break;
      }
      if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
        message = `"${file.name}" exceeds the ${MAX_IMAGE_MB}MB limit.`;
        continue;
      }
      if (
        !next.some(
          (item) => item.file.name === file.name && item.file.size === file.size,
        )
      ) {
        const url = URL.createObjectURL(file);
        urlsRef.current.push(url);
        next.push({ file, url });
      }
    }
    setError(message);
    setSelected(next);
    syncInput(next);
  }

  function removeSelected(index: number) {
    const removed = selected[index];
    if (removed) {
      URL.revokeObjectURL(removed.url);
      urlsRef.current = urlsRef.current.filter((u) => u !== removed.url);
    }
    const next = selected.filter((_, i) => i !== index);
    setSelected(next);
    setError(null);
    syncInput(next);
  }

  async function removeExisting(url: string) {
    if (!propertyId || !window.confirm("Delete this image?")) return;
    const result = await deletePropertyMedia({
      propertyId,
      field: "images",
      url,
    });
    if (result?.success) {
      setExisting((prev) => prev.filter((u) => u !== url));
    } else {
      setError(result?.error ?? "Failed to delete image.");
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        name="images"
        type="file"
        accept={allowPdf ? "image/*,application/pdf" : "image/*"}
        multiple
        onChange={handleSelect}
        className={inputClass}
      />
      <p className="mt-1 text-xs text-zinc-500">
        {total} / {MAX_IMAGES} Images Selected
      </p>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {total > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {existing.map((url) => (
            <ImageThumb
              key={url}
              src={url}
              onPreview={() => setPreview(url)}
              onRemove={() => removeExisting(url)}
            />
          ))}
          {selected.map((item, index) => (
            <ImageThumb
              key={item.url}
              src={item.url}
              onPreview={() => setPreview(item.url)}
              onRemove={() => removeSelected(index)}
            />
          ))}
        </div>
      )}
      {preview && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreview(null)}
          role="button"
          aria-label="Close preview"
        >
          <Image
            src={preview}
            alt="Image preview"
            width={1200}
            height={800}
            unoptimized
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        </div>
      )}
    </>
  );
}

export default function AddPropertyModal({
  cities = [],
  property,
}: {
  cities?: CityOption[];
  property?: PropertyRecord;
}) {
  const isEdit = Boolean(property);
  const isDraft = property?.status === "draft";

  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [parking, setParking] = useState(property?.parking?.available ?? false);
  const [listingType, setListingType] = useState(
    property?.listingType ?? "sale",
  );
  const [transactionType, setTransactionType] = useState(
    property?.transactionType ?? "",
  );
  const [constructionStatus, setConstructionStatus] = useState(
    property?.constructionStatus ?? "",
  );
  const [selectedCity, setSelectedCity] = useState(property?.city ?? "");
  const [selectedLocation, setSelectedLocation] = useState(
    property?.location ?? "",
  );
  const [generation, setGeneration] = useState(0);
  const isRentLike = listingType === "rent" || listingType === "pg";
  const isNewLaunch = listingType === "new_launch";
  const isSale = listingType === "sale";
  const isRent = listingType === "rent";
  const isPg = listingType === "pg";
  const isPreleased = listingType === "preleased";
  const isAuction = listingType === "auction";
  const isReraRequired =
    transactionType === "Builder" &&
    constructionStatus === "Under Construction" &&
    listingType !== "pg" &&
    !isNewLaunch;
  const formRef = useRef<HTMLFormElement>(null);

  function openModal() {
    // Re-sync state from the latest props each time the modal opens.
    setParking(property?.parking?.available ?? false);
    setListingType(property?.listingType ?? "sale");
    setTransactionType(property?.transactionType ?? "");
    setConstructionStatus(property?.constructionStatus ?? "");
    setSelectedCity(property?.city ?? "");
    setSelectedLocation(property?.location ?? "");
    setError(null);
    setGeneration((value) => value + 1);
    setOpen(true);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // FormData(form) alone omits the clicked submit button's name/value,
    // so append the submitter manually to capture "status".
    const submitter = (event.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null;
    const formData = new FormData(event.currentTarget);
    if (submitter?.name) {
      formData.append(submitter.name, submitter.value);
    }

    const isDraftSubmit = formData.get("status") === "draft";

    if (!isDraftSubmit && !selectedCity) {
      setError("Please select a city.");
      return;
    }

    const fileError = validateFiles(formData);
    if (fileError) {
      setError(fileError);
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = property
        ? await updateProperty({ propertyId: property.id, formData })
        : await createProperty(formData);

      if (result?.success) {
        if (!property) {
          formRef.current?.reset();
          setParking(false);
          setListingType("sale");
          setTransactionType("");
          setConstructionStatus("");
          setSelectedCity("");
          setSelectedLocation("");
        }
        setOpen(false);
      } else {
        setError(result?.error ?? "Something went wrong. Please try again.");
      }
    });
  }

  const hasExistingMedia = Boolean(
    property?.thumbnail ||
      (property?.images.length ?? 0) > 0 ||
      (property?.videos.length ?? 0) > 0 ||
      property?.brochure,
  );

  return (
    <>
      {property ? (
        <button
          type="button"
          onClick={openModal}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
        >
          {isDraft ? "Continue" : "Edit"}
        </button>
      ) : (
        <button
          type="button"
          onClick={openModal}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          + Add Property
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-100 overflow-y-auto bg-black/50 p-4 text-left">
          {/* key={generation} remounts the form on every open so prefilled
              values always reflect the latest data. */}
          <div
            key={generation}
            className="mx-auto my-8 w-full max-w-3xl rounded-2xl bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-zinc-900">
                {!property || isDraft ? "Add Property" : "Edit Property"}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100"
                aria-label="Close"
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

            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="space-y-4 px-6 py-5"
            >
              <Field label="Listing type">
                <div className="mt-1 flex flex-wrap gap-2">
                  {LISTING_TYPES.map((type) => (
                    <label key={type.value} className="chip font-medium">
                      <input
                        type="radio"
                        name="listingType"
                        value={type.value}
                        checked={listingType === type.value}
                        onChange={() => setListingType(type.value)}
                        className="sr-only"
                      />
                      {type.label}
                    </label>
                  ))}
                </div>
              </Field>

              {isNewLaunch ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Project Name">
                    <input
                      name="societyName"
                      type="text"
                      required
                      placeholder="e.g. Skyline Greens Phase 2"
                      defaultValue={property?.societyName ?? ""}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="RERA Registration Number">
                    <input
                      name="reraNumber"
                      type="text"
                      placeholder="e.g. P51900001234"
                      defaultValue={property?.reraNumber ?? ""}
                      className={inputClass}
                    />
                  </Field>
                </div>
              ) : (
                <Field label="Society / Project Name">
                  <input
                    name="societyName"
                    type="text"
                    required
                    placeholder="e.g. Green Valley Society / Skyline Phase 2"
                    defaultValue={property?.societyName ?? ""}
                    className={inputClass}
                  />
                </Field>
              )}

              {isSale ? (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Transaction type">
                      <select
                        name="transactionType"
                        className={inputClass}
                        value={transactionType}
                        onChange={(e) => setTransactionType(e.target.value)}
                      >
                        <option value="" disabled>
                          Select transaction type
                        </option>
                        {TRANSACTION_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Construction status">
                      <select
                        name="constructionStatus"
                        className={inputClass}
                        value={constructionStatus}
                        onChange={(e) => setConstructionStatus(e.target.value)}
                      >
                        <option value="" disabled>
                          Select status
                        </option>
                        {CONSTRUCTION_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </Field>

                    {isReraRequired && (
                      <Field label="RERA Registration Number">
                        <input
                          name="reraNumber"
                          type="text"
                          required
                          placeholder="e.g. P51900001234"
                          defaultValue={property?.reraNumber ?? ""}
                          className={inputClass}
                        />
                      </Field>
                    )}

                    <Field label="Property type">
                      <select
                        name="propertyType"
                        className={inputClass}
                        defaultValue={property?.propertyType ?? ""}
                      >
                        <option value="" disabled>
                          Select type
                        </option>
                        {PROPERTY_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Bedrooms">
                      <select
                        name="bedrooms"
                        className={inputClass}
                        defaultValue={property?.bedrooms ?? ""}
                      >
                        <option value="" disabled>
                          Select bedrooms
                        </option>
                        {BEDROOM_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Total floors">
                      <input
                        name="totalFloors"
                        type="number"
                        min="0"
                        defaultValue={property?.totalFloors ?? ""}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Parking">
                      <div className="mt-1 flex gap-4">
                        <label className="flex items-center gap-2 text-sm text-zinc-700">
                          <input
                            type="radio"
                            name="parkingAvailable"
                            value="yes"
                            checked={parking}
                            onChange={() => setParking(true)}
                          />
                          Yes
                        </label>
                        <label className="flex items-center gap-2 text-sm text-zinc-700">
                          <input
                            type="radio"
                            name="parkingAvailable"
                            value="no"
                            checked={!parking}
                            onChange={() => setParking(false)}
                          />
                          No
                        </label>
                      </div>
                    </Field>

                    {parking && (
                      <>
                        <Field label="No. of parkings">
                          <input
                            name="parkingCount"
                            type="number"
                            min="1"
                            defaultValue={property?.parking?.count ?? ""}
                            className={inputClass}
                          />
                        </Field>
                        <Field label="Parking type">
                          <select
                            name="parkingType"
                            className={inputClass}
                            defaultValue={property?.parking?.type ?? ""}
                          >
                            <option value="" disabled>
                              Select type
                            </option>
                            <option value="Open Parking">Open Parking</option>
                            <option value="Covered Parking">
                              Covered Parking
                            </option>
                          </select>
                        </Field>
                      </>
                    )}

                    <Field label="Area">
                      <input
                        name="area"
                        type="number"
                        min="0"
                        step="any"
                        defaultValue={property?.area ?? ""}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Area unit">
                      <select
                        name="areaUnit"
                        className={inputClass}
                        defaultValue={property?.areaUnit ?? ""}
                      >
                        <option value="" disabled>
                          Select unit
                        </option>
                        {AREA_UNITS.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Price (₹)">
                      <AmountWithWords
                        name="price"
                        required
                        defaultValue={property?.price ?? null}
                      />
                    </Field>

                    <Field label="City">
                      <input type="hidden" name="city" value={selectedCity} />
                      <div className="mt-1">
                        <SearchableSelect
                          value={selectedCity}
                          onChange={(value) => {
                            setSelectedCity(value);
                            setSelectedLocation("");
                          }}
                          options={cities.map((entry) => entry.city)}
                          placeholder="Search city…"
                        />
                      </div>
                    </Field>

                    <Field label="Location">
                      <input
                        type="hidden"
                        name="location"
                        value={selectedLocation}
                      />
                      <div className="mt-1">
                        <SearchableSelect
                          value={selectedLocation}
                          onChange={setSelectedLocation}
                          options={
                            cities.find((entry) => entry.city === selectedCity)
                              ?.locations ?? []
                          }
                          placeholder={
                            selectedCity
                              ? "Search location…"
                              : "Select a city first"
                          }
                        />
                      </div>
                    </Field>
                  </div>

                  <Field label="Amenities">
                    <div className="mt-1 flex flex-wrap gap-2">
                      {AMENITIES.map((amenity) => (
                        <label key={amenity} className="chip">
                          <input
                            type="checkbox"
                            name="amenities"
                            value={amenity}
                            defaultChecked={property?.amenities?.includes(
                              amenity,
                            )}
                            className="sr-only"
                          />
                          {amenity}
                        </label>
                      ))}
                    </div>
                  </Field>

                  <Field label="Key Highlights">
                    <HighlightsInput initial={property?.highlights ?? []} />
                  </Field>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Furnishing">
                      <select
                        name="furnishing"
                        className={inputClass}
                        defaultValue={property?.furnishing ?? ""}
                      >
                        <option value="" disabled>
                          Select furnishing
                        </option>
                        {FURNISHING_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Building Age">
                      <input
                        name="buildingAge"
                        type="text"
                        placeholder="e.g. 5 years"
                        defaultValue={property?.buildingAge ?? ""}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Floor On">
                      <input
                        name="floor"
                        type="number"
                        min="0"
                        defaultValue={property?.floor ?? ""}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Address">
                      <textarea
                        name="address"
                        rows={3}
                        defaultValue={property?.address ?? ""}
                        className={inputClass}
                      ></textarea>
                    </Field>

                    <Field label="Facing">
                      <select
                        name="facing"
                        className={inputClass}
                        defaultValue={property?.facing ?? ""}
                      >
                        <option value="" disabled>
                          Select facing
                        </option>
                        {FACING_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </>
              ) : isRent ? (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Construction status">
                      <select
                        name="constructionStatus"
                        className={inputClass}
                        value={constructionStatus}
                        onChange={(e) => setConstructionStatus(e.target.value)}
                      >
                        <option value="" disabled>
                          Select status
                        </option>
                        {CONSTRUCTION_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Property type">
                      <select
                        name="propertyType"
                        className={inputClass}
                        defaultValue={property?.propertyType ?? ""}
                      >
                        <option value="" disabled>
                          Select type
                        </option>
                        {PROPERTY_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Bedrooms">
                      <select
                        name="bedrooms"
                        className={inputClass}
                        defaultValue={property?.bedrooms ?? ""}
                      >
                        <option value="" disabled>
                          Select bedrooms
                        </option>
                        {BEDROOM_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Total floors">
                      <input
                        name="totalFloors"
                        type="number"
                        min="0"
                        defaultValue={property?.totalFloors ?? ""}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Parking">
                      <div className="mt-1 flex gap-4">
                        <label className="flex items-center gap-2 text-sm text-zinc-700">
                          <input
                            type="radio"
                            name="parkingAvailable"
                            value="yes"
                            checked={parking}
                            onChange={() => setParking(true)}
                          />
                          Yes
                        </label>
                        <label className="flex items-center gap-2 text-sm text-zinc-700">
                          <input
                            type="radio"
                            name="parkingAvailable"
                            value="no"
                            checked={!parking}
                            onChange={() => setParking(false)}
                          />
                          No
                        </label>
                      </div>
                    </Field>

                    {parking && (
                      <>
                        <Field label="No. of parkings">
                          <input
                            name="parkingCount"
                            type="number"
                            min="1"
                            defaultValue={property?.parking?.count ?? ""}
                            className={inputClass}
                          />
                        </Field>
                        <Field label="Parking type">
                          <select
                            name="parkingType"
                            className={inputClass}
                            defaultValue={property?.parking?.type ?? ""}
                          >
                            <option value="" disabled>
                              Select type
                            </option>
                            <option value="Open Parking">Open Parking</option>
                            <option value="Covered Parking">
                              Covered Parking
                            </option>
                          </select>
                        </Field>
                      </>
                    )}

                    <Field label="Area">
                      <input
                        name="area"
                        type="number"
                        min="0"
                        step="any"
                        defaultValue={property?.area ?? ""}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Area unit">
                      <select
                        name="areaUnit"
                        className={inputClass}
                        defaultValue={property?.areaUnit ?? ""}
                      >
                        <option value="" disabled>
                          Select unit
                        </option>
                        {AREA_UNITS.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Rent (₹)">
                      <AmountWithWords
                        name="price"
                        required
                        defaultValue={property?.price ?? null}
                      />
                    </Field>

                    <Field label="Deposit amount (₹)">
                      <AmountWithWords
                        name="deposit"
                        defaultValue={property?.deposit ?? null}
                      />
                    </Field>

                    <Field label="City">
                      <input type="hidden" name="city" value={selectedCity} />
                      <div className="mt-1">
                        <SearchableSelect
                          value={selectedCity}
                          onChange={(value) => {
                            setSelectedCity(value);
                            setSelectedLocation("");
                          }}
                          options={cities.map((entry) => entry.city)}
                          placeholder="Search city…"
                        />
                      </div>
                    </Field>

                    <Field label="Location">
                      <input
                        type="hidden"
                        name="location"
                        value={selectedLocation}
                      />
                      <div className="mt-1">
                        <SearchableSelect
                          value={selectedLocation}
                          onChange={setSelectedLocation}
                          options={
                            cities.find((entry) => entry.city === selectedCity)
                              ?.locations ?? []
                          }
                          placeholder={
                            selectedCity
                              ? "Search location…"
                              : "Select a city first"
                          }
                        />
                      </div>
                    </Field>
                  </div>

                  <Field label="Available for">
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-2">
                      {AVAILABLE_FOR_OPTIONS.map((option) => (
                        <label
                          key={option}
                          className="flex items-center gap-2 text-sm text-zinc-700"
                        >
                          <input
                            type="checkbox"
                            name="availableFor"
                            value={option}
                            defaultChecked={property?.availableFor?.includes(
                              option,
                            )}
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  </Field>

                  <Field label="Amenities">
                    <div className="mt-1 flex flex-wrap gap-2">
                      {AMENITIES.map((amenity) => (
                        <label key={amenity} className="chip">
                          <input
                            type="checkbox"
                            name="amenities"
                            value={amenity}
                            defaultChecked={property?.amenities?.includes(
                              amenity,
                            )}
                            className="sr-only"
                          />
                          {amenity}
                        </label>
                      ))}
                    </div>
                  </Field>

                  <Field label="Key Highlights">
                    <HighlightsInput initial={property?.highlights ?? []} />
                  </Field>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Furnishing">
                      <select
                        name="furnishing"
                        className={inputClass}
                        defaultValue={property?.furnishing ?? ""}
                      >
                        <option value="" disabled>
                          Select furnishing
                        </option>
                        {FURNISHING_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Building Age">
                      <input
                        name="buildingAge"
                        type="text"
                        placeholder="e.g. 5 years"
                        defaultValue={property?.buildingAge ?? ""}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Floor On">
                      <input
                        name="floor"
                        type="number"
                        min="0"
                        defaultValue={property?.floor ?? ""}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Address">
                      <textarea
                        name="address"
                        rows={3}
                        defaultValue={property?.address ?? ""}
                        className={inputClass}
                      ></textarea>
                    </Field>

                    <Field label="Facing">
                      <select
                        name="facing"
                        className={inputClass}
                        defaultValue={property?.facing ?? ""}
                      >
                        <option value="" disabled>
                          Select facing
                        </option>
                        {FACING_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </>
              ) : isPg ? (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Property type">
                      <select
                        name="propertyType"
                        className={inputClass}
                        defaultValue={property?.propertyType ?? ""}
                      >
                        <option value="" disabled>
                          Select type
                        </option>
                        {PROPERTY_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Bedrooms">
                      <select
                        name="bedrooms"
                        className={inputClass}
                        defaultValue={property?.bedrooms ?? ""}
                      >
                        <option value="" disabled>
                          Select bedrooms
                        </option>
                        {BEDROOM_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Total floors">
                      <input
                        name="totalFloors"
                        type="number"
                        min="0"
                        defaultValue={property?.totalFloors ?? ""}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Parking">
                      <div className="mt-1 flex gap-4">
                        <label className="flex items-center gap-2 text-sm text-zinc-700">
                          <input
                            type="radio"
                            name="parkingAvailable"
                            value="yes"
                            checked={parking}
                            onChange={() => setParking(true)}
                          />
                          Yes
                        </label>
                        <label className="flex items-center gap-2 text-sm text-zinc-700">
                          <input
                            type="radio"
                            name="parkingAvailable"
                            value="no"
                            checked={!parking}
                            onChange={() => setParking(false)}
                          />
                          No
                        </label>
                      </div>
                    </Field>

                    {parking && (
                      <>
                        <Field label="No. of parkings">
                          <input
                            name="parkingCount"
                            type="number"
                            min="1"
                            defaultValue={property?.parking?.count ?? ""}
                            className={inputClass}
                          />
                        </Field>
                        <Field label="Parking type">
                          <select
                            name="parkingType"
                            className={inputClass}
                            defaultValue={property?.parking?.type ?? ""}
                          >
                            <option value="" disabled>
                              Select type
                            </option>
                            <option value="Open Parking">Open Parking</option>
                            <option value="Covered Parking">
                              Covered Parking
                            </option>
                          </select>
                        </Field>
                      </>
                    )}

                    <Field label="Area">
                      <input
                        name="area"
                        type="number"
                        min="0"
                        step="any"
                        defaultValue={property?.area ?? ""}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Area unit">
                      <select
                        name="areaUnit"
                        className={inputClass}
                        defaultValue={property?.areaUnit ?? ""}
                      >
                        <option value="" disabled>
                          Select unit
                        </option>
                        {AREA_UNITS.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Rent (₹)">
                      <AmountWithWords
                        name="price"
                        required
                        defaultValue={property?.price ?? null}
                      />
                    </Field>

                    <Field label="Deposit amount (₹)">
                      <AmountWithWords
                        name="deposit"
                        defaultValue={property?.deposit ?? null}
                      />
                    </Field>

                    <Field label="City">
                      <input type="hidden" name="city" value={selectedCity} />
                      <div className="mt-1">
                        <SearchableSelect
                          value={selectedCity}
                          onChange={(value) => {
                            setSelectedCity(value);
                            setSelectedLocation("");
                          }}
                          options={cities.map((entry) => entry.city)}
                          placeholder="Search city…"
                        />
                      </div>
                    </Field>

                    <Field label="Location">
                      <input
                        type="hidden"
                        name="location"
                        value={selectedLocation}
                      />
                      <div className="mt-1">
                        <SearchableSelect
                          value={selectedLocation}
                          onChange={setSelectedLocation}
                          options={
                            cities.find((entry) => entry.city === selectedCity)
                              ?.locations ?? []
                          }
                          placeholder={
                            selectedCity
                              ? "Search location…"
                              : "Select a city first"
                          }
                        />
                      </div>
                    </Field>
                  </div>

                  <Field label="Amenities">
                    <div className="mt-1 flex flex-wrap gap-2">
                      {AMENITIES.map((amenity) => (
                        <label key={amenity} className="chip">
                          <input
                            type="checkbox"
                            name="amenities"
                            value={amenity}
                            defaultChecked={property?.amenities?.includes(
                              amenity,
                            )}
                            className="sr-only"
                          />
                          {amenity}
                        </label>
                      ))}
                    </div>
                  </Field>

                  <Field label="Key Highlights">
                    <HighlightsInput initial={property?.highlights ?? []} />
                  </Field>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Furnishing">
                      <select
                        name="furnishing"
                        className={inputClass}
                        defaultValue={property?.furnishing ?? ""}
                      >
                        <option value="" disabled>
                          Select furnishing
                        </option>
                        {FURNISHING_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Building Age">
                      <input
                        name="buildingAge"
                        type="text"
                        placeholder="e.g. 5 years"
                        defaultValue={property?.buildingAge ?? ""}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Floor On">
                      <input
                        name="floor"
                        type="number"
                        min="0"
                        defaultValue={property?.floor ?? ""}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Address">
                      <textarea
                        name="address"
                        rows={3}
                        defaultValue={property?.address ?? ""}
                        className={inputClass}
                      ></textarea>
                    </Field>

                    <Field label="Facing">
                      <select
                        name="facing"
                        className={inputClass}
                        defaultValue={property?.facing ?? ""}
                      >
                        <option value="" disabled>
                          Select facing
                        </option>
                        {FACING_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Sharing option">
                      <select
                        name="sharingOption"
                        className={inputClass}
                        defaultValue={property?.sharingOption ?? ""}
                      >
                        <option value="" disabled>
                          Select
                        </option>
                        {SHARING_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Total capacity">
                      <select
                        name="totalCapacity"
                        className={inputClass}
                        defaultValue={property?.totalCapacity ?? ""}
                      >
                        <option value="" disabled>
                          Select
                        </option>
                        {CAPACITY_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <Field label="PG Services">
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-2">
                      {PG_SERVICES.map((service) => (
                        <label
                          key={service}
                          className="flex items-center gap-2 text-sm text-zinc-700"
                        >
                          <input
                            type="checkbox"
                            name="pgServices"
                            value={service}
                            defaultChecked={property?.pgServices?.includes(
                              service,
                            )}
                          />
                          {service}
                        </label>
                      ))}
                    </div>
                  </Field>
                </>
              ) : isNewLaunch ? (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Property type">
                      <select
                        name="propertyType"
                        className={inputClass}
                        defaultValue={property?.propertyType ?? ""}
                      >
                        <option value="" disabled>
                          Select type
                        </option>
                        {NEW_LAUNCH_PROPERTY_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Possession In">
                      <input
                        name="possessionIn"
                        type="text"
                        placeholder="e.g. Dec 2026"
                        defaultValue={property?.possessionIn ?? ""}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Sale Status">
                      <select
                        name="saleStatus"
                        className={inputClass}
                        defaultValue={property?.saleStatus ?? ""}
                      >
                        <option value="" disabled>
                          Select sale status
                        </option>
                        {SALE_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Price Starting (₹)">
                      <input
                        name="startingFrom"
                        type="number"
                        min="0"
                        step="any"
                        required
                        defaultValue={property?.startingFrom ?? ""}
                        className={inputClass}
                      />
                    </Field>

                    <Field
                      label={`Project Brochure (PDF – Max ${MAX_BROCHURE_MB} MB)`}
                    >
                      <input
                        name="brochure"
                        type="file"
                        accept="application/pdf,.pdf"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="City">
                      <input type="hidden" name="city" value={selectedCity} />
                      <div className="mt-1">
                        <SearchableSelect
                          value={selectedCity}
                          onChange={(value) => {
                            setSelectedCity(value);
                            setSelectedLocation("");
                          }}
                          options={cities.map((entry) => entry.city)}
                          placeholder="Search city…"
                        />
                      </div>
                    </Field>

                    <Field label="Location">
                      <input
                        type="hidden"
                        name="location"
                        value={selectedLocation}
                      />
                      <div className="mt-1">
                        <SearchableSelect
                          value={selectedLocation}
                          onChange={setSelectedLocation}
                          options={
                            cities.find((entry) => entry.city === selectedCity)
                              ?.locations ?? []
                          }
                          placeholder={
                            selectedCity
                              ? "Search location…"
                              : "Select a city first"
                          }
                        />
                      </div>
                    </Field>
                  </div>

                  <Field label="Amenities">
                    <div className="mt-1 flex flex-wrap gap-2">
                      {AMENITIES.map((amenity) => (
                        <label key={amenity} className="chip">
                          <input
                            type="checkbox"
                            name="amenities"
                            value={amenity}
                            defaultChecked={property?.amenities?.includes(
                              amenity,
                            )}
                            className="sr-only"
                          />
                          {amenity}
                        </label>
                      ))}
                    </div>
                  </Field>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Address">
                      <textarea
                        name="address"
                        rows={3}
                        defaultValue={property?.address ?? ""}
                        className={inputClass}
                      ></textarea>
                    </Field>

                    <Field label="Name of Builder/Developer">
                      <input
                        name="builderName"
                        type="text"
                        placeholder="e.g. ABC Developers"
                        defaultValue={property?.builderName ?? ""}
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </>
              ) : isPreleased ? (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Transaction type">
                      <select
                        name="transactionType"
                        className={inputClass}
                        value={transactionType}
                        onChange={(e) => setTransactionType(e.target.value)}
                      >
                        <option value="" disabled>
                          Select transaction type
                        </option>
                        {TRANSACTION_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Construction status">
                      <select
                        name="constructionStatus"
                        className={inputClass}
                        value={constructionStatus}
                        onChange={(e) => setConstructionStatus(e.target.value)}
                      >
                        <option value="" disabled>
                          Select status
                        </option>
                        {CONSTRUCTION_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </Field>

                    {isReraRequired && (
                      <Field label="RERA Registration Number">
                        <input
                          name="reraNumber"
                          type="text"
                          required
                          placeholder="e.g. P51900001234"
                          defaultValue={property?.reraNumber ?? ""}
                          className={inputClass}
                        />
                      </Field>
                    )}

                    <Field label="Property type">
                      <select
                        name="propertyType"
                        className={inputClass}
                        defaultValue={property?.propertyType ?? ""}
                      >
                        <option value="" disabled>
                          Select type
                        </option>
                        {PROPERTY_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Bedrooms">
                      <select
                        name="bedrooms"
                        className={inputClass}
                        defaultValue={property?.bedrooms ?? ""}
                      >
                        <option value="" disabled>
                          Select bedrooms
                        </option>
                        {BEDROOM_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Total floors">
                      <input
                        name="totalFloors"
                        type="number"
                        min="0"
                        defaultValue={property?.totalFloors ?? ""}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Parking">
                      <div className="mt-1 flex gap-4">
                        <label className="flex items-center gap-2 text-sm text-zinc-700">
                          <input
                            type="radio"
                            name="parkingAvailable"
                            value="yes"
                            checked={parking}
                            onChange={() => setParking(true)}
                          />
                          Yes
                        </label>
                        <label className="flex items-center gap-2 text-sm text-zinc-700">
                          <input
                            type="radio"
                            name="parkingAvailable"
                            value="no"
                            checked={!parking}
                            onChange={() => setParking(false)}
                          />
                          No
                        </label>
                      </div>
                    </Field>

                    {parking && (
                      <>
                        <Field label="No. of parkings">
                          <input
                            name="parkingCount"
                            type="number"
                            min="1"
                            defaultValue={property?.parking?.count ?? ""}
                            className={inputClass}
                          />
                        </Field>
                        <Field label="Parking type">
                          <select
                            name="parkingType"
                            className={inputClass}
                            defaultValue={property?.parking?.type ?? ""}
                          >
                            <option value="" disabled>
                              Select type
                            </option>
                            <option value="Open Parking">Open Parking</option>
                            <option value="Covered Parking">
                              Covered Parking
                            </option>
                          </select>
                        </Field>
                      </>
                    )}

                    <Field label="Area">
                      <input
                        name="area"
                        type="number"
                        min="0"
                        step="any"
                        defaultValue={property?.area ?? ""}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Area unit">
                      <select
                        name="areaUnit"
                        className={inputClass}
                        defaultValue={property?.areaUnit ?? ""}
                      >
                        <option value="" disabled>
                          Select unit
                        </option>
                        {PRELEASED_AREA_UNITS.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Price (₹)">
                      <AmountWithWords
                        name="price"
                        required
                        defaultValue={property?.price ?? null}
                      />
                    </Field>

                    <Field label="City">
                      <input type="hidden" name="city" value={selectedCity} />
                      <div className="mt-1">
                        <SearchableSelect
                          value={selectedCity}
                          onChange={(value) => {
                            setSelectedCity(value);
                            setSelectedLocation("");
                          }}
                          options={cities.map((entry) => entry.city)}
                          placeholder="Search city…"
                        />
                      </div>
                    </Field>

                    <Field label="Location">
                      <input
                        type="hidden"
                        name="location"
                        value={selectedLocation}
                      />
                      <div className="mt-1">
                        <SearchableSelect
                          value={selectedLocation}
                          onChange={setSelectedLocation}
                          options={
                            cities.find((entry) => entry.city === selectedCity)
                              ?.locations ?? []
                          }
                          placeholder={
                            selectedCity
                              ? "Search location…"
                              : "Select a city first"
                          }
                        />
                      </div>
                    </Field>
                  </div>

                  <Field label="Amenities">
                    <div className="mt-1 flex flex-wrap gap-2">
                      {AMENITIES.map((amenity) => (
                        <label key={amenity} className="chip">
                          <input
                            type="checkbox"
                            name="amenities"
                            value={amenity}
                            defaultChecked={property?.amenities?.includes(
                              amenity,
                            )}
                            className="sr-only"
                          />
                          {amenity}
                        </label>
                      ))}
                    </div>
                  </Field>

                  <Field label="Key Highlights">
                    <HighlightsInput initial={property?.highlights ?? []} />
                  </Field>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Suitable For">
                      <input
                        name="suitableFor"
                        type="text"
                        placeholder="e.g. IT Companies, Banks, Retail"
                        defaultValue={property?.suitableFor ?? ""}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Lease Amount (₹/month)">
                      <input
                        name="leaseAmount"
                        type="number"
                        min="0"
                        step="any"
                        defaultValue={property?.leaseAmount ?? ""}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Rental Yield YLY (%)">
                      <input
                        name="rentalYield"
                        type="number"
                        min="0"
                        step="any"
                        defaultValue={property?.rentalYield ?? ""}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Deposit amount (₹)">
                      <AmountWithWords
                        name="deposit"
                        defaultValue={property?.deposit ?? null}
                      />
                    </Field>

                    <Field label="Total Lease Tenure">
                      <input
                        name="totalLeaseTenure"
                        type="text"
                        placeholder="e.g. 9 years"
                        defaultValue={property?.totalLeaseTenure ?? ""}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Balance Lease Tenure">
                      <input
                        name="balanceLeaseTenure"
                        type="text"
                        placeholder="e.g. 6 years"
                        defaultValue={property?.balanceLeaseTenure ?? ""}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Tenant Type">
                      <select
                        name="tenantType"
                        className={inputClass}
                        defaultValue={property?.tenantType ?? ""}
                      >
                        <option value="" disabled>
                          Select tenant type
                        </option>
                        {TENANT_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Address">
                      <textarea
                        name="address"
                        rows={3}
                        defaultValue={property?.address ?? ""}
                        className={inputClass}
                      ></textarea>
                    </Field>
                  </div>
                </>
              ) : isAuction ? (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Possession Type">
                      <select
                        name="possessionType"
                        className={inputClass}
                        defaultValue={property?.possessionType ?? ""}
                      >
                        <option value="" disabled>
                          Select possession type
                        </option>
                        {POSSESSION_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Construction status">
                      <select
                        name="constructionStatus"
                        className={inputClass}
                        value={constructionStatus}
                        onChange={(e) => setConstructionStatus(e.target.value)}
                      >
                        <option value="" disabled>
                          Select status
                        </option>
                        {CONSTRUCTION_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Property type">
                      <select
                        name="propertyType"
                        className={inputClass}
                        defaultValue={property?.propertyType ?? ""}
                      >
                        <option value="" disabled>
                          Select type
                        </option>
                        {PROPERTY_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Bedrooms">
                      <select
                        name="bedrooms"
                        className={inputClass}
                        defaultValue={property?.bedrooms ?? ""}
                      >
                        <option value="" disabled>
                          Select bedrooms
                        </option>
                        {BEDROOM_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Total floors">
                      <input
                        name="totalFloors"
                        type="number"
                        min="0"
                        defaultValue={property?.totalFloors ?? ""}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Parking">
                      <div className="mt-1 flex gap-4">
                        <label className="flex items-center gap-2 text-sm text-zinc-700">
                          <input
                            type="radio"
                            name="parkingAvailable"
                            value="yes"
                            checked={parking}
                            onChange={() => setParking(true)}
                          />
                          Yes
                        </label>
                        <label className="flex items-center gap-2 text-sm text-zinc-700">
                          <input
                            type="radio"
                            name="parkingAvailable"
                            value="no"
                            checked={!parking}
                            onChange={() => setParking(false)}
                          />
                          No
                        </label>
                      </div>
                    </Field>

                    {parking && (
                      <>
                        <Field label="No. of parkings">
                          <input
                            name="parkingCount"
                            type="number"
                            min="1"
                            defaultValue={property?.parking?.count ?? ""}
                            className={inputClass}
                          />
                        </Field>
                        <Field label="Parking type">
                          <select
                            name="parkingType"
                            className={inputClass}
                            defaultValue={property?.parking?.type ?? ""}
                          >
                            <option value="" disabled>
                              Select type
                            </option>
                            <option value="Open Parking">Open Parking</option>
                            <option value="Covered Parking">
                              Covered Parking
                            </option>
                          </select>
                        </Field>
                      </>
                    )}

                    <Field label="Area">
                      <input
                        name="area"
                        type="number"
                        min="0"
                        step="any"
                        defaultValue={property?.area ?? ""}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Area unit">
                      <select
                        name="areaUnit"
                        className={inputClass}
                        defaultValue={property?.areaUnit ?? ""}
                      >
                        <option value="" disabled>
                          Select unit
                        </option>
                        {PRELEASED_AREA_UNITS.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Reserve Price (₹)">
                      <AmountWithWords
                        name="reservePrice"
                        required
                        defaultValue={property?.reservePrice ?? null}
                      />
                    </Field>

                    <Field label="EMD Amount (₹)">
                      <AmountWithWords
                        name="emdAmount"
                        defaultValue={property?.emdAmount ?? null}
                      />
                    </Field>

                    <Field label="EMD Date">
                      <input
                        name="emdDate"
                        type="date"
                        defaultValue={property?.emdDate ?? ""}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="City">
                      <input type="hidden" name="city" value={selectedCity} />
                      <div className="mt-1">
                        <SearchableSelect
                          value={selectedCity}
                          onChange={(value) => {
                            setSelectedCity(value);
                            setSelectedLocation("");
                          }}
                          options={cities.map((entry) => entry.city)}
                          placeholder="Search city…"
                        />
                      </div>
                    </Field>

                    <Field label="Location">
                      <input
                        type="hidden"
                        name="location"
                        value={selectedLocation}
                      />
                      <div className="mt-1">
                        <SearchableSelect
                          value={selectedLocation}
                          onChange={setSelectedLocation}
                          options={
                            cities.find((entry) => entry.city === selectedCity)
                              ?.locations ?? []
                          }
                          placeholder={
                            selectedCity
                              ? "Search location…"
                              : "Select a city first"
                          }
                        />
                      </div>
                    </Field>
                  </div>

                  <Field label="Key Highlights">
                    <HighlightsInput initial={property?.highlights ?? []} />
                  </Field>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Inspection Date">
                      <input
                        name="inspectionDate"
                        type="date"
                        defaultValue={property?.inspectionDate ?? ""}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Name of Bank">
                      <input
                        name="bankName"
                        type="text"
                        placeholder="e.g. National Bank"
                        defaultValue={property?.bankName ?? ""}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Building Age">
                      <input
                        name="buildingAge"
                        type="text"
                        placeholder="e.g. 5 years"
                        defaultValue={property?.buildingAge ?? ""}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Floor On">
                      <input
                        name="floor"
                        type="number"
                        min="0"
                        defaultValue={property?.floor ?? ""}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Address">
                      <textarea
                        name="address"
                        rows={3}
                        defaultValue={property?.address ?? ""}
                        className={inputClass}
                      ></textarea>
                    </Field>

                    <Field label="Facing">
                      <select
                        name="facing"
                        className={inputClass}
                        defaultValue={property?.facing ?? ""}
                      >
                        <option value="" disabled>
                          Select facing
                        </option>
                        {FACING_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </>
              ) : (
                <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Property type">
                  <select
                    name="propertyType"
                    className={inputClass}
                    defaultValue={property?.propertyType ?? ""}
                  >
                    <option value="" disabled>
                      Select type
                    </option>
                    {(isNewLaunch ? NEW_LAUNCH_PROPERTY_TYPES : PROPERTY_TYPES).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </Field>

                {!isAuction && (
                  <Field label="Transaction type">
                    <select
                      name="transactionType"
                      className={inputClass}
                      value={transactionType}
                      onChange={(e) => setTransactionType(e.target.value)}
                    >
                      <option value="" disabled>
                        Select transaction type
                      </option>
                      {TRANSACTION_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}

                {listingType !== "pg" && !isNewLaunch && (
                  <Field label="Construction status">
                    <select
                      name="constructionStatus"
                      className={inputClass}
                      value={constructionStatus}
                      onChange={(e) => setConstructionStatus(e.target.value)}
                    >
                      <option value="" disabled>
                        Select status
                      </option>
                      {CONSTRUCTION_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}

                {isReraRequired && (
                  <Field label="RERA Registration Number">
                    <input
                      name="reraNumber"
                      type="text"
                      required
                      placeholder="e.g. P51900001234"
                      defaultValue={property?.reraNumber ?? ""}
                      className={inputClass}
                    />
                  </Field>
                )}

                {!isNewLaunch && (
                  <>
                    {!isPreleased && (
                      <Field label="Floor On">
                        <input
                          name="floor"
                          type="number"
                          min="0"
                          defaultValue={property?.floor ?? ""}
                          className={inputClass}
                        />
                      </Field>
                    )}

                    <Field label="Total floors">
                      <input
                        name="totalFloors"
                        type="number"
                        min="0"
                        defaultValue={property?.totalFloors ?? ""}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Bedrooms">
                      <select
                        name="bedrooms"
                        className={inputClass}
                        defaultValue={property?.bedrooms ?? ""}
                      >
                        <option value="" disabled>
                          Select bedrooms
                        </option>
                        {BEDROOM_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </Field>

                    {!isPreleased && !isAuction && (
                      <Field label="Furnishing">
                        <select
                          name="furnishing"
                          className={inputClass}
                          defaultValue={property?.furnishing ?? ""}
                        >
                          <option value="" disabled>
                            Select furnishing
                          </option>
                          {FURNISHING_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </Field>
                    )}

                    <Field label="Area">
                      <input
                        name="area"
                        type="number"
                        min="0"
                        step="any"
                        defaultValue={property?.area ?? ""}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Area unit">
                      <select
                        name="areaUnit"
                        className={inputClass}
                        defaultValue={property?.areaUnit ?? ""}
                      >
                        <option value="" disabled>
                          Select unit
                        </option>
                        {(isPreleased || isAuction ? PRELEASED_AREA_UNITS : AREA_UNITS).map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </>
                )}

                <Field label="Building Age">
                  <input
                    name="buildingAge"
                    type="text"
                    placeholder="e.g. 5 years"
                    defaultValue={property?.buildingAge ?? ""}
                    className={inputClass}
                  />
                </Field>

                <Field label="Facing">
                  <select
                    name="facing"
                    className={inputClass}
                    defaultValue={property?.facing ?? ""}
                  >
                    <option value="" disabled>
                      Select facing
                    </option>
                    {FACING_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>

                {isNewLaunch ? (
                  <>
                    <Field label="Possession In">
                      <input
                        name="possessionIn"
                        type="text"
                        placeholder="e.g. Dec 2026"
                        defaultValue={property?.possessionIn ?? ""}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Starting From (₹)">
                      <input
                        name="startingFrom"
                        type="number"
                        min="0"
                        step="any"
                        required
                        defaultValue={property?.startingFrom ?? ""}
                        className={inputClass}
                      />
                    </Field>
                  </>
                ) : (
                  <>
                    {!isAuction && (
                      <Field label={isRentLike ? "Rent (₹)" : "Price (₹)"}>
                        <AmountWithWords
                          name="price"
                          required
                          defaultValue={property?.price ?? null}
                        />
                      </Field>
                    )}

                    {isAuction && (
                      <>
                        <Field label="Reserve Price (₹)">
                          <AmountWithWords
                            name="reservePrice"
                            required
                            defaultValue={property?.reservePrice ?? null}
                          />
                        </Field>
                        <Field label="EMD Amount (₹)">
                          <AmountWithWords
                            name="emdAmount"
                            defaultValue={property?.emdAmount ?? null}
                          />
                        </Field>
                        <Field label="EMD Date">
                          <input
                            name="emdDate"
                            type="date"
                            defaultValue={property?.emdDate ?? ""}
                            className={inputClass}
                          />
                        </Field>
                      </>
                    )}

                    {(listingType === "rent" || isPreleased) && (
                      <Field label="Deposit amount (₹)">
                        <AmountWithWords
                          name="deposit"
                          defaultValue={property?.deposit ?? null}
                        />
                      </Field>
                    )}
                  </>
                )}

                <Field label="City">
                  <input type="hidden" name="city" value={selectedCity} />
                  <div className="mt-1">
                    <SearchableSelect
                      value={selectedCity}
                      onChange={(value) => {
                        setSelectedCity(value);
                        setSelectedLocation("");
                      }}
                      options={cities.map((entry) => entry.city)}
                      placeholder="Search city…"
                    />
                  </div>
                </Field>

                <Field label="Location">
                  <input
                    type="hidden"
                    name="location"
                    value={selectedLocation}
                  />
                  <div className="mt-1">
                    <SearchableSelect
                      value={selectedLocation}
                      onChange={setSelectedLocation}
                      options={
                        cities.find((entry) => entry.city === selectedCity)
                          ?.locations ?? []
                      }
                      placeholder={
                        selectedCity ? "Search location…" : "Select a city first"
                      }
                    />
                  </div>
                </Field>

                {isPreleased && (
                  <>
                    <Field label="Suitable For">
                      <input
                        name="suitableFor"
                        type="text"
                        placeholder="e.g. IT Companies, Banks, Retail"
                        defaultValue={property?.suitableFor ?? ""}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Lease Amount (₹/month)">
                      <input
                        name="leaseAmount"
                        type="number"
                        min="0"
                        step="any"
                        defaultValue={property?.leaseAmount ?? ""}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Rental Yield YLY (%)">
                      <input
                        name="rentalYield"
                        type="number"
                        min="0"
                        step="any"
                        defaultValue={property?.rentalYield ?? ""}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Total Lease Tenure">
                      <input
                        name="totalLeaseTenure"
                        type="text"
                        placeholder="e.g. 9 years"
                        defaultValue={property?.totalLeaseTenure ?? ""}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Balance Lease Tenure">
                      <input
                        name="balanceLeaseTenure"
                        type="text"
                        placeholder="e.g. 6 years"
                        defaultValue={property?.balanceLeaseTenure ?? ""}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Tenant Type">
                      <select
                        name="tenantType"
                        className={inputClass}
                        defaultValue={property?.tenantType ?? ""}
                      >
                        <option value="" disabled>
                          Select tenant type
                        </option>
                        {TENANT_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </>
                )}

                {isAuction && (
                  <>
                    <Field label="Possession Type">
                      <select
                        name="possessionType"
                        className={inputClass}
                        defaultValue={property?.possessionType ?? ""}
                      >
                        <option value="" disabled>
                          Select possession type
                        </option>
                        {POSSESSION_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Inspection Date">
                      <input
                        name="inspectionDate"
                        type="date"
                        defaultValue={property?.inspectionDate ?? ""}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Name of Bank">
                      <input
                        name="bankName"
                        type="text"
                        placeholder="e.g. National Bank"
                        defaultValue={property?.bankName ?? ""}
                        className={inputClass}
                      />
                    </Field>
                  </>
                )}

                {listingType === "rent" && (
                  <Field label="Available for">
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-2">
                      {AVAILABLE_FOR_OPTIONS.map((option) => (
                        <label
                          key={option}
                          className="flex items-center gap-2 text-sm text-zinc-700"
                        >
                          <input
                            type="checkbox"
                            name="availableFor"
                            value={option}
                            defaultChecked={property?.availableFor?.includes(
                              option,
                            )}
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  </Field>
                )}

                {listingType === "pg" && (
                  <Field label="Sharing option">
                    <select
                      name="sharingOption"
                      className={inputClass}
                      defaultValue={property?.sharingOption ?? ""}
                    >
                      <option value="" disabled>
                        Select
                      </option>
                      {SHARING_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}

                {listingType === "pg" && (
                  <Field label="Total capacity">
                    <select
                      name="totalCapacity"
                      className={inputClass}
                      defaultValue={property?.totalCapacity ?? ""}
                    >
                      <option value="" disabled>
                        Select
                      </option>
                      {CAPACITY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}

                {listingType === "pg" && (
                  <Field label="PG Services">
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-2">
                      {PG_SERVICES.map((service) => (
                        <label
                          key={service}
                          className="flex items-center gap-2 text-sm text-zinc-700"
                        >
                          <input
                            type="checkbox"
                            name="pgServices"
                            value={service}
                            defaultChecked={property?.pgServices?.includes(
                              service,
                            )}
                          />
                          {service}
                        </label>
                      ))}
                    </div>
                  </Field>
                )}
              </div>

              <Field label="Address">
                <textarea
                  name="address"
                  rows={3}
                  defaultValue={property?.address ?? ""}
                  className={inputClass}
                ></textarea>
              </Field>

              {!isNewLaunch && (
                <Field label="Parking">
                  <div className="mt-1 flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-zinc-700">
                      <input
                        type="radio"
                        name="parkingAvailable"
                        value="yes"
                        checked={parking}
                        onChange={() => setParking(true)}
                      />
                      Yes
                    </label>
                    <label className="flex items-center gap-2 text-sm text-zinc-700">
                      <input
                        type="radio"
                        name="parkingAvailable"
                        value="no"
                        checked={!parking}
                        onChange={() => setParking(false)}
                      />
                      No
                    </label>
                  </div>
                </Field>
              )}

              {!isNewLaunch && parking && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="No. of parkings">
                    <input
                      name="parkingCount"
                      type="number"
                      min="1"
                      defaultValue={property?.parking?.count ?? ""}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Parking type">
                    <select
                      name="parkingType"
                      className={inputClass}
                      defaultValue={property?.parking?.type ?? ""}
                    >
                      <option value="" disabled>
                        Select type
                      </option>
                      <option value="Open Parking">Open Parking</option>
                      <option value="Covered Parking">Covered Parking</option>
                    </select>
                  </Field>
                </div>
              )}

              {!isAuction && (
              <Field label="Amenities">
                <div className="mt-1 flex flex-wrap gap-2">
                  {AMENITIES.map((amenity) => (
                    <label key={amenity} className="chip">
                      <input
                        type="checkbox"
                        name="amenities"
                        value={amenity}
                        defaultChecked={property?.amenities?.includes(amenity)}
                        className="sr-only"
                      />
                      {amenity}
                    </label>
                  ))}
                </div>
              </Field>
              )}

              <Field label="Key Highlights">
                <HighlightsInput initial={property?.highlights ?? []} />
              </Field>
                </>
              )}

              <div
                className={`grid grid-cols-1 gap-4 ${isNewLaunch ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}
              >
                <div>
                  <label className={`${labelClass} sm:min-h-10`}>
                    Thumbnail Image (Max 5 MB – 1 Image Only)
                  </label>
                  <input
                    name="thumbnail"
                    type="file"
                    accept="image/*"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={`${labelClass} sm:min-h-10`}>
                    {isAuction
                      ? "Property Images / Sale Notice PDF (Max 5 – 5 MB Each)"
                      : "Property Images (Max 5 Images – 5 MB Each)"}
                  </label>
                  <PropertyImagesInput
                    existingImages={property?.images ?? []}
                    propertyId={property?.id}
                    allowPdf={isAuction}
                  />
                </div>

                {!isNewLaunch && (
                  <div>
                    <label className={`${labelClass} sm:min-h-10`}>
                      Property Video (Max 25 MB)
                    </label>
                    <input
                      name="videos"
                      type="file"
                      accept="video/*"
                      className={inputClass}
                    />
                  </div>
                )}
              </div>

              {isEdit && hasExistingMedia && (
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Current media
                  </p>
                  <div className="mt-3 flex flex-wrap items-start gap-4">
                    {property?.thumbnail && (
                      <div>
                        <div className="group relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={property.thumbnail}
                            alt="Current thumbnail"
                            className="h-20 w-28 rounded-lg border border-zinc-200 object-cover"
                          />
                          <MediaButtons
                            propertyId={property.id}
                            field="thumbnail"
                            url={property.thumbnail}
                            accept="image/*"
                            onError={setError}
                          />
                        </div>
                        <p className="mt-1 text-center text-xs text-zinc-500">
                          Thumbnail
                        </p>
                      </div>
                    )}
                    {(property?.images.length ?? 0) > 0 && (
                      <div>
                        <div className="flex flex-wrap gap-2">
                          {property!.images.map((image) => (
                            <div key={image} className="group relative">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={image}
                                alt="Property image"
                                className="h-20 w-28 rounded-lg border border-zinc-200 object-cover"
                              />
                              <MediaButtons
                                propertyId={property!.id}
                                field="images"
                                url={image}
                                accept="image/*"
                                onError={setError}
                              />
                            </div>
                          ))}
                        </div>
                        <p className="mt-1 text-xs text-zinc-500">
                          {property!.images.length} image
                          {property!.images.length === 1 ? "" : "s"}
                        </p>
                      </div>
                    )}
                    {(property?.videos.length ?? 0) > 0 && (
                      <div>
                        <div className="group relative">
                          <video
                            src={property!.videos[0]}
                            controls
                            className="h-20 w-32 rounded-lg border border-zinc-200 object-cover"
                          />
                          <MediaButtons
                            propertyId={property!.id}
                            field="videos"
                            url={property!.videos[0]}
                            accept="video/*"
                            onError={setError}
                          />
                        </div>
                        <p className="mt-1 text-center text-xs text-zinc-500">
                          Video
                        </p>
                      </div>
                    )}
                    {property?.brochure && (
                      <div>
                        <div className="group relative">
                          <a
                            href={property.brochure}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-20 w-28 flex-col items-center justify-center gap-1 rounded-lg border border-zinc-200 bg-white text-zinc-600 transition-colors hover:border-blue-400 hover:text-blue-600"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-6 w-6"
                              aria-hidden="true"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                            <span className="text-[10px] font-semibold">
                              View PDF
                            </span>
                          </a>
                          <MediaButtons
                            propertyId={property.id}
                            field="brochure"
                            url={property.brochure}
                            accept="application/pdf,.pdf"
                            onError={setError}
                          />
                        </div>
                        <p className="mt-1 text-center text-xs text-zinc-500">
                          Brochure
                        </p>
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-xs text-zinc-500">
                    Already-uploaded media is kept unless you upload
                    replacements.
                  </p>
                </div>
              )}

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 border-t border-zinc-200 pt-4">
                <button
                  type="submit"
                  name="status"
                  value="draft"
                  formNoValidate
                  disabled={pending}
                  className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-60"
                >
                  {pending ? "Saving…" : "Save Draft"}
                </button>
                <button
                  type="submit"
                  name="status"
                  value="published"
                  disabled={pending}
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                >
                  {pending
                    ? "Saving…"
                    : !property || isDraft
                      ? "Add Property"
                      : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
