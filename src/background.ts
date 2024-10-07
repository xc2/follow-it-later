import { CacheFirst } from "workbox-strategies";

addEventListener("fetch", (event: FetchEvent) => {
  const { request } = event;
  if (request.url === "https://api.follow.is/inboxes/list") {
    event.respondWith(
      new CacheFirst({
        cacheName: "follow-it-later",
      }).handle(event)
    );
  }
});
