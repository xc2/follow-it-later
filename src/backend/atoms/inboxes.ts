import { follow, handleFollowResult } from "@/services/follow";
import { atom } from "jotai";
import { atomWithRefresh, selectAtom, unwrap } from "jotai/utils";
import { settingsAtom } from "./settings";

export const inboxesAsyncAtom = atomWithRefresh(async () => {
  const r = await follow.GET("/inboxes/list");
  return handleFollowResult(r);
});

export const inboxesAtom = unwrap(inboxesAsyncAtom, (prev) => prev);
export const defaultInboxIdAtom = selectAtom(settingsAtom, (s) => s.DefaultInbox);

export const defaultInboxAtom = atom((get) => {
  const inboxes = get(inboxesAtom);
  const defaultInboxId = get(defaultInboxIdAtom);
  return inboxes?.find((v) => v.id === defaultInboxId);
});
