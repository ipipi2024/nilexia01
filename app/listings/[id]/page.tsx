"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import MessageButton from "@/app/components/MessageButton";
import { useSession } from "@/app/lib/auth-client";

interface Listing {
  id: string;
  title: string;
  description: string;
  type: "sell" | "donate" | "rent";
  price: number | null;
  rentPeriod?: "hour" | "day" | "week" | "month" | "year";
  images: string[];
  status: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchListing();
  }, [params.id]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/listings/${params.id}`);

      if (response.ok) {
        const data = await response.json();
        setListing(data);
      } else if (response.status === 404) {
        setError("Listing not found");
      } else {
        setError("Failed to load listing");
      }
    } catch (err) {
      setError("Failed to load listing");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "800px", margin: "50px auto", padding: "20px" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div style={{ maxWidth: "800px", margin: "50px auto", padding: "20px" }}>
        <p style={{ color: "red" }}>{error || "Listing not found"}</p>
        <Link href="/" style={{ color: "#007bff" }}>
          ← Back to listings
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "20px auto", padding: "15px" }}>
      <Link href="/" style={{ color: "#007bff", marginBottom: "20px", display: "inline-block" }}>
        ← Back to listings
      </Link>

      <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px" }}>
        {listing.images.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <img
              src={listing.images[0]}
              alt={listing.title}
              style={{
                width: "100%",
                maxHeight: "400px",
                objectFit: "contain",
                borderRadius: "8px",
                backgroundColor: "#f5f5f5"
              }}
            />
            {listing.images.length > 1 && (
              <div style={{
                display: "flex",
                gap: "10px",
                marginTop: "10px",
                overflowX: "auto",
                WebkitOverflowScrolling: "touch"
              }}>
                {listing.images.slice(1).map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${listing.title} ${idx + 2}`}
                    style={{
                      width: "80px",
                      height: "80px",
                      minWidth: "80px",
                      objectFit: "cover",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                    onClick={() => {
                      const newImages = [img, ...listing.images.filter(i => i !== img)];
                      setListing({ ...listing, images: newImages });
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ marginBottom: "10px" }}>
          <span style={{
            display: "inline-block",
            padding: "6px 12px",
            backgroundColor:
              listing.type === "sell" ? "#28a745" :
              listing.type === "donate" ? "#17a2b8" : "#ffc107",
            color: "white",
            borderRadius: "4px",
            fontSize: "14px"
          }}>
            {listing.type === "sell" ? "For Sale" :
             listing.type === "donate" ? "Free/Donate" : "For Rent"}
          </span>
        </div>

        <h1 style={{ margin: "20px 0" }}>{listing.title}</h1>

        {listing.price !== null && (
          <p style={{ fontSize: "32px", fontWeight: "bold", color: "#28a745", margin: "10px 0" }}>
            ${listing.price}
            {listing.type === "rent" && listing.rentPeriod && <span style={{ fontSize: "16px", color: "#666" }}> /{listing.rentPeriod}</span>}
          </p>
        )}

        <div style={{
          backgroundColor: "#f8f9fa",
          padding: "20px",
          borderRadius: "8px",
          marginTop: "20px"
        }}>
          <h3 style={{ marginTop: 0 }}>Description</h3>
          <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
            {listing.description}
          </p>
        </div>

        {listing.user && (
          <div style={{
            backgroundColor: "#f8f9fa",
            padding: "20px",
            borderRadius: "8px",
            marginTop: "20px"
          }}>
            <h3 style={{ marginTop: 0 }}>Contact Seller</h3>
            <p style={{ margin: "5px 0" }}>
              <strong>Name:</strong> {listing.user.name}
            </p>
            <p style={{ margin: "5px 0 15px 0" }}>
              <strong>Email:</strong>{" "}
              <a href={`mailto:${listing.user.email}`} style={{ color: "#007bff" }}>
                {listing.user.email}
              </a>
            </p>
            {session && session.user.id === listing.user.id ? (
              <Link
                href={`/listings/${listing.id}/edit`}
                style={{
                  display: "inline-block",
                  padding: "10px 20px",
                  backgroundColor: "#007bff",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "4px",
                  fontWeight: "bold"
                }}
              >
                Edit Listing
              </Link>
            ) : (
              <MessageButton userId={listing.user.id} userName={listing.user.name} />
            )}
          </div>
        )}

        <div style={{ marginTop: "20px", color: "#666", fontSize: "14px" }}>
          <p>Posted on: {new Date(listing.createdAt).toLocaleDateString()}</p>
          <p>Status: {listing.status}</p>
        </div>
      </div>
    </div>
  );
}
