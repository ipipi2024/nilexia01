"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUploadThing } from "@/app/lib/uploadthing-utils";
import { useSession } from "@/app/lib/auth-client";

export default function CreateListingPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"sell" | "donate" | "rent">("sell");
  const [price, setPrice] = useState("");
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { startUpload } = useUploadThing("listingImageUploader");

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div style={{ maxWidth: "600px", margin: "20px auto", padding: "15px", textAlign: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Check total count
    if (files.length + uploadedImageUrls.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }

    // Check file sizes (16MB max per file)
    const oversizedFiles = files.filter(f => f.size > 16 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError("Each image must be less than 16MB");
      return;
    }

    setSelectedFiles(files);
    setError("");
  };

  const handleUploadImages = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setUploading(true);
      setError("");

      const uploadResult = await startUpload(selectedFiles);

      if (uploadResult) {
        const urls = uploadResult.map((file) => file.url);
        setUploadedImageUrls([...uploadedImageUrls, ...urls]);
        setSelectedFiles([]);
        // Clear file input
        const fileInput = document.getElementById("file-input") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImageUrls(uploadedImageUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const body: any = {
        title,
        description,
        type,
        images: uploadedImageUrls,
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

  return (
    <div style={{ maxWidth: "600px", margin: "20px auto", padding: "15px" }}>
      <Link href="/" style={{ color: "#007bff", marginBottom: "20px", display: "inline-block" }}>
        ← Back to listings
      </Link>

      <h1 style={{ fontSize: "clamp(24px, 5vw, 32px)" }}>Create New Listing</h1>

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
            Images (Optional, max 5)
          </label>

          {/* File Input */}
          <div style={{ marginBottom: "15px" }}>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              disabled={uploadedImageUrls.length >= 5 || uploading}
              style={{
                display: "block",
                marginBottom: "10px",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                width: "100%",
              }}
            />
            {selectedFiles.length > 0 && (
              <div>
                <p style={{ margin: "5px 0", fontSize: "14px" }}>
                  {selectedFiles.length} file(s) selected
                </p>
                <button
                  type="button"
                  onClick={handleUploadImages}
                  disabled={uploading}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: uploading ? "#ccc" : "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: uploading ? "not-allowed" : "pointer",
                  }}
                >
                  {uploading ? "Uploading..." : "Upload Images"}
                </button>
              </div>
            )}
          </div>

          {/* Preview Uploaded Images */}
          {uploadedImageUrls.length > 0 && (
            <div>
              <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
                Uploaded Images ({uploadedImageUrls.length}/5):
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {uploadedImageUrls.map((url, index) => (
                  <div key={index} style={{ position: "relative" }}>
                    <img
                      src={url}
                      alt={`Upload ${index + 1}`}
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeUploadedImage(index)}
                      style={{
                        position: "absolute",
                        top: "-5px",
                        right: "-5px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "24px",
                        height: "24px",
                        cursor: "pointer",
                        fontSize: "14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <small style={{ display: "block", marginTop: "10px", color: "#666" }}>
            Select images from your device (max 16MB each, PNG/JPG)
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
