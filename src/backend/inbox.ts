import { readClient } from "@/content/read.backend";
import { withNotification } from "@/lib/chrome/notification";
import { follow } from "@/services/follow";
import { InboxItem } from "@/types";

export async function getInboxById(id: string | undefined) {
  if (!id) return;
  const { data: inboxes } = await follow.GET("/inboxes/list", {});
  return inboxes?.data?.find((v) => v.id === id);
}
export async function sendToInbox({
  inbox,
  tabId,
  mute,
}: {
  inbox: InboxItem;
  tabId: number;
  mute?: boolean;
}) {
  return withNotification({
    tabId: tabId,
    title: `Send to Inbox "${inbox?.title}"`,
    pending: "Sending...",
    done: "Sent!",
    disabled: mute,
    handler: async () => {
      const payload = await readClient.for(tabId).getInboxData();
      const result = await follow.POST("/inboxes/webhook", {
        credentials: "omit",
        headers: {
          "X-Follow-Secret": inbox?.secret,
          "X-Follow-Handle": inbox?.id,
        },
        body: payload,
      });
      return { payload, result };
    },
  });
}
