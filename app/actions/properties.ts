"use server";

import { ObjectId } from "mongodb";
import { revalidatePath, updateTag } from "next/cache";
import { getDb } from "@/app/lib/mongodb";
import { deleteFromS3, uploadFilesToS3 } from "@/app/lib/s3";
import { getSession } from "@/app/lib/session";

export type CreatePropertyState =
  | { success?: boolean; error?: string }
  | undefined;

const S3_PREFIX = "properties";

const MAX_THUMBNAIL_MB = 5;
const MAX_IMAGES = 5;
const MAX_IMAGE_MB = 5;
const MAX_VIDEO_MB = 25;
const MAX_BROCHURE_MB = 25;

function mediaFiles(formData: FormData, key: string): File[] {
  return formData
    .getAll(key)
    .filter((f): f is File => f instanceof File && f.size > 0);
}

const FILE_SIZE_ERROR = "File size must not exceed 5 MB.";

function validateMediaFiles(formData: FormData): string | null {
  const thumbnail = mediaFiles(formData, "thumbnail");
  if (thumbnail.length > 1) {
    return "Only one thumbnail image can be uploaded.";
  }
  if (thumbnail.some((f) => f.size > MAX_THUMBNAIL_MB * 1024 * 1024)) {
    return FILE_SIZE_ERROR;
  }

  const images = mediaFiles(formData, "images");
  if (images.length > MAX_IMAGES) {
    return `You can upload up to ${MAX_IMAGES} property images.`;
  }
  if (images.some((f) => f.size > MAX_IMAGE_MB * 1024 * 1024)) {
    return FILE_SIZE_ERROR;
  }

  const videos = mediaFiles(formData, "videos");
  if (videos.length > 1) {
    return "Only one video can be uploaded.";
  }
  if (videos.some((f) => f.size > MAX_VIDEO_MB * 1024 * 1024)) {
    return `Video exceeds the ${MAX_VIDEO_MB}MB limit.`;
  }

  const brochures = mediaFiles(formData, "brochure");
  if (brochures.length > 1) {
    return "Only one brochure can be uploaded.";
  }
  if (brochures.some((f) => f.type !== "application/pdf")) {
    return "Project brochure must be a PDF file.";
  }
  if (brochures.some((f) => f.size > MAX_BROCHURE_MB * 1024 * 1024)) {
    return `Brochure exceeds the ${MAX_BROCHURE_MB}MB limit.`;
  }

  return null;
}

async function saveFiles(files: File[]): Promise<string[]> {
  return uploadFilesToS3(files, S3_PREFIX);
}

function parsePropertyForm(formData: FormData) {
  const str = (key: string) => String(formData.get(key) ?? "").trim();
  const num = (key: string) => {
    const value = str(key);
    return value === "" ? null : Number(value);
  };

  const listingType = str("listingType");
  const isNewLaunch = listingType === "new_launch";
  const isAuction = listingType === "auction";
  const parkingAvailable = str("parkingAvailable") === "yes";

  return {
    listingType,
    isNewLaunch,
    status: str("status") === "draft" ? "draft" : "published",
    societyName: str("societyName"),
    price: isNewLaunch
      ? num("startingFrom")
      : isAuction
        ? num("reservePrice")
        : num("price"),
    propertyType: str("propertyType") || null,
    floor: num("floor"),
    totalFloors: num("totalFloors"),
    bedrooms: str("bedrooms") || null,
    area: num("area"),
    areaUnit: str("areaUnit") || null,
    constructionStatus: str("constructionStatus") || null,
    transactionType: str("transactionType") || null,
    reraNumber: str("reraNumber") || null,
    builderName: str("builderName") || null,
    saleStatus: str("saleStatus") || null,
    deposit: num("deposit"),
    address: str("address") || null,
    city: str("city") || null,
    location: str("location") || null,
    furnishing: str("furnishing") || null,
    buildingAge: str("buildingAge") || null,
    facing: str("facing") || null,
    parking: parkingAvailable
      ? {
          available: true,
          count: num("parkingCount"),
          type: str("parkingType") || null,
        }
      : { available: false, count: null, type: null },
    amenities: formData
      .getAll("amenities")
      .filter((a): a is string => typeof a === "string"),
    highlights: formData
      .getAll("highlights")
      .filter((a): a is string => typeof a === "string")
      .map((a) => a.trim())
      .filter(Boolean),
    availableFor: formData
      .getAll("availableFor")
      .filter((a): a is string => typeof a === "string"),
    pgServices: formData
      .getAll("pgServices")
      .filter((a): a is string => typeof a === "string"),
    sharingOption: str("sharingOption") || null,
    totalCapacity: str("totalCapacity") || null,
    possessionIn: str("possessionIn") || null,
    suitableFor: str("suitableFor") || null,
    leaseAmount: num("leaseAmount"),
    rentalYield: num("rentalYield"),
    totalLeaseTenure: str("totalLeaseTenure") || null,
    balanceLeaseTenure: str("balanceLeaseTenure") || null,
    tenantType: str("tenantType") || null,
    possessionType: str("possessionType") || null,
    reservePrice: num("reservePrice"),
    emdAmount: num("emdAmount"),
    emdDate: str("emdDate") || null,
    inspectionDate: str("inspectionDate") || null,
    bankName: str("bankName") || null,
  };
}

