import { csrfAtom, inboxesAtom } from "@/backend/atoms";
import { container } from "@/backend/container";
import { readClient } from "@/content/read.backend";
import { withNotification } from "@/lib/chrome/notification";
import { follow, handleFollowResult } from "@/services/follow";

export async function sendToInbox({
  inboxId,
  tabId,
  mute,
}: {
  inboxId: string;
  tabId: number;
  mute?: boolean;
}) {
  const inboxes = await container.get(inboxesAtom);
  const inbox = inboxes?.find((v) => v.id === inboxId);

  return withNotification({
    tabId: tabId,
    title: `Send to Inbox "${inbox?.title}"`,
    pending: "Sending...",
    done: "Sent!",
    disabled: mute,
    handler: async () => {
      const payload = await readClient.for(tabId).getInboxData();
      if (import.meta.env.DEV) {
        console.log("Send to inbox", payload);
      }
      if (false && import.meta.env.DEV) {
        await new Promise((resolve, reject) =>
          setTimeout(Math.random() > 0.5 ? resolve : reject, 1000, new Error("Test error"))
        );
      } else {
        const csrf = await container.get(csrfAtom);
        await handleFollowResult(
          follow.POST("/inboxes/webhook", {
            credentials: "omit",
            headers: {
              "X-Follow-Secret": inbox?.secret,
              "X-Follow-Handle": inbox?.id,
              // this endpoint is not supposed to be protected by CSRF, but it is.
              ...csrf.headers,
            },
            body: payload,
          })
        );
      }

      const { secret, ..._inbox } = inbox || {};
      return { payload, inbox: _inbox };
    },
  });
}
