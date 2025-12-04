"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "sell" | "donate" | "rent">("all");

  useEffect(() => {
    fetchListings();
  }, [filter]);

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

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h1>Campus Marketplace</h1>
        <div style={{ display: "flex", gap: "10px" }}>
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
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
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