import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";

export async function POST() {
  try {
    const db = await getDb();
    const day = new Date().toISOString().slice(0, 10);
    await db
      .collection("visits")
      .updateOne({ day }, { $inc: { count: 1 } }, { upsert: true });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
