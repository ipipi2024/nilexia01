import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
    const isApiRoute = request.nextUrl.pathname.startsWith("/api/");

    // Step 1: Fast cookie check - avoid DB query for anonymous users
    const sessionCookie = getSessionCookie(request);
    if (!sessionCookie) {
        // API routes: return 401 JSON response
        if (isApiRoute) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        // Page routes: redirect to login
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Step 2: Secure validation - verify session is valid
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session) {
        // API routes: return 401 JSON response
        if (isApiRoute) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        // Page routes: redirect to login
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
