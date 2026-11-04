// Shared between the public feedback form, the server actions and the
// admin manager — keep this module free of server-only imports.
export const FEEDBACK_CATEGORIES = [
  "Website Experience",
  "Property Listings",
  "Search & Filters",
  "Enquiry Process",
  "Customer Support",
  "Suggestions",
  "Complaints",
  "Other",
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export const FEEDBACK_STATUSES = [
  "new",
  "in_progress",
  "resolved",
  "rejected",
] as const;

export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  new: "New",
  in_progress: "In Progress",
  resolved: "Resolved",
  rejected: "Rejected",
};

export const MIN_RATING = 1;
export const MAX_RATING = 5;
export const MAX_ATTACHMENTS = 3;
export const MAX_ATTACHMENT_MB = 5;
