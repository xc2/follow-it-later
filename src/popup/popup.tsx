import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { isFollowError } from "@/lib/follow";
import { Login } from "@/popup/login";
import { SendForm } from "@/popup/send-form";
import { follow, handleFollowResult } from "@/services/follow";
import { Pencil2Icon, PlusIcon } from "@radix-ui/react-icons";
import { useMemo } from "react";
import useSWR from "swr";

export function Popup() {
  const inboxesSWR = useSWR("inboxes", async (url) => {
    return handleFollowResult(follow.GET("/inboxes/list"));
  });
  const lastUsedInboxSWR = useSWR("inbox-last-used", async (key) => {
    return chrome.storage.local.get(key).then((r) => r[key]);
  });
  const needLogin = isFollowError(inboxesSWR.error) && inboxesSWR.error.name === "AuthError";
  const lastUsedInbox = useMemo(() => {
    return inboxesSWR.data?.find((v) => v.id === lastUsedInboxSWR.data)?.id;
  }, [inboxesSWR.data, lastUsedInboxSWR.data]);

  return (
    <TooltipProvider>
      <div className="min-w-96">
        <Card className="border-none rounded-none shadow-none">
          <CardHeader>
            <CardTitle>Send to Follow</CardTitle>
            <CardDescription>
              A readable version of this page will be sent to your Follow's inbox.
            </CardDescription>
          </CardHeader>
          {!inboxesSWR.isLoading && !lastUsedInboxSWR.isLoading ? (
            needLogin ? (
              <CardContent>
                <Login size="sm" purpose="Log in Follow is required to retrieve the inbox list." />
              </CardContent>
            ) : inboxesSWR?.data?.length ? (
              <SendForm inboxes={inboxesSWR.data!} defaultValues={{ inbox: lastUsedInbox }} />
            ) : (
              <CardContent>
                <Button asChild type="button" size="sm">
                  <a
                    href="https://app.follow.is/discover?type=inbox"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Create a inbox to continue
                  </a>
                </Button>
              </CardContent>
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
        <div className="flex border-t-[1px] border-zinc-50 py-2">
          <div className="min-w-0 flex-initial text-zinc-500 pl-2">
            This extension is <strong>UNOFFICIAL</strong>. Please DO NOT open issues on Follow's
            official repository or social accounts.
          </div>
          <Tooltip>
            <TooltipTrigger asChild className="ml-auto mr-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Feedback"
                asChild
                aria-describedby="feedback-content"
              >
                <a href="https://tldr.ws/follow-it-later-feedback" target="_blank" rel="noreferrer">
                  <Pencil2Icon className="h-4 w-4" />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-[90vw] min-w-0">
              <p id="feedback-content">
                If you got any trouble using this extension, please send your feedback here.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
