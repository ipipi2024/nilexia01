import { Db, ObjectId, Collection } from "mongodb";
import client from "../mongodb";

// Get database instance
const db: Db = client.db();

// TypeScript interfaces for type safety
export interface Message {
  _id?: ObjectId;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  readStatus: boolean;
  createdAt: Date;
}

export interface MessageWithUser extends Message {
  senderName?: string;
  receiverName?: string;
}

export interface Conversation {
  conversationId: string;
  otherUser: {
    id: string;
    name: string;
    email: string;
  };
  lastMessage: {
    content: string;
    timestamp: Date;
    senderId: string;
  };
  unreadCount: number;
}

// Get the messages collection with proper typing
export function getMessagesCollection(): Collection<Message> {
  return db.collection<Message>("messages");
}

// Helper function to generate conversationId by sorting user IDs alphabetically
export function generateConversationId(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join('_');
}

// Ensure indexes are created (call this once on app initialization)
export async function ensureMessageIndexes(): Promise<void> {
  const collection = getMessagesCollection();

  try {
    // Create indexes for efficient querying
    await collection.createIndex({ conversationId: 1, timestamp: -1 });
    await collection.createIndex({ senderId: 1 });
    await collection.createIndex({ receiverId: 1 });
    await collection.createIndex({ conversationId: 1, receiverId: 1, readStatus: 1 }); // For marking as read

    console.log("Message indexes created successfully");
  } catch (error) {
    console.error("Error creating message indexes:", error);
  }
}
