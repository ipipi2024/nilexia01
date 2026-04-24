"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/app/lib/auth-client";
import AppHeader from "@/app/components/layout/AppHeader";
import Badge from "@/app/components/ui/Badge";
import EmptyState from "@/app/components/ui/EmptyState";
import LoadingState from "@/app/components/ui/LoadingState";

interface Listing {
  id: string;
  title: string;
  description: string;
  type: "sell" | "donate" | "rent";
  price: number | null;
  rentPeriod?: "hour" | "day" | "week" | "month" | "year";
  images: string[];
  status: "available" | "unavailable" | "sold" | "donated" | "rented";
  createdAt: string;
}

const FILTERS = [
  { value: "all",    label: "All" },
  { value: "sell",   label: "For Sale" },
  { value: "donate", label: "Free / Donate" },
  { value: "rent",   label: "For Rent" },
] as const;

type Filter = (typeof FILTERS)[number]["value"];

export default function Page() {
  const { data: session } = useSession();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [filter, setFilter]     = useState<Filter>("all");

  useEffect(() => {
    fetchListings();
  }, [filter]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const url = filter === "all" ? "/api/listings" : `/api/listings?type=${filter}`;
      const response = await fetch(url);
      if (response.ok) {
        setListings(await response.json());
      } else {
        setError("Failed to load listings");
      }
    } catch {
      setError("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppHeader />

      <div className="page-container">
        {/* Page heading */}
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "4px" }}>
            Campus Marketplace
          </h1>
          <p className="text-muted">Buy, sell, donate, and rent within the Florida Tech community.</p>
        </div>

        {/* Filter pills */}
        <div className="filter-bar">
          <span className="filter-bar__label">Filter:</span>
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              className={`filter-pill ${filter === value ? "filter-pill--active" : ""}`}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* States */}
        {loading && <LoadingState text="Loading listings…" />}

        {error && !loading && (
          <div className="alert alert-error" style={{ marginBottom: "20px" }}>
            {error}
          </div>
        )}

        {/* Grid */}
        {!loading && !error && listings.length > 0 && (
          <div className="listing-grid">
            {listings.map((listing) => (
              <Link key={listing.id} href={`/listings/${listing.id}`} className="listing-card">
                {listing.images[0] ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="listing-card__img"
                  />
                ) : (
                  <div className="listing-card__no-img">🖼</div>
                )}

                <div className="listing-card__body">
                  <div className="listing-card__badges">
                    <Badge type={listing.type} />
                    {(["sold", "donated", "rented", "unavailable"] as const).includes(
                      listing.status as any
                    ) && <Badge status={listing.status} />}
                  </div>

                  <div className="listing-card__title">{listing.title}</div>

                  <p className="listing-card__desc">{listing.description}</p>

                  {listing.price !== null && (
                    <div className="listing-card__price">
                      ${listing.price}
                      {listing.type === "rent" && listing.rentPeriod && (
                        <span className="listing-card__price-sub"> /{listing.rentPeriod}</span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && !error && listings.length === 0 && (
          <EmptyState
            icon="🛍️"
            title="No listings yet"
            description={
              session
                ? "Be the first to post something for the community."
                : "Log in to browse and create listings."
            }
            action={
              session
                ? { label: "Create Listing", href: "/listings/create" }
                : { label: "Log In", href: "/login" }
            }
          />
        )}
      </div>
    </>
  );
}
