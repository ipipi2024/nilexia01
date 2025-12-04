import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import client from "../lib/mongodb";
import { ensureSessionCleanupRunsOnce } from "./session-cleanup";
import { ensureListingIndexesRunOnce } from "./listing-init";
import { ensureMessageIndexesRunOnce } from "./message-init";
import { sendEmail } from "./email";
import { ObjectId } from "mongodb";
import { APIError } from "better-auth/api";

// Get database instance (connection happens lazily on first operation)
const db = client.db(); // Uses default database from connection string

// Setup automatic session cleanup via MongoDB TTL index
// We intentionally do NOT await this; it can run in the background.
ensureSessionCleanupRunsOnce();

// Setup listing collection indexes
// We intentionally do NOT await this; it can run in the background.
ensureListingIndexesRunOnce();

// Setup message collection indexes
// We intentionally do NOT await this; it can run in the background.
ensureMessageIndexesRunOnce();

// Allowed email domains for Florida Tech community
const ALLOWED_DOMAINS = ["@fit.edu", "@my.fit.edu"];

export const auth = betterAuth({
    database: mongodbAdapter(db, {
        client // Optional: enables database transactions
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true, // Users must verify email before they can sign in
        autoSignIn: false, // Disabled because we require email verification first
        resetPasswordTokenExpiresIn: 300, // 5 minutes - reduced from default 1 hour for security
        sendResetPassword: async ({ user, url }) => {
            await sendEmail({
                to: user.email,
                subject: "Reset your password",
                text: `Hello! You requested to reset your password. Click the link below to reset your password:\n\n${url}\n\nThis link will expire in 5 minutes.\n\nIf you didn't request a password reset, you can safely ignore this email.`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>Reset your password</h2>
                        <p>Hello!</p>
                        <p>You requested to reset your password. Click the button below to reset your password:</p>
                        <a href="${url}" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 16px 0;">Reset Password</a>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="color: #666; word-break: break-all;">${url}</p>
                        <p style="color: #666; font-size: 14px; margin-top: 32px;">This link will expire in 5 minutes.</p>
                        <p style="color: #666; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email.</p>
                    </div>
                `
            });
        },
        onPasswordReset: async ({ user }) => {
            // NOTE: Email is now verified on reset link CLICK (not on password submit)
            // This hook still runs as a safety measure, but email should already be verified
            // by the time this hook fires (see /api/verify-via-reset-link)
            //
            // MODEL 1: Email Verified on Reset Link Click
            // - Link click proves inbox ownership (primary verification point)
            // - Password submit is a separate action (updates password only)
            // This is more logically consistent than verifying only on password submit
            console.log("onPasswordReset fired for user:", user.id);

            // Keep this as a safety measure in case verification API failed
            await db.collection("user").updateOne(
                { _id: new ObjectId(user.id) },
                { $set: { emailVerified: true } }
            );
        }
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
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    const email = user.email?.toLowerCase() ?? "";

                    // Check if email ends with allowed domains
                    const isAllowedDomain = ALLOWED_DOMAINS.some(domain =>
                        email.endsWith(domain)
                    );

                    if (!isAllowedDomain) {
                        // Throw custom error with helpful message
                        throw new APIError("UNAUTHORIZED", {
                            message: "Only Florida Tech email addresses (@fit.edu or @my.fit.edu) are allowed to register."
                        });
                    }

                    // If validation passes, allow user creation to proceed (return void)
                },
            },
        },
    },
    trustedOrigins: process.env.NODE_ENV === "production"
        ? [process.env.BETTER_AUTH_URL || "https://yourdomain.com"]
        : ["http://localhost:3000"]
});

