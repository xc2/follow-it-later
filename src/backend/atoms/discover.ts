import { csrfAtom } from "@/backend/atoms/follow-client";
import { fixDiscoverUrl } from "@/lib/follow/fix-discover-url";
import { asyncAtom } from "@/lib/jotai";
import { follow, handleFollowResult } from "@/services/follow";
import { atomFamily } from "jotai/utils";

export const discoverAtom = atomFamily((url: string) => {
  return asyncAtom(async (get, options) => {
    const csrf = await get(csrfAtom);
    const r = await follow.POST("/discover", {
      body: { keyword: fixDiscoverUrl(url), target: "feeds" },
      headers: csrf.headers,
    });
    return handleFollowResult(r);
  });
});
