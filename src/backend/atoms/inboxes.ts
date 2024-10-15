import { asyncAtom } from "@/lib/jotai";
import { follow, handleFollowResult } from "@/services/follow";
import { atom } from "jotai";
import { selectAtom } from "jotai/utils";
import { settingsAtom } from "./settings";

export const inboxesAsyncAtom = asyncAtom(async () => {
  const r = await follow.GET("/inboxes/list");
  return handleFollowResult(r);
});

export const inboxesAtom = inboxesAsyncAtom.unwrap();
export const defaultInboxIdAtom = selectAtom(settingsAtom, (s) => s.DefaultInbox);

export const defaultInboxAtom = atom((get) => {
  const inboxes = get(inboxesAtom);
  const defaultInboxId = get(defaultInboxIdAtom);
  return inboxes?.find((v) => v.id === defaultInboxId);
});
