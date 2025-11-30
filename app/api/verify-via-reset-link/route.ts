import { ObjectId } from "mongodb";
import client from "@/app/lib/mongodb";
import { NextResponse } from "next/server";

const db = client.db();

export async function POST(req: Request) {
    try {
        const { token } = await req.json();

        if (!token) {
            return NextResponse.json(
                { error: "Token is required" },
                { status: 400 }
            );
        }

        // Query the verification table to validate the token
        // Better Auth stores password reset tokens with identifier format: "reset-password:{token}"
        // The value field contains the user ID
        const verification = await db.collection("verification").findOne({
            identifier: `reset-password:${token}`,
            expiresAt: { $gt: new Date() } // Token must not be expired
        });

        if (!verification) {
            return NextResponse.json(
                { error: "Invalid or expired token" },
                { status: 400 }
            );
        }

        // The value field contains the user ID
        const userId = verification.value;

        if (!userId) {
            return NextResponse.json(
                { error: "Invalid token data" },
                { status: 400 }
            );
        }

        // Mark email as verified since the user clicked the reset link
        // This proves they have access to the email inbox
        await db.collection("user").updateOne(
            { _id: new ObjectId(userId) },
            { $set: { emailVerified: true } }
        );

        return NextResponse.json({
            success: true,
            message: "Email verified via reset link"
        });
    } catch (err: any) {
        console.error("Error verifying email via reset link:", err);
        return NextResponse.json(
            { error: err.message || "Failed to verify email" },
            { status: 500 }
        );
    }
}
