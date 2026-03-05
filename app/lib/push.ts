import webpush from "web-push";
import { getPushSubscriptionsCollection } from "./models/push-subscription";

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

interface PushPayload {
  title: string;
  body: string;
  url: string;
}

export async function sendPushToUser(userId: string, payload: PushPayload): Promise<void> {
  const collection = getPushSubscriptionsCollection();
  const subscriptions = await collection.find({ userId }).toArray();

  if (subscriptions.length === 0) return;

  const payloadString = JSON.stringify(payload);

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth,
            },
          },
          payloadString
        );
      } catch (error: any) {
        const status = error?.statusCode;
        // 410 Gone or 404 Not Found means the subscription is no longer valid
        if (status === 410 || status === 404) {
          await collection.deleteOne({ endpoint: sub.endpoint });
        } else {
          console.error(`Push notification failed for endpoint ${sub.endpoint}:`, error?.message);
        }
      }
    })
  );
}
