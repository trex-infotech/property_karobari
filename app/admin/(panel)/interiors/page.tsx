import type { Metadata } from "next";
import { getEmployees } from "@/app/lib/employees";
import { getAllInteriorEnquiries } from "@/app/lib/interior-enquiries";
import InteriorManager from "./interior-manager";

export const metadata: Metadata = {
  title: "Interior Enquiries | Admin",
};

// Reads MongoDB at request time.
export const instant = false;

export default async function AdminInteriorsPage() {
  const [enquiries, employees] = await Promise.all([
    getAllInteriorEnquiries(),
    getEmployees(),
  ]);
  return <InteriorManager enquiries={enquiries} employees={employees} />;
}
