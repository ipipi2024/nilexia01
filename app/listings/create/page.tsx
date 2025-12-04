"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"sell" | "donate" | "rent">("sell");
  const [price, setPrice] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([""]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Filter out empty image URLs
      const validImages = imageUrls.filter(url => url.trim() !== "");

      const body: any = {
        title,
        description,
        type,
        images: validImages,
      };

      // Only include price if not donate type
      if (type === "donate") {
        body.price = null;
      } else {
        const priceValue = parseFloat(price);
        if (isNaN(priceValue) || priceValue < 0) {
          setError("Please enter a valid price");
          setLoading(false);
          return;
        }
        body.price = priceValue;
      }

      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const listing = await response.json();
        router.push(`/listings/${listing.id}`);
      } else {
        const data = await response.json();
        if (data.details) {
          setError(data.details.map((d: any) => d.message).join(", "));
        } else {
          setError(data.error || "Failed to create listing");
        }
      }
    } catch (err) {
      setError("Failed to create listing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addImageField = () => {
    if (imageUrls.length < 5) {
      setImageUrls([...imageUrls, ""]);
    }
  };

  const removeImageField = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const updateImageUrl = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto", padding: "20px" }}>
      <Link href="/listings" style={{ color: "#007bff", marginBottom: "20px", display: "inline-block" }}>
        ← Back to listings
      </Link>

      <h1>Create New Listing</h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <label htmlFor="title" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={3}
            maxLength={100}
            placeholder="e.g., MacBook Pro 2021"
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>

        <div>
          <label htmlFor="description" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Description *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            minLength={10}
            maxLength={1000}
            rows={5}
            placeholder="Describe the item, its condition, and any details..."
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              resize: "vertical",
            }}
          />
          <small style={{ color: "#666" }}>
            {description.length}/1000 characters
          </small>
        </div>

        <div>
          <label htmlFor="type" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Listing Type *
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          >
            <option value="sell">For Sale</option>
            <option value="donate">Free/Donate</option>
            <option value="rent">For Rent</option>
          </select>
        </div>

        {type !== "donate" && (
          <div>
            <label htmlFor="price" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Price ($) *
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              placeholder="0.00"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </div>
        )}

        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Image URLs (Optional, max 5)
          </label>
          {imageUrls.map((url, index) => (
            <div key={index} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <input
                type="url"
                value={url}
                onChange={(e) => updateImageUrl(index, e.target.value)}
                placeholder="https://example.com/image.jpg"
                style={{
                  flex: 1,
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
              {imageUrls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImageField(index)}
                  style={{
                    padding: "10px 15px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {imageUrls.length < 5 && (
            <button
              type="button"
              onClick={addImageField}
              style={{
                padding: "8px 16px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              + Add Image URL
            </button>
          )}
          <small style={{ display: "block", marginTop: "5px", color: "#666" }}>
            Paste direct image URLs (e.g., from Imgur, Google Drive, etc.)
          </small>
        </div>

        {error && (
          <div style={{ color: "red", padding: "10px", backgroundColor: "#fee", borderRadius: "4px" }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px",
            backgroundColor: loading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          {loading ? "Creating..." : "Create Listing"}
        </button>
      </form>
    </div>
  );
}
