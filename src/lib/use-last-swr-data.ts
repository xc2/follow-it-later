import { useRef } from "react";
import type { SWRResponse } from "swr";

export function useLastSWRData<T>(swr: SWRResponse<T>): T | undefined {
  const ref = useRef(swr.data);
  if (!swr.isLoading) {
    ref.current = swr.data;
  }
  return ref.current;
}
