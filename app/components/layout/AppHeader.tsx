"use client";

import Link from "next/link";
import { useSession, signOut } from "@/app/lib/auth-client";
import { useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Badge from "@/app/components/ui/Badge";

function HeaderIcon({ children }: { children: ReactNode }) {
  return <span className="app-header__action-icon" aria-hidden="true">{children}</span>;
}

function HeaderLabel({ children }: { children: ReactNode }) {
  return <span className="app-header__action-label">{children}</span>;
}

export default function AppHeader() {
  const { data: session } = useSession();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (session) {
      fetchUnreadCount();
    } else {
      setUnreadCount(0);
    }
  }, [session]);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch("/api/messages/conversations");
      if (res.ok) {
        const data = await res.json();
        const total = data.conversations.reduce(
          (sum: number, c: any) => sum + c.unreadCount,
          0
        );
        setUnreadCount(total);
      }
    } catch {
      // non-critical
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link href="/" className="app-header__brand">
          Nilexia
        </Link>

        <nav className="app-header__nav">
          {session ? (
            <>
              <Link
                href="/listings/create"
                className="btn btn-primary btn-sm app-header__nav-action app-header__nav-action--create"
                aria-label="Create listing"
              >
                <HeaderIcon>
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="10" cy="10" r="6.25" />
                    <path d="M10 6.5v7" strokeLinecap="round" />
                    <path d="M6.5 10h7" strokeLinecap="round" />
                  </svg>
                </HeaderIcon>
                <HeaderLabel>List Item</HeaderLabel>
              </Link>
              <Link
                href="/listings/my-listings"
                className="btn btn-ghost btn-sm app-header__nav-action"
                aria-label="My listings"
              >
                <HeaderIcon>
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="4" y="4" width="12" height="12" rx="2" />
                    <path d="M7 8h6M7 12h6" strokeLinecap="round" />
                  </svg>
                </HeaderIcon>
                <HeaderLabel>My Listings</HeaderLabel>
              </Link>
              <Link
                href="/messages"
                className="btn btn-ghost btn-sm app-header__nav-action app-header__messages-action"
                aria-label={`Messages${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
              >
                <HeaderIcon>
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h9A1.5 1.5 0 0 1 16 5.5v6A1.5 1.5 0 0 1 14.5 13H9l-3.5 3v-3H5.5A1.5 1.5 0 0 1 4 11.5z" />
                  </svg>
                </HeaderIcon>
                <HeaderLabel>Messages</HeaderLabel>
                {unreadCount > 0 && <Badge count={unreadCount} />}
              </Link>
              <button
                className="btn btn-ghost btn-sm app-header__nav-action"
                onClick={handleSignOut}
                aria-label="Sign out"
              >
                <HeaderIcon>
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M8 4H6.5A1.5 1.5 0 0 0 5 5.5v9A1.5 1.5 0 0 0 6.5 16H8" strokeLinecap="round" />
                    <path d="M11 7l3 3-3 3M14 10H8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </HeaderIcon>
                <HeaderLabel>Sign Out</HeaderLabel>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="btn btn-outline btn-sm app-header__nav-action"
                aria-label="Log in"
              >
                <HeaderIcon>
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M8 4H6.5A1.5 1.5 0 0 0 5 5.5v9A1.5 1.5 0 0 0 6.5 16H8" strokeLinecap="round" />
                    <path d="M11 7l3 3-3 3M14 10H8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </HeaderIcon>
                <HeaderLabel>Log In</HeaderLabel>
              </Link>
              <Link
                href="/signup"
                className="btn btn-primary btn-sm app-header__nav-action"
                aria-label="Sign up"
              >
                <HeaderIcon>
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M10 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" />
                    <path d="M5.5 15a4.5 4.5 0 0 1 9 0" strokeLinecap="round" />
                  </svg>
                </HeaderIcon>
                <HeaderLabel>Sign Up</HeaderLabel>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
