import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
    // Get the session (middleware already validated it exists)
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    // Return user data
    return NextResponse.json({
        user: session.user,
        session: {
            expiresAt: session.session.expiresAt,
            createdAt: session.session.createdAt,
        }
    });
}
