import { useCallback } from "react";
import { useLatestRef } from "./use-latest-ref";

export function useLatestFn<T extends (...args: any[]) => any>(fn: T) {
  const fnRef = useLatestRef(fn);
  return useCallback<T>(((...args: Parameters<T>) => fnRef.current(...args)) as T, []);
}
