"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/app/lib/auth-client";

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

export default function MyListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<"available" | "unavailable">("available");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: session } = await authClient.getSession();
    if (!session?.user) {
      router.push("/login");
      return;
    }
    setUser(session.user);
    fetchMyListings(session.user.id);
  };

  const fetchMyListings = async (userId: string) => {
    try {
      setLoading(true);
      const response = await fetch("/api/listings");

      if (response.ok) {
        const data = await response.json();
        // Filter to only show user's listings
        const myListings = data.filter((l: any) => l.userId === userId);
        setListings(myListings);
      } else {
        setError("Failed to load listings");
      }
    } catch (err) {
      setError("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  const deleteListing = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) {
      return;
    }

    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.status === 204) {
        setListings(listings.filter((l) => l.id !== id));
      } else {
        alert("Failed to delete listing");
      }
    } catch (err) {
      alert("Failed to delete listing");
    }
  };

  const toggleStatus = async (listing: Listing) => {
    const newStatus = listing.status === "available" ? "unavailable" : "available";

    try {
      const response = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updated = await response.json();
        setListings(listings.map((l) => (l.id === listing.id ? updated : l)));
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "1200px", margin: "50px auto", padding: "20px" }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "50px auto", padding: "20px" }}>
      <div style={{ marginBottom: "30px" }}>
        <Link href="/listings" style={{ color: "#007bff", marginBottom: "20px", display: "inline-block" }}>
          ← Back to all listings
        </Link>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h1>My Listings</h1>
        <Link href="/listings/create" style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          textDecoration: "none",
          borderRadius: "4px"
        }}>
          Create New Listing
        </Link>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {listings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            You haven't created any listings yet.
          </p>
          <Link href="/listings/create" style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            textDecoration: "none",
            borderRadius: "4px"
          }}>
            Create Your First Listing
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {listings.map((listing) => (
            <div
              key={listing.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "20px",
                display: "flex",
                gap: "20px"
              }}
            >
              {listing.images[0] && (
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  style={{
                    width: "150px",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "8px"
                  }}
                />
              )}

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
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
                        fontSize: "12px",
                        marginRight: "10px"
                      }}>
                        {listing.type === "sell" ? "For Sale" :
                         listing.type === "donate" ? "Free" : "For Rent"}
                      </span>
                      <span style={{
                        display: "inline-block",
                        padding: "4px 8px",
                        backgroundColor: listing.status === "available" ? "#28a745" : "#6c757d",
                        color: "white",
                        borderRadius: "4px",
                        fontSize: "12px"
                      }}>
                        {listing.status}
                      </span>
                    </div>
                  </div>
                  {listing.price !== null && (
                    <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold", color: "#28a745" }}>
                      ${listing.price}
                    </p>
                  )}
                </div>

                <p style={{ color: "#666", margin: "10px 0" }}>
                  {listing.description.length > 150
                    ? listing.description.substring(0, 150) + "..."
                    : listing.description}
                </p>

                <p style={{ fontSize: "14px", color: "#999", margin: "10px 0" }}>
                  Posted: {new Date(listing.createdAt).toLocaleDateString()}
                </p>

                <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                  <Link
                    href={`/listings/${listing.id}`}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#007bff",
                      color: "white",
                      textDecoration: "none",
                      borderRadius: "4px",
                      fontSize: "14px"
                    }}
                  >
                    View
                  </Link>

                  <button
                    onClick={() => toggleStatus(listing)}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: listing.status === "available" ? "#6c757d" : "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    Mark as {listing.status === "available" ? "Unavailable" : "Available"}
                  </button>

                  <button
                    onClick={() => deleteListing(listing.id)}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
