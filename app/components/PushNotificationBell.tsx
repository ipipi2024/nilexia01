"use client";

import { useState, useEffect, useRef } from "react";
import Button from "@/app/components/ui/Button";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i);
  return output;
}

export default function PushNotificationBell() {
  const [isSupported, setIsSupported] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState("");
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setIsSupported(false);
      setIsLoading(false);
      return;
    }

    async function init() {
      try {
        await navigator.serviceWorker.register("/sw.js");
        registrationRef.current = await navigator.serviceWorker.ready;
        const existing = await registrationRef.current.pushManager.getSubscription();
        setIsSubscribed(!!existing);
      } catch (err) {
        console.error("Service worker registration failed:", err);
        setIsSupported(false);
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, []);

  const handleEnable = async () => {
    setIsLoading(true);
    setError("");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setError("Allow notifications in your browser settings to enable this.");
        return;
      }

      const reg = registrationRef.current;
      if (!reg) throw new Error("Service worker not ready");

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) throw new Error("VAPID public key not configured");

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const subJson = subscription.toJSON();
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          keys: { p256dh: subJson.keys?.p256dh, auth: subJson.keys?.auth },
        }),
      });

      if (!response.ok) throw new Error("Failed to save subscription");
      setIsSubscribed(true);
    } catch (err: any) {
      setError(err.message || "Failed to enable notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    setIsLoading(true);
    setError("");
    try {
      const reg = registrationRef.current;
      if (!reg) throw new Error("Service worker not ready");

      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        await existing.unsubscribe();
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: existing.endpoint }),
        });
      }
      setIsSubscribed(false);
    } catch (err: any) {
      setError(err.message || "Failed to disable notifications");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
      <Button
        variant={isSubscribed ? "success" : "ghost"}
        size="sm"
        loading={isLoading}
        onClick={isSubscribed ? handleDisable : handleEnable}
        title={isSubscribed ? "Disable push notifications" : "Enable push notifications"}
      >
        {!isLoading && <span>{isSubscribed ? "🔔" : "🔕"}</span>}
        {isLoading ? "Working…" : isSubscribed ? "Notifications on" : "Notifications off"}
      </Button>
      {error && (
        <p style={{ margin: 0, fontSize: "12px", color: "var(--c-danger)", maxWidth: "220px", textAlign: "right" }}>
          {error}
        </p>
      )}
    </div>
  );
}
