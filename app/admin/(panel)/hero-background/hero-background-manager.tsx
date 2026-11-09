"use client";

import { useRef, useState, useTransition } from "react";
import {
  removeHeroBackground,
  saveHeroBackground,
  type HeroSlot,
} from "@/app/actions/hero-background";
import type { HeroBackground } from "@/app/lib/hero-background";

const inputClass =
  "block w-full cursor-pointer rounded-lg border border-zinc-300 text-sm text-zinc-700 file:mr-4 file:border-0 file:bg-blue-50 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100";

function Overlay() {
  return (
    <div className="absolute inset-0 bg-linear-to-br from-blue-50/75 via-white/60 to-blue-100/55" />
  );
}

function HeroMock({ compact }: { compact?: boolean }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center px-4 text-center">
      <p
        className={`font-bold leading-tight text-blue-950 ${
          compact ? "text-sm" : "text-xl sm:text-2xl"
        }`}
      >
        Find a place you&apos;ll{" "}
        <span className="underline decoration-amber-400 decoration-2 underline-offset-4">
          love
        </span>{" "}
        to live
      </p>
      {!compact && (
        <>
          <p className="mt-2 text-xs text-zinc-600 sm:text-sm">
            Buy, rent, or find a PG — explore verified properties.
          </p>
          <div className="mt-4 h-9 w-full max-w-md rounded-full bg-white shadow-lg" />
        </>
      )}
    </div>
  );
}

function SlotCard({
  slot,
  title,
  hint,
  imageUrl,
  mobile,
}: {
  slot: HeroSlot;
  title: string;
  hint: string;
  imageUrl: string | null;
  mobile?: boolean;
}) {
  const [pending, startSave] = useTransition();
  const [removing, startRemove] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const busy = pending || removing;
  const shown = preview ?? imageUrl;

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
    setError(null);
    setNotice(null);
  }

  function clearPreview() {
    setPreview(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    startSave(async () => {
      const result = await saveHeroBackground(
        undefined,
        new FormData(e.currentTarget),
      );
      if (result?.success) {
        clearPreview();
        setNotice("Saved. It is now live on the homepage.");
      } else {
        setError(result?.error ?? "Something went wrong. Please try again.");
      }
    });
  }

  function handleRemove() {
    setError(null);
    setNotice(null);
    startRemove(async () => {
      const result = await removeHeroBackground(slot);
      if (result?.success) {
        clearPreview();
        setNotice("Removed.");
      } else {
        setError(result?.error ?? "Failed to remove the image.");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <p className="text-sm font-medium text-zinc-700">{title}</p>
      <p className="mt-0.5 text-xs text-zinc-500">{hint}</p>

      <div
        className={`relative mt-3 w-full overflow-hidden rounded-xl border border-zinc-200 bg-linear-to-br from-blue-50 via-white to-blue-100/60 ${
          mobile ? "mx-auto aspect-9/14 max-w-55" : "aspect-16/7"
        }`}
      >
        {shown && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-no-repeat"
              style={{ backgroundImage: `url(${shown})`, backgroundPosition: "center 45%" }}
              role="img"
              aria-label={`${title} preview`}
            />
            <Overlay />
          </>
        )}
        {!shown && (
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.12),transparent_60%)]" />
        )}
        <HeroMock compact={mobile} />
      </div>
      <p className="mt-2 text-xs text-zinc-500">
        {preview
          ? "New image preview (not saved yet)"
          : imageUrl
            ? "Current image"
            : "No image set — default design is used"}
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <input type="hidden" name="slot" value={slot} />
        <input
          ref={fileInput}
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={pickFile}
          className={inputClass}
          aria-label={`${title} file`}
        />

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
        {notice && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {notice}
          </p>
        )}

        <div className="flex justify-end gap-3 border-t border-zinc-200 pt-3">
          {imageUrl && !preview && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={busy}
              className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
            >
              {removing ? "Removing…" : "Remove"}
            </button>
          )}
          {preview && (
            <button
              type="button"
              disabled={busy}
              onClick={clearPreview}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-60"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={busy || !preview}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
          >
            {pending ? "Uploading…" : imageUrl ? "Save replacement" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function HeroBackgroundManager({
  hero,
}: {
  hero: HeroBackground;
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
        Homepage Hero Background
      </h1>
      <p className="mt-1 text-sm text-zinc-600">
        Upload images to show behind the homepage hero and navbar. Changes go
        live instantly — no redeploy required. If only one image is set, it is
        used on all devices.
      </p>

      <div className="mt-6 grid max-w-5xl gap-6 lg:grid-cols-[1.6fr_1fr]">
        <SlotCard
          slot="desktop"
          title="Desktop image"
          hint="Used on desktops, laptops and tablets. Panoramic 2560×720 works best — the image is centered at 45% height, so keep the subject mid-frame. JPG, PNG, WebP or AVIF up to 10 MB."
          imageUrl={hero.desktop}
        />
        <SlotCard
          slot="mobile"
          title="Mobile image (optional)"
          hint="Used on phones below 768px — a portrait-friendly crop works best since the sides are cropped. Falls back to the desktop image when empty."
          imageUrl={hero.mobile}
          mobile
        />
      </div>
    </div>
  );
}
