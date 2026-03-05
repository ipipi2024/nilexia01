# Nilexia — FIT Community Marketplace

A private marketplace for the Florida Institute of Technology (FIT) community. Students and staff can buy, sell, donate, and rent items with each other through a secure, verified platform.

---

## Access & Eligibility

Registration is restricted to verified FIT email addresses:

- `@fit.edu`
- `@my.fit.edu`

All users must accept a Non-Disclosure Agreement (NDA) before accessing the platform.

---

## Features

### Marketplace
- Browse listings filtered by type: **Sell**, **Donate**, or **Rent**
- Create listings with up to 5 images (via UploadThing)
- Set availability status: `available`, `unavailable`, `sold`, `donated`, or `rented`
- Sold, donated, and rented items remain visible on the homepage for community vibrancy
- Edit and delete your own listings

### Messaging
- Direct messaging between users, initiated from any listing page
- Conversations list with unread message counts
- Messages marked as read when you open a conversation

### Web Push Notifications
- Users can enable or disable push notifications via the bell toggle on the Messages page
- When enabled, a browser push notification fires whenever a new message is received — even when the tab is closed
- Clicking the notification navigates directly to `/messages`
- Subscriptions are stored per device (users can have multiple active devices)
- Stale or expired subscriptions are automatically cleaned up

### Authentication
- Email + password registration with mandatory email verification
- Password reset via email (tokens expire in 5 minutes)
- Session-based authentication (7-day expiry, auto-cleaned via MongoDB TTL index)
- Powered by [Better Auth](https://better-auth.com)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, inline styles |
| Language | TypeScript 5 |
| Database | MongoDB 7 (no ORM) |
| Auth | Better Auth 1.3 |
| Email | Resend |
| Image uploads | UploadThing |
| Push notifications | Web Push API + `web-push` (VAPID) |

---

## Project Structure

```
app/
├── api/
│   ├── auth/[...all]/          # Better Auth handler
│   ├── listings/               # CRUD for listings
│   │   └── [id]/               # Single listing get/update/delete
│   ├── messages/               # Send & fetch messages
│   │   ├── conversations/      # List all conversations with unread counts
│   │   └── read/               # Mark messages as read
│   ├── push/
│   │   └── subscribe/          # POST (save subscription) / DELETE (remove)
│   └── user/
│       ├── nda-status/         # Check if user has accepted NDA
│       └── accept-nda/         # Record NDA acceptance
├── components/
│   ├── NDAGuard.tsx            # Wraps app; blocks access until NDA accepted
│   ├── NDAModal.tsx            # NDA agreement modal
│   ├── MessageButton.tsx       # "Message seller" button on listing pages
│   └── PushNotificationBell.tsx# Bell toggle: subscribe/unsubscribe push
├── lib/
│   ├── auth.ts                 # Better Auth server config
│   ├── auth-client.ts          # Better Auth client config
│   ├── auth-helpers.ts         # requireAuth(), getAuthUser()
│   ├── mongodb.ts              # Shared MongoDB client (HMR-safe)
│   ├── email.ts                # Resend email service
│   ├── push.ts                 # sendPushToUser() via web-push
│   ├── models/
│   │   ├── listing.ts          # Listing schema, collection helper, indexes
│   │   ├── message.ts          # Message schema, collection helper, indexes
│   │   └── push-subscription.ts# Push subscription schema + indexes
│   └── validation/
│       ├── listing.ts          # Listing input validation & sanitization
│       └── message.ts          # Message input validation & sanitization
├── listings/
│   ├── create/page.tsx         # Create listing form
│   ├── my-listings/page.tsx    # User's own listings
│   └── [id]/
│       ├── page.tsx            # Listing detail page
│       └── edit/page.tsx       # Edit listing form
├── messages/
│   ├── page.tsx                # Conversations list (with bell toggle)
│   └── [userId]/page.tsx       # Chat view with a specific user
├── login/page.tsx
├── signup/page.tsx
├── forgot-password/page.tsx
└── page.tsx                    # Homepage / marketplace feed
public/
└── sw.js                       # Service worker for Web Push events
```

---

## MongoDB Collections

| Collection | Purpose |
|-----------|---------|
| `user` | User accounts (managed by Better Auth) |
| `account` | Auth provider links |
| `session` | Active sessions (TTL: 7 days) |
| `listings` | Marketplace listings |
| `messages` | User-to-user messages |
| `push_subscriptions` | Browser push subscriptions (one per device) |

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Better Auth
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:3000

# Resend (email)
RESEND_API_KEY=your_resend_api_key

# UploadThing (image uploads)
UPLOADTHING_TOKEN=your_uploadthing_token

# Web Push Notifications (VAPID)
# Generate with: npx web-push generate-vapid-keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=mailto:admin@fit.edu
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Register with a `@fit.edu` or `@my.fit.edu` email, verify it, accept the NDA, and you're in.

---

## Web Push Setup (one-time)

VAPID keys are generated once and stored permanently in your environment:

```bash
npx web-push generate-vapid-keys
```

Add the output to your `.env.local` under the VAPID variables above. Never rotate these keys unless they are compromised — doing so invalidates all existing subscriptions.

---

## How Push Notifications Work

```
1. User visits /messages and clicks the bell 🔔
2. Browser requests notification permission
3. Service worker (/sw.js) is registered
4. Browser creates a push subscription (endpoint + keys)
5. Subscription is saved to MongoDB (push_subscriptions)

When a message is sent:
6. POST /api/messages saves the message
7. sendPushToUser() fires in the background (non-blocking)
8. web-push sends to every subscription for the receiver
9. Browser push service delivers to the device
10. sw.js receives the push event → shows OS notification
11. User clicks notification → /messages opens
```

Invalid subscriptions (HTTP 410 / 404) are automatically deleted from MongoDB.

---

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # Lint
npm run lint:fix # Lint + auto-fix
```
