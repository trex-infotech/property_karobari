import "server-only";

import { randomBytes } from "crypto";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { getDb } from "./mongodb";

const SESSION_COOKIE = "admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function createSession(adminId: ObjectId, email: string) {
  const db = await getDb();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.collection("sessions").insertOne({
    token,
    adminId,
    email,
    expiresAt,
    createdAt: new Date(),
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function getSession() {
  // Sessions are inherently request-time — also keeps the new Date()
  // expiry check below out of the prerenderer's unstable-value check.
  await connection();
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = await getDb();
  const session = await db.collection("sessions").findOne({ token });
  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await db.collection("sessions").deleteOne({ _id: session._id });
    return null;
  }

  return session;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    const db = await getDb();
    await db.collection("sessions").deleteOne({ token });
  }

  cookieStore.delete(SESSION_COOKIE);
}
