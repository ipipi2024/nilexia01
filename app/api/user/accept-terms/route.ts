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

    const result = await db.collection("user").updateOne(
      { _id: new ObjectId(user.id) },
      {
        $set: {
          termsAcceptedAt: new Date(),
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
      message: "Terms and Conditions accepted successfully",
    });
  } catch (error) {
    console.error("Error accepting Terms and Conditions:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to accept Terms and Conditions" },
      { status: 500 }
    );
  }
}
