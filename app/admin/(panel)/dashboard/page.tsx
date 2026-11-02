import type { Metadata } from "next";
import { getDashboardMonthly } from "@/app/lib/stats";
import MonthlyChart from "./monthly-chart";

export const metadata: Metadata = {
  title: "Dashboard | Admin",
};

// Reads MongoDB at request time.
export const instant = false;

export default async function AdminDashboardPage() {
  const monthly = await getDashboardMonthly();

  return (
    <div>
      <MonthlyChart data={monthly} />
    </div>
  );
}