function validateProperty(parsed: ReturnType<typeof parsePropertyForm>) {
  if (
    !["sale", "rent", "pg", "new_launch", "preleased", "auction"].includes(
      parsed.listingType,
    )
  ) {
    return "Please choose a listing type.";
  }
  // Drafts may be incomplete — only enforce title/price on publish.
  if (parsed.status === "published") {
    if (!parsed.societyName) {
      return "Society / project name is required.";
    }
    if (parsed.price === null || Number.isNaN(parsed.price) || parsed.price < 0) {
      return parsed.isNewLaunch
        ? "Please enter a valid starting price."
        : "Please enter a valid price.";
    }
    if (
      parsed.transactionType === "Builder" &&
      parsed.constructionStatus === "Under Construction" &&
      !parsed.reraNumber
    ) {
      return "RERA registration number is required.";
    }
  }
  return null;
}

export async function createProperty(
  formData: FormData,
): Promise<CreatePropertyState> {
  const session = await getSession();
  if (!session) {
    return { error: "Unauthorized. Please sign in again." };
  }

  const parsed = parsePropertyForm(formData);
  const validationError = validateProperty(parsed);
  if (validationError) return { error: validationError };

  const mediaError = validateMediaFiles(formData);
  if (mediaError) return { error: mediaError };

  const db = await getDb();

  try {
    await db.collection("properties").insertOne({
      ...parsed,
      thumbnail:
        (
          await saveFiles(
            formData
              .getAll("thumbnail")
              .filter((f): f is File => f instanceof File),
          )
        )[0] ?? null,
      images: await saveFiles(
        formData.getAll("images").filter((f): f is File => f instanceof File),
      ),
      videos: await saveFiles(
        formData.getAll("videos").filter((f): f is File => f instanceof File),
      ),
      brochure: parsed.isNewLaunch
        ? (
            await saveFiles(
              formData
                .getAll("brochure")
                .filter((f): f is File => f instanceof File),
            )
          )[0] ?? null
        : null,
      createdBy: session.adminId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to save property.",
    };
  }

  updateTag("properties");
  revalidatePath("/admin/properties");
  return { success: true };
}

export async function deletePropertyMedia(input: {
  propertyId: string;
  field: "thumbnail" | "images" | "videos" | "brochure";
  url: string;
}): Promise<CreatePropertyState> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized. Please sign in again." };
  if (!ObjectId.isValid(input.propertyId) || !input.url) {
    return { error: "Invalid request." };
  }

  const db = await getDb();
  const propertyId = new ObjectId(input.propertyId);
  const existing = await db
    .collection("properties")
    .findOne({ _id: propertyId });
  if (!existing) return { error: "Property not found." };

  const set: Record<string, unknown> = { updatedAt: new Date() };
  if (input.field === "thumbnail" || input.field === "brochure") {
    set[input.field] = null;
  } else {
    const items = Array.isArray(existing[input.field])
      ? (existing[input.field] as string[])
      : [];
    set[input.field] = items.filter((u) => u !== input.url);
  }

  await db
    .collection("properties")
    .updateOne({ _id: propertyId }, { $set: set });

  try {
    await deleteFromS3(input.url, S3_PREFIX);
  } catch {
    // Old object cleanup is best-effort.
  }

  updateTag("properties");
  revalidatePath("/admin/properties");
  return { success: true };
}

