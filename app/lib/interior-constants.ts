// Shared between the public interior enquiry form, the server actions and
// the admin manager — keep this module free of server-only imports.
export const INTERIOR_PROPERTY_TYPES = [
  "1 BHK",
  "2 BHK",
  "3 BHK",
  "4+ BHK",
  "Villa / Bungalow",
  "Office",
  "Shop / Commercial",
  "Other",
] as const;

export type InteriorPropertyType =
  (typeof INTERIOR_PROPERTY_TYPES)[number];

export const INTERIOR_SCOPES = [
  "Full Home Interior",
  "Modular Kitchen",
  "Partial / Renovation",
  "Office / Commercial Fit-out",
  "Furniture & Decor Only",
  "Not Sure — Need Consultation",
] as const;

export type InteriorScope = (typeof INTERIOR_SCOPES)[number];

export const INTERIOR_BUDGETS = [
  "Under ₹2 Lakh",
  "₹2–5 Lakh",
  "₹5–10 Lakh",
  "₹10 Lakh+",
  "Not Sure",
] as const;

export const INTERIOR_STATUSES = [
  "new",
  "contacted",
  "in_discussion",
  "quote_shared",
  "closed",
  "rejected",
] as const;

export type InteriorStatus = (typeof INTERIOR_STATUSES)[number];

export const INTERIOR_STATUS_LABELS: Record<InteriorStatus, string> = {
  new: "New",
  contacted: "Contacted",
  in_discussion: "In Discussion",
  quote_shared: "Quote Shared",
  closed: "Closed",
  rejected: "Rejected",
};
