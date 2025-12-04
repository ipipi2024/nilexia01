import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import client from "@/app/lib/mongodb";

/**
 * GET /api/users/[id]
 * Get public user information by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    // Validate userId format
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    // Get user from database
    const db = client.db();
    const usersCollection = db.collection("user");
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { name: 1, email: 1 } } // Only return public fields
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
