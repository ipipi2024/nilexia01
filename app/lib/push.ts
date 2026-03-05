import webpush from "web-push";
import http2 from "http2";
import { getPushSubscriptionsCollection } from "./models/push-subscription";

interface PushPayload {
  title: string;
  body: string;
  url: string;
}

/**
 * Apple's Web Push service (web.push.apple.com) requires HTTP/2.
 * The web-push library uses https.request (HTTP/1.1), which causes
 * "socket hang up" against Apple's endpoint. This function uses
 * Node's built-in http2 module to make the request instead.
 */
async function sendViaHttp2(requestDetails: {
  endpoint: string;
  headers: Record<string, string>;
  body: Buffer | null;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(requestDetails.endpoint);
    const origin = `${parsedUrl.protocol}//${parsedUrl.host}`;
    const path = parsedUrl.pathname + (parsedUrl.search || "");

    const client = http2.connect(origin);

    const timeout = setTimeout(() => {
      client.destroy();
      reject(new Error("HTTP/2 push request timed out"));
    }, 10000);

    client.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    const reqHeaders: Record<string, string | number> = {
      ":method": "POST",
      ":path": path,
      ":scheme": "https",
      ":authority": parsedUrl.host,
    };

    for (const [key, value] of Object.entries(requestDetails.headers)) {
      reqHeaders[key.toLowerCase()] = value;
    }

    const req = client.request(reqHeaders);

    let statusCode = 0;
    let responseBody = "";

    req.on("response", (headers) => {
      statusCode = headers[":status"] as number;
    });

    req.on("data", (chunk) => {
      responseBody += chunk.toString();
    });

    req.on("end", () => {
      clearTimeout(timeout);
      client.close();
      if (statusCode >= 200 && statusCode < 300) {
        resolve();
      } else {
        const error: any = new Error(
          `Push failed with status ${statusCode}: ${responseBody}`
        );
        error.statusCode = statusCode;
        reject(error);
      }
    });

    req.on("error", (err) => {
      clearTimeout(timeout);
      client.destroy();
      reject(err);
    });

    if (requestDetails.body) {
      req.write(requestDetails.body);
    }
    req.end();
  });
}

export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<void> {
  const vapidEmail = process.env.VAPID_EMAIL;
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

  if (!vapidEmail || !vapidPublicKey || !vapidPrivateKey) {
    console.error(
      "[push] VAPID env vars are not set — cannot send push notifications"
    );
    return;
  }

  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);

  const collection = getPushSubscriptionsCollection();
  const subscriptions = await collection.find({ userId }).toArray();

  if (subscriptions.length === 0) {
    console.log(`[push] No subscriptions found for userId: ${userId}`);
    return;
  }

  const payloadString = JSON.stringify(payload);

  await Promise.all(
    subscriptions.map(async (sub) => {
      const isApple = sub.endpoint.startsWith("https://web.push.apple.com");
      try {
        const subscription = {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
        };

        if (isApple) {
          const requestDetails = await webpush.generateRequestDetails(
            subscription,
            payloadString
          );
          await sendViaHttp2({
            endpoint: requestDetails.endpoint,
            headers: requestDetails.headers as Record<string, string>,
            body: requestDetails.body || null,
          });
        } else {
          await webpush.sendNotification(subscription, payloadString);
        }

        console.log(
          `[push] Delivered to ${isApple ? "Apple" : "other"}: ${sub.endpoint.slice(0, 50)}...`
        );
      } catch (error: any) {
        const status = error?.statusCode;
        if (status === 410 || status === 404) {
          console.log(
            `[push] Stale subscription (${status}), removing: ${sub.endpoint.slice(0, 50)}...`
          );
          await collection.deleteOne({ endpoint: sub.endpoint });
        } else {
          console.error(
            `[push] Failed for ${isApple ? "Apple" : "other"} endpoint: ${error?.message}`
          );
        }
      }
    })
  );
}
