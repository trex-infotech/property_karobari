import "server-only";

import { getDb } from "./mongodb";

const DEFAULT_WINDOW_MS = 24 * 60 * 60 * 1000;

// Returns true when a matching document already exists inside the window —
// used to block accidental double-submits and repeat spam.
export async function hasRecentSubmission(
  collection: string,
  filter: Record<string, unknown>,
  windowMs = DEFAULT_WINDOW_MS,
): Promise<boolean> {
  const db = await getDb();
  const count = await db.collection(collection).countDocuments({
    ...filter,
    createdAt: { $gte: new Date(Date.now() - windowMs) },
  });
  return count > 0;
}
