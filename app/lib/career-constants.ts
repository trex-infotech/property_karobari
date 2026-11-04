// Shared between the public career form, the server actions and the
// admin manager — keep this module free of server-only imports.
export const CAREER_POSITIONS = [
  "Sales Executive",
  "Senior Sales Executive",
  "Team Leader",
  "Relationship Manager",
  "Telecaller",
  "Digital Marketing",
  "Operations / Admin",
  "Other",
] as const;

export type CareerPosition = (typeof CAREER_POSITIONS)[number];

export const EXPERIENCE_OPTIONS = [
  "Fresher",
  "0-1 years",
  "1-3 years",
  "3-5 years",
  "5+ years",
] as const;

export const CAREER_STATUSES = [
  "new",
  "under_review",
  "shortlisted",
  "rejected",
] as const;

export type CareerStatus = (typeof CAREER_STATUSES)[number];

export const CAREER_STATUS_LABELS: Record<CareerStatus, string> = {
  new: "New",
  under_review: "Under Review",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
};

export const MAX_RESUME_MB = 5;
