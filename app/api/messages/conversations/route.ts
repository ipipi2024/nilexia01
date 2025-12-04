import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getMessagesCollection, Conversation } from "@/app/lib/models/message";
import { requireAuth } from "@/app/lib/auth-helpers";
import client from "@/app/lib/mongodb";

/**
 * GET /api/messages/conversations
 * List all user's conversations
 * Requires authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Get messages collection
    const collection = getMessagesCollection();

    // Use MongoDB aggregation pipeline to get conversations
    const pipeline = [
      // Stage 1: Find all messages where user is sender OR receiver
      {
        $match: {
          $or: [
            { senderId: user.id },
            { receiverId: user.id }
          ]
        }
      },
      // Stage 2: Sort by timestamp descending (newest first)
      {
        $sort: { timestamp: -1 }
      },
      // Stage 3: Group by conversationId
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiverId', user.id] },
                    { $eq: ['$readStatus', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      // Stage 4: Sort by lastMessage timestamp
      {
        $sort: { 'lastMessage.timestamp': -1 }
      }
    ];

    const aggregationResult = await collection.aggregate(pipeline).toArray();

    // For each conversation, lookup the other user's information
    const db = client.db();
    const usersCollection = db.collection("user");

    const conversations: Conversation[] = await Promise.all(
      aggregationResult.map(async (conv) => {
        const lastMessage = conv.lastMessage;

        // Determine the other user's ID
        const otherUserId = lastMessage.senderId === user.id
          ? lastMessage.receiverId
          : lastMessage.senderId;

        // Lookup other user's information
        const otherUser = await usersCollection.findOne(
          { _id: new ObjectId(otherUserId) },
          { projection: { name: 1, email: 1 } }
        );

        return {
          conversationId: conv._id,
          otherUser: {
            id: otherUserId,
            name: otherUser?.name || "Unknown User",
            email: otherUser?.email || "",
          },
          lastMessage: {
            content: lastMessage.content,
            timestamp: lastMessage.timestamp,
            senderId: lastMessage.senderId,
          },
          unreadCount: conv.unreadCount,
        };
      })
    );

    return NextResponse.json(
      { conversations },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching conversations:", error);

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to view conversations." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