export async function replacePropertyMedia(input: {
  propertyId: string;
  field: "thumbnail" | "images" | "videos" | "brochure";
  url: string;
  file: File;
}): Promise<CreatePropertyState> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized. Please sign in again." };
  if (!ObjectId.isValid(input.propertyId)) {
    return { error: "Invalid property." };
  }

  const limitMb =
    input.field === "videos"
      ? MAX_VIDEO_MB
      : input.field === "brochure"
        ? MAX_BROCHURE_MB
        : MAX_IMAGE_MB;
  if (input.field === "brochure" && input.file.type !== "application/pdf") {
    return { error: "Project brochure must be a PDF file." };
  }
  if (input.file.size > limitMb * 1024 * 1024) {
    return {
      error:
        input.field === "thumbnail" || input.field === "images"
          ? FILE_SIZE_ERROR
          : `File exceeds the ${limitMb}MB limit.`,
    };
  }

  const db = await getDb();
  const propertyId = new ObjectId(input.propertyId);
  const existing = await db
    .collection("properties")
    .findOne({ _id: propertyId });
  if (!existing) return { error: "Property not found." };

  let newUrl: string | undefined;
  try {
    [newUrl] = await saveFiles([input.file]);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Upload failed.",
    };
  }
  if (!newUrl) return { error: "Upload failed — please try again." };

  const set: Record<string, unknown> = { updatedAt: new Date() };
  if (input.field === "thumbnail" || input.field === "brochure") {
    set[input.field] = newUrl;
  } else if (input.field === "videos") {
    set.videos = [newUrl];
  } else {
    const images = Array.isArray(existing.images) ? existing.images : [];
    set.images = images.map((u: unknown) => (u === input.url ? newUrl : u));
  }

  await db
    .collection("properties")
    .updateOne({ _id: propertyId }, { $set: set });

  try {
    await deleteFromS3(input.url, S3_PREFIX);
  } catch {
    // Old object cleanup is best-effort.
  }

  updateTag("properties");
  revalidatePath("/admin/properties");
  return { success: true };
}

export async function deleteProperty(
  _prevState: CreatePropertyState,
  formData: FormData,
): Promise<CreatePropertyState> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized. Please sign in again." };

  const id = String(formData.get("id") ?? "");
  if (!ObjectId.isValid(id)) return { error: "Invalid property." };

  const db = await getDb();
  const propertyId = new ObjectId(id);
  const existing = await db
    .collection("properties")
    .findOne({ _id: propertyId });
  if (!existing) return { error: "Property not found." };

  const mediaUrls = [
    existing.thumbnail,
    ...(Array.isArray(existing.images) ? existing.images : []),
    ...(Array.isArray(existing.videos) ? existing.videos : []),
    existing.brochure,
  ].filter((u): u is string => typeof u === "string" && u.length > 0);

  await db.collection("properties").deleteOne({ _id: propertyId });

  // Remove every uploaded object — best-effort, local /uploads paths are skipped.
  await Promise.allSettled(
    mediaUrls.map((url) => deleteFromS3(url, S3_PREFIX)),
  );

  updateTag("properties");
  revalidatePath("/admin/properties");
  return { success: true };
}

export async function updateProperty(input: {
  propertyId: string;
  formData: FormData;
}): Promise<CreatePropertyState> {
  const session = await getSession();
  if (!session) {
    return { error: "Unauthorized. Please sign in again." };
  }
  if (!ObjectId.isValid(input.propertyId)) {
    return { error: "Invalid property." };
  }

  const parsed = parsePropertyForm(input.formData);
  const validationError = validateProperty(parsed);
  if (validationError) return { error: validationError };

  const mediaError = validateMediaFiles(input.formData);
  if (mediaError) return { error: mediaError };

  const db = await getDb();
  const propertyId = new ObjectId(input.propertyId);
  const existing = await db
    .collection("properties")
    .findOne({ _id: propertyId });
  if (!existing) {
    return { error: "Property not found." };
  }

  // Newly selected images append to the ones already stored —
  // check the merged total before uploading anything.
  const pickedImages = mediaFiles(input.formData, "images");
  if (
    (Array.isArray(existing.images) ? existing.images.length : 0) +
      pickedImages.length >
    MAX_IMAGES
  ) {
    return { error: `You can have up to ${MAX_IMAGES} property images.` };
  }

  try {
    const newThumbnail = (
      await saveFiles(
        input.formData
          .getAll("thumbnail")
          .filter((f): f is File => f instanceof File),
      )
    )[0];
    const newImages = await saveFiles(
      input.formData.getAll("images").filter((f): f is File => f instanceof File),
    );
    const newVideos = await saveFiles(
      input.formData.getAll("videos").filter((f): f is File => f instanceof File),
    );
    const newBrochure = (
      await saveFiles(
        input.formData
          .getAll("brochure")
          .filter((f): f is File => f instanceof File),
      )
    )[0];

    const mergedImages = [
      ...(Array.isArray(existing.images) ? existing.images : []),
      ...newImages,
    ];

    await db.collection("properties").updateOne(
      { _id: propertyId },
      {
        $set: {
          ...parsed,
          thumbnail: newThumbnail ?? (existing.thumbnail ?? null),
          images: mergedImages,
          videos: newVideos.length > 0 ? newVideos : (existing.videos ?? []),
          brochure: parsed.isNewLaunch
            ? (newBrochure ?? (existing.brochure ?? null))
            : null,
          status: parsed.status,
          updatedAt: new Date(),
        },
      },
    );
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to update property.",
    };
  }

  updateTag("properties");
  revalidatePath("/admin/properties");
  return { success: true };
}
