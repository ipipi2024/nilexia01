# Security Implementation Guide

This document explains the multi-layer authentication and authorization protection implemented in this application using Better Auth.

## Overview: Defense-in-Depth Strategy

We implement **three layers of security** to protect routes and API endpoints:

```
Layer 1: Middleware (Fast Check)
    ↓
Layer 2: Page/Route Validation (Server-side)
    ↓
Layer 3: Protected Data Access
```

---

## Layer 1: Middleware Protection

**File:** `middleware.ts`

### What it does:
- Intercepts all requests to protected routes
- Performs hybrid validation (cookie check + full session validation)
- Redirects unauthorized users to `/login`

### Protected Routes:
```ts
matcher: [
    "/dashboard/:path*",        // All dashboard pages
    "/api/protected/:path*",    // Protected API routes
]
```

### How it works:
```ts
// Step 1: Fast cookie check (avoids DB query for anonymous users)
const sessionCookie = getSessionCookie(request);
if (!sessionCookie) {
    return NextResponse.redirect("/login");
}

// Step 2: Full session validation (secure)
const session = await auth.api.getSession({ headers: await headers() });
if (!session) {
    return NextResponse.redirect("/login");
}

return NextResponse.next(); // Allow request
```

### Performance:
- **Anonymous users (no cookie):** ~1ms (fast redirect, no DB query)
- **Logged-in users (valid session):** ~50-200ms (includes DB validation)
- **Invalid/expired session:** ~50-200ms (DB query fails validation)

---

## Layer 2: Server Component Validation

**File:** `app/dashboard/page.tsx`

### Why it's critical:
Even though middleware checks authentication, we validate again in the page component because:
1. **Defense-in-depth:** Protects against middleware configuration errors
2. **Server-side data fetching:** Must validate BEFORE fetching sensitive data
3. **Security requirement:** Never fetch data without explicit validation

### Implementation:
```tsx
export default async function DashboardPage() {
    // CRITICAL: Validate session BEFORE any data fetching
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect("/login");
    }

    // ✅ Safe to fetch server-side data now
    // const userData = await db.collection("users").findOne({ id: session.user.id });

    return <DashboardClient initialSession={session} />;
}
```

### Attack Scenario Prevented:
```
1. Attacker visits /dashboard
2. Middleware has config typo (matcher: "/dashbord/:path*")
3. Middleware doesn't run
4. Page validation catches it: redirect("/login")
5. ✅ NO DATA LEAKED
```

**Without this validation:**
```
1. Attacker visits /dashboard
2. Middleware fails
3. Server fetches sensitive data from database
4. Page renders with user data
5. 🚨 DATA BREACH
```

---

## Layer 3: API Route Protection

**File:** `app/api/protected/user/route.ts`

### Why middleware alone isn't enough for APIs:
- APIs return **data**, not HTML pages
- Redirects don't work properly for API endpoints
- Must return proper HTTP status codes (401, 403)
- Can be called directly (not just through browser)

### Implementation:
```ts
export async function GET(request: NextRequest) {
    // REQUIRED: Validate session in API route
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    // ✅ Safe to return sensitive data
    return NextResponse.json({
        user: session.user,
        session: session.session,
    });
}
```

### Security Rules for APIs:
1. ✅ **ALWAYS** validate session in the route handler
2. ✅ Return proper error codes (401/403), not redirects
3. ✅ Never assume middleware has validated
4. ✅ Validate on EVERY method (GET, POST, PUT, DELETE)

---

## Request Flow Diagram

### Protected Page Request (e.g., /dashboard):
```
User Request
    ↓
┌─────────────────────────────────────┐
│ Layer 1: Middleware                 │
│ - Cookie exists?                    │
│ - Session valid in DB?              │
└─────────────────────────────────────┘
    ↓ (passes)
┌─────────────────────────────────────┐
│ Layer 2: Server Component           │
│ - Validate session again            │
│ - Check BEFORE data fetch           │
└─────────────────────────────────────┘
    ↓ (passes)
┌─────────────────────────────────────┐
│ Layer 3: Render Page                │
│ - Fetch user data from DB           │
│ - Pass to client component          │
└─────────────────────────────────────┘
    ↓
Client Component Renders
```

