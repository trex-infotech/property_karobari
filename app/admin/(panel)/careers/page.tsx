import type { Metadata } from "next";
import { getAllCareerApplications } from "@/app/lib/careers";
import { getEmployees } from "@/app/lib/employees";
import CareerManager from "./career-manager";

export const metadata: Metadata = {
  title: "Career Applications | Admin",
};

// Reads MongoDB at request time.
export const instant = false;

export default async function AdminCareersPage() {
  const [applications, employees] = await Promise.all([
    getAllCareerApplications(),
    getEmployees(),
  ]);
  return <CareerManager applications={applications} employees={employees} />;
}
