import { useEffect, useState } from "react";
import type { UseAsyncState } from "./use-async";

export type AsyncStateWithPeace = "running" | "success" | "fail" | null;
export function useAsyncStateWithPeace(
  { loading, dataReady, error }: Pick<UseAsyncState<any>, "loading" | "dataReady" | "error">,
  duration = 2000
): [AsyncStateWithPeace, boolean] {
  const [peace, setPeace] = useState(dataReady);

  useEffect(() => {
    if (dataReady) {
      const timer = setTimeout(setPeace, duration, dataReady);
      return () => clearTimeout(timer);
    }
  }, [dataReady, duration]);
  const state = (() => {
    if (loading) return "running";
    if (!dataReady) return null;
    return error ? "fail" : "success";
  })();
  const isPeace = !loading && peace === dataReady;

  return [state, isPeace];
}