### Protected API Request (e.g., /api/protected/user):
```
API Request
    ↓
┌─────────────────────────────────────┐
│ Layer 1: Middleware                 │
│ - Cookie exists?                    │
│ - Session valid?                    │
└─────────────────────────────────────┘
    ↓ (passes)
┌─────────────────────────────────────┐
│ Layer 2: API Route Handler          │
│ - Validate session                  │
│ - Return 401 if invalid             │
└─────────────────────────────────────┘
    ↓ (passes)
┌─────────────────────────────────────┐
│ Layer 3: Return Data                │
│ - Query database                    │
│ - Return JSON response              │
└─────────────────────────────────────┘
```

---

## Page Types and Security Requirements

| Page Type | Example | Auth Required? | Validation Pattern |
|-----------|---------|----------------|-------------------|
| Public Pages | `/`, `/login`, `/signup` | ❌ No | No validation needed |
| Protected Client Pages | N/A (legacy pattern) | ✅ Yes | Client-side `useSession()` |
| Protected Server Pages | `/dashboard` | ✅ Yes | Server-side validation + middleware |
| Public API Routes | `/api/auth/*` | ❌ No | Handled by Better Auth |
| Protected API Routes | `/api/protected/*` | ✅ Yes | Route validation + middleware |

---

## Security Best Practices

### ✅ DO:
1. **Always validate in server components** that fetch data
2. **Always validate in API routes** before returning data
3. **Use both middleware + page validation** for defense-in-depth
4. **Return proper HTTP status codes** from APIs (401, 403)
5. **Validate on every HTTP method** (GET, POST, PUT, DELETE)

### ❌ DON'T:
1. **Never fetch server-side data** without validating session first
2. **Never rely solely on middleware** for API protection
3. **Never trust client-side checks** for security
4. **Never skip validation** "because middleware does it"
5. **Never use redirects** as the only API protection

---

## Performance Considerations

### Does double validation slow things down?
**No!** Better Auth uses request-level caching:

```
Single Request Lifecycle:
1. Middleware: auth.api.getSession() → DB query → Cache result
2. Page: auth.api.getSession() → Reads from cache (no DB query)
```

**Total DB queries per request:** 1 (not 2!)

---

## Testing Your Protection

### Test 1: Anonymous User
```bash
# Should redirect to /login
curl -i http://localhost:3000/dashboard
```

### Test 2: Invalid Session Cookie
```bash
# Should redirect to /login
curl -i -H "Cookie: better-auth.session_token=fake" http://localhost:3000/dashboard
```

### Test 3: Protected API without Auth
```bash
# Should return 401 Unauthorized
curl -i http://localhost:3000/api/protected/user
```

### Test 4: Valid Session
```bash
# Login first, get session cookie, then:
curl -i -H "Cookie: better-auth.session_token=<real_token>" http://localhost:3000/dashboard
# Should return 200 OK
```

---

## Failure Scenarios Covered

| Failure Scenario | Protected By | Result |
|------------------|--------------|--------|
| Middleware config typo | Page validation | Redirect to /login |
| Middleware deployment bug | Page validation | Redirect to /login |
| Developer forgets middleware | Page validation | Redirect to /login |
| API called directly | API route validation | 401 Unauthorized |
| Fake session cookie | Session validation (both layers) | Redirect/401 |
| Expired session | Session validation (both layers) | Redirect/401 |
| Database session deleted | Session validation (both layers) | Redirect/401 |

---

## Summary

This application implements **industry-standard defense-in-depth security**:

1. **Middleware:** Fast initial check, redirects unauthorized users
2. **Page Validation:** Protects server-side data fetching
3. **API Validation:** Ensures APIs return proper error codes

**No single point of failure** - if one layer fails, the others protect your data.

**Better Auth Recommended Pattern:** ✅ Fully implemented

**Security Level:** 🛡️ Production-ready
