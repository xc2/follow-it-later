import type { InboxItem } from "@/backend/entities";
import { AsyncButton } from "@/components/button";
import { Button } from "@/components/ui/button";
import { ScrollBar } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { queryActiveTab } from "@/lib/chrome";
import { cn } from "@/lib/utils";
import { useInboxes } from "@/pages/swr/inbox";
import { useSettings } from "@/pages/swr/settings";
import { handleInternalResult, internal } from "@/services/internal";
import { DrawingPinFilledIcon, DrawingPinIcon, SymbolIcon } from "@radix-ui/react-icons";
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
            className={cn(
              "cursor-auto -mr-3",
              !isDefault &&
                "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
            )}
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
      <span>{item.title}</span>
      <span className="text-zinc-400 text-xs">{item.id}</span>
    </AsyncButton>
  );
}
export function SendScreenActions() {
  const [inboxesSWR, inboxesSrv] = useInboxes();
  return (
    <div>
      <AsyncButton
        size="sm"
        type="button"
        variant="default"
        handler={() => inboxesSrv.refresh()}
        start={<SymbolIcon className="size-4" />}
      >
        Refresh Inboxes
      </AsyncButton>
    </div>
  );
}

export function SendScreen() {
  const [inboxesSWR, inboxesSrv] = useInboxes();
  const [settingsSWR] = useSettings();

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
  return (
    <div>
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
    </div>
  );
}
