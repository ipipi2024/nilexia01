import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import client from "../lib/mongodb";
import { setupSessionCleanup } from "./session-cleanup";

// Get database instance (connection happens lazily on first operation)
const db = client.db(); // Uses default database from connection string

// Setup automatic session cleanup via MongoDB TTL index
// This runs in the background, won't block module loading
setupSessionCleanup();

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
    trustedOrigins: ["http://localhost:3000"]
});

