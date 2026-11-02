import "server-only";

import { connection } from "next/server";
import { getDb } from "./mongodb";

export type MonthlyPoint = {
  label: string;
  visitors: number;
  properties: number;
  leads: number;
};

export async function getDashboardMonthly(): Promise<MonthlyPoint[]> {
  await connection();
  const db = await getDb();

  const now = new Date();
  const months: { key: string; label: string }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: `${d
        .toLocaleString("en-US", { month: "short" })
        .toLowerCase()} '${String(d.getFullYear()).slice(2)}`,
    });
  }
  const sinceDate = new Date(`${months[0].key}-01T00:00:00.000Z`);

  const countByMonth = async (collection: string, field: string) => {
    const rows = await db
      .collection(collection)
      .aggregate<{ _id: string; n: number }>([
        { $match: { [field]: { $gte: sinceDate } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: `$${field}` } },
            n: { $sum: 1 },
          },
        },
      ])
      .toArray();
    return new Map(rows.map((r) => [r._id, r.n]));
  };

  const [properties, leads, visitRows] = await Promise.all([
    countByMonth("properties", "createdAt"),
    countByMonth("leads", "createdAt"),
    db
      .collection("visits")
      .aggregate<{ _id: string; n: number }>([
        { $match: { day: { $gte: months[0].key + "-01" } } },
        { $group: { _id: { $substr: ["$day", 0, 7] }, n: { $sum: "$count" } } },
      ])
      .toArray(),
  ]);
  const visits = new Map(visitRows.map((r) => [r._id, r.n]));

  return months.map((m) => ({
    label: m.label,
    visitors: visits.get(m.key) ?? 0,
    properties: properties.get(m.key) ?? 0,
    leads: leads.get(m.key) ?? 0,
  }));
}

