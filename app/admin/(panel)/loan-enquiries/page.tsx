import type { Metadata } from "next";
import { getEmployees } from "@/app/lib/employees";
import { getAllLoanEnquiries } from "@/app/lib/loan-enquiries";
import LoanEnquiryManager from "./loan-enquiry-manager";

export const metadata: Metadata = {
  title: "Loan Enquiries | Admin",
};

// Reads MongoDB at request time.
export const instant = false;

export default async function AdminLoanEnquiriesPage() {
  const [enquiries, employees] = await Promise.all([
    getAllLoanEnquiries(),
    getEmployees(),
  ]);
  return <LoanEnquiryManager enquiries={enquiries} employees={employees} />;
}
