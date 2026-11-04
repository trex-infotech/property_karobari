// Shared between the public referral form, the server actions and the
// admin manager — keep this module free of server-only imports.
export const REQUIREMENT_TYPES = [
  "Buy",
  "Rent",
  "PG",
  "Preleased",
  "New Launch",
  "Interior",
  "Other",
] as const;

export type RequirementType = (typeof REQUIREMENT_TYPES)[number];

export const REFERRAL_STATUSES = [
  "new",
  "contacted",
  "converted",
  "rewarded",
  "rejected",
] as const;

export type ReferralStatus = (typeof REFERRAL_STATUSES)[number];

export const REFERRAL_STATUS_LABELS: Record<ReferralStatus, string> = {
  new: "New",
  contacted: "Contacted",
  converted: "Converted",
  rewarded: "Rewarded",
  rejected: "Rejected",
};
