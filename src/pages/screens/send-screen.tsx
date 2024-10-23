import type { InboxItem } from "@/backend/entities";
import { AsyncButton, type AsyncButtonProps } from "@/components/button";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { queryActiveTab } from "@/lib/chrome";
import { cn } from "@/lib/utils";
import { Login } from "@/pages/login";
import { useAuthState } from "@/pages/swr/auth-state";
import { useInboxes } from "@/pages/swr/inbox";
import { useSettings } from "@/pages/swr/settings";
import { handleInternalResult, internal } from "@/services/internal";
import { DrawingPinFilledIcon, DrawingPinIcon, PlusIcon, SymbolIcon } from "@radix-ui/react-icons";
import { ScrollArea, ScrollAreaCorner, ScrollAreaViewport } from "@radix-ui/react-scroll-area";
import { TooltipPortal } from "@radix-ui/react-tooltip";
import { m } from "framer-motion";
import { sortBy } from "lodash-es";
import { useMemo } from "react";

function SendingButton({ item }: { item: InboxItem }) {
  const [settingsSWR, settingsSrv] = useSettings();
  const { DefaultInbox, LastUsedInbox } = settingsSWR.data || {};
  const isDefault = DefaultInbox === item.id;
  const isLastUsed = item.id === LastUsedInbox;
  const endNode = (
    <div className="inline-flex items-center gap-2">
      <Tooltip delayDuration={500}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className={cn("cursor-auto -mr-3", !isDefault && "hidden group-hover:flex")}
            onClick={(e) => {
              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();
              settingsSrv.put({ DefaultInbox: isDefault ? null : item.id });
            }}
          >
            <span>{isDefault ? <DrawingPinFilledIcon /> : <DrawingPinIcon />}</span>
          </Button>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent>
            {isDefault ? "Unset default inbox" : "Set as default inbox"}
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
      {isLastUsed && !isDefault ? (
        <span className={cn("text-zinc-500 text-xs", !isDefault && "group-hover:hidden")}>
          Recently
        </span>
      ) : null}
    </div>
  );
  return (
    <AsyncButton
      type="button"
      variant="secondary"
      className="w-full max-w-96 text-left flex gap-2 justify-start group"
      end={endNode}
      statePosition="end"
      handler={async () => {
        await handleInternalResult(
          internal.POST("/inbox/{inboxId}/tab/{tabId}", {
            params: {
              path: { inboxId: item.id, tabId: (await queryActiveTab())?.id! },
              query: { mute: "1" },
            },
          })
        );
        settingsSWR.mutate();
      }}
    >
      <span className="inline-flex gap-2 items-center leading-[14px] min-w-0 text-ellipsis overflow-hidden whitespace-nowrap">
        <span className="leading-[inherit]">{item.title}</span>
        <span className="text-zinc-400 text-xs leading-[inherit]">{item.id}</span>
      </span>
    </AsyncButton>
  );
}

export function SendScreen() {
  const [inboxesSWR, inboxesSrv] = useInboxes();
  const [settingsSWR] = useSettings();
  const [authSWR] = useAuthState();

  const { LastUsedInbox, DefaultInbox } = settingsSWR.data || {};
  const sortedInboxes = useMemo(() => {
    return sortBy((inboxesSWR.data || []).slice(), (item) => {
      if (item.id === LastUsedInbox) {
        return -100;
      } else if (item.id === DefaultInbox) {
        return -50;
      } else {
        return 0;
      }
    });
  }, [inboxesSWR.data, LastUsedInbox, DefaultInbox]);
  const authState = authSWR.data?.logged;

  const renderRefreshButton = (props: Partial<AsyncButtonProps>) => (
    <AsyncButton
      type="button"
      variant="default"
      handler={() => inboxesSrv.refresh()}
      start={<SymbolIcon className="size-4" />}
      {...props}
    >
      Refresh Inboxes
    </AsyncButton>
  );

  if (sortedInboxes.length > 0) {
    return (
      <>
        <CardHeader>
          <div className="flex items-center">
            <CardTitle className="text-xl">Send to Inbox</CardTitle>
            <div className="ml-auto">
              {authState === false ? (
                <Login purpose="" />
              ) : inboxesSWR.isLoading || authSWR.isLoading ? null : (
                renderRefreshButton({ size: "sm" })
              )}
            </div>
          </div>
          <CardDescription>
            A readable version of this page will be sent to your Follow's inbox.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-52 -mr-4 pr-4">
            <ScrollAreaViewport className="max-h-52">
              <ul className="flex flex-col gap-3">
                {sortedInboxes.map((item) => {
                  return (
                    <m.li layout key={item.id}>
                      <SendingButton item={item} />
                    </m.li>
                  );
                })}
              </ul>
            </ScrollAreaViewport>
            <ScrollBar />
            <ScrollAreaCorner />
          </ScrollArea>
        </CardContent>
      </>
    );
  }
  if (inboxesSWR.isLoading || authSWR.isLoading) {
    return (
      <>
        <CardHeader></CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-5">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[50px] rounded-xl" />
              <Skeleton className="h-10 w-[200px]" />
            </div>
            <Skeleton className="h-10 w-[150px]" />
          </div>
        </CardContent>
      </>
    );
  }
  if (authState === false) {
    return (
      <>
        <CardHeader>
          <CardTitle className="text-base">Login</CardTitle>
          <CardDescription>Log in Follow is required to retrieve the inbox list.</CardDescription>
        </CardHeader>
        <CardContent>
          <Login purpose="" />
        </CardContent>
      </>
    );
  }

  return (
    <>
      <CardHeader>
        <CardTitle className="text-base">No inbox found</CardTitle>
        <CardDescription>
          You don't have any inbox yet. Create one to start sending pages to your Follow inbox.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2 mt-2">
          <Button asChild size="sm">
            <a href="https://app.follow.is/discover?type=inbox" target="_blank" rel="noreferrer">
              <PlusIcon className="size-4 mr-2" />
              Create one
            </a>
          </Button>
          {renderRefreshButton({ variant: "ghost", size: "sm" })}
        </div>
      </CardContent>
    </>
  );
}
