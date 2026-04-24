"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import MessageButton from "@/app/components/MessageButton";
import { useSession } from "@/app/lib/auth-client";
import PageContainer from "@/app/components/layout/PageContainer";
import Badge from "@/app/components/ui/Badge";
import Alert from "@/app/components/ui/Alert";
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
  user?: { id: string; name: string; email: string };
}

export default function ListingDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => { fetchListing(); }, [params.id]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/listings/${params.id}`);
      if (response.ok) {
        setListing(await response.json());
      } else if (response.status === 404) {
        setError("Listing not found");
      } else {
        setError("Failed to load listing");
      }
    } catch {
      setError("Failed to load listing");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;

  if (error || !listing) {
    return (
      <PageContainer size="medium">
        <Link href="/" className="back-link">← Back to listings</Link>
        <Alert variant="error">{error || "Listing not found"}</Alert>
      </PageContainer>
    );
  }

  const isOwner = session && listing.user && session.user.id === listing.user.id;

  return (
    <PageContainer size="medium">
      <Link href="/" className="back-link">← Back to listings</Link>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Image gallery */}
        {listing.images.length > 0 && (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <img
              src={listing.images[0]}
              alt={listing.title}
              style={{
                width: "100%",
                maxHeight: "420px",
                objectFit: "contain",
                background: "var(--c-gray-50)",
                display: "block",
              }}
            />
            {listing.images.length > 1 && (
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  padding: "12px",
                  overflowX: "auto",
                  borderTop: "1px solid var(--c-gray-200)",
                  background: "#fff",
                }}
              >
                {listing.images.slice(1).map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${listing.title} ${idx + 2}`}
                    style={{
                      width: "72px",
                      height: "72px",
                      minWidth: "72px",
                      objectFit: "cover",
                      borderRadius: "var(--r)",
                      border: "1.5px solid var(--c-gray-200)",
                      cursor: "pointer",
                      transition: "border-color 0.15s",
                    }}
                    onClick={() => {
                      const newImages = [img, ...listing.images.filter(i => i !== img)];
                      setListing({ ...listing, images: newImages });
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--c-primary)")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--c-gray-200)")}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main info card */}
        <div className="section-card">
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <Badge type={listing.type} />
            {listing.status !== "available" && <Badge status={listing.status} />}
          </div>

          <h1 style={{ fontSize: "26px", fontWeight: 700, marginBottom: "8px", letterSpacing: "-0.02em" }}>
            {listing.title}
          </h1>

          {listing.price !== null && (
            <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--c-success)", marginBottom: "4px" }}>
              ${listing.price}
              {listing.type === "rent" && listing.rentPeriod && (
                <span style={{ fontSize: "16px", fontWeight: 400, color: "var(--c-gray-500)" }}>
                  {" "}/{listing.rentPeriod}
                </span>
              )}
            </div>
          )}

          <p style={{ fontSize: "12px", color: "var(--c-gray-400)", marginTop: "8px" }}>
            Posted {new Date(listing.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Description */}
        <div className="section-card">
          <h3 className="section-card__title">Description</h3>
          <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.65", fontSize: "14px", color: "var(--c-gray-700)" }}>
            {listing.description}
          </p>
        </div>

        {/* Seller contact */}
        {listing.user && (
          <div className="section-card">
            <h3 className="section-card__title">
              {isOwner ? "Your Listing" : "Contact Seller"}
            </h3>
            <p style={{ fontSize: "14px", color: "var(--c-gray-700)", marginBottom: "4px" }}>
              <strong>Name:</strong> {listing.user.name}
            </p>
            <p style={{ fontSize: "14px", color: "var(--c-gray-700)", marginBottom: "16px" }}>
              <strong>Email:</strong>{" "}
              <a href={`mailto:${listing.user.email}`}>{listing.user.email}</a>
            </p>

            {isOwner ? (
              <Link href={`/listings/${listing.id}/edit`} className="btn btn-primary">
                Edit Listing
              </Link>
            ) : (
              <MessageButton userId={listing.user.id} userName={listing.user.name} />
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
