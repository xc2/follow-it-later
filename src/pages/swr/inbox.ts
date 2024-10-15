import { handleInternalResult, internal } from "@/services/internal";
import { useCallback } from "react";
import useSWR from "swr";

const InboxesReqKey = "inboxes";

export function useInboxes() {
  const swr = useSWR(InboxesReqKey, async (url) => {
    return handleInternalResult(internal.GET("/inboxes"));
  });
  const refresh = useCallback(() => {
    return swr.mutate(handleInternalResult(internal.PUT("/inboxes")));
  }, []);
  return [swr, { refresh }] as const;
}
