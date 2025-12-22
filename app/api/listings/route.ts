import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getListingsCollection, Listing } from "@/app/lib/models/listing";
import { validateCreateListing, sanitizeString } from "@/app/lib/validation/listing";
import { requireAuth } from "@/app/lib/auth-helpers";

/**
 * POST /api/listings
 * Create a new listing
 * Requires authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = validateCreateListing(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Sanitize strings to prevent injection
    const sanitizedTitle = sanitizeString(body.title);
    const sanitizedDescription = sanitizeString(body.description);

    // Prepare listing data
    const now = new Date();
    const listing: Listing = {
      userId: new ObjectId(user.id),
      title: sanitizedTitle,
      description: sanitizedDescription,
      type: body.type,
      price: body.type === "donate" ? null : body.price,
      rentPeriod: body.type === "rent" ? body.rentPeriod : undefined,
      images: body.images || [],
      status: "available",
      createdAt: now,
      updatedAt: now,
    };

    // Insert into database
    const collection = getListingsCollection();
    const result = await collection.insertOne(listing);

    // Return created listing
    const createdListing = {
      ...listing,
      _id: result.insertedId,
      id: result.insertedId.toString(),
    };

    return NextResponse.json(createdListing, { status: 201 });
  } catch (error: any) {
    console.error("Error creating listing:", error);

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to create a listing." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/listings
 * Get all available listings with optional filters
 * Query parameters:
 *   - type: Filter by listing type (sell, donate, rent)
 *   - limit: Number of results to return (default: 20)
 *   - skip: Number of results to skip for pagination (default: 0)
 *   - includeUnavailable: Include unavailable listings (requires authentication, shows only user's own listings)
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100); // Max 100
    const skip = parseInt(searchParams.get("skip") || "0");
    const includeUnavailable = searchParams.get("includeUnavailable") === "true";

    // Build query filter
    const filter: any = {};

    // Only filter by status if not requesting unavailable listings
    if (!includeUnavailable) {
      filter.status = "available";
    }

    if (type && ["sell", "donate", "rent"].includes(type)) {
      filter.type = type;
    }

    // Get listings from database
    const collection = getListingsCollection();
    const listings = await collection
      .find(filter)
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit)
      .toArray();

    // Transform listings to include string id
    const transformedListings = listings.map((listing) => ({
      ...listing,
      id: listing._id?.toString(),
      userId: listing.userId.toString(),
    }));

    return NextResponse.json(transformedListings, { status: 200 });
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
