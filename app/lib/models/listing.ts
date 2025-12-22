import { Db, ObjectId, Collection } from "mongodb";
import client from "../mongodb";

// Get database instance
const db: Db = client.db();

// TypeScript interfaces for type safety
export interface Listing {
  _id?: ObjectId;
  userId: ObjectId;
  title: string;
  description: string;
  type: "sell" | "donate" | "rent";
  price: number | null;
  rentPeriod?: "hour" | "day" | "week" | "month" | "year";
  images: string[];
  status: "available" | "unavailable";
  createdAt: Date;
  updatedAt: Date;
}

export interface ListingWithUser extends Listing {
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// Get the listings collection with proper typing
export function getListingsCollection(): Collection<Listing> {
  return db.collection<Listing>("listings");
}

// Ensure indexes are created (call this once on app initialization)
export async function ensureListingIndexes(): Promise<void> {
  const collection = getListingsCollection();

  try {
    // Create indexes for efficient querying
    await collection.createIndex({ userId: 1 });
    await collection.createIndex({ status: 1 });
    await collection.createIndex({ createdAt: -1 }); // Descending for newest first
    await collection.createIndex({ type: 1 });

    // Compound index for common query patterns
    await collection.createIndex({ status: 1, createdAt: -1 });
    await collection.createIndex({ type: 1, status: 1, createdAt: -1 });

    console.log("Listing indexes created successfully");
  } catch (error) {
    console.error("Error creating listing indexes:", error);
  }
}
