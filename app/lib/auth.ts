import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import clientPromise from "../lib/mongodb"; // your mongodb client

const client = await clientPromise;
const db = client.db(); // Uses default database from connection string

export const auth = betterAuth({
    database: mongodbAdapter(db, {
        client // Optional: enables database transactions
    }),
    emailAndPassword: {
        enabled: true,
    },
});

