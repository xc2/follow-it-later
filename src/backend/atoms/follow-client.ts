import { asyncAtom } from "@/lib/jotai";
import { follow } from "@/services/follow";

export const csrfAtom = asyncAtom(async () => {
  // @ts-ignore
  const { data } = await follow.GET("/auth/csrf", {});
  const token = (data as any)?.csrfToken;
  const headers: any = {};
  if (token) {
    headers["X-CSRF-Token"] = token;
  }
  return {
    token,
    headers,
  };
});
