import { app } from "@/backend/app";
import { defaultInboxAtom } from "@/backend/atoms";
import { purgeOutdatedCaches } from "@/backend/cache";
import { container } from "@/backend/container";
import { sendToInbox } from "@/backend/inbox";
import { baseUrl as InternalBaseUrl } from "@/gen/internal";
import { createContextMenu } from "@/lib/chrome/context-menu";
import { destructPromise } from "@/lib/lang";
import { createMessageFetchEvent } from "@/lib/message-fetch/backend";
import { actionPage } from "@/lib/urls";
import type { InboxItem } from "@/types";
import type { Hono } from "hono";
import { handle } from "hono/service-worker";

declare const self: ServiceWorkerGlobalScope;

const handleEvent = handle(app as Hono);
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  const fetchEvent = createMessageFetchEvent(message, sender, respond);
  if (fetchEvent) {
    handleFetchEvent.call(self, fetchEvent);
    return true;
  }
});

function handleFetchEvent(this: ServiceWorkerGlobalScope, event: FetchEvent) {
  const { request } = event;
  const url = new URL(request.url);
  if (url.pathname.startsWith(InternalBaseUrl)) {
    return handleEvent(event);
  }
}
self.addEventListener("fetch", handleFetchEvent);

const FollowMenuItem = createContextMenu<{ inbox: InboxItem }>({
  id: "one-click-sending-to-inbox",
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
  id: "settings",
  contexts: ["action"],
  title: "Settings",
  onclick: () => {
    void showPopup();
  },
});
ActionMenuItem.show();

container.sub(defaultInboxAtom.unwrap(), async () => {
  const inbox = container.get(defaultInboxAtom.unwrap());
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
  const [ok, inbox] = await destructPromise(container.get(defaultInboxAtom));
  if (!ok || !inbox || !tab.url || !/^http/.test(tab.url)) {
    return showPopup();
  }

  void sendToInbox({ inboxId: inbox.id, tabId: tab.id! });
});

void purgeOutdatedCaches();
if (import.meta.env.DEV) {
  chrome.action.setBadgeText({ text: "DEV" });
}
