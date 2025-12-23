import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/lib/auth-helpers";
import client from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await requireAuth();

    // Get database instance
    const db = client.db();

    // Fetch user document to check NDA status
    const userDoc = await db.collection("user").findOne(
      { _id: new ObjectId(user.id) },
      { projection: { ndaAcceptedAt: 1 } }
    );

    if (!userDoc) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      hasAcceptedNDA: !!userDoc.ndaAcceptedAt,
      ndaAcceptedAt: userDoc.ndaAcceptedAt || null,
    });
  } catch (error) {
    console.error("Error fetching NDA status:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch NDA status" },
      { status: 500 }
    );
  }
}
