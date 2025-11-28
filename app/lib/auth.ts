import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import client from "../lib/mongodb";
import { ensureSessionCleanupRunsOnce } from "./session-cleanup";

// Get database instance (connection happens lazily on first operation)
const db = client.db(); // Uses default database from connection string

// Setup automatic session cleanup via MongoDB TTL index
// We intentionally do NOT await this; it can run in the background.
ensureSessionCleanupRunsOnce();

export const auth = betterAuth({
    database: mongodbAdapter(db, {
        client // Optional: enables database transactions
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true //set by default by better auth
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 day in seconds
    },
    trustedOrigins: process.env.NODE_ENV === "production"
        ? [process.env.BETTER_AUTH_URL || "https://yourdomain.com"]
        : ["http://localhost:3000"]
});

