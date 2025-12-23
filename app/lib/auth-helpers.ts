import { auth } from "./auth";
import { headers } from "next/headers";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  ndaAcceptedAt?: Date;
}

export interface AuthSession {
  user: AuthUser;
  session: {
    expiresAt: Date;
    createdAt: Date;
  };
}

/**
 * Get the authenticated user from the current request
 * Returns null if user is not authenticated
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      emailVerified: session.user.emailVerified,
      ndaAcceptedAt: (session.user as any).ndaAcceptedAt,
    };
  } catch (error) {
    console.error("Error getting auth user:", error);
    return null;
  }
}

/**
 * Get the full session (user + session info)
 * Returns null if not authenticated
 */
export async function getAuthSession(): Promise<AuthSession | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return null;
    }

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        emailVerified: session.user.emailVerified,
        ndaAcceptedAt: (session.user as any).ndaAcceptedAt,
      },
      session: {
        expiresAt: session.session.expiresAt,
        createdAt: session.session.createdAt,
      },
    };
  } catch (error) {
    console.error("Error getting auth session:", error);
    return null;
  }
}

/**
 * Require authentication - throws error if not authenticated
 * Use this in API routes that require authentication
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}
