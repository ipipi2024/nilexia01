"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useUploadThing } from "@/app/lib/uploadthing-utils";
import { useSession } from "@/app/lib/auth-client";
import PageContainer from "@/app/components/layout/PageContainer";
import Input from "@/app/components/ui/Input";
import Textarea from "@/app/components/ui/Textarea";
import Select from "@/app/components/ui/Select";
import Button from "@/app/components/ui/Button";
import Alert from "@/app/components/ui/Alert";
import LoadingState from "@/app/components/ui/LoadingState";

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;
  const { data: session, isPending } = useSession();

  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [error, setError]           = useState("");

  const [title, setTitle]               = useState("");
  const [description, setDescription]   = useState("");
  const [type, setType]                 = useState<"sell" | "donate" | "rent">("sell");
  const [status, setStatus]             = useState<"available" | "sold" | "donated" | "rented">("available");
  const [price, setPrice]               = useState("");
  const [rentPeriod, setRentPeriod]     = useState<"hour" | "day" | "week" | "month" | "year">("month");
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles]         = useState<File[]>([]);

  const { startUpload } = useUploadThing("listingImageUploader");

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`/api/listings/${listingId}`, { credentials: "include" });
        if (response.ok) {
          const listing = await response.json();
          if (session && listing.userId !== session.user.id) {
            setError("You don't have permission to edit this listing");
            setLoading(false);
            return;
          }
          setTitle(listing.title);
          setDescription(listing.description);
          setType(listing.type);
          setStatus(listing.status || "available");
          setPrice(listing.price?.toString() || "");
          setRentPeriod(listing.rentPeriod || "month");
          setUploadedImageUrls(listing.images || []);
          setLoading(false);
        } else {
          setError("Failed to load listing");
          setLoading(false);
        }
      } catch {
        setError("Failed to load listing");
        setLoading(false);
      }
    };
    if (session && listingId) fetchListing();
  }, [listingId, session]);

  if (isPending || loading) return <LoadingState />;
  if (!session) return null;

  if (error && !title) {
    return (
      <PageContainer size="narrow">
        <Alert variant="error" className="mb-4">{error}</Alert>
        <Link href="/" className="back-link">← Back to listings</Link>
      </PageContainer>
    );
  }

  const handleTypeChange = (newType: "sell" | "donate" | "rent") => {
    setType(newType);
    if (status !== "available") {
      if (newType === "sell")    setStatus("sold");
      else if (newType === "rent")   setStatus("rented");
      else if (newType === "donate") setStatus("donated");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + uploadedImageUrls.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }
    if (files.some(f => f.size > 16 * 1024 * 1024)) {
      setError("Each image must be less than 16MB");
      return;
    }
    setSelectedFiles(files);
    setError("");
  };

  const handleUploadImages = async () => {
    if (!selectedFiles.length) return;
    try {
      setUploading(true);
      setError("");
      const uploadResult = await startUpload(selectedFiles);
      if (uploadResult) {
        setUploadedImageUrls([...uploadedImageUrls, ...uploadResult.map(f => f.url)]);
        setSelectedFiles([]);
        const el = document.getElementById("file-input") as HTMLInputElement;
        if (el) el.value = "";
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
    setSubmitting(true);

    try {
      const body: any = { title, description, type, status, images: uploadedImageUrls };

      if (type === "donate") {
        body.price = null;
      } else {
        const priceValue = parseFloat(price);
        if (isNaN(priceValue) || priceValue < 0) {
          setError("Please enter a valid price");
          setSubmitting(false);
          return;
        }
        body.price = priceValue;
      }

      if (type === "rent") body.rentPeriod = rentPeriod;

      const response = await fetch(`/api/listings/${listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (response.ok) {
        router.push(`/listings/${listingId}`);
      } else {
        const data = await response.json();
        setError(data.details ? data.details.map((d: any) => d.message).join(", ") : data.error || "Failed to update listing");
      }
    } catch {
      setError("Failed to update listing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer size="narrow">
      <Link href={`/listings/${listingId}`} className="back-link">← Back to listing</Link>

      <div className="card" style={{ padding: "28px 24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "24px" }}>Edit Listing</h1>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <Input
            id="title"
            label="Title *"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={3}
            maxLength={100}
            placeholder="e.g., MacBook Pro 2021"
          />

          <Textarea
            id="description"
            label="Description *"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            minLength={10}
            maxLength={1000}
            rows={5}
            placeholder="Describe the item, its condition, and any details…"
            hint={`${description.length}/1000 characters`}
          />

          <Select
            id="type"
            label="Listing Type *"
            value={type}
            onChange={(e) => handleTypeChange(e.target.value as "sell" | "donate" | "rent")}
          >
            <option value="sell">For Sale</option>
            <option value="donate">Free / Donate</option>
            <option value="rent">For Rent</option>
          </Select>

          {type !== "donate" && (
            <Input
              id="price"
              label="Price ($) *"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              placeholder="0.00"
            />
          )}

          {type === "rent" && (
            <Select
              id="rentPeriod"
              label="Rental Period *"
              value={rentPeriod}
              onChange={(e) => setRentPeriod(e.target.value as any)}
            >
              <option value="hour">Per Hour</option>
              <option value="day">Per Day</option>
              <option value="week">Per Week</option>
              <option value="month">Per Month</option>
              <option value="year">Per Year</option>
            </Select>
          )}

          {/* Images */}
          <div className="form-group">
            <span className="form-label">Images (Optional, max 5)</span>

            <input
              id="file-input"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              disabled={uploadedImageUrls.length >= 5 || uploading}
              className="form-file-input"
            />

            {selectedFiles.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
                <span className="form-hint">{selectedFiles.length} file(s) selected</span>
                <Button
                  type="button"
                  variant="success"
                  size="sm"
                  loading={uploading}
                  onClick={handleUploadImages}
                >
                  {uploading ? "Uploading…" : "Upload Images"}
                </Button>
              </div>
            )}

            {uploadedImageUrls.length > 0 && (
              <div style={{ marginTop: "12px" }}>
                <span className="form-hint" style={{ display: "block", marginBottom: "8px" }}>
                  Uploaded ({uploadedImageUrls.length}/5):
                </span>
                <div className="image-preview-grid">
                  {uploadedImageUrls.map((url, index) => (
                    <div key={index} className="image-preview-item">
                      <img src={url} alt={`Upload ${index + 1}`} />
                      <button
                        type="button"
                        className="image-preview-remove"
                        onClick={() => removeUploadedImage(index)}
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <span className="form-hint" style={{ marginTop: "6px" }}>
              PNG / JPG, max 16 MB each
            </span>
          </div>

          {error && <Alert variant="error">{error}</Alert>}

          <Button
            type="submit"
            loading={submitting}
            size="lg"
            style={{ width: "100%" }}
          >
            {submitting ? "Saving…" : "Save Changes"}
          </Button>
        </form>
      </div>
    </PageContainer>
  );
}
