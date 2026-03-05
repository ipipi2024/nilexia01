// Service Worker for Web Push Notifications
// Must be plain JS — no TypeScript, no ES module syntax

self.addEventListener("push", function (event) {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "New message", body: event.data.text(), url: "/messages" };
  }

  const title = payload.title || "New message";
  const options = {
    body: payload.body || "You received a new message",
    data: { url: payload.url || "/messages" },
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || "/messages";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        // If a tab with this app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        // Otherwise open a new tab
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
