import { fixDiscoverUrl } from "@/lib/follow/fix-discover-url";
import { asyncAtom } from "@/lib/jotai";
import { follow, handleFollowResult } from "@/services/follow";
import { atomFamily } from "jotai/utils";

export const discoverAtom = atomFamily((url: string) => {
  return asyncAtom(async (_, options) => {
    const r = await follow.POST("/discover", {
      body: { keyword: fixDiscoverUrl(url), target: "feeds" },
    });
    return handleFollowResult(r);
  });
});
