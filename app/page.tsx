"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "@/app/lib/auth-client";
import { useRouter } from "next/navigation";

interface Listing {
  id: string;
  title: string;
  description: string;
  type: "sell" | "donate" | "rent";
  price: number | null;
  images: string[];
  status: string;
  createdAt: string;
}

export default function Page() {
  const router = useRouter();
  const { data: session } = useSession();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "sell" | "donate" | "rent">("all");
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  useEffect(() => {
    fetchListings();
  }, [filter]);

  useEffect(() => {
    if (session) {
      fetchUnreadMessageCount();
    }
  }, [session]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const url = filter === "all"
        ? "/api/listings"
        : `/api/listings?type=${filter}`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        setListings(data);
      } else {
        setError("Failed to load listings");
      }
    } catch (err) {
      setError("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadMessageCount = async () => {
    try {
      const response = await fetch("/api/messages/conversations");
      if (response.ok) {
        const data = await response.json();
        const total = data.conversations.reduce((sum: number, conv: any) => sum + conv.unreadCount, 0);
        setTotalUnreadMessages(total);
      }
    } catch (err) {
      // Silently fail - unread count is not critical
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "15px" }}>
      <style jsx>{`
        @media (max-width: 768px) {
          .header-container {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .nav-buttons {
            justify-content: center !important;
          }
          .nav-buttons a, .nav-buttons button {
            flex: 1 1 auto;
            min-width: 120px;
          }
        }
      `}</style>
      <div className="header-container" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
        marginBottom: "30px"
      }}>
        <h1 style={{ margin: 0 }}>Campus Marketplace</h1>
        <div className="nav-buttons" style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px"
        }}>
          {session && (
            <>
              <Link href="/listings/create" style={{
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "white",
                textDecoration: "none",
                borderRadius: "4px"
              }}>
                Create Listing
              </Link>
              <Link href="/listings/my-listings" style={{
                padding: "10px 20px",
                backgroundColor: "#6c757d",
                color: "white",
                textDecoration: "none",
                borderRadius: "4px"
              }}>
                My Listings
              </Link>
              <Link href="/messages" style={{
                padding: "10px 20px",
                backgroundColor: "#17a2b8",
                color: "white",
                textDecoration: "none",
                borderRadius: "4px",
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px"
              }}>
                Messages
                {totalUnreadMessages > 0 && (
                  <span style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}>
                    {totalUnreadMessages}
                  </span>
                )}
              </Link>
              <button
                onClick={handleSignOut}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "16px"
                }}
              >
                Sign Out
              </button>
            </>
          )}
          {!session && (
            <>
              <Link href="/login" style={{
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "white",
                textDecoration: "none",
                borderRadius: "4px"
              }}>
                Log In
              </Link>
              <Link href="/signup" style={{
                padding: "10px 20px",
                backgroundColor: "#28a745",
                color: "white",
                textDecoration: "none",
                borderRadius: "4px"
              }}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ marginRight: "10px" }}>Filter:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
        >
          <option value="all">All</option>
          <option value="sell">For Sale</option>
          <option value="donate">Free/Donate</option>
          <option value="rent">For Rent</option>
        </select>
      </div>

      {loading && <p>Loading listings...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))",
        gap: "20px"
      }}>
        {listings.map((listing) => (
          <Link
            key={listing.id}
            href={`/listings/${listing.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "15px",
              cursor: "pointer",
              transition: "box-shadow 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
            >
              {listing.images[0] && (
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "4px",
                    marginBottom: "10px"
                  }}
                />
              )}

              <h3 style={{ margin: "0 0 10px 0" }}>{listing.title}</h3>

              <div style={{ marginBottom: "10px" }}>
                <span style={{
                  display: "inline-block",
                  padding: "4px 8px",
                  backgroundColor:
                    listing.type === "sell" ? "#28a745" :
                    listing.type === "donate" ? "#17a2b8" : "#ffc107",
                  color: "white",
                  borderRadius: "4px",
                  fontSize: "12px"
                }}>
                  {listing.type === "sell" ? "For Sale" :
                   listing.type === "donate" ? "Free" : "For Rent"}
                </span>
              </div>

              <p style={{
                margin: "0 0 10px 0",
                color: "#666",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical"
              }}>
                {listing.description}
              </p>

              {listing.price !== null && (
                <p style={{ margin: 0, fontSize: "20px", fontWeight: "bold", color: "#28a745" }}>
                  ${listing.price}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {!loading && listings.length === 0 && (
        <p style={{ textAlign: "center", color: "#666", marginTop: "40px" }}>
          No listings found. Be the first to create one!
        </p>
      )}
    </div>
  );
}