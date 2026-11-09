import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isSuperAdmin } from "@/app/lib/admin-access";
import { getHeroBackground } from "@/app/lib/hero-background";
import HeroBackgroundManager from "./hero-background-manager";

export const metadata: Metadata = {
  title: "Hero Background | Admin",
};

// Reads MongoDB at request time.
export const instant = false;

export default async function AdminHeroBackgroundPage() {
  if (!(await isSuperAdmin())) redirect("/admin/dashboard");
  const hero = await getHeroBackground();
  return <HeroBackgroundManager hero={hero} />;
}
