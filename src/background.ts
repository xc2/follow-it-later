import { app } from "@/backend/app";
import { getSettings, onSettings } from "@/backend/settings";
import { baseUrl as FollowBaseUrl } from "@/gen/follow";
import { baseUrl as InternalBaseUrl } from "@/gen/internal";
import { tabToInboxData } from "@/lib/backend";
import { actionPage } from "@/lib/urls";
import { follow } from "@/services/follow";
import { Hono } from "hono";
import { handle } from "hono/service-worker";
import { StaleWhileRevalidate } from "workbox-strategies";

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
const ContextMenus = Object.freeze({
  FollowItLater: "follow-it-later",
});
chrome.contextMenus.create({
  id: ContextMenus.FollowItLater,
  title: "Follow it later",
  contexts: ["page"],
  enabled: false,
  visible: false,
});
chrome.contextMenus.create({
  id: "settings",
  title: "Settings",
  contexts: ["action"],
  enabled: false,
  visible: false,
});
async function getInboxById(id: string | undefined) {
  if (!id) return;
  const { data: inboxes } = await follow.GET("/inboxes/list");
  const inbox = inboxes?.data?.find((v) => v.id === id);
  return inbox;
}

onSettings(
  ["DefaultInbox"],
  async ({ DefaultInbox }) => {
    const inbox = await getInboxById(DefaultInbox);
    if (inbox) {
      chrome.contextMenus.update(ContextMenus.FollowItLater, {
        enabled: true,
        visible: true,
        title: `Send to Inbox "${inbox.title}"`,
      });
    } else {
      chrome.contextMenus.update(ContextMenus.FollowItLater, {
        enabled: false,
        visible: false,
      });
    }
  },
  true
);

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === ContextMenus.FollowItLater) {
    // TODO update state
    const settings = await getSettings(["DefaultInbox"]);
    const inbox = await getInboxById(settings.DefaultInbox);
    const payload = await tabToInboxData(tab?.id!);
    await follow.POST("/inboxes/webhook", {
      credentials: "omit",
      headers: {
        "X-Follow-Secret": inbox?.secret,
        "X-Follow-Handle": inbox?.id,
      },
      body: payload,
    });
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  await chrome.action.disable(tab.id);
  await chrome.action.setBadgeText({ text: "...", tabId: tab.id });
  await chrome.action.setBadgeBackgroundColor({ color: "#000", tabId: tab.id });
  try {
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  } finally {
    await chrome.action.enable(tab.id);
    await chrome.action.setPopup({ popup: actionPage });
    await chrome.action.openPopup({});
    await chrome.action.setBadgeText({ text: "", tabId: tab.id });
    await chrome.action.setPopup({ popup: "" });
  }
});
