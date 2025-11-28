# Authentication & Authorization Testing Guide

This guide provides comprehensive tests to verify that all security layers are working correctly.

## Prerequisites

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Ensure MongoDB is running and accessible

3. Have a browser and terminal ready

---

## Test Suite

### ✅ Test 1: Anonymous User - Protected Page Access

**What we're testing:** Middleware redirects unauthorized users from protected pages

**Steps:**
1. Open browser in incognito/private mode
2. Navigate to `http://localhost:3000/dashboard`

**Expected Result:**
- ✅ Automatically redirected to `http://localhost:3000/login`
- ✅ Dashboard content NOT visible
- ✅ No error messages in browser console

**What this proves:**
- Middleware Layer 1 is working (cookie check)
- Middleware Layer 2 is working (session validation)

---

### ✅ Test 2: Anonymous User - Protected API Access

**What we're testing:** API routes return proper 401 for unauthorized requests

**Steps:**
1. Open terminal
2. Run:
   ```bash
   curl -i http://localhost:3000/api/protected/user
   ```

**Expected Result:**
```
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"error":"Unauthorized"}
```

**What this proves:**
- API route validation is working
- Proper HTTP status codes returned
- Middleware + API validation working together

---

### ✅ Test 3: User Sign Up

**What we're testing:** User registration flow

**Steps:**
1. Open browser (incognito mode)
2. Navigate to `http://localhost:3000/signup`
3. Fill in the form:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
4. Click "Sign Up"

**Expected Result:**
- ✅ Automatically redirected to `http://localhost:3000/dashboard`
- ✅ Dashboard shows welcome message: "Welcome, Test User!"
- ✅ User email displayed: `test@example.com`
- ✅ Session information visible

**What this proves:**
- Sign up flow works
- Auto sign-in works
- Session creation successful
- Protected route accessible with valid session

---

### ✅ Test 4: User Login

**What we're testing:** User authentication flow

**Steps:**
1. Sign out from dashboard (if logged in)
2. Navigate to `http://localhost:3000/login`
3. Enter credentials:
   - Email: `test@example.com`
   - Password: `password123`
4. Click "Login"

**Expected Result:**
- ✅ Redirected to `http://localhost:3000/dashboard`
- ✅ Dashboard displays user information
- ✅ Session data visible

**What this proves:**
- Login flow works
- Session validation works
- Protected routes accessible after login

---

### ✅ Test 5: Valid User - Protected API Access

**What we're testing:** Authenticated API access

**Steps:**
1. Log in via browser (Test 4)
2. Open browser DevTools (F12)
3. Go to Application/Storage → Cookies → `http://localhost:3000`
4. Find cookie named `better-auth.session_token`
5. Copy the cookie value
6. In terminal, run:
   ```bash
   curl -i -H "Cookie: better-auth.session_token=<PASTE_COOKIE_VALUE_HERE>" http://localhost:3000/api/protected/user
   ```

**Expected Result:**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com"
  },
  "session": {
    "expiresAt": "...",
    "createdAt": "..."
  }
}
```

**What this proves:**
- API authentication works
- Session cookie is properly validated
- API returns user data for authenticated requests

---

### ✅ Test 6: Fake Session Cookie - Protected Page

**What we're testing:** Defense against fake/forged cookies

**Steps:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Run:
   ```javascript
   document.cookie = "better-auth.session_token=fake_token_12345; path=/";
   ```
4. Navigate to `http://localhost:3000/dashboard`

**Expected Result:**
- ✅ Redirected to `http://localhost:3000/login`
- ✅ Dashboard NOT accessible
- ✅ Fake cookie rejected

**What this proves:**
- Cookie signature validation works
- Cannot bypass security with fake cookies
- Server-side validation prevents forgery

---

### ✅ Test 7: Fake Session Cookie - Protected API

**What we're testing:** API defense against fake cookies

**Steps:**
```bash
curl -i -H "Cookie: better-auth.session_token=fake_token_12345" http://localhost:3000/api/protected/user
```

**Expected Result:**
```
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"error":"Unauthorized"}
```

**What this proves:**
- API validates session cryptographically
- Fake tokens are rejected
- Proper error response returned

---

### ✅ Test 8: Session Expiration

**What we're testing:** Expired sessions are properly rejected

**Steps:**
1. Log in successfully
2. Open MongoDB Compass or mongosh
3. Connect to your database
4. Find the session document:
   ```javascript
   db.session.find({ userId: "<your_user_id>" })
   ```
5. Manually update the `expiresAt` field to a past date:
   ```javascript
   db.session.updateOne(
     { userId: "<your_user_id>" },
     { $set: { expiresAt: new Date("2020-01-01") } }
   )
   ```
6. Try to access `http://localhost:3000/dashboard`

**Expected Result:**
- ✅ Redirected to login
- ✅ Expired session rejected
- ✅ Must log in again

**What this proves:**
- Session expiration validation works
- Database state is checked
- No access with expired sessions

---

### ✅ Test 9: Middleware Matcher Configuration

**What we're testing:** Only configured routes are protected

**Steps:**
1. Log out (if logged in)
2. Test these routes:
   - `http://localhost:3000/` (home)
   - `http://localhost:3000/login`
   - `http://localhost:3000/signup`

