import { useCallback, useRef } from "react";

export function useLatestRef<T>(value: T) {
  const ref = useRef<T>(value);
  ref.current = value;
  return ref;
}

export function useLatestFn<T extends (...args: any[]) => any>(fn: T) {
  const fnRef = useLatestRef(fn);
  return useCallback<T>(((...args: Parameters<T>) => fnRef.current(...args)) as T, []);
}
