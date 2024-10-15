import { handleInternalResult, internal } from "@/services/internal";
import { useEffect } from "react";
import useSWR, { useSWRConfig } from "swr";

export function useAuthState() {
  const swr = useSWR("auth-state", () => {
    return handleInternalResult(internal.GET("/auth-state"));
  });

  const { mutate } = useSWRConfig();
  useEffect(() => {
    if (swr.data?.changed) {
      mutate((key: unknown) => {
        return typeof key === "string" && key.startsWith("follow:");
      });
    }
  }, [swr.data]);
  return [swr] as const;
}
