import { baseUrl } from "@/gen/follow";
import { Hono } from "hono";
import { handle } from "hono/service-worker";
import { StaleWhileRevalidate } from "workbox-strategies";

declare const self: ServiceWorkerGlobalScope;

const cacheName = "extension-follow-it-later";

void purgeOutdatedCaches();

const app = new Hono({}).basePath("/internal");
const handleEvent = handle(app);

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (url.origin === baseUrl) {
    if (url.pathname === "/inboxes/list") {
      return event.respondWith(new StaleWhileRevalidate({ cacheName }).handle(event));
    }
  }

  return handleEvent(event);
});

async function purgeOutdatedCaches() {
  const keys = await caches.keys();
  for (const key of keys) {
    if (key !== cacheName) {
      await caches.delete(key);
    }
  }
}
