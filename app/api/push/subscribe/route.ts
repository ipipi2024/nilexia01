import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/lib/auth-helpers";
import { getPushSubscriptionsCollection } from "@/app/lib/models/push-subscription";
import { ensurePushSubscriptionIndexes } from "@/app/lib/models/push-subscription";

/**
 * POST /api/push/subscribe
 * Save a push subscription for the authenticated user.
 * Uses upsert on endpoint to handle re-subscription after browser restart.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { endpoint, keys } = body;

    if (
      typeof endpoint !== "string" ||
      !endpoint ||
      typeof keys?.p256dh !== "string" ||
      !keys.p256dh ||
      typeof keys?.auth !== "string" ||
      !keys.auth
    ) {
      return NextResponse.json(
        { error: "Invalid subscription data" },
        { status: 400 }
      );
    }

    await ensurePushSubscriptionIndexes();

    const collection = getPushSubscriptionsCollection();
    await collection.updateOne(
      { endpoint },
      {
        $set: {
          userId: user.id,
          endpoint,
          keys: { p256dh: keys.p256dh, auth: keys.auth },
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error saving push subscription:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/push/subscribe
 * Remove a push subscription for the authenticated user.
 * Scoped by userId so users can only remove their own subscriptions.
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { endpoint } = body;

    if (typeof endpoint !== "string" || !endpoint) {
      return NextResponse.json(
        { error: "endpoint is required" },
        { status: 400 }
      );
    }

    const collection = getPushSubscriptionsCollection();
    await collection.deleteOne({ userId: user.id, endpoint });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error removing push subscription:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
