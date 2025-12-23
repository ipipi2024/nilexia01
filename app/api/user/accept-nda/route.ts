import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/lib/auth-helpers";
import client from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await requireAuth();

    // Get database instance
    const db = client.db();

    // Update user document with NDA acceptance timestamp
    const result = await db.collection("user").updateOne(
      { _id: new ObjectId(user.id) },
      {
        $set: {
          ndaAcceptedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "NDA accepted successfully",
    });
  } catch (error) {
    console.error("Error accepting NDA:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to accept NDA" },
      { status: 500 }
    );
  }
}
