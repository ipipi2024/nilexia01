import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/app/lib/auth";

// Routes that don't require authentication
const publicRoutes = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/api/verify-via-reset-link",
];

/**
 * Check if a pathname matches the public routes
 */
function isPublicRoute(pathname: string): boolean {
  // Check exact matches
  if (publicRoutes.includes(pathname)) {
    return true;
  }

  // Check if it's a Better Auth endpoint
  if (pathname.startsWith("/api/auth/")) {
    return true;
  }

  return false;
}

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow public routes through
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // All other routes require authentication
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // If no valid session, redirect to login
    if (!session?.user) {
      // Redirect all routes (both pages and API) to login with returnUrl
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // User is authenticated, allow the request to continue
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware auth error:", error);

    // On error, treat as unauthenticated and redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

// Configure which routes the proxy should run on
export const config = {
  matcher: [
    // Match all paths except:
    // - _next/* (Next.js internals)
    // - favicon.ico, other static files
    // - api/* (API routes handle their own auth)
    "/((?!api|_next|favicon.ico).*)",
  ],
};
