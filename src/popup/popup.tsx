import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { handleFollowResponse, isFollowError } from "@/lib/follow";
import { Login } from "@/popup/login";
import { SendForm } from "@/popup/send-form";
import { InboxItem } from "@/types";
import useSWR from "swr";

export function Popup() {
  const inboxesSWR = useSWR("inboxes", async (url) => {
    return handleFollowResponse<InboxItem[]>(
      fetch("https://api.follow.is/inboxes/list", {
        method: "GET",
        mode: "cors",
        credentials: "include",
      })
    );
  });
  const lastUsedInboxSWR = useSWR("inbox-last-used", async (key) => {
    return chrome.storage.local.get(key).then((r) => r[key]);
  });
  const needLogin = isFollowError(inboxesSWR.error) && inboxesSWR.error.name === "AuthError";

  return (
    <Card className="border-none rounded-none min-w-80">
      <CardHeader>
        <CardTitle>Send to Follow</CardTitle>
        <CardDescription>
          A readable version of this page will be sent to your Follow's inbox.
        </CardDescription>
      </CardHeader>
      {!inboxesSWR.isLoading && !lastUsedInboxSWR.isLoading ? (
        needLogin ? (
          <CardContent>
            <Login />
          </CardContent>
        ) : (
          <SendForm inboxes={inboxesSWR.data!} defaultValues={{ inbox: lastUsedInboxSWR.data }} />
        )
      ) : (
        <CardContent>
          <div className="flex flex-col space-y-5">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[50px] rounded-xl" />
              <Skeleton className="h-10 w-[200px]" />
            </div>
            <Skeleton className="h-10 w-[150px]" />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
