import { inboxesAtom } from "@/backend/atoms/inboxes";
import { isFollowError } from "@/lib/follow";
import { asyncAtom } from "@/lib/jotai";

export const authStateAtom = asyncAtom(async (get) => {
  try {
    await get(inboxesAtom);
    return true;
  } catch (e) {
    if (isFollowError(e) && e.name === "AuthError") {
      return false;
    }
    return true;
  }
});
