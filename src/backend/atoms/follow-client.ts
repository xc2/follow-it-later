import { inboxesAsyncAtom } from "@/backend/atoms/inboxes";
import { isFollowError } from "@/lib/follow";
import { atom } from "jotai";
import { unwrap } from "jotai/utils";

export const authStateAsyncAtom = atom(async (get) => {
  try {
    await get(inboxesAsyncAtom);
    return true;
  } catch (e) {
    if (isFollowError(e) && e.name === "AuthError") {
      return false;
    }
    return true;
  }
});

export const authStateAtom = unwrap(authStateAsyncAtom, (prev) => prev);
