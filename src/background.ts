declare const self: ServiceWorkerGlobalScope;

import { StaleWhileRevalidate, Strategy } from "workbox-strategies";

const cacheName = "extension-follow-it-later";

void purgeOutdatedCaches();

// type WorkboxPlugin = Strategy["plugins"][0];

self.addEventListener("fetch", (event) => {
  const { request } = event;
  // TODO introduce hono to handle routing
  if (request.url === "https://api.follow.is/inboxes/list") {
    event.respondWith(new StaleWhileRevalidate({ cacheName }).handle(event));
  }
});

async function purgeOutdatedCaches() {
  const keys = await caches.keys();
  for (const key of keys) {
    if (key !== cacheName) {
      await caches.delete(key);
    }
  }
}
