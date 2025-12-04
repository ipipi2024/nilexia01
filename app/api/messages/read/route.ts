import { NextRequest, NextResponse } from "next/server";
import { getMessagesCollection } from "@/app/lib/models/message";
import { requireAuth } from "@/app/lib/auth-helpers";

/**
 * PATCH /api/messages/read
 * Mark messages in a conversation as read
 * Requires authentication
 */
export async function PATCH(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Parse request body
    const body = await request.json();
    const { conversationId } = body;

    if (!conversationId || typeof conversationId !== "string") {
      return NextResponse.json(
        { error: "conversationId is required and must be a string" },
        { status: 400 }
      );
    }

    // Update messages collection
    const collection = getMessagesCollection();
    const result = await collection.updateMany(
      {
        conversationId: conversationId,
        receiverId: user.id, // Only mark as read if I'm the receiver
        readStatus: false
      },
      {
        $set: { readStatus: true }
      }
    );

    return NextResponse.json(
      {
        success: true,
        modifiedCount: result.modifiedCount,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error marking messages as read:", error);

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to mark messages as read." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
