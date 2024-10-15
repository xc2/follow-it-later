import { app } from "@/backend/app";
import { defaultInboxAtom } from "@/backend/atoms";
import { sendToInbox } from "@/backend/inbox";
import { baseUrl as FollowBaseUrl } from "@/gen/follow";
import { baseUrl as InternalBaseUrl } from "@/gen/internal";
import { createContextMenu } from "@/lib/chrome/context-menu";
import { actionPage } from "@/lib/urls";
import type { InboxItem } from "@/types";
import type { Hono } from "hono";
import { handle } from "hono/service-worker";
import { StaleWhileRevalidate } from "workbox-strategies";
import { container } from "./backend/container";

declare const self: ServiceWorkerGlobalScope;

const cacheName = "extension-follow-it-later";

void purgeOutdatedCaches();

const handleEvent = handle(app as Hono);

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (url.pathname.startsWith(InternalBaseUrl)) {
    return handleEvent(event);
  }
  if (url.origin === FollowBaseUrl) {
    if (url.pathname === "/inboxes/list") {
      return event.respondWith(new StaleWhileRevalidate({ cacheName }).handle(event));
    }
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
const FollowMenuItem = createContextMenu<{ inbox: InboxItem }>({
  contexts: ["page"],
  onclick: async (info, tab) => {
    const inbox = info.data?.inbox!;
    const tabId = tab?.id!;
    await sendToInbox({ inboxId: inbox.id, tabId });
  },
});

async function showPopup() {
  const before = await chrome.action.getPopup({});
  await chrome.action.setPopup({ popup: actionPage });
  try {
    await chrome.action.openPopup();
  } catch {}
  await chrome.action.setPopup({ popup: before });
}

const ActionMenuItem = createContextMenu({
  contexts: ["action"],
  title: "Settings",
  onclick: () => {
    void showPopup();
  },
});
ActionMenuItem.show();

container.sub(defaultInboxAtom, async () => {
  const inbox = container.get(defaultInboxAtom);
  if (inbox) {
    FollowMenuItem.show({ data: { inbox }, title: `Send to Inbox "${inbox.title}"` });
    chrome.action.setPopup({ popup: "" });
    chrome.action.setTitle({ title: `Send to Inbox "${inbox.title}"` });
  } else {
    chrome.action.setPopup({ popup: actionPage });
    chrome.action.setTitle({ title: `Follow it later` });
    FollowMenuItem.hide();
  }
});
chrome.action.onClicked.addListener(async (tab) => {
  const inbox = container.get(defaultInboxAtom);
  if (!inbox) {
    return showPopup();
  }
  void sendToInbox({ inboxId: inbox.id, tabId: tab.id! });
});
