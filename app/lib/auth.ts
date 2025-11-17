import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import clientPromise from "../lib/mongodb"; // your mongodb client
import { setupSessionCleanup } from "./session-cleanup";

const client = await clientPromise;
const db = client.db(); // Uses default database from connection string

// Setup automatic session cleanup via MongoDB TTL index
setupSessionCleanup();

export const auth = betterAuth({
    database: mongodbAdapter(db, {
        client // Optional: enables database transactions
    }),
    emailAndPassword: {
        enabled: true,
    },
    session: {
        expiresIn: 60 * 60 * 24, // 1 day in seconds
    }
});

