import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { getDb } from "./mongodb";

export const HERO_SETTINGS_ID = "homepage_hero";

export type HeroSettingsDoc = {
  _id: string;
  imageUrl?: string;
  mobileImageUrl?: string;
};

export type HeroBackground = {
  desktop: string | null;
  mobile: string | null;
};

export function heroSettings(db: Awaited<ReturnType<typeof getDb>>) {
  return db.collection<HeroSettingsDoc>("site_settings");
}

export async function getHeroBackground(): Promise<HeroBackground> {
  "use cache";
  cacheTag("hero-background");
  cacheLife("hours");
  const db = await getDb();
  const doc = await heroSettings(db).findOne({ _id: HERO_SETTINGS_ID });
  return {
    desktop: typeof doc?.imageUrl === "string" && doc.imageUrl ? doc.imageUrl : null,
    mobile:
      typeof doc?.mobileImageUrl === "string" && doc.mobileImageUrl
        ? doc.mobileImageUrl
        : null,
  };
}
