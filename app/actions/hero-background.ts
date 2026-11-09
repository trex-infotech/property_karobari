"use server";

import { revalidatePath, updateTag } from "next/cache";
import { isSuperAdmin } from "@/app/lib/admin-access";
import { HERO_SETTINGS_ID, heroSettings } from "@/app/lib/hero-background";
import { getDb } from "@/app/lib/mongodb";
import { deleteFromS3, uploadFileToS3 } from "@/app/lib/s3";

export type HeroBackgroundState =
  | { success?: boolean; error?: string }
  | undefined;

export type HeroSlot = "desktop" | "mobile";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
const S3_PREFIX = "hero";

function fieldFor(slot: HeroSlot) {
  return slot === "mobile" ? "mobileImageUrl" : "imageUrl";
}

function revalidate() {
  updateTag("hero-background");
  revalidatePath("/");
  revalidatePath("/admin/hero-background");
}

export async function saveHeroBackground(
  _prevState: HeroBackgroundState,
  formData: FormData,
): Promise<HeroBackgroundState> {
  if (!(await isSuperAdmin())) return { error: "Not authorized." };

  const slot: HeroSlot = formData.get("slot") === "mobile" ? "mobile" : "desktop";
  const field = fieldFor(slot);

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose an image to upload." };
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return { error: "Only JPG, PNG, WebP or AVIF images are allowed." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { error: "Image must not exceed 10 MB." };
  }

  try {
    const db = await getDb();
    const existing = await heroSettings(db).findOne({ _id: HERO_SETTINGS_ID });
    const oldUrl = existing?.[field];

    const imageUrl = await uploadFileToS3(file, S3_PREFIX);
    await deleteFromS3(typeof oldUrl === "string" ? oldUrl : null, S3_PREFIX);

    await heroSettings(db).updateOne(
      { _id: HERO_SETTINGS_ID },
      { $set: { [field]: imageUrl, updatedAt: new Date() } },
      { upsert: true },
    );
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to save the image.",
    };
  }

  revalidate();
  return { success: true };
}

export async function removeHeroBackground(
  slot: HeroSlot,
): Promise<HeroBackgroundState> {
  if (!(await isSuperAdmin())) return { error: "Not authorized." };
  const field = fieldFor(slot);

  try {
    const db = await getDb();
    const existing = await heroSettings(db).findOne({ _id: HERO_SETTINGS_ID });
    const oldUrl = existing?.[field];

    await deleteFromS3(typeof oldUrl === "string" ? oldUrl : null, S3_PREFIX);

    const otherField = slot === "mobile" ? "imageUrl" : "mobileImageUrl";
    if (existing && typeof existing[otherField] === "string" && existing[otherField]) {
      await heroSettings(db).updateOne(
        { _id: HERO_SETTINGS_ID },
        { $unset: { [field]: "" }, $set: { updatedAt: new Date() } },
      );
    } else {
      await heroSettings(db).deleteOne({ _id: HERO_SETTINGS_ID });
    }
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to remove the image.",
    };
  }

  revalidate();
  return { success: true };
}
