import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getMessagesCollection, generateConversationId, Message } from "@/app/lib/models/message";
import { validateSendMessage, sanitizeString } from "@/app/lib/validation/message";
import { requireAuth } from "@/app/lib/auth-helpers";
import client from "@/app/lib/mongodb";

/**
 * POST /api/messages
 * Send a message to another user
 * Requires authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = validateSendMessage(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const { receiverId, content } = body;

    // Validate: Can't message yourself
    if (user.id === receiverId) {
      return NextResponse.json(
        { error: "You cannot send messages to yourself" },
        { status: 400 }
      );
    }

    // Validate: receiverId exists in users collection
    const db = client.db();
    const usersCollection = db.collection("user");
    const receiverExists = await usersCollection.findOne({ _id: new ObjectId(receiverId) });

    if (!receiverExists) {
      return NextResponse.json(
        { error: "Receiver not found" },
        { status: 404 }
      );
    }

    // Sanitize content
    const sanitizedContent = sanitizeString(content);

    // Generate conversationId using sorted IDs
    const conversationId = generateConversationId(user.id, receiverId);

    // Prepare message data
    const now = new Date();
    const message: Message = {
      conversationId,
      senderId: user.id,
      receiverId,
      content: sanitizedContent,
      timestamp: now,
      readStatus: false,
      createdAt: now,
    };

    // Insert into database
    const collection = getMessagesCollection();
    const result = await collection.insertOne(message);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        messageId: result.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error sending message:", error);

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to send messages." },
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
 * GET /api/messages?userId={otherUserId}
 * Get conversation with a specific user
 * Requires authentication
 * Query parameters:
 *   - userId: The other user's ID
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const otherUserId = searchParams.get("userId");

    if (!otherUserId) {
      return NextResponse.json(
        { error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    // Validate otherUserId format
    if (!ObjectId.isValid(otherUserId)) {
      return NextResponse.json(
        { error: "Invalid userId format" },
        { status: 400 }
      );
    }

    // Generate conversationId
    const conversationId = generateConversationId(user.id, otherUserId);

    // Get messages from database
    const collection = getMessagesCollection();
    const messages = await collection
      .find({ conversationId })
      .sort({ timestamp: 1 }) // Oldest first (chronological order)
      .toArray();

    // Transform messages to include string _id
    const transformedMessages = messages.map((message) => ({
      ...message,
      _id: message._id?.toString(),
    }));

    return NextResponse.json(
      { messages: transformedMessages },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching messages:", error);

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to view messages." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
