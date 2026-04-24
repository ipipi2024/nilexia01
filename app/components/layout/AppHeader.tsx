"use client";

import Link from "next/link";
import { useSession, signOut } from "@/app/lib/auth-client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Badge from "@/app/components/ui/Badge";

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
              <Link href="/listings/create" className="btn btn-primary btn-sm">
                + List Item
              </Link>
              <Link href="/listings/my-listings" className="btn btn-ghost btn-sm">
                My Listings
              </Link>
              <Link
                href="/messages"
                className="btn btn-ghost btn-sm"
                style={{ position: "relative", gap: unreadCount > 0 ? "6px" : undefined }}
              >
                Messages
                {unreadCount > 0 && <Badge count={unreadCount} />}
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={handleSignOut}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline btn-sm">
                Log In
              </Link>
              <Link href="/signup" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
