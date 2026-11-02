// Creates the MongoDB indexes the app queries against.
// Run with: node scripts/create-indexes.mjs
import { readFileSync } from "node:fs";
import { MongoClient } from "mongodb";

// Load .env manually so stale shell env vars can't shadow it.
for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (!m || m[1] in process.env) continue; // First occurrence wins, like dotenv.
  process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set.");
  process.exit(1);
}

const client = new MongoClient(uri);
await client.connect();
const db = client.db(process.env.MONGODB_DB || undefined);

const indexes = [
  ["properties", { status: 1, listingType: 1, createdAt: -1 }],
  ["properties", { status: 1, propertyType: 1 }],
  ["properties", { status: 1, city: 1 }],
  ["enquiries", { active: 1, createdAt: -1 }],
  ["leads", { active: 1, createdAt: -1 }],
  ["blogs", { slug: 1 }],
  ["cities", { city: 1 }],
  ["employees", { managerId: 1 }],
  ["admins", { email: 1 }],
  ["sessions", { token: 1 }],
  ["visits", { day: 1 }, { unique: true }],
  ["sessions", { expiresAt: 1 }, { expireAfterSeconds: 0 }],
];

for (const [collection, spec, options] of indexes) {
  const name = await db.collection(collection).createIndex(spec, options);
  console.log(`${collection}: ${name}`);
}

await client.close();
console.log("Done.");
