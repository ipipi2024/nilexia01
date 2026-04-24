import { MongoClient } from "mongodb";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually (no dotenv dependency needed)
const envPath = resolve(__dirname, "../.env");
const envVars = readFileSync(envPath, "utf-8")
  .split("\n")
  .filter((line) => line.includes("=") && !line.startsWith("#"))
  .forEach((line) => {
    const [key, ...rest] = line.split("=");
    process.env[key.trim()] = rest.join("=").trim();
  });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI not found in .env");
  process.exit(1);
}

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db();

  const result = await db.collection("user").updateMany(
    { ndaAcceptedAt: { $exists: true } },
    { $rename: { ndaAcceptedAt: "termsAcceptedAt" } }
  );

  console.log(`Migration complete: ${result.modifiedCount} user(s) updated.`);
} finally {
  await client.close();
}
