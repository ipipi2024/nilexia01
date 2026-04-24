"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/app/lib/auth-client";
import AppHeader from "@/app/components/layout/AppHeader";
import PageContainer from "@/app/components/layout/PageContainer";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import Alert from "@/app/components/ui/Alert";
import EmptyState from "@/app/components/ui/EmptyState";
import LoadingState from "@/app/components/ui/LoadingState";

interface Listing {
  id: string;
  title: string;
  description: string;
  type: "sell" | "donate" | "rent";
  price: number | null;
  images: string[];
  status: "available" | "unavailable" | "sold" | "donated" | "rented";
  createdAt: string;
}

export default function MyListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [user, setUser]         = useState<any>(null);

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    const { data: session } = await authClient.getSession();
    if (!session?.user) { router.push("/login"); return; }
    setUser(session.user);
    fetchMyListings(session.user.id);
  };

  const fetchMyListings = async (userId: string) => {
    try {
      setLoading(true);
      const response = await fetch("/api/listings?includeUnavailable=true", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setListings(data.filter((l: any) => l.userId === userId));
      } else {
        setError("Failed to load listings");
      }
    } catch {
      setError("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  const deleteListing = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      const response = await fetch(`/api/listings/${id}`, { method: "DELETE", credentials: "include" });
      if (response.status === 204) {
        setListings(listings.filter(l => l.id !== id));
      } else {
        alert("Failed to delete listing");
      }
    } catch {
      alert("Failed to delete listing");
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        const updated = await response.json();
        setListings(listings.map(l => l.id === id ? updated : l));
      } else {
        alert("Failed to update status");
      }
    } catch {
      alert("Failed to update status");
    }
  };

  if (!user && !loading) return null;

  return (
    <>
      <AppHeader />

      <PageContainer>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "28px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.02em" }}>My Listings</h1>
            <p className="text-muted" style={{ marginTop: "2px" }}>
              Manage your posted items
            </p>
          </div>
          <Link href="/listings/create" className="btn btn-primary">
            + New Listing
          </Link>
        </div>

        {error && <Alert variant="error" className="mb-4">{error}</Alert>}

        {loading && <LoadingState />}

        {!loading && listings.length === 0 && (
          <EmptyState
            icon="📦"
            title="No listings yet"
            description="Start selling, donating, or renting items to the FIT community."
            action={{ label: "Create Your First Listing", href: "/listings/create" }}
          />
        )}

        {!loading && listings.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {listings.map((listing) => (
              <div key={listing.id} className="listing-row">
                {listing.images[0] ? (
                  <img src={listing.images[0]} alt={listing.title} className="listing-row__img" />
                ) : (
                  <div className="listing-row__no-img">🖼</div>
                )}

                <div className="listing-row__body">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>{listing.title}</h3>
                    {listing.price !== null && (
                      <span style={{ fontWeight: 700, fontSize: "18px", color: "var(--c-success)", whiteSpace: "nowrap" }}>
                        ${listing.price}
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <Badge type={listing.type} />
                    <Badge status={listing.status} />
                  </div>

                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--c-gray-500)",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {listing.description}
                  </p>

                  <p style={{ fontSize: "12px", color: "var(--c-gray-400)" }}>
                    Posted {new Date(listing.createdAt).toLocaleDateString()}
                  </p>

                  <div className="listing-row__actions">
                    <Link href={`/listings/${listing.id}`} className="btn btn-outline btn-sm">
                      View
                    </Link>
                    <Link href={`/listings/${listing.id}/edit`} className="btn btn-ghost btn-sm">
                      Edit
                    </Link>

                    {/* Inline status selector */}
                    <select
                      value={listing.status}
                      onChange={(e) => updateStatus(listing.id, e.target.value)}
                      className="form-select btn-sm"
                      style={{ width: "auto", paddingRight: "28px" }}
                    >
                      <option value="available">Available</option>
                      <option value="unavailable">Unavailable</option>
                      <option value="sold"    disabled={listing.type !== "sell"}>Sold</option>
                      <option value="donated" disabled={listing.type !== "donate"}>Donated</option>
                      <option value="rented"  disabled={listing.type !== "rent"}>Rented</option>
                    </select>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deleteListing(listing.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageContainer>
    </>
  );
}
