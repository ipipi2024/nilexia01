import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getListingsCollection } from "@/app/lib/models/listing";
import { validateUpdateListing, sanitizeString, isValidObjectId } from "@/app/lib/validation/listing";
import { requireAuth, getAuthUser } from "@/app/lib/auth-helpers";
import client from "@/app/lib/mongodb";

/**
 * GET /api/listings/:id
 * Get a single listing by ID with populated user information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid listing ID format" },
        { status: 400 }
      );
    }

    const collection = getListingsCollection();
    const db = client.db();

    // Use aggregation to populate user information
    const listings = await collection
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
        {
          $lookup: {
            from: "user",
            localField: "userId",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        {
          $unwind: {
            path: "$userInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            title: 1,
            description: 1,
            type: 1,
            price: 1,
            images: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
            user: {
              id: { $toString: "$userInfo._id" },
              name: "$userInfo.name",
              email: "$userInfo.email",
            },
          },
        },
      ])
      .toArray();

    if (listings.length === 0) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    const listing = listings[0];

    // Transform response
    const response = {
      ...listing,
      id: listing._id.toString(),
      userId: listing.userId.toString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching listing:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/listings/:id
 * Update a listing
 * Requires authentication and ownership
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Require authentication
    const user = await requireAuth();

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid listing ID format" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = validateUpdateListing(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const collection = getListingsCollection();

    // Check if listing exists and user owns it
    const existingListing = await collection.findOne({
      _id: new ObjectId(id),
    });

    if (!existingListing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (existingListing.userId.toString() !== user.id) {
      return NextResponse.json(
        { error: "Forbidden. You can only update your own listings." },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.title !== undefined) {
      updateData.title = sanitizeString(body.title);
    }

    if (body.description !== undefined) {
      updateData.description = sanitizeString(body.description);
    }

    if (body.price !== undefined) {
      updateData.price = body.price;
    }

    if (body.images !== undefined) {
      updateData.images = body.images;
    }

    if (body.status !== undefined) {
      updateData.status = body.status;
    }

    // Update listing
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { error: "Failed to update listing" },
        { status: 500 }
      );
    }

    // Transform response
    const response = {
      ...result,
      id: result._id.toString(),
      userId: result.userId.toString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("Error updating listing:", error);

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to update listings." },
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
 * DELETE /api/listings/:id
 * Delete a listing
 * Requires authentication and ownership
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Require authentication
    const user = await requireAuth();

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid listing ID format" },
        { status: 400 }
      );
    }

    const collection = getListingsCollection();

    // Check if listing exists and user owns it
    const existingListing = await collection.findOne({
      _id: new ObjectId(id),
    });

    if (!existingListing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (existingListing.userId.toString() !== user.id) {
      return NextResponse.json(
        { error: "Forbidden. You can only delete your own listings." },
        { status: 403 }
      );
    }

    // Delete listing
    await collection.deleteOne({ _id: new ObjectId(id) });

    // Return 204 No Content
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("Error deleting listing:", error);

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to delete listings." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