**Expected Result:**
- ✅ All public routes accessible
- ✅ NO redirects to login
- ✅ Pages load normally

**What this proves:**
- Middleware only protects specified routes
- Public routes remain accessible
- Matcher configuration working correctly

---

### ✅ Test 10: Sign Out

**What we're testing:** Session termination

**Steps:**
1. Log in to dashboard
2. Click "Sign Out" button
3. Try to access `http://localhost:3000/dashboard` manually

**Expected Result:**
- ✅ Redirected to login
- ✅ Session cookie removed
- ✅ Dashboard no longer accessible

**What this proves:**
- Sign out flow works
- Session is destroyed
- Cookie is cleared

---

### ✅ Test 11: Server Component Validation (Defense-in-Depth)

**What we're testing:** Page-level validation catches middleware failures

**Steps:**
1. Temporarily comment out the middleware matcher to simulate failure:
   ```ts
   // In middleware.ts
   export const config = {
       runtime: "nodejs",
       matcher: [
           // "/dashboard/:path*", // ← Comment this out
           "/api/protected/:path*",
       ],
   };
   ```
2. Save the file
3. As anonymous user, navigate to `http://localhost:3000/dashboard`

**Expected Result:**
- ✅ Still redirected to login (page validation catches it!)
- ✅ No data exposed
- ✅ Defense-in-depth working

**What this proves:**
- Server component validation is independent
- Protection works even if middleware fails
- Defense-in-depth strategy successful

**IMPORTANT:** Uncomment the matcher after this test!

---

### ✅ Test 12: Browser Automation Testing (Advanced)

**What we're testing:** Complete user flows with browser automation

If you want automated testing, you can use the browser automation MCP tool:

**Steps:**
1. Use the `mcp__next-devtools__browser_eval` tool
2. Test complete flows:
   - Sign up → Dashboard access
   - Login → Dashboard access
   - Logout → Access denied

---

## Performance Tests

### Test 13: Middleware Performance - Anonymous User

**What we're testing:** Fast redirect without DB query

**Steps:**
1. Clear browser cache
2. Open DevTools → Network tab
3. Navigate to `http://localhost:3000/dashboard` (not logged in)
4. Check timing

**Expected Result:**
- ✅ Redirect happens in < 50ms
- ✅ Very fast (no DB query)

---

### Test 14: Middleware Performance - Valid Session

**What we're testing:** Single DB query with caching

**Steps:**
1. Log in
2. Open DevTools → Network tab
3. Navigate to `http://localhost:3000/dashboard`
4. Check server logs for DB queries

**Expected Result:**
- ✅ Only 1 DB query (middleware validates, page reads cache)
- ✅ Response time < 200ms

---

## Troubleshooting

### Issue: Tests fail with "Connection refused"
**Solution:** Make sure dev server is running (`npm run dev`)

### Issue: Tests fail with MongoDB errors
**Solution:** Ensure MongoDB is running and connection string is correct

### Issue: Redirects don't work
**Solution:** Check middleware matcher configuration

### Issue: API returns HTML instead of JSON
**Solution:** Verify you're calling `/api/protected/*` not `/dashboard`

---

## Quick Test Checklist

Use this checklist for quick manual testing:

- [ ] Anonymous user → `/dashboard` → Redirected to login ✅
- [ ] Anonymous user → `/api/protected/user` → 401 error ✅
- [ ] Sign up new user → Auto redirect to dashboard ✅
- [ ] Login existing user → Redirect to dashboard ✅
- [ ] Logged-in user → `/dashboard` → See content ✅
- [ ] Logged-in user → `/api/protected/user` → Get data ✅
- [ ] Fake cookie → `/dashboard` → Redirected to login ✅
- [ ] Fake cookie → `/api/protected/user` → 401 error ✅
- [ ] Sign out → `/dashboard` → Redirected to login ✅
- [ ] Public routes (`/`, `/login`, `/signup`) → Accessible ✅

---

## Automated Testing Script

You can also create a simple test script:

```bash
#!/bin/bash

echo "Running security tests..."

echo "\n✅ Test 1: Anonymous access to dashboard"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000/dashboard

echo "\n✅ Test 2: Anonymous API access"
curl -s -w "Status: %{http_code}\n" http://localhost:3000/api/protected/user

echo "\n✅ Test 3: Fake cookie - dashboard"
curl -s -o /dev/null -w "Status: %{http_code}\n" -H "Cookie: better-auth.session_token=fake" http://localhost:3000/dashboard

echo "\n✅ Test 4: Fake cookie - API"
curl -s -w "Status: %{http_code}\n" -H "Cookie: better-auth.session_token=fake" http://localhost:3000/api/protected/user

echo "\n✅ Test 5: Public routes accessible"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000/
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000/login
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000/signup

echo "\nAll tests completed!"
```

---

## Success Criteria

All tests pass if:
- ✅ Anonymous users cannot access protected routes
- ✅ Authenticated users can access protected routes
- ✅ Fake cookies are rejected
- ✅ APIs return proper status codes (401/200)
- ✅ Public routes remain accessible
- ✅ Defense-in-depth catches middleware failures
- ✅ Performance is acceptable (< 200ms)

**Your application is production-ready when all tests pass!** 🎉
