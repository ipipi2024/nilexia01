import { Collection } from "mongodb";
import client from "../mongodb";

export interface PushSubscriptionDoc {
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt: Date;
}

export function getPushSubscriptionsCollection(): Collection<PushSubscriptionDoc> {
  return client.db().collection<PushSubscriptionDoc>("push_subscriptions");
}

export async function ensurePushSubscriptionIndexes(): Promise<void> {
  const collection = getPushSubscriptionsCollection();
  try {
    await collection.createIndex({ endpoint: 1 }, { unique: true });
    await collection.createIndex({ userId: 1 });
    console.log("Push subscription indexes created successfully");
  } catch (error) {
    console.error("Error creating push subscription indexes:", error);
  }
}
