import type { Metadata } from "next";
import { getEmployees } from "@/app/lib/employees";
import { getAllReferrals } from "@/app/lib/referrals";
import ReferralManager from "./referral-manager";

export const metadata: Metadata = {
  title: "Referrals | Admin",
};

// Reads MongoDB at request time.
export const instant = false;

export default async function AdminReferralsPage() {
  const [referrals, employees] = await Promise.all([
    getAllReferrals(),
    getEmployees(),
  ]);
  return <ReferralManager referrals={referrals} employees={employees} />;
}
