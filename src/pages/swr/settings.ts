import type { Settings } from "@/backend/entities";
import { handleInternalResult, internal } from "@/services/internal";
import useSWR from "swr";

const SettingsSWRKey = "settings";

export function useSettings() {
  const swr = useSWR(SettingsSWRKey, async () => {
    return handleInternalResult(internal.GET("/settings"));
  });
  const put = (values: Partial<Settings>) => {
    return swr.mutate((old) => {
      void internal.PUT("/settings", { body: values });
      if (old) {
        return { ...old, ...values };
      }
    });
  };

  return [swr, { put }] as const;
}
