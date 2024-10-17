import { dropCache, fetchers } from "@/backend/cache";
import { asyncAtom } from "@/lib/jotai";
import { follow, handleFollowResult } from "@/services/follow";
import { selectAtom } from "jotai/utils";
import { settingsAtom } from "./settings";

export const inboxesAtom = asyncAtom(async (_, options) => {
  const r = await follow.GET("/inboxes/list", {
    signal: options.signal,
    fetch: options.initial ? fetchers.cacheFirst : fetchers.networkFirst,
  });
  try {
    const data = await handleFollowResult(r);
    // if (import.meta.env.DEV) {
    //   if (options.initial && Math.random() > 0.5) {
    //     return [];
    //   }
    // }
    return data;
  } catch (e) {
    void dropCache(r.response);
    throw e;
  }
});

export const defaultInboxIdAtom = selectAtom(settingsAtom, (s) => s.DefaultInbox);

export const defaultInboxAtom = asyncAtom(async (get) => {
  const inboxes = await get(inboxesAtom);
  const defaultInboxId = get(defaultInboxIdAtom);
  return inboxes?.find((v) => v.id === defaultInboxId);
});
