# Project Documentation

## Project Overview
Next.js application with Better Auth authentication system and MongoDB database integration.

## Technology Stack
- **Framework**: Next.js 16.0.1
- **Runtime**: React 19.2.0
- **Authentication**: Better Auth 1.3.34
- **Database**: MongoDB 7.0.0
- **Language**: TypeScript 5.9.3

## Project Setup & Configuration

### MCP Servers Configured
The project uses Model Context Protocol (MCP) servers for enhanced development:
- **Vercel MCP Server**: Interface with Vercel platform
- **MongoDB MCP Server**: Database access (read-only mode with `--readonly` flag)
- **Better Auth MCP Server**: Authentication framework assistance

### Database Connection
- MongoDB connection established via connection string
- Connection handled in `app/lib/mongodb.ts`
- Database credentials stored in environment variables (`.env`)

## Architecture Decisions

### Authentication Framework: Better Auth vs NextAuth.js

**Decision Date**: 2025-11-22

**Decision**: Migrated from NextAuth.js to Better Auth

**Rationale**:
1. **Unified Management**: NextAuth.js is now managed by the Better Auth team
2. **Feature Integration**: All NextAuth.js features have been integrated into Better Auth
3. **Active Development**: Better Auth has an active development team available for support
4. **Modern Technology**: Maintaining alignment with latest authentication technology and industry changes
5. **Long-term Support**: Ensures continued support and updates from the maintainers

**Impact & Considerations**:

This migration introduced additional database collections that were not initially anticipated:

1. **Account Collection**
   - Created automatically when users authenticate
   - Stores authentication provider information
   - Links users to their authentication methods

2. **Session Collection**
   - Generated during the authentication flow
   - Stores active user sessions
   - Managed with TTL indexing for automatic cleanup of expired sessions

**Database Schema Implications**:
- User authentication flow now creates/updates records across multiple collections (User, Account, Session)
- MongoDB adapter handles collection creation and management automatically
- Additional storage requirements for account and session data
- Session cleanup implemented via MongoDB TTL indexes to manage database size

## Authentication System (Better Auth)

### Implementation Details
**File**: `app/lib/auth.ts`

#### Configuration
```typescript
- Adapter: mongodbAdapter (Better Auth MongoDB adapter)
- Session Duration: 7 days (60 * 60 * 24 * 7 seconds)
- Auto Sign-In: Enabled by default
```

#### Features Enabled
1. **Email and Password Authentication**
   - Enabled via `emailAndPassword` configuration
   - Auto sign-in enabled for authenticated users

2. **Session Management**
   - TTL (Time-To-Live) indexing implemented
   - Automatic session cleanup via MongoDB TTL index
   - Expired sessions automatically deleted from database
   - Session cleanup handled by `setupSessionCleanup()` function

3. **API Router Handler**
   - Better Auth API routes configured
   - Path configured to use `@` symbol

## Recent Changes & Commit History

### Latest Changes (Chronological Order)

1. **MongoDB Connection** (df8a878)
   - Initial MongoDB database connection setup

2. **Better Auth Instance Creation** (a7cf9b3)
   - Created Better Auth authentication instance
   - Initial configuration

3. **API Router Handler** (2d05fdd)
   - Created API router handler for Better Auth
   - Configured path using `@` symbol
   - Implemented according to Better Auth documentation

4. **Email/Password Authentication** (78ee897)
   - Enabled email and password authentication
   - Configured Better Auth instance for credential-based auth

5. **TTL Indexing for Sessions** (1039b50)
   - Added TTL indexing to database
   - Tracks expired sessions automatically
   - Automatic deletion of expired sessions

### Modified Files (Uncommitted)
- `app/lib/auth.ts` - Contains current authentication configuration

## Development Scripts

```json
"dev": "next dev"           // Start development server
"build": "next build"       // Build production bundle
"start": "next start"       // Start production server
"lint": "eslint"            // Run linter
"lint:fix": "eslint --fix"  // Fix linting issues automatically
```

## Security Considerations
- Database credentials stored in environment variables
- MongoDB MCP server runs in read-only mode to prevent accidental writes
- Session expiration handled automatically via TTL indexes
- MONGODB_URI requires rotation (exposed during MCP setup)

## Future Work & Notes
- Monitor session cleanup performance
- Consider implementing additional Better Auth features (OAuth, 2FA, etc.)
- Update MongoDB connection string after exposure

---

**Last Updated**: 2025-11-22
**Branch**: main
