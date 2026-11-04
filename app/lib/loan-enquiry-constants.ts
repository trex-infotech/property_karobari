// Shared between the public loan enquiry form, the server actions and the
// admin manager — keep this module free of server-only imports.
export const LOAN_TYPES = [
  "Home Loan",
  "Commercial Loan",
  "Loan Against Property",
  "Plot Purchase Loan",
  "Home Construction Loan",
  "Home Renovation Loan",
] as const;

export type LoanType = (typeof LOAN_TYPES)[number];

export const LOAN_ENQUIRY_STATUSES = [
  "new",
  "contacted",
  "in_discussion",
  "submitted_to_bank",
  "approved",
  "rejected",
] as const;

export type LoanEnquiryStatus = (typeof LOAN_ENQUIRY_STATUSES)[number];

export const LOAN_ENQUIRY_STATUS_LABELS: Record<LoanEnquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  in_discussion: "In Discussion",
  submitted_to_bank: "Submitted to Bank",
  approved: "Approved",
  rejected: "Rejected",
};
