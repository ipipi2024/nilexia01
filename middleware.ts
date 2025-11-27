import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
    // Step 1: Fast cookie check - avoid DB query for anonymous users
    const sessionCookie = getSessionCookie(request);
    if (!sessionCookie) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Step 2: Secure validation - verify session is valid
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Session is valid, allow request to proceed
    return NextResponse.next();
}

// Configure which routes require authentication
export const config = {
    runtime: "nodejs",
    matcher: [
        "/dashboard/:path*", // Protect all dashboard routes
        "/api/protected/:path*", // Protect API routes under /api/protected
    ],
};
