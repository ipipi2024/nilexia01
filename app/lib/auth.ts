import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import client from "../lib/mongodb";
import { ensureSessionCleanupRunsOnce } from "./session-cleanup";
import { sendEmail } from "./email";

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
        requireEmailVerification: true, // Users must verify email before they can sign in
        autoSignIn: false // Disabled because we require email verification first
    },
    emailVerification: {
        sendOnSignUp: true, // Automatically send verification email when user signs up
        autoSignInAfterVerification: true, // Auto sign in user after they verify their email
        sendVerificationEmail: async ({ user, url }) => {
            await sendEmail({
                to: user.email,
                subject: "Verify your email address",
                text: `Hello! Please verify your email address by clicking the link below:\n\n${url}\n\nThis link will expire in 1 hour.\n\nIf you didn't create an account, you can safely ignore this email.`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>Verify your email address</h2>
                        <p>Hello!</p>
                        <p>Please verify your email address by clicking the button below:</p>
                        <a href="${url}" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 16px 0;">Verify Email</a>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="color: #666; word-break: break-all;">${url}</p>
                        <p style="color: #666; font-size: 14px; margin-top: 32px;">This link will expire in 1 hour.</p>
                        <p style="color: #666; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
                    </div>
                `
            });
        },
        expiresIn: 3600 // Verification token expires in 1 hour (3600 seconds)
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 day in seconds
    },
    trustedOrigins: process.env.NODE_ENV === "production"
        ? [process.env.BETTER_AUTH_URL || "https://yourdomain.com"]
        : ["http://localhost:3000"]
});

